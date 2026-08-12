import React, { useState, useEffect } from "react";
import { axiosUserInstance, imgUrl } from "../../../Apiservice";
import { getImageUrl } from "../../../utils/index";
import { useMediaQuery } from "react-responsive";
import toast from "react-hot-toast";

const customStyles = `
  .order-card {
    background: #fff;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    transition: box-shadow 0.3s ease;
  }

  .order-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 12px;
    margin-bottom: 15px;
  }

  .order-id {
    font-weight: 600;
    font-size: 15px;
  }

  .order-date {
    font-size: 13px;
    color: #888;
  }

  .status-badge {
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 500;
  }

  .processing {
    background-color: #ffe9d6;
    color: #ff7a00;
  }

  .delivered {
    background-color: #d7f5e8;
    color: #00a86b;
  }

  .cancelled {
    background-color: #ffe0e0;
    color: #dc3545;
  }

  .product-img {
    width: 160px;
    height: 90px;
    object-fit:contain;
  }

  .product-title {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 8px;
  }

  .info-label {
    font-size: 13px;
    color: #777;
  }

  .info-value {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .payment-box {
    text-align: right;
  }

  .amount {
    font-weight: 600;
    font-size: 15px;
    margin-top: 5px;
  }

  .btn-purple {
    background-color: #9554ff;
    color: #fff;
    border-radius: 8px;
    font-size: 14px;
    padding: 6px 16px;
  }

  .btn-purple:hover {
    background-color: #5a32a3;
    color: #fff;
  }

  .btn-outline-custom {
    border-radius: 8px;
    font-size: 14px;
    padding: 6px 16px;
  }

  @media (max-width: 768px) {
    .payment-box {
      text-align: left;
      margin-top: 15px;
    }

    .mobile-no-margin {
      margin-bottom: 0 !important;
    }
  }
`;

const MyReports = ({ HomeNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdfModel, setShowPdfModel] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const ordersPerPage = 4;

  const fetchOrders = async (page = 1, status = "all") => {
    const token = localStorage.getItem("medicomparestoken");
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ordersPerPage.toString(),
        orderstatus: status,
      });

      const res = await axiosUserInstance.get(
        `orders/reports/list?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setOrders(res?.data?.data?.orders || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
      setCurrentPage(res?.data?.data?.pagination?.currentPage || 1);
    } catch (err) {
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, selectedTab);
  }, [currentPage, selectedTab]);

  const filteredOrders = orders.filter((order) => {
    if (!order.createdAt) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesOrderId = order.orderItemId
        ?.toLowerCase()
        .includes(searchLower);

      const matchesItemName =
        order.packageDetails?.some((item) => {
          const itemName = item?.name || "";
          return itemName.toLowerCase().includes(searchLower);
        }) ||
        order.productDetails?.tabletdetails?.name
          ?.toLowerCase()
          .includes(searchLower);

      if (!matchesOrderId && !matchesItemName) return false;
    }

    const orderStatus = order.orderStatus?.toLowerCase() || "";

    switch (selectedTab) {
      case "all":
        return true;
      case "delivered":
        return orderStatus === "completed" || orderStatus === "delivered";
      case "cancelled":
        return orderStatus === "cancelled" || orderStatus === "canceled";
      default:
        return true;
    }
  });

  const currentOrders = filteredOrders;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowModel(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTab]);

  useEffect(() => {
    const styleId = "orders-custom-styles";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.type = "text/css";
      document.head.appendChild(styleElement);
    }

    styleElement.innerHTML = customStyles;

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  const resolveOrderImage = (order) => {
    const firstItem = order.items?.[0];
    if (!firstItem) return "/assets/default.png";

    if (firstItem.type === "package" && firstItem.packageDetails?.length > 0) {
      const item = firstItem.packageDetails[0];
      if (Array.isArray(item?.files) && item.files.length > 0) {
        return getImageUrl(item.files[0]);
      }
    }

    if (
      firstItem.type === "normal" &&
      firstItem.productDetails?.tabletdetails?.files?.length > 0
    ) {
      return getImageUrl(firstItem.productDetails.tabletdetails.files[0]);
    }

    return "/assets/default.png";
  };

  return (
    <div className="main-wrapper">
      <div className="content doctor-content">
        <div className="container">
          <div className="row">
            <div
              className="dashboard-header"
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: isMobile ? "20px 15px" : "25px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                width: "100%",
                overflow: "visible",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    marginBottom: "12px",
                  }}
                >
                  <HomeNavigate />
                </div>
              </div>
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
                    maxWidth: isMobile ? "100%" : "calc(100% - 480px)",
                    wordBreak: "break-word",
                    overflow: "hidden",
                  }}
                >
                  <nav
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginBottom: "4px",
                    }}
                    aria-label="breadcrumb"
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#333",
                        fontWeight: "600",
                      }}
                    >
                      <i
                        className="fa-solid fa-shopping-bag"
                        style={{
                          color: "#8059ca",
                        }}
                      />
                      <span>My Reports</span>
                    </span>
                  </nav>
                  <p
                    style={{
                      color: "#666",
                      fontSize: isMobile ? "13px" : "14px",
                      marginTop: "5px",
                      marginBottom: "0",
                      whiteSpace: isMobile ? "normal" : "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    View and manage all your reports
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
                      placeholder="Search by Order ID or Item Name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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

            <div className="container py-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : currentOrders.length > 0 ? (
                <div className="row">
                  {currentOrders.map((order, index) => {
                    const orderStatus = order.orderStatus?.toLowerCase() || "";
                    const isProcessing =
                      orderStatus === "new" || orderStatus === "pending";
                    const isDelivered =
                      orderStatus === "completed" || orderStatus === "delivered";
                    const isCancelled =
                      orderStatus === "cancelled" || orderStatus === "canceled";

                    return (
                      <div key={index} className="col-md-6 col-12 mb-4">
                        <div className="order-card h-100 d-flex flex-column justify-content-between" style={{ padding: "16px", margin: 0 }}>
                          {/* Card Header */}
                          <div className="order-header" style={{ marginBottom: "12px", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px" }}>
                            <div className="order-id" style={{ fontSize: "14px", fontWeight: "600" }}>#{order.orderDetails?.orderId || "N/A"}</div>
                            {(() => {
                              const hasPendingReport = order.items?.some(item =>
                                item.patients?.some(p => !p?.reports?.reportFile)
                              );
                              return (
                                <span
                                  className={`status-badge ${!hasPendingReport ? "delivered" : "processing"}`}
                                  style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "12px", fontWeight: "600" }}
                                >
                                  {!hasPendingReport ? "READY" : "PENDING"}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Card Body */}
                          <div className="d-flex align-items-start gap-3 flex-grow-1">
                            <div
                              onClick={() => handleView(order)}
                              style={{
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={resolveOrderImage(order)}
                                className="product-img"
                                style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "8px", border: "1px solid #f0f0f0" }}
                                alt="Product"
                                onError={(e) => {
                                  e.currentTarget.src = "/assets/default.png";
                                }}
                              />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                className="product-title"
                                style={{ cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                onClick={() => handleView(order)}
                              >
                                {(() => {
                                  if (!order.items || order.items.length === 0) return "Lab Reports";
                                  const firstItem = order.items[0];
                                  const firstTitle = firstItem.type === "package"
                                    ? firstItem.packageDetails?.[0]?.name
                                    : firstItem.productDetails?.tabletdetails?.name || "Lab Test";

                                  const otherItemsCount = order.items.length - 1;
                                  return otherItemsCount > 0 ? `${firstTitle} (+${otherItemsCount} more)` : firstTitle;
                                })()}
                              </div>

                              <div className="row g-2">
                                <div className="col-12" style={{ fontSize: "12px", marginBottom: "2px" }}>
                                  <span style={{ color: "#777" }}>Doctor: </span>
                                  <span style={{ fontWeight: "500", color: "#333" }}>{order.orderDetails?.doctorName || "N/A"}</span>
                                </div>
                                <div className="col-12" style={{ fontSize: "12px", marginBottom: "2px" }}>
                                  <span style={{ color: "#777" }}>Lab: </span>
                                  <span style={{ fontWeight: "500", color: "#333" }}>
                                    {(() => {
                                      const firstItem = order.items?.[0];
                                      return firstItem?.packageDetails?.[0]?.vendorDetails?.[0]?.name ||
                                        firstItem?.productDetails?.vendorDetails?.[0]?.name ||
                                        "N/A";
                                    })()}
                                  </span>
                                </div>
                                <div className="col-12" style={{ fontSize: "12px" }}>
                                  <span style={{ color: "#777" }}>Patient: </span>
                                  <span className="capitalize-text" style={{ fontWeight: "600", color: "#8059ca" }}>
                                    {(() => {
                                      // Get a list of all distinct patient names across all items in this order
                                      const patientNames = [];
                                      order.items?.forEach(item => {
                                        item.patients?.forEach(p => {
                                          const pName = p?.patient?.name || `${order.userDetails?.first_name || ""} ${order.userDetails?.last_name || ""}`.trim();
                                          if (pName && !patientNames.includes(pName)) {
                                            patientNames.push(pName);
                                          }
                                        });
                                      });

                                      if (patientNames.length === 0) return "N/A";
                                      const firstPatientName = patientNames[0];
                                      const otherPatientsCount = patientNames.length - 1;
                                      return otherPatientsCount > 0 ? `${firstPatientName} (+${otherPatientsCount} more)` : firstPatientName;
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="d-flex align-items-center justify-content-between mt-3 pt-3" style={{ borderTop: "1px dashed #f0f0f0" }}>
                            <div className="info-label" style={{ fontSize: "12px", margin: 0 }}>
                              {order?.updatedAt
                                ? new Date(order.updatedAt).toLocaleDateString(
                                  "en-GB",
                                )
                                : "N/A"}
                            </div>
                            <button
                              className="btn btn-outline-secondary d-flex gap-1 align-items-center"
                              style={{
                                borderRadius: "6px",
                                fontSize: "11px",
                                padding: "5px 10px",
                                borderColor: "#8059ca",
                                color: "#8059ca",
                                backgroundColor: "transparent",
                                fontWeight: "600",
                              }}
                              onClick={() => handleView(order)}
                            >
                              <i className="fas fa-file-pdf"></i>
                              View Report
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="empty-state">
                    <i className="fa-solid fa-file-medical fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No reports found</h5>
                    <p className="text-muted">
                      You haven't Received any reports yet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {showModel && (
              <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 999999999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="modal-dialog modal-dialog-centered" role="document" style={{ width: "100%", maxWidth: "600px", margin: "auto" }}>
                  <div className="modal-content" style={{ borderRadius: "12px", border: "none", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
                    <div className="modal-header d-flex justify-content-between align-items-center" style={{ background: "#8059ca", color: "#fff", padding: "16px 20px" }}>
                      <h6 className="modal-title" style={{ margin: 0, fontWeight: "600", fontSize: "16px" }}>Patient Reports Details</h6>
                      <button
                        type="button"
                        style={{ border: "none", background: "transparent", fontSize: "22px", color: "#fff", cursor: "pointer", opacity: 0.8 }}
                        onClick={() => setShowModel(false)}
                      >
                        &times;
                      </button>
                    </div>

                    <div className="modal-body" style={{ padding: "20px", background: "#f8fafc", maxHeight: "70vh", overflowY: "auto" }}>
                      <div className="d-flex flex-column gap-3">
                        {(() => {
                          const patientCards = [];
                          selectedOrder?.items?.forEach((item) => {
                            item.patients?.forEach((patient, idx) => {
                              const name = patient?.patient?.name || `${selectedOrder.userDetails?.first_name || ""} ${selectedOrder.userDetails?.last_name || ""}`.trim() || "N/A";
                              const relation = patient?.patient?.relationship || "Self";
                              const testName = item.type === "package"
                                ? item.packageDetails?.[0]?.name
                                : item.productDetails?.tabletdetails?.name || "Lab Test";
                              const hasReport = !!patient?.reports?.reportFile;

                              patientCards.push(
                                <div
                                  key={`${item.orderItemId}-${idx}`}
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    padding: "14px 16px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    transition: "transform 0.15s ease",
                                  }}
                                >
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#1e293b", textTransform: "capitalize" }}>
                                      {name}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                      Relation: <span style={{ fontWeight: "500" }}>{relation}</span>
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                      Test: <span style={{ fontWeight: "500", color: "#334155" }}>{testName}</span>
                                    </div>
                                  </div>

                                  <div>
                                    {hasReport ? (
                                      <button
                                        type="button"
                                        className="btn btn-sm d-flex align-items-center gap-1.5"
                                        style={{
                                          background: "#8059ca",
                                          color: "#ffffff",
                                          fontWeight: "600",
                                          fontSize: "12px",
                                          padding: "6px 12px",
                                          borderRadius: "6px",
                                          border: "none",
                                        }}
                                        onClick={() => {
                                          const rawPath = patient.reports.reportFile;
                                          const fullUrl = rawPath.startsWith("http://") || rawPath.startsWith("https://")
                                            ? rawPath
                                            : `${imgUrl}/${rawPath.startsWith("/") ? rawPath.slice(1) : rawPath}`;
                                          setPdfUrl(fullUrl);
                                          setPdfLoading(true);
                                          setShowPdfModel(true);
                                        }}
                                      >
                                        <i className="fas fa-eye" style={{ fontSize: "11px" }}></i>
                                        View Report
                                      </button>
                                    ) : (
                                      <span
                                        style={{
                                          background: "#f1f5f9",
                                          color: "#64748b",
                                          fontSize: "11px",
                                          fontWeight: "600",
                                          padding: "6px 12px",
                                          borderRadius: "6px",
                                          border: "1px solid #e2e8f0",
                                          display: "inline-block",
                                        }}
                                      >
                                        Not Ready
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          });

                          return patientCards.length > 0 ? patientCards : (
                            <div className="text-center text-muted py-4">No patients registered for this order</div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showPdfModel && (
              <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  zIndex: 9999999999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="modal-dialog modal-dialog-centered pdf-modal" role="document" style={{ width: "100%", maxWidth: "800px", margin: "auto" }}>
                  <div className="modal-content pdf-modal-inner">
                    <style>{`
                      .pdf-modal .modal-content {
                        border-radius: 12px;
                        border: none;
                        box-shadow: 0 5px 25px rgba(0,0,0,0.15);
                        overflow: hidden;
                      }
                      .pdf-modal-inner {
                        display: flex;
                        flex-direction: column;
                        height: 85vh;
                      }
                      .pdf-modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px 20px;
                        border-bottom: 1px solid #f1f1f1;
                        background: #fff;
                      }
                      .pdf-modal-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #333;
                        margin: 0;
                      }
                      .pdf-modal-close {
                        border: none;
                        background: transparent;
                        font-size: 22px;
                        color: #999;
                        cursor: pointer;
                        line-height: 1;
                        padding: 0;
                      }
                      .pdf-modal-close:hover {
                        color: #333;
                      }
                      .pdf-modal-body {
                        flex: 1;
                        background: #fafafa;
                        position: relative;
                      }
                    `}</style>
                    <div className="pdf-modal-header">
                      <h6 className="pdf-modal-title">View Report PDF</h6>
                      <button
                        type="button"
                        className="pdf-modal-close"
                        onClick={() => setShowPdfModel(false)}
                      >
                        &times;
                      </button>
                    </div>

                    <div className="pdf-modal-body" style={{ height: "100%", position: "relative" }}>
                      {pdfLoading && (
                        <div className="d-flex justify-content-center align-items-center h-100" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "#fafafa", zIndex: 10 }}>
                          <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading report...</span>
                            </div>
                            <p className="mt-3 text-muted">Loading report...</p>
                          </div>
                        </div>
                      )}

                      {pdfUrl ? (
                        <iframe
                          src={pdfUrl}
                          title="Patient Report PDF"
                          width="100%"
                          height="100%"
                          style={{ border: "none", display: pdfLoading ? "none" : "block" }}
                          onLoad={() => setPdfLoading(false)}
                        />
                      ) : (
                        <div className="p-3 text-center text-muted">No report file available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination dashboard-pagination mt-0">
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
                      onClick={() =>
                        handlePageChange(Math.min(currentPage + 1, totalPages))
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
  );
};

export default MyReports;
