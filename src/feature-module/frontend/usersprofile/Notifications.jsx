import React, { useState, useEffect } from "react";
import { useMediaQuery } from 'react-responsive';
import { axiosUserInstance } from "../../../Apiservice";
import toast from "react-hot-toast";

const Notifications = ({ HomeNavigate, BackButton }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [allNotifications, setAllNotifications] = useState([]);
  const notificationsPerPage = 12;

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("medicomparestoken");
      try {
        const response = await axiosUserInstance.get("notifications/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setAllNotifications(response.data.data.notifications);
        }
      } catch (error) {
        toast.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    markAllNotificationsAsRead();
  }, []);

  const filteredNotifications = allNotifications.filter((nt) =>
    nt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nt.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nt._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markAllNotificationsAsRead = async () => {
    const token = localStorage.getItem("medicomparestoken");
    try {
      const response = await axiosUserInstance.post("notifications/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setAllNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            read: true
          }))
        );
        const updatedCount = response.data.data?.updatedCount || 0;
        window.dispatchEvent(new CustomEvent('updateUnreadCount', {
          detail: { unreadCount: updatedCount }
        }));

      }
    } catch (error) {
      toast.error("Error marking notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    const token = localStorage.getItem("medicomparestoken");
    try {
      const response = await axiosUserInstance.delete(`notifications/delete/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success(response.data.message || "Notification deleted successfully");
        setAllNotifications(prevNotifications =>
          prevNotifications.filter(notification => notification._id !== notificationId)
        );
        const deletedNotification = allNotifications.find(nt => nt._id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          window.dispatchEvent(new CustomEvent('updateUnreadCount', {
            detail: { unreadCount: Math.max(0, (allNotifications.filter(nt => !nt.read).length - 1)) }
          }));
        }
      } else {
        toast.error(response.data.message || "Failed to delete notification");
      }
    } catch (error) {
      toast.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="main-wrapper">
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
              <div className="dashboard-header" style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: isMobile ? "20px 15px" : "25px",
                marginBottom: "20px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                width: "100%",
                overflow: "visible"
              }}>
                <div style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: isMobile ? "16px" : "24px",
                  width: "100%"
                }}>
                  <div style={{
                    flex: "1",
                    minWidth: 0,
                    maxWidth: isMobile ? "100%" : "calc(100% - 280px)",
                    wordBreak: "break-word",
                    overflow: "hidden"
                  }}>
                    <h3 style={{
                      fontSize: isMobile ? "20px" : "24px",
                      fontWeight: "600",
                      color: "#333",
                      margin: "0",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: isMobile ? "wrap" : "nowrap"
                    }}>
                      <i className="fa-solid fa-bell" style={{
                        color: "#8059ca",
                        flexShrink: 0
                      }}></i>
                      <span style={{
                        whiteSpace: isMobile ? "normal" : "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                        flex: "1",
                        minWidth: 0
                      }}>
                        Notifications
                      </span>
                    </h3>
                    <p style={{
                      color: "#666",
                      fontSize: isMobile ? "13px" : "14px",
                      marginTop: "5px",
                      marginBottom: "0",
                      whiteSpace: isMobile ? "normal" : "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%"
                    }}>
                      View and manage all your notifications
                    </p>
                  </div>

                  {/* <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: "12px",
                    width: isMobile ? "100%" : "auto",
                    alignItems: isMobile ? "stretch" : "center"
                  }}>
                    <div style={{
                      position: "relative",
                      width: isMobile ? "100%" : "250px",
                      flexShrink: 0
                    }}>
                      <input
                        type="text"
                        placeholder="Search notifications..."
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
                          transition: "all 0.3s ease",
                          width: "100%",
                          boxSizing: "border-box",
                          outline: "none"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#8059ca"}
                        onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                      />
                      <span style={{
                        position: "absolute",
                        left: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                        pointerEvents: "none"
                      }}>
                        <i className="fa-solid fa-search" />
                      </span>
                    </div>
                  </div> */}
                </div>
              </div>

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
                        <th>Date</th>
                        <th>Title</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentNotifications.map((nt) => {
                        const isUnread = !nt.read;
                        const status = nt.read ? "Read" : "Unread";
                        const formattedDate = new Date(nt.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        });

                        return (
                          <tr key={nt._id}>
                            <td>{formattedDate}</td>
                            <td style={{ fontWeight: isUnread ? "600" : "500" }}>{nt.title}</td>
                            <td>{nt.message}</td>
                            <td>
                              <span className="badge d-inline-flex align-items-center gap-2" style={{
                                backgroundColor: isUnread ? "rgba(255, 193, 7, 0.1)" : "rgba(46, 204, 113, 0.1)",
                                color: isUnread ? "#ffc107" : "#2ecc71",
                                border: isUnread ? "1px solid rgba(255, 193, 7, 0.2)" : "1px solid rgba(46, 204, 113, 0.2)",
                                padding: "4px 8px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "600"
                              }}>
                                <i className="fa-solid fa-circle" style={{
                                  fontSize: "6px",
                                }} />
                                {status}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                onClick={() => deleteNotification(nt._id)}
                                className="btn btn-sm btn-light"
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
                                title="Delete Notification"
                              >
                                <i className="fa-solid fa-trash text-danger" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {filteredNotifications.length > notificationsPerPage && (
                <div className="pagination dashboard-pagination mt-4">
                  <ul className="d-flex justify-content-center">
                    <li>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fa-solid fa-chevron-left" />
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i}>
                        <button
                          className={`page-link ${currentPage === i + 1 ? "active" : ""
                            }`}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
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
    </div>
  );
};

export default Notifications;