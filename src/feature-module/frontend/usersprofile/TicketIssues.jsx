import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { axiosUserInstance, imgUrl } from "../../../Apiservice";
import { useMediaQuery } from "react-responsive";
import { Modal, Offcanvas } from "react-bootstrap";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const TicketIssues = ({ HomeNavigate, BackButton }) => {
  const [leadslist, setleadslist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showChat, setShowChat] = useState(false);
  const [selectedTicketForChat, setSelectedTicketForChat] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesRef = useRef(null);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const ordersPerPage = 10;

  const socketRef = useRef(null);
  const activeTicketRef = useRef(null);

  useEffect(() => {
    activeTicketRef.current = selectedTicketForChat;
  }, [selectedTicketForChat]);

  useEffect(() => {
    const socketObj = io(imgUrl, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socketObj;

    socketObj.on("connect", () => {
      console.log("Connected to Socket.io server successfully");
    });

    socketObj.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error);
    });

    socketObj.on("ticket:message", (data) => {
      console.log("Received ticket message:", data);
      const activeTicket = activeTicketRef.current;
      const activeId = activeTicket ? (activeTicket._id || activeTicket.id) : null;

      if (activeId && String(activeId).toLowerCase() === String(data.ticketId).toLowerCase()) {
        setChatHistory((prev) => {
          if (prev.some((msg) => msg.id === data._id || (msg.text === data.message && msg.sender === data.sender))) {
            return prev;
          }
          return [
            ...prev,
            {
              id: data._id || Date.now(),
              sender: data.sender,
              text: data.message,
              time: new Date(data.createdAt || Date.now()).toLocaleTimeString()
            }
          ];
        });
        scrollToBottom();
      }
    });

    socketObj.on("ticket:closed", (data) => {
      console.log("Ticket closed via socket:", data);
      const activeTicket = activeTicketRef.current;
      const activeId = activeTicket ? (activeTicket._id || activeTicket.id) : null;
      const targetStatus = data.status || "closed";

      if (activeId && String(activeId).toLowerCase() === String(data.ticketId).toLowerCase()) {
        setSelectedTicketForChat((prev) => prev ? { ...prev, status: targetStatus } : null);
        setTicketDetails((prev) => prev ? { ...prev, status: targetStatus } : null);
        setChatHistory((prev) => [
          ...prev,
          {
            id: `system_${Date.now()}`,
            sender: "system",
            text: targetStatus === "resolved" ? "This ticket has been resolved." : "This ticket has been closed.",
            time: new Date().toLocaleTimeString()
          }
        ]);
        scrollToBottom();
      }

      setleadslist((prev) =>
        prev.map((ticket) =>
          String(ticket._id).toLowerCase() === String(data.ticketId).toLowerCase()
            ? { ...ticket, status: targetStatus }
            : ticket
        )
      );
    });

    return () => {
      socketObj.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      setTimeout(() => {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }, 100);
    }
  };
  const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  const getLeadsData = async (page = 1, search = "") => {
    const token = localStorage.getItem("medicomparestoken");
    setLoading(true);

    try {
      const res = await axiosUserInstance.get(
        `raise-ticket/list?page=${page}&limit=${ordersPerPage}&search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setleadslist(res?.data?.data?.tickets || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
      setCurrentPage(res?.data?.data?.pagination?.page || 1);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const getTicketDetails = async (ticketId) => {
    const token = localStorage.getItem("medicomparestoken");
    setChatLoading(true);

    try {
      const res = await axiosUserInstance.get(
        `raise-ticket/detail/${ticketId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setTicketDetails(res?.data?.data);
      return res?.data?.data;
    } catch (err) {
      toast.error(err, "Error fetching ticket details:");
      return null;
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getLeadsData(currentPage, searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  const filteredOrders = leadslist;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const viewLead = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  const openChat = async (ticket) => {
    setSelectedTicketForChat(ticket);
    setShowChat(true);

    if (socketRef.current) {
      socketRef.current.emit("ticket:join", ticket._id);
      console.log("Joined ticket room via socket:", ticket._id);
    }

    const details = await getTicketDetails(ticket._id);
    const chatMessages = [];
    if (details && details.messages && details.messages.length > 0) {
      details.messages.forEach((msg) => {
        chatMessages.push({
          id: msg._id,
          sender: msg.sender,
          text: msg.message,
          time: new Date(msg.createdAt).toLocaleTimeString(),
          readByAdmin: msg.readByAdmin,
          readByUser: msg.readByUser
        });
      });
    }

    setChatHistory(chatMessages);
    scrollToBottom();
  };

  const closeChat = () => {
    if (socketRef.current && selectedTicketForChat) {
      socketRef.current.emit("ticket:leave", selectedTicketForChat._id || selectedTicketForChat.id);
      console.log("Left ticket room via socket:", selectedTicketForChat._id || selectedTicketForChat.id);
    }
    setShowChat(false);
    setSelectedTicketForChat(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    if (selectedTicketForChat?.status?.toLowerCase() === "closed" ||
      ticketDetails?.status?.toLowerCase() === "closed" ||
      selectedTicketForChat?.status?.toLowerCase() === "resolved" ||
      ticketDetails?.status?.toLowerCase() === "resolved") {
      toast.error("Cannot send messages to closed or resolved tickets");
      return;
    }

    const token = localStorage.getItem("medicomparestoken");

    try {
      const res = await axiosUserInstance.post(
        `raise-ticket/message/${selectedTicketForChat._id}`,
        {
          message: chatMessage.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newMessage = {
        id: res?.data?.data?._id || Date.now(),
        sender: "user",
        text: chatMessage.trim(),
        time: new Date().toLocaleTimeString()
      };

      setChatHistory([...chatHistory, newMessage]);
      setChatMessage("");
      scrollToBottom();

    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const columnConfig = {
    ticketNo: filteredOrders.some((t) => t.ticketNo),
    subject: filteredOrders.some((t) => t.subject),
    category: filteredOrders.some((t) => t.category),
    priority: filteredOrders.some((t) => t.priority),
    status: filteredOrders.some((t) => t.status),
    date: filteredOrders.some((t) => t.createdAt),
    description: filteredOrders.some((t) => t.description),
  };

  return (
    <div
      className="main-wrapper"
      style={{ paddingTop: isMobile ? "-200px" : "-50px" }}
    >
      <div className="content doctor-content">
        <div className="container">
          <div className="row">
            {BackButton && (
              <div className="col-12 mb-3">
                <BackButton />
              </div>
            )}
            {HomeNavigate && (
              <div className="col-12 mb-3 d-flex justify-content-end">
                <HomeNavigate />
              </div>
            )}
            <div className="col-lg-12">
              <div
                className="dashboard-header"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: isMobile ? "20px 15px" : "25px",
                  marginBottom: "20px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                  width: "100%",
                  overflow: "visible",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: isMobile ? "16px" : "24px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      flex: "1",
                      minWidth: 0,
                      maxWidth: isMobile ? "100%" : "calc(100% - 280px)",
                      wordBreak: "break-word",
                      overflow: "hidden",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: isMobile ? "20px" : "24px",
                        fontWeight: "600",
                        color: "#333",
                        margin: "0",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: isMobile ? "wrap" : "nowrap",
                      }}
                    >
                      <i
                        className="fa-solid fa-ticket"
                        style={{ color: "#8059ca", flexShrink: 0 }}
                      ></i>
                      <span>Tickets</span>
                    </h3>
                    <p
                      style={{
                        color: "#666",
                        fontSize: isMobile ? "13px" : "14px",
                        marginTop: "5px",
                        marginBottom: "0",
                      }}
                    >
                      Manage and track all your support tickets
                    </p>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      width: isMobile ? "100%" : "250px",
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search by Ticket ID"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        height: "42px",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        padding: "10px 15px 10px 40px",
                        fontSize: "14px",
                        width: "100%",
                        outline: "none",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                      }}
                    >
                      <i className="fa-solid fa-search" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="custom-table">
                <div className="consultation-table-wrapper" style={{ background: "#fff", borderRadius: "12px", border: "1px solid #ececf6", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)", overflow: "hidden", marginBottom: "20px" }}>
                  <style>{`
                  .consultation-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 0;
                  }
                  .consultation-table th {
                    background: #fbfbfe;
                    color: #777;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 14px 16px;
                    border-bottom: 1px solid #ececf6;
                    text-align: left;
                  }
                  .consultation-table td {
                    padding: 14px 16px;
                    font-size: 13px;
                    color: #333;
                    border-bottom: 1px solid #ececf6;
                    vertical-align: middle;
                  }
                  .consultation-table tr:last-child td {
                    border-bottom: none;
                  }
                  .consultation-table tr:hover td {
                    background-color: #faf9fe;
                  }
                `}</style>
                  <div className="table-responsive">
                    <table className="consultation-table">
                      <thead>
                        <tr>
                          {columnConfig.ticketNo && <th>Ticket No</th>}
                          {columnConfig.subject && <th>Subject</th>}
                          {columnConfig.category && <th>Category</th>}
                          {columnConfig.priority && <th>Priority</th>}
                          {columnConfig.status && <th>Status</th>}
                          {columnConfig.date && <th>Date</th>}
                          <th className="text-center">Chat</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="100%" className="text-center py-3">
                              Loading...
                            </td>
                          </tr>
                        ) : filteredOrders.length > 0 ? (
                          filteredOrders.map((ticket) => (
                            <tr key={ticket._id}>
                              {columnConfig.ticketNo && (
                                <td>
                                  <span style={{ fontWeight: "600", color: "#8059ca" }}>
                                    {ticket.ticketNo}
                                  </span>
                                </td>
                              )}
                              {columnConfig.subject && <td>{ticket.subject}</td>}
                              {columnConfig.category && (
                                <td style={{ textTransform: "capitalize" }}>
                                  {ticket.category}
                                </td>
                              )}

                              {columnConfig.priority && (
                                <td>
                                  <span
                                    className={`priority-badge priority-${ticket.priority?.toLowerCase()}`}
                                    style={{
                                      fontSize: "11px",
                                      padding: "3px 8px",
                                      borderRadius: "4px",
                                      textTransform: "capitalize",
                                      fontWeight: "600",
                                      display: "inline-block",
                                    }}
                                  >
                                    {ticket.priority}
                                  </span>
                                </td>
                              )}
                              {columnConfig.status && (
                                <td>
                                  <span
                                    className={`status-badge status-${ticket.status?.toLowerCase()}`}
                                    style={{
                                      fontSize: "11px",
                                      padding: "3px 8px",
                                      borderRadius: "4px",
                                      textTransform: "capitalize",
                                      fontWeight: "600",
                                      display: "inline-block",
                                    }}
                                  >
                                    {ticket.status}
                                  </span>
                                </td>
                              )}
                              {columnConfig.date && (
                                <td>
                                  {new Date(ticket.createdAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </td>
                              )}
                              <td className="text-center">
                                <button
                                  className="btn btn-sm"
                                  title={ticket.status === "closed" ? "View chat history (closed ticket)" : "Chat with Support"}
                                  onClick={() => openChat(ticket)}
                                  style={{
                                    borderRadius: "50%",
                                    width: "32px",
                                    height: "32px",
                                    padding: "0",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: ticket.status === "closed" ? "#ff6b6b" : "#8059ca",
                                    border: `1px solid ${ticket.status === "closed" ? "#ff6b6b" : "#8059ca"}`,
                                    color: "#fff",
                                    cursor: "pointer"
                                  }}
                                >
                                  <i className="fas fa-comments"></i>
                                </button>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-light"
                                  title="View Ticket"
                                  onClick={() => viewLead(ticket)}
                                  style={{
                                    borderRadius: "50%",
                                    width: "32px",
                                    height: "32px",
                                    padding: "0",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer"
                                  }}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="100%" className="text-center py-3">
                              No data found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="pagination dashboard-pagination mt-4">
                  <ul className="d-flex justify-content-center align-items-center gap-1">
                    <li>
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(Math.max(currentPage - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <i className="fa-solid fa-chevron-left" />
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <li key={page}>
                            <button
                              className={`page-link ${currentPage === page ? "active" : ""
                                }`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      }
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <li key={`dots-${page}`}>
                            <span className="page-link disabled">…</span>
                          </li>
                        );
                      }
                      return null;
                    })}

                    <li>
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(
                            Math.min(currentPage + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        <i className="fa-solid fa-chevron-right" />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Details Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        size="md"
        className="lead-modal"
        style={{
          zIndex: 99999999999,
        }}
      >
        <Modal.Body style={{ padding: "0" }}>
          <style>{`
            .lead-modal .modal-content {
              border-radius: 12px;
              border: none;
              box-shadow: 0 5px 25px rgba(0,0,0,0.1);
              font-family: inherit;
            }
            
            .modal-inner {
              padding: 24px;
              background: #ffffff;
            }

            .modal-header-custom {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #f1f1f1;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }

            .modal-title-custom {
              font-size: 17px;
              font-weight: 600;
              color: #333;
              margin: 0;
            }

            .modal-close-btn {
              border: none;
              background: transparent;
              font-size: 20px;
              cursor: pointer;
              color: #999;
              line-height: 1;
              padding: 0;
            }

            .modal-close-btn:hover {
              color: #333;
            }

            .info-row {
              margin-bottom: 16px;
            }

            .info-label {
              font-size: 12px;
              color: #777;
              margin-bottom: 3px;
              display: block;
            }

            .info-value {
              color: #111;
              font-weight: 500;
              font-size: 14.5px;
              display: block;
            }

            .desc-label {
              font-weight: 600;
              color: #333;
              margin-top: 16px;
              margin-bottom: 6px;
              font-size: 13.5px;
            }

            .desc-text {
              background: #fafafa;
              border: 1px solid #eee;
              border-radius: 6px;
              padding: 12px;
              font-size: 13px;
              line-height: 1.5;
              color: #444;
            }

            .section-divider {
              border-top: 1px solid #f1f1f1;
              margin: 16px 0;
            }

            .priority-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              text-transform: capitalize;
            }

            .priority-low {
              background: #e0f2fe;
              color: #0369a1;
            }

            .priority-medium {
              background: #fef3c7;
              color: #b45309;
            }

            .priority-high {
              background: #fee2e2;
              color: #b91c1c;
            }

            .status-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              text-transform: capitalize;
            }

            .status-open {
              background: #dcfce7;
              color: #15803d;
            }

            .status-closed {
              background: #f3f4f6;
              color: #4b5563;
            }

            .attachment-thumbnail-wrapper {
              cursor: pointer;
              border-radius: 6px;
              overflow: hidden;
              border: 1px solid #ddd;
              width: 60px;
              height: 60px;
              transition: opacity 0.2s;
            }

            .attachment-thumbnail-wrapper:hover {
              opacity: 0.8;
            }
          `}</style>

          {selectedLead && (
            <div className="modal-inner">
              {/* Header */}
              <div className="modal-header-custom">
                <h5 className="modal-title-custom">Ticket Details</h5>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeModal}
                >
                  &times;
                </button>
              </div>

              {/* Ticket Information */}
              <div className="row">
                {selectedLead?.ticketNo && (
                  <div className="col-md-6 col-12 info-row">
                    <span className="info-label">Ticket No</span>
                    <span className="info-value">{selectedLead.ticketNo}</span>
                  </div>
                )}

                {selectedLead?.subject && (
                  <div className="col-md-6 col-12 info-row">
                    <span className="info-label">Subject</span>
                    <span className="info-value">{selectedLead.subject}</span>
                  </div>
                )}

                {selectedLead?.category && (
                  <div className="col-md-6 col-12 info-row">
                    <span className="info-label">Category</span>
                    <span className="info-value">{capitalize(selectedLead.category.replace(/_/g, ' '))}</span>
                  </div>
                )}

                {selectedLead?.priority && (
                  <div className="col-md-6 col-12 info-row">
                    <span className="info-label">Priority</span>
                    <span className={`priority-badge priority-${selectedLead.priority.toLowerCase()}`}>
                      {selectedLead.priority}
                    </span>
                  </div>
                )}

                {selectedLead?.status && (
                  <div className="col-md-6 col-12 info-row">
                    <span className="info-label">Status</span>
                    <span className={`status-badge status-${selectedLead.status.toLowerCase()}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                )}

                {selectedLead?.createdAt && (
                  <div className="col-md-6 col-12 info-row">
                    <span className="info-label">Created Date</span>
                    <span className="info-value">
                      {new Date(selectedLead.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedLead?.description && (
                <div>
                  <div className="desc-label">Description</div>
                  <div className="desc-text">{selectedLead.description}</div>
                </div>
              )}

              {/* Divider */}
              {selectedLead?.userId && <div className="section-divider"></div>}

              {/* User Details */}
              {selectedLead?.userId && (
                <div className="row">
                  {selectedLead.userId.first_name && (
                    <div className="col-md-4 col-12 info-row">
                      <span className="info-label">User Name</span>
                      <span className="info-value">
                        {selectedLead.userId.first_name} {selectedLead.userId.last_name || ""}
                      </span>
                    </div>
                  )}

                  {selectedLead.userId.email && (
                    <div className="col-md-4 col-12 info-row">
                      <span className="info-label">Email</span>
                      <span className="info-value" style={{ wordBreak: "break-all" }}>
                        {selectedLead.userId.email}
                      </span>
                    </div>
                  )}

                  {selectedLead.userId.phone && (
                    <div className="col-md-4 col-12 info-row">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{selectedLead.userId.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments */}
              {selectedLead?.attachments && selectedLead.attachments.length > 0 && (
                <div>
                  <div className="section-divider"></div>
                  <div className="desc-label" style={{ marginTop: "0" }}>Attachments</div>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedLead.attachments.map((attachment, index) => (
                      <div
                        className="attachment-thumbnail-wrapper"
                        key={index}
                        onClick={() => window.open(attachment, '_blank')}
                        title="Click to view file"
                      >
                        <img
                          src={attachment}
                          alt={`Attachment ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.fallback-icon');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          className="fallback-icon"
                          style={{
                            display: "none",
                            width: "100%",
                            height: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f8f9fa",
                            color: "#8059ca",
                          }}
                        >
                          <i className="fas fa-file-alt"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Chat Offcanvas */}
      <Offcanvas
        show={showChat}
        onHide={closeChat}
        placement="end"
        style={{
          width: "400px", backgroundColor: "rgba(0, 0, 0, 0.8)",
          zIndex: 999999999,
        }}
      >
        <Offcanvas.Header closeButton style={{ borderBottom: "1px solid #eee", background: "#f8f9fa" }}>
          <Offcanvas.Title>
            <div className="d-flex align-items-center gap-2">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#8059ca",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>Ticket Support</div>
                <div style={{ fontSize: "12px", color: "#666" }}>#{selectedTicketForChat?.ticketNo}</div>
              </div>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0" style={{ background: "#fff" }}>
          <div
            ref={chatMessagesRef}
            className="flex-grow-1 p-3 hide-scrollbar"
            style={{
              overflowY: "auto",
              backgroundImage: "radial-gradient(#f1f1f1 1px, transparent 0)",
              backgroundSize: "20px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {chatLoading ? (
              <>
                <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                  <div
                    style={{
                      background: "#f0f2f5",
                      padding: "10px 15px",
                      borderRadius: "18px 18px 18px 0",
                      fontSize: "14px",
                      height: "20px",
                      width: "120px",
                      animation: "wave 1.5s ease-in-out infinite"
                    }}
                  />
                </div>
                <div style={{ alignSelf: "flex-end", maxWidth: "85%" }}>
                  <div
                    style={{
                      background: "#8059ca",
                      padding: "10px 15px",
                      borderRadius: "18px 18px 0 18px",
                      fontSize: "14px",
                      height: "20px",
                      width: "150px",
                      animation: "wave 1.5s ease-in-out infinite 0.2s"
                    }}
                  />
                </div>
                <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                  <div
                    style={{
                      background: "#f0f2f5",
                      padding: "10px 15px",
                      borderRadius: "18px 18px 18px 0",
                      fontSize: "14px",
                      height: "20px",
                      width: "100px",
                      animation: "wave 1.5s ease-in-out infinite 0.4s"
                    }}
                  />
                </div>
              </>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  style={{
                    alignSelf: chat.sender === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: chat.sender === "user" ? "flex-end" : "flex-start",
                    gap: "4px"
                  }}
                >
                  {chat.sender === "system" ? (
                    <div style={{ width: "100%", textAlign: "center", margin: "10px 0" }}>
                      <span style={{ fontSize: "11px", background: "#fff", color: "#999", padding: "2px 10px", borderRadius: "10px", border: "1px solid #eee" }}>
                        {chat.text}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "8px",
                          flexDirection: chat.sender === "user" ? "row-reverse" : "row"
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: chat.sender === "user" ? "#8059ca" : "#f0f2f5",
                            color: chat.sender === "user" ? "#fff" : "#666",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            flexShrink: 0
                          }}
                        >
                          {chat.sender === "user" ? (
                            <i className="fas fa-user"></i>
                          ) : (
                            <i className="fas fa-headset"></i>
                          )}
                        </div>

                        {/* Message bubble */}
                        <div
                          style={{
                            background: chat.sender === "user" ? "#8059ca" : "#f0f2f5",
                            color: chat.sender === "user" ? "#fff" : "#333",
                            padding: "10px 15px",
                            borderRadius: chat.sender === "user" ? "18px 18px 0 18px" : "18px 18px 18px 0",
                            fontSize: "14px",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                            lineHeight: "1.5",
                            maxWidth: "200px"
                          }}
                        >
                          {chat.text}
                        </div>
                      </div>
                      <div style={{ fontSize: "10px", color: "#999", marginLeft: chat.sender === "user" ? "auto" : "40px", marginRight: chat.sender === "user" ? "40px" : "auto" }}>{chat.time}</div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat Input Area */}
          <div className="p-3" style={{ background: "#fff", borderTop: "1px solid #eee" }}>
            {(selectedTicketForChat?.status?.toLowerCase() === "closed" ||
              ticketDetails?.status?.toLowerCase() === "closed" ||
              selectedTicketForChat?.status?.toLowerCase() === "resolved" ||
              ticketDetails?.status?.toLowerCase() === "resolved") ? (
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  height: "45px",
                  borderRadius: "22px",
                  border: "1px solid #e0e0e0",
                  background: "#f8f9fa",
                  color: "#999",
                  fontSize: "14px",
                  fontStyle: "italic"
                }}
              >
                <i className="fas fa-lock me-2"></i>
                This ticket is closed/resolved - messaging disabled
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  style={{
                    flexGrow: 1,
                    height: "45px",
                    borderRadius: "22px",
                    border: "1px solid #e0e0e0",
                    padding: "0 20px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    background: "#8059ca",
                    color: "#fff",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 4px 10px rgba(128, 89, 202, 0.3)"
                  }}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal Styles */}
      <style jsx>{`
        .lead-modal .modal-content {
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: none;
        }

        .lead-modal .modal-header {
          border-bottom: 1px solid #eee;
          padding: 18px 24px;
        }

        .lead-modal .modal-title {
          font-weight: 600;
          font-size: 18px;
        }

        .lead-modal .modal-body {
          padding: 25px;
        }

        .lead-modal .section {
          margin-bottom: 25px;
        }

        .lead-modal .section h5 {
          font-size: 14px;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #333;
        }

        .lead-modal .field {
          background: #f7f7f7;
          padding: 10px;
          border-radius: 6px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lead-modal .field i {
          color: #6c757d;
          font-size: 11px;
        }

        .lead-modal .field b {
          color: #333;
          font-size: 12px;
        }

        @keyframes wave {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
};

export default TicketIssues;
