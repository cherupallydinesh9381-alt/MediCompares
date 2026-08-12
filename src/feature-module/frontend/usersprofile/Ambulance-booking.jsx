import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

const AmbulanceBooking = ({ HomeNavigate, BackButton }) => {
  const [leadslist, setleadslist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const ordersPerPage = 4;

  const getLeadsData = async (page = 1) => {
    const token = localStorage.getItem("medicomparestoken");
    setLoading(true);

    try {
      const res = await axiosUserInstance.get(
        `ride/list?page=${page}&limit=${ordersPerPage}`,
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
    getLeadsData(currentPage);
  }, [currentPage]);

  const filteredOrders = leadslist.filter((lead) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    const bookingId = (lead.bookingId || "").toLowerCase();
    const pickupAddress = (lead.pickupLocation?.address || "").toLowerCase();
    const dropoffAddress = (lead.dropoffLocation?.address || "").toLowerCase();
    const serviceName = (
      lead.productdetails?.tabletdetails?.name ||
      lead.productdetails?.variantcurrentDetails?.productname ||
      lead.productdetails?.packagedetails?.name ||
      ""
    ).toLowerCase();
    return (
      bookingId.includes(searchLower) ||
      pickupAddress.includes(searchLower) ||
      dropoffAddress.includes(searchLower) ||
      serviceName.includes(searchLower)
    );
  });

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
                        className="fa-solid fa-users"
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
                      Manage and track all your potential Ambulance Booking
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
                      placeholder="Search by Booking ID, Address, Service..."
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

            <div className="container py-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((lead) => {
                  const orderStatus = lead.status?.toLowerCase() || "";
                  const isDelivered = orderStatus === "completed" || orderStatus === "delivered";
                  const isCancelled = orderStatus === "cancelled" || orderStatus === "canceled";
                  const isPaid = lead.paymentStatus === "paid";
                  
                  return (
                    <div key={lead._id} className="order-card">
                      <div className="order-header">
                        <div>
                          <div className="order-id">#{lead.bookingId}</div>
                          <div className="order-date">
                            Booked on {new Date(lead.createdAt).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </div>
                        </div>
                        <span className={`status-badge ${
                          isDelivered ? "delivered" : 
                          isCancelled ? "cancelled" : 
                          "processing"
                        }`}>
                          {lead.status ? lead.status.toUpperCase() : "N/A"}
                        </span>
                      </div>

                      <div className="row align-items-center">
                        {/* Image */}
                        <div className="col-md-2 col-12 text-center mb-3 mb-md-0">
                         
                            <img 
                              src={getImageUrl(lead.productdetails?.tabletdetails?.files?.[0])}
                              className="product-img"
                              alt="Ambulance"
                              onError={(e) => {
                                e.currentTarget.src = "/assets/default.png";
                              }}
                            />
                          
                        </div>

                        {/* Details */}
                        <div className="col-md-8 col-12">
                          <div className="product-title" style={{cursor:"pointer"}} onClick={() => {}}>
                            {lead.productdetails?.tabletdetails?.name ||
                             lead.productdetails?.variantcurrentDetails?.productname ||
                             lead.productdetails?.packagedetails?.name ||
                             "Ambulance Service"}
                          </div>

                          <div className="row">
                            <div className="col-6">
                              <div className="info-label">Pickup Location :</div>
                              <div className="info-value">
                                {lead.pickupLocation?.address?.substring(0, 35) + "..." || "N/A"}
                              </div>

                              <div className="info-label">Drop-off Location :</div>
                              <div className="info-value">
                                {lead.dropoffLocation?.address?.substring(0, 35) + "..." || "N/A"}
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="info-label">Payment Status :</div>
                              <div className="info-value">
                                <span style={{
                                  color: isPaid ? "#28a745" : "#dc3545",
                                  fontWeight: 600
                                }}>
                                  {lead.paymentStatus ? lead.paymentStatus.toUpperCase() : "N/A"}
                                </span>
                              </div>
                               <div className="info-label">Service Type</div>
                          <div className="info-value">
                            {lead.productdetails?.tabletdetails?.name ||
                             lead.productdetails?.variantcurrentDetails?.productname ||
                             lead.productdetails?.packagedetails?.name ||
                             "Standard"}
                          </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="col-md-2 col-12 payment-box">
                          <div className="info-label">Total Fare</div>
                          <div className="amount">₹{lead.fare?.toLocaleString() || "0"}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-5">
                  <div className="empty-state">
                    <i className="fa-solid fa-truck-medical fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No ambulance bookings found</h5>
                    <p className="text-muted">You haven't booked any ambulance services yet.</p>
                  </div>
                </div>
              )}
            </div>

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
                              className={`page-link ${
                                currentPage === page ? "active" : ""
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
