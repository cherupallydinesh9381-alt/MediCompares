import React, { useState, useEffect } from "react";
import { useMediaQuery } from 'react-responsive';
import { axiosUserInstance } from "../../../Apiservice";
import toast from "react-hot-toast";

const Transactions = ({ HomeNavigate, BackButton }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("new");
  const transactionsPerPage = 10;

  const fetchOrders = async (page = 1, search = "") => {
    const token = localStorage.getItem("medicomparestoken");
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: transactionsPerPage.toString(),
        search: search || "",
      });

      const res = await axiosUserInstance.get(
        `orders/transaction/list?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const txList = res?.data?.data?.transactions || [];
      const pagination = res?.data?.data?.pagination || {};

      setOrders(txList);
      setTotalPages(pagination.totalPages || 1);
    } catch (err) {
      toast.error("Error fetching transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const currentTransactions = orders.map((tx) => {
    const txDate = tx.createdAt ? new Date(tx.createdAt) : new Date();
    const formattedDate = txDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      id: `#${tx.orderId}`,
      type: tx.bookingType ? tx.bookingType.replace(/_/g, ' ') : "Purchase",
      details: tx.bookingType === "cart" ? `Cart Order - #${tx.orderId}` : `Order - #${tx.orderId}`,
      date: formattedDate,
      amount: tx.amount || 0,
      status: tx.orderStatus || "pending",
      paymentMethod: tx.paymentMethod || "N/A",
      orderId: tx.orderId,
      paymentStatus: tx.paymentStatus || "pending",
      paymentId: tx.paymentId || null,
      razorpayOrderId: tx.razorpayOrderId || null,
      rawDate: tx.createdAt
    };
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { background: "rgba(46, 204, 113, 0.1)", color: "#2ecc71", border: "1px solid rgba(46, 204, 113, 0.2)" };
      case "pending":
        return { background: "rgba(241, 196, 15, 0.1)", color: "#f1c40f", border: "1px solid rgba(241, 196, 15, 0.2)" };
      case "failed":
        return { background: "rgba(231, 76, 60, 0.1)", color: "#e74c3c", border: "1px solid rgba(231, 76, 60, 0.2)" };
      default:
        return { background: "rgba(149, 117, 205, 0.1)", color: "#9575cd", border: "1px solid rgba(149, 117, 205, 0.2)" };
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
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
                      <i className="fa-solid fa-credit-card" style={{
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
                        Transaction History
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
                      View and manage all your transaction history
                    </p>
                  </div>

                  <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: "12px",
                    width: isMobile ? "100%" : "auto",
                    alignItems: isMobile ? "stretch" : "center"
                  }}>

                    {/* Search Input */}
                    <div style={{
                      position: "relative",
                      width: isMobile ? "100%" : "250px",
                      flexShrink: 0
                    }}>
                      <input
                        type="text"
                        placeholder="Search by Order ID..."
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
                  </div>
                </div>
              </div>

              {/* Transactions List / Cards */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading transactions...</span>
                  </div>
                </div>
              ) : currentTransactions.length > 0 ? (
                <div className="row g-4 mb-4">
                  {currentTransactions.map((tx) => {
                    const statusStyle = getStatusColor(tx.status);

                    return (
                      <div className="col-md-6 col-12" key={tx.id}>
                        <div
                          style={{
                            padding: "20px",
                            border: "1px solid #f1f5f9",
                            borderRadius: "14px",
                            background: "#ffffff",
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "14px",
                            height: "100%",
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          {/* Card Header */}
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "10px",
                                  background: "#f3e8ff",
                                  color: "#8059ca",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "15px",
                                  flexShrink: 0,
                                }}
                              >
                                <i className="fa-solid fa-receipt" />
                              </div>
                              <div>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    color: "#8059ca",
                                    display: "block",
                                  }}
                                >
                                  {tx.orderId || tx.id}
                                </span>
                                <span style={{ fontSize: "12px", color: "#64748b" }}>
                                  <i className="fa-regular fa-clock me-1"></i>
                                  {tx.date || "N/A"}
                                </span>
                              </div>
                            </div>

                            {/* Order Status Badge */}
                            <span
                              className="badge d-inline-flex align-items-center gap-1.5"
                              style={{
                                backgroundColor: statusStyle.background,
                                color: statusStyle.color,
                                border: statusStyle.border,
                                padding: "5px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                                textTransform: "capitalize",
                              }}
                            >
                              <i
                                className="fa-solid fa-circle"
                                style={{
                                  fontSize: "6px",
                                  animation:
                                    tx.status?.toLowerCase() === "pending"
                                      ? "pulse 2s infinite"
                                      : "none",
                                }}
                              />
                              {tx.status}
                            </span>
                          </div>

                          {/* Details Description */}
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#334155",
                              fontWeight: "500",
                              background: "#f8fafc",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "1px solid #f1f5f9",
                            }}
                          >
                            {tx.details}
                          </div>

                          {/* Card Footer Details Grid */}
                          <div className="row g-2 pt-2" style={{ borderTop: "1px dashed #e2e8f0" }}>
                            <div className="col-4">
                              <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
                                Payment Method
                              </span>
                              <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", textTransform: "capitalize" }}>
                                {tx.paymentMethod || "N/A"}
                              </span>
                            </div>

                            <div className="col-4">
                              <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
                                Payment Status
                              </span>
                              <span
                                className="badge d-inline-flex align-items-center gap-1 mt-1"
                                style={{
                                  backgroundColor:
                                    tx.paymentStatus === "paid"
                                      ? "rgba(46, 204, 113, 0.1)"
                                      : "rgba(241, 196, 15, 0.1)",
                                  color: tx.paymentStatus === "paid" ? "#2ecc71" : "#f1c40f",
                                  border:
                                    tx.paymentStatus === "paid"
                                      ? "1px solid rgba(46, 204, 113, 0.2)"
                                      : "1px solid rgba(241, 196, 15, 0.2)",
                                  padding: "3px 8px",
                                  borderRadius: "20px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  textTransform: "capitalize",
                                }}
                              >
                                {tx.paymentStatus || "pending"}
                              </span>
                            </div>

                            <div className="col-4 text-end">
                              <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
                                Total Amount
                              </span>
                              <span style={{ fontSize: "15px", fontWeight: "700", color: "#16a34a" }}>
                                ₹{tx.amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="text-center py-5 bg-white rounded-3 border"
                  style={{ color: "#64748b" }}
                >
                  <i className="fa-solid fa-receipt fa-2x mb-3 text-muted" />
                  <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                    {searchTerm || statusFilter ? "No transactions found" : "No transactions yet"}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination dashboard-pagination mt-4">
                  <ul className="d-flex justify-content-center align-items-center gap-1">
                    <li>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fa-solid fa-chevron-left" />
                      </button>
                    </li>

                    {getPaginationRange().map((item, index) => (
                      <li key={index}>
                        {item === "..." ? (
                          <span className="px-2 text-muted" style={{ fontSize: "14px" }}>...</span>
                        ) : (
                          <button
                            className={`page-link ${currentPage === item ? "active" : ""}`}
                            onClick={() => handlePageChange(item)}
                          >
                            {item}
                          </button>
                        )}
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

export default Transactions;