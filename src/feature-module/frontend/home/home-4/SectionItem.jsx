import React, { useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { getSectionTheme } from "./sectionThemes";
import { normalizeItem, buildImageSrc } from "./dynamicSectionUtils";
import { getSliderSettings } from "./SectionSlider";

const SectionItem = ({
  section,
  sectionIndex,
  onProductClick,
  onCompareClick,
  onVendorClick,
  imgUrl,
  liteMode,
}) => {
  const { title, serviceId, products } = section;
  const currentTheme = getSectionTheme(serviceId);
  const icon = currentTheme.icon;
  const viewAllLink = `/${serviceId?.slug || "medicine"}/all`;

  const [isViewAllHovered, setIsViewAllHovered] = useState(false);
  const [hoveredCardIdx, setHoveredCardIdx] = useState(null);

  return (
    <section
      className={`my-4 px-2 px-md-3 home-dynamic-section medical-category-section${
        liteMode ? " home-dynamic-section-lite" : ""
      }`}
      style={{
        backgroundImage: liteMode ? "none" : currentTheme.sectionBg,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "420px",
        padding: "22px 0",
        transition: "background 0.3s ease",
      }}
    >
      <div className="home-dynamic-section-inner">
        <div
          className="d-flex align-items-center justify-content-between mb-4 px-3 py-2"
          style={{
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(10px)",
            borderRadius: "18px",
            border: "1px solid rgba(255, 255, 255, 0.65)",
            boxShadow: "0 10px 30px rgba(95, 70, 150, 0.06)",
          }}
        >
          <div
            className="d-flex align-items-center"
            style={{
              padding: "7px 14px",
              background: currentTheme.headerBadgeBg,
              color: currentTheme.headerBadgeText,
              borderRadius: "999px",
              fontWeight: "700",
              fontSize: "14px",
              boxShadow: "0 6px 18px rgba(126, 87, 194, 0.12)",
            }}
          >
            <i className={icon} style={{ marginRight: "9px", fontSize: "15px" }} />
            {title}
          </div>

          <Link
            to={viewAllLink}
            onClick={() => {
              localStorage.setItem(
                "fixedType",
                serviceId?.fixedType || "medicine"
              );
            }}
            onMouseEnter={() => setIsViewAllHovered(true)}
            onMouseLeave={() => setIsViewAllHovered(false)}
            className="top-vendor-badge"
            style={{
              padding: "6px 12px",
              color: isViewAllHovered ? "#ffffff" : currentTheme.viewAllText,
              background: isViewAllHovered ? currentTheme.priceBadgeBg : currentTheme.viewAllBg,
              border: `1px solid ${isViewAllHovered ? currentTheme.priceBadgeBg : "rgba(109, 63, 209, 0.16)"}`,
              borderRadius: "999px",
              fontWeight: "600",
              boxShadow: isViewAllHovered
                ? "0 8px 20px rgba(124, 58, 237, 0.18)"
                : "0 4px 12px rgba(128, 89, 202, 0.06)",
              transition: "all 0.2s ease",
            }}
          >
            View All
            <i className="isax isax-arrow-right-1 ms-1 " />
          </Link>
        </div>

        <div className="doctor-slider-one owl-theme px-3">
          <Slider {...getSliderSettings(products?.length || 0)}>
            {products?.map((item, productIndex) => {
              const normalizedItem = normalizeItem(item);
              const variants = normalizedItem.variants;
              const productTitle =
                normalizedItem?.name ||
                item?.title ||
                item?.productName ||
                item?.tablet?.name ||
                item?.tabletdetails?.name ||
                "Beauty Skincare";

              const priceValue = Number(
                variants?.price ||
                normalizedItem?.price ||
                item?.price ||
                item?.tablet?.price ||
                item?.tabletdetails?.price ||
                item?.productDetails?.price ||
                0
              );

              const productPrice = Number.isFinite(priceValue)
                ? `₹ ${priceValue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
                : "₹0.00";

              const vendorName =
                normalizedItem?.vendordetails?.name ||
                item?.vendor?.name ||
                item?.brand?.name ||
                item?.supplier?.name ||
                item?.manufacturer?.name ||
                "Premium Store";

              const vendorImageSrc = buildImageSrc([
                normalizedItem?.vendordetails?.bussiness_image,
                normalizedItem?.vendordetails?.bussinessdetails?.bussiness_image,
                item?.vendor?.bussiness_image,
                item?.vendor?.bussinessdetails?.bussiness_image,
                item?.supplier?.bussiness_image,
                item?.manufacturer?.bussiness_image,
                item?.vendor?.image,
                item?.supplier?.image,
                item?.manufacturer?.image,
                item?.vendor?.logo,
                item?.supplier?.logo,
                item?.manufacturer?.logo,
              ], imgUrl);

              const cardKey = `${sectionIndex}-${productIndex}`;
              const isCardHovered = hoveredCardIdx === cardKey;

              const resolvedImage = buildImageSrc([
                variants?.files,
                variants?.imageUrl,
                normalizedItem?.variants?.files,
                normalizedItem?.variants?.imageUrl,
                item?.productDetails?.variants?.[0]?.files,
                item?.productDetails?.variants?.[0]?.imageUrl,
                normalizedItem?.productDetails?.variants?.[0]?.files,
                normalizedItem?.productDetails?.variants?.[0]?.imageUrl,
                normalizedItem?.files,
                item?.files,
                normalizedItem?.images,
                item?.images,
                normalizedItem?.imageUrl,
                item?.imageUrl,
                normalizedItem?.tabletdetails?.files,
                normalizedItem?.tabletdetails?.imageUrl,
                item?.tabletdetails?.files,
                item?.tabletdetails?.imageUrl,
                item?.tabletdetails?.image,
                item?.productDetails?.files,
                item?.productDetails?.imageUrl,
                item?.productDetails?.image,
                normalizedItem?.productDetails?.files,
                normalizedItem?.productDetails?.imageUrl,
                normalizedItem?.productDetails?.image,
                item?.tablet?.imageUrl,
                item?.tablet?.files,
                item?.tablet?.image,
                normalizedItem?.image,
                item?.image
              ], imgUrl);

              const imageSrc = resolvedImage || "https://placehold.co";

              return (
                <div
                  key={item._id || `${section._id}-${productIndex}`}
                  className="px-2 py-3 home-dynamic-premium-card-slide"
                  style={{ padding: "0 12px !important", overflow: "visible !important" }}
                >
                  <div
                    className="bg-white text-center d-flex flex-column justify-content-between position-relative overflow-visible"
                    style={{
                      borderRadius: "22px",
                      boxShadow: isCardHovered
                        ? "0 18px 40px rgba(109, 63, 209, 0.16)"
                        : "0 12px 24px rgba(15, 23, 42, 0.05)",
                      width: "200px",
                      height: "300px",
                      margin: "0 auto",
                      border: "1px solid rgba(109, 63, 209, 0.08)",
                      transform: isCardHovered ? "translateY(-6px)" : "translateY(0)",
                      transition: "all 0.24s ease",
                    }}
                    onMouseEnter={() => setHoveredCardIdx(cardKey)}
                    onMouseLeave={() => setHoveredCardIdx(null)}
                  >
                    <button
                      type="button"
                      className="btn btn-sm position-absolute"
                      style={{
                        top: "-2px",
                        right: "-6px",
                        width: "30px",
                        height: "30px",
                        borderRadius: "60%",
                        background: "rgba(255, 255, 255, 0.96)",
                        border: "1px solid rgba(109, 63, 209, 0.12)",
                        boxShadow: "0 8px 16px rgba(15, 23, 42, 0.08)",
                        zIndex: 3,
                        padding: 0,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onCompareClick(normalizedItem, section);
                      }}
                      aria-label="Compare product"
                    >
                      <i className="fas fa-balance-scale" style={{ color: "#7c3aed", fontSize: "12px" }} />
                    </button>

                    <div
                      className="position-relative pt-3 pb-3 overflow-hidden d-flex align-items-center justify-content-center"
                      style={{
                        height: "130px",
                        background: currentTheme.cardHeaderCircleBg,
                        borderBottomLeftRadius: "50% 18px",
                        borderBottomRightRadius: "50% 18px",
                      }}
                    >
                      <style>{`
                        @keyframes rapidBlink {
                          0%, 100% { opacity: 1; }
                          50% { opacity: 0.2; }
                        }
                        @keyframes ratingPulseBlink {
                          0%, 100% { opacity: 1; transform: scale(1); }
                          50% { opacity: 0.4; transform: scale(1.02); }
                        }
                      `}</style>

                      <div
                        className="position-absolute d-inline-flex align-items-center gap-1 px-2 py-0.5 "
                        style={{
                          top: "7px",
                          left: "-6px",
                          borderRadius: "999px",
                          border: "1px solid rgba(0,0,0,0.02)",
                          zIndex: 10,
                          animation: "ratingPulseBlink 4.0s infinite ease-in-out"
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="19"
                          fill="#ffbf00"
                          style={{ display: "block bold" }}
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>

                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e293b", lineHeight: "1" }}>
                          {(4.2 + ((productIndex * 3 + 7) % 9) * 0.1).toFixed(1)}
                        </span>

                        <span style={{ fontSize: "10px", fontWeight: "500", color: "#64748b", lineHeight: "1" }}>
                          ({((productIndex * 17 + 23) % 184) + 12})
                        </span>
                      </div>

                      <div
                        className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-m"
                        style={{
                          width: "105px",
                          height: "95px",
                          cursor: "pointer",
                          zIndex: 2,
                        }}
                        onClick={() =>
                          onProductClick(
                            normalizedItem,
                            serviceId?.fixedType || serviceId?.slug
                          )
                        }
                      >
                        <img
                          src={imageSrc}
                          alt={productTitle}
                          loading={sectionIndex === 0 && productIndex < 4 ? "eager" : "lazy"}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "https://placehold.co/220x220?text=Medicompare";
                          }}
                          style={{
                            maxWidth: "75%",
                            maxHeight: "70%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-3 d-flex flex-column align-items-center justify-content-between flex-grow-1">
                      <div
                        className="fw-bold m-0 mb-1 text-bold"
                        style={{
                          color: currentTheme.priceBadgeBg || currentTheme.viewAllText || "#6d28d9",
                          borderRadius: "999px",
                          fontSize: "16px",
                          letterSpacing: "0.2px",
                          minWidth: "95px",
                          marginTop: "-4px",
                          marginBottom: "4px",
                          textAlign: "center",
                        }}
                      >
                        {productPrice}
                      </div>

                      <button
                        type="button"
                        className="btn btn-link p-0 mb-1 d-flex align-items-center gap-1"
                        style={{
                          color: "#6d3fd1",
                          fontSize: "11px",
                          fontWeight: "600",
                          textDecoration: "none",
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onVendorClick(item?.vendor || item);
                        }}
                      >
                        {vendorImageSrc ? (
                          <img
                            src={vendorImageSrc}
                            alt={vendorName}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                            style={{
                              width: "40px",
                              height: "38px",
                              borderRadius: "50%",
                              objectFit: "contain ",
                              border: "1px solid rgba(109, 63, 209, 0.16)",
                            }}
                          />
                        ) : (
                          <i className="fas fa-store" style={{ fontSize: "11px" }} />
                        )}
                        <span className="text-truncate">{vendorName}</span>
                      </button>

                      <h4
                        className="text-dark fw-semibold mb-2 px-2 text-truncate"
                        style={{
                          fontSize: "11px",
                          maxWidth: "100%",
                          cursor: "pointer",
                          lineHeight: "1.0",
                        }}
                        onClick={() =>
                          onProductClick(
                            normalizedItem,
                            serviceId?.fixedType || serviceId?.slug
                          )
                        }
                      >
                        {productTitle}
                      </h4>

                      <button
                        className="btn text-white fw-bold w-100 py-2 border-0"
                        style={{
                          backgroundColor: currentTheme.buttonBg,
                          borderRadius: "999px",
                          fontSize: "11px",
                          marginTop: "6px",
                          letterSpacing: "0.4px",
                          boxShadow: "0 6px 14px rgba(63, 209, 197, 0.14)",
                        }}
                        onClick={() =>
                          onProductClick(
                            normalizedItem,
                            serviceId?.fixedType || serviceId?.slug
                          )
                        }
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default React.memo(SectionItem);
