import React, { useState, useEffect, useRef } from "react";
import { axiosCommonInstance, axiosUserInstance } from "../../../../Apiservice";
import { useMediaQuery } from "react-responsive";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { DatePicker } from "rsuite";
import Select from "react-select";
import toast from "react-hot-toast";
const libraries = ["places"];

const Consultation = ({ HomeNavigate, BackButton }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(3);
  const [totalMembers, setTotalMembers] = useState(0);
  const [formData, setFormData] = useState({
    name: "",

    gender: "",

    age: "",

    dateOfBirth: null,

    mobile: "",

    location: "",

    referedByDoctor: "",

    relationship: "",
  });

  const [ageError, setAgeError] = useState("");

  const [locationData, setLocationData] = useState({
    address: "",

    lat: null,

    lng: null,
  });

  const autocompleteRef = useRef(null);

  const GOOGLE_MAPS_API_KEY =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    "AIzaSyBW_ML0ppoU2o_tsOmT5eMveCwCFP3AXHU";

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,

    libraries: libraries,
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
        "family-member/list",
        headers,
      );

      const members = response.data.data || [];

      setFamilyMembers(members);

      setTotalMembers(members.length);

      setCurrentPage(1);
    } catch (error) {
      setFamilyMembers([]);
      setTotalMembers(0);
    }
  };

  const fetchDoctors = async (searchTerm = "") => {
    try {
      setIsLoadingDoctors(true);

      const token = localStorage.getItem("medicomparestoken");
      if (!token) {
        setDoctors([]);
        setAllDoctors([]);
        setFilteredDoctors([]);
        setIsLoadingDoctors(false);
        return;
      }

      const url = searchTerm
        ? `doctors/list?search=${encodeURIComponent(searchTerm)}`
        : "doctors/list";

      const response = await axiosCommonInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        const doctorsData =
          response.data?.data?.doctors ||
          response.data?.data?.familyDoctors ||
          [];

        if (searchTerm) {
          setFilteredDoctors(doctorsData);
        } else {
          setDoctors(doctorsData);
          setAllDoctors(doctorsData);
          setFilteredDoctors(doctorsData);
        }
      }
    } catch (error) {
      toast.error("Error fetching doctors:", error);
      setDoctors([]);
      setAllDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const handleDoctorSearch = (searchTerm) => {
    const searchStr =
      typeof searchTerm === "string" ? searchTerm : String(searchTerm || "");
    setDoctorSearchTerm(searchStr);

    if (searchStr.length >= 2) {
      fetchDoctors(searchStr);
    } else if (searchStr.length === 0) {
      if (allDoctors.length === 0) {
        fetchDoctors();
      } else {
        setFilteredDoctors(allDoctors);
      }
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
    fetchDoctors();
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
        await axiosUserInstance.post(`family-member/delete/${id}`, {}, headers);

        fetchFamilyMembers();
      } catch (error) { }
    }
  };

  const handleEdit = (member) => {
    setIsEditMode(true);

    setEditingId(member._id);

    setAgeError("");

    setFormData({
      name: member.name,

      gender: member.gender,

      age: calculateAge(member.dateOfBirth).toString(),

      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : null,

      mobile: member.mobile,

      location: member.address || "",

      referredByDoctor: member.referedByDoctor || "",

      relationship: member.relationship,
    });

    setLocationData({
      address: member.address || "",

      lat: member.location?.coordinates?.[1] || null,

      lng: member.location?.coordinates?.[0] || null,
    });

    setShowModal(true);
  };

  const handleAdd = () => {
    setIsEditMode(false);

    setEditingId(null);

    setAgeError("");

    setFormData({
      name: "",

      gender: "",

      age: "",

      dateOfBirth: null,

      mobile: "",

      location: "",

      referedByDoctor: "",

      relationship: "",
    });

    setLocationData({
      address: "",

      lat: null,

      lng: null,
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

  const handleDoctorSelect = (selectedOption) => {
    if (selectedOption && selectedOption.value) {
      const doctorId = String(selectedOption.value);

      setFormData((prev) => ({
        ...prev,
        referedByDoctor: doctorId,
      }));

      const selectedDoctor = filteredDoctors.find(
        (doctor) => String(doctor._id) === doctorId,
      );

      if (selectedDoctor) {
        setAllDoctors((prev) => {
          const exists = prev.find((doctor) => String(doctor._id) === doctorId);
          if (!exists) {
            return [...prev, selectedDoctor];
          }
          return prev;
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        referedByDoctor: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      if (age === 0) {
        if (window.toast) {
          window.toast.error("Age cannot be 0 years");
        } else {
          alert("Age cannot be 0 years");
        }
        return;
      }
    }

    const payload = {
      name: formData.name,

      mobile: formData.mobile,

      relationship: formData.relationship,

      dateOfBirth: formData.dateOfBirth,

      gender: formData.gender,

      referedByDoctor: formData.referedByDoctor || null,

      address: formData.location,

      location: {
        address: formData.location,

        coordinates:
          locationData.lat && locationData.lng
            ? [locationData.lng, locationData.lat]
            : [],
      },
    };

    try {
      if (isEditMode && editingId) {
        await axiosUserInstance.post(
          `family-member/update/${editingId}`,
          payload,
          headers,
        );
      } else {
        await axiosUserInstance.post("family-member/create", payload, headers);
      }

      fetchFamilyMembers();

      setShowModal(false);

      setAgeError("");

      setFormData({
        name: "",

        gender: "",

        age: "",

        dateOfBirth: null,

        mobile: "",

        location: "",

        referedByDoctor: "",

        relationship: "",
      });

      setLocationData({
        address: "",

        lat: null,

        lng: null,
      });
    } catch (error) { }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAgeError("");
  };

  const getDoctorNameById = (doctorId) => {
    if (!doctorId) return "N/A";
    const doctor = doctors.find((doc) => doc._id === doctorId);
    if (doctor) return doctor.name;

    const doctorByName = doctors.find((doc) => doc.name === doctorId);
    if (doctorByName) return doctorByName.name;

    const memberWithDoctor = familyMembers.find(
      (member) => member.doctorDetails && member.doctorDetails._id === doctorId,
    );

    if (memberWithDoctor && memberWithDoctor.doctorDetails) {
      return memberWithDoctor.doctorDetails.name;
    }
    return doctorId;
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();

    const birthDate = new Date(dateOfBirth);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleDateChange = (date) => {
    if (date) {
      const age = calculateAge(date);
      if (age === 0) {
        if (window.toast) {
          window.toast.error("Age cannot be 0 years");
        } else {
          alert("Age cannot be 0 years");
        }
        setAgeError("Age cannot be 0 years");
        return;
      } else {
        setAgeError("");
      }
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: date,
        age: age.toString(),
      }));
    } else {
      setAgeError("");
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: null,
        age: "",
      }));
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (place?.formatted_address) {
        const locationData = {
          address: place.formatted_address,
          lat: place.geometry?.location?.lat() || null,
          lng: place.geometry?.location?.lng() || null,
        };

        setLocationData(locationData);

        setFormData((prev) => ({
          ...prev,

          location: place.formatted_address,
        }));
      }
    }
  };

  const getRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
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

                      <span>Manage Family Members</span>
                    </h3>

                    <p
                      style={{
                        color: "#666",

                        fontSize: isMobile ? "13px" : "14px",

                        marginTop: "5px",

                        marginBottom: "0",
                      }}
                    >
                      Manage and track all your family members’ details.
                    </p>
                  </div>

                  <div className="text-center mt-4">
                    <button className="btn btn-primary" onClick={handleAdd}>
                      Add New Family Member
                    </button>
                  </div>
                </div>
              </div>

              <div className="container my-4">
                {familyMembers.length > 0 ? (
                  <>
                    {currentMembers.map((member) => (
                      <div className="family-card mb-3" key={member._id}>
                        <div className="d-flex gap-2">
                          <div
                            className="family-edit-btn"
                            onClick={() => handleEdit(member)}
                          >
                            <i className="fa-solid fa-pen" />
                          </div>

                          <div
                            className="family-delete-btn"
                            onClick={() => handleDelete(member._id)}
                          >
                            <i className="fa-solid fa-trash" />
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-3">
                          <div
                            className="gmail-letter"
                            style={{ backgroundColor: getRandomColor() }}
                          >
                            {member?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>

                          <div>
                            <div
                              className="family-name"
                              style={{ textTransform: "capitalize" }}
                            >
                              {member.name}
                            </div>

                            {/* <div className="family-uhid">
                              family-UHID :{" "}
                              <strong>{member.uhid || "N/A"}</strong>
                            </div> */}
                          </div>
                        </div>

                        <div className="row g-3">
                          <div className="col-md-3 col-6">
                            <div className="family-info-label">Gender</div>

                            <div className="family-info-value">
                              {member.gender}
                            </div>
                          </div>

                          <div className="col-md-3 col-6">
                            <div className="family-info-label">Age</div>

                            <div className="family-info-value">
                              {member.dateOfBirth
                                ? calculateAge(member.dateOfBirth)
                                : "N/A"}
                            </div>
                          </div>

                          <div className="col-md-3 col-6">
                            <div className="family-info-label">Mobile</div>

                            <div className="family-info-value">
                              {member.mobile}
                            </div>
                          </div>

                          <div className="col-md-3 col-6">
                            <div className="family-info-label">
                              Relationship
                            </div>

                            <div className="family-info-value">
                              {member.relationship}
                            </div>
                          </div>

                          <div className="col-md-6 col-12">
                            <div className="family-info-label">
                              Referred By Doctor
                            </div>

                            <div className="family-info-value">
                              {member.doctorDetails?.name
                                ? `${member.doctorDetails.name}${member.doctorDetails["AreaOfPractice "] ? ` (${member.doctorDetails["AreaOfPractice "]})` : ""}${member.doctorDetails.place ? `, ${member.doctorDetails.place}` : ""}`
                                : getDoctorNameById(member.referedByDoctor)}
                            </div>
                          </div>

                          <div className="col-md-6 col-12">
                            <div className="family-info-label">Location</div>

                            <div className="family-info-value">
                              {member.address || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {totalPages > 1 && (
                      <div className="pagination dashboard-pagination mt-4">
                        <ul className="d-flex justify-content-center align-items-center gap-1">
                          <li>
                            <button
                              className="page-link"
                              onClick={() =>
                                paginate(Math.max(currentPage - 1, 1))
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
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                            ) {
                              return (
                                <li key={page}>
                                  <button
                                    className={`page-link ${currentPage === page ? "active" : ""
                                      }`}
                                    onClick={() => paginate(page)}
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
                                paginate(Math.min(currentPage + 1, totalPages))
                              }
                              disabled={currentPage === totalPages}
                            >
                              <i className="fa-solid fa-chevron-right" />
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      No family members found. Add your first family member!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}

      {showModal && (
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

            backgroundColor: "rgba(0, 0, 0, 0.8)",

            zIndex: 999999999,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            animation: "fadeIn 0.4s ease-in-out",
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-md"
            role="document"
          >
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ padding: "20px 24px 16px" }}
              >
                <h5
                  className="modal-title"
                  style={{
                    fontWeight: 600,

                    fontSize: "18px",

                    margin: 0,
                  }}
                >
                  {isEditMode ? "Edit Family Member" : "Add New Family Member"}
                </h5>

                <button
                  type="button"
                  style={{ border: "none" }}
                  className="close"
                  onClick={handleCloseModal}
                >
                  <span>&times;</span>
                </button>
              </div>

              <div
                className="modal-body"
                style={{
                  maxHeight: "500px",

                  overflowY: "auto",

                  padding: "16px 24px",
                }}
              >
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Name</label>

                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        placeholder="Enter Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div
                      className="col-md-6 mb-2"
                      style={{ position: "relative", zIndex: 9999999999 }}
                    >
                      <label className="form-label">Date of Birth</label>

                      <DatePicker
                        value={formData.dateOfBirth}
                        onChange={handleDateChange}
                        format="MM/dd/yyyy"
                        placeholder="Select Date of Birth"
                        style={{
                          width: "100%",
                          zIndex: 9999999999,
                        }}
                        shouldDisableDate={(date) => date && date > new Date()}
                        cleanable
                        editable={false}
                      />

                      {formData.dateOfBirth && (
                        <small className="mt-2 mb-0 text-primary d-block">
                          Age: {calculateAge(formData.dateOfBirth)} years
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Gender</label>

                      <select
                        className="form-select"
                        style={{ padding: "4px 10px" }}
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Gender</option>

                        <option value="Male">Male</option>

                        <option value="Female">Female</option>

                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-2">
                      <label className="form-label">Refered By Doctor</label>
                      <Select
                        name="referedByDoctor"
                        value={(() => {
                          if (!formData.referedByDoctor) return null;

                          const doctorId = String(formData.referedByDoctor);

                          let selectedDoctor = filteredDoctors.find(
                            (doctor) => String(doctor._id) === doctorId,
                          );

                          if (!selectedDoctor) {
                            selectedDoctor = allDoctors.find(
                              (doctor) => String(doctor._id) === doctorId,
                            );
                          }

                          if (
                            selectedDoctor &&
                            selectedDoctor.name &&
                            typeof selectedDoctor.name === "string"
                          ) {
                            return {
                              value: String(selectedDoctor._id),
                              label: `${selectedDoctor.name}${selectedDoctor["AreaOfPractice "] ? ` (${selectedDoctor["AreaOfPractice "]})` : ""}${selectedDoctor.place ? `, ${selectedDoctor.place}` : ""}`,
                            };
                          }

                          return null;
                        })()}
                        onChange={handleDoctorSelect}
                        onInputChange={handleDoctorSearch}
                        options={filteredDoctors
                          .filter(
                            (doctor) =>
                              doctor &&
                              doctor._id &&
                              doctor.name &&
                              typeof doctor.name === "string",
                          )
                          .map((doctor) => ({
                            value: String(doctor._id),
                            label: `${doctor.name}${doctor["AreaOfPractice "] ? ` (${doctor["AreaOfPractice "]})` : ""}${doctor.place ? `, ${doctor.place}` : ""}`,
                          }))}
                        placeholder={
                          isLoadingDoctors
                            ? "Loading doctors..."
                            : "Select a doctor..."
                        }
                        isClearable
                        isSearchable
                        isLoading={isLoadingDoctors}
                        className="basic-select"
                        classNamePrefix="select"
                        noOptionsMessage={() =>
                          isLoadingDoctors ? "Loading..." : "No doctors found"
                        }
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: state.isFocused ? "#2684ff" : "#ccc",
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #2684ff"
                              : "none",
                            "&:hover": {
                              borderColor: "#2684ff",
                            },
                            height: "38px",
                            minHeight: "38px",
                          }),
                          menu: (baseStyles) => ({
                            ...baseStyles,
                            zIndex: 9999,
                            maxHeight: "200px",
                            overflowY: "auto",
                          }),
                          menuList: (baseStyles) => ({
                            ...baseStyles,
                            maxHeight: "200px",
                            overflowY: "auto",
                          }),
                          option: (baseStyles) => ({
                            ...baseStyles,
                            padding: "8px 12px",
                            fontSize: "14px",
                          }),
                        }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Mobile</label>

                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Mobile Number"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-2">
                      <label className="form-label">relationship</label>

                      <select
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleInputChange}
                        required
                        className="form-select"
                        style={{ padding: "4px 10px" }}
                      >
                        <option value="">Select relationship</option>

                        <option value="Brother">Brother</option>

                        <option value="Cousin">Cousin</option>

                        <option value="Daughter">Daughter</option>

                        <option value="Father">Father</option>

                        <option value="Granddaughter">Granddaughter</option>

                        <option value="Grandfather">Grandfather</option>

                        <option value="Grandmother">Grandmother</option>

                        <option value="Grandson">Grandson</option>

                        <option value="Husband">Husband</option>

                        <option value="Me">Me</option>

                        <option value="Mother">Mother</option>

                        <option value="Other">Other</option>

                        <option value="Sister">Sister</option>

                        <option value="Son">Son</option>

                        <option value="Wife">Wife</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Location</label>

                      <div className="position-relative">
                        {isLoaded ? (
                          <Autocomplete
                            onLoad={(autocomplete) =>
                              (autocompleteRef.current = autocomplete)
                            }
                            onPlaceChanged={onPlaceChanged}
                            options={{
                              componentRestrictions: { country: "in" },

                              fields: [
                                "formatted_address",

                                "geometry",

                                "name",

                                "place_id",

                                "address_components",
                              ],

                              types: ["geocode"],
                            }}
                          >
                            <input
                              type="text"
                              className="form-control"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder="Search by city, state, pincode, or area..."
                              required
                              style={{ paddingLeft: "40px" }}
                              autoComplete="off"
                            />
                          </Autocomplete>
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="City / Location"
                            required
                            style={{ paddingLeft: "40px" }}
                            disabled
                          />
                        )}

                        <i className="fas fa-location position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <button type="submit" className="btn btn-primary">
                      {isEditMode ? "Update" : "Add"} Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`

  .pac-container {

 position: fixed !important;

  z-index: 99999999999999999 !important;

   top: 450px !important;

    max-height: 120px; 

    overflow-y: auto; 

    overflow-x: hidden;

  }

  @media (max-width: 768px) {

    .pac-container {

      top: 620px !important;       

      left: 12px !important;

      right: 12px !important;

      transform: none !important;

      width: auto !important;

      max-height: 180px;

    }

  }

  .pac-container::-webkit-scrollbar {

    width: 6px;

  }

  .pac-container::-webkit-scrollbar-thumb {

    background-color: #cfcfcf;

    border-radius: 6px;

  }

  .pac-container::-webkit-scrollbar-track {

    background: transparent;

  }

  .pac-item {

    padding: 10px 14px;

    cursor: pointer;

    font-size: 14px;

    white-space: nowrap;

  }



  .pac-item:hover {

    background-color: #f8f9fa;

  }



  .pac-item-query {

    font-weight: 500;

    color: #212529;

  }



  .pac-icon {

    margin-right: 8px;

  }



  .family-delete-btn {

    position: absolute;

    top: 15px;

    right: 15px;

    background: transparent;

    color: #dc3545;

    border: 1px solid #dc3545;

    padding: 4px 6px;

    border-radius: 4px;

    cursor: pointer;

    font-size: 12px;

    transition: all 0.3s ease;

    display: flex;

    align-items: center;

    justify-content: center;

    width: 28px;

    height: 28px;

  }



  .family-delete-btn:hover {

    background: #dc3545;

    color: white;

  }



  .family-edit-btn {

    position: absolute;

    top: 15px;

    right: 50px;

    background: transparent;

    color: #8059ca;

    border: 1px solid #8059ca;

    padding: 4px 6px;

    border-radius: 4px;

    cursor: pointer;

    font-size: 12px;

    transition: all 0.3s ease;

    display: flex;

    align-items: center;

    justify-content: center;

    width: 28px;

    height: 28px;

  }

.gmail-letter {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 28px;
  color: white;
}

  .family-edit-btn:hover {

    background: #8059ca;

    color: white;

  }

  /* rsuite DatePicker z-index fixes for modal - higher than modal z-index */
  .rs-picker {
    z-index: 9999999999 !important;
  }

  .rs-picker-popup {
    z-index: 9999999999 !important;
  }

  .rs-calendar {
    z-index: 9999999999 !important;
  }

  .rs-picker-date-menu {
    z-index: 9999999999 !important;
  }

  .rs-picker-dropdown {
    z-index: 9999999999 !important;
  }

`}</style>
    </div>
  );
};

export default Consultation;
