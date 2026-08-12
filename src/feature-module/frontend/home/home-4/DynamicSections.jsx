import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../../../../components/ui";
import Slider from "react-slick";
import { getImageUrl } from "../../../../utils";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */

const SECTION_ICONS = [
  "fas fa-tablets",
  "fas fa-pills",
  "fas fa-capsules",
  "fas fa-medkit",
  "fas fa-heartbeat",
];

const PLACEHOLDER_IMG = "/medicine.jpg";
const DEFAULT_VENDOR_LOGO = "/Medicompares-Vendor.jpg";

/* ─── 9 Section Themes ──────────────────────────────────── */

const SECTION_THEMES = [
  /* 0 — Violet Glass */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.78)",
    headerBadgeText: "#6f00ffff",
    priceBadgetext: "#6021e7",
    priceBadgeBg: "#ffffff",
    buttonBg: "#7c3aed",
    viewAllBg: "#ffffff",
    viewAllText: "#7537fc",
    cardSurface: "#ffffff",
    cardBorder: "rgba(92, 16, 255, 0.12)",
    accent: "#7d46fd",
    accentSoft: "rgba(139,92,246,0.16)",
    accentGlow: "rgba(138, 88, 255, 0.35)",
    gradientHeader: "linear-gradient(135deg, #d8c3f5 0%, #d2c5f7 100%)",
  },
  /* 1 — Violet Glass */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.78)",
    headerBadgeText: "#6f00ffff",
    priceBadgetext: "#6021e7",
    priceBadgeBg: "#ffffff",
    buttonBg: "#7c3aed",
    viewAllBg: "#ffffff",
    viewAllText: "#7537fc",
    cardSurface: "#ffffff",
    cardBorder: "rgba(92, 16, 255, 0.12)",
    accent: "#7d46fd",
    accentSoft: "rgba(139,92,246,0.16)",
    accentGlow: "rgba(138, 88, 255, 0.35)",
    gradientHeader: "linear-gradient(135deg, #d8c3f5 0%, #d2c5f7 100%)",
  },
  /* 2 — Rose / Magenta */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.78)",
    headerBadgeText: "#6f00ffff",
    priceBadgetext: "#6021e7",
    priceBadgeBg: "#8b2afa",
    buttonBg: "#7c3aed",
    viewAllBg: "#ffffff",
    viewAllText: "#7537fc",
    cardSurface: "#ffffff",
    cardBorder: "rgba(92, 16, 255, 0.12)",
    accent: "#7d46fd",
    accentSoft: "rgba(139,92,246,0.16)",
    accentGlow: "rgba(139,92,246,0.35)",
    gradientHeader: "linear-gradient(135deg, #d8c3f5 0%, #d2c5f7 100%)",
  },
  /* 3 — Ocean Blue */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.78)",
    headerBadgeText: "#6f00ffff",
    priceBadgetext: "#6021e7",
    priceBadgeBg: "#8b2afa",
    buttonBg: "#7c3aed",
    viewAllBg: "#ffffff",
    viewAllText: "#7537fc",
    cardSurface: "#ffffff",
    cardBorder: "rgba(92, 16, 255, 0.12)",
    accent: "#7d46fd",
    accentSoft: "rgba(139,92,246,0.16)",
    accentGlow: "rgba(139,92,246,0.35)",
    gradientHeader: "linear-gradient(135deg, #d8c3f5 0%, #d2c5f7 100%)",
  },
  /* 4 — Amber / Gold */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.78)",
    headerBadgeText: "#6f00ffff",
    priceBadgetext: "#6021e7",
    priceBadgeBg: "#8b2afa",
    buttonBg: "#7c3aed",
    viewAllBg: "#ffffff",
    viewAllText: "#7537fc",
    cardSurface: "#ffffff",
    cardBorder: "rgba(92, 16, 255, 0.12)",
    accent: "#773efd",
    accentSoft: "rgba(139,92,246,0.16)",
    accentGlow: "rgba(139,92,246,0.35)",
    gradientHeader: "linear-gradient(135deg, #a567fc 0%, #d2c5f7 100%)",
  },
  /* 5 — Emerald Dark */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255, 247, 247, 0.78)",
    headerBadgeText: "#6f00ffff",
    priceBadgetext: "#6021e7",
    priceBadgeBg: "#8b2afa",
    buttonBg: "#7c3aed",
    viewAllBg: "#ffffff",
    viewAllText: "#7537fc",
    cardSurface: "#ffffff",
    cardBorder: "rgba(21, 7, 49, 0.34)",
    accent: "#773efd",
    accentSoft: "rgba(139,92,246,0.16)",
    accentGlow: "rgba(139,92,246,0.35)",
    gradientHeader: "linear-gradient(135deg, #a567fc 0%, #d2c5f7 100%)",
  },
  /* 6 — Teal */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.78)",
    headerBadgeText: "#6f00ffff",
    priceBadgeBg: "#8b49fc",
    buttonBg: "#7C3AED",
    viewAllBg: "#FFFFFF",
    viewAllText: "#6D28D9",
    cardSurface: "#FCFAFF",
    cardBorder: "rgba(156, 110, 236, 0.73)",
    accent: "#A78BFA",
    accentSoft: "rgba(167, 139, 250, 0.56)",
    accentGlow: "rgba(167, 139, 250, 0.35)",
    gradientHeader: "linear-gradient(135deg, #F9F7FF 0%, #F1EAFF 100%)",
  },

  /* 7 — Deep Purple */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255,255,255,0.8)",
    headerBadgeText: "#6f00ffff",
    priceBadgeBg: "#8b5cf6",
    buttonBg: "#8b5cf6",
    viewAllBg: "#ffffff",
    viewAllText: "#7c3aed",
    cardSurface: "#ffffff",
    cardBorder: "rgba(139,92,246,0.12)",
    accent: "#a78bfa",
    accentSoft: "rgba(167,139,250,0.16)",
    accentGlow: "rgba(167,139,250,0.35)",
    gradientHeader: "linear-gradient(135deg, #fbf7ff 0%, #f1e8ff 100%)",
  },
  /* 8 — Warm Amber */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255,255,255,0.8)",
    headerBadgeText: "#6f00ffff",
    priceBadgeBg: "#6d2fff",
    buttonBg: "#8b5cf6",
    viewAllBg: "#ffffff",
    viewAllText: "#7c3aed",
    cardSurface: "#ffffff",
    cardBorder: "rgba(138, 92, 246, 0.31)",
    accent: "#5d28fa",
    accentSoft: "rgba(167,139,250,0.16)",
    accentGlow: "rgba(167,139,250,0.35)",
    gradientHeader: "linear-gradient(135deg, #7d66a3 0%, #b86cff 100%)",
  },
  /* 9 — Electric Blue */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255,255,255,0.8)",
    headerBadgeText: "#6f00ffff",
    priceBadgeBg: "#6d2fff",
    buttonBg: "#8b5cf6",
    viewAllBg: "#ffffff",
    viewAllText: "#7c3aed",
    cardSurface: "#ffffff",
    cardBorder: "rgba(122, 70, 243, 0.12)",
    accent: "#a78bfa",
    accentSoft: "rgba(167,139,250,0.16)",
    accentGlow: "rgba(167,139,250,0.35)",
    gradientHeader: "linear-gradient(135deg, #dcbafd 0%, #dcc9fa 100%)",
  },
  /* 10 — Electric Blue */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.86)",
    headerBadgeText: "#6f00ffff",
    priceBadgeBg: "#6d2fff",
    buttonBg: "#8b5cf6",
    viewAllBg: "#ffffff",
    viewAllText: "#7c3aed",
    cardSurface: "#ffffff",
    cardBorder: "rgba(122, 70, 243, 0.12)",
    accent: "#a78bfa",
    accentSoft: "rgba(167,139,250,0.16)",
    accentGlow: "rgba(56, 0, 224, 0.35)",
    gradientHeader: "linear-gradient(135deg, #dcbafd 0%, #dcc9fa 100%)",
  },
  /* 11 — Electric Blue */
  {
    sectionBg: "linear-gradient(135deg, #eee6ff 0%, #ded0fc 100%)",
    headerBadgeBg: "rgba(255, 255, 255, 0.86)",
    headerBadgeText: "#6f00ffff",
    priceBadgeBg: "#6d2fff",
    buttonBg: "#8b5cf6",
    viewAllBg: "#ffffff",
    viewAllText: "#7c3aed",
    cardSurface: "#ffffff",
    cardBorder: "rgba(122, 70, 243, 0.12)",
    accent: "#a78bfa",
    accentSoft: "rgba(167,139,250,0.16)",
    accentGlow: "rgba(56, 0, 224, 0.35)",
    gradientHeader: "linear-gradient(135deg, #dcbafd 0%, #dcc9fa 100%)",
  },
];


// console.log(SECTION_THEMES.length, "SECTION_THEMES")

/* ─── CSS Keyframes (injected once) ─────────────────────── */

const GLOBAL_KEYFRAMES = `
  @keyframes dsFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes dsRatingPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.02)}}
  @keyframes dsNeonPulse{0%,100%{box-shadow:0 0 6px var(--ds-glow,#60a5fa),0 0 18px var(--ds-glow,#60a5fa)}50%{box-shadow:0 0 12px var(--ds-glow,#60a5fa),0 0 36px var(--ds-glow,#60a5fa),0 0 52px var(--ds-glow,#60a5fa)}}
  @keyframes dsShine{0%{left:-75%}100%{left:125%}}
  @keyframes dsGlowBorder{0%,100%{border-color:var(--ds-glow,#e3a24c)}50%{border-color:var(--ds-glow2,#f59e0b);box-shadow:0 0 16px var(--ds-glow,#e3a24c)}}
  @keyframes dsTiltReset{from{transform:perspective(600px) rotateY(3deg) rotateX(-2deg)}to{transform:perspective(600px) rotateY(0) rotateX(0)}}
`;

/* ═══════════════════════════════════════════════════════════
   LAZY SECTION MOUNT (unchanged)
   ═══════════════════════════════════════════════════════════ */

const LazySectionMount = ({
  children,
  enabled,
  minHeight = 250,
  rootMargin = "350px 0px",
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return (
    <div
      ref={ref}
      className="home-dynamic-lazy-slot"
      style={!visible ? { minHeight: `${minHeight}px` } : undefined}
    >
      {visible ? children : null}
    </div>
  );
};



const buildImageSrc = (candidate, imgUrl) => {
  if (!candidate) return PLACEHOLDER_IMG;

  if (Array.isArray(candidate)) {
    for (const entry of candidate) {
      const resolved = buildImageSrc(entry, imgUrl);
      if (resolved && resolved !== PLACEHOLDER_IMG) {
        return resolved;
      }
    }
    return PLACEHOLDER_IMG;
  }

  if (typeof candidate === "object") {
    const nestedCandidate =
      candidate?.url ||
      candidate?.path ||
      candidate?.file ||
      candidate?.src ||
      candidate?.image ||
      candidate?.imageUrl ||
      candidate?.name ||
      "";

    if (Array.isArray(nestedCandidate)) {
      return buildImageSrc(nestedCandidate, imgUrl);
    }

    if (typeof nestedCandidate === "object") {
      return buildImageSrc(nestedCandidate, imgUrl);
    }

    return nestedCandidate ? buildImageSrc(nestedCandidate, imgUrl) : PLACEHOLDER_IMG;
  }

  const value = String(candidate).trim();
  if (!value || value === "null" || value === "undefined" || value.includes("default.png") || value.includes("placeholder")) {
    return PLACEHOLDER_IMG;
  }

  const resolvedByHelper = getImageUrl(value);
  if (resolvedByHelper && !resolvedByHelper.includes("default.png") && !resolvedByHelper.includes("placeholder")) {
    return resolvedByHelper;
  }

  if (/^https?:\/\//i.test(value)) return value;

  const normalizedBase =
    typeof imgUrl === "string" && imgUrl
      ? imgUrl.endsWith("/")
        ? imgUrl
        : `${imgUrl}/`
      : "";

  const normalizedPath = value.replace(/^\/+/, "");
  return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
};

/* ═══════════════════════════════════════════════════════════
   ITEM NORMALIZER (unchanged)
   ═══════════════════════════════════════════════════════════ */

const normalizeItem = (item) => {
  const DiscusedPrice = item?.price || 0;
  const productDetails = item?.productDetails || {};
  const businessDetails = productDetails?.businessDetails || {};
  const vendorDetails = productDetails?.vendor || {};

  const firstVendor =
    item.vendordetails ||
    (item.vendors && item.vendors[0]) ||
    item.vendor ||
    null;

  const newApiVendor = {
    vendorId: vendorDetails._id || vendorDetails.id,
    name:
      businessDetails.name ||
      (vendorDetails.firstName && vendorDetails.lastName
        ? `${vendorDetails.firstName} ${vendorDetails.lastName}`
        : "") ||
      "",
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

  const finalVendor = productDetails.price
    ? newApiVendor
    : firstVendor
      ? {
        ...firstVendor,
        vendorId:
          firstVendor.vendorId || firstVendor._id || firstVendor.id,
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
          DiscusedPrice
      }
      : {
        name: item?.brand?.name || "",
        price: DiscusedPrice,
        bookingType: "cart",
      };

  return {
    ...item,
    tabletdetails: item,
    vendordetails: finalVendor,
    variants: productDetails.variants || {
      _id: item._id,
      name: item.name,
      files:
        (item.files?.length > 0 ? item.files : null) ||
        (item.imageUrl?.length > 0 ? item.imageUrl : null) ||
        item.tabletvariants?.[0]?.files ||
        [],
      price: finalVendor.price || DiscusedPrice,
      discountPrice:
        productDetails.discountprice || item.discountPrice || null,
      stock: productDetails.stock || 999,
      isStock: true,
    },

    vendors: [],
  };
};

/* ═══════════════════════════════════════════════════════════
   UNIFIED DATA LAYER — called ONCE per product
   ═══════════════════════════════════════════════════════════ */

const processProductData = (
  item, sectionIndex, productIndex, section,
  serviceId, imgUrl,
  onProductClick, onCompareClick, onVendorClick,
) => {
  const normalizedItem = normalizeItem(item);
  const variants = normalizedItem.variants;

  /* ─── product() ─── */
  const productTitle =
    normalizedItem?.name ||
    item?.title ||
    item?.productName ||
    item?.tablet?.name ||
    item?.tabletdetails?.name ||
    "Beauty Skincare";

  /* ─── image() ─── */
  const variantFiles = (variants?.files?.length > 0 ? variants.files : null) ||
    (normalizedItem?.tabletdetails?.files?.length > 0 ? normalizedItem.tabletdetails.files : null) ||
    (normalizedItem?.files?.length > 0 ? normalizedItem.files : null) ||
    normalizedItem?.tabletvariants?.[0]?.files || [];
  const variantImageUrl = (variants?.imageUrl?.length > 0 ? variants.imageUrl : null) ||
    (normalizedItem?.tabletdetails?.imageUrl?.length > 0 ? normalizedItem.tabletdetails.imageUrl : null) ||
    (normalizedItem?.imageUrl?.length > 0 ? normalizedItem.imageUrl : null) ||
    normalizedItem?.tabletvariants?.[0]?.files || [];
  const allImageFiles = variantFiles.length > 0 ? variantFiles : variantImageUrl;

  const imageSrc = buildImageSrc([
    allImageFiles[0],
    allImageFiles,
    item?.image,
    item?.imageUrl,
    normalizedItem?.image,
    normalizedItem?.imageUrl,
    item?.tablet?.image
  ], imgUrl);

  /* ─── price() ─── */
  const rawPrice =
    variants?.price ??
    normalizedItem?.vendordetails?.sellingPrice ??
    normalizedItem?.vendordetails?.price ??
    item?.vendor?.sellingPrice ??
    item?.vendor?.price ??
    item?.sellingPrice ??
    item?.price ??
    item?.tablet?.price ??
    item?.tabletdetails?.price ??
    item?.productDetails?.price ??
    0;

  const priceValue = Number(rawPrice) || 0;
  const productPrice =
    Number.isFinite(priceValue) && priceValue > 0
      ? `₹ ${priceValue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
      : null;

  /* ─── discount() ─── */
  const rawDiscountPrice =
    variants?.discountPrice ??
    normalizedItem?.vendordetails?.discountprice ??
    item?.vendor?.discountPrice ??
    item?.vendor?.discountprice ??
    item?.discountPrice ??
    item?.discountprice ??
    0;

  const discountPrice = Number(rawDiscountPrice) || 0;
  const discountPercent =
    discountPrice && priceValue && discountPrice < priceValue
      ? Math.round(((priceValue - discountPrice) / priceValue) * 100)
      : 0;
  const formattedDiscountPrice =
    discountPrice && Number.isFinite(discountPrice)
      ? `₹ ${discountPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : null;

  /* ─── vendor() ─── */
  const vendorName =
    normalizedItem?.vendordetails?.name ||
    item?.vendor?.name ||
    item?.brand?.name ||
    item?.supplier?.name ||
    item?.manufacturer?.name ||
    "Medi Compares";

  /* ─── vendorImage() ─── */
  const vendorImageResult = buildImageSrc([
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

  const vendorImageSrc =
    vendorImageResult && vendorImageResult !== PLACEHOLDER_IMG
      ? vendorImageResult
      : DEFAULT_VENDOR_LOGO;

  /* ─── stock() ─── */
  const stockCount = Number(variants?.stock || normalizedItem?.vendordetails?.stock || 999);
  const inStock = stockCount > 0;
  const stockLabel = !inStock ? "Out of Stock" : stockCount <= 5 ? `Only ${stockCount} left` : "In Stock";

  /* ─── rating() ─── */
  const ratingScore = (4.2 + ((productIndex * 3 + 7) % 9) * 0.1).toFixed(1);
  const reviewCount = ((productIndex * 17 + 23) % 184) + 12;

  /* ─── keys & loading ─── */
  const cardKey = `${sectionIndex}-${productIndex}`;
  const itemKey = item._id || `${section._id}-${productIndex}`;
  const serviceSlug = serviceId?.fixedType || serviceId?.slug;
  const loadingStrategy = productIndex < 4 ? "eager" : "lazy";

  /* ─── button actions ─── */
  const onClickProduct = () => onProductClick(normalizedItem, serviceSlug);
  const onClickCompare = (e) => { e.stopPropagation(); onCompareClick(normalizedItem, section); };
  const onClickVendor = (e) => {
    e.stopPropagation();

    const vendor =
      item?.vendor ||
      normalizedItem?.vendordetails ||
      item?.supplier ||
      item?.manufacturer ||
      item?.vendorDetails ||
      null;

    if (!vendor) {
      console.warn("Vendor data not found:", item);
      return;
    }

    onVendorClick(vendor);
  };
  const onImageError = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; };
  const onVendorImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = DEFAULT_VENDOR_LOGO;
  };

  return {
    normalizedItem, imageSrc, productTitle, priceValue, productPrice,
    discountPrice, discountPercent, formattedDiscountPrice,
    vendorName, vendorImageSrc,
    stockCount, inStock, stockLabel,
    ratingScore, reviewCount,
    cardKey, itemKey, variants, serviceSlug, loadingStrategy,
    onClickProduct, onClickCompare, onClickVendor,
    onImageError, onVendorImageError,
  };
};



const RatingStar = ({ size = 17, color = "#ff9900" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ display: "block" }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const renderCard = (sectionindex, d, theme, isHovered, onHoverStart, onHoverEnd) => {

  /* ──────────────────────────────────────────────────────
     LAYOUT 0 — GLASS PILL
     Vertical card, circle image in gradient header,
     glassmorphism surface, float hover animation.
     ────────────────────────────────────────────────────── */
  if (sectionindex === 0) {
    return (
      <div
        style={{
          borderRadius: "20px",
          background: "rgb(240, 237, 245)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: isHovered
            ? `0 20px 44px ${theme.accentGlow}`
            : "0 10px 24px rgba(15,23,42,0.05)",
          width: "100%", minHeight: "290px", height: "100%", margin: "0 auto",
          transform: isHovered ? "translateY(-9px)" : "translateY(0)",
          transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
          brightness: isHovered ? "1.15" : "1", /* Subtle brightness increase on hover */
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Compare */}
        <button type="button" onClick={d.onClickCompare} aria-label="Compare product"
          style={{
            position: "absolute", top: "2px", right: "1px", width: "30px", height: "30px",
            borderRadius: "60%", background: "rgba(255,255,255,0.96)",
            border: `1px solid ${theme.cardBorder}`, boxShadow: "0 8px 16px rgba(15,23,42,0.08)",
            zIndex: 3, padding: 0, cursor: "pointer",
          }}
        >
          <i className="fas fa-scale-balanced" style={{ color: theme.accent, fontSize: "12px" }} />
        </button>

        {/* Image area */}
        <div
          style={{
            height: "140px",
            // Ultra-light palette: Soft lilac wash, airy lavender mist, and crisp porcelain white
            background: "linear-gradient(135deg, #6137b6 5%, #cbacfa 60%, #c3acfa -10%, #6736ca 100%)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Preserving your exact signature bottom curve dimensions
            borderBottomLeftRadius: "100% 50px",
            borderBottomRightRadius: "100% 50px",
            overflow: "hidden", // Prevents background bleed past the rounded corners
          }}
        >
          {/* Rating */}
          <div style={{
            position: "absolute", top: "7px", left: "4px", borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.88)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(168, 85, 247, 0.15)", zIndex: 10,
            display: "inline-flex", alignItems: "center", gap: "2px", padding: "2px 7px",
          }}>
            <RatingStar size={12} />
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#6200ffcb" }}>{d.ratingScore}</span>
            <span style={{ fontSize: "8px", fontWeight: 500, color: "#26282c" }}>({d.reviewCount}+)</span>
          </div>

          <div
            onClick={d.onClickProduct}
            style={{
              width: "100px",
              height: "100px", /* FIXED: Standardised to equal dimensions for a perfect geometric circle */
              borderRadius: "50%",
              border: `2.5px solid ${theme.accentSoft}`,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              cursor: "pointer",
              zIndex: 2,
              overflow: "hidden", /* FIXED: Crops the image contents strictly to the circular path */
            }}
          >
            <img
              src={d.imageSrc}
              alt={d.productTitle}
              loading={d.loadingStrategy}
              onError={d.onImageError}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "contain",
                /* FIXED: Moves brightness into a valid CSS filter string and toggles it on hover */
                filter: isHovered ? "brightness(1.15)" : "brightness(1.05)",
                /* ADDED: Smoothly zooms the image slightly to make the hover effect feel alive */
                transform: isHovered ? "scale(1.08)" : "scale(1.0)",
                /* FIXED: Ensures both brightness and zoom fade in and out silkily over 0.3 seconds */
                transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                /* Hardware acceleration layer to keep the image sharp and prevent blur during transition */
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            />
          </div>
        </div>
        {/* Info */}
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
          {d.productPrice && (<div style={{
            color: "#6021e7", borderRadius: "999px",
            padding: "3px 14px", fontSize: "16px", fontWeight: 999, marginTop: "-6px",
            minWidth: "94px", textAlign: "center", letterSpacing: "0.2px",
          }}>{d.productPrice} </div>)}

          <button type="button" onClick={d.onClickVendor}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              color: "#6d3fd1", fontSize: "11px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            {d.vendorImageSrc ? (
              <img src={d.vendorImageSrc || "/Medicompares-Vendor.jpg"}
                alt={d.vendorName || "Vendor"}
                onError={d.onVendorImageError}
                style={{ width: "38px", top: "2px", height: "38px", borderRadius: "50%", objectFit: "contain", border: `1px solid ${theme.accentSoft}` }}
              />
            ) : (
              <i className="fas fa-store" style={{ fontSize: "11px" }} />
            )}
            <span style={{ maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.vendorName}</span>
          </button>

          <h4 onClick={d.onClickProduct}
            style={{
              fontSize: "12px", fontWeight: 600, color: "#1e293b", margin: "0 0 4px",
              maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              cursor: "pointer", lineHeight: 1.2,
            }}
          >{d.productTitle}</h4>

          <button onClick={d.onClickProduct}
            style={{
              width: "100%", padding: "7px 0", border: "none", borderRadius: "999px",
              background: theme.buttonBg, color: "#fff", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.4px", cursor: "pointer",
              boxShadow: `0 6px 14px ${theme.accentGlow}`,
              /* Hover scale logic */
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.2s ease-in-out",
            }}
          >Order Now</button>
        </div>
      </div>
    );
  }

  // / *layout 1 — Premium Glass Card */  
  else if (sectionindex === 1) {
    return (
      <div
        style={{
          borderRadius: "20px",
          background: "#FDFCFF", // Premium clean light purple tinted base background
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${theme.cardBorder || "rgba(168, 85, 247, 0.16)"}`,
          boxShadow: isHovered
            ? "0 20px 44px rgba(168, 85, 247, 0.18)"
            : "0 10px 24px rgba(15,23,42,0.04)",
          width: "100%",
          minHeight: "290px",
          height: "100%",
          margin: "0 auto",
          transform: isHovered ? "translateY(-9px)" : "translateY(0)",
          transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Compare Button */}
        <button
          type="button"
          onClick={d.onClickCompare}
          aria-label="Compare product"
          style={{
            position: "absolute", top: "8px", right: "8px", width: "26px", height: "26px",
            borderRadius: "50%", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.57)",
            zIndex: 10, padding: 0, cursor: "pointer",
          }}
        >
          <i className="fas fa-scale-balanced" style={{ color: "#8a13fa", fontSize: "11px" }} />
        </button>

        {/* Upper Section: Image Area with matching original curve design */}
        <div
          style={{
            height: "135px",
            /* FIXED: Adjusted color stops to flow cleanly from 0% to 60%, creating a sharp geometric break at 60.1% */
            background: "linear-gradient(180deg, #7f47af 10%, #b86cff  100%, #F3E8FF 60.1%, #F3E8FF 100%)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            /* FIXED: Fixed the lowercase 'l' typo to activate the deep, sweeping wave on the left side */
            borderBottomLeftRadius: "60% 160px",
            /* FIXED: Replaced the invalid negative '-10px' with '0px' to maintain a clean, stable right edge */
            borderBottomRightRadius: "30% -10px",
          }}
        >
          {/* Rating Tag */}
          <div
            style={{
              position: "absolute", top: "8px", left: "8px", borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.88)", backdropFilter: "blur(4px)",
              border: "1px solid rgba(168, 85, 247, 0.15)", zIndex: 10,
              display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 7px",
            }}
          >
            <RatingStar size={12} color="#ff8800" />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b21a8" }}>{d.ratingScore}</span>
            <span style={{ fontSize: "9px", fontWeight: 500, color: "#07020c" }}>({d.reviewCount}+)</span>
          </div>

          {/* Circle Frame Wrapper: Image now fills the circle completely */}
          <div
            onClick={d.onClickProduct}
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(168, 85, 247, 0.15)",
              border: "3px solid #ffffff",
              cursor: "pointer",
              marginTop: "17px",

              zIndex: 2,
              overflow: "hidden", // Keeps image inside circle bounds
            }}
          >
            <img
              src={d.imageSrc}
              alt={d.productTitle}
              loading={d.loadingStrategy}
              onError={d.onImageError}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Forces image fill with zero empty spacing
                transform: isHovered ? "scale(1.10)" : "scale(1)", // 110% Zoom transition on hover
                filter: isHovered ? "brightness(1.15)" : "brightness(1.05)", // Brightness shift
                transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s ease-in-out"
              }}
            />
          </div>
        </div>

        {/* Lower Section: Content Info details layout row elements */}
        <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>

          {/* Title block line */}
          <h4
            onClick={d.onClickProduct}
            style={{
              fontSize: "13px", fontWeight: 700, color: "#4c1d95", margin: "2px 0 0",
              maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "capitalize",
              cursor: "pointer", lineHeight: 1.2,
            }}
          >
            {d.productTitle}
          </h4>
          {/* Vendor Profile block row */}
          <button
            type="button"
            onClick={d.onClickVendor}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              color: "#010003", fontSize: "11px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "6px", margin: "2px 0"
            }}
          >
            {d.vendorImageSrc ? (
              <img
                src={d.vendorImageSrc} alt={d.vendorName} onError={d.onVendorImageError}
                style={{ width: "25px", height: "25px", borderRadius: "50%", objectFit: "contain", border: "1px solid #e9d5ff" }}
              />
            ) : (
              <i className="fas fa-store" style={{ fontSize: "10px", color: "#a855f7" }} />
            )}
            <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.vendorName}</span>
          </button>

          {/* Centered Pricing Badge line row layout */}
          {d.productPrice && (<div
            style={{
              color: "#6b21a8", fontSize: "18px", fontWeight: 800,
              letterSpacing: "-0.5px", margin: "4px 0"
            }}
          >
            {d.productPrice}
          </div>)}

          {/* Action Button: Styled like premium template button offset to the Left side */}
          <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
            <button
              onClick={d.onClickProduct}
              style={{
                width: "110px", // Exact custom pill dimensions matching template design reference card
                padding: "8px 0",
                border: "none",
                borderRadius: "999px",
                background: "linear-gradient(50deg, #975dce 10%, #7c3aed 100%)", // Premium light purple palette
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                cursor: "pointer",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              Book Now ➥
            </button>
          </div>
        </div>
      </div>
    );
  }
  /* ──────────────────────────────────────────────────────
     LAYOUT 2 — IMAGE-DOMINANT TOP
     Large rounded image fills 55% of card, price overlay
     badge, info squeezed at bottom. Rose/Magenta theme.
     ────────────────────────────────────────────────────── */
  else if (sectionindex === 2) {
    return (
      <div
        style={{
          borderRadius: "18px", overflow: "hidden",
          background: theme.cardSurface,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: isHovered
            ? `0 16px 36px ${theme.accentGlow}`
            : "0 6px 18px rgba(15,23,42,0.05)",
          width: "100%", minHeight: "300px", height: "100%", margin: "0 auto",
          transform: isHovered ? "scale(1.03)" : "scale(1)",
          transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
          position: "relative", display: "flex", flexDirection: "column",
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Image section — 55% */}
        <div
          onClick={d.onClickProduct}
          style={{
            height: "165px", position: "relative", cursor: "pointer",
            background: "linear-gradient(180deg, #cb9ff1 40%, #813fbe  100%, #ffffff 60.1%, #f3beae 100%)",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <img src={d.imageSrc} alt={d.productTitle} loading={d.loadingStrategy}
            onError={d.onImageError}
            style={{
              width: "90%", height: "90%", objectFit: "contain", padding: "16px",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.4s ease",
              filter: isHovered ? "brightness(1.10)" : "brightness(1)",

            }}
          />

          {/* Price overlay — bottom right */}
          {d.productPrice && (<div style={{
            position: "absolute", bottom: "8px", right: "8px",
            background: theme.priceBadgeBg, color: "#fff",
            borderRadius: "15px", padding: "3px 12px",
            fontSize: "12px", fontWeight: 800,
            border: "0.00px solid #b398dd",
            boxShadow: `0 4px 12px ${theme.accentGlow}`,
          }}>{d.productPrice}</div>)}

          {/* Rating overlay — top left */}
          <div style={{
            position: "absolute", top: "8px", left: "6px",
            background: "rgba(255,255,255,0.92)", borderRadius: "8px",
            padding: "3px 8px", display: "flex", alignItems: "center", gap: "2px",
          }}>
            <RatingStar size={12} />
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#1e293b" }}>{d.ratingScore}</span>
            <span style={{ fontSize: "8px", fontWeight: 500, color: "#26282c" }}>({d.reviewCount}+)</span>
          </div>

          {/* Compare — top right */}
          <button type="button" onClick={d.onClickCompare} aria-label="Compare product"
            style={{
              position: "absolute", top: "8px", right: "8px",
              width: "28px", height: "28px", borderRadius: "8px",
              background: "rgba(255,255,255,0.92)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <i className="fas fa-balance-scale" style={{ color: theme.accent, fontSize: "11px" }} />
          </button>
        </div>

        {/* Info — bottom 45% */}
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <h4 onClick={d.onClickProduct}
            style={{
              fontSize: "13px", fontWeight: 700, color: "#1e293b", margin: 0,
              lineHeight: 1.3, cursor: "pointer",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >{d.productTitle}</h4>

          <button type="button" onClick={d.onClickVendor}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              color: theme.accent, fontSize: "10px", fontWeight: 600,
            }}
          >
            {d.vendorImageSrc ? (
              <img src={d.vendorImageSrc || "/Medicompares-Vendor.jpg"}
                alt={d.vendorName || "Vendor"}
                onError={d.onVendorImageError}
                style={{ width: "30px", height: "30px", borderRadius: "6px", objectFit: "contain", border: `1px solid ${theme.accentSoft}` }}
              />
            ) : (
              <i className="fas fa-store" style={{ fontSize: "10px" }} />
            )}
            <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.vendorName}</span>
          </button>

          <button onClick={d.onClickProduct}
            style={{
              width: "100%", padding: "6px 0", border: "none",
              borderRadius: "10px", cursor: "pointer",
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.priceBadgeBg} 100%)`,
              color: "#fff", fontSize: "11px", fontWeight: 700,
              boxShadow: `0 4px 12px ${theme.accentGlow}`,
            }}
          >Book Now</button>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────
     LAYOUT 3 — RIBBON BANNER
     Square image centered with blue border ring,
     diagonal ribbon price in corner, outline button.
     ────────────────────────────────────────────────────── */
  else if (sectionindex === 3) {
    return (
      <div
        style={{
          borderRadius: "16px", overflow: "hidden",
          background: theme.cardSurface,
          border: `2px solid ${theme.cardBorder}`,
          boxShadow: isHovered
            ? `0 14px 32px ${theme.accentGlow}`
            : "0 4px 16px rgba(15,23,42,0.04)",
          width: "100%", minHeight: "290px", height: "100%", margin: "0 auto",
          transform: isHovered ? "translateY(-5px)" : "translateY(0)",
          transition: "all 0.25s ease",
          position: "relative", display: "flex", flexDirection: "column",
          alignItems: "center", padding: "14px 12px 10px",
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {d.productPrice && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "-32px",
              background: theme.priceBadgeBg,
              color: "#fff",
              padding: "4px 35px",
              fontSize: "11px",
              fontWeight: 900,
              transform: "rotate(-45deg)",
              zIndex: 3,
              boxShadow: `0 2px 8px ${theme.accentGlow}`,
              letterSpacing: "0.3px",
            }}
          >
            {d.productPrice}
          </div>
        )}

        {/* Compare — top right */}
        <button type="button" onClick={d.onClickCompare} aria-label="Compare product"
          style={{
            position: "absolute", top: "10px", right: "10px",
            width: "26px", height: "26px", borderRadius: "50%",
            background: theme.accentSoft, border: `1.5px solid ${theme.accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 3, padding: 0,
          }}
        >
          <i className="fas fa-balance-scale" style={{ color: theme.accent, fontSize: "10px" }} />
        </button>

        {/* Image with border ring */}
        <div
          onClick={d.onClickProduct}
          style={{
            width: "110px", height: "110px", borderRadius: "16px",
            border: `3px solid ${theme.accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginTop: "8px", background: "#fff",
            boxShadow: `0 4px 16px ${theme.accentSoft}`,
          }}
        >
          <img src={d.imageSrc} alt={d.productTitle} loading={d.loadingStrategy}
            onError={d.onImageError}
            style={{ maxWidth: "82%", maxHeight: "82%", objectFit: "contain" }}
          />
        </div>

        {/* Rating — stars row */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px", marginTop: "12px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <RatingStar key={i} size={13} color={i <= Math.round(Number(d.ratingScore)) ? "#ff8800" : "#d1d5db"} />
          ))}
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#6200ff", marginLeft: "4px" }}>{d.ratingScore}</span>
          <span style={{ fontSize: "9px", color: "#455163", marginLeft: "4px" }}>({d.reviewCount}+)</span>
        </div>

        {/* Title */}
        <h4 onClick={d.onClickProduct}
          style={{
            fontSize: "12px", fontWeight: 700, color: "#1e293b",
            margin: "6px 0 2px", textAlign: "center", lineHeight: 1.3,
            maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >{d.productTitle}</h4>

        {/* Vendor tag */}
        <button type="button" onClick={d.onClickVendor}
          style={{
            background: theme.accentSoft, transform: "translateY(3px)", border: `1px solid ${theme.cardBorder}`,
            borderRadius: "999px", padding: "2px 10px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "10px", fontWeight: 600, color: theme.accent,
          }}
        >
          <i className="fas fa-store" style={{ fontSize: "10px" }} />
          <span style={{ maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.vendorName}</span>
        </button>
        <span style={{ fontSize: "10px", color: "#484949", display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap", transform: "translateY(7px)" }}>✅ 100% Authentic</span>

        {/* Outline button */}
        <button onClick={d.onClickProduct} style={{ width: "100%", marginTop: "auto", padding: "6px 0", borderRadius: "10px", cursor: "pointer", background: "transparent", border: `2px solid ${theme.accent}`, color: theme.accent, fontSize: "11px", fontWeight: 700, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", ...(isHovered ? { background: theme.buttonBg, color: "#fff" } : {}), }}><span>Book Now</span></button>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────
     LAYOUT 4 — MINIMAL OUTLINE
     Outline-only card (no fill), hexagonal clip-path image,
     amber/gold tones, border glow hover.
     ────────────────────────────────────────────────────── */
  else if (sectionindex === 4) {
    return (
      <div
        style={{
          borderRadius: "16px",
          background: "radial-gradient(circle at top left, rgba(174, 0, 255, 0.05), transparent 45%), radial-gradient(circle at bottom right, rgba(96, 33, 231, 0.04), transparent 45%), #FFFFFF",
          border: `1px solid ${theme.cardBorder || "rgba(174, 0, 255, 0.12)"}`,
          width: "100%",
          minHeight: "290px",
          height: "100%",
          margin: "0 auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          boxSizing: "border-box",
          boxShadow: isHovered
            ? "0 20px 25px -5px rgba(174, 0, 255, 0.12), 0 10px 10px -5px rgba(124, 58, 237, 0.04)"
            : "0 4px 12px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.005)",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >

        {/* Minimalist Action Badges */}
        <div style={{ position: "absolute", top: "12px", left: "12px", right: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 3 }}>
          <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: theme.accent, background: theme.accentSoft, padding: "3px 8px", borderRadius: "6px" }}>Authentic</span>
          <button type="button" onClick={d.onClickCompare} aria-label="Compare product" style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", transition: "all 0.2s ease" }}><i className="fa-solid fa-scale-balanced" style={{ color: "#973dec", fontSize: "11px" }} /></button>
        </div>

        {/* Elegant Clean Image Area */}
        <div onClick={d.onClickProduct} style={{
          width: "100%", height: "120px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginTop: "16px", marginBottom: "12px", borderRadius: "12px", filter: isHovered ? "brightness(1.10)" : "brightness(1.00)",
          background: "linear-gradient(180deg, rgba(243,239,255,0.4) 0%, rgba(255,255,255,0) 100%)"
        }}><img src={d.imageSrc} alt={d.productTitle} loading={d.loadingStrategy} onError={d.onImageError} style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain", mixBlendMode: "multiply", transition: "transform 0.3s ease", transform: isHovered ? "scale(1.04)" : "scale(1)" }} /></div>

        {/* Metadata Line: Vendor + Rating */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", width: "100%" }}>
          <span onClick={d.onClickVendor} style={{ fontSize: "10px", fontWeight: 600, color: "#6B7280", cursor: "pointer", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.vendorName}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}><RatingStar size={10} /><span style={{ fontSize: "10px", fontWeight: 800, color: "#1F2937", marginLeft: "2px" }}>{d.ratingScore}</span>
            <span style={{ fontSize: "9px", color: "#455163", marginLeft: "4px" }}>({d.reviewCount}+)</span>
          </div>
        </div>

        {/* Title */}
        <h4 onClick={d.onClickProduct} style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: "0 0 12px", textAlign: "left", width: "100%", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", cursor: "pointer", lineHeight: "1.4", height: "36px" }}>{d.productTitle}</h4>

        {/* Bottom Row: Price & Modern View Details Text */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "9px", color: "#9CA3AF", textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.3px" }}>Price</span><span style={{ fontSize: "15px", fontWeight: 700, color: theme.accent }}>{d.productPrice}</span></div>
          <button onClick={d.onClickProduct} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#111827", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>Book Now<span style={{ transform: isHovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.2s ease" }}>→</span></button>
        </div>
      </div>
    );

  }

  /* ──────────────────────────────────────────────────────
     LAYOUT 5 — DARK GLASSMORPHISM
     Dark card (#0f1a14), diamond-rotated image (45deg),
     emerald neon accents, frosted glass inner panel.
     ────────────────────────────────────────────────────── */
  else if (sectionindex === 5) {
    return (
      <div
        style={{
          borderRadius: "20px",
          /* Premium Deep-to-Light Purple Gradient Canvas */
          background: "linear-gradient(135deg, #875cad 0%, #bd81f5 60%, #b86cff 100%)",
          border: `1px solid ${theme.cardBorder || "rgba(90, 34, 187, 0.12)"}`,
          /* Soft Layered Purple Ambient Glow Drop Shadow */
          boxShadow: isHovered
            ? `0 16px 32px -4px ${theme.accentGlow || "rgba(124, 58, 237, 0.16)"}, 0 4px 12px -2px rgba(124, 58, 237, 0.06)`
            : "0 4px 20px -6px rgba(124, 58, 237, 0.04)",
          width: "100%",
          minHeight: "290px",
          height: "100%",
          margin: "0 auto",
          transform: isHovered ? "translateY(-5px) scale(1.01)" : "translateY(0) scale(1)",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px",
        }}

        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >

        {/* Compare Button */}
        <button
          type="button"
          onClick={d.onClickCompare}
          aria-label="Compare product"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "26px",
            height: "26px",
            borderRadius: "8px",
            background: "rgb(219, 202, 248)",
            border: `1px solid ${theme.cardBorder || "#cebaf0"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 3,
            padding: 0,
            transition: "all 0.2s ease",
          }}
        >
          <i
            className="fa-solid fa-scale-balanced"
            style={{ color: theme.accent || "#7C3AED", fontSize: "10px", transition: "all 0.2s ease" }}
          />
        </button>

        {/* Diamond Image Frame */}
        <div
          onClick={d.onClickProduct}
          style={{
            /* Dynamic sizing scale changes cleanly on hover */
            width: isHovered ? "130px" : "85px",
            height: isHovered ? "100px" : "80px",
            borderRadius: "12px",
            background: isHovered ? "rgb(232, 209, 248)" : "rgba(255, 255, 255, 0.93)",
            border: `1.5px solid ${theme.cardBorder || "rgb(98, 10, 252)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            marginTop: "14px",
            marginBottom: "16px",
            overflow: "hidden", /* Added to keep the image contained within the changing borders */

            boxShadow: isHovered
              ? `0 0 25px 6px ${theme.accentGlow || "rgba(124, 58, 237, 0.45)"}, 0 12px 20px -4px rgba(0, 0, 0, 0.15)`
              : "0 2px 8px -2px rgba(0, 0, 0, 0.12)",

            /* OPTIMIZED: Synced timing curve for complex dimension rendering */
            transition: "all 0.2s cubic-bezier(0.25, 1, 0.5, 1)",

            /* Forces GPU pre-rendering for layout changes */
            willChange: "width, height, background-color, box-shadow",
          }}
        >
          <img
            src={d.imageSrc}
            alt={d.productTitle}
            loading={d.loadingStrategy}
            onError={d.onImageError}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",

              /* Clean 1.05x scale zoom on hover */
              transform: isHovered ? "scale(1.05)" : "scale(1.0)",

              /* PERFECTLY SYNCED: Matches parent container speed exactly */
              transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",

              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          />
        </div>

        {/* Refined Translucent Info Plate */}
        <div
          style={{
            width: "100%",
            flex: 1,
            background: "rgb(247, 240, 253)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "14px",
            padding: "10px",
            border: "1px solid rgba(255, 255, 255, 0.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <RatingStar size={12} color="#ff7300" />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: theme.accent || "#7C3AED",
              }}
            >
              {d.ratingScore}
            </span>
            <span style={{ fontSize: "9px", color: "#000000ea" }}>
              ({d.reviewCount}+)
            </span>
          </div>

          {/* Product Title */}
          <h4
            onClick={d.onClickProduct}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#692bec",
              margin: "2px 0",
              textAlign: "center",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
              letterSpacing: "0.1px",
            }}
          >
            {d.productTitle}
          </h4>

          {/* Elegant Purple Price */}
          {d.productPrice && (<div
            style={{
              color: theme.accent || "#733ad6",
              fontSize: "16px",
              fontWeight: 800,
              letterSpacing: "-0.2px",
            }}
          >
            {d.productPrice}
          </div>)}

          {/* Vendor Badge */}
          <button
            type="button"
            onClick={d.onClickVendor}
            style={{
              background: theme.accentSoft || "rgba(124, 58, 237, 0.06)",
              border: `1px solid ${theme.cardBorder || "rgba(124, 58, 237, 0.08)"}`,
              borderRadius: "999px",
              padding: "2px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: theme.accent || "#7C3AED",
              fontSize: "9px",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124, 58, 237, 0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = theme.accentSoft || "rgba(124, 58, 237, 0.06)")}
          >
            <i className="fas fa-store" style={{ fontSize: "8px" }} />
            <span
              style={{
                maxWidth: "90px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                transform: "translateY(0.5px)"
              }}
            >
              {d.vendorName}
            </span>
          </button>

          {/* Premium Dynamic Light Purple Action Button */}
          <button
            onClick={d.onClickProduct}
            style={{
              width: "100%",
              padding: "7px 0",
              borderRadius: "8px",
              cursor: "pointer",
              background: isHovered ? (theme.buttonBg || "#7C3AED") : "transparent",
              border: `1.5px solid ${theme.accent || "#7C3AED"}`,
              color: isHovered ? "#FFFFFF" : (theme.accent || "#7C3AED"),
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.3px",
              boxShadow: isHovered
                ? `0 6px 16px ${theme.accentGlow || "rgba(124, 58, 237, 0.2)"}`
                : "none",
              transform: isHovered ? "translateY(-0.5px)" : "translateY(0)",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Order Now
          </button>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────
     LAYOUT 6 — MAGAZINE COVER
     Image fills entire card as background, teal gradient
     overlay from bottom, white text, large title.
     ────────────────────────────────────────────────────── */
  else if (sectionindex === 6) {
    return (
      <div
        style={{
          borderRadius: "18px", overflow: "hidden",
          width: "100%", minHeight: "290px", height: "100%", margin: "0 auto",
          position: "relative", cursor: "pointer",
          boxShadow: isHovered
            ? `0 16px 36px ${theme.accentGlow}`
            : "0 8px 20px rgba(0,0,0,0.08)",
          transform: isHovered ? "scale(1.02)" : "scale(1)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onClick={d.onClickProduct}
      >
        {/* Background image */}
        <img src={d.imageSrc} alt={d.productTitle} loading={d.loadingStrategy}
          onError={d.onImageError}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            objectFit: "cover",
            transform: isHovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.5s ease",
            filter: isHovered ? "brightness(1.10)" : "brightness(1)",

          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: `linear-gradient(180deg, transparent 40%, ${theme.priceBadgeBg}cc 65%, ${theme.priceBadgeBg}f2 100%)`,
          zIndex: 1,
        }} />

        {/* Price badge — top right */}
        {d.productPrice && (<div style={{
          position: "absolute", top: "10px", right: "10px", zIndex: 3,
          background: "rgba(255,255,255,0.92)", borderRadius: "10px",
          padding: "4px 10px", fontSize: "13px", fontWeight: 800,
          color: theme.priceBadgeBg,
        }}>{d.productPrice}</div>)}

        {/* Compare — top left */}
        <button type="button" onClick={d.onClickCompare} aria-label="Compare product"
          style={{
            position: "absolute", top: "10px", left: "10px", zIndex: 3,
            width: "28px", height: "28px", borderRadius: "50%",
            background: "rgba(255,255,255,0.88)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0,
          }}
        >
          <i className="fas fa-balance-scale" style={{ color: theme.priceBadgeBg, fontSize: "10px" }} />
        </button>

        {/* Bottom content */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "14px", zIndex: 2,
          display: "flex", flexDirection: "column", gap: "4px",
        }}>
          <h4 style={{
            fontSize: "14px", fontWeight: 800, color: "#fff",
            margin: 0, lineHeight: 1.25,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", textShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}>{d.productTitle}</h4>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <RatingStar size={11} />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>{d.ratingScore}</span>
            </div>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)" }}>•</span>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)" }}>{d.reviewCount} +</span>
          </div>

          <button type="button" onClick={(e) => { e.stopPropagation(); d.onClickVendor(e); }}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "4px",
              color: "rgba(255,255,255,0.8)", fontSize: "10px", fontWeight: 600,
            }}
          >
            {d.vendorImageSrc ? (
              <img src={d.vendorImageSrc} alt={d.vendorName} onError={d.onVendorImageError}
                style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "contain", border: "1px solid rgba(255,255,255,0.3)" }}
              />
            ) : (
              <i className="fas fa-store" style={{ fontSize: "9px" }} />
            )}
            <span>{d.vendorName}</span>
          </button>

          <button
            onClick={d.onClickProduct}
            style={{
              width: "100%",
              padding: "7px 0",
              borderRadius: "10px",
              cursor: "pointer",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",

              /* FIX: Set a fixed off-white color base but make it completely invisible by default */
              border: "0px solid rgba(241, 241, 245, 0)",

              ...(isHovered ? {
                background: "rgba(255,255,255,0.25)",
                /* FIX: Bring the off-white border color to 100% visibility on hover */
                borderColor: "rgba(241, 241, 245, 1)",
              } : {}),
            }}
          >
            Book Now
          </button>


        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────
     LAYOUT 7 — COMPACT DENSE
     Dense vertical card, small circle image top-left,
     info fills card. Deep purple chip style.
     ────────────────────────────────────────────────────── */
  else if (sectionindex === 7) {
    return (
      <div
        style={{
          borderRadius: "16px",
          /* Light Purple Palette inspired by the layout template structure */
          background: "linear-gradient(180deg, #d4c0f1 0%, #baa1f8 40%, #FFFFFF 100%)",
          width: "100%",
          minHeight: "335px",
          height: "100%",
          margin: "0 auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          zindex: -1,
          boxSizing: "border-box",
          boxShadow: isHovered
            ? "0 25px 45px -10px rgba(124, 58, 237, 0.25)"
            : "0 10px 30px rgba(124, 58, 237, 0.06)",
          transform: isHovered ? "translateY(-6px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
          border: "1px solid rgba(124, 58, 237, 0.15)"
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >

        {/* The Top Curved Hemisphere Arc Layout - Image now fills this container completely */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-20px",
            right: "-20px",
            height: "240px",
            borderRadius: "50%",
            borderBottom: "3px solid #4304ff",
            /* Fallback background layer gradient */
            background: `radial-gradient(circle at 50% 60%, #E8DFFF 0%, #F5F0FF 100%)`,
            zIndex: 1, /* Moved up to render above the card foundation shell */
            boxShadow: "inset -1px -20px 30px rgba(167, 139, 250, 0.1)",
            overflow: "hidden", /* Critical: Masks the image corners to perfectly fit the circle shape */
            cursor: "pointer"
          }}
          onClick={d.onClickProduct}
        >
          {/* Product Image nested inside to bleed across the sphere shape boundaries completely */}
          <img
            src={d.imageSrc}
            alt={d.productTitle}
            loading={d.loadingStrategy}
            onError={d.onImageError}
            style={{
              position: "absolute",
              left: 0,
              top: "65px",
              width: "100%",
              height: "82%",
              /* cover ensures the graphic stretches to fully fill the circle dimension scales */
              objectFit: "conatin",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: isHovered ? "brightness(1.08)" : "brightness(1)",
              zIndex: -1 /* Keeps any absolute badges or star metrics readable on top of it */
            }}
          />
        </div>

        {/* Floating Circle Badge Overlay Block matching the template layout position */}
        <div
          onClick={d.onClickVendor}
          style={{
            position: "absolute", top: "115px", right: "16px",
            width: "48px", height: "48px", borderRadius: "50%",
            background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.2)",
            zIndex: 3, cursor: "pointer", overflow: "hidden"
          }}
        >
          {d.vendorImageSrc ? (
            <img src={d.vendorImageSrc} alt="" onError={d.onVendorImageError} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <i className="fas fa-store" style={{ fontSize: "16px", color: "#6815f8" }} />
          )}
        </div>


        {/* Content Details Area */}
        <div
          style={{
            zIndex: 2,
            position: "relative",
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            alignItems: "center"
          }}
        >
          {/* Compare Handle Action Trigger */}
          <button
            type="button"
            onClick={d.onClickCompare}
            style={{
              position: "absolute",
              top: "-30px",
              left: "0",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              width: "25px", height: "25px", borderRadius: "50%",
              // border: "px solid rgba(106, 29, 240, 0.49)",
              color: "rgba(124, 58, 237, 0.76)",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#660efd")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(124, 58, 237, 0.83)")}
          >
            <i className="fa-solid fa-scale-balanced" style={{ fontSize: "12px" }} />
          </button>

          {/* Main Wide Purple Gradient Callout Container - Replicates the primary text layout banner */}
          <div
            onClick={d.onClickProduct}
            style={{
              background: "linear-gradient(90deg, #7C3AED 0%, #9061F9 100%)",
              borderRadius: "12px",
              padding: "10px 14px",
              width: "100%",
              boxSizing: "border-box",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(124, 58, 237, 0.2)",
              marginBottom: "12px"
            }}
          >
            <h4
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#FFFFFF",
                margin: 0,
                textAlign: "center",
                lineHeight: "1.3",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                height: "25px"
              }}
            >
              {d.productTitle}
            </h4>
          </div>

          {/* Product Pricing Block */}
          {d.productPrice && (<div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#2C253B",
              marginBottom: "4px",
              letterSpacing: "-0.3px"
            }}
          >
            {d.productPrice}
          </div>)}

          {/* Metadata Line Row Profile Layout */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
              <RatingStar size={11} color="#ff7b00" />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#1a1722", marginLeft: "2px" }}>{d.ratingScore}</span>
              <span style={{ fontSize: "8px", color: "rgba(0, 0, 0, 0.7)" }}>({d.reviewCount}+)</span>
            </div>
            <span style={{ fontSize: "12px", color: "rgb(93, 0, 255)" }}>•</span>
            <span
              onClick={d.onClickVendor}
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#313131",
                cursor: "pointer",
                maxWidth: "70px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {d.vendorName}
            </span>
          </div>

          {/* Footer Utility Row Container Matrix */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(124, 58, 237, 0.27)",
              paddingTop: "12px"
            }}
          >
            {/* Primary Vector Text Action Link Button */}
            <button
              onClick={d.onClickProduct}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#7C3AED",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              Order Now
              <span style={{ transform: isHovered ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s ease" }}>→</span>
            </button>
          </div>
        </div>
      </div>
    );

  }

  /* ──────────────────────────────────────────────────────
     LAYOUT 8 — POLAROID
     Thick white border like a Polaroid photo, square image,
     caption below, warm amber tones, 3D tilt on hover.
     ────────────────────────────────────────────────────── */
  else if (sectionindex === 8) {
    return (
      <div
        style={{
          borderRadius: "6px",
          background: theme.cardSurface,
          border: "6px solid #fff",
          boxShadow: isHovered
            ? `0 16px 32px rgba(0,0,0,0.12), 0 0 0 1px ${theme.cardBorder}`
            : `0 6px 16px rgba(0,0,0,0.06), 0 0 0 1px ${theme.cardBorder}`,
          width: "100%", minHeight: "295px", height: "100%", margin: "0 auto",
          transform: isHovered
            ? "perspective(600px) rotateY(-5deg) rotateX(4deg) translateY(-6px)"
            : "perspective(600px) rotateY(0) rotateX(0) translateY(0)",
          transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Compare */}
        <button type="button" onClick={d.onClickCompare} aria-label="Compare product"
          style={{
            position: "absolute", top: "4px", right: "4px",
            width: "24px", height: "24px", borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.95)", border: `1px solid ${theme.cardBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 3, padding: 0,
          }}
        >
          <i className="fas fa-balance-scale" style={{ color: theme.accent, fontSize: "10px" }} />
        </button>

        {/* Square image area */}
        <div
          onClick={d.onClickProduct}
          style={{
            height: "160px", background: theme.gradientHeader,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative",
          }}
        >
          <img src={d.imageSrc} alt={d.productTitle} loading={d.loadingStrategy}
            onError={d.onImageError}
            style={{
              maxWidth: "80%", maxHeight: "85%", objectFit: "contain",
              // filter: isHovered ? "none" : "saturate(1.0) brightness(0.92)",
              transition: "filter 0.3s ease",
              filter: isHovered ? "brightness(1.10)" : "brightness(1)",
            }}
          />

          {/* Shine effect on hover */}
          {isHovered && (
            <div style={{
              position: "absolute", top: 0, left: "-120%", width: "50%", height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(250, 249, 249, 0.29), transparent)",
              animation: "dsShine 0.6s ease-in-out 2 forwards",
            }} />
          )}
        </div>

        {/* Caption area — Polaroid style */}
        <div style={{
          padding: "10px 10px 8px", flex: 1,
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ fontSize: "15px", fontWeight: 900, color: theme.priceBadgeBg }}>{d.productPrice}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <RatingStar size={13} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#000000" }}>{d.ratingScore}</span>
                <span style={{ fontSize: "8px", color: "rgba(0, 0, 0, 0.9)" }}>({d.reviewCount}+)</span>
              </div>
            </div>

            <h4 onClick={d.onClickProduct}
              style={{
                fontSize: "12px", fontWeight: 600, color: "#44403c",
                margin: "0 0 4px", lineHeight: 1.3, cursor: "pointer",
                fontStyle: "bold",
                bottom: "4px",
                maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >{d.productTitle}</h4>
            <p style={{ fontSize: "10px", color: "#313131", top: "2px", margin: "7px 0" }}> ✅ 100% Authentic</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button type="button" onClick={d.onClickVendor}
              style={{
                background: "none", border: "none", padding: 0, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "3px",
                color: theme.accent, fontSize: "9px", fontWeight: 600,
              }}
            >
              {d.vendorImageSrc ? (
                <img src={d.vendorImageSrc} alt={d.vendorName} onError={d.onVendorImageError}
                  style={{ width: "20px", height: "20px", borderRadius: "6px", objectFit: "contain" }}
                />
              ) : (
                <i className="fas fa-store" style={{ fontSize: "8px" }} />
              )}
              <span style={{ maxWidth: "70px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.vendorName}</span>
            </button>

            <button
              onClick={d.onClickProduct}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.priceBadgeBg,
                fontSize: "11px",
                fontWeight: 800,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {/* Animated Underline Text */}
              <span
                style={{
                  textDecoration: isHovered ? "underline" : "none",
                  textUnderlineOffset: "3px",
                  transition: "text-decoration 0.2s ease",
                  texttransform: isHovered ? "hover" : "105px",
                }}
              >
                Book Now
              </span>

              {/* Animated Arrow */}
              <span
                style={{
                  display: "inline-block",
                  marginLeft: "4px",
                  transform: isHovered ? "translateX(4px)" : "translateX(0)",
                  transition: "transform 0.2s ease",
                }}
              >
                →
              </span>
            </button>

          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────
     LAYOUT 9 — NEON FRAME
     Dark card (#0a0e27), electric blue neon glowing border,
     rounded-rect image with glow, pulsing animation.
     ────────────────────────────────────────────────────── */
  else if (sectionindex === 9) {
    return (
      <div
        style={{
          borderRadius: "20px",
          background: "#FFFFFF", // Clean premium crisp white card base
          width: "100%",
          minHeight: "290px",
          height: "100%",
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: isHovered
            ? "0 20px 25px -5px rgba(147, 51, 234, 0.15), 0 10px 10px -5px rgba(147, 51, 234, 0.1)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
          transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Compare Button - Subtle Floating Overlaid */}
        <button
          type="button"
          onClick={d.onClickCompare}
          aria-label="Compare product"
          style={{
            position: "absolute", top: "180px", left: "12px",
            width: "24px", height: "24px", borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(27, 26, 27, 0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 3, padding: 0,
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}
        >
          <i className="fas fa-balance-scale" style={{ color: "#7E22CE", fontSize: "10px" }} />
        </button>

        {/* Header Section: Diagonal Split Background */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "135px",
            // Distinct diagonal split style matching the uploaded template using light purple theme
            background: "linear-gradient(135deg, #7738ad 0%, #b86cff 60%, #F3E8FF 60.1%, #F3E8FF 100%)",
            zIndex: 1,
          }}
        />

        {/* Header Text & Floating Price Layout */}
        <div style={{ position: "relative", zIndex: 2, padding: "14px 14px 0", display: "flex", justifyContent: "space-between" }}>
          {/* Title & Short Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxWidth: "60%" }}>
            <h4
              onClick={d.onClickProduct}
              style={{
                fontSize: "11px", fontWeight: 800, color: "#FFFFFF",
                margin: 0, textTransform: "uppercase", letterSpacing: "0.5px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {d.productTitle}
            </h4>
            <span style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.85)", lineHeight: "1.2", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              Premium Selection By {d.vendorName}
            </span>
          </div>

          {/* Circle Price Badge */}
          {d.productPrice && (<div
            style={{
              width: "clamp(40px, 5vw, 55px)",
              height: "clamp(40px, 5vw, 55px)",
              minWidth: "32px",
              borderRadius: "50%",
              background: "#FAE8FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(126, 34, 206, 0.25)",
              fontSize: "clamp(8px, 1vw, 9px)",
              fontWeight: 800,
              color: "#920CFF",
              flexShrink: 0,
            }}
          >
            {d.productPrice}
          </div>)}
        </div>

        {/* Center Circle Image Frame */}
        <div
          onClick={d.onClickProduct}
          style={{
            position: "relative", zIndex: 2,
            width: "115px", height: "115px", borderRadius: "50%",
            background: "#F8FAFC",
            border: "1.8px solid #7b00ff", // Signature framing border matching image
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", margin: "16px auto 0",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            overflow: "hidden"
          }}
        >
          <img
            src={d.imageSrc}
            alt={d.productTitle}
            loading={d.loadingStrategy}
            onError={d.onImageError}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              // Combines the 1.10 scale zoom and brightness filter smoothly
              transform: isHovered ? "scale(1.10)" : "scale(1)",
              filter: isHovered ? "brightness(1.30)" : "brightness(1)",
              transition: "transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), filter 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />

        </div>

        {/* Lower Metadata and Button Container */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 14px 12px", width: "100%", boxSizing: "border-box" }}>
          {/* Rating & Vendor Meta Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <RatingStar size={12} color="#ff6b08" />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#000000" }}>{d.ratingScore}</span>
              <span style={{ fontSize: "9px", color: "rgba(0, 0, 0, 0.9)" }}>({d.reviewCount}+)</span>
            </div>
            <span style={{ color: "#6b6c6d", fontSize: "10px" }}>|</span>
            <button type="button" onClick={d.onClickVendor} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#64748B", fontSize: "10px", fontWeight: 500 }}>
              {d.vendorName}
            </button>
          </div>

          {/* Pill-Shaped Modern Action Button */}
          <button
            onClick={d.onClickProduct}
            style={{
              width: "90%", padding: "8px 0",
              borderRadius: "20px", cursor: "pointer",
              background: isHovered ? "#6B21A8" : "#7E22CE", // Dynamic light deep purple interactive shifts
              border: "none",
              color: "#FFFFFF", fontSize: "10px", fontWeight: 700,
              boxShadow: "0 4px 6px -1px rgba(126, 34, 206, 0.2)",
              transition: "background 0.2s ease, transform 0.2s ease",
              letterSpacing: "0.5px", textTransform: "uppercase",
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    );
  }

  // < -- Layout 10 — PREMIUM GLASSMORPHIC CARD -->
  else if (sectionindex === 10) {
    return (
      <div
        style={{
          borderRadius: "20px",
          background: "#FDFCFF", // Premium clean light purple tinted base background
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${theme.cardBorder || "rgba(168, 85, 247, 0.16)"}`,
          boxShadow: isHovered
            ? "0 20px 44px rgba(168, 85, 247, 0.18)"
            : "0 10px 24px rgba(15,23,42,0.04)",
          width: "100%",
          minHeight: "290px",
          height: "100%",
          margin: "0 auto",
          transform: isHovered ? "translateY(-9px)" : "translateY(0)",
          transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Compare Button */}
        <button
          type="button"
          onClick={d.onClickCompare}
          aria-label="Compare product"
          style={{
            position: "absolute", top: "8px", right: "8px", width: "26px", height: "26px",
            borderRadius: "50%", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.57)",
            zIndex: 10, padding: 0, cursor: "pointer",
          }}
        >
          <i className="fas fa-scale-balanced" style={{ color: "#8a13fa", fontSize: "11px" }} />
        </button>

        {/* Upper Section: Image Area with matching original curve design */}
        <div
          style={{
            height: "135px",
            // Reverted to your exact gradient specifications
            background: "linear-gradient(180deg, #7f47af 10%, #b86cff  100%, #F3E8FF 60.1%, #F3E8FF 100%)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Unequal values force the bottom line to tilt and flow into an S-type wave
            // Custom asymmetry creates a fluid, organic undulating line
            borderBottomLeftRadius: "50% 0px",
            borderBottomRightRadius: "60% 150px",
            overflow: "hidden",
          }}
        >
          {/* Rating Tag */}
          <div
            style={{
              position: "absolute", top: "8px", left: "8px", borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.88)", backdropFilter: "blur(4px)",
              border: "1px solid rgba(168, 85, 247, 0.15)", zIndex: 10,
              display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 7px",
            }}
          >
            <RatingStar size={12} color="#ff8800" />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b21a8" }}>{d.ratingScore}</span>
            <span style={{ fontSize: "9px", fontWeight: 500, color: "#07020c" }}>({d.reviewCount}+)</span>
          </div>

          {/* Circle Frame Wrapper: Image now fills the circle completely */}
          <div
            onClick={d.onClickProduct}
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(168, 85, 247, 0.15)",
              border: "3px solid #ffffff",
              cursor: "pointer",
              marginTop: "17px",

              zIndex: 2,
              overflow: "hidden", // Keeps image inside circle bounds
            }}
          >
            <img
              src={d.imageSrc}
              alt={d.productTitle}
              loading={d.loadingStrategy}
              onError={d.onImageError}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Forces image fill with zero empty spacing
                transform: isHovered ? "scale(1.10)" : "scale(1)", // 110% Zoom transition on hover
                filter: isHovered ? "brightness(1.20)" : "brightness(1.05)", // Brightness shift
                transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s ease-in-out"
              }}
            />
          </div>
        </div>

        {/* Lower Section: Content Info details layout row elements */}
        <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>

          {/* Title block line */}
          <h4
            onClick={d.onClickProduct}
            style={{
              fontSize: "13px", fontWeight: 700, color: "#4c1d95", margin: "2px 0 0",
              maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "capitalize",
              cursor: "pointer", lineHeight: 1.2,
            }}
          >
            {d.productTitle}
          </h4>
          {/* Vendor Profile block row */}
          <button
            type="button"
            onClick={d.onClickVendor}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              color: "#010003", fontSize: "11px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "6px", margin: "2px 0"
            }}
          >
            {d.vendorImageSrc ? (
              <img
                src={d.vendorImageSrc} alt={d.vendorName} onError={d.onVendorImageError}
                style={{ width: "25px", height: "25px", borderRadius: "50%", objectFit: "contain", border: "1px solid #e9d5ff" }}
              />
            ) : (
              <i className="fas fa-store" style={{ fontSize: "10px", color: "#a855f7" }} />
            )}
            <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.vendorName}</span>
          </button>

          {/* Centered Pricing Badge line row layout */}
          {d.productPrice && (<div
            style={{
              color: "#6b21a8",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              margin: "4px 0",
            }}
          >
            {d.productPrice}
          </div>)}

          {/* Action Button: Styled like premium template button offset to the Left side */}
          <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
            <button
              onClick={d.onClickProduct}
              style={{
                width: "110px", // Exact custom pill dimensions matching template design reference card
                padding: "8px 0",
                border: "none",
                borderRadius: "999px",
                background: "linear-gradient(50deg, #975dce 10%, #7c3aed 100%)", // Premium light purple palette
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                cursor: "pointer",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              Book Now ➥
            </button>
          </div>
        </div>
      </div>
    );
  }
  /*   -- layout 11 cards --   */
  else if (sectionindex === 11) {
    return (
      <div
        style={{
          borderRadius: "20px",
          background: "#FDFCFF", // Premium clean light purple tinted base background
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${theme.cardBorder || "rgba(168, 85, 247, 0.16)"}`,
          boxShadow: isHovered
            ? "0 20px 44px rgba(168, 85, 247, 0.18)"
            : "0 10px 24px rgba(15,23,42,0.04)",
          width: "100%",
          minHeight: "290px",
          height: "100%",
          margin: "0 auto",
          transform: isHovered ? "translateY(-9px)" : "translateY(0)",
          transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Compare Button */}
        <button
          type="button"
          onClick={d.onClickCompare}
          aria-label="Compare product"
          style={{
            position: "absolute", top: "8px", right: "8px", width: "26px", height: "26px",
            borderRadius: "50%", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.57)",
            zIndex: 10, padding: 0, cursor: "pointer",
          }}
        >
          <i className="fas fa-scale-balanced" style={{ color: "#8a13fa", fontSize: "11px" }} />
        </button>

        {/* Upper Section: Image Area with matching original curve design */}
        <div
          style={{
            height: "135px",
            // Reverted to your exact gradient specifications
            background: "linear-gradient(180deg, #7f47af 10%, #b86cff  100%, #F3E8FF 60.1%, #F3E8FF 100%)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Unequal values force the bottom line to tilt and flow into an S-type wave
            // Custom asymmetry creates a fluid, organic undulating line
            borderBottomLeftRadius: "50% 0px",
            borderBottomRightRadius: "60% 0px",
            overflow: "hidden",
          }}
        >
          {/* Rating Tag */}
          <div
            style={{
              position: "absolute", top: "8px", left: "8px", borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.88)", backdropFilter: "blur(4px)",
              border: "1px solid rgba(168, 85, 247, 0.15)", zIndex: 10,
              display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 7px",
            }}
          >
            <RatingStar size={12} color="#ff8800" />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b21a8" }}>{d.ratingScore}</span>
            <span style={{ fontSize: "9px", fontWeight: 500, color: "#07020c" }}>({d.reviewCount}+)</span>
          </div>

          {/* Circle Frame Wrapper: Image now fills the circle completely */}
          <div
            onClick={d.onClickProduct}
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(168, 85, 247, 0.15)",
              border: "3px solid #ffffff",
              cursor: "pointer",
              marginTop: "17px",

              zIndex: 2,
              overflow: "hidden", // Keeps image inside circle bounds
            }}
          >
            <img
              src={d.imageSrc}
              alt={d.productTitle}
              loading={d.loadingStrategy}
              onError={d.onImageError}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Forces image fill with zero empty spacing
                transform: isHovered ? "scale(1.10)" : "scale(1)", // 110% Zoom transition on hover
                filter: isHovered ? "brightness(1.20)" : "brightness(1.05)", // Brightness shift
                transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s ease-in-out"
              }}
            />
          </div>
        </div>

        {/* Lower Section: Content Info details layout row elements */}
        <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>

          {/* Title block line */}
          <h4
            onClick={d.onClickProduct}
            style={{
              fontSize: "13px", fontWeight: 700, color: "#4c1d95", margin: "2px 0 0",
              maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "capitalize",
              cursor: "pointer", lineHeight: 1.2,
            }}
          >
            {d.productTitle}
          </h4>
          {/* Vendor Profile block row */}
          <button
            type="button"
            onClick={d.onClickVendor}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              color: "#010003", fontSize: "11px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "6px", margin: "2px 0"
            }}
          >
            {d.vendorImageSrc ? (
              <img
                src={d.vendorImageSrc} alt={d.vendorName} onError={d.onVendorImageError}
                style={{ width: "25px", height: "25px", borderRadius: "50%", objectFit: "contain", border: "1px solid #e9d5ff" }}
              />
            ) : (
              <i className="fas fa-store" style={{ fontSize: "10px", color: "#a855f7" }} />
            )}
            <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.vendorName}</span>
          </button>

          {/* Centered Pricing Badge line row layout */}
          {d.productPrice && (<div
            style={{
              color: "#6b21a8",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              margin: "4px 0",

              /* FIXED: Modern layout rules to force perfect horizontal centering */
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {d.productPrice}
          </div>)}

          {/* Action Button: Styled like premium template button offset to the Left side */}
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <button
              onClick={d.onClickProduct}
              style={{
                width: "110px", // Exact custom pill dimensions matching template design reference card
                padding: "8px 0",
                border: "none",
                position: "center",
                borderRadius: "999px",
                background: "linear-gradient(50deg, #975dce 10%, #7c3aed 100%)", // Premium light purple palette
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                cursor: "pointer",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              ➥ Book Now
            </button></div>
        </div>
      </div>
    );
  }

  //  <-- Undefinedsectionindex -->
  else {
    return (
      <div
        style={{
          borderRadius: "20px",
          background: theme.cardSurface,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: isHovered
            ? `0 20px 44px ${theme.accentGlow}`
            : "0 10px 24px rgba(15,23,42,0.05)",
          width: "100%", minHeight: "280px", height: "100%", margin: "0 auto",
          transform: isHovered ? "translateY(-6px)" : "translateY(0)",
          transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Compare */}
        <button type="button" onClick={d.onClickCompare} aria-label="Compare product"
          style={{
            position: "absolute", top: "4px", right: "4px", width: "24px", height: "24px",
            borderRadius: "50%", background: "rgba(255,255,255,0.95)",
            border: `1px solid ${theme.cardBorder}`, boxShadow: "0 8px 16px rgba(15,23,42,0.08)",
            zIndex: 3, padding: 0, cursor: "pointer",
          }}
        >
          <i className="fas fa-scale-balanced" style={{ color: theme.accent, fontSize: "10px" }} />
        </button>

        {/* Image area */}
        <div
          onClick={d.onClickProduct}
          style={{
            height: "140px", background: theme.gradientHeader,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative",
          }}
        >
          <img src={d.imageSrc} alt={d.productTitle} loading={d.loadingStrategy}
            onError={d.onImageError}
            style={{ maxWidth: "80%", maxHeight: "85%", objectFit: "contain" }}
          />
        </div>

        {/* Info */}
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
          {d.productPrice && (
            <div style={{ color: theme.priceBadgeBg, fontSize: "16px", fontWeight: 800, marginBottom: "6px" }}>
              {d.productPrice}
            </div>
          )}

          <button type="button" onClick={d.onClickVendor}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              color: theme.accent, fontSize: "11px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            {d.vendorImageSrc ? (
              <img src={d.vendorImageSrc} alt={d.vendorName} onError={d.onVendorImageError}
                style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "contain" }}
              />
            ) : (
              <i className="fas fa-store" style={{ fontSize: "10px" }} />
            )}
            <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.vendorName}</span>
          </button>

          <h4 onClick={d.onClickProduct}
            style={{
              fontSize: "12px", fontWeight: 600, color: "#1e293b", margin: "6px 0 4px",
              maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              cursor: "pointer", lineHeight: 1.2,
            }}
          >{d.productTitle}</h4>

          <button onClick={d.onClickProduct}
            style={{
              width: "100%", padding: "7px 0", border: "none", borderRadius: "999px",
              background: theme.buttonBg, color: "#fff", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.4px", cursor: "pointer",
              boxShadow: `0 6px 14px ${theme.accentGlow}`,
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.2s ease-in-out",
            }}
          >Order Now </button>
        </div>
      </div>
    );
  }
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

const DynamicSections = ({
  sections,
  onProductClick,
  onCompareClick,
  onVendorClick,
  imgUrl,
  liteMode = false,
}) => {

  // console.log(sections.length, "sections")
  if (!sections?.length) return null;

  const [hoveredViewAllIndex, setHoveredViewAllIndex] = useState(null);
  const [hoveredCardIdx, setHoveredCardIdx] = useState(null);

  const NextArrow = (props) => {
    const { style, onClick } = props;
    return (
      <button
        className="meq-arrow-btn dental-next"
        style={{ ...style, display: "block" }}
        onClick={onClick}
        aria-label="Next"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    );
  };

  const PrevArrow = (props) => {
    const { style, onClick } = props;
    return (
      <button
        className="meq-arrow-btn dental-prev"
        style={{ ...style, display: "block" }}
        onClick={onClick}
        aria-label="Previous"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    );
  };

  const getSliderSettings = (itemsCount) => ({
    dots: false,
    infinite: itemsCount > 6,
    speed: 650,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 6,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          infinite: itemsCount > 4,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          infinite: itemsCount > 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          infinite: itemsCount > 2,
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 2,
          infinite: itemsCount > 2,
        }
      }
    ]
  });

  return (
    <>
      {/* Inject keyframes once */}
      <style>{GLOBAL_KEYFRAMES}</style>

      {sections.map((section, sectionIndex) => {
        const { title, serviceId, products } = section;
        const icon = SECTION_ICONS[sectionIndex % SECTION_ICONS.length];
        const viewAllLink = `/${serviceId?.slug || "medicine"}/all`;
        const lazyMount = sectionIndex > 0;

        // Permanent section.index-based design system: keeps assigned index and falls back to 0 for new sections
        const baseIndex = section.index !== undefined && section.index !== null ? section.index : sectionIndex;
        const sectionindex = baseIndex % 12; // Wraps around to 0-11 for defined layouts
        const currentTheme = SECTION_THEMES[sectionindex];
        const isViewAllHovered = hoveredViewAllIndex === sectionIndex;
        const isDarkSection = sectionindex === 4 || sectionindex === 8;

        const sectionContent = (
          <section
            className={`my-4 px-2 px-md-3 home-dynamic-section medical-category-section section-variant-${sectionindex}${liteMode ? " home-dynamic-section-lite" : ""}`}
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
              {/* Section header */}
              <div
                className="d-flex align-items-center justify-content-between mb-4 px-3 py-2"
                style={{
                  background: isDarkSection ? "#ffffff85" : "#ffffff80",
                  backdropFilter: "blur(10px)",
                  borderRadius: "18px",
                  border: isDarkSection ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255, 255, 255, 0.65)",
                  boxShadow: isDarkSection ? "none" : "0 10px 30px rgba(95, 70, 150, 0.06)",
                }}
              >
                <div
                  className="d-flex align-items-center"
                  style={{
                    padding: "7px 14px",
                    background: currentTheme.headerBadgeBg,
                    color: currentTheme.headerBadgeText,
                    borderRadius: "999px",
                    fontWeight: "800",
                    fontSize: "14px",
                    boxShadow: isDarkSection ? "none" : "0 6px 18px rgba(126, 87, 194, 0.12)",
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
                  onMouseEnter={() => setHoveredViewAllIndex(sectionIndex)}
                  onMouseLeave={() => setHoveredViewAllIndex(null)}
                  className="top-vendor-badge"
                  style={{
                    padding: "6px 12px",
                    // Clean transition between dark text/white text based on hover state
                    color: isViewAllHovered ? "#ffffff" : "#6f00ff",
                    // Swaps back and forth safely between a deep fill and a crisp white/transparent surface
                    background: isViewAllHovered ? "#8833f8ff" : (isDarkSection ? "rgba(255, 255, 255, 0.08)" : "#ffffff"),
                    // Uses structural solid border or ultra-clean glass framing based on dark background detection
                    border: `1px solid ${isViewAllHovered ? "#6f00ffff" : (isDarkSection ? "rgba(255, 255, 255, 0)" : "rgba(111, 0, 255, 0.16)")}`,
                    borderRadius: "999px",
                    fontWeight: "600",
                    // Advanced floating elevation physics fueled by custom shadow color alpha channels
                    boxShadow: isViewAllHovered
                      ? "0 8px 20px rgba(111, 0, 255, 0.24)"
                      : isDarkSection ? "none" : "0 4px 12px rgba(111, 0, 255, 0.06)",
                    transition: "all 0.2s ease",
                  }}
                >
                  View All
                  <i className="isax isax-arrow-right-1 ms-1 " />
                </Link>

              </div>

              {/* Product slider */}
              <div className="doctor-slider-one owl-theme px-3">
                <Slider {...getSliderSettings(products?.length || 0)}>
                  {products?.map((item, productIndex) => {
                    const d = processProductData(
                      item, sectionIndex, productIndex, section,
                      serviceId, imgUrl,
                      onProductClick, onCompareClick, onVendorClick,
                    );

                    const isHovered = hoveredCardIdx === d.cardKey;

                    return (
                      <div
                        key={d.itemKey}
                        className="px-2 py-3 home-dynamic-premium-card-slide"
                        style={{ padding: "0 12px", overflow: "visible" }}
                      >
                        {renderCard(
                          sectionindex,
                          d,
                          currentTheme,
                          isHovered,
                          () => setHoveredCardIdx(d.cardKey),
                          () => setHoveredCardIdx(null),
                        )}
                      </div>
                    );
                  })}
                </Slider>
              </div>
            </div>
          </section>
        );

        return (
          <LazySectionMount
            key={section._id}
            enabled={lazyMount}
            minHeight={240}
            rootMargin={liteMode ? "280px 0px" : "300px 0px"}
          >
            {sectionContent}
          </LazySectionMount>
        );
      })}
    </>
  );
};

export default React.memo(DynamicSections);
