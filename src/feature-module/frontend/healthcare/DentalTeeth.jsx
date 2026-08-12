import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Autoplay } from "swiper/modules";
import { getHealthcareSwiperSettings } from "./healthcareSliderSettings.jsx";
import { axiosCommonInstance, axiosUserInstance } from "../../../Apiservice";
import { handleRentalBookingProcess, handleGeneralBookingProcess } from "../../../services/bookingService";
import { getImageUrl } from "../../../utils/index";
import toast from "react-hot-toast";
import { CartQuantityControls, VendorActions } from "../../../components/ui";
import LeadModal from "../pharmacy/products-components/LeadModal.jsx";
import RentModal from "../pharmacy/products-components/RentModal.jsx";
import ConsultationModal from "../pharmacy/products-components/ConsultationModal.jsx";
import AppointmentModal from "../pharmacy/products-components/AppointmentModal.jsx";
import { useCart } from "../../../hooks/useCart";
import { useProfile } from "../../../context/ProfileContext";
import Slider from "react-slick";
import SEOHelmet from "../../../components/SEOHelmet";
const DentalTeeth = ({
  handleBook,
  settings,
  cheaplabtests,
  currentService,
  middleBanners,
  service,
}) => {
  // Modal states
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [rentProduct, setRentProduct] = useState(null);
  const [currentLeadData, setCurrentLeadData] = useState(null);
  const { profile: userProfile } = useProfile();

  // Form data states
  const INITIAL_LEAD_FORM = {
    date: "",
    name: "",
    email: "",
    mobile: "",
    policyNumber: "",
    relation: "",
    address: "",
  };
  const [leadFormData, setLeadFormData] = useState(INITIAL_LEAD_FORM);
  const [rentFormData, setRentFormData] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    duration: "",
    deliveryAddress: "",
  });
  const [consultationFormData, setConsultationFormData] = useState({
    date: "",
    name: "",
    phone: "",
    category: "",
    address: "",
  });
  const [appointmentFormData, setAppointmentFormData] = useState({
    date: "",
    name: "",
    phone: "",
    category: "",
    address: "",
  });

  // Cart hooks
  const {
    getCartQuantity: getCartQuantityFromHook,
    incrementItem,
    decrementItem,
  } = useCart();

  const isLoggedIn = !!localStorage.getItem("medicomparestoken");

  // Cart helper
  const getCartQuantity = (vendorId, prodId, variantId) => {
    if (!isLoggedIn) {
      return 0;
    }
    return getCartQuantityFromHook(vendorId, prodId, variantId);
  };

  // Handler functions for vendor actions
  const handleAddLead = (vendor, med) => {
    if (!isLoggedIn) {
      toast.error("Please login");
      navigate("/login");
      return;
    }

    setCurrentLeadData({ vendor, med, variantId: null });
    const today = new Date().toISOString().split("T")[0];
    setLeadFormData({
      ...INITIAL_LEAD_FORM,
      date: today,
      relation: "self",
      name: userProfile
        ? `${userProfile.first_name || ""} ${userProfile.last_name || ""
          }`.trim()
        : "",
      mobile: userProfile?.phone || "",
      email: userProfile?.email || "",
      med, // Add med to form data
      vendor, // Add vendor to form data
    });
    setShowLeadModal(true);
  };

  const handleBooking = async (vendor, med, effectiveVariantId, price, stock, path, servicePassed) => {
    await handleGeneralBookingProcess({
      productId: med?._id || med?.id || med?.name,
      variantId: effectiveVariantId || null,
      vendorId: vendor?.vendorId || vendor?._id,
      servicefixedTypes: servicePassed || med?.subcatdetails?.catdetails?.fixedType || med?.subcategorydetails?.category?.fixedType || med?.category?.fixedType || "dental",
      navigate,
      redirectPath: path || "/booking-process",
    });
  };

  const handleSlots = async (vendor, med) => {
    if (!isLoggedIn) {
      toast.error("Please login to select slot");
      navigate("/login");
      return;
    }
    await handleBooking(vendor, med, null, 0, 999, "/booking-process/slot");
  };

  const handleRentalBookinProcess = async (vendor, med, effectiveVariantId, price, stock, servicePassed) => {
    await handleRentalBookingProcess({
      productId: med?._id || med?.id || med?.name,
      variantId: effectiveVariantId || null,
      vendorId: vendor?.vendorId || vendor?._id,
      perDayRent: vendor?.perDayRent || 0,
      navigate,
      servicefixedTypes: servicePassed || med?.subcatdetails?.catdetails?.fixedType || med?.subcategorydetails?.category?.fixedType || med?.category?.fixedType || "dental",
    });
  };



  const handleConsultationClick = (vendor, med) => {
    if (!isLoggedIn) {
      toast.error("Please login to book consultation");
      navigate("/login");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    setConsultationFormData({
      date: today,
      name: userProfile
        ? `${userProfile.first_name || ""} ${userProfile.last_name || ""
          }`.trim()
        : "",
      phone: userProfile?.phone || "",
      category: "",
      address: "",
      med,
      vendor,
    });
    setShowConsultationModal(true);
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    if (!appointmentFormData.date) {
      toast.error("Please select a date");
      return;
    }

    if (!appointmentFormData.name) {
      toast.error("Please enter your name");
      return;
    }

    if (!appointmentFormData.phone) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      const token = localStorage.getItem("medicomparestoken");
      if (!token) {
        toast.error("Please login to book an appointment");
        navigate("/login");
        return;
      }

      // Get the selected vendor and product from the form data
      const { vendor, med } = appointmentFormData;
      if (!vendor || !med) {
        toast.error("Invalid appointment details");
        return;
      }

      await axiosUserInstance.post(
        "lead/create",
        {
          name: appointmentFormData.name,
          phone: appointmentFormData.phone,
          category: appointmentFormData.category || "Dental Service",
          date: appointmentFormData.date,
          address: appointmentFormData.address || "",
          productId: med._id || med.id,
          vendorId: vendor.vendorId || vendor._id,
          variantId: null,
          leadSource: "Website",
          leadStage: "New",
          formType: "appointment",
          status: "active",
          serviceType: "dentalservice",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      toast.success("Appointment booked successfully!");
      setShowAppointmentModal(false);
      setAppointmentFormData({
        date: "",
        name: "",
        phone: "",
        category: "",
        address: "",
        med: null,
        vendor: null,
      });
    } catch (err) {
      // Error booking appointment
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to book appointment",
      );
    }
  };

  const handleAppointmentClick = (vendor, med) => {
    if (!isLoggedIn) {
      toast.error("Please login to book appointment");
      navigate("/login");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    setAppointmentFormData({
      date: today,
      name: userProfile
        ? `${userProfile.first_name || ""} ${userProfile.last_name || ""
          }`.trim()
        : "",
      phone: userProfile?.phone || "",
      category: "",
      address: "",
      med, // Add med to form data
      vendor, // Add vendor to form data
    });
    setShowAppointmentModal(true);
  };

  const handleIncrement = async (
    bookingType,
    vendorId,
    prodId,
    variantId,
    maxStock,
    vendor,
    selectedVar,
  ) => {
    const currentQty = getCartQuantity(vendorId, prodId, variantId);
    if (currentQty >= maxStock) {
      toast.error("Quantity at maximum stock");
      return;
    }

    try {
      await incrementItem(vendorId, prodId, variantId);
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const handleDecrement = async (
    bookingType,
    vendorId,
    prodId,
    variantId,
    vendor,
    selectedVar,
  ) => {
    try {
      await decrementItem(vendorId, prodId, variantId);
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  // Form handlers
  const handleRentFormChange = (e) => {
    const { name, value } = e.target;
    setRentFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRentSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to book service");
      navigate("/login");
      return;
    }
    toast.success("Rental request submitted successfully!");
    setShowRentModal(false);
    setRentFormData({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      duration: "",
      deliveryAddress: "",
    });
    setRentProduct(null);
  };

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to book consultation");
      navigate("/login");
      return;
    }
    toast.success("Consultation request submitted successfully!");
    setShowConsultationModal(false);
    setConsultationFormData({
      date: "",
      name: "",
      phone: "",
      category: "",
      address: "",
    });
  };

  const handleSubmitLeadNew = async (e) => {
    e.preventDefault();
    if (!currentLeadData?.med && !currentLeadData?.vendor) return;

    const { vendor, med } = currentLeadData;
    try {
      const token = localStorage.getItem("medicomparestoken");
      await axiosUserInstance.post(
        "lead/create",
        {
          name: leadFormData.name,
          email: leadFormData.email,
          phone: leadFormData.mobile,
          address: leadFormData.address,
          policyNumber: leadFormData.policyNumber,
          relation: leadFormData.relation,
          productId: med?._id || med?.id,
          vendorId: vendor._id || vendor.vendorId,
          variantId: null,
          leadSource: "Website",
          leadStage: "New",
          status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      toast.success("Lead added successfully!");
      setShowLeadModal(false);
      setLeadFormData(INITIAL_LEAD_FORM);
      setCurrentLeadData(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add lead");
    }
  };

  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const swiperSettings = {
    ...getHealthcareSwiperSettings({
      modules: [Navigation, Autoplay],
      navigation: {
        nextEl: ".dental-next",
        prevEl: ".dental-prev",
      },
      loop: cheaplabtests?.length > 4,
    }),
    slidesPerView: 4,
    spaceBetween: 10,
    breakpoints: {
      1200: { slidesPerView: 3, spaceBetween: 10 },
      992: { slidesPerView: 2.2, spaceBetween: 10 },
      768: { slidesPerView: 1.8, spaceBetween: 8 },
      0: { slidesPerView: 1.1, spaceBetween: 6 },
    },
  };

  const faqs = [
    {
      id: 1,
      question: "What dental services can I book through MediCompares?",
      answer:
        "You can book various dental services including routine checkups, teeth cleaning, root canal treatment, dental fillings, teeth whitening, braces, and more.",
    },
    {
      id: 2,
      question: "Are dental consultations available online?",
      answer:
        "Yes, we offer online dental consultations where you can speak with qualified dentists from the comfort of your home.",
    },
    {
      id: 3,
      question: "Is teeth cleaning (scaling) painful?",
      answer:
        "Teeth cleaning is generally not painful. You may experience slight discomfort or sensitivity, but most patients find it comfortable.",
    },
    {
      id: 4,
      question: "How often should I visit a dentist?",
      answer:
        "It's recommended to visit a dentist every 6 months for routine checkups and cleanings to maintain optimal oral health.",
    },
    {
      id: 5,
      question: "Does insurance cover dental care?",
      answer:
        "Many dental insurance plans cover preventive care, basic procedures, and major treatments. Coverage varies by plan, so check with your insurance provider.",
    },
    {
      id: 6,
      question: "How often should I visit a dentist?",
      answer:
        "It's recommended to visit a dentist every 6 months for routine checkups and cleanings to maintain optimal oral health.",
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const stats = [
    {
      iconClass: "fa-tooth",
      value: "1,200+",
      label: "Happy Clients",
      color: "text-primary",
    },
    {
      iconClass: "fa-users",
      value: "15+",
      label: "Years Experience",
      color: "text-primary",
    },
    {
      iconClass: "fa-user-doctor",
      value: "70+",
      label: "Doctors & Staff",
      color: "text-primary",
    },
    {
      iconClass: "fa-calendar-check",
      value: "340+",
      label: "Online Appointments",
      color: "text-primary",
    },
  ];

  const handleProductClick = (item) => {
    const data = item?.medicineDetails || item?.tabletdetails || item;
    const categorySlug =
      data?.subcategorydetails?.catdetails?.slug ||
      data?.subcatdetails?.catdetails?.slug;


    const subcategorySlug =
      data?.subcategorydetails?.slug || data?.subcatdetails?.slug;
    const productSlug = data?.slug;
    navigate(`/${categorySlug}/${subcategorySlug}/${productSlug}`);
  };

  return (
    <>
      <SEOHelmet page="dental" />
      {cheaplabtests && cheaplabtests.length > 0 && (
        <div className="content doctor-content pb-0 mx-2">
          <div className="container-fluid">
            <div className="d-flex align-items-center justify-content-between flex-wrap result-wrap gap-3">
              <h3 className="mb-2 top-vendor-badge">
                <i className="fas fa-bolt"></i>
                Dental Care Services
              </h3>

              <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
                <Link
                  to={`/${currentService}/all`}
                  className="top-vendor-badge"
                >
                  View All
                  <i className="isax isax-arrow-right-1 ms-1"></i>
                </Link>
              </div>
            </div>

            <div
              className="meq-swiper-wrapper"
              style={{ position: "relative" }}
            >
              <style>{`
                .meq-arrow-btn {
                  position: absolute;
                  top: 50%;
                  transform: translateY(-50%);
                  z-index: 10;
                  width: 40px;
                  height: 40px;
                  background: #fff;
                  border: 1px solid #ddd;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                  transition: all 0.3s ease;
                }
                .meq-arrow-btn:hover {
                  background: #8059ca;
                  border-color: #8059ca;
                  color: #fff;
                }
                .dental-prev {
                  left: 10px;
                }
                .dental-next {
                  right: 10px;
                }
                @media (max-width: 768px) {
                  .dental-prev {
                    left: 5px;
                  }
                  .dental-next {
                    right: 5px;
                  }
                }
              `}</style>
              <button
                className="meq-arrow-btn dental-prev"
                aria-label="Previous"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <Swiper {...swiperSettings}>
                {cheaplabtests?.map((test) => {
                  const vendor = test?.businessDetails;
                  const medicine = test?.medicineDetails;
                  const transformedProduct = {
                    ...test,
                    tabletdetails: {
                      _id: medicine?._id || test?._id,
                      slug:
                        medicine?.slug ||
                        test?.slug ||
                        test?.categorySlug ||
                        currentService,
                      name: medicine?.name || test?.name,
                      files: medicine?.files || [],
                      description: medicine?.description || test?.description,
                    },
                  };
                  return (
                    <SwiperSlide
                      key={test?._id}
                      style={{ display: "flex", alignSelf: "stretch" }}
                    >
                      <div
                        className="w-100 px-1 mb-2"
                        onClick={() => handleProductClick(transformedProduct)}
                      >
                        <div
                          className="health-card"
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                          }}
                        >
                          <div className="card-imgs">
                            <img
                              src={
                                medicine?.files?.[0]
                                  ? getImageUrl(medicine.files[0])
                                  : "/assets/default.png"
                              }
                              style={{ objectFit: "contain" }}
                              alt={medicine.name}
                              onError={(e) => {
                                e.target.src = "/assets/default.png";
                              }}
                            />
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                const data = test?.medicineDetails || test;
                                const categorySlug =
                                  data?.subcatdetails?.catdetails?.slug;
                                const subcategorySlug =
                                  data?.subcatdetails?.slug;
                                const medicineSlug = data?.slug;
                                if (
                                  !categorySlug ||
                                  !subcategorySlug ||
                                  !medicineSlug
                                )
                                  return;

                                console.log(categorySlug, "categorySlug")
                                navigate(
                                  `/${categorySlug}/${subcategorySlug}/${medicineSlug}/compare`,
                                );
                              }}
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                borderRadius: "30px",
                                padding: "3px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
                                zIndex: 10,
                                border: "1.5px solid #ffffff",
                                cursor: "pointer",
                                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                transform: "scale(1)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.12) translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 20px rgba(245, 158, 11, 0.55)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.4)";
                              }}
                              title="Compare Package"
                            >
                              <i
                                className="fa-solid fa-hand-pointer"
                                style={{
                                  fontSize: "13px",
                                  color: "#ffffff",
                                  transform: "rotate(90deg)",
                                  display: "inline-block",
                                }}
                              ></i>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  color: "#ffffff",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.6px",
                                }}
                              >
                                Compare
                              </span>
                            </div>
                          </div>
                          <div className="card-bodyyy">
                            <div className="d-flex justify-content-between align-items-center">
                              <h3 className="titlee text-dark mb-0">
                                {medicine?.name?.length > 20
                                  ? medicine.name.slice(0, 20) + "..."
                                  : medicine?.name}
                              </h3>

                              <div
                                className="d-flex align-items-center justify-content-end"
                                style={{ minWidth: "80px", fontSize: "12px" }}
                              >
                                <i className="fa fa-star text-warning me-1"></i>
                                <span className="me-1">
                                  {medicine?.averageRating?.toFixed(1) > 0
                                    ? medicine.averageRating?.toFixed(1)
                                    : ""}
                                </span>

                                <i className="fa fa-users me-1 text-primary"></i>
                                <span>
                                  (
                                  {medicine?.ratingCount > 0
                                    ? `${medicine.ratingCount}+`
                                    : ""}
                                  )
                                </span>
                              </div>
                            </div>
                            <p style={{ fontSize: "12px" }}>
                              Routine checkup, scaling & polishing
                            </p>

                            <div style={{ flex: "0 0 50%" }}>
                              <p
                                className="mb-1 d-flex align-items-center"
                                style={{
                                  fontSize: "11px",
                                  color: "black",
                                  textTransform: "capitalize",
                                }}
                              >
                                <i
                                  className="fas fa-procedures me-1 text-primary"
                                  style={{ width: "14px" }}
                                ></i>
                                <span className="me-1">Treatment Type :</span>
                                <strong>{medicine?.treatmenttype}</strong>
                              </p>
                            </div>

                            <div style={{ flex: "0 0 50%" }}>
                              <p
                                className="mb-1 d-flex align-items-center"
                                style={{ fontSize: "11px", color: "black" }}
                              >
                                <i
                                  className="fas fa-clock me-1 text-primary"
                                  style={{ width: "14px" }}
                                ></i>
                                <span className="me-1">
                                  Treatment Duration :
                                </span>
                                <strong>30 - 90 mins</strong>
                              </p>
                            </div>

                            <div style={{ flex: "0 0 50%" }}>
                              <p
                                className="mb-1 d-flex align-items-center"
                                style={{ fontSize: "11px", color: "black" }}
                              >
                                <i
                                  className="fas fa-user-md me-1 text-primary"
                                  style={{ width: "14px" }}
                                ></i>
                                <span className="me-1">Specialist Type :</span>
                                <strong>Dentist</strong>
                              </p>
                            </div>

                            {medicine?.reportsDuration && (
                              <div className="report-timee">
                                <i className="fa-regular fa-file-lines" />{" "}
                                Reports in
                                <strong> {medicine?.reportsDuration}</strong>
                              </div>
                            )}

                            <div className="price-section d-flex align-items-center flex-wrap gap-2 pb-2">
                              {(() => {
                                const originalPrice =
                                  parseFloat(test?.price) || 0;
                                const discountPrice =
                                  parseFloat(
                                    test?.discountprice || test?.discountPrice,
                                  ) || null;

                                const showDiscount =
                                  discountPrice &&
                                  discountPrice > 0 &&
                                  discountPrice < originalPrice;
                                const displayPrice = showDiscount
                                  ? discountPrice
                                  : originalPrice;

                                const discountPercent = showDiscount
                                  ? Math.round(
                                    ((originalPrice - discountPrice) /
                                      originalPrice) *
                                    100,
                                  )
                                  : 0;

                                return (
                                  <>
                                    <span className="current-price text-dark">
                                      ₹{displayPrice.toLocaleString("en-IN")}
                                    </span>

                                    {showDiscount && (
                                      <>
                                        <span className="old-price">
                                          ₹
                                          {originalPrice.toLocaleString(
                                            "en-IN",
                                          )}
                                        </span>
                                        <span
                                          className="discountts"
                                          style={{
                                            backgroundColor: "#F97316",
                                            fontSize: "12px",
                                          }}
                                        >
                                          {discountPercent}% OFF
                                        </span>
                                      </>
                                    )}
                                  </>
                                );
                              })()}
                            </div>

                            <VendorActions
                              bookingType={
                                test?.medicineDetails?.subcatdetails?.catdetails?.categoryType ||
                                service?.categoryType ||
                                "cart"
                              }
                              med={test?.medicineDetails || test}
                              vendor={test?.businessDetails || {}}
                              price={parseFloat(test?.price) || 0}
                              calculatedDiscountPrice={parseFloat(test?.discountprice || test?.discountPrice) || null}
                              // stock={test?.stock || (test?.medicineDetails || test).stock || (test?.vendordetails || {}).stock || 999}
                              service={test?.medicineDetails?.subcatdetails?.catdetails?.fixedType || "dentalservice"}
                              handleRentalBookinProcess={handleRentalBookinProcess}
                              handleNavigateToBooking={handleBooking}
                              handleAddLead={handleAddLead}
                              handleOpenConsultationModal={handleConsultationClick}
                              handleOpenAppointmentModal={handleAppointmentClick}
                              handleOpenRideModal=""
                              className="w-100"
                              containerStyle={{
                                display: "flex",
                                width: "100%",
                              }}
                            />

                            {vendor && (
                              <div
                                style={{
                                  marginTop: "12px",
                                  borderTop: "1px solid #0000002e",
                                }}
                              >
                                <div
                                  className="d-flex align-items-center footers"
                                  style={{ padding: "10px 0 0 0" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const vendorId =
                                      vendor?.slug ||
                                      vendor?.vendorId ||
                                      vendor?._id ||
                                      vendor?.bussinessdetails?.slug ||
                                      vendor?.bussinessdetails?.vendorId ||
                                      vendor?.bussinessdetails?._id;
                                    if (vendorId) {
                                      const name =
                                        vendor?.bussinessdetails?.name ||
                                        vendor?.name ||
                                        "Vendor Store";
                                      const vendorSlug = name
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                        .replace(/[^a-z0-9-]/g, "");
                                      sessionStorage.setItem(
                                        "vendorId",
                                        vendorId,
                                      );
                                      navigate(`/vendor-profile/${vendorSlug}`);
                                    } else {
                                      toast.error(
                                        "Vendor information not available",
                                      );
                                    }
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = "0.9";
                                    e.currentTarget.style.cursor = "pointer";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = "1";
                                    e.currentTarget.style.cursor = "default";
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "56px",
                                      height: "56px",
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                      background: "#fff",
                                    }}
                                  >
                                    <img
                                      src={
                                        vendor?.bussiness_image?.url
                                          ? getImageUrl(
                                            vendor.bussiness_image.url,
                                          )
                                          : "/assets/default.png"
                                      }
                                      alt={vendor.name}
                                      onError={(e) => {
                                        e.target.src = "/assets/default.png";
                                      }}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                      }}
                                    />
                                  </div>

                                  <div className="flex-grow-1">
                                    <h6
                                      className="mb-1 "
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: "600 !important"
                                      }}
                                    >
                                      {vendor.name}
                                    </h6>
                                    {Number(test?.averageRating) > 0 &&
                                      Number(test?.ratingCount) > 0 && (
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "10px",
                                            color: "#666",
                                            marginTop: "2px",
                                            marginBottom: "4px",
                                          }}
                                        >
                                          <i
                                            className="fas fa-star"
                                            style={{
                                              color: "#ffc107",
                                              fontSize: "9px",
                                            }}
                                          ></i>

                                          <span style={{ fontWeight: "500" }}>
                                            {Number(
                                              test.averageRating,
                                            ).toFixed(1)}
                                          </span>

                                          <span style={{ color: "#999" }}>
                                            ({test?.ratingCount}+)
                                          </span>
                                        </div>
                                      )}

                                    <div className="d-flex align-items-center text-dark">
                                      <i
                                        className="fa-solid fa-location-dot"
                                        style={{
                                          fontSize: "13px",
                                          color: "#8059ca",
                                        }}
                                      ></i>
                                      <span>
                                        {vendor.address?.length > 22
                                          ? vendor.address.slice(0, 22) + "..."
                                          : vendor.address ||
                                          "Address not available"}
                                      </span>
                                    </div>
                                    {test?.distanceInKm && (
                                      <div
                                        className="d-flex align-items-center gap-1 text-muted"
                                        style={{ marginTop: "4px" }}
                                      >
                                        <i
                                          className="isax isax-route-square"
                                          style={{
                                            fontSize: "11px",
                                            color: "#8059ca",
                                          }}
                                        ></i>

                                        <span style={{ fontSize: "11px" }}>
                                          {parseFloat(
                                            test.distanceInKm,
                                          ).toFixed(1)}{" "}
                                          km away
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <button className="meq-arrow-btn dental-next" aria-label="Next">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {middleBanners?.length > 0 && (
        <section
          className="section welcome-section px-3 mt-3 offers-section"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div className="container-fluid">
            <div className="text-center mb-3">
              <h2
                className="mb-3"
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                <i className="fas fa-bolt text-warning me-2"></i>Offers &
                Promotions
              </h2>
            </div>
            {middleBanners.length > 1 ? (
              <Slider {...settings}>
                {middleBanners.map((image, index) => (
                  <div key={index} className="col-lg-4 col-md-6 d-flex">
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      className="px-1"
                      style={{
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="col-lg-12 d-flex">
                <img
                  src={middleBanners[0]?.src}
                  alt={middleBanners[0]?.alt}
                  title={middleBanners[0]?.alt}
                  loading="lazy"
                  className="px-1"
                  style={{ borderRadius: "10px" }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      <section
        className="mt-3"
        style={{
          backgroundColor: "#E8E4F5",
          backgroundImage:
            "url('/assets/Medicompares%20Background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="container-fluid">
          <div className="row align-items-center pt-3">
            <div className="col-12 col-md-6 text-center mb-4 mb-md-0 d-lg-block d-none">
              <div className="position-relative d-inline-block">
                <img
                  src="/assets/Medicompares Dentist Webpage 2 (1).png"
                  alt="Dental Doctor"
                  className="img-fluid"
                  style={{ maxHeight: "420px" }}
                />
                {/* 
                <img
                  src="/assets/dentalLeft.jpg"
                  alt="Dental Care"
                  className="floating-img floating-left"
                />

                <img
                  src="/assets/dentalRight.jpg"
                  alt="Dental Tools"
                  className="floating-img floating-right"
                /> */}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <h2
                className="fw-bold text-dark dental-heading"
                style={{ lineHeight: "46px" }}
              >
                The Best Dental Clinics <br /> That You Can Trust
              </h2>

              <p
                className="text-dark"
                style={{ fontSize: "14px", lineHeight: "28px" }}
              >
                Our clinic delivers comprehensive dental solutions, from routine
                checkups to advanced procedures, supported by modern equipment
                and skilled dentists. We are committed to providing reliable,
                patient-centered care in a calm and comfortable environment.
                <br />
                Comprehensive dental care delivered by experienced professionals
                using modern technology, focused on comfort, safety, and
                long-term oral health.
              </p>

              <div className="row mb-2">
                <div className="col-6 mb-3 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-success"></i>
                  <span className="small fw-semibold text-dark">
                    Modern Equipment
                  </span>
                </div>

                <div className="col-6 mb-3 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-success"></i>
                  <span className="small fw-semibold text-dark">
                    Easy Online Appointment
                  </span>
                </div>

                <div className="col-6 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-success"></i>
                  <span className="small fw-semibold text-dark">
                    Comfortable Clinic
                  </span>
                </div>

                <div className="col-6 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-success"></i>
                  <span className="small fw-semibold text-dark">
                    Always Monitored
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="py-md-5 py-4" style={{ backgroundColor: "#f8f6fc" }}>
        <div className="container">
          <div className="row align-items-center justify-content-center position-relative">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="col-6 col-lg-3 mb-4 mb-md-0 position-relative"
                style={{
                  borderRight:
                    stats && stats.length > 0 && idx !== stats.length - 1
                      ? "2px solid rgba(128, 89, 202, 0.15)"
                      : "none",
                }}
              >
                <div className="d-flex flex-row align-items-center justify-content-center justify-content-md-start">
                  <div
                    className="d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#8059ca",
                      color: "#fff",
                      fontSize: "24px",
                      borderRadius: "8px",
                    }}
                  >
                    <i className={`fa-solid ${stat.iconClass}`}></i>
                  </div>

                  <div className="text-center text-md-start">
                    <h3 className="mb-1 fw-bold countingText" style={{ color: "#8059ca" }}>
                      {stat.value.split("+")[0]}
                      <span style={{ color: "#8059ca" }}>+</span>
                    </h3>
                    <p className="mb-0" style={{ fontSize: "14px", color: "#666" }}>{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ  */}
      <section
        style={{
          padding: "30px 0",
          backgroundColor: "#E8E4F5",
          backgroundImage:
            "url('/assets/Medicompares%20Background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="mx-2"
      >
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-5 col-md-12 mb-4 mb-lg-0">
              <img
                src="/assets/Medicomapres Dentist Website (1).png"
                alt="FAQ"
                className="img-fluid rounded w-100 d-lg-block d-none"
                style={{ maxHeight: "420px" }}
              />
            </div>
            <div className="col-lg-7 col-md-12">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    marginBottom: "15px",
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h5
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#212121",
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {faq.question}
                    </h5>
                    <span
                      style={{
                        fontSize: "20px",
                        color: "#7f2ef6",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                      }}
                    >
                      {expandedFaq === faq.id ? (
                        <i className="fas fa-minus"></i>
                      ) : (
                        <i className="fas fa-plus"></i>
                      )}
                    </span>
                  </div>
                  {expandedFaq === faq.id && (
                    <div
                      style={{
                        padding: "0 16px 16px 16px",
                        fontSize: "14px",
                        color: "#757575",
                        lineHeight: "1.6",
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Modal */}
      <LeadModal
        show={showLeadModal}
        onClose={() => {
          setShowLeadModal(false);
          setLeadFormData({
            ...INITIAL_LEAD_FORM,
            med: null,
            vendor: null,
          });
        }}
        formData={leadFormData}
        onChange={(e) =>
          setLeadFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }))
        }
        productId={leadFormData?.med?._id || leadFormData?.med?.id || null}
        vendorId={
          leadFormData?.vendor?.vendorId || leadFormData?.vendor?._id || null
        }
        variantId={null}
        onSubmit={handleSubmitLeadNew}
        fixedType="dentalservice"
      />

      {/* Rental Modal */}
      {rentProduct && (
        <RentModal
          show={showRentModal}
          onClose={() => {
            setShowRentModal(false);
            setRentFormData({
              startDate: "",
              startTime: "",
              endDate: "",
              endTime: "",
              duration: "",
              deliveryAddress: "",
              med: null,
              vendor: null,
            });
          }}
          rentProduct={rentProduct}
          formData={rentFormData}
          onFormChange={handleRentFormChange}
          productId={rentFormData?.med?._id || rentFormData?.med?.id || null}
          vendorId={
            rentFormData?.vendor?.vendorId || rentFormData?.vendor?._id || null
          }
          variantId={null}
          onSubmit={handleRentSubmit}
          fixedType="dentalservice"
        />
      )}

      {/* Consultation Modal */}
      <ConsultationModal
        show={showConsultationModal}
        onClose={() => {
          setShowConsultationModal(false);
          setConsultationFormData({
            date: "",
            name: "",
            phone: "",
            category: "",
            address: "",
            med: null,
            vendor: null,
          });
        }}
        formData={consultationFormData}
        onFormChange={(e) =>
          setConsultationFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }))
        }
        productId={
          consultationFormData?.med?._id ||
          consultationFormData?.med?.id ||
          null
        }
        vendorId={
          consultationFormData?.vendor?.vendorId ||
          consultationFormData?.vendor?._id ||
          null
        }
        variantId={null}
        onSubmit={handleConsultationSubmit}
        fixedType="dentalservice"
      />

      {/* Appointment Modal */}
      <AppointmentModal
        show={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false);
          setAppointmentFormData({
            date: "",
            name: "",
            phone: "",
            category: "",
            address: "",
            med: null,
            vendor: null,
          });
        }}
        formData={appointmentFormData}
        onFormChange={(e) =>
          setAppointmentFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }))
        }
        productId={
          appointmentFormData?.med?._id || appointmentFormData?.med?.id || null
        }
        vendorId={
          appointmentFormData?.vendor?.vendorId ||
          appointmentFormData?.vendor?._id ||
          null
        }
        variantId={null}
        onSubmit={handleAppointmentSubmit}
        fixedType="dentalservice"
      />
    </>
  );
};

export default DentalTeeth;
