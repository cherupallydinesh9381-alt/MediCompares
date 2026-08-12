import React, { useState, useEffect, useRef } from "react";

import { axiosUserInstance, imgUrl } from "../../../Apiservice";

import { useMediaQuery } from "react-responsive";


const DoctorList = ({ HomeNavigate, BackButton }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const [showModal, setShowModal] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const [familyMembers, setFamilyMembers] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [membersPerPage] = useState(3);

  const [totalMembers, setTotalMembers] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    qualification: "",
    licenseNumber: "",
    consultationFee: "",
    availability: "",
  });

  const token = localStorage.getItem("medicomparestoken");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    },
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await axiosUserInstance.get(
        "family-doctor/list",
        headers,
      );

      const members = response.data.data?.familyDoctors || [];

      setFamilyMembers(members);

      setTotalMembers(members.length);

      setCurrentPage(1);
    } catch (error) {
      setFamilyMembers([]);
      setTotalMembers(0);
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const indexOfLastMember = currentPage * membersPerPage;

  const indexOfFirstMember = indexOfLastMember - membersPerPage;

  const currentMembers = familyMembers.slice(
    indexOfFirstMember,
    indexOfLastMember,
  );

  const totalPages = Math.ceil(totalMembers / membersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this family member?")) {
      try {
        await axiosUserInstance.post(`family-doctor/delete/${id}`, {}, headers);

        fetchFamilyMembers();
      } catch (error) {
        // Error deleting family member
      }
    }
  };

  const handleEdit = (member) => {
    setIsEditMode(true);

    setEditingId(member._id);

    setFormData({
      name: member.name,
      email: member.email || "",
      phone: member.phone || "",
      specialization: member.specialization || "",
      experience: member.experience || "",
      qualification: member.qualification || "",
      licenseNumber: member.licenseNumber || "",
      consultationFee: member.consultationFee || "",
      availability: member.availability || "",
    });

    setShowModal(true);
  };

  const handleAdd = () => {
    setIsEditMode(false);

    setEditingId(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      experience: "",
      qualification: "",
      licenseNumber: "",
      consultationFee: "",
      availability: "",
    });

    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: null,
      phone: null,
      specialization: null,
      experience: null,
      //  experience: formData.experience,
      qualification: null,
      licenseNumber: null,
      consultationFee: null,
      availability: null,
    };

    try {
      if (isEditMode && editingId) {
        await axiosUserInstance.post(
          `family-doctor/update/${editingId}`,
          payload,
          headers,
        );
      } else {
        await axiosUserInstance.post("family-doctor/create", payload, headers);
      }

      fetchFamilyMembers();

      setShowModal(false);

      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: "",
        qualification: "",
        licenseNumber: "",
        consultationFee: "",
        availability: "",
      });
      
    } catch (error) {
    }
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

                      <span>Manage Doctors</span>
                    </h3>

                    <p
                      style={{
                        color: "#666",

                        fontSize: isMobile ? "13px" : "14px",

                        marginTop: "5px",

                        marginBottom: "0",
                      }}
                    >
                      Manage and track all your doctors' details.
                    </p>
                  </div>

                  <div className="text-center mt-4">
                    <button className="btn btn-primary" onClick={handleAdd}>
                      Add New Doctor
                    </button>
                  </div>
                </div>
              </div>

              <div className="container my-4">
                {familyMembers && familyMembers.length > 0 ? (
                  <div className="custom-table">
                    <div className="table-responsive">
                      <table className="table table-center mb-0">
                        <thead>
                          <tr>
                            <th>Name</th>
                            {/* <th>Email</th>
                            <th>Phone</th>
                            <th>Experience</th> */}
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMembers.map((member) => (
                            <tr key={member._id}>
                              <td>{member.name}</td>
                            {/* <td>{member.email || '-'}</td>
                              <td>{member.phone || '-'}</td>
                              <td>{member.availability || '-'}</td>  */}
                              <td>
                                <div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(member)}>
                                    <i className="fa-solid fa-edit"></i>
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(member._id)}>
                                    <i className="fa-solid fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-3">
                        <nav aria-label="Page navigation">
                          <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                            </li>
                            {[...Array(totalPages)].map((_, index) => (
                              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => paginate(index + 1)}>{index + 1}</button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="fa-solid fa-user-doctor fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No Doctors Found</h4>
                    <p className="text-muted">Start by adding your first doctor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    
      {showModal && (
        <div className="modal show"  style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 999999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.4s ease-in-out",
          }}>
          <div className="modal-dialog" style={{ width: "900px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title"  style={{
                    fontWeight: 600,

                    fontSize: "18px",

                    margin: 0,
                  }}>
                  {isEditMode ? "Edit Doctor" : "Add Doctor"}
                </h6>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label htmlFor="name" className="form-label">Doctor Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        placeholder="Enter Doctor Name"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                   
                  </div>
                  
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    {isEditMode ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;
