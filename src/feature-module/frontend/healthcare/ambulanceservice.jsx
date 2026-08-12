import { useState, useEffect } from "react";
import AmbulanceBookingModal from "./AmbulanceBookingModal.jsx";
import { getImageUrl } from "../../../utils/index";
import { axiosCommonInstance } from "../../../Apiservice";
import toast from "react-hot-toast";
import Slider from "react-slick";
import { getHealthcareTwoSlideOfferSettings } from "./healthcareSliderSettings.jsx";
import SEOHelmet from "../../../components/SEOHelmet";
const ambulanceservice = ({
  imgUrl,
  categories,
  categories1,
  middleBanners,
  isMobile,
  selectedPincode,
  latitude,
  longitude,
  hasTopBanner = false,
}) => {
  const [expandedFaq, setExpandedFaq] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredEmergencyVehicles, setFilteredEmergencyVehicles] = useState(
    [],
  );

  const [emergencyCurrentPage, setEmergencyCurrentPage] = useState(1);
  const emergencyItemsPerPage = 8;

  const [topBookedCurrentPage, setTopBookedCurrentPage] = useState(1);
  const topBookedItemsPerPage = 4;

  const handleBookNow = (e, vehicle) => {
    e.stopPropagation();
    setSelectedCategory(vehicle);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedCategory(null);
  };

  const handleSearch = async (query) => {
    if (!query || query.trim() === "") {
      setSearchResults([]);
      setFilteredEmergencyVehicles([]);
      return;
    }

    setIsLoading(true);
    try {
      let apiUrl = `search/ambulanceservice?search=${encodeURIComponent(query.trim())}`;
      if (selectedPincode) {
        apiUrl += `&location=${selectedPincode}`;
        if (latitude && longitude) {
          apiUrl += `&lat=${latitude}&lng=${longitude}`;
        }
      }

      const response = await axiosCommonInstance.get(apiUrl);
      const products = response?.data?.data?.products || [];
      setSearchResults(products);
      setFilteredEmergencyVehicles(products);
    } catch (error) {
      toast.error("Error searching ambulance services:", error);
      setSearchResults([]);
      setFilteredEmergencyVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value || value.trim() === "") {
      setSearchResults([]);
      setFilteredEmergencyVehicles([]);
    } else {
      handleSearch(value);
    }
  };

  const settings = getHealthcareTwoSlideOfferSettings();

  const faqs = [
    {
      id: 1,
      question: "What types of ambulance services does MediCompares offer?",
      answer:
        "We provide Basic Life Support (BLS), Advanced Life Support (ALS), ICU ambulances, neonatal ambulances, and non-emergency patient transport services.",
    },
    {
      id: 2,
      question: "How quickly can an ambulance reach my location?",
      answer:
        "Response times vary by location, but we aim to dispatch the nearest available ambulance immediately to ensure the fastest possible arrival.",
    },
    {
      id: 3,
      question: "Can I book an ambulance for a non-emergency situation?",
      answer:
        "Yes, you can book ambulances for routine hospital visits, patient transfers, medical appointments, and planned transportation.",
    },
    {
      id: 4,
      question: "Do the ambulances have trained medical staff?",
      answer:
        "Yes. Depending on the ambulance type, vehicles are staffed with trained EMTs, paramedics, nurses, or doctors to provide appropriate medical support.",
    },
    {
      id: 5,
      question: "Are the ambulance charges covered by insurance?",
      answer:
        "Some insurance providers cover ambulance charges for emergencies. Coverage varies by policy, so it’s recommended to confirm with your insurer.",
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const emergencyTotalPages = Math.ceil(
    (filteredEmergencyVehicles.length > 0
      ? filteredEmergencyVehicles
      : categories?.length || 0) / emergencyItemsPerPage,
  );
  const emergencyStartIndex =
    (emergencyCurrentPage - 1) * emergencyItemsPerPage;
  const emergencyEndIndex = emergencyStartIndex + emergencyItemsPerPage;
  const emergencyCurrentItems =
    (filteredEmergencyVehicles.length > 0
      ? filteredEmergencyVehicles
      : categories
    )?.slice(emergencyStartIndex, emergencyEndIndex) || [];

  const topBookedTotalPages = Math.ceil(
    (categories1?.length || 0) / topBookedItemsPerPage,
  );
  const topBookedStartIndex =
    (topBookedCurrentPage - 1) * topBookedItemsPerPage;
  const topBookedEndIndex = topBookedStartIndex + topBookedItemsPerPage;
  const topBookedCurrentItems =
    categories1?.slice(topBookedStartIndex, topBookedEndIndex) || [];

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination dashboard-pagination mt-4">
        <ul className="d-flex justify-content-center align-items-center gap-1">
          <li>
            <button
              className="page-link"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              );
            }

            if (page === currentPage - 2 || page === currentPage + 2) {
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
                onPageChange(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </li>
        </ul>
      </div>
    );
  };

  const PRIMARY_COLOR = "#8059ca";
  const PRIMARY_SECTION_BG = "#f8f4ff";
  const PRIMARY_DARK = "#6d48b8";
  const PRIMARY_GRADIENT = `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%)`;
  const medicomparesSectionStyle = {
    backgroundColor: "#E8E4F5",
    backgroundImage: "url('/assets/Medicompares%20Background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
  const gradientHeadingStyle = {
    background: PRIMARY_GRADIENT,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: PRIMARY_COLOR,
  };

  return (
    <>
      <SEOHelmet page="ambulance" />
      <section
        style={{
          display: isMobile ? "none" : "block",
          padding: isMobile ? "0px" : "20px",
          position: "relative",
          marginTop: hasTopBanner ? "10px" : "120px",
          zIndex: "9",
        }}
        className="search-section1"
      >
        <div
          className="container-fluid px-3 px-md-4"
          style={{ maxWidth: "850px" }}
        >
          <div className="row">
            <div className="col-12 mt-3">
              <div
                style={{
                  margin: "0 auto",
                  maxWidth: "850px",
                }}
                className="search-wrapper1"
              >
                <form onSubmit={(e) => e.preventDefault()}>
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "30px",
                      border: "1.5px solid #e5e7eb",
                      boxShadow:
                        "0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.01)",
                      transition:
                        "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      overflow: "hidden",
                      position: "relative",
                      display: isMobile ? "none" : "flex",
                      alignItems: "center",
                      padding: "8px",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "25px",
                        height: "25px",
                        color: "#9ca3af",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className="fas fa-search"
                        style={{
                          fontSize: "14px",
                          color: "#9ca3af",
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Search Ambulance Services..."
                      className="search-input"
                      value={searchQuery}
                      onChange={handleInputChange}
                      style={{
                        border: "none",
                        outline: "none",
                        flex: 1,
                        fontSize: "clamp(14px, 2vw, 16px)",
                        padding: "0",
                        color: "#111827",
                        background: "transparent",
                        fontFamily: "inherit",
                        fontWeight: "400",
                        minWidth: "0",
                      }}
                    />

                    {isLoading && (
                      <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                        style={{
                          width: "16px",
                          height: "16px",
                          borderWidth: "2px",
                          color: PRIMARY_COLOR,
                        }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div >
      </section >

      <div className="d-flex justify-content-center gap-2 gap-md-4 my-3 flex-wrap px-3">
        <button
          className="btn btn-light"
          data-tooltip-id="global-tooltip"
          data-tooltip-content="Service is not available at the moment"
          style={{
            cursor: "not-allowed",
            fontSize: isMobile ? "12px" : "15px",
            padding: isMobile ? "8px 14px" : "10px 24px",
          }}
        >
          Emergency Services
        </button>

        <button
          className="btn btn-primary"
          data-tooltip-id="global-tooltip"
          data-tooltip-content="Patient Transport Services"
          style={{
            fontSize: isMobile ? "12px" : "15px",
            padding: isMobile ? "8px 14px" : "10px 24px",
          }}
        >
          Patient Transport Services
        </button>
      </div>

      {
        !isLoading && searchQuery && searchResults.length === 0 && (
          <section
            className="mx-2"
            style={{ padding: "20px 0", backgroundColor: "#ffffff" }}
          >
            <div className="container-fluid text-center">
              <p className="text-muted">
                No ambulance services found for "{searchQuery}"
              </p>
            </div>
          </section>
        )
      }

      {
        (filteredEmergencyVehicles.length > 0 ||
          (categories && categories.length > 0 && !searchQuery)) && (
          <section className="mx-2 pt-2" style={{ backgroundColor: PRIMARY_SECTION_BG }}>
            <div className="container-fluid">
              <h2
                style={{
                  fontSize: "26px",
                  fontWeight: "600",
                  marginBottom: "10px",
                  paddingBottom: "10px",
                  textAlign: "center",
                  ...gradientHeadingStyle,
                }}
              >
                Patient Transport Services
                {filteredEmergencyVehicles.length > 0 &&
                  ` (${filteredEmergencyVehicles.length})`}
              </h2>

              <div className="row g-4">
                {emergencyCurrentItems.map((vehicle, index) => (
                  <div
                    key={emergencyStartIndex + index}
                    className="col-12 col-sm-6 col-md-3"
                  >
                    <div
                      className="ambulance-cards text-start"
                      key={vehicle._id || index}
                    >
                      <img
                        src={
                          vehicle?.tabletdetails?.files?.length
                            ? getImageUrl(vehicle.tabletdetails.files[0])
                            : "/assets/default.png"
                        }
                        className="ambulance-img"
                        alt={vehicle?.tabletdetails?.name}
                        title={vehicle?.tabletdetails?.name}
                        loading="lazy"
                      />

                      <div
                        className="text-dark text-start fw-bold mt-2"
                        style={{ fontSize: "13px", textTransform: "capitalize" }}
                      >
                        {vehicle?.tabletdetails?.name}
                      </div>

                      <div className="verifiedss text-start">✔ Verified</div>

                      <div className="text-muted small mt-1 text-start">
                        Facilities:
                      </div>

                      <div className="facilitiesss text-start d-flex gap-2 flex-wrap">
                        {vehicle?.tabletdetails?.facilitiesdetails?.length > 0 ? (
                          vehicle.tabletdetails.facilitiesdetails.map(
                            (facility) => (
                              <img
                                key={facility._id}
                                src={
                                  facility?.files?.[0]
                                    ? getImageUrl(facility.files[0])
                                    : "/assets/default.png"
                                }
                                className="facility-icon"
                                title={facility?.name || "Facility"}
                                alt={facility?.name || "Facility"}
                                loading="lazy"
                              />
                            ),
                          )
                        ) : (
                          <img
                            src="/assets/default.png"
                            className="facility-icon"
                            alt="No Facility"
                          />
                        )}
                      </div>

                      <button
                        className="book-btnss"
                        onClick={(e) => handleBookNow(e, vehicle)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={emergencyCurrentPage}
                totalPages={emergencyTotalPages}
                onPageChange={setEmergencyCurrentPage}
              />
            </div>
          </section>
        )
      }

      {
        categories1 && categories1.length > 0 && (
          <section
            className="mx-2"
            style={{ padding: "20px 0", backgroundColor: PRIMARY_SECTION_BG }}
          >
            <div className="container-fluid">
              <h2
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  marginBottom: "10px",
                  textAlign: "center",
                  ...gradientHeadingStyle,
                }}
              >
                Top Most Booked Ambulances
              </h2>

              <div className="row g-4">
                {topBookedCurrentItems.map((vehicle, index) => (
                  <div
                    key={topBookedStartIndex + index}
                    className="col-12 col-sm-6 col-md-3"
                  >
                    <div
                      className="ambulance-cards text-start"
                      key={vehicle._id || index}
                    >
                      <img
                        src={
                          vehicle?.tabletdetails?.files?.length
                            ? getImageUrl(vehicle.tabletdetails.files[0])
                            : "/assets/default.png"
                        }
                        className="ambulance-img"
                        alt={vehicle?.tabletdetails?.name}
                        title={vehicle?.tabletdetails?.name}
                        loading="lazy"
                      />

                      <div
                        className="text-dark text-start fw-bold mt-2"
                        style={{ fontSize: "13px", textTransform: "capitalize" }}
                      >
                        {vehicle?.tabletdetails?.name}
                      </div>

                      <div className="verifiedss text-start">✔ Verified</div>

                      <div className="text-muted small mt-1 text-start">
                        Facilities:
                      </div>
                      <div className="facilitiesss text-start d-flex gap-2 flex-wrap">
                        {vehicle?.tabletdetails?.facilitiesdetails?.length > 0 ? (
                          vehicle.tabletdetails.facilitiesdetails.map(
                            (facility) => (
                              <img
                                key={facility._id}
                                src={
                                  facility?.files?.[0]
                                    ? getImageUrl(facility.files[0])
                                    : "/assets/default.png"
                                }
                                className="facility-icon"
                                title={facility?.name || "Facility"}
                                alt={facility?.name || "Facility"}
                                loading="lazy"
                              />
                            ),
                          )
                        ) : (
                          <img
                            src="/assets/default.png"
                            className="facility-icon"
                            alt="No Facility"
                          />
                        )}
                      </div>

                      <button
                        className="book-btnss"
                        onClick={(e) => handleBookNow(e, vehicle)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={topBookedCurrentPage}
                totalPages={topBookedTotalPages}
                onPageChange={setTopBookedCurrentPage}
              />
            </div>
          </section>
        )
      }

      {
        middleBanners?.length > 0 && (
          <section
            className="section welcome-section px-3 mt-3 "
            style={{ backgroundColor: PRIMARY_SECTION_BG, minHeight: "280px" }}
          >
            <div className="container-fluid">
              <div className="text-center mb-3">
                <h2 className="mb-3" style={{ fontSize: "28px", fontWeight: "700" }}>
                  <i className="fas fa-bolt me-2" style={{ color: PRIMARY_COLOR }} />
                  <span style={gradientHeadingStyle}>Offers & Promotions</span>
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
        )
      }

      {/* <section style={{ padding: "60px 0", ...medicomparesSectionStyle }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "600",
                marginBottom: "8px",
                ...gradientHeadingStyle,
              }}
            >
              Special Offers
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#666",
                fontWeight: "400",
              }}
            >
              Save more on emergency ambulance services
            </p>
          </div>

          <div className="row g-3 justify-content-center">
            {[
              {
                title: "Emergency Offer",
                discount: "10% off up to ₹12,000",
                code: "AMBN10",
                featured: true,
              },
              {
                title: "Quick Support",
                discount: "5% off up to ₹6,000",
                code: "AMB5",
                featured: false,
              },
              {
                title: "Medical Transport",
                discount: "10% off up to ₹10,000",
                code: "AMB10",
                featured: true,
              },
            ].map((offer, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "20px",
                    border: offer.featured
                      ? `2px solid ${PRIMARY_COLOR}`
                      : "1px solid rgba(128, 89, 202, 0.15)",
                    position: "relative",
                    transition: "all 0.3s ease",
                    height: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {offer.featured && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "16px",
                        background: PRIMARY_GRADIENT,
                        color: "#fff",
                        padding: "4px 12px",
                        fontSize: "11px",
                        fontWeight: "700",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(255, 193, 7, 0.3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Popular
                    </div>
                  )}

              
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                    }}
                  >
           
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        background: PRIMARY_GRADIENT,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      <i
                        className="fas fa-percent"
                        style={{
                          fontSize: "24px",
                          color: "#fff",
                        }}
                      />
                    </div>

                 
                    <div style={{ flex: 1 }}>
                      <h5
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#1a1a1a",
                          marginBottom: "6px",
                          lineHeight: "1.2",
                        }}
                      >
                        {offer.title}
                      </h5>
                      <p
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#333",
                          marginBottom: "8px",
                          lineHeight: "1.3",
                        }}
                      >
                        {offer.discount}
                      </p>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: PRIMARY_SECTION_BG,
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px dashed rgba(128, 89, 202, 0.3)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: PRIMARY_COLOR,
                            fontFamily: "monospace",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {offer.code}
                        </span>
                        <i
                          className="fas fa-copy"
                          style={{
                            fontSize: "12px",
                            color: "#999",
                            cursor: "pointer",
                          }}
                          title="Copy code"
                        />
                      </div>
                    </div>
                  </div>

              
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "11px",
                      color: "#999",
                      fontStyle: "italic",
                    }}
                  >
                    *Terms & conditions apply
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section style={{ padding: isMobile ? "30px 0" : "50px 0", ...medicomparesSectionStyle }}>
        <div className="container-fluid" style={{ maxWidth: "1320px" }}>
          {/* Section Header */}
          <div className="row mb-4">
            <div className="col-12 text-center">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(128, 89, 202, 0.1)",
                  color: PRIMARY_COLOR,
                  border: "1px solid rgba(128, 89, 202, 0.25)",
                  borderRadius: "30px",
                  padding: "6px 18px",
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                  backdropFilter: "blur(4px)",
                }}
              >
                <i className="fas fa-bolt" style={{ color: "#eab308" }} /> Fast Emergency Dispatch
              </div>
              <h2
                style={{
                  fontSize: isMobile ? "28px" : "38px",
                  fontWeight: "750",
                  textAlign: "center",
                  marginBottom: "10px",
                  letterSpacing: "-0.5px",
                  ...gradientHeadingStyle,
                }}
              >
                Booking Process
              </h2>
              <p
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  color: "#64748b",
                  maxWidth: "600px",
                  margin: "0 auto",
                  lineHeight: "1.6",
                }}
              >
                Get immediate medical transit in 3 simple steps — transparent pricing, instant assignment, and live GPS tracking.
              </p>
            </div>
          </div>

          {/* Main Outer Container */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: isMobile ? "20px 16px" : "36px 32px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 12px 35px rgba(128, 89, 202, 0.07)",
            }}
          >
            <div className="row align-items-center g-4">
              {/* Left Column: Clean Image Showcase Card */}
              <div className="col-lg-5 col-md-12">
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "12px",
                    position: "relative",
                    boxShadow: "0 10px 30px rgba(128, 89, 202, 0.1)",
                    border: "1.5px solid rgba(128, 89, 202, 0.15)",
                    overflow: "hidden",
                  }}
                >
                  {/* Floating Live Dispatch Badge Overlay */}
                  {/* <div
                    style={{
                      position: "absolute",
                      top: "24px",
                      left: "24px",
                      background: "rgba(15, 23, 42, 0.85)",
                      backdropFilter: "blur(12px)",
                      color: "#ffffff",
                      padding: "6px 14px",
                      borderRadius: "30px",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      zIndex: 10,
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        boxShadow: "0 0 8px #22c55e",
                        display: "inline-block",
                      }}
                    />
                    LIVE DISPATCH ACTIVE
                  </div> */}

                  {/* Main Illustration Image */}
                  <img
                    src="/assets/img/ambulance_booking_illustration.png"
                    alt="Ambulance Booking Process Illustration"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: isMobile ? "320px" : "420px",
                      objectFit: "cover",
                      borderRadius: "14px",
                      display: "block",
                      transition: "transform 0.4s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />

                  {/* Clean Bottom Feature Strip */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginTop: "12px",
                      padding: "4px 4px 0 4px",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "11.5px",
                        fontWeight: "650",
                        color: PRIMARY_COLOR,
                        background: PRIMARY_SECTION_BG,
                        padding: "7px 8px",
                        borderRadius: "10px",
                        border: "1px solid rgba(128, 89, 202, 0.12)",
                      }}
                    >
                      <i className="fas fa-bolt" style={{ color: "#eab308", fontSize: "12px" }} /> Fast Dispatch
                    </span>
                    <span
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "11.5px",
                        fontWeight: "650",
                        color: PRIMARY_COLOR,
                        background: PRIMARY_SECTION_BG,
                        padding: "7px 8px",
                        borderRadius: "10px",
                        border: "1px solid rgba(128, 89, 202, 0.12)",
                      }}
                    >
                      <i className="fas fa-map-marker-alt" style={{ color: PRIMARY_COLOR, fontSize: "12px" }} /> Live GPS
                    </span>
                    <span
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "11.5px",
                        fontWeight: "650",
                        color: PRIMARY_COLOR,
                        background: PRIMARY_SECTION_BG,
                        padding: "7px 8px",
                        borderRadius: "10px",
                        border: "1px solid rgba(128, 89, 202, 0.12)",
                      }}
                    >
                      <i className="fas fa-user-nurse" style={{ color: "#38bdf8", fontSize: "12px" }} /> EMT Staff
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3 Modern Step Cards */}
              <div className="col-lg-7 col-md-12">
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    {
                      num: "01",
                      icon: "fas fa-search-location",
                      title: "Choose & Compare Ambulances",
                      description: "Select your ambulance type (BLS, ALS, ICU) and compare nearby providers instantly by fare, ratings, and arrival response times.",
                      tags: ["✓ Transparent Pricing", "✓ Nearby Vehicles"],
                    },
                    {
                      num: "02",
                      icon: "fas fa-calendar-check",
                      title: "Book Instantly & Confirm",
                      description: "Input your pickup address and destination hospital, confirm patient condition details, and choose your preferred payment option.",
                      tags: ["✓ Instant Confirmation", "✓ Secure Online / COD"],
                    },
                    {
                      num: "03",
                      icon: "fas fa-route",
                      title: "Track & Reach Safely",
                      description: "Access real-time GPS tracking, view driver and medical staff details, and share live location with family until safe hospital arrival.",
                      tags: ["✓ Live GPS Tracking", "✓ Direct Driver Contact"],
                    },
                  ].map((step) => (
                    <div
                      key={step.num}
                      style={{
                        background: "#ffffff",
                        borderRadius: "20px",
                        padding: isMobile ? "18px 16px" : "24px",
                        boxShadow: "0 8px 24px rgba(128, 89, 202, 0.06)",
                        border: "1.5px solid #f1f5f9",
                        display: "flex",
                        gap: isMobile ? "14px" : "20px",
                        alignItems: "flex-start",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.borderColor = PRIMARY_COLOR;
                        e.currentTarget.style.boxShadow = "0 12px 30px rgba(128, 89, 202, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "#f1f5f9";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(128, 89, 202, 0.06)";
                      }}
                    >
                      {/* Top Right Step Number Accent */}
                      <span
                        style={{
                          position: "absolute",
                          top: "16px",
                          right: "20px",
                          fontSize: "24px",
                          fontWeight: "900",
                          color: "rgba(128, 89, 202, 0.15)",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {step.num}
                      </span>

                      {/* Step Icon */}
                      <div
                        style={{
                          width: isMobile ? "54px" : "64px",
                          height: isMobile ? "54px" : "64px",
                          borderRadius: "16px",
                          background: "linear-gradient(135deg, #f3effa 0%, #e8e0fb 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: "1px solid rgba(128, 89, 202, 0.2)",
                          boxShadow: "0 4px 12px rgba(128, 89, 202, 0.1)",
                          alignSelf: "center"
                        }}
                      >
                        <i className={step.icon} style={{ fontSize: isMobile ? "22px" : "26px", color: PRIMARY_COLOR }} />
                      </div>

                      {/* Step Info */}
                      <div style={{ flex: 1, minWidth: 0, paddingRight: "30px" }}>
                        <h4
                          style={{
                            fontSize: isMobile ? "17px" : "19px",
                            fontWeight: "600",
                            color: "#1e293b",
                            marginBottom: "6px",
                          }}
                        >
                          {step.title}
                        </h4>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            margin: 0,
                            lineHeight: "1.6",
                            marginBottom: "12px",
                          }}
                        >
                          {step.description}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {step.tags.map((tag, i) => (
                            <span key={i} style={{ fontSize: "11.5px", fontWeight: "600", color: PRIMARY_COLOR, background: PRIMARY_SECTION_BG, padding: "3px 10px", borderRadius: "12px" }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section >

      <section style={{ padding: "60px 0", ...medicomparesSectionStyle }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "600",
                marginBottom: "8px",
                ...gradientHeadingStyle,
              }}
            >
              Why Choose Us?
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#666",
                fontWeight: "400",
              }}
            >
              Trusted emergency ambulance services across the region
            </p>
          </div>

          <div className="row g-3">
            {[
              {
                icon: "fas fa-heartbeat",
                title: "1000+ Lives Saved",
                description:
                  "Trusted by thousands of families in emergency situations",
              },
              {
                icon: "fas fa-ambulance",
                title: "1000+ Ambulances",
                description: "Wide network of verified ambulance providers",
              },
              {
                icon: "fas fa-clock",
                title: "24/7 Availability",
                description: "Round-the-clock emergency medical services",
              },
              {
                icon: "fas fa-shield-alt",
                title: "Verified & Safe",
                description:
                  "All ambulances verified and equipped with medical staff",
              },
            ].map((item, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "24px 20px",
                    textAlign: "center",
                    border: "1px solid rgba(128, 89, 202, 0.12)",
                    height: "100%",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(128, 89, 202, 0.15)";
                    e.currentTarget.style.borderColor = PRIMARY_COLOR;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor =
                      "rgba(128, 89, 202, 0.12)";
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "12px",
                      background: PRIMARY_GRADIENT,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <i
                      className={item.icon}
                      style={{
                        fontSize: "28px",
                        color: "#fff",
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h5
                    style={{
                      fontSize: "17px",
                      fontWeight: "600",
                      color: PRIMARY_COLOR,
                      marginBottom: "8px",
                      lineHeight: "1.3",
                    }}
                  >
                    {item.title}
                  </h5>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: "1.5",
                      marginBottom: "0",
                      fontWeight: "400",
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{ padding: "30px 0", backgroundColor: PRIMARY_SECTION_BG }}
        className="mx-2"
      >
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-5 col-md-12 mb-4 mb-lg-0">
              <img
                src="/assets/img/bg/ambulance.webp"
                alt="Ambulance Service FAQ"
                className="img-fluid rounded w-100 d-lg-block d-none"
                style={{ maxHeight: "420px", objectFit: "cover" }}
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
                        color: PRIMARY_COLOR,
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

      <AmbulanceBookingModal
        show={showBookingModal}
        onClose={closeBookingModal}
        selectedCategory={selectedCategory}
        imgUrl={imgUrl}
      />
    </>
  );
};

export default ambulanceservice;
