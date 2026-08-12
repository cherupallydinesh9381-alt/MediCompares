import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import Slider from "react-slick";
import {
  imgUrl,
  axiosCommonInstance,
  axiosUserInstance,
} from "../../../Apiservice.jsx";
import { getImageUrl, getDisplayPrice, getVendorPrice } from "../../../utils/index";
import toast from "react-hot-toast";
import Home2Header from "../home/home-4/Header-k.jsx";
import Footer from "../home/home-4/Footer-f.jsx";
import CategoryProvider from "../../../components/CategoryProvider.jsx";
import StickyBox from "react-sticky-box";
import { ProductsSection, ShareModal } from "../../../components/products";
import "./productsdata.css";
import { useAddToCart } from "../../../hooks/useAddToCart.js";
import { useCart } from "../../../hooks/useCart.js";
import CartQuantityControls from "../../../components/ui/CartQuantityControls.jsx";
import VendorActions from "../../../components/ui/VendorActions.jsx";
import LeadModal from "./products-components/LeadModal.jsx";
import Pagination from "../../../components/ui/Pagination.jsx";
import RentModal from "./products-components/RentModal.jsx";
import ConsultationModal from "./products-components/ConsultationModal.jsx";
import "./productdescription.css";
import { useResponsive } from "../../../hooks/index.js";
import AppointmentModal from "./products-components/AppointmentModal.jsx";
import { useProfile } from "../../../context/ProfileContext.jsx";
import { handleRentalBookingProcess, handleGeneralBookingProcess } from "../../../services/bookingService.js";
import { useLocation as useLocationContext } from "../../../context/LocationContext.jsx";

// Constants
const UI_QTY_KEY = "pharmacyCartQuantitiesUI";
const INITIAL_LEAD_FORM = {
  date: "",
  name: "",
  email: "",
  mobile: "",
  policyNumber: "",
  relation: "",
  address: "",
};

const bannerSliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
  pauseOnHover: true,
};

const RelatedProductsView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug, service } = useParams();
  const productId = slug;
  const [pharmacies, setPharmacies] = useState([]);
  const [banners, setBanners] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [pincode, setPincode] = useState("");
  const [checkedPincode, setCheckedPincode] = useState(null);
  const [headerPincode, setHeaderPincode] = useState(null);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const { isMobile } = useResponsive();
  const [fixedTypeSlug, setFixedTypeSlug] = useState(null);
  // Location Context
  const { currentLocation, updateLocation, latitude, longitude } =
    useLocationContext();

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [leadFormData, setLeadFormData] = useState(INITIAL_LEAD_FORM);
  const [rentalFormData, setRentalFormData] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
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

  const [currentLeadData, setCurrentLeadData] = useState(null);
  const [currentModalData, setCurrentModalData] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [expandedVendors, setExpandedVendors] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareProductData, setShareProductData] = useState(null);
  const { profile: userProfile } = useProfile();
  const rightSideTop = banners.filter((b) => b.position === "rightside_Top");
  const rightSideBottom = banners.filter(
    (b) => b.position === "rightside_bottom",
  );

  const { addToCart } = useAddToCart();
  const {
    getCartQuantity: getCartQuantityFromHook,
    incrementItem,
    decrementItem,
  } = useCart();

  const isLoggedIn = !!localStorage.getItem("medicomparestoken");

  useEffect(() => {
    if (!productId) {
      toast.error("No product selected");
      navigate(-1);
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const urlPincode = searchParams.get("pincode");
    const urlServiceSlug = searchParams.get("serviceslug");
    if (urlPincode) {
      syncLocation(urlPincode);
      searchParams.delete("pincode");
      const newSearch = searchParams.toString();
      navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ""}`, {
        replace: true,
      });
    }

    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) {
      try {
        const locationData = JSON.parse(savedLocation);
        if (locationData.pincode && locationData.pincode.length === 6) {
          setCheckedPincode(locationData.pincode);
          setHeaderPincode(locationData.pincode);
          setPincode(locationData.pincode);
          fetchProductData(
            productId,
            "show",
            locationData.pincode,
            true,
            urlServiceSlug,
          );
          return;
        }
      } catch (e) {
        // Error parsing saved location
      }
    }
    setHeaderPincode(null);
    setPincode("");
    setCheckedPincode(null);
    fetchProductData(productId, "show", null, true, urlServiceSlug);
  }, [productId]);

  useEffect(() => {
    const handleLocationChange = (event) => {
      const locationData = event.detail;
      if (locationData?.source === "checkout") {
        return;
      }
      const searchParams = new URLSearchParams(location.search);
      const urlServiceSlug = searchParams.get("serviceslug");
      if (locationData?.pincode && locationData.pincode.length === 6) {
        if (checkedPincode !== locationData.pincode) {
          setPincode(locationData.pincode);
          setCheckedPincode(locationData.pincode);
          setHeaderPincode(locationData.pincode);
          const prodId = product?.tablet?._id || product?._id || productId;
          if (prodId) {
            fetchProductData(
              prodId,
              "show",
              locationData.pincode,
              true,
              urlServiceSlug,
            );
          }
        }
      } else {
        setHeaderPincode(null);
      }
    };

    window.addEventListener("locationChanged", handleLocationChange);
    return () => {
      window.removeEventListener("locationChanged", handleLocationChange);
    };
  }, [checkedPincode, productId, navigate]);

  const fetchProductData = async (
    prodId,
    type,
    pincodeParam = null,
    showFullPageLoader = true,
    serviceSlug = null,
    pageParam = 1
  ) => {
    if (showFullPageLoader) {
      setLoading(true);
    } else {
      setPageLoading(true);
    }
    try {
      const token = localStorage.getItem("medicomparestoken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url = type === "show" ? `product/subcategory/show/${slug}` : `product/${type}/${prodId}`;
      const params = [];
      if (userProfile?._id || userProfile?.id) {
        params.push(`userId=${userProfile?._id || userProfile?.id}`);
      }
      if (pincodeParam) {
        params.push(`location=${pincodeParam}`);
        if (latitude && longitude) {
          params.push(`lat=${latitude}`);
          params.push(`lng=${longitude}`);
        }
      }
      if (serviceSlug) {
        params.push(`serviceslug=${serviceSlug}`);
      }

      params.push(`type=website`);
      params.push(`positiontype=rightside_Top ,rightside_bottom`);
      params.push(`page=${pageParam}`);
      params.push(`limit=10`);
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await axiosCommonInstance.get(url, {
        headers,
      });

      const apiProductList = response?.data?.data?.products || [];
      setAllProducts(apiProductList);
      let apiProduct = response?.data?.data?.product;
      if (!apiProduct && apiProductList.length > 0) {
        apiProduct = apiProductList[0];
      }
      const apiPagination = response?.data?.data?.pagination || response?.data?.data?.vendorPagination;
      setPagination(apiPagination);
      setFixedTypeSlug(apiProduct?.tablet?.category?.fixedType)
      let extractedServiceSlug = serviceSlug;
      if (
        !extractedServiceSlug &&
        apiProduct?.tablet?.subcategorys?.category?.slug
      ) {
        extractedServiceSlug = apiProduct.tablet.subcategorys.category.slug;
        if (extractedServiceSlug && !serviceSlug) {
          await fetchProductData(
            prodId,
            type,
            pincodeParam,
            showFullPageLoader,
            extractedServiceSlug,
            pageParam
          );
          return;
        }
      }

      if (!apiProduct) {
        setPharmacies([]);
        return;
      }

      setProduct(apiProduct);
      let processedBanners = [];
      if (
        response?.data?.data?.banner &&
        Array.isArray(response.data.data.banner)
      ) {
        response.data.data.banner.forEach((b) => {
          if (b.banners && Array.isArray(b.banners)) {
            const nestedBanners = b.banners.map((bn) => ({
              _id: bn._id,
              name: bn.name,
              position: bn.position || b.position,
              files: bn.files || [],
              alt: bn.name || "Banner",
              title: bn.name || "Banner",
            }));
            processedBanners.push(...nestedBanners);
          } else {
            processedBanners.push({
              _id: b._id,
              name: b.name,
              position: b.position,
              files: b.files || [],
              alt: b.name || "Banner",
              title: b.name || "Banner",
            });
          }
        });
      }
      setBanners(processedBanners);
      const initialVariants = {};
      apiProductList.forEach((p) => {
        if (p.tablet?.variant?.length > 0) {
          initialVariants[p.tablet._id] = p.tablet.variant[0]._id;
        }
      });
      setSelectedVariants((prev) => ({ ...prev, ...initialVariants }));

      const vendors = apiProduct?.vendors || [];
      const displayVendors = pincodeParam
        ? vendors.filter((v) => v.isavailablepincode === true)
        : vendors;

      setPharmacies(displayVendors);
    } catch (error) {
      toast.error("Failed to load product data");
      navigate(-1);
    } finally {
      if (showFullPageLoader) {
        setLoading(false);
      } else {
        setPageLoading(false);
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    const prodId = productId;
    const searchParams = new URLSearchParams(location.search);
    const urlServiceSlug = service || searchParams.get("serviceslug") || product?.tablet?.subcategorys?.category?.slug;
    setCurrentPage(pageNumber);
    if (prodId) {
      fetchProductData(
        prodId,
        "show",
        checkedPincode,
        false,
        urlServiceSlug,
        pageNumber
      );
    }
  };

  const handleVariantChange = (prodId, variantId) => {
    if (!prodId || !variantId) return;
    setSelectedVariants((prev) => ({
      ...prev,
      [prodId]: variantId,
    }));
  };

  const handlePincodeCheck = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const value = (pincode || "").trim();

    if (!value || value.trim() === "") {
      toast.error("Pincode is required");
      return;
    }
    if (value.length < 3 || !/^\d+$/.test(value)) {
      toast.error("Please enter a valid pincode (minimum 3 digits)");
      return;
    }

    const prodId = product?.tablet?._id || product?._id || productId;
    if (!prodId) return;

    try {
      setLoadingVendors(true);
      setCheckedPincode(value);
      syncLocation(value);
      const searchParams = new URLSearchParams(location.search);
      const urlServiceSlug = searchParams.get("serviceslug");
      const startTime = Date.now();
      await fetchProductData(prodId, "details", value, false, urlServiceSlug);
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
    } catch (err) {
      toast.error("Failed to check pincode");
    } finally {
      setLoadingVendors(false);
    }
  };

  const handlePartnerClick = (partner) => {
    const vendorId = partner?._id || partner?.businessdetails?._id;
    if (vendorId) {
      sessionStorage.setItem("vendorId", vendorId);
      const name =
        partner?.bussinessdetails?.name || partner?.name || "Vendor Store";
      const vendorSlug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      navigate(`/vendor-profile/${vendorSlug}`);
    }
  };

  const getCartQuantity = (vendorId, prodId, variantId) => {
    if (!isLoggedIn) {
      const uiQty = loadUiQuantities();
      const key = variantId
        ? `${vendorId}_${prodId}_${variantId}`
        : `${vendorId}_${prodId}`;
      return uiQty[key] || 0;
    }
    return getCartQuantityFromHook(vendorId, prodId, variantId);
  };

  const loadUiQuantities = () => {
    try {
      const raw = sessionStorage.getItem(UI_QTY_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const handleAddToCart = async (
    vendor,
    med,
    variantId,
    matchedVariant,
    discountPrice = null,
  ) => {
    localStorage.setItem("isCart", true);
    const selectedVar = med.variant?.find((v) => v._id === variantId);
    const inStock = !!(
      (matchedVariant && matchedVariant.stock && matchedVariant.stock > 0) ||
      vendor?.stock > 0 ||
      med?.stock > 0
    );
    if (!inStock) {
      toast.error("Item is out of stock");
      return;
    }

    const basePrice = matchedVariant?.price || med.price || 0;
    const finalPrice =
      discountPrice && discountPrice > 0 ? discountPrice : basePrice;
    const item = {
      tabletdetails: med,
      vendordetails: vendor?.bussinessdetails || vendor,
      variants: med.variant || [],
      price: finalPrice,
    };

    const success = await addToCart(item, selectedVar, {
      bookingType: "cart",
      type: "normal",
    });
  };

  const syncLocation = async (pin) => {
    let locationName = "Selected Location";
    let coordinates = null;
    try {
      const GOOGLE_MAPS_API_KEY = "AIzaSyBW_ML0ppoU2o_tsOmT5eMveCwCFP3AXHU";
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${pin}|country:IN&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        locationName = result.formatted_address || "Selected Location";
        if (result.geometry && result.geometry.location) {
          coordinates = {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          };
        }
      }
    } catch (geoErr) { }

    updateLocation({
      ...(currentLocation || {}),
      pincode: pin,
      name: locationName,
      address: `Pincode: ${pin}`,
      addressId: null,
      coordinates: coordinates,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSingleAddToCart = async (vendor, med) => {
    localStorage.setItem("isCart", true);
    const inStock = !!(med?.stock > 0 || vendor?.stock > 0);
    if (!inStock) {
      toast.error("Item is out of stock");
      return;
    }
    const item = {
      tabletdetails: med,
      vendordetails: vendor?.bussinessdetails || vendor,
      variants: [],
      price: med.price || 0,
    };

    const success = await addToCart(item, null, {
      bookingType: "cart",
      type: "normal",
    });
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

  const handleSingleIncrement = async (vendorId, prodId, maxStock = 999) => {
    const currentQty = getCartQuantity(vendorId, prodId, null);
    if (currentQty >= maxStock) {
      toast.error("Quantity at maximum stock");
      return;
    }

    try {
      await incrementItem(vendorId, prodId, null);
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const handleSingleDecrement = async (vendorId, prodId) => {
    try {
      await decrementItem(vendorId, prodId, null);
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const handleToggleFavourite = async (itemId) => {
    const token = localStorage.getItem("medicomparestoken");
    if (!token) {
      toast.error("Please login to manage favourites");
      navigate("/login");
      return;
    }

    const item = allProducts.find((p) => p?.tablet?._id === itemId);
    if (!item) return;

    const newStatus = !item?.tablet?.isFavorite;

    setAllProducts((prev) =>
      prev.map((p) =>
        p?.tablet?._id === itemId
          ? { ...p, tablet: { ...p.tablet, isFavorite: newStatus } }
          : p,
      ),
    );

    try {
      const endpoint = newStatus ? "favourite/add" : "favourite/remove";
      await axiosUserInstance.post(
        endpoint,
        { productId: itemId }
      );
      toast.success(newStatus ? "Added to favourites" : "Removed from favourites");
    } catch (err) {
      setAllProducts((prev) =>
        prev.map((p) =>
          p?.tablet?._id === itemId
            ? { ...p, tablet: { ...p.tablet, isFavorite: !newStatus } }
            : p,
        ),
      );
      toast.error("Failed to update favourites");
    }
  };

  const getQuantityForVariant = (tablet, vendor) => {
    if (!vendor) return 0;
    const variantId = selectedVariants[tablet._id] || tablet.variant?.[0]?._id;
    return getCartQuantity(vendor._id || vendor.vendorId, tablet._id, variantId);
  };

  const handleRide = async (vendor, tablet) => {
    toast.success("Added to ride");
  };

  const buildVendorVariants = (vendors, variantId) => {
    return vendors
      .map((v) => {
        const vendorName =
          v?.bussinessdetails?.name || v?.vendorName || "Unknown Vendor";
        const bookingType = v.bookingType || v.bookingtype || null;
        if (v.variant && v.variant.length > 0) {
          const found = v.variant.find(
            (vv) => vv.variantId === variantId || vv._id === variantId,
          );
          if (!found) return null;

          const extractedDiscountPrice =
            found.discountprice || found.discountPrice || null;
          const extractedDiscountType =
            found.discountType || null;

          return {
            _id: v._id,
            vendorId: v._id,
            vendorName,
            matchedPrice: found.price || v.price || 0,
            matchedVariantId: found.variantId || variantId,
            matchedVariantName: found.name,
            matchedVariantPrice: found.price || v.price || 0,
            matchedVariantDiscountPrice: extractedDiscountPrice,
            matchedVariantDiscountType: extractedDiscountType,
            matchedVariantStock: found.stock ?? v.stock ?? 0,
            matchedStock: found.stock ?? v.stock ?? 0,
            cartdetails: v.cartdetails ?? null,
            bookingType:
              bookingType || found.bookingType || found.bookingtype || null,
            bussinessdetails: v.bussinessdetails,
            variant: v.variant,
            price: found.price || v.price || 0,
            discountprice: extractedDiscountPrice,
            discountPrice: extractedDiscountPrice,
            discountType: extractedDiscountType,
            stock: found.stock ?? v.stock ?? 0,
            isStock: found.isStock ?? v.isStock,
            distanceInKm: v?.bussinessdetails?.distance,
            averageRating: v.averageRating,
            ratingCount: v.ratingCount,
          };
        } else {
          const vendorDiscountPrice =
            v.discountprice || v.discountPrice || null;
          const vendorDiscountType = v.discountType || null;
          return {
            _id: v._id,
            vendorId: v._id,
            vendorName,
            matchedPrice: v.price || 0,
            matchedVariantId: null,
            matchedVariantName: null,
            matchedVariantPrice: v.price || 0,
            matchedVariantDiscountPrice: vendorDiscountPrice,
            matchedVariantDiscountType: vendorDiscountType,
            matchedVariantStock: v.stock ?? 0,
            matchedStock: v.stock ?? 0,
            cartdetails: v.cartdetails ?? null,
            bookingType,
            bussinessdetails: v.bussinessdetails,
            variant: v.variant || [],
            price: v.price || 0,
            discountprice: vendorDiscountPrice,
            discountPrice: vendorDiscountPrice,
            discountType: vendorDiscountType,
            stock: v.stock ?? 0,
            isStock: v.isStock,
            distanceInKm: v?.bussinessdetails?.distance,
            averageRating: v.averageRating,
            ratingCount: v.ratingCount,
          };
        }
      })
      .filter(Boolean);
  };

  const handleNavigateToBooking = async (
    vendor,
    med,
    effectiveVariantId,
    price,
    stock,
  ) => {
    await handleGeneralBookingProcess({
      productId: med._id,
      variantId: effectiveVariantId,
      vendorId: vendor._id || vendor.vendorId,
      servicefixedTypes: fixedTypeSlug,
      navigate,
      redirectPath: "/booking-process"
    });
  };

  const handleRentalBookinProcess = async (
    vendor,
    med,
    effectiveVariantId,
    price,
    stock,
    service
  ) => {
    await handleRentalBookingProcess({
      productId: med._id,
      variantId: effectiveVariantId,
      vendorId: vendor._id || vendor.vendorId,
      perDayRent: vendor?.perDayRent || 0,
      navigate,
      servicefixedTypes: fixedTypeSlug
    });
  };

  const handleAddLead = (vendor, med, variantId, matchedVariant) => {
    if (!isLoggedIn) {
      toast.error("Please login");
      navigate("/login");
      return;
    }

    setCurrentLeadData({ vendor, med, variantId, matchedVariant });
    const today = new Date().toISOString().split("T")[0];
    const fixedType = med?.subcategorys?.category?.fixedType || null;
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
      fixedType,
    });
    setShowLeadModal(true);
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!currentLeadData?.med) return;

    const { vendor, med, variantId } = currentLeadData;
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
          productId: med._id,
          vendorId: vendor._id,
          variantId,
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

  const handleOpenRentalModal = (
    vendor,
    med,
    effectiveVariantId,
    price,
    stock,
  ) => {
    if (!isLoggedIn) {
      toast.error("Please login to rent");
      navigate("/login");
      return;
    }

    const fixedType = med?.subcategorys?.category?.fixedType || "dentalservice";
    const selectedVar = med.variant?.find((v) => v._id === effectiveVariantId);
    setCurrentModalData({
      vendor,
      med,
      effectiveVariantId,
      price,
      stock,
      selectedVar,
      fixedType,
    });
    setShowRentalModal(true);
  };

  const handleOpenConsultationModal = (
    vendor,
    med,
    effectiveVariantId,
    price,
    stock,
  ) => {
    if (!isLoggedIn) {
      toast.error("Please login to book consultation");
      navigate("/login");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const fixedType = med?.subcategorys?.category?.fixedType || null;
    setConsultationFormData({
      date: today,
      name: userProfile
        ? `${userProfile.first_name || ""} ${userProfile.last_name || ""
          }`.trim()
        : "",
      phone: userProfile?.phone || "",
      category: "",
      address: "",
      fixedType,
    });
    setCurrentModalData({
      vendor,
      med,
      effectiveVariantId,
      price,
      stock,
    });
    setShowConsultationModal(true);
  };

  const handleOpenAppointmentModal = (
    vendor,
    med,
    effectiveVariantId,
    price,
    stock,
  ) => {
    if (!isLoggedIn) {
      toast.error("Please login to book appointment");
      navigate("/login");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const fixedType = med?.subcategorys?.category?.fixedType || null;
    setAppointmentFormData({
      date: today,
      name: userProfile
        ? `${userProfile.first_name || ""} ${userProfile.last_name || ""
          }`.trim()
        : "",
      phone: userProfile?.phone || "",
      category: "",
      address: "",
      fixedType,
    });
    setCurrentModalData({
      vendor,
      med,
      effectiveVariantId,
      price,
      stock,
    });
    setShowAppointmentModal(true);
  };

  const handleRentalFormChange = (e) => {
    const { name, value } = e.target;
    setRentalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConsultationFormChange = (e) => {
    const { name, value } = e.target;
    setConsultationFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAppointmentFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRentalSubmit = async (e) => {
    e.preventDefault();
    if (!currentModalData) return;

    const { vendor, med, effectiveVariantId } = currentModalData;
    try {
      const token = localStorage.getItem("medicomparestoken");
      toast.success("Rental request submitted successfully!");
      setShowRentalModal(false);
      setRentalFormData({
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        deliveryAddress: "",
      });
      setCurrentModalData(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to submit rental request",
      );
    }
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
      const vendor = appointmentFormData.vendor || currentModalData?.vendor;
      const med = appointmentFormData.med || currentModalData?.med;

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
          variantId: currentModalData?.effectiveVariantId || null,
          leadSource: "Website",
          leadStage: "New",
          formType: "appointment",
          status: "active",
          serviceType: appointmentFormData.fixedType || "dentalservice",
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
      });
      setCurrentModalData(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to book appointment");
    }
  };

  const handleShare = {
    copy: async () => {
      try {
        const url = `${window.location.origin}/${service || "medicine"}/${slug}/${shareProductData?.tablet?.slug}`;
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    },
    whatsapp: () => {
      const url = `${window.location.origin}/${service || "medicine"}/${slug}/${shareProductData?.tablet?.slug}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, "_blank");
    },
    facebook: () => {
      const url = `${window.location.origin}/${service || "medicine"}/${slug}/${shareProductData?.tablet?.slug}`;
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    },
    twitter: () => {
      const url = `${window.location.origin}/${service || "medicine"}/${slug}/${shareProductData?.tablet?.slug}`;
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, "_blank");
    },
    email: () => {
      const url = `${window.location.origin}/${service || "medicine"}/${slug}/${shareProductData?.tablet?.slug}`;
      window.open(`mailto:?body=${encodeURIComponent(url)}`, "_blank");
    }
  };

  if (allProducts.length === 0 || loading) {
    return (
      <div className="main-wrapper">
        <Home2Header />
        <div
          className="content medicine-compare"
          style={{
            paddingTop: "100px",
            paddingBottom: "40px",
            background: "linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)",
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="text-center">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ color: "#6c757d", fontSize: "16px" }}>
              Loading product details...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const resolveImage = (item) => {
    const img =
      item?.files?.[0] ??
      (Array.isArray(item?.imageUrl) ? item.imageUrl[0] : item?.imageUrl);

    if (!img) return "/assets/default.png";

    return getImageUrl(img);
  };

  return (
    <div className="main-wrapper">
      <Home2Header />
      <CategoryProvider />

      {/* Header section from vendor profile */}
      <div className="breadcrumb-bar">
        <div className="breadcrumbb-bggg">
          <img src="/assets/Medicompares Background.png" alt="Background" />
        </div>
        <div className="breadcrumbb-contentt">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="mb-3">
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-sm d-inline-flex align-items-center gap-2"
                  style={{
                    borderRadius: "30px",
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(128, 89, 202, 0.3)",
                    padding: "6px 16px",
                    fontWeight: "600",
                    color: "#8059ca",
                    boxShadow: "0 2px 8px rgba(128, 89, 202, 0.1)",
                    transition: "all 0.2s ease-in-out"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#8059ca";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.color = "#8059ca";
                  }}
                >
                  <i className="fa-solid fa-arrow-left" /> Back
                </button>
              </div>
              <div
                style={{ position: "relative" }}
                className="d-none d-lg-block"
              >
                <img
                  src="/assets/doctors.png"
                  alt="Doctors"
                  style={{
                    height: "150px",
                    position: "absolute",
                    top: "0px",
                    left: "0",
                  }}
                />
              </div>
              <h2
                className="breadcrumbb-title text-dark text-center d-none d-lg-block"
                style={{ position: "relative", left: "150px" }}
              >
                Trusted Excellence <br /> in Healthcare
              </h2>
            </div>
            {/* <div className="col-lg-4">
              <div className="hospital-cardd">
                <div className="hospital-logoo">
                  <img
                    src={
                      product?.tablet?.files?.[0]
                        ? getImageUrl(product.tablet.files[0])
                        : product?.tablet?.imageUrl?.[0]
                          ? getImageUrl(product.tablet.imageUrl[0])
                          : "/assets/default.png"
                    }
                    alt="product"
                    style={{ objectFit: "contain", padding: "4px" }}
                  />
                </div>
                <div>
                  <div className="hospital-name" style={{ fontSize: "16px", fontWeight: "600", color: "#1e1e24" }}>
                    {product?.tablet?.name}
                  </div>
                  <div className="ratingss">
                    {product?.tablet?.averageRating ? (
                      <>
                        {"★".repeat(Math.floor(product.tablet.averageRating))}
                        {product.tablet.averageRating % 1 >= 0.5 ? "☆" : ""}
                        <strong> {product.tablet.averageRating.toFixed(1)}</strong>
                      </>
                    ) : (
                      <>
                        ★★★★☆ <strong>4.8</strong>
                      </>
                    )}
                  </div>
                  <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleToggleFavourite(product?.tablet?._id)}
                      className="btn btn-sm"
                      style={{
                        borderRadius: "20px",
                        border: "1px solid #8059ca",
                        backgroundColor: product?.tablet?.isFavorite ? "#8059ca" : "transparent",
                        color: product?.tablet?.isFavorite ? "#fff" : "#8059ca",
                        fontSize: "11px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 12px"
                      }}
                    >
                      <i className={product?.tablet?.isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
                      {product?.tablet?.isFavorite ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setShareProductData(product);
                        setShowShareModal(true);
                      }}
                      className="btn btn-sm"
                      style={{
                        borderRadius: "20px",
                        border: "1px solid #8059ca",
                        backgroundColor: "transparent",
                        color: "#8059ca",
                        fontSize: "11px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 12px"
                      }}
                    >
                      <i className="fa-solid fa-share-nodes" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <div
        className="content medicine-compare"
        style={{
          paddingTop: "20px",
          paddingBottom: "40px",
          background: "linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)",
        }}
      >
        <div
          className="container-fluid"
          style={{ marginTop: !isMobile && "50px" }}
        >
          <style>{`
            .col-5-custom {
              flex: 0 0 auto;
              width: 20%;
            }
            @media (max-width: 1199px) { .col-5-custom { width: 25%; } }
            @media (max-width: 991px)  { .col-5-custom { width: 33.33%; } }
            @media (max-width: 767px)  { .col-5-custom { width: 50%; } }
            @media (max-width: 575px)  { .col-5-custom { width: 100%; } }
          `}</style>
          <div className="row g-4">
            {/* Left Column: Products Section */}
            <div className="col-12">
              <ProductsSection
                filteredProducts={allProducts}
                isLoading={loading}
                isSkeletonLoading={loading || pageLoading}
                isFull={isFull}
                setIsFull={setIsFull}
                categoryName={product?.tablet?.subcategorys?.name || "Related Products"}
                selectedVariants={selectedVariants}
                expandedVendors={expandedVendors}
                cardColClass="col-5-custom"
                isSidebarOpen={false}
                rentAndCartButtonStyles={{
                  fontSize: "10px",
                  padding: "3px 5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  minWidth: "90px",
                  width: "100%"
                }}
                contailerStyles={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0px 5px",
                  minWidth: "100px",
                  width: "100%",
                  gap: "3px"
                }}
                individualStyleForCart={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "2px 10px",
                  minWidth: "100px",
                  width: "100%",
                  gap: "4px",
                  borderRadius: "50px",
                  border: "1px solid #8059ca",
                  background: "#fdfaff",
                  boxShadow: "0 2px 5px rgba(125, 46, 255, 0.1)"
                }}
                onToggleExpand={(productId) => {
                  setExpandedVendors((prev) => ({
                    ...prev,
                    [productId]: !prev[productId],
                  }));
                }}
                onToggleFavourite={handleToggleFavourite}
                onShare={(prod) => {
                  setShareProductData(prod);
                  setShowShareModal(true);
                }}
                onVendorAction={(action, vendor, tablet, bookingType, servicePassed) => {
                  const variantId = selectedVariants[tablet._id] || (tablet.variant && tablet.variant[0]?._id);
                  const selectedVar = tablet.variant?.find((v) => v._id === variantId);
                  const maxStock = selectedVar?.stock || tablet.stock || 999;
                  const price = getVendorPrice(vendor, tablet, selectedVariants) || tablet.price || 0;
                  const stock = selectedVar?.stock || tablet.stock || 0;

                  if (action === "lead") {
                    handleAddLead(vendor, tablet, variantId, selectedVar);
                  } else if (action === "booking") {
                    if (bookingType === "booking") {
                      handleNavigateToBooking(vendor, tablet, variantId, price, stock);
                    } else if (bookingType === "rent") {
                      handleRentalBookinProcess(vendor, tablet, variantId, price, stock, servicePassed);
                    } else if (bookingType === "consultation") {
                      handleOpenConsultationModal(vendor, tablet, variantId, price, stock);
                    } else if (bookingType === "appointment") {
                      handleOpenAppointmentModal(vendor, tablet, variantId, price, stock);
                    }
                  } else if (action === "ride") {
                    handleRide(vendor, tablet);
                  } else if (action === "add") {
                    if (variantId) {
                      handleAddToCart(vendor, tablet, variantId);
                    } else {
                      handleSingleAddToCart(vendor, tablet);
                    }
                  } else if (action === "increase") {
                    if (variantId) {
                      handleIncrement(bookingType, vendor._id || vendor.vendorId, tablet._id, variantId, maxStock, vendor, selectedVar);
                    } else {
                      handleSingleIncrement(vendor._id || vendor.vendorId, tablet._id, maxStock);
                    }
                  } else if (action === "decrease") {
                    if (variantId) {
                      handleDecrement(bookingType, vendor._id || vendor.vendorId, tablet._id, variantId, vendor, selectedVar);
                    } else {
                      handleSingleDecrement(vendor._id || vendor.vendorId, tablet._id);
                    }
                  }
                }}
                getDisplayPrice={(prod) => getDisplayPrice(prod, selectedVariants)}
                getVendorPrice={(v, t) => getVendorPrice(v, t, selectedVariants)}
                getQuantityForVariant={getQuantityForVariant}
                selectedVendors={selectedVariants}
                service={service || "medicine"}
                id={slug}
                navigate={navigate}
                page={currentPage}
                totalPages={pagination?.totalPages || 1}
                priceRange={[1, 1000000]}
                onPageChange={(pageNum) => {
                  setCurrentPage(pageNum);
                  handlePageChange(pageNum);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onSelectVariant={(variantId, tablet) => {
                  setSelectedVariants((prev) => ({
                    ...prev,
                    [tablet._id]: variantId,
                  }));
                }}
                onOpenFilterDrawer={() => { }}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Share Modal */}
      <ShareModal
        show={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setShareProductData(null);
        }}
        onShare={handleShare}
      />

      {/* Lead Modal */}
      <LeadModal
        show={showLeadModal}
        onClose={() => {
          setShowLeadModal(false);
          setLeadFormData(INITIAL_LEAD_FORM);
          setCurrentLeadData(null);
        }}
        formData={leadFormData}
        onChange={(e) =>
          setLeadFormData((p) => ({ ...p, [e.target.name]: e.target.value }))
        }
        onSubmit={handleSubmitLead}
        productId={currentLeadData?.med?._id || currentLeadData?.med?.id}
        vendorId={currentLeadData?.vendor?.vendorId || currentLeadData?.vendor?._id}
        variantId={currentLeadData?.variantId || null}
        fixedType={leadFormData.fixedType}
      />

      {/* Rental Modal */}
      {currentModalData && (
        <RentModal
          show={showRentalModal}
          onClose={() => {
            setShowRentalModal(false);
            setRentalFormData({
              startDate: "",
              startTime: "",
              endDate: "",
              endTime: "",
              deliveryAddress: "",
            });
            setCurrentModalData(null);
          }}
          rentProduct={{
            tabletdetails: currentModalData.med,
            vendordetails: currentModalData.vendor?.bussinessdetails || currentModalData.vendor,
            price: currentModalData.price,
          }}
          formData={rentalFormData}
          onFormChange={handleRentalFormChange}
          onSubmit={handleRentalSubmit}
          productId={currentModalData.med?._id || currentModalData.med?.id}
          vendorId={currentModalData.vendor?.vendorId || currentModalData.vendor?._id}
          variantId={currentModalData.effectiveVariantId}
          fixedType={currentModalData.fixedType}
        />
      )}

      {/* Consultation Modal */}
      {currentModalData && (
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
            });
            setCurrentModalData(null);
          }}
          formData={consultationFormData}
          onFormChange={handleConsultationFormChange}
          productId={currentModalData.med?._id || currentModalData.med?.id}
          vendorId={currentModalData.vendor?.vendorId || currentModalData.vendor?._id}
          variantId={currentModalData.effectiveVariantId}
          formType="consultation"
          title="Book a Consultation"
          fixedType={currentModalData.fixedType}
        />
      )}

      {/* Appointment Modal */}
      {currentModalData && (
        <AppointmentModal
          fixedType={appointmentFormData.fixedType}
          show={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setAppointmentFormData({
              date: "",
              name: "",
              phone: "",
              category: "",
              address: "",
            });
            setCurrentModalData(null);
          }}
          formData={appointmentFormData}
          onFormChange={handleAppointmentFormChange}
          onSubmit={handleAppointmentSubmit}
          productId={currentModalData.med?._id || currentModalData.med?.id}
          vendorId={currentModalData.vendor?.vendorId || currentModalData.vendor?._id}
          variantId={currentModalData.effectiveVariantId}
          formType="appointment"
          title="Book an Appointment"
        />
      )}
    </div>
  );
};

export default RelatedProductsView;