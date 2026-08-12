import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Home2Header from "../../home/home-4/Header-k";
import Footer from "../../home/home-4/Footer-f";
import Profile from "../Profile";
import Reviews from "../Reviews";
import Favourites from "../Favourites";
import Leads from "../Leads";
import toast from "react-hot-toast";
import { axiosUserInstance, imgUrl } from "../../../../Apiservice";
import { getImageUrl } from "../../../../utils/index";
import Address from "../Addresses";
import Notifications from "../Notifications";
import Transactions from "../Transactions";
import { useMediaQuery } from "react-responsive";
import Referral from "../Referals";
import Appoitments from "../Appoitments";
import MyAccount from "../MyAccount";
import DoctorList from "../DoctorList";
import Wallet from "../Wallet";
import MyReports from "../MyReports";
import TicketIssues from "../TicketIssues";

// Services & Bookings imports from servicesOrders
import AmbulanceBooking from "../servicesOrders/Ambulance-booking";
import RentalBooking from "../servicesOrders/RentalBooking";
import Consultation from "../Consultation";
import AppointmentsOrders from "../servicesOrders/Appointment-Order";
import CartAndBookingOrders from "../servicesOrders/CartAndBookingOrders";
// import LabtestBookings from "../servicesOrders/Labtest";
// import DentalBookings from "../servicesOrders/Dental";
// import DiagnosticsBookings from "../servicesOrders/Diagnostics";
// import MedicalEquipmentBookings from "../servicesOrders/Medical-Equipment";
// import MedicalTreatmentsBookings from "../servicesOrders/Medical-Treatments";
// import SurgerisBookings from "../servicesOrders/Surgeris";
// import HomeCareBookings from "../servicesOrders/Home-Care";
// import NursingCareBookings from "../servicesOrders/Nursing-Care";
import { fetchCategoryList } from "../../../../Apiservice";

const ProfileSideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState([]);
  const [file, setFile] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isOrdersBookingOpen, setIsOrdersBookingOpen] = useState(true);
  const mediaQueryMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const ExtraSmall = useMediaQuery({ query: "(max-width: 480px)" });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = mediaQueryMobile || windowWidth <= 768;
  const extrasmall = ExtraSmall || windowWidth <= 480;
  const [ServiceTabs, setServiceTabs] = useState([]);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchCategoryList().then((data) => {
      const allType = {
        fixedType: "all",
        name: "All",
        categoryType: "all",
      };

      const tabs = [allType, ...data];
      setServiceTabs(tabs);

      // console.log(tabs, "tabs");
    });
  }, [fetchCategoryList]);

  // Map URL paths to section IDs
  const pathToSectionMap = {
    "/profile-sidebar": "profile",
    "/my-favourites": "favourites",
    "/my-account": "my-account",
    "/doctor-list": "doctor-list",
    "/myorders": "myorders",
    "/my-reports": "myreports",
    "/my-enquiries": "my-enquiries",
    "/ticket-raised": "ticket-raised",
    // "/AppointmentsOrders": "AppointmentsOrders",
    "/my-appointments": "AppointmentsOrders",
    "/my-consultations": "my-consultations",
    "/rental-booking": "rental-booking",
    "/notifications": "notifications",
    "/my-transactions": "my-transactions",
    "/wallet": "wallet",
    "/manage-address": "manage-address",
    "/ambulance-booking": "ambulance-booking",
    "/reviews": "reviews",
    "/referals": "referals",
    "/enquery-appointments": "enquery-appointments",
    "/my-orders": "my-orders",
    "/labtest": "labtest",
    "/dental": "dental",
    "/diagnostics": "diagnostics",
    "/medical-equipment": "medical-equipment",
    "/medical-treatments": "medical-treatments",
    "/surgeries": "surgeries",
    "/home-care": "home-care",
    "/nursing-care": "nursing-care",
  };

  // Map section IDs to URL paths
  const sectionToPathMap = {
    profile: "/profile-sidebar",
    "my-account": "/my-account",
    "doctor-list": "/doctor-list",
    favourites: "/my-favourites",
    "ticket-raised": "/ticket-raised",
    myorders: "/myorders",
    myreports: "/my-reports",
    "my-enquiries": "/my-enquiries",
    AppointmentsOrders: "/my-appointments",
    "my-consultations": "/my-consultations",
    "rental-booking": "/rental-booking",
    notifications: "/notifications",
    "my-transactions": "/my-transactions",
    "enquery-appointments": "/enquery-appointments",
    wallet: "/wallet",
    "manage-address": "/manage-address",
    "ambulance-booking": "/ambulance-booking",
    reviews: "/reviews",
    referals: "/referals",
    "my-orders": "/my-orders",
    labtest: "/labtest",
    // "ambulance-booking": "/ambulance-booking",
    // dental: "/dental",
    // diagnostics: "/diagnostics",
    // "medical-equipment": "/medical-equipment",
    // "medical-treatments": "/medical-treatments",
    surgeries: "/surgeries",
    "home-care": "/home-care",
    "nursing-care": "/nursing-care",
  };

  // Get active section from current URL
  const activeSection = pathToSectionMap[location.pathname] || "profile";
  const isOrdersBookingActive = [
    "myorders",
    "AppointmentsOrders",
    "my-consultations",
    "enquery-appointments",
    "ambulance-booking",
    "rental-booking",
    "my-orders",
    "labtest",
    "dental",
    "diagnostics",
    "medical-equipment",
    "medical-treatments",
    "surgeries",
    "home-care",
    "nursing-care",
  ].includes(activeSection);

  // const orderAndBookingItems = [
  //   {
  //     id: "medicine",
  //     label: "Orders",
  //     path: "/medicine",
  //   },
  //   // {
  //   //   id: "labtest",
  //   //   label: "Lab Test",
  //   //   path: "/labtest",
  //   // },
  //   // {
  //   //   id: "dental",
  //   //   label: "Dental",
  //   //   path: "/dental",
  //   // },
  //   // {
  //   //   id: "diagnostics",
  //   //   label: "Diagnostics",
  //   //   path: "/diagnostics",
  //   // },
  //   // {
  //   //   id: "medical-equipment",
  //   //   label: "Medical Equipment",
  //   //   path: "/medical-equipment",
  //   // },
  //   // {
  //   //   id: "medical-treatments",
  //   //   label: "Medical Treatments",
  //   //   path: "/medical-treatments",
  //   // },
  //   // {
  //   //   id: "surgeries",
  //   //   label: "Surgeries",
  //   //   path: "/surgeries",
  //   // },
  //   // {
  //   //   id: "home-care",
  //   //   label: "Home Care",
  //   //   path: "/home-care",
  //   // },
  //   // {
  //   //   id: "nursing-care",
  //   //   label: "Nursing Care",
  //   //   path: "/nursing-care",
  //   // },
  //   {
  //     id: "AppointmentsOrders",
  //     label: "Appointments",
  //     path: "/my-appointments",
  //   },
  //   // {
  //   //   id: "my-consultations",
  //   //   label: "Consultations",
  //   //   path: "/my-consultations",
  //   // },
  //   // {
  //   //   id: "enquery-appointments",
  //   //   label: "Enquiry Appointments",
  //   //   path: "/enquery-appointments",
  //   // },
  //   {
  //     id: "rental-booking",
  //     label: "Rental Booking",
  //     path: "/rental-booking",
  //   },
  //   {
  //     id: "ambulance-booking",
  //     label: "Ambulance Booking",
  //     path: "/ambulance-booking",
  //   },
  // ];

  const handleLogout = async (e) => {
    e.preventDefault();

    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    try {
      const TOKEN_STORAGE_KEY = "medicomparestoken";
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        await axiosUserInstance.post(
          "auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }
    } catch (error) {
      toast.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("cart");
      localStorage.removeItem("pharmacyCart");
      localStorage.removeItem("medicomparestoken");
      localStorage.removeItem("fcmToken");
      localStorage.removeItem("compareItems");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/");
    }
  };
  const handleSectionChange = (section, e) => {
    e.preventDefault();
    const path = sectionToPathMap[section];
    if (path) {
      navigate(path);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Close drawer when route changes
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

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
    } catch (err) {
      // Profile fetch error
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setProfile({ ...profile, image: previewUrl });

      const token = localStorage.getItem("medicomparestoken");
      const dataArray = new FormData();
      dataArray.append("last_name", profile.last_name);
      dataArray.append("first_name", profile.first_name);
      dataArray.append("email", profile.email);
      dataArray.append("phone", profile.phone);
      dataArray.append("gender", profile.gender);
      dataArray.append("age", profile.age);
      dataArray.append("medical_conditions", profile.medical_conditions);
      dataArray.append("image", selectedFile);

      try {
        await axiosUserInstance.post("profile/update", dataArray, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Profile image updated successfully!");
        window.location.reload();
        setFile(null);
      } catch (error) {
        toast.error(
          "An error occurred while updating image. Please try again.",
        );
        fetchProfile();
      }
    }
  };

  const HomeNavigate = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          flex: 1,
          marginTop: extrasmall ? "10%" : isMobile ? "10%" : "0%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Mobile Menu Icon - Only visible on mobile */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              backgroundColor: "#8059ca",
              color: "white",
              border: "none",
              display: isMobile ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(125, 46, 255, 0.3)",
              transition: "all 0.3s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 6px 16px rgba(125, 46, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 12px rgba(125, 46, 255, 0.3)";
            }}
            aria-label="Open menu"
          >
            <i className="fa-solid fa-bars" style={{ fontSize: "20px" }}></i>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ol
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "13px",
              color: "#6c757d",
            }}
          >
            <li>
              <Link
                to="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#f1f3f5",
                  color: "#6f42c1",
                  textDecoration: "none",
                  transition: "background 0.2s ease",
                }}
              >
                <i className="isax isax-home-15" style={{ fontSize: "16px" }} />
              </Link>
            </li>
          </ol>
        </div>
      </div>
    );
  };

  // Reusable Sidebar Content Component
  const SidebarContent = ({ onItemClick }) => (
    <>
      {/* Profile Header Section */}
      <div
        className="widget-profile pro-widget-content"
        style={{
          background: "linear-gradient(135deg, #8059ca 0%, #9b5dff 100%)",
          borderRadius: "12px",
          position: "relative",
          overflow: "hidden",
          padding: "30px 20px 25px",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "-20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        ></div>

        <div className="profile-info-widget position-relative text-center">
          {/* Profile Image Container */}
          <div
            className="profile-avatar-container position-relative mb-2"
            style={{ display: "inline-block" }}
          >
            <Link
              to="/profile-sidebar"
              className="d-block"
              onClick={onItemClick}
            >
              {profile?.image ? (
                <div className="avatar-wrapper">
                  <img
                    className="avatar-img rounded-circle shadow-lg"
                    src={
                      profile.image.startsWith("blob:")
                        ? profile.image
                        : getImageUrl(profile.image)
                    }
                    loading="lazy"
                    alt={profile.first_name}
                    title={profile.first_name}
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "cover",
                      border: "4px solid white",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                    }}
                  />
                </div>
              ) : (
                <div
                  className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                  style={{
                    width: "90px",
                    height: "90px",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                    color: "#8059ca",
                    fontWeight: "700",
                    fontSize: "38px",
                    textTransform: "uppercase",
                    border: "4px solid white",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                  }}
                  title={profile?.first_name}
                >
                  {profile?.first_name?.charAt(0)}
                </div>
              )}
            </Link>

            {/* Camera Icon Overlay */}
            <label
              htmlFor="sidebar-image-upload"
              className="avatar-edit-btn position-absolute"
              style={{
                bottom: "5px",
                right: "0",
                backgroundColor: "white",
                color: "#8059ca",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "13px",
                border: "2px solid #8059ca",
                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
                transform: "translateX(5px)",
                zIndex: 10,
              }}
              title="Update profile picture"
            >
              <i
                className="fa-solid fa-camera"
                style={{ textAlign: "center" }}
              ></i>
            </label>

            <input
              id="sidebar-image-upload"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Profile Details */}
          <div className="profile-det-info">
            <h3
              style={{
                fontSize: "21px",
                fontWeight: "600",
                color: "white",
                letterSpacing: "-0.2px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Link
                to="/profile-sidebar"
                onClick={onItemClick}
                style={{
                  color: "white",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.textShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.textShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                {profile?.first_name?.charAt(0).toUpperCase() +
                  profile?.first_name?.slice(1)} ({profile?.custId})
              </Link>
            </h3>

            <div className="profile-email-badge mt-1">
              <span
                className="badge doctor-role-badge d-inline-flex align-items-center px-3 py-1"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  fontWeight: "500",
                  fontSize: "13px",
                  borderRadius: "18px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 3px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <i
                  className="fa-solid fa-envelope me-2"
                  style={{ fontSize: "11px" }}
                />
                <small className="text-truncate" style={{ maxWidth: "180px" }}>
                  {profile?.email}
                </small>
              </span>
            </div>

            {/* Status Indicator */}
            <div className="profile-status">
              <span
                className="d-inline-flex align-items-center"
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                <i
                  className="fa-solid fa-circle me-1"
                  style={{
                    fontSize: "7px",
                    color: "#4cd964",
                    animation: "pulse 2s infinite",
                  }}
                />
                Active Now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* {
                id: "doctor-list",
                icon: "isax isax-user",
                label: "Family Doctors",
                badge: null,
              }, */}

      {/* Navigation Menu */}
      <div
        className="dashboard-widget"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 3px 15px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        <nav className="dashboard-menu">
          <ul className="list-unstyled mb-0">
            {[
              // {
              //   id: "orders-and-booking",
              //   icon: "isax isax-bag",
              //   label: "Orders & Booking",
              //   badge: null,
              //   isGroup: true,
              // },
              {
                id: "my-orders",
                label: "My Orders",
                icon: "isax isax-bag", // or isax isax-shopping-cart
                badge: null,
              },
              {
                id: "AppointmentsOrders",
                label: "Appointments",
                icon: "isax isax-calendar-2", // Best choice
                badge: null,
              },
              {
                id: "rental-booking",
                label: "Rental Booking",
                icon: "isax isax-box", // or isax isax-building-4
                badge: null,
              },
              {
                id: "ambulance-booking",
                label: "Ambulance Booking",
                icon: "isax isax-truck-fast", // Best if available
                badge: null,
              },
              {
                id: "profile",
                icon: "isax isax-profile-circle",
                label: "My Profile",
                badge: null,
              },
              {
                id: "my-account",
                icon: "isax isax-user",
                label: "Manage Family Members",
                badge: null,
              },
              {
                id: "myreports",
                icon: "isax isax-document",
                label: "My Reports",
                badge: null,
              },
              {
                id: "my-enquiries",
                icon: "isax isax-message-question",
                label: "My Enquiries",
                badge: null,
              },

              {
                id: "my-consultations",
                icon: "isax isax-message-question",
                label: "My Consultations",
                badge: null,
              },

              {
                id: "favourites",
                icon: "isax isax-heart",
                label: "My Favourites",
                badge: null,
              },
              {
                id: "my-transactions",
                icon: "isax isax-card-pos",
                label: "My Transactions",
                badge: null,
              },
              {
                id: "ticket-raised",
                icon: "isax isax-ticket",
                label: "Ticket Raised",
                badge: null,
              },
              {
                id: "notifications",
                icon: "isax isax-notification",
                label: "Notifications",
                badge: null,
              },
              {
                id: "wallet",
                icon: "isax isax-wallet-3",
                label: "Wallet",
                badge: null,
              },
              {
                id: "manage-address",
                icon: "isax isax-location",
                label: "Addresses",
                badge: null,
              },
              {
                id: "reviews",
                icon: "isax isax-star",
                label: "Reviews",
                badge: null,
              },
              {
                id: "referals",
                icon: "isax isax-user-add",
                label: "Refer & Earn",
                badge: null,
              },
            ].map((item) => {
              if (item.isGroup) {
                return (
                  <li
                    key={item.id}
                    className={`nav-item ${isOrdersBookingActive ? "active" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => setIsOrdersBookingOpen((prev) => !prev)}
                      className="nav-link d-flex align-items-center py-2 ps-3"
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        textAlign: "left",
                        textDecoration: "none",
                        color: isOrdersBookingActive ? "#8059ca" : "#555",
                        backgroundColor: isOrdersBookingActive
                          ? "rgba(125, 46, 255, 0.08)"
                          : "transparent",
                        borderLeft: `3px solid ${isOrdersBookingActive ? "#8059ca" : "transparent"}`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.03)",
                        cursor: "pointer",
                        paddingRight: "16px",
                      }}
                    >
                      <i
                        className={item.icon}
                        style={{
                          fontSize: "18px",
                          width: "22px",
                          marginRight: "12px",
                          transition: "transform 0.3s ease",
                          color: "#000",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: isOrdersBookingActive ? "600" : "500",
                          flex: 1,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {item.label}
                      </span>
                      <i
                        className={`fa-solid ${isOrdersBookingOpen ? "fa-chevron-down" : "fa-chevron-right"}`}
                        style={{ fontSize: "12px", color: "#6c757d" }}
                      />
                    </button>
                    {/* {isOrdersBookingOpen && (
                      <ul className="list-unstyled mb-0" style={{ paddingLeft: "30px", borderLeft: "2px solid #eef0f7", marginLeft: "25px", marginTop: "5px", marginBottom: "5px" }}>
                        {orderAndBookingItems.map((subItem) => {
                          const isSubActive = activeSection === subItem.id;
                          return (
                            <li key={`${subItem.id}-${subItem.label}`} className="nav-item" style={{ position: "relative" }}>
                              <div style={{
                                position: "absolute",
                                left: "-30px",
                                top: "50%",
                                width: "15px",
                                height: "2px",
                                backgroundColor: isSubActive ? "#8059ca" : "#eef0f7",
                                transition: "background-color 0.2s ease"
                              }} />
                              <Link
                                to={subItem.path}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(subItem.path);
                                  if (onItemClick) onItemClick();
                                }}
                                className="nav-link d-flex align-items-center py-2"
                                style={{
                                  textDecoration: "none",
                                  color: isSubActive ? "#8059ca" : "#6c757d",
                                  backgroundColor: isSubActive ? "rgba(125, 46, 255, 0.08)" : "transparent",
                                  borderRadius: "6px",
                                  transition: "all 0.2s ease",
                                  paddingLeft: "15px",
                                  margin: "2px 0 2px 5px"
                                }}
                              >
                                <span style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: isSubActive ? "#8059ca" : "#adb5bd",
                                  marginRight: "10px",
                                  display: "inline-block",
                                  transition: "all 0.2s ease",
                                  boxShadow: isSubActive ? "0 0 6px rgba(128, 89, 202, 0.6)" : "none"
                                }} />
                                <span style={{ fontSize: "13px", fontWeight: isSubActive ? "600" : "500" }}>
                                  {subItem.label}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )} */}
                  </li>
                );
              }

              const itemPath = sectionToPathMap[item.id];
              const isActive = activeSection === item.id;
              return (
                <li
                  key={item.id}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <Link
                    to={itemPath || "#"}
                    onClick={(e) => {
                      handleSectionChange(item.id, e);
                      if (onItemClick) onItemClick();
                    }}
                    className="nav-link d-flex align-items-center py-2 ps-3"
                    style={{
                      textDecoration: "none",
                      color: activeSection === item.id ? "#8059ca" : "#555",
                      backgroundColor:
                        activeSection === item.id
                          ? "rgba(125, 46, 255, 0.08)"
                          : "transparent",
                      borderLeft: `3px solid ${activeSection === item.id ? "#8059ca" : "transparent"
                        }`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      borderBottom: "1px solid rgba(0, 0, 0, 0.03)",
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== item.id) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(125, 46, 255, 0.05)";
                        e.currentTarget.style.paddingLeft = "20px";
                        e.currentTarget.style.color = "#8059ca";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== item.id) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.paddingLeft = "16px";
                        e.currentTarget.style.color = "#555";
                      }
                    }}
                  >
                    <i
                      className={item.icon}
                      style={{
                        fontSize: "18px",
                        width: "22px",
                        marginRight: "12px",
                        transition: "transform 0.3s ease",
                        color: "#000",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: isActive ? "600" : "500",
                        flex: 1,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <small
                        className="unread-badge"
                        style={{
                          backgroundColor: "#ff4757",
                          color: "white",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          minWidth: "20px",
                          textAlign: "center",
                          animation: "badgePulse 2s infinite",
                        }}
                      >
                        {item.badge}
                      </small>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Logout Item */}
            <li className="nav-item border-top">
              <a
                href="#"
                onClick={(e) => {
                  handleLogout(e);
                  if (onItemClick) onItemClick();
                }}
                className="nav-link d-flex align-items-center py-2 px-4"
                style={{
                  textDecoration: "none",
                  color: "#ff4757",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backgroundColor: "transparent",
                  borderLeft: "3px solid transparent",
                }}
              >
                <i
                  className="isax isax-logout"
                  style={{
                    fontSize: "18px",
                    width: "22px",
                    marginRight: "12px",
                  }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Logout
                </span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );

  return (
    <div className="main-wrapper">
      <Home2Header />

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div
          className="d-lg-none"
          onClick={() => setIsMobileDrawerOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* Mobile Side Drawer */}
      <div
        className={`d-lg-none mobile-profile-drawer ${isMobileDrawerOpen ? "open" : ""
          }`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          maxWidth: "85vw",
          height: "100vh",
          maxHeight: "100vh",
          backgroundColor: "#fff",
          zIndex: 1000,
          transform: isMobileDrawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 15px",
            borderBottom: "1px solid #eee",
            // backgroundColor: "#f8f9fa",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "#fff",
          }}
        >
          <h5
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Menu
          </h5>
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "1px solid #ddd",
              color: "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f0f0f0";
              e.target.style.borderColor = "#8059ca";
              e.target.style.color = "#8059ca";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.borderColor = "#ddd";
              e.target.style.color = "#666";
            }}
            aria-label="Close menu"
          >
            <i className="fa-solid fa-times" style={{ fontSize: "16px" }}></i>
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ padding: "15px" }}>
          <SidebarContent onItemClick={() => setIsMobileDrawerOpen(false)} />
        </div>
      </div>

      {/* Page Content */}
      <div
        className="content doctor-content"
        style={{ marginTop: isMobile ? "10%" : "5%" }}
      >
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-4 col-xl-3 d-none d-lg-block theiaStickySidebar">
              <div className="profile-sidebar doctor-sidebar profile-sidebar-new">
                <SidebarContent />
              </div>
            </div>

            {/* Main Content */}
            <div className="col-lg-8 col-xl-9 mt-2 theiaStickySidebar">
              {activeSection === "profile" && (
                <Profile
                  onProfileUpdate={fetchProfile}
                  HomeNavigate={HomeNavigate}
                />
              )}
              {activeSection === "favourites" && (
                <Favourites HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "my-account" && (
                <MyAccount HomeNavigate={HomeNavigate} />
              )}
              {/* {activeSection === "doctor-list" && (
                <DoctorList HomeNavigate={HomeNavigate} />
              )} */}
              {activeSection === "myreports" && (
                <MyReports HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "reviews" && (
                <Reviews HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "referals" && (
                <Referral HomeNavigate={HomeNavigate} profile={profile} />
              )}
              {activeSection === "notifications" && (
                <Notifications HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "my-transactions" && (
                <Transactions HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "wallet" && (
                <Wallet HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "my-enquiries" && (
                <Leads HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "enquery-appointments" && (
                <Appoitments HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "AppointmentsOrders" && (
                <AppointmentsOrders
                  HomeNavigate={HomeNavigate}
                  ServiceTabs={ServiceTabs}
                />
              )}
              {activeSection === "my-consultations" && (
                <Consultation HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "ticket-raised" && (
                <TicketIssues HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "ambulance-booking" && (
                <AmbulanceBooking
                  HomeNavigate={HomeNavigate}
                  ServiceTabs={ServiceTabs}
                />
              )}
              {activeSection === "rental-booking" && (
                <RentalBooking
                  HomeNavigate={HomeNavigate}
                  ServiceTabs={ServiceTabs}
                />
              )}
              {activeSection === "my-orders" && (
                <CartAndBookingOrders
                  HomeNavigate={HomeNavigate}
                  ServiceTabs={ServiceTabs}
                />
              )}
              {/* {activeSection === "labtest" && (
                <LabtestBookings HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "dental" && (
                <DentalBookings HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "diagnostics" && (
                <DiagnosticsBookings HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "medical-equipment" && (
                <MedicalEquipmentBookings HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "medical-treatments" && (
                <MedicalTreatmentsBookings HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "surgeries" && (
                <SurgerisBookings HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "home-care" && (
                <HomeCareBookings HomeNavigate={HomeNavigate} />
              )}
              {activeSection === "nursing-care" && (
                <NursingCareBookings HomeNavigate={HomeNavigate} />
              )} */}
              {activeSection === "manage-address" && (
                <Address HomeNavigate={HomeNavigate} />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileSideBar;
