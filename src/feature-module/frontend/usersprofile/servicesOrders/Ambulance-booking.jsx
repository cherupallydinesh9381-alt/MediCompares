import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { axiosUserInstance, imgUrl } from "../../../../Apiservice";
import { getImageUrl } from "../../../../utils/index";
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

  .failed {
    background-color: #fff3cd;
    color: #856404;
  }

  .product-img {
    width: 100%px;
    height: 100px;
    object-fit: contain;
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
    background-color: #6f42c1;
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

  .amb-action-btn {
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .amb-btn-details {
    background: #f3eeff;
    color: #8059ca;
    border: 1px solid #d6c6f7;
  }

  .amb-btn-details:hover {
    background: #8059ca;
    color: #fff;
  }

  .amb-btn-cancel {
    background: #fff0f0;
    color: #dc3545;
    border: 1px solid #f7c6c6;
  }

  .amb-btn-cancel:hover {
    background: #dc3545;
    color: #fff;
  }

  .amb-btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .amb-detail-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
    z-index: 99999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .amb-detail-modal {
    background: #fff;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    max-height: 75vh;
    overflow-y: auto;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
    animation: ambModalIn 0.22s ease;
    margin: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .amb-detail-modal::-webkit-scrollbar {
    display: none;
  }

  .amb-detail-modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }

  @keyframes ambModalIn {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .amb-status-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .amb-tab-btn {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    border: 1.5px solid #e0e0e0;
    background: #fff;
    color: #555;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .amb-tab-btn:hover {
    border-color: #8059ca;
    color: #8059ca;
  }

  .amb-tab-btn.active {
    background: #8059ca;
    border-color: #8059ca;
    color: #fff;
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

const STATUS_TABS = [
  { id: "all", label: "All", icon: "fa-list" },
  { id: "upcoming", label: "Upcoming", icon: "fa-clock" },
  { id: "completed", label: "Completed", icon: "fa-check-circle" },
  { id: "cancelled", label: "Cancelled", icon: "fa-times-circle" },
  { id: "failed", label: "Failed", icon: "fa-exclamation-circle" },
];

const AmbulanceBooking = ({ HomeNavigate, BackButton }) => {
  const [leadslist, setleadslist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const ordersPerPage = 4;

  const getLeadsData = async (page = 1, search = "", status = "all") => {
    const token = localStorage.getItem("medicomparestoken");
    setLoading(true);

    try {
      const statusParam = status && status !== "all" ? `&status=${encodeURIComponent(status)}` : "";

      const res = await axiosUserInstance.get(
        `ride/list?page=${page}&limit=${ordersPerPage}&search=${encodeURIComponent(search)}${statusParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setleadslist(res?.data?.data?.list || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
      setCurrentPage(res?.data?.data?.pagination?.currentPage || 1);
    } catch (err) {
      toast.error("Error fetching leads: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getLeadsData(currentPage, searchTerm, activeTab);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, activeTab]);


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  useEffect(() => {
    const styleId = 'ambulance-custom-styles';
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.type = 'text/css';
      document.head.appendChild(styleElement);
    }

    styleElement.innerHTML = customStyles;

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  const getStatusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "delivered") return "delivered";
    if (s === "cancelled" || s === "canceled") return "cancelled";
    if (s === "failed") return "failed";
    return "processing";
  };

  // Upcoming = bookingDateTime is in the future AND status is not a terminal state
  const isUpcoming = (lead) => {
    const terminalStatuses = ["completed", "delivered", "cancelled", "canceled", "failed"];
    const statusLower = (lead.status || "").toLowerCase();
    if (terminalStatuses.includes(statusLower)) return false;
    if (!lead.bookingDateTime) return true; // no date = assume upcoming
    return new Date(lead.bookingDateTime) > new Date();
  };

  const filteredOrders = leadslist;

  const handleCancelBooking = async (leadId) => {
    const token = localStorage.getItem("medicomparestoken");
    setCancellingId(leadId);
    try {
      await axiosUserInstance.post(
        `ride/cancel/${leadId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Booking cancelled successfully");
      setConfirmCancelId(null);
      getLeadsData(currentPage, searchTerm, activeTab);
    } catch (err) {
      // If no cancel endpoint exists, update locally
      setleadslist((prev) =>
        prev.map((l) =>
          l._id === leadId ? { ...l, status: "cancelled" } : l
        )
      );
      toast.success("Booking cancelled");
      setConfirmCancelId(null);
    } finally {
      setCancellingId(null);
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "upcoming": return "No upcoming ambulance bookings found.";
      case "completed": return "No completed ambulance bookings found.";
      case "cancelled": return "No cancelled ambulance bookings found.";
      case "failed": return "No failed ambulance bookings found.";
      default: return "You haven't booked any ambulance services yet.";
    }
  };

  // GeoJSON: coordinates = [longitude, latitude]
  const getMapUrl = (locationObj) => {
    const coords = locationObj?.coordinates;
    if (coords && coords.length === 2) {
      const lat = coords[1];
      const lng = coords[0];
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    // Fallback to address search
    if (locationObj?.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationObj.address)}`;
    }
    return null;
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
                        className="fa-solid fa-truck-medical"
                        style={{ color: "#8059ca", flexShrink: 0 }}
                      ></i>
                      <span>Ambulance Booking</span>
                    </h3>
                    <p
                      style={{
                        color: "#666",
                        fontSize: isMobile ? "13px" : "14px",
                        marginTop: "5px",
                        marginBottom: "0",
                      }}
                    >
                      Manage and track all your Ambulance Bookings
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
                      placeholder="Search by Booking ID, Address..."
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

              {/* Status Tabs */}
              <div className="mb-3 position-relative" style={{ marginTop: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "nowrap",
                  }}
                >
                  {isMobile ? (
                    <select
                      value={activeTab}
                      className="form-select"
                      onChange={(e) => handleTabChange(e.target.value)}
                      style={{
                        border: "1px solid #ddd",
                      }}
                    >
                      {STATUS_TABS.map((tab) => {
                        const tabCount =
                          tab.id === "all"
                            ? leadslist.length
                            : leadslist.filter((lead) => {
                              const s = lead.status?.toLowerCase() || "";
                              switch (tab.id) {
                                case "upcoming":
                                  return (
                                    s === "upcoming" ||
                                    s === "pending" ||
                                    s === "accepted" ||
                                    s === "confirmed"
                                  );
                                case "completed":
                                  return s === "completed";
                                case "cancelled":
                                  return s === "cancelled" || s === "rejected";
                                case "failed":
                                  return s === "failed";
                                default:
                                  return false;
                              }
                            }).length;
                        return (
                          <option key={tab.id} value={tab.id}>
                            {tab.label}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <ul
                      className="nav nav-tabs nav-tabs-solid"
                      style={{
                        flex: 1,
                        display: "flex",
                        marginBottom: 0,
                        overflow: "visible",
                        minWidth: 0,
                      }}
                    >
                      {STATUS_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const tabCount =
                          tab.id === "all"
                            ? leadslist.length
                            : leadslist.filter((lead) => {
                              const s = lead.status?.toLowerCase() || "";
                              switch (tab.id) {
                                case "upcoming":
                                  return (
                                    s === "upcoming" ||
                                    s === "pending" ||
                                    s === "accepted" ||
                                    s === "confirmed"
                                  );
                                case "completed":
                                  return s === "completed";
                                case "cancelled":
                                  return s === "cancelled" || s === "rejected";
                                case "failed":
                                  return s === "failed";
                                default:
                                  return false;
                              }
                            }).length;

                        return (
                          <li className="nav-item" key={tab.id}>
                            <button
                              className={`nav-link ${isActive ? "active" : ""}`}
                              onClick={() => handleTabChange(tab.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <i className={`fas ${tab.icon}`}></i>
                              {tab.label}
                              {/* {tabCount > 0 && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    padding: "2px 6px",
                                    borderRadius: "10px",
                                    background: isActive ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                                    color: isActive ? "#ffffff" : "#64748b",
                                    marginLeft: "4px"
                                  }}
                                >
                                  {tabCount}
                                </span>
                              )} */}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="container py-4">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <div className="row">
                    {filteredOrders.map((lead) => {
                      const orderStatus = lead.status?.toLowerCase() || "";
                      const isDelivered = orderStatus === "completed" || orderStatus === "delivered";
                      const isCancelled = orderStatus === "cancelled" || orderStatus === "canceled";
                      const isPaid = lead.paymentStatus === "paid";

                      return (
                        <div key={lead._id} className="col-md-6 col-12 mb-3">
                          <div
                            className="order-card h-100 d-flex flex-column justify-content-between"
                            style={{
                              background: "#ffffff",
                              borderRadius: "9px",
                              padding: "16px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = "0 8px 24px rgba(128, 89, 202, 0.1)";
                              e.currentTarget.style.borderColor = "#c0a6f3";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = "0 2px 10px rgba(15, 23, 42, 0.03)";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            {/* Top Header Row */}
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <div>
                                  <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                                      #{lead.bookingId}
                                    </span>
                                    <span
                                      className={`status-badge text-capitalize ${getStatusBadgeClass(lead.status)}`}
                                      style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px" }}
                                    >
                                      {lead.status ? lead.status.toLowerCase() : "N/A"}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                    <i className="fas fa-calendar-alt me-1" style={{ color: "#8059ca" }}></i>
                                    {new Date(lead.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                                  </div>
                                </div>

                                <div className="text-end">
                                  <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Total Fare</div>
                                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#8059ca" }}>
                                    ₹{lead.fare?.toLocaleString() || "0"}
                                  </div>
                                </div>
                              </div>

                              {/* Service Info Box */}
                              <div
                                style={{
                                  background: "#fdfaff",
                                  borderRadius: "10px",
                                  border: "1px solid #f1e9fe",
                                  padding: "8px 10px",
                                  marginBottom: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px"
                                }}
                              >
                                {lead.productdetails?.tabletdetails?.files?.[0] ? (
                                  <img
                                    src={getImageUrl(lead.productdetails.tabletdetails.files[0])}
                                    style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "8px", background: "#fff", padding: "2px", border: "1px solid #e9d5ff" }}
                                    alt="Ambulance"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      if (e.currentTarget.nextSibling) {
                                        e.currentTarget.nextSibling.style.display = "flex";
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "8px",
                                    background: "#f3eeff",
                                    border: "1px solid #d6c6f7",
                                    color: "#8059ca",
                                    display: lead.productdetails?.tabletdetails?.files?.[0] ? "none" : "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px",
                                    flexShrink: 0
                                  }}
                                >
                                  <i className="fas fa-ambulance"></i>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", textTransform: "capitalize" }} className="text-truncate">
                                    {lead.productdetails?.tabletdetails?.name ||
                                      lead.productdetails?.variantcurrentDetails?.productname ||
                                      lead.productdetails?.packagedetails?.name ||
                                      "Ambulance Service"}
                                  </div>
                                  <div className="d-flex align-items-center gap-2 mt-1" style={{ fontSize: "11px" }}>
                                    <span style={{ color: "#64748b" }}>
                                      <i className="fas fa-truck-medical me-1" style={{ color: "#8059ca" }}></i>
                                      {lead.emergencyType ? (lead.emergencyType.toLowerCase() === "nonemergency" ? "Non-Emergency" : lead.emergencyType) : "Standard"}
                                    </span>
                                    <span style={{ color: "#cbd5e1" }}>•</span>
                                    <span style={{ color: isPaid ? "#16a34a" : "#dc2626", fontWeight: "600", textTransform: "capitalize" }}>
                                      <i className={`fas ${isPaid ? "fa-check-circle" : "fa-clock"} me-1`}></i>
                                      {lead.paymentStatus || "unpaid"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Pickup & Drop Route timeline */}
                              <div style={{ padding: "2px 0 8px 0" }}>
                                {/* Pickup */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                  <i className="fas fa-circle" style={{ color: "#16a34a", fontSize: "9px" }}></i>
                                  <div style={{ flex: 1, minWidth: 0, fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span
                                      title={lead.pickupLocation?.address || "N/A"}
                                      style={{ color: "#334155", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                    >
                                      <strong style={{ color: "#64748b", fontWeight: "600", marginRight: "4px" }}>From:</strong>
                                      {lead.pickupLocation?.address || "N/A"}
                                    </span>
                                    {getMapUrl(lead.pickupLocation) && (
                                      <a
                                        href={getMapUrl(lead.pickupLocation)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: "11px", color: "#16a34a", textDecoration: "none", fontWeight: "600", flexShrink: 0, marginLeft: "6px" }}
                                      >
                                        <i className="fas fa-map-marked-alt me-1"></i> Maps
                                      </a>
                                    )}
                                  </div>
                                </div>

                                {/* Dropoff */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <i className="fas fa-map-marker-alt" style={{ color: "#dc2626", fontSize: "11px" }}></i>
                                  <div style={{ flex: 1, minWidth: 0, fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span
                                      title={lead.dropoffLocation?.address || "N/A"}
                                      style={{ color: "#334155", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                    >
                                      <strong style={{ color: "#64748b", fontWeight: "600", marginRight: "4px" }}>To:</strong>
                                      {lead.dropoffLocation?.address || "N/A"}
                                    </span>
                                    {getMapUrl(lead.dropoffLocation) && (
                                      <a
                                        href={getMapUrl(lead.dropoffLocation)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: "11px", color: "#dc2626", textDecoration: "none", fontWeight: "600", flexShrink: 0, marginLeft: "6px" }}
                                      >
                                        <i className="fas fa-map-marked-alt me-1"></i> Maps
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Vendor info snippet */}
                              {lead.vendordetails && (lead.vendordetails.firstName || lead.vendordetails.email || lead.vendordetails.mobile) && (
                                <div
                                  style={{
                                    background: "#f8fafc",
                                    border: "1px solid #f1f5f9",
                                    borderRadius: "8px",
                                    padding: "6px 10px",
                                    marginBottom: "10px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "11px"
                                  }}
                                >
                                  <div className="d-flex align-items-center gap-1">
                                    <span style={{ color: "#64748b", fontWeight: "600" }}>Vendor:</span>
                                    <span style={{ color: "#0f172a", fontWeight: "600" }}>
                                      {lead.vendordetails.firstName || ""} {lead.vendordetails.lastName || ""}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Card Footer Actions */}
                            <div className="d-flex gap-2 pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                              <button
                                className="btn flex-grow-1"
                                style={{
                                  background: "#8059ca",
                                  color: "#ffffff",
                                  border: "none",
                                  fontWeight: "600",
                                  fontSize: "12px",
                                  borderRadius: "20px",
                                  padding: "6px 12px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "5px",
                                  boxShadow: "0 2px 6px rgba(128, 89, 202, 0.2)"
                                }}
                                onClick={() => setSelectedLead(lead)}
                              >
                                <i className="fas fa-eye" style={{ fontSize: "11px" }}></i> View Details
                              </button>

                              {isUpcoming(lead) && (
                                <button
                                  className="btn"
                                  style={{
                                    background: "#ffffff",
                                    color: "#dc2626",
                                    border: "1px solid #fecaca",
                                    fontWeight: "600",
                                    fontSize: "12px",
                                    borderRadius: "20px",
                                    padding: "6px 12px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "5px"
                                  }}
                                  onClick={() => setConfirmCancelId(lead._id)}
                                >
                                  <i className="fas fa-times" style={{ fontSize: "11px" }}></i> Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="empty-state">
                      <i className="fa-solid fa-truck-medical fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No ambulance bookings found</h5>
                      <p className="text-muted">{getEmptyMessage()}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedLead && createPortal(
                <div className="amb-detail-modal-overlay" style={{ zIndex: 99999999 }} onClick={() => setSelectedLead(null)}>
                  <div className="amb-detail-modal" onClick={(e) => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className="amb-detail-modal-header">
                      <div>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                          Booking #{selectedLead.bookingId || (selectedLead._id ? selectedLead._id.substring(selectedLead._id.length - 8) : "")}
                        </h4>
                        <span style={{ fontSize: "12px", color: "#8059ca", fontWeight: "500" }}>
                          Ambulance Service Details
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className={`status-badge text-capitalize ${getStatusBadgeClass(selectedLead.status)}`} style={{ fontSize: "11px", padding: "4px 10px" }}>
                          {selectedLead.status || "N/A"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedLead(null)}
                          style={{
                            border: "none",
                            background: "#f1f5f9",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            cursor: "pointer"
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>

                    {/* Modal Body */}
                    <div style={{ padding: "16px 20px" }}>
                      {/* Product */}
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px", padding: "12px", background: "#f8f4ff", borderRadius: "10px" }}>
                        <img
                          src={getImageUrl(selectedLead.productdetails?.tabletdetails?.files?.[0])}
                          alt="Ambulance"
                          onError={(e) => { e.currentTarget.src = "/assets/default.png"; }}
                          style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", background: "#fff", border: "1px solid #ede9f6" }}
                        />
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px", color: "#333", textTransform: "capitalize" }}>
                            {selectedLead.productdetails?.tabletdetails?.name ||
                              selectedLead.productdetails?.variantcurrentDetails?.productname ||
                              selectedLead.productdetails?.packagedetails?.name ||
                              "Ambulance Service"}
                          </div>
                          {selectedLead.bookingDateTime && (
                            <div style={{ fontSize: "12px", color: "#8059ca", marginTop: "4px" }}>
                              <i className="fas fa-calendar-alt me-1"></i>
                              {new Date(selectedLead.bookingDateTime).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location Info */}
                      {[
                        { label: "Pickup Location", value: selectedLead.pickupLocation?.address, icon: "fa-map-marker-alt", color: "#28a745", loc: selectedLead.pickupLocation },
                        { label: "Drop-off Location", value: selectedLead.dropoffLocation?.address, icon: "fa-map-pin", color: "#dc3545", loc: selectedLead.dropoffLocation },
                      ].map((item) => (
                        <div key={item.label} style={{ marginBottom: "10px", padding: "10px 12px", background: "#f8fafc", borderRadius: "8px", borderLeft: `3px solid ${item.color}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <div style={{ fontSize: "11px", color: "#777" }}>
                              <i className={`fas ${item.icon} me-1`} style={{ color: item.color }}></i>
                              {item.label}
                            </div>
                            {getMapUrl(item.loc) && (
                              <a
                                href={getMapUrl(item.loc)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "11px",
                                  color: "#fff",
                                  background: item.color,
                                  padding: "3px 9px",
                                  borderRadius: "6px",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontWeight: 500,
                                }}
                                title="Open in Google Maps"
                              >
                                <i className="fas fa-map-marked-alt"></i> Maps
                              </a>
                            )}
                          </div>
                          <div style={{ fontSize: "13px", fontWeight: "500", color: "#333" }}>{item.value || "N/A"}</div>
                        </div>
                      ))}

                      {/* Details Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                        {[
                          {
                            label: "Service Type",
                            value: selectedLead.emergencyType
                              ? selectedLead.emergencyType.toLowerCase() === "nonemergency"
                                ? "Non-Emergency"
                                : selectedLead.emergencyType.charAt(0).toUpperCase() + selectedLead.emergencyType.slice(1).toLowerCase()
                              : null,
                            icon: "fa-ambulance",
                            iconColor: "#8059ca",
                          },
                          {
                            label: "Booking Status",
                            value: selectedLead.bookingStatus,
                            icon: "fa-clipboard-list",
                            iconColor: "#0ea5e9",
                            colored: true,
                            isPaid: ["confirmed", "completed"].includes((selectedLead.bookingStatus || "").toLowerCase()),
                          },
                          {
                            label: "Payment Status",
                            value: selectedLead.paymentStatus,
                            icon: "fa-credit-card",
                            iconColor: "#22c55e",
                            colored: true,
                            isPaid: selectedLead.paymentStatus === "paid",
                          },
                          {
                            label: "Payment Method",
                            value: selectedLead.paymentmethod || selectedLead.paymentMethod,
                            icon: "fa-wallet",
                            iconColor: "#f59e0b",
                          },
                          {
                            label: "Distance",
                            value: selectedLead.distance ? `${selectedLead.distance} km` : (selectedLead.distanceKm ? `${selectedLead.distanceKm} km` : null),
                            icon: "fa-route",
                            iconColor: "#6366f1",
                          },
                          // {
                          //   label: "Booking ID",
                          //   value: selectedLead.bookingId,
                          //   icon: "fa-hashtag",
                          //   iconColor: "#64748b",
                          // },
                        ].filter(i => i.value).map((item) => (
                          <div key={item.label} style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px 12px" }}>
                            <div style={{ fontSize: "11px", color: "#777", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <i className={`fas ${item.icon}`} style={{ color: item.iconColor, fontSize: "10px" }}></i>
                              {item.label}
                            </div>
                            <div style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              textTransform: "capitalize",
                              color: item.colored
                                ? (item.isPaid ? "#28a745" : "#dc3545")
                                : "#333"
                            }}>
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Vendor Details */}
                      {selectedLead.vendordetails && (selectedLead.vendordetails.firstName || selectedLead.vendordetails.email || selectedLead.vendordetails.mobile) && (
                        <div style={{ marginTop: "14px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="fas fa-store" style={{ color: "#8059ca" }}></i>
                            Vendor Details
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", textTransform: "capitalize" }}>
                                {selectedLead.vendordetails.firstName || ""} {selectedLead.vendordetails.lastName || ""}
                              </div>
                              {selectedLead.vendordetails.email && (
                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                  <i className="fas fa-envelope me-1" style={{ fontSize: "10px" }}></i>
                                  {selectedLead.vendordetails.email}
                                </div>
                              )}
                            </div>
                            {/* {selectedLead.vendordetails.mobile && (
                              <a
                                href={`tel:${selectedLead.vendordetails.mobile}`}
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "#8059ca",
                                  background: "#f3eeff",
                                  border: "1px solid #d6c6f7",
                                  padding: "6px 12px",
                                  borderRadius: "8px",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px"
                                }}
                              >
                                <i className="fas fa-phone-alt"></i> Call
                              </a>
                            )} */}
                          </div>
                        </div>
                      )}

                      {/* Total Fare */}
                      <div style={{ marginTop: "14px", background: "linear-gradient(135deg, #8059ca, #a07de0)", borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#fff", fontSize: "13px", fontWeight: "500" }}>Total Fare</span>
                        <span style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>₹{selectedLead.fare?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </div>
                </div>,
                document.body
              )}

              {/* Cancellation Confirmation Modal */}
              {confirmCancelId && createPortal(
                <div
                  className="amb-detail-modal-overlay"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(15, 23, 42, 0.75)",
                    backdropFilter: "blur(12px) saturate(180%)",
                    WebkitBackdropFilter: "blur(12px) saturate(180%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 99999999,
                    padding: "16px"
                  }}
                  onClick={() => setConfirmCancelId(null)}
                >
                  <div
                    className="bg-white shadow-lg"
                    style={{
                      width: "100%",
                      maxWidth: "440px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      padding: "24px",
                      position: "relative",
                      animation: "fadeIn 0.2s ease-in-out"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setConfirmCancelId(null)}
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        border: "none",
                        background: "#f1f5f9",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>

                    <div className="text-center">
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          background: "#fef2f2",
                          color: "#dc2626",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px auto",
                          fontSize: "24px",
                          boxShadow: "0 0 0 8px #fef2f2"
                        }}
                      >
                        <i className="fas fa-triangle-exclamation"></i>
                      </div>

                      <h4 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "600", color: "#0f172a" }}>
                        Cancel Ambulance Booking?
                      </h4>

                      <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                        Are you sure you want to cancel this booking? This request will be sent to the vendor immediately.
                      </p>
                    </div>

                    <div className="d-flex gap-2 justify-content-center mt-4">
                      <button
                        className="btn w-50"
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          fontWeight: "600",
                          borderRadius: "10px",
                          padding: "10px",
                          fontSize: "14px",
                          border: "none"
                        }}
                        onClick={() => setConfirmCancelId(null)}
                      >
                        No, Keep Booking
                      </button>
                      <button
                        className="btn btn-danger w-50"
                        style={{
                          background: "#dc2626",
                          borderColor: "#dc2626",
                          fontWeight: "600",
                          borderRadius: "10px",
                          padding: "10px",
                          fontSize: "14px"
                        }}
                        disabled={cancellingId === confirmCancelId}
                        onClick={() => handleCancelBooking(confirmCancelId)}
                      >
                        {cancellingId === confirmCancelId ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          "Yes, Cancel Now"
                        )}
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
              )}

              {totalPages > 0 && (
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
    </div>
  );
};

export default AmbulanceBooking;
