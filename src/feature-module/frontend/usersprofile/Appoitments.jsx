import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosUserInstance, imgUrl } from "../../../Apiservice";
import { useMediaQuery } from "react-responsive";
import { Modal } from "react-bootstrap";

const Appoitments = ({ HomeNavigate, BackButton }) => {
  const [leadslist, setleadslist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const ordersPerPage = 10;
  const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  const getLeadsData = async (page = 1) => {
    const token = localStorage.getItem("medicomparestoken");
    setLoading(true);

    try {
      const res = await axiosUserInstance.get(
        `appointment/list?page=${page}&limit=${ordersPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setleadslist(res?.data?.data?.leads || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
      setCurrentPage(res?.data?.data?.pagination?.page || 1);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLeadsData(currentPage);
  }, [currentPage]);

  const filteredOrders = leadslist.filter((leads) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    const name = (leads.name || "").toLowerCase();
    const phone = (leads.phone || "").toString().toLowerCase();
    return name.includes(searchLower) || phone.includes(searchLower);
  });

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

  const columnConfig = {
    date: filteredOrders.some((l) => l.createdAt),
    name: filteredOrders.some((l) => l.name),
    phone: filteredOrders.some((l) => l.phone),
    relation: filteredOrders.some((l) => l.relation),
    email: filteredOrders.some((l) => l.email),
    age: filteredOrders.some((l) => l.age !== null && l.age !== undefined),
    gender: filteredOrders.some((l) => l.gender),
    price: filteredOrders.some((l) => l.productdetails?.price || l.productdetails?.discountprice),
    serviceType: filteredOrders.some((l) => l.serviceType),
    // leadSource: filteredOrders.some((l) => l.leadSource),
    status: filteredOrders.some((l) => l.status),
    city: filteredOrders.some((l) => l.city),
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
                        className="fa-solid fa-users"
                        style={{ color: "#8059ca", flexShrink: 0 }}
                      ></i>
                      <span>Appoitments</span>
                    </h3>
                    <p
                      style={{
                        color: "#666",
                        fontSize: isMobile ? "13px" : "14px",
                        marginTop: "5px",
                        marginBottom: "0",
                      }}
                    >
                      Manage and track all your potential Appoitments
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
                      placeholder="Search by Name..."
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
                        {columnConfig.date && <th>Date</th>}
                        {columnConfig.name && <th>Name</th>}
                        {columnConfig.phone && <th>Phone</th>}
                        {columnConfig.relation && <th>Relation</th>}
                        {columnConfig.email && <th>Email</th>}
                        {columnConfig.age && <th>Age</th>}
                        {columnConfig.gender && <th>Gender</th>}
                        {columnConfig.price && <th>Price</th>}
                        {columnConfig.serviceType && <th>Service Type</th>}
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
                        filteredOrders.map((lead) => (
                          <tr key={lead._id}>
                            {columnConfig.date && (
                              <td>
                                {new Date(lead.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                            )}
                            {columnConfig.name && <td style={{ textTransform: "capitalize" }}>{lead.name}</td>}
                            {columnConfig.phone && <td>{lead.phone}</td>}
                            {columnConfig.relation && <td>{lead.relation}</td>}
                            {columnConfig.email && <td>{lead.email}</td>}
                            {columnConfig.age && <td>{lead.age}</td>}
                            {columnConfig.gender && <td>{lead.gender}</td>}
                            {columnConfig.price && (
                              <td>
                                {lead.productdetails?.discountprice ? (
                                  <span style={{ fontWeight: "600" }}>
                                    ₹{lead.productdetails.discountprice.toLocaleString()}
                                  </span>
                                ) : (
                                  <span style={{ fontWeight: "600" }}>
                                    ₹{lead.productdetails?.price?.toLocaleString() || "N/A"}
                                  </span>
                                )}
                              </td>
                            )}
                            {columnConfig.serviceType && (
                              <td style={{ textTransform: "capitalize" }}>
                                <span style={{
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  backgroundColor: "#e0f2fe",
                                  color: "#0369a1",
                                  display: "inline-block"
                                }}>
                                  {lead.serviceType}
                                </span>
                              </td>
                            )}
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-light"
                                title="View Lead"
                                onClick={() => viewLead(lead)}
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

      {/* Lead Details Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        size="lg"
        className="lead-modal"
        style={{
          display: "block",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 99999999999,
        }}
      >
        <Modal.Body>
          {selectedLead && (
            <div>
              <div className="section">
                <h5
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Personal Information</span>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    style={{ fontSize: "12px" }}
                  ></button>
                </h5>
                <div className="row g-3">
                  {selectedLead?.name && (
                    <div className="col-md-6 col-12">
                      <div
                        className="field"
                        style={{ textTransform: "capitalize" }}
                      >
                        <i className="fas fa-user"></i>
                        <b>Name:</b> {selectedLead.name}
                      </div>
                    </div>
                  )}

                  {selectedLead?.phone && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-phone"></i>
                        <b>Phone:</b> {selectedLead.phone}
                      </div>
                    </div>
                  )}

                  {selectedLead?.email && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-envelope"></i>
                        <b>Email:</b> {selectedLead.email}
                      </div>
                    </div>
                  )}

                  {selectedLead?.age && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-calendar"></i>
                        <b>Age:</b> {selectedLead.age}
                      </div>
                    </div>
                  )}

                  {selectedLead?.gender && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-venus-mars"></i>
                        <b>Gender:</b> {selectedLead.gender}
                      </div>
                    </div>
                  )}

                  {selectedLead?.relation && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-users"></i>
                        <b>Relation:</b> {selectedLead.relation}
                      </div>
                    </div>
                  )}

                  {selectedLead?.address && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-home"></i>
                        <b>Address:</b> {selectedLead.address}
                      </div>
                    </div>
                  )}

                  {selectedLead?.policyNumber && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-file-alt"></i>
                        <b>Policy Number:</b> {selectedLead.policyNumber}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="section">
                <h5>
                  <i className="fas fa-clipboard-list"></i> Service Details
                </h5>
                <div className="row g-3">
                  {selectedLead?.serviceType && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-briefcase"></i>
                        <b>Service:</b> {capitalize(selectedLead.serviceType)}
                      </div>
                    </div>
                  )}

                  {selectedLead?.productdetails?.tabletdetails?.[0]?.name && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-box"></i>
                        <b>Product:</b>{" "}
                        {selectedLead.productdetails.tabletdetails[0].name}
                      </div>
                    </div>
                  )}

                  {selectedLead?.leadStage && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-flag"></i>
                        <b>Status:</b> {capitalize(selectedLead.leadStage)}
                      </div>
                    </div>
                  )}

                  {selectedLead?.vendorassined && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-user-check"></i>
                        <b>Vendor:</b> {capitalize(selectedLead.vendorassined)}
                      </div>
                    </div>
                  )}

                  {selectedLead?.leadSource && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-info-circle"></i>
                        <b>Lead Source:</b>{" "}
                        {capitalize(selectedLead.leadSource)}
                      </div>
                    </div>
                  )}

                  {selectedLead?.leadType && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-tag"></i>
                        <b>Lead Type:</b> {capitalize(selectedLead.leadType)}
                      </div>
                    </div>
                  )}

                  {selectedLead?.formType && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-file-contract"></i>
                        <b>Form Type:</b> {capitalize(selectedLead.formType)}
                      </div>
                    </div>
                  )}

                  {selectedLead?.vendorPermission && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-user-shield"></i>
                        <b>Vendor Permission:</b> {capitalize(selectedLead.vendorPermission)}
                      </div>
                    </div>
                  )}

                  {selectedLead?.status && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-info-circle"></i>
                        <b>Status:</b> {capitalize(selectedLead.status)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="section">
                {selectedLead?.city && (
                  <h5>
                    <i className="fas fa-map-marker-alt"></i> Location
                  </h5>
                )}

                <div className="row g-3">
                  {selectedLead?.city && (
                    <div className="col-md-6 col-12">
                      <div className="field">
                        <i className="fas fa-building"></i>
                        <b>City:</b> {selectedLead.city}
                      </div>
                    </div>
                  )}

                 
                </div>
              </div>

              {(selectedLead?.problemDescription ||
                selectedLead?.preferredTimeline) && (
                <div className="section">
                  <h5>
                    <i className="fas fa-info-square"></i> Additional
                    Information
                  </h5>

                  <div className="row g-3">
                    {selectedLead?.problemDescription && (
                      <div className="col-12">
                        <div className="field">
                          <i className="fas fa-comment-dots"></i>
                          <b>Problem Description:</b>{" "}
                          {selectedLead.problemDescription}
                        </div>
                      </div>
                    )}

                    {selectedLead?.preferredTimeline && (
                      <div className="col-12">
                        <div className="field">
                          <i className="fas fa-hourglass-half"></i>
                          <b>Preferred Timeline:</b>{" "}
                          {selectedLead.preferredTimeline}
                        </div>
                      </div>
                    )}

                    {selectedLead?.diagnosticType && (
                      <div className="col-md-6 col-12">
                        <div className="field">
                          <i className="fas fa-stethoscope"></i>
                          <b>Diagnostic Type:</b> {capitalize(selectedLead.diagnosticType)}
                        </div>
                      </div>
                    )}

                    {selectedLead?.bodyPart && (
                      <div className="col-md-6 col-12">
                        <div className="field">
                          <i className="fas fa-user-injured"></i>
                          <b>Body Part:</b> {capitalize(selectedLead.bodyPart)}
                        </div>
                      </div>
                    )}

                    {selectedLead?.surgeryType && (
                      <div className="col-md-6 col-12">
                        <div className="field">
                          <i className="fas fa-procedures"></i>
                          <b>Surgery Type:</b> {capitalize(selectedLead.surgeryType)}
                        </div>
                      </div>
                    )}

                    {selectedLead?.testName && (
                      <div className="col-md-6 col-12">
                        <div className="field">
                          <i className="fas fa-vial"></i>
                          <b>Test Name:</b> {capitalize(selectedLead.testName)}
                        </div>
                      </div>
                    )}

                    {selectedLead?.hasInsurancePolicy !== null && (
                      <div className="col-md-6 col-12">
                        <div className="field">
                          <i className="fas fa-shield-alt"></i>
                          <b>Has Insurance:</b> {selectedLead.hasInsurancePolicy ? "Yes" : "No"}
                        </div>
                      </div>
                    )}

                    {selectedLead?.startDate && (
                      <div className="col-md-6 col-12">
                        <div className="field">
                          <i className="fas fa-calendar-check"></i>
                          <b>Start Date:</b>{" "}
                          {new Date(selectedLead.startDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    )}

                    {selectedLead?.endDate && (
                      <div className="col-md-6 col-12">
                        <div className="field">
                          <i className="fas fa-calendar-times"></i>
                          <b>End Date:</b>{" "}
                          {new Date(selectedLead.endDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    )}

                    {selectedLead?.totalDays && (
                      <div className="col-md-6 col-12">
                        <div className="field">
                          <i className="fas fa-calendar-alt"></i>
                          <b>Total Days:</b> {selectedLead.totalDays}
                        </div>
                      </div>
                    )}

                    {(() => {
                      return selectedLead?.productdetails?.tabletdetails?.[0]?.shiftType;
                    })() && (
                      <div className="col-md-6 col-12">
                        <div className="field">
                          <i className="fas fa-business-time"></i>
                          <b>Shift Type:</b> {selectedLead.productdetails.tabletdetails[0].shiftType.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

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
      `}</style>
    </div>
  );
};

export default Appoitments;
