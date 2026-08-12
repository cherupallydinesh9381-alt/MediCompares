import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  axiosUserInstance,
  axiosCommonInstance,
  imgUrl,
} from "../../../Apiservice";
import { getImageUrl } from "../../../utils/index";
import { toast } from "react-hot-toast";
import { useMediaQuery } from "react-responsive";
import DOMPurify from "dompurify";
import { FaRegShareSquare, FaHeart, FaExchangeAlt, FaStar } from "react-icons/fa";
import { IoIosHeartEmpty } from "react-icons/io";

const getSlugs = (data) => {
  let sub =
    data?.subcatdetails ||
    data?.subcategorydetails ||
    data?.subcategoryDetails ||
    data?.subcategorys;
  if (Array.isArray(sub)) {
    sub = sub[0];
  }

  const cat = sub?.catdetails || sub?.categoryDetails || sub?.category;

  return {
    category: cat?.slug,
    subcategory: sub?.slug,
    slug: data?.slug,
  };
};

const DetailRow = ({ label, value, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!value) return null;

  return (
    <div
      className={`detail-item-compact ${isExpanded ? "is-expanded" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
      }}
      style={{
        cursor: value.length > 25 ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 8px",
        width: "100%"
      }}
      title={title || value}
    >
      <span className="detail-label" style={{ fontSize: "11px", fontWeight: "500", color: "#6b7280", textTransform: "capitalize", letterSpacing: "0.02em" }}>{label}</span>
      <span className="detail-value" style={{ fontSize: "11.5px", fontWeight: "500", color: "#1f2937", textAlign: "right" }}>{value}</span>
    </div>
  );
};

const Favourites = ({ HomeNavigate, BackButton }) => {
  const [favourites, setFavourites] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("All");
  const [hoveredSideEffectsId, setHoveredSideEffectsId] = useState(null);
  const [hoveredPrecautionsId, setHoveredPrecautionsId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const favouritesPerPage = 8;
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const toSearchText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.toLowerCase();
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value).toLowerCase();
    }
    if (Array.isArray(value)) {
      return value
        .map((v) => {
          if (v === null || v === undefined) return "";
          if (typeof v === "string") return v;
          if (typeof v === "number" || typeof v === "boolean") return String(v);
          return v?.name || v?.slug || v?.fixedType || "";
        })
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    }
    if (typeof value === "object") {
      return String(value?.name || value?.slug || value?.fixedType || "").toLowerCase();
    }
    return "";
  };

  const handleShare = async (item, e) => {
    if (e) e.stopPropagation();
    try {
      const serviceType = item?.category?.[0]?.fixedType || "medicine";
      const { category, subcategory, slug } = getSlugs(item);
      const url = `${window.location.origin}/${encodeURIComponent(category || serviceType)}/${encodeURIComponent(subcategory || "all")}/${encodeURIComponent(slug || item._id)}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const fetchFavourites = async () => {
    const token = localStorage.getItem("medicomparestoken");

    if (!token) {
      toast.error("Please login to view favourites");
      navigate("/login");
      return;
    }

    try {
      const response = await axiosUserInstance.get("favourite/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const favs = response.data?.data?.favourites || [];
      const allTablets = favs.flatMap((fav) => fav.tablets || []);
      const services = [
        ...new Set(
          response.data?.data?.favourites
            ?.flatMap((fav) =>
              fav.tablets?.map((tablet) => tablet.category?.[0]?.fixedType)
            )
            ?.filter(Boolean)
        ),
      ];

      setServices(services);
      setFavourites(allTablets);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load favourites.");
      }
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const handleToggleFavourite = async (itemId, isFav) => {
    const token = localStorage.getItem("medicomparestoken");

    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    try {
      const endpoint = isFav ? "favourite/remove" : "favourite/add";
      const payload = { itemId };

      await axiosUserInstance.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (isFav) {
        setFavourites((prev) => prev.filter((item) => item._id !== itemId));
      } else {
        fetchFavourites();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  const filteredFavourites = favourites.filter((item) => {
    if (selectedService && selectedService !== "All") {
      const fixedType = item?.category?.[0]?.fixedType;
      if (fixedType !== selectedService) return false;
    }

    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    const itemName = toSearchText(item?.name);
    const itemCategory = toSearchText(item?.category);
    const itemService = toSearchText(item?.service);

    return (
      itemName.includes(searchLower) ||
      itemCategory.includes(searchLower) ||
      itemService.includes(searchLower)
    );
  });

  const indexOfLastFav = currentPage * favouritesPerPage;
  const indexOfFirstFav = indexOfLastFav - favouritesPerPage;
  const currentFavourites = filteredFavourites.slice(
    indexOfFirstFav,
    indexOfLastFav,
  );
  const totalPages = Math.ceil(filteredFavourites.length / favouritesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedService]);

  const handleProductClick = async (item, e) => {
    if (e) {
      e.preventDefault();
    }

    const productId = item?.slug || item?._id;
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    try {
      const response = await axiosCommonInstance.get(
        `product/show/${productId}`,
      );
      const productData =
        response?.data?.data?.product ||
        response?.data?.product ||
        response?.data?.data ||
        response?.data;

      if (!productData) {
        toast.error("Product not found");
        return;
      }

      const tabletData = productData?.tablet || productData;
      const subcategoryData =
        tabletData?.subcategoryDetails || tabletData?.subcategorys;
      const categoryData =
        subcategoryData?.categoryDetails || subcategoryData?.category;
      const service =
        categoryData?.slug ||
        (categoryData?.name
          ? categoryData.name.toLowerCase().replace(/\s+/g, "-")
          : null) ||
        productData?.service ||
        tabletData?.service ||
        "medicine";
      let categories = null;
      if (subcategoryData?.slug) {
        categories = subcategoryData.slug;
      } else if (subcategoryData?.name) {
        categories = subcategoryData.name.toLowerCase().replace(/\s+/g, "-");
      } else {
        if (service === "lab-tests") {
          categories = "all";
        } else if (service === "home-care-services") {
          categories = "all";
        } else {
          categories = "tablets";
        }
      }

      if (categories === productId) {
        if (service === "lab-tests") {
          categories = "all";
        } else if (service === "home-care-services") {
          categories = "all";
        } else {
          categories = "tablets";
        }
      }

      if (!service || !categories || !productId) {
        toast.error("Product details not available");
        return;
      }

      const isMedicine =
        categoryData?.fixedType === "medicine" ||
        tabletData?.subcategorys?.category?.fixedType === "medicine" ||
        subcategoryData?.category?.fixedType === "medicine";

      const nonMedicineServices = [
        "lab-tests",
        "home-care-services",
        "surgeries",
        "ambulance",
        "consultation",
      ];
      const isNonMedicineService = nonMedicineServices.includes(service);

      let pincode = null;
      if (isMedicine && !isNonMedicineService) {
        const savedLocation = localStorage.getItem("selectedLocation");
        if (savedLocation) {
          try {
            const locationData = JSON.parse(savedLocation);
            if (locationData.pincode && locationData.pincode.length === 6) {
              pincode = locationData.pincode;
            }
          } catch (e) {
          }
        }
      }

      let url = `/${encodeURIComponent(service)}/${encodeURIComponent(categories)}/${encodeURIComponent(productId)}`;

      if (isMedicine && !isNonMedicineService && pincode) {
        url += `?pincode=${pincode}`;
      }

      navigate(url, {
        state: {
          selectedVariantId:
            item.variantId || tabletData?.variant?.[0]?._id || null,
        },
      });
    } catch (error) {
      toast.error("Failed to load product details");
    }
  };


  const sanitizeHTML = (htmlContent) => {
    if (!htmlContent) return "";

    let cleanedContent = htmlContent
      .replace(/\\n/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\\\/g, '')
      .replace(/\\\s*$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return DOMPurify.sanitize(cleanedContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'span', 'div'],
      ALLOWED_ATTR: ['class']
    });
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val).replace(/_/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  };

  return (
    <div className="doc-review">
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
                  width: "100%",
                  marginBottom: "12px",
                }}
              >
                <HomeNavigate />
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
                      className="fa-solid fa-heart"
                      style={{
                        color: "#8059ca",
                        flexShrink: 0,
                      }}
                    ></i>
                    <span
                      style={{
                        whiteSpace: isMobile ? "normal" : "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                        flex: "1",
                        minWidth: 0,
                      }}
                    >
                      My Favourites
                    </span>
                  </h3>
                  <p
                    style={{
                      color: "#666",
                      fontSize: isMobile ? "13px" : "14px",
                      marginTop: "5px",
                      marginBottom: "0",
                      whiteSpace: isMobile ? "normal" : "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    View and manage all your favourite items
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: "12px",
                    width: isMobile ? "100%" : "auto",
                    alignItems: isMobile ? "stretch" : "center",
                  }}
                >
                  {/* Search Input */}
                  <div
                    style={{
                      position: "relative",
                      width: isMobile ? "100%" : "250px",
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search favourites..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        height: "42px",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        padding: "10px 15px 10px 40px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                        width: "100%",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#8059ca")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                        pointerEvents: "none",
                      }}
                    >
                      <i className="fa-solid fa-search" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 px-3 px-md-4">
              {/* Header Section */}
              <div style={{ borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB", padding: "10px 0", marginBottom: "10px" }}>
                <button
                  key="all-services"
                  onClick={() => setSelectedService("All")}
                  style={{
                    display: "inline-block",
                    backgroundColor: selectedService === "All" ? "#8059ca" : "#fff",
                    color: selectedService === "All" ? "#fff" : "#333",
                    border: "1px solid #e0e0e0",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginRight: "8px",
                    marginBottom: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textTransform: "capitalize",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedService !== "All") {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                      e.currentTarget.style.borderColor = "#8059ca";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedService !== "All") {
                      e.currentTarget.style.backgroundColor = "#fff";
                      e.currentTarget.style.borderColor = "#e0e0e0";
                    }
                  }}
                >
                  All
                </button>
                {services.map((service) => (
                  <button
                    key={service}
                    onClick={() => setSelectedService(service)}
                    style={{
                      display: "inline-block",
                      backgroundColor: selectedService === service ? "#8059ca" : "#fff",
                      color: selectedService === service ? "#fff" : "#333",
                      border: "1px solid #e0e0e0",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginRight: "8px",
                      marginBottom: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      textTransform: "capitalize",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedService !== service) {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.borderColor = "#8059ca";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedService !== service) {
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.borderColor = "#e0e0e0";
                      }
                    }}
                  >
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </button>
                ))}
              </div>

              <div className="row">
                {filteredFavourites.length === 0 ? (
                  <div className="col-12">
                    <div
                      className="text-center py-5"
                      style={{
                        padding: "60px 20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "200px",
                          height: "200px",
                          marginBottom: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "50%",
                        }}
                      >
                        <svg
                          width="120"
                          height="120"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ opacity: 0.6 }}
                        >
                          <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            stroke="#dc3545"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                      </div>
                      <h4
                        style={{
                          fontSize: "24px",
                          fontWeight: "600",
                          color: "#333",
                          marginBottom: "10px",
                        }}
                      >
                        {searchTerm ? "No Results Found" : "No Favourites Yet"}
                      </h4>
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#666",
                          marginBottom: "0",
                          maxWidth: "400px",
                        }}
                      >
                        {searchTerm
                          ? "Try adjusting your search term to find what you're looking for"
                          : "Start adding items to your favourites to see them here"}
                      </p>
                    </div>
                  </div>
                ) : (
                  currentFavourites.map((item) => {
                    const serviceType = item?.category?.[0]?.fixedType || "medicine";
                    const DiscountType = item?.discountType;
                    const Discount = item?.discountprice;
                    const CurrentPrice = item?.variant?.[0]?.price || item?.price;
                    let FinalAmount;
                    if (DiscountType === "percentage") {
                      FinalAmount = CurrentPrice - ((Discount / 100) * CurrentPrice);
                    } else if (DiscountType === "price") {
                      FinalAmount = Discount;
                    } else {
                      FinalAmount = item?.variant?.[0]?.discountprice || item?.discountprice || CurrentPrice;
                    }
                    const hasDiscount = FinalAmount < CurrentPrice && FinalAmount > 0;
                    const discountPercent = hasDiscount
                      ? (DiscountType === "percentage" ? Math.round(Discount) : Math.round(((CurrentPrice - FinalAmount) / CurrentPrice) * 100))
                      : 0;

                    return (
                      <div
                        className="col-md-4 col-lg-4 col-xl-3 d-flex mb-4"
                        key={item._id || item.id}
                      >
                        <div
                          className="modern-product-card product-card-vertical h-100 w-100"
                          onClick={() => handleProductClick(item)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            cursor: "pointer",
                            height: "100%",
                            minHeight: "auto",
                            border: "1px solid #dee2e6",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                            borderRadius: "10px",
                            backgroundColor: "#ffffff",
                            transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            position: "relative"
                          }}
                        >
                          {/* Image Container */}
                          <div className="product-image-container-vertical" style={{ position: "relative", overflow: "hidden", background: "#f8fafc", borderTopLeftRadius: "10px", borderTopRightRadius: "10px", height: "168px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img
                              alt={item.name}
                              title={item.name}
                              loading="lazy"
                              src={
                                item.variant &&
                                  item.variant.length > 0 &&
                                  item.variant[0].files &&
                                  item.variant[0].files.length > 0
                                  ? getImageUrl(item.variant[0].files[0])
                                  : item.files && item.files.length > 0
                                    ? getImageUrl(item.files[0])
                                    : item.imageUrl && item.imageUrl.length > 0
                                      ? getImageUrl(item.imageUrl[0])
                                      : "/medicine.jpg"
                              }
                              onError={(e) => {
                                e.target.src = "/medicine.jpg";
                              }}
                              style={{
                                maxHeight: "90%",
                                maxWidth: "90%",
                                objectFit: "contain"
                              }}
                            />

                            {/* Rating Overlay */}
                            <div
                              style={{
                                position: "absolute",
                                top: "10px",
                                left: "10px",
                                background: "#ffffff",
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                border: "1px solid #e0e0e0",
                                zIndex: 10,
                              }}
                            >
                              <FaStar
                                className="text-warning"
                                style={{ fontSize: "10px" }}
                              />
                              <span>{item?.averageRating?.toFixed(1) || "0"}</span>
                              <span
                                style={{ color: "#9ca3af", fontWeight: "400", fontSize: "10px" }}
                              >
                                ({item?.ratingCount > 0 ? `${item.ratingCount}` : "0"})
                              </span>
                            </div>

                            {/* Compare Overlay Button */}
                            <style>{`
                               @keyframes comparePulse {
                                 0% {
                                   box-shadow: 0 0 0 0 rgba(128, 89, 202, 0.6);
                                 }
                                 70% {
                                   box-shadow: 0 0 0 6px rgba(128, 89, 202, 0);
                                 }
                                 100% {
                                   box-shadow: 0 0 0 0 rgba(128, 89, 202, 0);
                                 }
                               }
                               @keyframes compareAutoExpand {
                                 0%, 10%, 40%, 100% {
                                   width: 32px;
                                 }
                                 15%, 35% {
                                   width: 90px;
                                 }
                               }
                               @keyframes textFadeInOut {
                                 0%, 12%, 38%, 100% {
                                   opacity: 0;
                                 }
                                 15%, 35% {
                                   opacity: 1;
                                 }
                               }
                               .compare-btn-highlight {
                                 animation: comparePulse 2s infinite, compareAutoExpand 8s infinite ease-in-out;
                               }
                               .compare-text-label {
                                 animation: textFadeInOut 8s infinite ease-in-out;
                               }
                               .compare-btn-highlight:hover {
                                 animation: comparePulse 2s infinite !important;
                               }
                               .compare-btn-highlight:hover .compare-text-label {
                                 animation: none !important;
                                 opacity: 1 !important;
                               }
                             `}</style>
                            <div
                              data-tooltip-id="global-tooltip"
                              className="compare-btn-highlight"
                              onClick={(e) => {
                                e.stopPropagation();
                                const { category, subcategory, slug } = getSlugs(item);
                                if (slug) {
                                  navigate(
                                    `/${category || serviceType}/${subcategory}/${slug}/compare`,
                                  );
                                }
                              }}
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "#8059ca",
                                color: "#ffffff",
                                border: "1.5px solid #8059ca",
                                borderRadius: "20px",
                                width: "32px",
                                height: "26px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                paddingLeft: "9px",
                                cursor: "pointer",
                                zIndex: 10,
                                boxShadow: "0 2px 8px rgba(128, 89, 202, 0.4)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.width = "90px";
                                e.currentTarget.style.backgroundColor = "#6a45b3";
                                e.currentTarget.style.borderColor = "#6a45b3";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.width = "32px";
                                e.currentTarget.style.backgroundColor = "#8059ca";
                                e.currentTarget.style.borderColor = "#8059ca";
                              }}
                            >
                              <FaExchangeAlt
                                style={{ fontSize: "11px", color: "inherit", flexShrink: 0 }}
                              />
                              <span
                                className="compare-text-label"
                                style={{
                                  marginLeft: "6px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  color: "#ffffff",
                                  opacity: 0,
                                  transition: "opacity 0.2s ease-in-out",
                                }}
                              >
                                Compare
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div
                            className="product-card-body"
                            style={{
                              flex: 1,
                              padding: "8px 10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                            }}
                          >
                            <div className="d-flex align-items-start justify-content-between" style={{ width: "100%", gap: "8px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
                                <div
                                  className="product-title text-capitalize"
                                  title={item.name || ""}
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    lineHeight: "1.3",
                                    margin: 0,
                                    color: "#0f172a",
                                    letterSpacing: "-0.01em",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "block",
                                  }}
                                >
                                  {item.name}
                                </div>
                                {/* Price Display */}
                                {CurrentPrice && (
                                  <div className="d-flex align-items-center flex-wrap" style={{ fontFamily: "Poppins", marginTop: "2px", gap: "6px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>
                                        MRP
                                      </span>
                                      <strong style={{ color: "#0f172a", fontSize: "13px", fontWeight: "700" }}>
                                        ₹{typeof FinalAmount === "number" ? FinalAmount.toFixed(2) : FinalAmount}
                                      </strong>
                                    </span>
                                    {hasDiscount && (
                                      <>
                                        <span style={{ fontSize: "11px", color: "#94a3b8", textDecoration: "line-through" }}>
                                          ₹{typeof CurrentPrice === "number" ? CurrentPrice.toFixed(2) : CurrentPrice}
                                        </span>
                                        <span style={{ fontSize: "10px", fontWeight: "600", color: "#16a34a" }}>
                                          {discountPercent}% OFF
                                        </span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div
                                className="d-flex align-items-center gap-1 ms-2"
                                style={{ flexShrink: 0, marginTop: "2px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div
                                  className="action-icon-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavourite(item._id, true);
                                  }}
                                  style={{ cursor: "pointer", padding: "4px" }}
                                >
                                  <FaHeart size={16} color="#ef4444" />
                                </div>
                                <div
                                  className="action-icon-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(item);
                                  }}
                                  style={{ cursor: "pointer", padding: "4px" }}
                                >
                                  <FaRegShareSquare size={15} color="#9ca3af" />
                                </div>
                              </div>
                            </div>

                            <div className="d-flex align-items-center justify-content-between" style={{ gap: "4px", minWidth: 0 }}>
                              {(item?.brands?.name || item?.brand?.name || item?.manufacture?.name) && (
                                <span
                                  style={{
                                    fontSize: "10.5px",
                                    color: "#8059ca",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    letterSpacing: "0.02em",
                                    background: "#f5f3ff",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(125, 46, 255, 0.1)",
                                    display: "inline-block",
                                    maxWidth: "100%",
                                  }}
                                  title={item?.brands?.name || item?.brand?.name || item?.manufacture?.name}
                                >
                                  By {item?.brands?.name || item?.brand?.name || item?.manufacture?.name}
                                </span>
                              )}
                            </div>

                            {/* Product Details Grid */}
                            <div className="product-details-grid" style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                              {(() => {
                                const specs = [
                                  { label: "Composition", value: item?.compositions?.name || item?.compositionDetails?.name },
                                  { label: "Form", value: item?.form },
                                  { label: "Storage", value: item?.strength },
                                  { label: "Packing", value: item?.packagingDetails },
                                  { label: "Sample", value: item?.smapletype },
                                  { label: "Model", value: item?.model },
                                  { label: "Condition", value: item?.condition },
                                  { label: "Time", value: item?.duration },
                                  { label: "Complexity", value: item?.complexity },
                                  { label: "Procedure", value: item?.procedureType },
                                  { label: "Treatment", value: item?.treatmenttype },
                                  { label: "Recovery", value: item?.recoveryTime },
                                  { label: "Shift", value: item?.shiftType?.replace(/_/g, " ") },
                                  { label: "Type", value: item?.nursecareType || item?.ambulancetype },
                                  { label: "Gender", value: item?.gender },
                                  { label: "Body", value: item?.bodypart },
                                  { label: "Contrast", value: item?.iscontrast },
                                  { label: "Fasting", value: item?.isFasting ? (typeof item.isFasting === "string" ? item.isFasting : "Yes") : null },
                                  { label: "Param", value: item?.parameterss?.length > 0 ? `${item.parameterss.length} Tests` : null }
                                ].filter(spec => spec.value !== null && spec.value !== undefined && String(spec.value).trim() !== "");

                                return specs.slice(0, 2).map((spec, specIdx) => (
                                  <DetailRow key={specIdx} label={spec.label} value={spec.value} />
                                ));
                              })()}
                            </div>

                            {/* View Details Button */}
                            <button
                              onClick={(e) => handleProductClick(item, e)}
                              style={{
                                display: "block",
                                width: "100%",
                                textAlign: "center",
                                padding: "5px 16px",
                                backgroundColor: "#8059ca",
                                color: "#fff",
                                borderRadius: "8px",
                                border: "none",
                                fontSize: "12px",
                                fontWeight: "500",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                marginTop: "auto",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#6b1fe6";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(125, 46, 255, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#8059ca";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination dashboard-pagination mt-4">
                  <ul className="d-flex justify-content-center">
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

                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i}>
                        <button
                          className={`page-link ${currentPage === i + 1 ? "active" : ""
                            }`}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

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

export default Favourites;