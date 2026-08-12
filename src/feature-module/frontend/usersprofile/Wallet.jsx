import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { axiosUserInstance } from "../../../Apiservice";
import toast from "react-hot-toast";

const Wallet = ({ HomeNavigate, BackButton }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [wallets, setwallets] = useState([]);
  const [balance, setBalance] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const walletPerPage = 12;

  useEffect(() => {
    const getWalletAmount = async (page = 1) => {
      const token = localStorage.getItem("medicomparestoken");
      try {
        const response = await axiosUserInstance.get(`wallet/details?page=${page}&limit=${walletPerPage}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setwallets(response.data.data.transactions);
          setBalance(response.data.data.balance);
          setPagination(response.data.data.pagination);
        }
      } catch (error) {
        toast.error(error || "Error fetching wallet details:");
      }
    };
    getWalletAmount(currentPage);
  }, [currentPage]);

  const filterWallet = wallets.filter(
    (nt) =>
      nt.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > pagination.totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

            <div className="col-md-4 mb-3 mb-md-0">
              <div className="card" style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "none",
                boxShadow: "5px 4px 10px rgba(0, 0, 0, 0.03)",
                padding: "20px"
              }}>
                <div className="d-flex align-items-center">
                  <div style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(125, 46, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "15px"
                  }}>
                    <i className="fa-solid fa-wallet" style={{ fontSize: "20px", color: "#8059ca" }}></i>
                  </div>
                  <div>
                    <p style={{
                      color: "#666",
                      fontSize: "14px",
                      marginBottom: "5px"
                    }}>Current Balance</p>
                    <h3 style={{
                      color: "#333",
                      fontSize: "28px",
                      fontWeight: "700",
                      margin: "0"
                    }}>₹{balance?.toFixed(2) || "0.00"}</h3>
                  </div>
                </div>
              </div>
            </div>
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: "16px",
                        marginBottom: "5px",
                        flexWrap: isMobile ? "wrap" : "nowrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flex: "1",
                          minWidth: 0,
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
                            className="fa-solid fa-bell"
                            style={{
                              color: "#8059ca",
                              flexShrink: 0,
                            }}
                          ></i>
                          <span
                            style={{
                              whiteSpace: isMobile ? "normal" : "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              flex: "1",
                              minWidth: 0,
                            }}
                          >
                            Wallet
                          </span>
                        </h3>
                      </div>
                    </div>

                    <p
                      style={{
                        color: "#666",
                        fontSize: isMobile ? "13px" : "14px",
                        marginTop: "0",
                        marginBottom: "0",
                        whiteSpace: isMobile ? "normal" : "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      View and manage all your Wallet
                    </p>
                  </div>

                  {/* <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: "12px",
                      width: isMobile ? "100%" : "auto",
                      alignItems: isMobile ? "stretch" : "center",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: isMobile ? "100%" : "250px",
                        flexShrink: 0,
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search Transaction ID..."
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
                          outline: "none",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#8059ca")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: "15px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#999",
                          pointerEvents: "none",
                        }}
                      >
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
                        <th>Transaction ID</th>
                        <th>Amount</th>
                        <th>Payment Type</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterWallet.map((wallet) => {
                        const isCredit = wallet.type?.toLowerCase() === "credit" || wallet?.type?.toLowerCase() === "refund";
                        const isSuccess = wallet.status?.toLowerCase() === "success" || wallet.status?.toLowerCase() === "completed";
                        const isFailed = wallet.status?.toLowerCase() === "failed" || wallet.status?.toLowerCase() === "failure";

                        return (
                          <tr key={wallet._id} style={{ textTransform: "capitalize" }}>
                            <td>{wallet.createdAt ? new Date(wallet.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}</td>
                            <td style={{ fontWeight: "500", color: "#666" }}>{wallet.transactionId}</td>
                            <td style={{ fontWeight: "600", color: isCredit ? "#2ecc71" : "#e74c3c" }}>
                              {isCredit ? "+" : "-"}₹{wallet.amount.toFixed(2)}
                            </td>
                            <td>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "600",
                                display: "inline-block",
                                backgroundColor: isCredit ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)",
                                color: isCredit ? "#2ecc71" : "#e74c3c"
                              }}>
                                {wallet.type}
                              </span>
                            </td>
                            <td>{wallet.paymentMethod || "N/A"}</td>
                            <td>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "600",
                                display: "inline-block",
                                backgroundColor: isSuccess ? "#d4edda" : isFailed ? "#f8d7da" : "#fff3cd",
                                color: isSuccess ? "#155724" : isFailed ? "#721c24" : "#856404"
                              }}>
                                {wallet.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
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

                    {Array.from({ length: pagination.totalPages }, (_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
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

                      if (page === currentPage - 2 || page === currentPage + 2) {
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
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

export default Wallet;
