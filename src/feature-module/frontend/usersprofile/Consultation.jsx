import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosUserInstance, imgUrl } from "../../../Apiservice";
import { useMediaQuery } from "react-responsive";

const Consultation = ({ HomeNavigate, BackButton }) => {
  const [leadslist, setleadslist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const ordersPerPage = 10;

  const getLeadsData = async (page = 1, search = "") => {
    const token = localStorage.getItem("medicomparestoken");
    setLoading(true);

    try {
      const res = await axiosUserInstance.get(
        `consult-form/list?page=${page}&limit=${ordersPerPage}&search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setleadslist(res?.data?.data?.list || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
      setCurrentPage(res?.data?.data?.pagination?.page || 1);
    } catch (err) {
      // Error fetching leads
    } finally {
      setLoading(false);
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

  const columnConfig = {
    date: filteredOrders.some((l) => l.createdAt),
    name: filteredOrders.some((l) => l.name),
    phone: filteredOrders.some((l) => l.phone),
    email: filteredOrders.some((l) => l.email),
    age: filteredOrders.some((l) => l.age !== null && l.age !== undefined),
    city: filteredOrders.some((l) => l.city),
    doctor: filteredOrders.some((l) => l.doctor),
    status: filteredOrders.some((l) => l.status),
    preferredTime: filteredOrders.some((l) => l.preferredTime),
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
                      <span>Consultation</span>
                    </h3>
                    <p
                      style={{
                        color: "#666",
                        fontSize: isMobile ? "13px" : "14px",
                        marginTop: "5px",
                        marginBottom: "0",
                      }}
                    >
                      Manage and track all your potential Consultation
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
                        {columnConfig.email && <th>Email</th>}
                        {columnConfig.age && <th>Age</th>}
                        {columnConfig.city && <th>City</th>}
                        {columnConfig.doctor && <th>Doctor</th>}
                        {columnConfig.preferredTime && <th>Preferred Time</th>}
                        {columnConfig.status && <th>Status</th>}
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
                            {columnConfig.email && <td>{lead.email || "-"}</td>}
                            {columnConfig.age && <td>{lead.age}</td>}
                            {columnConfig.city && <td>{lead.city}</td>}
                            {columnConfig.doctor && (
                              <td style={{ maxWidth: "200px", overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  {lead.doctor?.profileImage?.[0] && (
                                    <img
                                      src={imgUrl + lead.doctor.profileImage[0]}
                                      alt={lead.doctor.name}
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                  <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                                    <div style={{ fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.doctor?.name}</div>
                                    <div style={{ fontSize: "11px", color: "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {lead.doctor?.position}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            )}
                            {columnConfig.preferredTime && (
                              <td>
                                <span
                                  style={{
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    backgroundColor: "#e0f2fe",
                                    color: "#0369a1",
                                    display: "inline-block",
                                  }}
                                >
                                  {lead.preferredTime === "withinMonth"
                                    ? "Within Month"
                                    : lead.preferredTime === "withinWeek"
                                      ? "Within Week"
                                      : lead.preferredTime
                                  }
                                </span>
                              </td>
                            )}
                            {columnConfig.status && (
                              <td>
                                <span
                                  style={{
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    display: "inline-block",
                                    backgroundColor:
                                      lead.status === "pending"
                                        ? "#fff3cd"
                                        : lead.status === "confirmed"
                                          ? "#d4edda"
                                          : lead.status === "completed"
                                            ? "#cce5ff"
                                            : "#f8d7da",
                                    color:
                                      lead.status === "pending"
                                        ? "#856404"
                                        : lead.status === "confirmed"
                                          ? "#155724"
                                          : lead.status === "completed"
                                            ? "#004085"
                                            : "#721c24",
                                  }}
                                >
                                  {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
                                </span>
                              </td>
                            )}
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
    </div>
  );
};

export default Consultation;
