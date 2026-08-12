import React, { useState, useEffect } from "react";
import { axiosCommonInstance } from "../../../Apiservice";
import LocationModal from "../pharmacy/LocationModal";
import { useMediaQuery } from "react-responsive";
import "./Addresses.css";
import toast from "react-hot-toast";

const Address = ({ HomeNavigate, BackButton }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowLocationModal(true);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowLocationModal(true);
  };

  const handleCloseModal = () => {
    setShowLocationModal(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = async () => {
    setShowLocationModal(false);
    setEditingAddress(null);
    await loadSavedAddresses();
    setCurrentPage(1);
  };

  const loadSavedAddresses = async () => {
    try {
      const token = localStorage.getItem("medicomparestoken");
      if (!token) return;

      const response = await axiosCommonInstance.get("address/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const addresses = response.data?.data?.address || [];

      setSavedAddresses(addresses);
    } catch (error) {
      toast.error(error)
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      const token = localStorage.getItem("medicomparestoken");
      const response = await axiosCommonInstance.post(
        `address/delete/${addressId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 200) {
        setSavedAddresses((prev) =>
          prev.filter((addr) => addr._id !== addressId),
        );
        const totalPages = Math.ceil((savedAddresses.length - 1) / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      }
    } catch (error) {

    }
  };

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const totalPages = Math.ceil(savedAddresses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAddresses = savedAddresses.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "home":
        return "fa-solid fa-house";
      case "work":
        return "fa-solid fa-building";
      case "office":
        return "fa-solid fa-briefcase";
      default:
        return "fa-solid fa-location-dot";
    }
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
                marginBottom: "20px",
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
                    maxWidth: isMobile ? "100%" : "calc(100% - 200px)",
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
                      flexWrap: "wrap",
                    }}
                  >
                    <i
                      className="fa-solid fa-map-location-dot"
                      style={{ color: "#8059ca", flexShrink: 0 }}
                    ></i>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: "1",
                        minWidth: 0,
                      }}
                    >
                      My Address
                    </span>
                  </h3>
                  <p
                    style={{
                      color: "#666",
                      fontSize: isMobile ? "13px" : "14px",
                      marginTop: "5px",
                      marginBottom: "0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Manage your saved delivery Address
                  </p>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {savedAddresses.length > 0 ? (
                <>
                  <div className="col-lg-4 col-md-6 col-12">
                    <div
                      className="add-card border"
                      onClick={() => handleAddAddress()}
                    >
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(13, 110, 253, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <i
                          className="fa-solid fa-plus"
                          style={{ fontSize: "24px", color: "#0d6efd" }}
                        ></i>
                      </div>
                      <h6 style={{ fontWeight: 600 }}>Add New Address</h6>
                    </div>
                  </div>
                  {currentAddresses.map((addr) => (
                    <div key={addr._id} className="col-lg-4 col-md-6 col-12 ">
                      <div className="address-card border">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="address-title">
                            <i
                              className={`${getAddressIcon(addr.addressType)} me-2`}
                            ></i>{" "}
                            {addr.addressType || "Address"}
                          </div>
                          <div className="action-icons">
                            <i
                              className="fa-solid fa-pen"
                              onClick={() => handleEditAddress(addr)}
                            ></i>
                            <i
                              className="fa-solid fa-trash"
                              onClick={() => handleDeleteAddress(addr._id)}
                            ></i>
                          </div>
                        </div>

                        <div className="address-name">
                          {addr.name || "User"}
                        </div>

                        <div className="address-text mt-2">
                          {addr.houseNo ? `${addr.houseNo}, ` : ""}
                          {addr.street ? `${addr.street}, ` : ""}
                          {addr.area ? `${addr.area}, ` : ""}
                          {addr.city ? `${addr.city}, ` : ""}
                          {addr.state ? `${addr.state} ` : ""}
                          {addr.pincode ? `- ${addr.pincode}` : ""}
                          <br />
                          {addr.location?.address && (
                            <small className="text-muted">
                              ({addr.location.address})
                            </small>
                          )}
                        </div>

                        <div className="mt-3">
                          <a
                            href={
                              addr.location?.coordinates?.length === 2 &&
                                addr.location.coordinates[0] &&
                                addr.location.coordinates[1]
                                ? `https://www.google.com/maps/search/?api=1&query=${addr.location.coordinates[1]},${addr.location.coordinates[0]}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  addr.location?.address ||
                                  `${addr.houseNo || ""} ${addr.street || ""} ${addr.area || ""} ${addr.city || ""} ${addr.state || ""} ${addr.pincode || ""}`.trim(),
                                )}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="map-link"
                          >
                            <i className="fa-solid fa-location-dot me-1"></i>{" "}
                            View in Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="col-12">
                  <div className="col-lg-4 col-md-6 col-12 mx-auto">
                    <div
                      className="add-card"
                      onClick={() => handleAddAddress()}
                    >
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(13, 110, 253, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <i
                          className="fa-solid fa-plus"
                          style={{ fontSize: "24px", color: "#0d6efd" }}
                        ></i>
                      </div>
                      <h6 style={{ fontWeight: 600 }}>Add New Address</h6>
                      <p className="text-muted text-center small mt-2">
                        You haven't saved any addresses yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {savedAddresses.length > 6 && totalPages > 1 && (
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


      {showLocationModal && (
        <LocationModal
          showModal={showLocationModal}
          onClose={handleCloseModal}
          onSaveAddress={handleSaveAddress}
          editingAddress={editingAddress}
        />
      )}
    </div>
  );
};

export default Address;
