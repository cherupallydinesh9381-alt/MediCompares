import React, { useState, useEffect } from "react";
import { axiosUserInstance, imgUrl } from "../../../Apiservice";
import { toast } from "react-hot-toast";
import { useMediaQuery } from "react-responsive";
import { DatePicker } from 'rsuite';

const Profile = ({ HomeNavigate, BackButton }) => {
  const [profiles, setProfile] = useState({});
  const [originalProfiles, setOriginalProfiles] = useState({});
  const [file, setFile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dateOfBirthInput, setDateOfBirthInput] = useState(null);
  const [ageError, setAgeError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : -1;
  };

  const isAdult = (dateOfBirth) => {
    const age = calculateAge(dateOfBirth);
    return age >= 18;
  };

  const calculateApproximateDateFromAge = (age) => {
    if (!age) return "";
    const today = new Date();
    const birthYear = today.getFullYear() - parseInt(age);
    const approximateDate = new Date(birthYear, 0, 1);
    return approximateDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("medicomparestoken");
    try {
      const res = await axiosUserInstance.get("profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = res?.data?.data?.user || {};
      if (userData.files && userData.files.length > 0) {
        userData.image = userData.files[0];
      }
      setProfile(userData);
      setOriginalProfiles(JSON.parse(JSON.stringify(userData)));
      if (userData.age) {
        const approxDate = calculateApproximateDateFromAge(userData.age);
        setDateOfBirthInput(new Date(approxDate));
      } else {
        setDateOfBirthInput(null);
      }
    } catch (err) {
      // Profile fetch error
    }
  };

  const handleProfiles = (e) => {
    setProfile({ ...profiles, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setProfile({ ...profiles, phone: value });
  };

  const handleDateOfBirthChange = (date) => {
    setDateOfBirthInput(date);

    if (date) {
      const calculatedAge = calculateAge(date);

      if (calculatedAge < 18) {
        setAgeError("You must be at least 18 years old.");
        setProfile({ ...profiles, age: "" });
      } else {
        setAgeError("");
        setProfile({ ...profiles, age: calculatedAge.toString() });
      }
    } else {
      setAgeError("");
      setProfile({ ...profiles, age: "" });
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setOtpError("");
    const token = localStorage.getItem("medicomparestoken");
    try {
      const res = await axiosUserInstance.post("profile/verify-email/send-otp", { email: profiles.email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res?.data?.success) {
        toast.success("OTP sent to your email successfully!");
        setOtpSent(true);
        setShowOtpModal(true);
      } else {
        const errorMsg = res?.data?.message || "Failed to send OTP. Please try again.";
        setOtpError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Error sending OTP.";
      setOtpError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Please enter OTP.");
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError("");
    const token = localStorage.getItem("medicomparestoken");
    try {
      const res = await axiosUserInstance.post("profile/verify-email/verify-otp", { email: profiles.email, otp }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res?.data?.success) {
        toast.success("Email verified successfully!");
        setOtpSent(false);
        setShowOtpModal(false);
        setOtp("");
        fetchProfile(); // Refresh profile state to update verify status
      } else {
        const errorMsg = res?.data?.message || "Invalid OTP. Please try again.";
        setOtpError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Error verifying OTP.";
      setOtpError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (dateOfBirthInput && !isAdult(dateOfBirthInput)) {
      toast.error("You must be at least 18 years old.");
      return;
    }

    const token = localStorage.getItem("medicomparestoken");

    const dataArray = new FormData();
    dataArray.append("last_name", profiles.last_name);
    dataArray.append("first_name", profiles.first_name);
    dataArray.append("email", profiles.email);
    dataArray.append("phone", profiles.phone);
    dataArray.append("gender", profiles.gender);
    dataArray.append("age", profiles.age);
    dataArray.append("medical_conditions", profiles.medical_conditions);

    try {
      await axiosUserInstance.post("profile/update", dataArray, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile updated successfully!");
      const currentDateInput = dateOfBirthInput;
      await fetchProfile();
      if (currentDateInput) {
        setDateOfBirthInput(currentDateInput);
      }
      setIsEditMode(false);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleEditClick = () => {
    if (!dateOfBirthInput && profiles.age) {
      const approxDate = calculateApproximateDateFromAge(profiles.age);
      setDateOfBirthInput(new Date(approxDate));
    }
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setProfile(JSON.parse(JSON.stringify(originalProfiles)));
    setFile(null);
    setAgeError("");
    if (originalProfiles.age) {
      const approxDate = calculateApproximateDateFromAge(originalProfiles.age);
      setDateOfBirthInput(new Date(approxDate));
    } else {
      setDateOfBirthInput(null);
    }
    setIsEditMode(false);
  };

  return (
    <>
      {/* Header Section */}
      <div className="dashboard-header" style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: isMobile ? "20px 15px" : "25px",
        marginBottom: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        width: "100%",
        overflow: "visible"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              marginBottom: "12px",
              marginTop: isMobile ? "8%" : "0%"
            }}
          >
            <HomeNavigate />
          </div>
        </div>

        <h3 style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#333",
          margin: "0",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <i className="fa-solid fa-user-gear" style={{ color: "#8059ca" }}></i>
          Profile Details
        </h3>
        <p style={{
          color: "#666",
          fontSize: "14px",
          marginTop: "5px",
          marginBottom: "0"
        }}>
          Update your personal information and preferences
        </p>
      </div>

      {!isEditMode ? (
        /* View Mode - Profile Details Display */
        <div className="setting-card" style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          marginBottom: "30px"
        }}>
          {/* Edit Button */}
          <div style={{ marginBottom: "25px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleEditClick}
              style={{
                backgroundColor: "#8059ca",
                color: "white",
                border: "none",
                padding: "10px 25px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(125, 46, 255, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#6b1fe6";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(125, 46, 255, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#8059ca";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(125, 46, 255, 0.3)";
              }}
            >
              <i className="fa-solid fa-pen"></i>
              Edit Profile
            </button>
          </div>

          {/* Profile Details Display */}
          <div className="row">


            <div className="col-12 mb-3">
              <div style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: "8px",
                padding: "12px 15px",
                fontSize: "15px",
                color: "#333"
              }}>
                <span style={{
                  fontWeight: "600",
                  color: "#555",
                  minWidth: isMobile ? "auto" : "140px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <i className="fa-solid fa-user" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                  Customer ID:
                </span>
                <span style={{ flex: 1, width: isMobile ? "100%" : "auto" }}>
                  {profiles.custId || <span style={{ color: "#999", fontStyle: "italic" }}>Not provided</span>}
                </span>
              </div>
            </div>
            <div className="col-12 mb-3">
              <div style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: "8px",
                padding: "12px 15px",
                fontSize: "15px",
                color: "#333"
              }}>
                <span style={{
                  fontWeight: "600",
                  color: "#555",
                  minWidth: isMobile ? "auto" : "140px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <i className="fa-solid fa-user" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                  First Name:
                </span>
                <span style={{ flex: 1, width: isMobile ? "100%" : "auto" }}>
                  {profiles.first_name || <span style={{ color: "#999", fontStyle: "italic" }}>Not provided</span>}
                </span>
              </div>
            </div>

            <div className="col-12 mb-3">
              <div style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: "8px",
                padding: "12px 15px",
                fontSize: "15px",
                color: "#333"
              }}>
                <span style={{
                  fontWeight: "600",
                  color: "#555",
                  minWidth: isMobile ? "auto" : "140px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <i className="fa-solid fa-user" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                  Last Name:
                </span>
                <span style={{ flex: 1, width: isMobile ? "100%" : "auto" }}>
                  {profiles.last_name || <span style={{ color: "#999", fontStyle: "italic" }}>Not provided</span>}
                </span>
              </div>
            </div>

            <div className="col-12 mb-3">
              <div style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: "8px",
                padding: "12px 15px",
                fontSize: "15px",
                color: "#333"
              }}>
                <span style={{
                  fontWeight: "600",
                  color: "#555",
                  minWidth: isMobile ? "auto" : "140px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <i className="fa-solid fa-phone" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                  Mobile Number:
                </span>
                <span style={{
                  flex: 1,
                  display: "flex",
                  alignItems: isMobile ? "flex-start" : "center",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "10px",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <span>
                    {profiles.phone || <span style={{ color: "#999", fontStyle: "italic" }}>Not provided</span>}
                  </span>
                  {/* {profiles.phone && (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: profiles.mobile_verified === true ? "rgba(40, 167, 69, 0.1)" : "rgba(220, 53, 69, 0.1)",
                      color: profiles.mobile_verified === true ? "#28a745" : "#dc3545",
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    }}>
                      <i className={`fa-solid ${profiles.mobile_verified === true ? "fa-check-circle" : "fa-times-circle"}`} style={{ fontSize: "10px" }}></i>
                      {profiles.mobile_verified === true ? "Verified" : "Unverified"}
                    </span>
                  )} */}
                </span>
              </div>
            </div>


            <div className="col-12 mb-3">
              <div style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: "8px",
                padding: "12px 15px",
                fontSize: "15px",
                color: "#333"
              }}>
                <span style={{
                  fontWeight: "600",
                  color: "#555",
                  minWidth: isMobile ? "auto" : "140px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <i className="fa-solid fa-envelope" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                  Email:
                </span>
                <span style={{
                  flex: 1,
                  display: "flex",
                  alignItems: isMobile ? "flex-start" : "center",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "10px",
                  overflow: "hidden",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, width: isMobile ? "100%" : "auto" }}>
                    {profiles.email || <span style={{ color: "#999", fontStyle: "italic" }}>Not provided</span>}
                  </span>
                  {profiles.email && (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: profiles.email_verified === true ? "rgba(40, 167, 69, 0.1)" : "rgba(220, 53, 69, 0.1)",
                      color: profiles.email_verified === true ? "#28a745" : "#dc3545",
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    }}>
                      <i className={`fa-solid ${profiles.email_verified === true ? "fa-check-circle" : "fa-times-circle"}`} style={{ fontSize: "10px" }}></i>
                      {profiles.email_verified === true ? "Verified" : "Unverified"}
                    </span>
                  )}
                  {profiles.email && profiles.email_verified === false && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      style={{
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        padding: "6px 14px",
                        fontSize: "13px",
                        fontWeight: "500",
                        alignSelf: isMobile ? "flex-start" : "auto"
                      }}
                    >
                      {isSendingOtp ? "Sending OTP..." : "Verify Email"}
                    </button>
                  )}
                </span>
              </div>
            </div>

            <div className="col-12 mb-3">
              <div style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: "8px",
                padding: "12px 15px",
                fontSize: "15px",
                color: "#333"
              }}>
                <span style={{
                  fontWeight: "600",
                  color: "#555",
                  minWidth: isMobile ? "auto" : "140px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <i className="fa-solid fa-venus-mars" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                  Gender:
                </span>
                <span style={{ flex: 1, textTransform: "capitalize", width: isMobile ? "100%" : "auto" }}>
                  {profiles.gender || <span style={{ color: "#999", fontStyle: "italic" }}>Not provided</span>}
                </span>
              </div>
            </div>

            <div className="col-12 mb-3">
              <div style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: "8px",
                padding: "12px 15px",
                fontSize: "15px",
                color: "#333"
              }}>
                <span style={{
                  fontWeight: "600",
                  color: "#555",
                  minWidth: isMobile ? "auto" : "140px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <i className="fa-solid fa-cake-candles" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                  Age:
                </span>
                <span style={{ flex: 1, width: isMobile ? "100%" : "auto" }}>
                  {profiles.age || <span style={{ color: "#999", fontStyle: "italic" }}>Not provided</span>}
                </span>
              </div>
            </div>

            <div className="col-12 mb-3">
              <div style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "flex-start",
                flexDirection: isMobile ? "column" : "row",
                gap: "8px",
                padding: "12px 15px",
                fontSize: "15px",
                color: "#333"
              }}>
                <span style={{
                  fontWeight: "600",
                  color: "#555",
                  minWidth: isMobile ? "auto" : "140px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  paddingTop: "2px",
                  width: isMobile ? "100%" : "auto"
                }}>
                  <i className="fa-solid fa-file-medical" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                  Medical Conditions:
                </span>
                <span style={{ flex: 1, whiteSpace: "pre-wrap", wordWrap: "break-word", width: isMobile ? "100%" : "auto" }}>
                  {profiles.medical_conditions || <span style={{ color: "#999", fontStyle: "italic" }}>Not provided</span>}
                </span>
              </div>
            </div>





          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitProfile}>
          <div className="setting-card" style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            marginBottom: "30px"
          }}>
            <div className="row">
              <div className="col-lg-4 col-md-6 mb-4">
                <div className="form-wrap">
                  <label className="form-label" style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#555",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <i className="fa-solid fa-user" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                    First Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    value={profiles.first_name || ""}
                    onChange={handleProfiles}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      padding: "12px 15px",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#8059ca"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
              </div>

              <div className="col-lg-4 col-md-6 mb-4">
                <div className="form-wrap">
                  <label className="form-label" style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#555",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <i className="fa-solid fa-user" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    value={profiles.last_name || ""}
                    onChange={handleProfiles}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      padding: "12px 15px",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#8059ca"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
              </div>

              <div className="col-lg-4 col-md-6 mb-4">
                <div className="form-wrap">
                  <label className="form-label" style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#555",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",

                  }}>
                    <i className="fa-solid fa-phone" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={profiles.phone || ""}
                    onChange={handlePhoneChange}
                    onKeyPress={(e) => {
                      // Prevent non-numeric characters from being typed
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                        e.preventDefault();
                      }
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={profiles.mobile_verified === true}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      padding: "12px 15px",
                      fontSize: "14px",
                      transition: "all 0.3s ease",
                      backgroundColor: profiles.mobile_verified === true ? "#f5f5f5" : "white",
                      cursor: profiles.mobile_verified === true ? "not-allowed" : "text",
                      opacity: profiles.mobile_verified === true ? 0.7 : 1
                    }}
                    onFocus={(e) => {
                      if (profiles.mobile_verified === true) return;
                      e.target.style.borderColor = "#8059ca";
                    }}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                  {profiles.mobile_verified === true && (
                    <div style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "#28a745",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <i className="fa-solid fa-lock" style={{ fontSize: "10px" }}></i>
                      Mobile number is verified and cannot be edited
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-4 col-md-6 mb-4">
                <div className="form-wrap">
                  <label className="form-label" style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#555",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <i className="fa-solid fa-envelope" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={profiles.email || ""}
                    onChange={handleProfiles}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      padding: "12px 15px",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#8059ca"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
              </div>

              <div className="col-lg-4 col-md-6 mb-4">
                <div className="form-wrap">
                  <label className="form-label" style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#555",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <i className="fa-solid fa-venus-mars" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                    Gender
                  </label>
                  <select
                    className="form-control"
                    name="gender"
                    value={profiles.gender || ""}
                    onChange={handleProfiles}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      padding: "12px 15px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      transition: "all 0.3s ease",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%237d2eff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 15px center",
                      backgroundSize: "16px 12px"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#8059ca"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 mb-4">
                <div className="form-wrap">
                  <label className="form-label" style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#555",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <i className="fa-solid fa-calendar-days" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                    Date of Birth
                  </label>
                  <DatePicker
                    value={dateOfBirthInput}
                    onChange={handleDateOfBirthChange}
                    format="MM/dd/yyyy"
                    placeholder="Select Date of Birth"
                    style={{ width: '100%' }}
                    disabledDate={(date) => date && date > new Date()}
                    cleanable
                  />
                  {profiles.age && (
                    <div style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "#8059ca",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "500"
                    }}>
                      <i className="fa-solid fa-cake-candles" style={{ fontSize: "10px" }}></i>
                      Age: {profiles.age} years
                    </div>
                  )}
                  {ageError && (
                    <div style={{
                      marginTop: "6px",
                      fontSize: "10px",
                      color: "#dc3545",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "500"
                    }}>
                      <i className="fa-solid fa-exclamation-triangle" style={{ fontSize: "10px" }}></i>
                      {ageError}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-12 mb-4">
                <div className="form-wrap">
                  <label className="form-label" style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#555",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <i className="fa-solid fa-file-medical" style={{ fontSize: "12px", color: "#8059ca" }}></i>
                    Medical Conditions / Diseases
                  </label>
                  <textarea
                    className="form-control"
                    name="medical_conditions"
                    value={profiles.medical_conditions || ""}
                    onChange={handleProfiles}
                    placeholder="Enter your medical conditions or diseases"
                    rows="4"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      padding: "12px 15px",
                      fontSize: "14px",
                      resize: "vertical",
                      minHeight: "100px",
                      transition: "all 0.3s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#8059ca"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                  <div className="mt-2" style={{ fontSize: "12px", color: "#888" }}>
                    <i className="fa-solid fa-lightbulb me-1"></i>
                    Please list any chronic conditions, allergies, or ongoing treatments
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="modal-btn text-end" style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                backgroundColor: "#fff",
                color: "#666",
                border: "1px solid #e0e0e0",
                padding: "12px 30px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f5f5f5";
                e.target.style.borderColor = "#ccc";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#fff";
                e.target.style.borderColor = "#e0e0e0";
              }}
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gray"
              style={{
                backgroundColor: "#8059ca",
                color: "white",
                border: "none",
                padding: "12px 30px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(125, 46, 255, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#6b1fe6";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(125, 46, 255, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#8059ca";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(125, 46, 255, 0.3)";
              }}
            >
              <i className="fas fa-check-circle"></i>
              Update Profile
            </button>
          </div>
        </form>
      )}

      {showOtpModal && (
        <div
          onClick={() => {
            setShowOtpModal(false);
            setOtp("");
            setOtpError("");
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(6px)",
            zIndex: 999999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "400px",
              background: "#fff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#222", margin: 0 }}>
                Email Verification
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setOtpError("");
                }}
                style={{
                  background: "#f5f3ff",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#8059ca",
                  fontSize: "16px",
                }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
              We have sent a verification code to <strong>{profiles.email}</strong>. Please enter the OTP below.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-control"
                style={{
                  height: "44px",
                  fontSize: "14px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e0f0",
                }}
              />
              {otpError && (
                <span style={{ fontSize: "12px", color: "#dc3545", marginTop: "2px" }}>
                  {otpError}
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              style={{
                height: "44px",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",
                background: "#8059ca",
                border: "none",
                color: "#fff",
              }}
            >
              {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
            </button>

            <div style={{ display: "flex", justifyContent: "center", gap: "4px", fontSize: "13px" }}>
              <span style={{ color: "#666" }}>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#8059ca",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {isSendingOtp ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;