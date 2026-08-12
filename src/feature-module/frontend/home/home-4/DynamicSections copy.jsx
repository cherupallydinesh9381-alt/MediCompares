import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { ProductCard } from "../../../../components/ui";
import { useMediaQuery } from "react-responsive";

const DynamicSections = ({
  sections,
  onProductClick,
  onCompareClick,
  onVendorClick,
  imgUrl,
}) => {
  const extraSmallScreen = useMediaQuery({ query: "(max-width: 560px)" });

  const normalizeItem = (item) => {
    const DiscusedPrice = item?.price || 0;

    // NEW API SUPPORT
    const productDetails = item?.productDetails || {};
    const businessDetails = productDetails?.businessDetails || {};
    const vendorDetails = productDetails?.vendor || {};

    const firstVendor =
      item.vendordetails ||
      (item.vendors && item.vendors[0]) ||
      item.vendor ||
      null;

    // Extract vendor information from new API structure
    const newApiVendor = {
      vendorId: vendorDetails._id || vendorDetails.id,
      name: businessDetails.name || (vendorDetails.firstName && vendorDetails.lastName ? vendorDetails.firstName + " " + vendorDetails.lastName : "") || "",
      price: productDetails.price || 0,
      discountprice: productDetails.discountprice || null,
      discountType: productDetails.discountType || null,
      stock: productDetails.stock || 0,
      bussiness_image: businessDetails.bussiness_image || null,
      bussinessdetails: {
        name: businessDetails.name || "",
        bussiness_image: businessDetails.bussiness_image || null,
      },
    };

    // Use new API vendor if available, otherwise fall back to old structure
    const finalVendor = productDetails.price ? newApiVendor : (firstVendor ? {
      ...firstVendor,
      vendorId:
        firstVendor.vendorId ||
        firstVendor._id ||
        firstVendor.id,
      name:
        firstVendor.name ||
        firstVendor.vendorName ||
        firstVendor?.bussinessdetails?.name ||
        item?.brand?.name ||
        "",
      price:
        firstVendor.price ||
        firstVendor.matchedVariantPrice ||
        firstVendor.matchedPrice ||
        firstVendor.mrp ||
        firstVendor.sellingPrice ||
        DiscusedPrice ||
        0,
    } : {
      name: item?.brand?.name || "",
      price: DiscusedPrice,
      bookingType: "cart",
    });

    return {
      ...item,
      tabletdetails: item,
      vendordetails: finalVendor,
      variants: productDetails.variants || {
        _id: item._id,
        name: item.name,
        files: item.files || item.imageUrl || [],
        price: finalVendor.price || DiscusedPrice,
        discountPrice: productDetails.discountprice || item.discountPrice || null,
        stock: productDetails.stock || 999,
        isStock: true,
      },
      vendors: [],
    };
  };

  return (
    sections &&
    sections.length > 0 &&
    sections.map((section, index) => {
      const { title, subtitle, serviceId, products } = section;

      const iconColors = [
        "#8059ca",
        "#8059ca",
        "#8059ca",
        "#8059ca",
        "#8059ca",
      ];
      const icons = [
        "fas fa-tablets",
        "fas fa-pills",
        "fas fa-capsules",
        "fas fa-medkit",
        "fas fa-heartbeat",
      ];

      const colorIndex = index % 5;
      const iconColor = iconColors[colorIndex];
      const icon = icons[colorIndex];
      const viewAllLink = `/${serviceId?.slug || "medicine"}/all`;
      const maxSlidesPerView = 6;
      const loopAdditional = 3;
      const shouldLoop =
        products && products.length > maxSlidesPerView + loopAdditional;
      return (
        <section
          key={section._id}
          className="my-2 px-2 px-md-3"
          style={{
            background: "linear-gradient(135deg, rgba(243, 232, 255, 0.4) 0%, rgba(216, 180, 254, 0.15) 100%)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.55)",
            borderRadius: "24px",
            boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.65), 0 12px 32px -4px rgba(147, 51, 234, 0.08)",
            padding: "16px 0 0px 0",
            position: "relative",
            overflow: "hidden",
            margin: "12px 15px",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  background: `linear-gradient(135deg, ${iconColor}20 0%, ${iconColor}40 100%)`,
                  borderRadius: "50px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: iconColor,
                }}
              >
                <i className={icon} style={{ marginRight: "8px" }}></i>
                {title}
              </div>

              <Link
                to={viewAllLink}
                onClick={() => {
                  localStorage.setItem("fixedType", serviceId?.fixedType || "medicine");
                }}
                className="top-vendor-badge"
                style={{
                  padding: "4px 10px",
                  color: iconColor,
                  borderColor: iconColor,
                  fontWeight: "600",
                }}
              >
                View All
                <i className="isax isax-arrow-right-1 ms-1"></i>
              </Link>
            </div>
            <div
              className={`doctor-slider-one owl-theme aos ${extraSmallScreen ? "px-3" : ""
                }`}
            >
              <Swiper
                modules={[Navigation, Autoplay, Pagination]}
                spaceBetween={4}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                loop={shouldLoop}
                autoplay={
                  shouldLoop
                    ? { delay: 5000, disableOnInteraction: false }
                    : false
                }
                observer={true}
                observeParents={true}
                watchSlidesProgress={true}
                grabCursor={true}
                loopAdditionalSlides={shouldLoop ? loopAdditional : 0}
                breakpoints={{
                  0: { slidesPerView: 2 },
                  576: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  992: { slidesPerView: 5 },
                  1200: { slidesPerView: 6 },
                  1400: { slidesPerView: 6 },
                }}
                className="products-swiper"
              >
                {products &&
                  products.length > 0 &&
                  products.map((item, index) => {
                    const normalizedItem = normalizeItem(item);
                    const variants = normalizedItem.variants;
                    return (
                      <SwiperSlide key={index} className="h-auto">
                        <ProductCard
                          item={normalizedItem}
                          variant={variants}
                          imgUrl={imgUrl}
                          onProductClick={onProductClick}
                          onCompareClick={() => onCompareClick(normalizedItem, section)}
                          onVendorClick={onVendorClick}
                          maxStock={variants?.stock || 999}
                        />
                      </SwiperSlide>
                    );
                  })}
              </Swiper>
            </div>
          </div>
        </section>
      );
    })
  );
};

export default DynamicSections;
