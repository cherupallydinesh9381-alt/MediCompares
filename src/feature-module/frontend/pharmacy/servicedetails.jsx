import { Link, useNavigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Slider from "react-slick";
import CategoryProvider from "../../../components/CategoryProvider.jsx";
import PageLoader from "../../../components/ui/PageLoader.jsx";
import Home2Header from "../home/home-4/Header-k.jsx";
import Footer from "../home/home-4/Footer-f.jsx";
import { useEffect, useState, useRef, useCallback, useMemo, useLayoutEffect, lazy, Suspense, memo, use } from "react";
import toast from "react-hot-toast";
import { axiosCommonInstance, imgUrl } from "../../../Apiservice.jsx";
import { getImageUrl } from "../../../utils/index";
import { useLocation as useLocationContext } from "../../../context/LocationContext";
import LabTest from "../healthcare/labtests.jsx";
import AOS from "aos";
import "aos/dist/aos.css";
import { useResponsive } from "../../../hooks";
import ServiceCards from "./products-components/ServiceCards.jsx";
import DynamicCategorySections from "../home/home-4/DynamicCategorySections.jsx";
import HomeProductScrollCarousel from "../home/home-4/HomeProductScrollCarousel.jsx";
import {
  getHealthcareHeroBannerSettings,
  getHealthcareMedicalEquipmentSettings,
  getHealthcareMiddleBannerSettings,
  getHealthcareSuperSavingSettings,
  HealthcareNextArrow,
  HealthcarePrevArrow,
} from "../healthcare/healthcareSliderSettings.jsx";
import { redirectToLoginWithPendingBooking } from "../../../utils/pendingBookingUtils";
import { shouldUseHomeLiteMode } from "../../../utils/devicePerformance";
import { prefetchImageUrls } from "../../../utils/prefetchImages";
import {
  getMedicinePincodeFromStorage,
  getProductNavigation,
  resolveProductTablet
} from "../../../utils/productUtils";
import "../home/home-4/home-enhanced.css";
import "./servicedetails-perf.css";
// import { fetchServerCart } from "../../../context/CartContext.jsx"

const getSearchItemId = (item) => item?.tablet?._id || item?._id || null;

const ServiceCategoryCard = memo(({ cat, index, onClick }) => (
  <div className="col-lg-2 col-md-3 col-4 col-sm-6 d-flex ">
    <div
      className="serv-wrap medi-bg service-category-card-lite flex-fill"
      onClick={() => onClick(cat)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(cat);
      }}
      style={{
        cursor: "pointer",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "135px",
        padding: "15px 10px",
        margin: "0 0 12px",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50px", width: "50px", marginBottom: "8px" }}>
        <img
          src={getImageUrl(cat?.files?.[0]) || "/assets/default.png"}
          alt={cat?.name || "Category"}
          title={cat?.name}
          style={{ height: "100%", width: "100%", objectFit: "contain" }}
          loading={index < 8 ? "eager" : "lazy"}
          fetchPriority={index < 4 ? "high" : "auto"}
          decoding="async"
        />
      </span>
      <h4 style={{
        fontSize: "12px",
        lineHeight: "1.3",
        fontWeight: "600",
        margin: "0",
        textAlign: "center",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        height: "32px",
      }}>
        {cat?.name || "No Category"}
      </h4>
    </div>
  </div>
));
ServiceCategoryCard.displayName = "ServiceCategoryCard";

const safeLazy = (importFunc) => {
  return lazy(() =>
    importFunc().catch((error) => {
      console.error("Chunk load error caught in servicedetails.jsx, reloading...", error);
      window.location.reload();
      return new Promise(() => { });
    })
  );
};

const MedicinesModule = safeLazy(() => import("../healthcare/MedicinesModule.jsx"));
const Surgeries = safeLazy(() => import("../healthcare/surgeries.jsx"));
const AmbulanceService = safeLazy(() => import("../healthcare/ambulanceservice.jsx"));
const Diagnostics = safeLazy(() => import("../healthcare/diagnostics.jsx"));
const MedicalEquipment = safeLazy(() => import("../healthcare/medicalequipment.jsx"));
const MedicalTreatMent = safeLazy(() => import("../healthcare/medicaltreatment.jsx"));
const HomeCareServices = safeLazy(() => import("../healthcare/homecareservices.jsx"));
const NursingCare = safeLazy(() => import("../healthcare/nursingcare.jsx"));
const DentalTeeth = safeLazy(() => import("../healthcare/DentalTeeth.jsx"));

const LabTestSection = (props) => {
  const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0,
  });

  useEffect(() => {
    if (!props.showDiscountPopup || props.fixedType !== "labtests") {
      return undefined;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else {
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours, minutes, seconds };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [props.showDiscountPopup, props.fixedType]);

  return <LabTest {...props} countdown={countdown} />;
};

const HealthcareModuleFallback = () => (
  <div className="service-module-loading" aria-hidden="true" />
);

const ServiceDetails = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const { service } = useParams();
  const { selectedPincode, latitude, longitude } = useLocationContext();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [suggestionsLimit, setSuggestionsLimit] = useState(10);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [nursingOfferProducts, setnursingOfferProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [product, setproduct] = useState([]);
  const [myservice, setServices] = useState({});
  const [compareItems, setCompareItems] = useState([]);
  const [cheaplabtests, setcheaplabtests] = useState([]);
  const [medicalTreatments, setmedicalTreatments] = useState([]);
  const [newProducts, setnewProducts] = useState([]);
  const [topCategories, settopCategories] = useState([]);
  const [topCategoriesProducts, settopCategoriesProducts] = useState([]);
  const [topdoctors, settopdoctors] = useState([]);
  const [categoryvendor, setcategoryvendor] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [vendorproducts, setvendorproducts] = useState([]);
  const [partners, setpartners] = useState([]);
  const [packages, setPackages] = useState([]);
  const [discountProducts, setdiscountProducts] = useState([]);
  const [popularProducts, setpopularProducts] = useState([]);
  const [trendingProducts, settrendingProducts] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [banners, setBanners] = useState([]);
  const [sections, setSections] = useState([]);
  const [showDiscountPopup, setShowDiscountPopup] = useState(true);
  const pageLiteMode = useMemo(() => shouldUseHomeLiteMode(), []);
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const latestSearchRef = useRef("");
  const [searchCache, setSearchCache] = useState(new Map());
  const requestCacheRef = useRef(new Map());
  const serviceFetchIdRef = useRef(0);
  const [serviceDetails, setServicesDetails] = useState(null);

  const makeApiCall = async (searchQuery, limitNum = 10, requestType = "search") => {
    try {
      const trimmedQuery =
        searchQuery.length > 50 ? searchQuery.substring(0, 50) : searchQuery;
      const response = await axiosCommonInstance.get(
        `all/search/product?search=${encodeURIComponent(trimmedQuery)}&page=1&limit=${limitNum}`,
      );

      const result = {
        list: response?.data?.data?.list || [],
        recentOrders: response?.data?.data?.recentOrders || [],
      };

      return result;
    } catch (error) {
      return { list: [], recentOrders: [] };
    }
  };

  const placeholderTexts = [
    "Search anything for... Medicines",
    "Search anything for... Surgeries",
    "Search anything for... Lab Tests",
    "Search anything for... Diagnostics",
    "Search anything for... Home Care Services",
    "Search anything for... Medical Equipment",
    "Search anything for... Nursing Care",
    "Search anything for... Medical Treatment",
    "Search anything for... Dental Service",
  ];

  // useEffect(() => {
  //   fetchServerCart();
  // }, []);

  useLayoutEffect(() => {
    if (pageLiteMode) {
      document.documentElement.classList.add("home-lite");
      document.documentElement.classList.add("service-details-lite");
    }

    return () => {
      document.documentElement.classList.remove("home-lite");
      document.documentElement.classList.remove("service-details-lite");
    };
  }, [pageLiteMode]);

  useEffect(() => {
    if (pageLiteMode) {
      AOS.init({ disable: true });
      return undefined;
    }

    AOS.init({
      duration: 800,
      once: true,
      mirror: false,
      offset: 80,
      throttleDelay: 99,
      debounceDelay: 50,
    });

    return undefined;
  }, [pageLiteMode]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % placeholderTexts.length;
      if (searchInputRef.current) {
        searchInputRef.current.placeholder = placeholderTexts[index];
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const swiperSettings = useMemo(
    () => ({
      modules: pageLiteMode ? [Navigation] : [Navigation, Autoplay],
      slidesPerView: isMobile ? 3 : 6,
      spaceBetween: isMobile ? 6 : 8,
      autoplay: pageLiteMode
        ? false
        : {
          delay: 5000,
          disableOnInteraction: false,
        },
      pagination: false,
      loop: !pageLiteMode && partners?.length > 1,
      observer: !pageLiteMode,
      observeParents: !pageLiteMode,
      watchSlidesProgress: !pageLiteMode,
      breakpoints: {
        1200: { slidesPerView: 6, spaceBetween: 16 },
        992: { slidesPerView: 4, spaceBetween: 16 },
        768: { slidesPerView: 4, spaceBetween: 12 },
        576: { slidesPerView: 4, spaceBetween: 8 },
      },
    }),
    [isMobile, pageLiteMode, partners?.length],
  );

  const STORAGE_KEY = "searchHistory";

  const loadSearchHistory = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const history = JSON.parse(saved);
        const validHistory = history.filter(
          (item) =>
            typeof item === "string" ||
            (typeof item === "object" &&
              item !== null &&
              (item.searchTerm || item._id)),
        );
        const limitedHistory = validHistory.slice(0, 10);
        setSearchHistory(limitedHistory);
        return limitedHistory;
      }
    } catch (error) { }
    return [];
  };

  const fetchSearchResults = useCallback(
    async (searchValue, limitNum = 10, isLoadMore = false) => {
      if (abortControllerRef.current && !isLoadMore) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      if (!isLoadMore) {
        abortControllerRef.current = abortController;
        setIsLoading(true);
      } else {
        setIsMoreLoading(true);
      }

      const cacheKey = `${searchValue.trim().toLowerCase()}-${limitNum}`;
      if (!isLoadMore && searchCache.has(cacheKey)) {
        const cachedResult = searchCache.get(cacheKey);
        setFilteredSuggestions(cachedResult.list);

        if (cachedResult.list.length < limitNum) {
          setHasMoreSuggestions(false);
        } else {
          setHasMoreSuggestions(true);
        }

        const variantsMap = {};
        cachedResult.list.forEach((item) => {
          variantsMap[getSearchItemId(item)] = item.selectedVariantId || null;
        });
        setSelectedVariants(variantsMap);
        setIsLoading(false);
        setIsMoreLoading(false);
        return;
      }

      const currentSearch = searchValue.trim();
      latestSearchRef.current = currentSearch;

      const result = await makeApiCall(currentSearch, limitNum, "search");

      if (latestSearchRef.current !== currentSearch) {
        return;
      }
      if (result) {
        setFilteredSuggestions(result.list);

        if (result.list.length < limitNum) {
          setHasMoreSuggestions(false);
        } else {
          setHasMoreSuggestions(true);
        }

        const variantsMap = {};
        result.list.forEach((item) => {
          variantsMap[getSearchItemId(item)] = item.selectedVariantId || null;
        });
        setSelectedVariants(variantsMap);

        const newCache = new Map(searchCache);
        newCache.set(cacheKey, result);
        setSearchCache(newCache);
      } else {
        if (!isLoadMore) {
          setFilteredSuggestions([]);
        }
        setHasMoreSuggestions(false);
      }

      setIsLoading(false);
      setIsMoreLoading(false);
    },
    [searchCache],
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value.trim()) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      setFilteredSuggestions([]);
      setSuggestionsLimit(10);
      setHasMoreSuggestions(true);
      setIsLoading(false);
      setIsMoreLoading(false);
      const history = loadSearchHistory();
      if (history.length > 0) {
        setSearchHistory(history);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
      return;
    }

    setShowSuggestions(true);
    setSuggestionsLimit(10);
    debounceTimerRef.current = setTimeout(() => {
      fetchSearchResults(value, 10, false);
    }, 300);
  };

  const saveToSearchHistory = (item) => {
    try {
      let history = loadSearchHistory();

      const historyEntry = {
        _id: getSearchItemId(item),
        searchTerm: item.tablet?.name || "Unknown",
        item: item,
      };

      history = history.filter((h) =>
        typeof h === "string" ? true : h._id !== getSearchItemId(item),
      );

      history.unshift(historyEntry);
      history = history.slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      setSearchHistory(history);
    } catch (error) { }
  };

  const handleSelect = (item) => {
    if (!item) return;

    if (item.type === "package" && item.tablet?._id) {
      setShowSuggestions(false);
      setQuery(item.tablet?.name || "");
      window.setTimeout(() => saveToSearchHistory(item), 0);
      navigate(`/lab-package/${item.tablet._id}`);
      return;
    }

    setShowSuggestions(false);
    handleProductClick(item);
    setQuery(item?.tablet?.name || "");
    window.setTimeout(() => saveToSearchHistory(item), 0);
  };

  const handleHistorySelect = async (historyItem) => {
    if (typeof historyItem === "object" && historyItem.item) {
      handleProductClick(historyItem.item);
      setQuery(historyItem.searchTerm || "");
      setShowSuggestions(false);
      return;
    }
    if (
      typeof historyItem === "string" ||
      (historyItem && historyItem.searchTerm)
    ) {
      const searchTerm =
        typeof historyItem === "string"
          ? historyItem
          : historyItem.searchTerm || "";
      setQuery(searchTerm);
      setShowSuggestions(true);
      handleChange({ target: { value: searchTerm } });
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Your browser does not support voice search");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) { }

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setQuery(voiceText);
      handleChange({ target: { value: voiceText } });
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error("Microphone permission denied");
      } else if (event.error === "no-speech") {
        toast.error("No voice detected");
      } else {
        toast.error("Voice recognition failed");
      }
    };

    recognition.onend = () => setIsListening(false);
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchWrapper = document.querySelector(".search-wrapper1");
      if (searchWrapper && !searchWrapper.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getCategoryData = useCallback(async (fetchId) => {
    let apiUrl = `service/${service}`;

    if (selectedPincode) {
      apiUrl += `?location=${selectedPincode}`;
      if (latitude && longitude) {
        apiUrl += `&lat=${latitude}&lng=${longitude}`;
      }
    }

    const params = {
      type: "website",
      positiontype: "top,bottom,middle",
    };
    try {
      const [response, categoriesResponse] = await Promise.all([
        axiosCommonInstance.get(apiUrl, { params }),
        axiosCommonInstance.get(`allcategory/slug/${service}`, {
          params: {
            type: "website",
            positiontype: "top,bottom",
            page: 1,
            limit: 18,
          },
        }).catch((err) => {
          console.error("Failed to fetch from allcategory/slug API:", err);
          return null;
        }),
      ]);

      if (fetchId !== serviceFetchIdRef.current) return;

      const data = response.data?.data || {};
      const {
        service: servicdeDetails,
        category,
        products,
        vendors,
        vendor,
        cheaprice,
        topdoctors,
        categoryvendor,
        vendorproducts,
        discountproducts,
        trendingproducts,
        topratedproducts,
        topproducts,
        topcategory,
        topcategoryproducts,
        offerproducts,
        newproducts,
        package: packagesData,
        sections,
      } = response.data.data;
      const fetchedCategories = categoriesResponse?.data?.data?.allcategory || category || [];
      setCategories(fetchedCategories);
      if (fetchedCategories?.length) {
        prefetchImageUrls(
          fetchedCategories
            .slice(0, 12)
            .map((item) => getImageUrl(item?.files?.[0]))
            .filter(Boolean),
        );
      }
      setServicesDetails(servicdeDetails);
      setproduct(products);
      setpartners(vendors || vendor);
      settopdoctors(topdoctors);
      setcategoryvendor(categoryvendor);
      setvendorproducts(vendorproducts);
      setcheaplabtests(cheaprice);
      setnursingOfferProducts(offerproducts);
      setdiscountProducts(discountproducts);
      setpopularProducts(topratedproducts);
      settrendingProducts(trendingproducts);
      setmedicalTreatments(topproducts);
      setnewProducts(newproducts);
      settopCategories(topcategory);
      settopCategoriesProducts(topcategoryproducts);
      setServices(data.service);
      setPackages(packagesData || []);
      setSections(sections || []);


      localStorage.removeItem("fixedType");
      localStorage.setItem(
        "fixedType",
        data?.service?.fixedType || ""
      );

      if (data.banner && Array.isArray(data.banner)) {
        const allBanners = [];

        data.banner.forEach((b) => {
          if (b.banners && Array.isArray(b.banners)) {
            const bannerItems = b.banners.map((bn) => {
              const fileUrl =
                bn?.files && Array.isArray(bn.files) && bn.files.length > 0
                  ? getImageUrl(bn.files[0]) || "/assets/default.png"
                  : "/assets/default.png";

              return {
                src: fileUrl,
                alt: bn?.name || "Banner Image",
                position: b.position || "top",
              };
            });
            allBanners.push(...bannerItems);
          }
        });

        setBanners(allBanners);
      }

      sessionStorage.setItem("healthcarePageLoaded", "true");
      if (fetchId !== serviceFetchIdRef.current) return;
      setIsPageLoading(false);
    } catch (err) {
      if (fetchId !== serviceFetchIdRef.current) return;
      toast.error(
        err?.response?.data?.message || err?.message || "Something went wrong",
      );
      sessionStorage.setItem("healthcarePageLoaded", "true");
      setIsPageLoading(false);
    }
  }, [service, selectedPincode, latitude, longitude]);

  useEffect(() => {
    setIsPageLoading(true);
    const fetchId = ++serviceFetchIdRef.current;
    getCategoryData(fetchId);
  }, [getCategoryData]);

  const bottomBanners = banners.filter((b) => b.position === "bottom");
  const topBanners = banners.filter((b) => b.position === "top");
  const middleBanners = banners.filter((b) => b.position === "middle");

  useEffect(() => {
    const savedCompareItems = localStorage.getItem("compareItems");
    if (savedCompareItems) {
      try {
        const parsedItems = JSON.parse(savedCompareItems);
        setCompareItems(parsedItems);
      } catch (error) {
        toast.error(error);
      }
    }
  }, []);

  const handleCompareToggle = (pkg, isChecked) => {
    let updatedItems;

    if (isChecked) {
      if (compareItems.length >= 3) {
        toast.error("You can only compare up to 3 packages!");
        return;
      }
      updatedItems = [...compareItems, pkg._id];
    } else {
      updatedItems = compareItems.filter((item) => item !== pkg._id);
    }

    setCompareItems(updatedItems);
    localStorage.setItem("compareItems", JSON.stringify(updatedItems));
  };

  const isLoggedIn = !!localStorage.getItem("medicomparestoken");
  const currentService = service;

  const clearAllCompare = () => {
    setCompareItems([]);
    localStorage.removeItem("compareItems");
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowSuggestions(false);
  };

  const deleteSearchHistoryItem = (index, historyItem) => {
    try {
      let history = loadSearchHistory();
      history = history.filter((item, i) => i !== index);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      setSearchHistory(history);

      if (history.length === 0) {
        setShowSuggestions(false);
      }
    } catch (error) { }
  };

  const settings = getHealthcareMiddleBannerSettings();
  const settings1 = getHealthcareHeroBannerSettings();
  const medicalEquipment = getHealthcareMedicalEquipmentSettings();
  const supersaving = getHealthcareSuperSavingSettings();

  const partnerSliderSettings = {
    dots: false,
    infinite: partners?.length > 8,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 8,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <HealthcareNextArrow />,
    prevArrow: <HealthcarePrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 8,
          infinite: partners?.length > 8,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 6,
          infinite: partners?.length > 6,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
          infinite: partners?.length > 4,
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 4,
          infinite: partners?.length > 4,
        }
      }
    ]
  };

  const PRIMARY_COLOR = "#8059ca";
  const PRIMARY_SECTION_BG = "#f8f4ff";

  const displayCategories = useMemo(
    () => (categories?.length ? categories.slice(0, 18) : []),
    [categories],
  );

  const buildBookPayload = (item, bookingType = "normal") => {
    if (bookingType === "package") {
      return [
        {
          productId: null,
          variantId: null,
          vendorId: item.vendor?._id || item.vendorId,
          packageId: item._id,
          type: "package",
          bookingType: "buy_now",
        },
      ];
    }

    return [
      {
        productId: item.name,
        variantId: null,
        vendorId: item.vendor?._id || item.vendorId,
        packageId: item._id,
        type: "normal",
        bookingType: "buy_now",
      },
    ];
  };

  const handleBook = async (item, bookingType = "normal") => {
    const payload = buildBookPayload(item, bookingType);
    const token = localStorage.getItem("medicomparestoken");

    if (!token) {
      toast.error("Please login to book service");
      redirectToLoginWithPendingBooking(navigate, payload);
      return;
    }

    try {
      const response = await axiosCommonInstance.post(
        "cart/buynow/create",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = response.data;
      navigate("/booking-process", { state: { bookingData: result } });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        redirectToLoginWithPendingBooking(navigate, payload);
      } else {
        toast.error("Something went wrong while creating booking.");
      }
    }
  };

  const handleCompareBar = async () => {
    try {
      const response = await axiosCommonInstance.post(
        "compare/list",
        { id: compareItems },
        { headers: { "content-type": "application/json" } },
      );

      if (response?.data?.list || response?.data?.data) {
        const dataToPass = response.data.list || response.data.data;
        navigate("/package-view", {
          state: {
            compareData: dataToPass,
            packageIds: compareItems,
          },
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch comparison data",
      );
    }
  };

  const handleCategoryClick = useCallback(
    (item) => {
      navigate(`/${service}/all?maincategories=${item.slug}`);
    },
    [navigate, service],
  );

  const handleProductClick = useCallback((product) => {
    const navigation = getProductNavigation(product, {
      fallbackService: service || "medicine",
      pincode: getMedicinePincodeFromStorage(),
    });

    if (!navigation) {
      toast.error("Product details not available");
      return;
    }

    navigate(navigation.url, { state: navigation.state });
  }, [navigate, service]);




  const dynamicSectionClick = useCallback((product) => {
    const tablet = resolveProductTablet(product)
    const productSlug = tablet.slug || tablet._id || tablet.id;
    if (!productSlug) return null;

    const subcategoryData = tablet.subcategorys || tablet.subcategoryDetails;
    const categoryData =
      subcategoryData?.category ||
      subcategoryData?.categoryDetails ||
      tablet.category;

    const fixedType = categoryData?.fixedType;
    const serviceSlug = service || "medicine";

    const categories =
      subcategoryData?.slug ||
      (subcategoryData?.name
        ? subcategoryData.name.toLowerCase().replace(/\s+/g, "-")
        : null)

    if (!navigation) {
      toast.error("Product details not available");
      return;
    }

    const productnavigation = `${categories}/${productSlug}`
    console.log(productnavigation, "productnavigation")
    navigate(productnavigation);
  })

  const handleAddToCart = async (pkg) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("medicomparestoken");
      if (!token) {
        toast.error("No token found. Please login again.");
        navigate("/login");
        return;
      }
      const vendorId = pkg.vendor?._id || pkg.vendorId || null;

      if (!vendorId) {
      }

      const payload = [
        {
          productId: null,
          variantId: null,
          vendorId,
          packageId: pkg._id,
          type: "package",
        },
      ];

      const response = await axiosCommonInstance.post("cart/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = response.data;
      navigate("/cart");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Something went wrong while creating booking.");
      }
    }
  };

  const handlePartnerClick = (partner) => {
    const vendorId = partner?.bussinessdetails?.vendorId || partner?._id || partner?.businessdetails?.vendorId;
    console.log("partner", partner)
    if (vendorId) {
      sessionStorage.setItem("vendorId", vendorId);

      const name =
        partner?.bussinessdetails?.name || partner?.name ||
        `${partner?.firstName || ""} ${partner?.lastName || ""}` ||
        "Vendor Store";

      const vendorSlug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      // console.log("vendorSlug", vendorSlug)
      navigate(`/vendor-profile/${vendorSlug}`);
    }
  };

  const handleCompareClick = (item, section) => {
    const tablet =
      item?.tabletdetails || item?.tabletDetails || item?.tablet || item;

    const productSlug = tablet?.slug;
    if (!productSlug) {
      toast.error("Product not available");
      return;
    }

    let sub =
      tablet?.subcatdetails ||
      tablet?.subcategorydetails ||
      tablet?.subcategoryDetails ||
      tablet?.subcategorys;

    if (Array.isArray(sub)) sub = sub[0];

    const service =
      section?.serviceId?.slug ||
      sub?.categoryDetails?.slug ||
      sub?.category?.slug ||
      currentService ||
      "medicine";

    const subcategory = sub?.slug || "general";

    navigate(`/${service}/${subcategory}/${productSlug}/compare`);
  };

  const handleVendorClick = (vendor) => {
    // console.log("partner", vendor)
    handlePartnerClick(vendor);
  };


  const highlightMatch = (text, query) => {
    if (!text) return "Unknown";
    if (!query || typeof query !== "string") return text;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} style={{ fontWeight: "normal" }}>
              {part}
            </span>
          ) : (
            <strong key={index} style={{ fontWeight: "600" }}>
              {part}
            </strong>
          ),
        )}
      </>
    );
  };

  if (isPageLoading) {
    return <PageLoader />;
  }

  return (
    <div className="service-details-page">
      <Home2Header />
      <CategoryProvider />

      {myservice.fixedType !== "ambulanceservice" && (
        <section
          style={{
            background: PRIMARY_SECTION_BG,
            padding: "30px",
            position: "relative",
            marginTop: isMobile ? "70px" : "120px",
            zIndex: showSuggestions ? 25 : 1,
            overflow: "visible",
          }}
          className={`search-section1${showSuggestions ? " is-search-open" : ""}`}
        >
          <div
            className="container-fluid px-3 px-md-4"
            style={{ position: "relative", zIndex: 1, maxWidth: "850px" }}
          >
            <div className="row">
              <div className="col-12">
                <div
                  style={{ position: "relative", zIndex: 1, maxWidth: "850px" }}
                >
                  <div className="row">
                    <div className="col-12 mt-3">
                      <div
                        style={{
                          margin: "0 auto",
                          position: "relative",
                          zIndex: showSuggestions ? 30 : 2,
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
                                style={{ fontSize: "14px" }}
                              ></i>
                            </div>

                            <input
                              ref={searchInputRef}
                              type="text"
                              className="search-input"
                              placeholder={placeholderTexts[0]}
                              value={query}
                              onChange={handleChange}
                              onFocus={() => {
                                if (!query.trim() && searchHistory.length > 0) {
                                  setShowSuggestions(true);
                                } else if (query) {
                                  setShowSuggestions(true);
                                }
                              }}
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
                                className="google-dots"
                                style={{
                                  position: "absolute",
                                  right: "45px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              >
                                <span className="dott blue" />
                                <span className="dott red" />
                                <span className="dott yellow" />
                                <span className="dott green" />
                              </div>
                            )}

                            <button
                              type="button"
                              title="Voice search"
                              onClick={startVoiceRecognition}
                              style={{
                                background: isListening
                                  ? "#e0f2fe"
                                  : "transparent",
                                color: isListening
                                  ? "#0284c7"
                                  : "rgb(107, 114, 128)",
                                border: isListening
                                  ? "1.5px solid #0284c7"
                                  : "1.5px solid rgb(229, 231, 235)",
                                borderRadius: "6px",
                                padding: "2px",
                                width: "25px",
                                height: "25px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                flexShrink: 0,
                                boxShadow: isListening
                                  ? "0 0 6px rgba(2, 132, 199, 0.6)"
                                  : "none",
                              }}
                            >
                              <svg
                                width={14}
                                height={14}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 19V23"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8 23H16"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>

                          {(isLoading ||
                            (showSuggestions &&
                              (filteredSuggestions.length > 0 ||
                                (!query.trim() &&
                                  searchHistory.length > 0)))) && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: 0,
                                  right: 0,
                                  marginTop: "0px",
                                  background: "#ffffff",
                                  borderRadius: "10px",
                                  border: "1.5px solid #e5e7eb",
                                  boxShadow:
                                    "0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)",
                                  zIndex: 999999,
                                  maxHeight: "400px",
                                  overflowY: "auto",
                                  overflowX: "hidden",
                                  animation: pageLiteMode
                                    ? "none"
                                    : "fadeInUp 0.2s ease-out",
                                }}
                              >
                                {!isLoading &&
                                  !query.trim() &&
                                  searchHistory.length > 0 && (
                                    <>
                                      <div
                                        style={{
                                          padding: "10px 15px",
                                          fontSize: "12px",
                                          borderBottom: "1px solid #f3f4f6",
                                          backgroundColor: "#f9fafb",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <span>Recent Search History</span>
                                        <button
                                          type="button"
                                          onClick={clearSearchHistory}
                                          className="service-suggestion-clear"
                                          style={{
                                            background: "none",
                                            border: "none",
                                            color: "#ef4444",
                                            fontSize: "11px",
                                            cursor: "pointer",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          Clear All
                                        </button>
                                      </div>
                                      {searchHistory.map((historyItem, index) => (
                                        <button
                                          key={
                                            typeof historyItem === "object" &&
                                              historyItem._id
                                              ? `history-${historyItem._id}`
                                              : `history-${index}`
                                          }
                                          onClick={() =>
                                            handleHistorySelect(historyItem)
                                          }
                                          className="service-suggestion-item"
                                          style={{
                                            width: "100%",
                                            padding: "10px 15px",
                                            border: "none",
                                            background: "transparent",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            fontSize: "15px",
                                            color: "#111827",
                                            display: "flex",
                                            zIndex: "9999999",
                                            alignItems: "center",
                                            gap: "14px",
                                            borderBottom:
                                              index < searchHistory.length - 1
                                                ? "1px solid #f3f4f6"
                                                : "none",
                                            position: "relative",
                                          }}
                                        >
                                          <img
                                            src={getImageUrl(
                                              historyItem?.item?.tablet?.imageUrl
                                                ?.length > 0
                                                ? historyItem.item.tablet
                                                  .imageUrl[0]
                                                : historyItem?.item?.tablet?.files
                                                  ?.length > 0
                                                  ? historyItem.item.tablet
                                                    .files[0]
                                                  : historyItem?.item?.imageUrl
                                                    ?.length > 0
                                                    ? historyItem.item.imageUrl[0]
                                                    : historyItem?.item?.files
                                                      ?.length > 0
                                                      ? historyItem.item.files[0]
                                                      : historyItem?.tablet
                                                        ?.imageUrl?.length > 0
                                                        ? historyItem.tablet
                                                          .imageUrl[0]
                                                        : historyItem?.tablet
                                                          ?.files?.length > 0
                                                          ? historyItem.tablet
                                                            .files[0]
                                                          : "/assets/default.png",
                                            )}
                                            alt="image"
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                              borderRadius: "6px",
                                              objectFit: "contain",
                                              backgroundColor: "#f8f9fa",
                                              flexShrink: 0,
                                            }}
                                            onError={(e) => {
                                              e.target.src =
                                                "/assets/default.png";
                                            }}
                                          />
                                          <span
                                            style={{ flex: 1, lineHeight: "1.5" }}
                                          >
                                            {typeof historyItem === "string"
                                              ? historyItem
                                              : historyItem.searchTerm ||
                                              historyItem}
                                          </span>
                                          {typeof historyItem === "object" &&
                                            (historyItem?.item?.tablet
                                              ?.medicineType ||
                                              historyItem?.item?.tablet?.type ||
                                              historyItem?.tablet?.medicineType ||
                                              historyItem?.tablet?.type) && (
                                              <span
                                                className="ms-auto badge rounded-pill bg-primary"
                                                style={{
                                                  fontSize: "11px",
                                                  marginRight: "8px",
                                                }}
                                              >
                                                {historyItem?.item?.tablet
                                                  ?.medicineType ||
                                                  historyItem?.item?.tablet
                                                    ?.type ||
                                                  historyItem?.tablet
                                                    ?.medicineType ||
                                                  historyItem?.tablet?.type}
                                              </span>
                                            )}
                                          <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteSearchHistoryItem(
                                                index,
                                                historyItem,
                                              );
                                            }}
                                            onKeyDown={(e) => {
                                              if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                              ) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                deleteSearchHistoryItem(
                                                  index,
                                                  historyItem,
                                                );
                                              }
                                            }}
                                            className="service-suggestion-clear"
                                            style={{
                                              background: "none",
                                              border: "none",
                                              color: "#ef4444",
                                              fontSize: "14px",
                                              cursor: "pointer",
                                              padding: "4px",
                                              borderRadius: "4px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              width: "24px",
                                              height: "24px",
                                              flexShrink: 0,
                                            }}
                                            title="Delete this search"
                                          >
                                            <i className="fas fa-times"></i>
                                          </div>
                                        </button>
                                      ))}
                                    </>
                                  )}

                                {!isLoading &&
                                  query.trim() &&
                                  filteredSuggestions.map((item, index) => (
                                    <button
                                      key={getSearchItemId(item) || `search-${index}`}
                                      onClick={() => handleSelect(item)}
                                      style={{
                                        width: "100%",
                                        padding: "10px 10px",
                                        border: "none",
                                        background: "transparent",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        fontSize: "15px",
                                        color: "#111827",
                                        display: "flex",
                                        zIndex: "9999999",
                                        alignItems: "center",
                                        gap: "14px",
                                        borderBottom:
                                          index <
                                            filteredSuggestions.length - 1
                                            ? "1px solid #f3f4f6"
                                            : "none",
                                        transition:
                                          "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                        position: "relative",
                                      }}
                                    >
                                      <div
                                        style={{
                                          color: "#9ca3af",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <i className="fas fa-search"></i>
                                      </div>
                                      <span
                                        style={{ flex: 1, lineHeight: "1.5", textTransform: "capitalize" }}
                                      >
                                        {highlightMatch(
                                          item.tablet?.name,
                                          query,
                                        )}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: '10px',
                                          color: '#666',
                                          backgroundColor: '#f0f0f0',
                                          padding: '2px 8px',
                                          borderRadius: '12px',
                                          whiteSpace: 'nowrap',
                                          marginLeft: '8px',
                                          textTransform: "capitalize"
                                        }}
                                      >
                                        {item?.type === "package"
                                          ? item?.type
                                          : item?.tablet?.category?.fixedType === "medicine"
                                            ? (item?.tablet?.medicineType || "product")
                                            : (item?.tablet?.category?.name || "product")}
                                      </span>
                                    </button>
                                  ))}
                                {!isLoading && query.trim() && hasMoreSuggestions && filteredSuggestions.length > 0 && (
                                  <button
                                    type="button"
                                    disabled={isMoreLoading}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const nextLimit = suggestionsLimit + 20;
                                      setSuggestionsLimit(nextLimit);
                                      fetchSearchResults(query, nextLimit, true);
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "10px",
                                      border: "none",
                                      background: "#f9fafb",
                                      color: isMoreLoading ? "#9ca3af" : "#8059ca",
                                      fontWeight: "600",
                                      textAlign: "center",
                                      cursor: isMoreLoading ? "not-allowed" : "pointer",
                                      fontSize: "13px",
                                      borderTop: "1px solid #f3f4f6",
                                      transition: "background-color 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isMoreLoading) e.currentTarget.style.backgroundColor = "#f1f5f9";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isMoreLoading) e.currentTarget.style.backgroundColor = "#f9fafb";
                                    }}
                                  >
                                    {isMoreLoading ? "Loading..." : "Load More"}
                                  </button>
                                )}
                              </div>
                            )}
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {myservice.fixedType !== "ambulanceservice" && (
        <div
          className="service-cards-stack-wrapper"
          style={{
            position: "relative",
            zIndex: showSuggestions ? 1 : 5,
            backgroundColor: PRIMARY_SECTION_BG,
            overflow: "visible",
          }}
        >
          <ServiceCards serviceType={myservice?.fixedType} liteMode={pageLiteMode} />
        </div>
      )}

      {topBanners.length > 0 && (
        <section
          className=" mobilemargin feedback-section-fifteen px-2 mb-3"
          style={
            myservice.fixedType === "ambulanceservice"
              ? { marginTop: isMobile ? "170px" : "45px" }
              : {}
          }
        >
          <div className="container-fluid mt-0">
            {topBanners.length > 1 ? (
              <Slider {...settings1}>
                {topBanners.map((image, index) => (
                  <div key={index} className="col-lg-12 d-flex">

                    <img
                      src={image.src}
                      alt={image.alt}
                      title={image.alt}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchpriority={index === 0 ? "high" : "low"}
                      decoding={index === 0 ? "sync" : "async"}
                      // loading="lazy"
                      className="banner-image px-1"
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="col-lg-12 d-flex">
                <img
                  src={topBanners[0].src}
                  alt={topBanners[0].alt}
                  title={topBanners[0].alt}
                  loading="lazy"
                  className="banner-image px-1"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {myservice.fixedType !== "ambulanceservice" && (
        <section className="py-3" style={{ backgroundColor: PRIMARY_SECTION_BG }}>
          <div className="container-fluid px-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap result-wrap gap-3 mb-4">
              <h3 className="mb-2 top-vendor-badge">
                <i className="fas fa-bolt mx-1"></i>
                {service
                  ?.replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </h3>

              <div className="d-flex align-items-center flex-wrap gap-3">
                <Link
                  to={`/view-all-categories/${service}`}
                  className="top-vendor-badge service-link-hover"
                  style={{
                    padding: isMobile ? "8px" : "8px 20px",
                    borderRadius: isMobile ? "50%" : "50px",
                    border: "1px solid #8059ca",
                    background: "#ffffff",
                    color: "#8059ca",
                    fontSize: isMobile ? "10px" : "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: isMobile ? "36px" : "auto",
                    height: isMobile ? "36px" : "auto",
                  }}
                >
                  {isMobile ? "" : "View All"}
                  <i className={isMobile ? "isax isax-arrow-right-1" : "isax isax-arrow-right-1 ms-1"}></i>
                </Link>
              </div>
            </div>

            <div className="row g-2">
              {displayCategories.length > 0 ? (
                displayCategories.slice(0, 12).map((cat, index) => (
                  <ServiceCategoryCard
                    key={cat._id || index}
                    cat={cat}
                    index={index}
                    onClick={handleCategoryClick}
                  />
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <h5>No Data Available</h5>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!["medicine", "labtests", "ambulanceservice"].includes(
        myservice.fixedType,
      ) &&
        sections &&
        sections.length > 0 && (
          <DynamicCategorySections
            sections={sections}
            onProductClick={dynamicSectionClick}
            onCompareClick={handleCompareClick}
            onVendorClick={handleVendorClick}
            imgUrl={imgUrl}
            sliderSettings={supersaving}
            liteMode={pageLiteMode}
            isMobile={isMobile}
            currentService={myservice.fixedType}
          />
        )}

      {myservice.fixedType == "medicine" && (
        <Suspense fallback={<HealthcareModuleFallback />}>
          <MedicinesModule
            discountProducts={discountProducts}
            handleProductClick={dynamicSectionClick}
            popularProducts={popularProducts}
            trendingProducts={trendingProducts}
            handlePartnerClick={handlePartnerClick}
            imgUrl={imgUrl}
            middleBanners={middleBanners}
            bottomBanners={bottomBanners}
            settings={settings}
            supersaving={supersaving}
            service={service}
            handleVendorClick={handleVendorClick}
            handleCompareClick={handleCompareClick}
            sections={sections}
          />
        </Suspense>
      )}

      {myservice.fixedType == "surgeries" && (
        <Suspense fallback={<HealthcareModuleFallback />}>
          <Surgeries
            imgUrl={imgUrl}
            topdoctors={topdoctors}
            categoryvendor={categoryvendor}
            vendorproducts={vendorproducts}
            handleProductClick={dynamicSectionClick}
            handleVendorClick={handleVendorClick}
            handleCompareClick={handleCompareClick}
            sections={sections}
            middleBanners={middleBanners}
            bottomBanners={bottomBanners}
          />
        </Suspense>
      )}

      {myservice.fixedType == "labtests" && (
        <LabTestSection
          fixedType={myservice.fixedType}
          product={product}
          packages={packages}
          compareItems={compareItems}
          handleCompareToggle={handleCompareToggle}
          handleBook={handleBook}
          currentService={currentService}
          handleAddToCart={handleAddToCart}
          imgUrl={imgUrl}
          service={service}
          setShowDiscountPopup={setShowDiscountPopup}
          handleCompareBar={handleCompareBar}
          clearAllCompare={clearAllCompare}
          cheaplabtests={cheaplabtests}
          showDiscountPopup={showDiscountPopup}
          handleProductClick={dynamicSectionClick}
          handleVendorClick={handleVendorClick}
          handleCompareClick={handleCompareClick}
          middleBanners={middleBanners}
          bottomBanners={bottomBanners}
          settings={settings}
          sections={sections}
          serviceDetails={serviceDetails}
        />
      )}

      {myservice.fixedType == "diagnostics" && (
        <Suspense fallback={<HealthcareModuleFallback />}>
          <Diagnostics
            product={product}
            packages={packages}
            compareItems={compareItems}
            handleCompareToggle={handleCompareToggle}
            handleBook={handleBook}
            handleAddToCart={handleAddToCart}
            currentService={currentService}
            imgUrl={imgUrl}
            service={service}
            handleCompareBar={handleCompareBar}
            middleBanners={middleBanners}
            bottomBanners={bottomBanners}
            settings={settings}
            clearAllCompare={clearAllCompare}
            cheaplabtests={cheaplabtests}
            handleProductClick={dynamicSectionClick}
            handleVendorClick={handleVendorClick}
            handleCompareClick={handleCompareClick}
            sections={sections}
          />
        </Suspense>
      )}

      {myservice.fixedType == "dentalservice" && (
        <Suspense fallback={<HealthcareModuleFallback />}>
          <DentalTeeth
            imgUrl={imgUrl}
            handleBook={handleBook}
            cheaplabtests={cheaplabtests}
            topdoctors={topdoctors}
            currentService={currentService}
            middleBanners={middleBanners}
            bottomBanners={bottomBanners}
            service={service}
            settings={settings}
            handleProductClick={dynamicSectionClick}
            handleVendorClick={handleVendorClick}
            handleCompareClick={handleCompareClick}
            sections={sections}
          />
        </Suspense>
      )}

      {myservice.fixedType == "nursingcare" && (
        <Suspense fallback={<HealthcareModuleFallback />}>
          <NursingCare
            imgUrl={imgUrl}
            handleBook={handleBook}
            medicalTreatments={medicalTreatments}
            currentService={currentService}
            nursingOfferProducts={nursingOfferProducts}
            handleProductClick={dynamicSectionClick}
            handleVendorClick={handleVendorClick}
            handleCompareClick={handleCompareClick}
            sections={sections}
            service={service}
            middleBanners={middleBanners}
            bottomBanners={bottomBanners}
          />
        </Suspense>
      )}

      {myservice.fixedType == "homecare" && (
        <Suspense fallback={<HealthcareModuleFallback />}>
          <HomeCareServices
            medicalTreatments={medicalTreatments}
            imgUrl={imgUrl}
            handleProductClick={dynamicSectionClick}
            handleVendorClick={handleVendorClick}
            handleCompareClick={handleCompareClick}
            sections={sections}
            currentService={currentService}
            service={service}
            settings={settings}
            middleBanners={middleBanners}
            bottomBanners={bottomBanners}
          />
        </Suspense>
      )}

      {myservice.fixedType == "medicalequipment" && (
        <Suspense fallback={<HealthcareModuleFallback />}>
          <MedicalEquipment
            medicalEquipment={medicalEquipment}
            topCategories={topCategories}
            topCategoriesProducts={topCategoriesProducts}
            newProducts={newProducts}
            trendingProducts={trendingProducts}
            settopCategoriesProducts={settopCategoriesProducts}
            handleProductClick={dynamicSectionClick}
            imgUrl={imgUrl}
            middleBanners={middleBanners}
            bottomBanners={bottomBanners}
            handleVendorClick={handleVendorClick}
            handleCompareClick={handleCompareClick}
            sections={sections}
          />
        </Suspense>
      )}

      {myservice.fixedType == "medicaltreatment" && (
        <Suspense fallback={<HealthcareModuleFallback />}>
          <MedicalTreatMent
            handleBook={handleBook}
            imgUrl={imgUrl}
            topdoctors={topdoctors}
            currentService={currentService}
            service={service}
            medicalTreatments={medicalTreatments}
            handleProductClick={dynamicSectionClick}
            middleBanners={middleBanners}
            bottomBanners={bottomBanners}
            handleVendorClick={handleVendorClick}
            handleCompareClick={handleCompareClick}
            sections={sections}
          />
        </Suspense>
      )}

      {myservice.fixedType == "ambulanceservice" && (
        <Suspense fallback={<HealthcareModuleFallback />}>
          <AmbulanceService
            imgUrl={imgUrl}
            categories={product}
            categories1={medicalTreatments}
            medicalTreatments={medicalTreatments}
            handleProductClick={dynamicSectionClick}
            middleBanners={middleBanners}
            bottomBanners={bottomBanners}
            isMobile={isMobile}
            selectedPincode={selectedPincode}
            latitude={latitude}
            longitude={longitude}
            hasTopBanner={topBanners.length > 0}
          />
        </Suspense>
      )}

      {myservice.fixedType == "medicine" && sections && sections.length > 0 && (
        <DynamicCategorySections
          sections={sections}
          onProductClick={dynamicSectionClick}
          onCompareClick={handleCompareClick}
          onVendorClick={handleVendorClick}
          imgUrl={imgUrl}
          sliderSettings={supersaving}
          liteMode={pageLiteMode}
          isMobile={isMobile}
          currentService={service}
        />
      )}

      {partners && partners.length > 0 && (
        <section className="container-fluid px-3 py-3 my-3 service-partners-section-lite">
          <div>
            <div className="d-flex align-items-center justify-content-between result-wrap gap-3 my-2">
              <h3
                className="mb-2 top-vendor-badge"
                style={{
                  fontSize: isMobile ? "12px" : "20px",
                  fontWeight: "600",
                }}
              >
                <i className="fas fa-bolt" style={{ marginRight: "6px" }}></i>
                Trusted Partners
                {isMobile ? "" : `(${partners.length})`}
              </h3>

              <Link
                to={`/partners/${service}`}
                className="top-vendor-badge service-link-hover"
                style={{
                  padding: isMobile ? "8px" : "8px 20px",
                  borderRadius: isMobile ? "50%" : "50px",
                  width: isMobile ? "36px" : "auto",
                  height: isMobile ? "36px" : "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                }}
              >
                {isMobile ? "" : "View All"}
                <i
                  className={
                    isMobile ? "fas fa-arrow-right" : "fas fa-arrow-right ms-1"
                  }
                ></i>
              </Link>
            </div>

            <div
              className="trusted-partners-scroll pb-1 mt-2"
              style={{
                position: "relative",
                padding: isMobile ? "10px 5px" : "10px 20px",
              }}
            >
              <div className="doctor-slider-one owl-theme px-3">
                <Slider {...partnerSliderSettings}>
                  {partners.map((partner, index) => {
                    const businessImage =
                      partner?.businessdetails?.bussiness_image?.[0]?.url;
                    const businessName = partner?.businessdetails?.name;

                    return (
                      <div
                        key={partner._id || index}
                        className="px-2"
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => handlePartnerClick(partner)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handlePartnerClick(partner);
                            }
                          }}
                          className={`service-partner-card${isMobile ? " service-partner-card--mobile" : ""
                            }`}
                          style={{
                            height: isMobile ? "80px" : "165px",
                            width: isMobile ? "80px" : "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            overflow: "hidden"
                          }}
                        >
                          {!isMobile ? (
                            <>
                              <div
                                style={{
                                  width: "100%",
                                  height: "100px",
                                  borderRadius: "8px",
                                  backgroundColor: "#faf9fe",
                                  overflow: "hidden",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "6px",
                                  marginBottom: "10px",
                                }}
                              >
                                <img
                                  src={
                                    businessImage
                                      ? getImageUrl(businessImage)
                                      : "/assets/default.png"
                                  }
                                  alt={businessName || partner.name}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                              <h6
                                className="mb-0"
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  color: "#222",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textAlign: "center",
                                  lineHeight: "1.4",
                                }}
                              >
                                {businessName || "N/A"}
                              </h6>
                            </>
                          ) : (
                            <img
                              src={
                                businessImage
                                  ? getImageUrl(businessImage)
                                  : "/assets/default.png"
                              }
                              alt={businessName || partner.name}
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Slider>
              </div>
            </div>
          </div>
        </section>
      )}

      {bottomBanners.length > 0 && (
        <section className="feedback-section-fifteen px-2 mb-5">

          <div className="container-fluid mt-0">
            {bottomBanners.length > 1 ? (
              <Slider {...settings1}>
                {bottomBanners.map((image, index) => (
                  <div key={index} className="col-lg-4 col-md-6 d-flex">
                    <img
                      src={image.src}
                      alt={image.alt}
                      title={image.alt}
                      // loading="lazy"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchpriority={index === 0 ? "high" : "low"}
                      decoding={index === 0 ? "sync" : "async"}
                      className="px-1 banner-image"
                      style={{
                        borderRadius: "10px",
                        aspectRatio: "5.5 / 1",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="col-lg-12 d-flex">
                <img
                  src={bottomBanners[0].src}
                  alt={bottomBanners[0].alt}
                  title={bottomBanners[0].alt}
                  loading="lazy"
                  className="px-1 banner-image"
                  style={{
                    borderRadius: "10px",
                    aspectRatio: "5.5 / 1",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {myservice.fixedType == "dentalservice" && (
        <section className="features-section"
          style={{
            backgroundColor: "#E8E4F5",
            backgroundImage:
              "url('/assets/Medicompares%20Background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="features-container">
            <div className="feature-box">
              <i className="fa-solid fa-hand-holding-dollar feature-icon icon-box"></i>
              <h3>Affordable Price</h3>
              <p className="text-dark">
                Transparent pricing with no hidden charges, ensuring quality
                dental care that fits your budget.
              </p>
            </div>

            <div className="feature-box">
              <i className="fa-solid fa-user-doctor feature-icon icon-box"></i>
              <h3>Professional Dentist</h3>
              <p className="text-dark">
                Experienced and certified dental specialists delivering safe,
                precise, and reliable treatments.
              </p>
            </div>

            <div className="feature-box">
              <i className="fa-solid fa-thumbs-up feature-icon icon-box"></i>
              <h3>Satisfactory Service</h3>
              <p className="text-dark">
                Patient-focused care with high hygiene standards, comfort, and
                trusted treatment outcomes.
              </p>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ServiceDetails;
