import React, { useEffect, useState, useRef, useMemo, useLayoutEffect } from "react";
import Home2Header from "./Header-k";
import SEOHelmet from "../../../../components/SEOHelmet";
import Home2Footer from "./Footer-f";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Swiper } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { TypeAnimation } from "react-type-animation";
import toast from "react-hot-toast";
import Slider from "react-slick";
import { Modal } from "react-bootstrap";
import {
  axiosInstance,
  axiosCommonInstance,
  imgUrl,
} from "../../../../Apiservice";
import { useMediaQuery } from "react-responsive";
import MedicineSection from "./MedicineSection";
import "./home-enhanced.css";
import { useLocation as useLocationContext } from "../../../../context/LocationContext";
import CustomerReviewsSuccessModal from "../../pharmacy/products-components/CustomerReviewSuccessModal";
import DynamicSections from "./DynamicSections";
import PageLoader from "../../../../components/ui/PageLoader.jsx";
import { getImageUrl } from "../../../../utils";
import PrescriptionUploadModal from "../../pharmacy/products-components/PrescriptionUploadModal";
import {
  collectHomeImagePaths,
  prefetchImageUrls,
  preloadStaticImages,
} from "../../../../utils/prefetchImages";
import { shouldUseHomeLiteMode } from "../../../../utils/devicePerformance";
import {
  getMedicinePincodeFromStorage,
  getProductNavigation,
} from "../../../../utils/productUtils";

const HERO_TYPE_WORDS = [
  "Medicines",
  "Surgeries",
  "Dental",
  "Diagnostics",
  "Lab Prices",
];

const Home2 = ({ handleProductClick: propHandleProductClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPincode, latitude, longitude } = useLocationContext();
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blogss, setblogss] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [faqss, setFaqs] = useState([]);
  const [sections, setSections] = useState([]);
  const [part1Vendors, setPart1Vendors] = useState([]);
  const [part2Vendors, setPart2Vendors] = useState([]);
  const [mediciness, setMediciness] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLimit, setSuggestionsLimit] = useState(10);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);
  const [show, setshow] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [searchHistory, setSearchHistory] = useState([]);
  const { service } = useParams();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [openIndex, setOpenIndex] = useState(null);
  const searchRef = useRef("");
  const searchInputRef = useRef(null);
  const heroTypeRef = useRef(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const homeLiteMode = useMemo(() => shouldUseHomeLiteMode(), []);

  useLayoutEffect(() => {
    if (!homeLiteMode) return undefined;

    document.documentElement.classList.add("home-lite");
    return () => document.documentElement.classList.remove("home-lite");
  }, [homeLiteMode]);

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };
  const handleClose = () => {
    setshow(false);
    localStorage.setItem("hasSeenModal", "true");
  };

  useEffect(() => {
    const assets = ["/assets/default.png", "/assets/img/work-img.png"];
    if (!homeLiteMode) {
      assets.unshift("/assets/Medicompares%20Background.png");
    }
    preloadStaticImages(assets);
  }, [homeLiteMode]);

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

  useEffect(() => {
    if (!homeLiteMode) return undefined;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % HERO_TYPE_WORDS.length;
      if (heroTypeRef.current) {
        heroTypeRef.current.textContent = HERO_TYPE_WORDS[index];
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [homeLiteMode]);

  const STORAGE_KEY = "searchHistory";
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

  const saveSearchHistory = (history) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      setSearchHistory(history);
    } catch (error) { }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowSuggestions(false);
  };

  const getByBlogDetails = (blog) => {
    navigate(`/blog-details/${blog.slug}`);
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

  const addToSearchHistory = (item) => {
    if (!item) return;

    const searchTerm = item.tablet?.name || "Unknown";
    if (!searchTerm.trim()) return;

    let history = loadSearchHistory();

    const historyEntry = {
      _id: item._id,
      searchTerm: searchTerm.trim(),
      item: item,
    };

    history = history.filter(
      (h) => typeof h === "string" || !h._id || h._id !== item._id,
    );

    history.unshift(historyEntry);
    history = history.slice(0, 5);

    saveSearchHistory(history);
  };

  const fetchSuggestions = async (searchQuery, limitNum, isLoadMore = false) => {
    if (!searchQuery.trim()) return;
    if (isLoadMore) {
      setIsMoreLoading(true);
    } else {
      setIsLoading(true);
    }
    try {
      const trimmedValue = searchQuery.length > 50 ? searchQuery.substring(0, 50) : searchQuery;
      const response = await axiosCommonInstance.get(
        `all/search/product?search=${encodeURIComponent(trimmedValue)}&page=1&limit=${limitNum}`
      );

      if (searchRef.current === searchQuery) {
        const list = response?.data?.data?.list || [];
        setFilteredSuggestions(list);

        if (list.length < limitNum) {
          setHasMoreSuggestions(false);
        } else {
          setHasMoreSuggestions(true);
        }

        if (list.length > 0) {
          const variantsMap = {};
          list.forEach((item) => {
            variantsMap[item._id] = item.selectedVariantId || null;
          });
          setSelectedVariants((prev) => ({ ...prev, ...variantsMap }));
        }
      }
    } catch (err) {
      if (searchRef.current === searchQuery) {
        if (!isLoadMore) {
          setFilteredSuggestions([]);
        }
        setHasMoreSuggestions(false);
      }
    } finally {
      if (searchRef.current === searchQuery) {
        setIsLoading(false);
        setIsMoreLoading(false);
      }
    }
  };

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    searchRef.current = value;

    if (!value.trim()) {
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
    fetchSuggestions(value, 10, false);
  };

  const [recognition, setRecognition] = useState(null);

  const startVoiceRecognition = () => {
    if (recognition) {
      try {
        recognition.stop();
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
      } catch (error) { }
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Your browser does not support voice search");
      return;
    }

    const newRecognition = new SpeechRecognition();

    newRecognition.lang = "en-IN";
    newRecognition.interimResults = false;
    newRecognition.continuous = false;

    newRecognition.onstart = () => {
      setIsListening(true);
    };

    newRecognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setQuery(voiceText);
      handleChange({ target: { value: voiceText } });
      setIsListening(false);
    };

    newRecognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        toast.error("Microphone permission denied");
      } else if (event.error === "no-speech") {
        toast.error("No voice detected");
      } else {
        toast.error("Voice recognition failed");
      }
    };

    newRecognition.onend = () => {
      setIsListening(false);
    };

    try {
      newRecognition.start();
      setIsListening(true);
      setRecognition(newRecognition);
    } catch (error) {
      // Handle error silently or show toast if needed
    }
  };

  const handlePrescriptionSearchCompleted = (resData) => {
    setShowPrescriptionModal(false);
    if (resData && resData.length > 0) {
      const list = resData.map(item => ({
        _id: item._id,
        name: item.name,
        slug: item.slug,
        imageUrl: item.imageUrl,
        files: item.files,
        tablet: {
          _id: item._id,
          name: item.name,
          slug: item.slug,
          imageUrl: item.imageUrl,
          files: item.files,
          form: item.form,
          strength: item.strength,
        },
        selectedVariantId: item.product?._id || null,
      }));

      setFilteredSuggestions(list);
      setShowSuggestions(true);
      setQuery("Prescription search results");
      toast.success(`Found ${resData.length} matching medicines!`);
    } else {
      setFilteredSuggestions([]);
      toast.error("No matching medicines found in your prescription.");
    }
  };

  const handleSelect = (item) => {
    if (!item) return;

    // Navigate directly to package details for package type
    if (item.type === "package" && item.tablet?._id) {
      setShowSuggestions(false);
      setQuery(item.tablet?.name || "");
      window.setTimeout(() => addToSearchHistory(item), 0);
      navigate(`/lab-package/${item.tablet._id}`);
      return;
    }

    setShowSuggestions(false);
    handleProductClick(item);
    setQuery(item.tablet?.name || "");
    window.setTimeout(() => addToSearchHistory(item), 0);
  };

  const handleHistorySelect = (historyItem) => {
    if (typeof historyItem === "object" && historyItem.item) {
      setShowSuggestions(false);
      handleProductClick(historyItem.item);
      setQuery(historyItem.searchTerm || "");
      return;
    }

    const searchTerm =
      typeof historyItem === "string"
        ? historyItem
        : historyItem.searchTerm || "";
    if (searchTerm) {
      setQuery(searchTerm);
      setShowSuggestions(true);
      handleChange({ target: { value: searchTerm } });
    }
  };

  const blogsSettings = {
    dots: true,
    arrows: false,
    infinite: blogss?.length > 3,
    speed: 500,
    slidesToShow: blogss?.length >= 3 ? 3 : blogss?.length || 1,
    slidesToScroll: 1,
    autoplay: blogss?.length > 1,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    centerMode: blogss?.length === 1,
    centerPadding: blogss?.length === 1 ? "300px" : "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: blogss?.length >= 2 ? 2 : 1,
          centerMode: blogss?.length === 1,
          centerPadding: blogss?.length === 1 ? "150px" : "0px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
        },
      },
    ],
  };

  useEffect(() => {
    if (homeLiteMode) {
      AOS.init({ disable: true });
      return;
    }

    AOS.init({
      duration: 800,
      once: true,
      mirror: false,
      offset: 80,
      throttleDelay: 99,
      debounceDelay: 50,
    });
  }, [homeLiteMode]);

  useEffect(() => {
    if (loading || homeLiteMode) return undefined;

    const refreshTimer = setTimeout(() => {
      AOS.refresh();
    }, 150);

    return () => clearTimeout(refreshTimer);
  }, [loading, categories, sections, mediciness, blogss, testimonials, homeLiteMode]);

  const getAllHomeData = async () => {
    const bodyData = {
      type: "website",
      positionType: ["top", "bottom"],
    };

    let apiUrl = "home";
    if (selectedPincode) {
      apiUrl += `?location=${selectedPincode}`;
      if (latitude && longitude) {
        apiUrl += `&lat=${latitude}&lng=${longitude}`;
      }
    }

    try {
      const [homeResponse] = await Promise.all([
        axiosInstance.get(apiUrl, bodyData),
      ]);

      const {
        categories,
        faqs,
        vendor,
        blogs,
        topsalesproductvendor,
        testimonial,
        sections,
      } = homeResponse.data.data;

      setCategories(categories);
      setblogss(blogs);
      setTestimonials(testimonial?.testimonial || []);
      setMediciness(topsalesproductvendor);
      setSections(sections || []);
      if (vendor && vendor.length > 0) {
        const parts = vendor[0];
        setPart1Vendors(parts.part1 || []);
        setPart2Vendors(parts.part2 || []);
      } else {
        setPart1Vendors([]);
        setPart2Vendors([]);
      }
      setFaqs(faqs);

      if (!homeLiteMode) {
        prefetchImageUrls(
          collectHomeImagePaths({
            categories,
            topsalesproductvendor,
            sections,
            blogs,
            vendor,
          }),
          28,
        );
      }

      setLoading(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Something went wrong",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllHomeData();

    const hasSeenModal = localStorage.getItem("hasSeenModal");
    if (!hasSeenModal) {
      setshow(true);
    }
  }, [selectedPincode]);

  useEffect(() => {
    return () => {
      if (recognition) {
        try {
          recognition.stop();
          recognition.onstart = null;
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onend = null;
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [recognition]);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await Promise.all([loadSearchHistory()]);

        setQuery("");
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      } catch (error) {
        setQuery("");
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    };

    initializeComponent();
  }, []);

  useEffect(() => {
    setQuery("");
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchWrapper = document.querySelector(".search-wrapper");
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

  const handleCategoryClick = (item) => {
    navigate(`/${item.slug}`);
  };

  const bestDoctorsSlider = {
    dots: true,
    infinite: true,
    arrows: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const leftSliderSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 20000,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    slidesToShow: 4,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const rightSliderSettings = {
    ...leftSliderSettings,
    rtl: true,
  };

  const handleCompareClick = (item) => {
    const productId =
      item?.tabletdetails?.slug || item?.tablet?.slug || item?.slug || null;

    if (!productId) {
      toast.error("Product ID not found");
      return;
    }
    const tablet = item?.tabletdetails || item?.tablet || item;
    const categorySlug =
      tablet?.category?.slug || tablet?.subcategorys?.category?.slug;
    const subcategorySlug = tablet?.subcategorys?.slug;

    navigate(`/${categorySlug}/${subcategorySlug}/${productId}/compare`);
  };

  const handleCompareDynamic = (item, section) => {
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

    const serviceName =
      section?.serviceId?.slug ||
      sub?.categoryDetails?.slug ||
      sub?.category?.slug ||
      "medicine";

    const subcategory = sub?.slug || "general";

    navigate(`/${serviceName}/${subcategory}/${productSlug}/compare`);
  };

  const handleVendorClick = (vendor) => {
    const vendorId =
      vendor?._id ||
      vendor?.vendorId ||
      vendor?.businessdetails?._id ||
      vendor?.bussinessdetails?._id;
    if (vendorId) {
      sessionStorage.setItem("vendorId", vendorId);
      const name =
        vendor?.businessdetails?.name || vendor?.name || "Vendor Store";
      const vendorSlug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      navigate(`/vendor-profile/${vendorSlug}`);
    }
  };

  const handleProductClick = (product, serviceSlug) => {
    if (propHandleProductClick) {
      return propHandleProductClick(product);
    }

    const navigation = getProductNavigation(product, {
      fallbackService: serviceSlug || "medicine",
      pincode: getMedicinePincodeFromStorage(),
    });

    if (!navigation) {
      toast.error("Product details not available");
      return;
    }

    navigate(navigation.url, { state: navigation.state });
  };

  const renderTestimonialCard = (review) => (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: homeLiteMode
          ? "0 2px 10px rgba(125, 46, 255, 0.08)"
          : "0 4px 20px rgba(125, 46, 255, 0.1)",
        border: "1px solid rgba(125, 46, 255, 0.1)",
        transition: homeLiteMode ? "none" : "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 8px",
          borderRadius: "20px",
          zIndex: 1,
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={
              star <= Number(review.rating) ? "fas fa-star" : "far fa-star"
            }
            style={{
              color: star <= Number(review.rating) ? "#facc15" : "#d1d5db",
              fontSize: "12px",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          marginBottom: "16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "60px",
            height: "60px",
            flexShrink: 0,
          }}
        >
          {Array.isArray(review.image) && review.image.length > 0 ? (
            <img
              src={review.image[0]}
              alt={review.name || "User"}
              loading="lazy"
              decoding="async"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid rgba(125, 46, 255, 0.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8059ca 0%, #3b82f6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              {review.name && review.name.trim().length > 0
                ? review.name.trim()[0]
                : "U"}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h5
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#1e3a8a",
              margin: "0 0 4px 0",
              lineHeight: "1.3",
            }}
          >
            {review.name}
          </h5>
          <p
            style={{
              fontSize: "12px",
              margin: 0,
              color: "#6b7280",
              lineHeight: "1.4",
            }}
          >
            {review?.designation || "Hyderabad, India"}
          </p>
        </div>
      </div>

      <p
        style={{
          fontSize: "14px",
          color: "#4b5563",
          margin: 0,
          lineHeight: "1.6",
          flex: 1,
        }}
      >
        {review?.description || "Excellent service and very smooth experience."}
      </p>
    </div>
  );

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

  return (
    <>
      <SEOHelmet page="home" />
      {loading ? (
        <PageLoader />
      ) : (
        <div
          className={`main-wrapper${homeLiteMode ? " home-lite-page" : ""}`}
          style={{
            overflowX: "hidden",
            overflowY: homeLiteMode ? "visible" : "hidden",
            width: "100%",
            height: homeLiteMode ? "auto" : "100%",
            backgroundColor: isMobile ? "#f9f9f9" : "",
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          <Home2Header />
          <section className="section section-search">
            <div className="container-fluid">
              <div className="banner-wrapper">
                <div className="banner-header text-center aos" data-aos="fade-up">
                  <h1 className="main-headings">
                    Compare & Choose &nbsp;
                    {homeLiteMode ? (
                      <span ref={heroTypeRef}>Medicines</span>
                    ) : (
                      <TypeAnimation
                        sequence={[
                          "Medicines",
                          3000,
                          "Surgeries",
                          3000,
                          "Dental",
                          3000,
                          "Diagnostics",
                          3000,
                          "Lab Prices",
                          3000,
                        ]}
                        wrapper="span"
                        speed={200}
                        repeat={Infinity}
                        cursor={true}
                      />
                    )}
                  </h1>
                  <p style={{ fontSize: "17px" }}>
                    Compare the best healthcare services near you only on
                    MediCompares
                  </p>
                </div>
                <section
                  className="search-section mobileview"
                  style={{
                    zIndex: "9",
                  }}
                >
                  <div
                    className="container-fluid px-3 px-md-4"
                    style={{
                      position: "relative",
                      zIndex: 1,
                      width: "100%",
                      maxWidth: "600px",
                      margin: "0 auto"
                    }}
                  >
                    <div className="row">
                      <div className="col-12">
                        <div
                          style={{
                            position: "relative",
                            zIndex: 1,
                            maxWidth: "600px",
                          }}
                        >
                          <div className="row">
                            <div className="col-12">
                              <div
                                style={{
                                  // margin: "0 5px",
                                  margin: "auto",
                                  position: "relative",
                                  zIndex: 10,
                                }}
                                className="search-wrapper searchhome"
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
                                      display: "flex",
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
                                        if (
                                          !query.trim() &&
                                          searchHistory.length > 0
                                        ) {
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
                                          right: "70px",
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
                                    {/* 
                                <button
                                  type="button"
                                  title="Upload prescription"
                                  onClick={() => setShowPrescriptionModal(true)}
                                  style={{
                                    background: "transparent",
                                    color: "rgb(107, 114, 128)",
                                    border: "1.5px solid rgb(229, 231, 235)",
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
                                    marginRight: "4px",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#7c3aed";
                                    e.currentTarget.style.borderColor = "#7c3aed";
                                    e.currentTarget.style.backgroundColor = "#f5f3ff";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "rgb(107, 114, 128)";
                                    e.currentTarget.style.borderColor = "rgb(229, 231, 235)";
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <i className="fa-solid fa-file-medical" style={{ fontSize: "12px" }}></i>
                                </button> */}

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
                                        transition:
                                          "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
                                          animation: "fadeInUp 0.2s ease-out",
                                        }}
                                      >
                                        {!isLoading &&
                                          !query.trim() &&
                                          searchHistory.length > 0 && (
                                            <>
                                              <div
                                                style={{
                                                  padding: "6px 15px",
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
                                                  style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#ef4444",
                                                    fontSize: "11px",
                                                    cursor: "pointer",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    transition: "all 0.2s ease",
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                      "#fef2f2";
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                      "transparent";
                                                  }}
                                                >
                                                  Clear All
                                                </button>
                                              </div>
                                              {searchHistory.map(
                                                (historyItem, index) => (
                                                  <button
                                                    key={
                                                      typeof historyItem ===
                                                        "object" && historyItem._id
                                                        ? `history-${historyItem._id}`
                                                        : `history-${index}`
                                                    }
                                                    onClick={() =>
                                                      handleHistorySelect(historyItem)
                                                    }
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
                                                        index <
                                                          searchHistory.length - 1
                                                          ? "1px solid #f3f4f6"
                                                          : "none",
                                                      transition:
                                                        "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                      position: "relative",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      e.currentTarget.style.backgroundColor =
                                                        "#f9fafb";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      e.currentTarget.style.backgroundColor =
                                                        "transparent";
                                                    }}
                                                  >
                                                    <img
                                                      src={getImageUrl(
                                                        historyItem?.item?.tablet
                                                          ?.imageUrl?.length > 0
                                                          ? historyItem.item.tablet
                                                            .imageUrl[0]
                                                          : historyItem?.item?.tablet
                                                            ?.files?.length > 0
                                                            ? historyItem.item.tablet
                                                              .files[0]
                                                            : historyItem?.item
                                                              ?.imageUrl?.length >
                                                              0
                                                              ? historyItem.item
                                                                .imageUrl[0]
                                                              : historyItem?.item
                                                                ?.files?.length >
                                                                0
                                                                ? historyItem.item
                                                                  .files[0]
                                                                : historyItem?.tablet
                                                                  ?.imageUrl
                                                                  ?.length > 0
                                                                  ? historyItem.tablet
                                                                    .imageUrl[0]
                                                                  : historyItem
                                                                    ?.tablet
                                                                    ?.files
                                                                    ?.length > 0
                                                                    ? historyItem
                                                                      .tablet
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

                                                    {/* Product Name */}
                                                    <span
                                                      style={{
                                                        flex: 1,
                                                        lineHeight: "1.5",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                      }}
                                                    >
                                                      {typeof historyItem === "string"
                                                        ? historyItem
                                                        : historyItem.searchTerm ||
                                                        "Unknown"}
                                                    </span>

                                                    {/* Medicine Type Badge */}
                                                    {typeof historyItem ===
                                                      "object" &&
                                                      (historyItem?.item?.tablet
                                                        ?.medicineType ||
                                                        historyItem?.item?.tablet
                                                          ?.type ||
                                                        historyItem?.tablet
                                                          ?.medicineType ||
                                                        historyItem?.tablet
                                                          ?.type) && (
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
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteSearchHistoryItem(
                                                          index,
                                                          historyItem,
                                                        );
                                                      }}
                                                      style={{
                                                        background: "none",
                                                        border: "none",
                                                        color: "#ef4444",
                                                        fontSize: "14px",
                                                        cursor: "pointer",
                                                        padding: "4px",
                                                        borderRadius: "4px",
                                                        transition: "all 0.2s ease",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: "24px",
                                                        height: "24px",
                                                        flexShrink: 0,
                                                      }}
                                                      onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor =
                                                          "#fef2f2";
                                                      }}
                                                      onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor =
                                                          "transparent";
                                                      }}
                                                      title="Delete this search"
                                                    >
                                                      <i className="fas fa-times"></i>
                                                    </div>
                                                  </button>
                                                ),
                                              )}
                                            </>
                                          )}

                                        {!isLoading &&
                                          query.trim() &&
                                          filteredSuggestions.map((item, index) => (
                                            <button
                                              key={item._id || item.tablet?._id || index}
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
                                                justifyContent: "space-between",
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
                                              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                <div
                                                  style={{
                                                    color: "#9ca3af",
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  <i className="fas fa-search"></i>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                  <span
                                                    style={{ flex: 1, lineHeight: "1.5", textTransform: "capitalize" }}
                                                  >
                                                    {highlightMatch(
                                                      item.tablet?.name,
                                                      query,
                                                    )}
                                                  </span>

                                                  {item.tablet?.packagingDetails && (
                                                    <span style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                                                      {item?.tablet?.packagingDetails}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
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
                                              fetchSuggestions(query, nextLimit, true);
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
              </div>
            </div>
          </section>

          {categories && categories.length > 0 && (
            <section
              className="specialities-section-one"
              style={{ overflow: "hidden" }}
            >
              <div className="container">
                <div
                  className="row d-none d-lg-block"
                  style={{ marginTop: "0px !important" }}
                >
                  <div className="col-md-12">
                    <div className="section-header-one section-header-slider text-center">
                      <h2
                        style={{
                          marginBottom: "12px",
                          fontSize: "18px",
                          fontWeight: "600",
                        }}
                      >
                        Explore Multiple Categories Compare
                      </h2>
                      <p
                        style={{
                          fontSize: "13px",

                          maxWidth: "700px",
                          margin: "0 auto 20px",
                          lineHeight: "1.6",
                        }}
                      >
                        Browse a wide range of medicines across various categories.
                        Compare prices, read detailed information, and find the best
                        options for your health needs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="row row-cols-7 row-cols-xxl-7 row-cols-xl-6 row-cols-lg-6 rows-cols-md-6 justify-content-center mt-3">
                  {categories.map((item, categoryIndex) => (
                    <div className="col-6 d-flex col-lg-2 col-sm-6" key={item._id}>
                      <div
                        className="serv-wrap medi-bg flex-fill"
                        onClick={() => handleCategoryClick(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <span>
                          <img
                            src={
                              item?.files
                                ? getImageUrl(item.files)
                                : "/assets/default.png"
                            }
                            alt={item.name}
                            title={item.name}
                            style={{ height: "50px" }}
                            loading={categoryIndex < 8 ? "eager" : "lazy"}
                            fetchPriority={categoryIndex < 4 ? "high" : "auto"}
                            decoding="async"
                          />
                        </span>
                        <h4>{item.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <style>
            {`
              @keyframes floatBlob {
                0% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(30px, -50px) rotate(10deg); }
                66% { transform: translate(-20px, 20px) rotate(-5deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }
              @keyframes pulseLight {
                0% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.1); }
                100% { opacity: 0.3; transform: scale(1); }
              }
              @keyframes wobble {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(5deg); }
                50% { transform: rotate(-5deg); }
                75% { transform: rotate(3deg); }
                100% { transform: rotate(0deg); }
              }
              @keyframes driftScale {
                0% { transform: scale(1) translate(0,0); }
                50% { transform: scale(1.1) translate(10px, -10px); }
                100% { transform: scale(1) translate(0,0); }
              }
              .decorative-blob {
                position: absolute;
                filter: blur(50px);
                z-index: 0;
                pointer-events: none;
                opacity: 0.3;
                will-change: transform;
                transform: translateZ(0);
                contain: layout style paint;
              }
              .floating-shape {
                position: absolute;
                z-index: 0;
                pointer-events: none;
                opacity: 0.15;
                will-change: transform;
                transform: translateZ(0);
                contain: layout style paint;
              }
              /* Premium Slider Dots */
              .slick-dots li button:before {
                font-size: 12px;
                color: #d1d5db; /* Gray-300 */
                opacity: 1;
                transition: all 0.3s ease;
              }
              .slick-dots li.slick-active button:before {
                color: #8059ca; /* Indigo-600 (Primary) */
                font-size: 14px;
              }
              .modern-price-tag {
                font-size: 19px;
                font-weight: 700;
                color: #059669; /* Emerald Green */
                line-height: 1.2;
                letter-spacing: -0.5px;
              }
              .old-price-tag {
                font-size: 13px;
                text-decoration: line-through;
                color: #9ca3af;
                font-weight: 400;
                margin-right: 6px;
              }
            `}
          </style>

          {mediciness?.length > 0 && (
            <MedicineSection
              title="Top Most Medicines"
              icon="fas fa-capsules"
              bgColor="rgba(79, 70, 229, 0.12)"
              iconColor="#8059ca"
              medicines={mediciness}
              isMobile={isMobile}
              decorativeElements={
                homeLiteMode
                  ? []
                  : [
                    {
                      className: "floating-shape",
                      style: {
                        top: "10%",
                        left: "5%",
                        fontSize: "40px",
                        color: "#8059ca",
                        animation: "floatBlob 25s infinite",
                      },
                      icon: "fas fa-capsules",
                    },
                    {
                      className: "floating-shape",
                      style: {
                        top: "40%",
                        left: "-2%",
                        fontSize: "24px",
                        color: "#818cf8",
                        animation: "wobble 15s infinite",
                        opacity: 0.1,
                      },
                      icon: "fas fa-pills",
                    },
                    {
                      className: "floating-shape",
                      style: {
                        top: "15%",
                        right: "20%",
                        fontSize: "20px",
                        color: "#8059ca",
                        animation: "driftScale 18s infinite",
                        animationDelay: "2s",
                      },
                      icon: "fas fa-plus",
                    },
                    {
                      className: "floating-shape",
                      style: {
                        bottom: "20%",
                        right: "5%",
                        fontSize: "35px",
                        color: "#6366f1",
                        animation: "floatBlob 22s infinite reverse",
                      },
                      icon: "fas fa-notes-medical",
                    },
                    {
                      className: "floating-shape",
                      style: {
                        bottom: "5%",
                        left: "15%",
                        fontSize: "28px",
                        color: "#8059ca",
                        animation: "wobble 20s infinite",
                        opacity: 0.1,
                      },
                      icon: "fas fa-prescription-bottle",
                    },
                    {
                      className: "floating-shape",
                      style: {
                        top: "50%",
                        right: "40%",
                        fontSize: "18px",
                        color: "#a5b4fc",
                        animation: "driftScale 25s infinite",
                        opacity: 0.15,
                      },
                      icon: "fas fa-tablets",
                    },
                  ]}
              liteMode={homeLiteMode}
              onProductClick={handleProductClick}
              onCompareClick={handleCompareClick}
              onVendorClick={handleVendorClick}
              imgUrl={imgUrl}
            />
          )}
          <DynamicSections
            sections={sections}
            onProductClick={handleProductClick}
            onCompareClick={handleCompareDynamic}
            onVendorClick={handleVendorClick}
            imgUrl={imgUrl}
            liteMode={homeLiteMode}
          />

          {/* PROMOTIONAL BANNER */}
          <section className="my-4 px-3">
            <div className="container-fluid">
              <div
                style={{
                  background: "#9446f3ff",
                  borderRadius: "20px",
                  padding: isMobile ? "30px 20px" : "20px 40px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(128, 89, 202, 0.3)",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: isMobile ? "auto" : "150px",
                  textAlign: isMobile ? "center" : "left",
                  gap: isMobile ? "20px" : "0",
                }}
              >
                {/* Abstract Shapes */}
                <div
                  style={{
                    position: "absolute",
                    top: "-50px",
                    right: "-50px",
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-30px",
                    left: "100px",
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                  }}
                ></div>

                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    color: "white",
                    maxWidth: "600px",
                  }}
                >
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: "6px 16px",
                      borderRadius: "30px",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "inline-block",
                      marginBottom: "15px",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    <i className="fas fa-heartbeat me-2"></i> Complete Healthcare
                  </span>
                  <h2
                    style={{
                      fontSize: isMobile ? "20px" : "24px",
                      fontWeight: "800",
                      marginBottom: "10px",
                      color: "white",
                    }}
                  >
                    Your Trusted Healthcare Partner
                  </h2>
                  <p
                    style={{
                      fontSize: isMobile ? "14px" : "16px",
                      opacity: "0.9",
                      margin: 0,
                      color: "white",
                    }}
                  >
                    Access quality healthcare services, medicines, diagnostics, and
                    expert consultation all in one place.
                  </p>
                </div>

                <div style={{ position: "relative", zIndex: 2 }}>
                  <button
                    className="btn"
                    style={{
                      background: "white",
                      color: "#8059ca",
                      padding: "12px 30px",
                      borderRadius: "50px",
                      fontWeight: "700",
                      fontSize: "13px",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                    onClick={() => {
                      localStorage.setItem("fixedType", "medicine");
                      navigate("/medicine/all");
                    }}
                  >
                    Explore Services <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`py-3 home-bg-pattern-section`}
            style={{
              backgroundColor: "#E8E4F5",
              backgroundImage: homeLiteMode
                ? "none"
                : "url('/assets/Medicompares%20Background.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <style>
              {`
                @keyframes iconShimmer {
                  0% {
                    background-position: -200% center;
                  }
                  100% {
                    background-position: 200% center;
                  }
                }
                @keyframes iconRotate3D {
                  0%, 100% {
                    transform: rotateY(0deg) scale(1);
                  }
                  50% {
                    transform: rotateY(180deg) scale(1.1);
                  }
                }
                @keyframes iconGlowPulse {
                  0%, 100% {
                    box-shadow: 0 0 15px rgba(125, 46, 255, 0.4), 0 0 30px rgba(125, 46, 255, 0.2);
                    transform: scale(1);
                  }
                  50% {
                    box-shadow: 0 0 25px rgba(125, 46, 255, 0.6), 0 0 50px rgba(125, 46, 255, 0.4);
                    transform: scale(1.05);
                  }
                }
                @keyframes iconFloatSmooth {
                  0%, 100% {
                    transform: translateY(0px) rotate(0deg);
                  }
                  33% {
                    transform: translateY(-8px) rotate(2deg);
                  }
                  66% {
                    transform: translateY(-4px) rotate(-2deg);
                  }
                }
                @keyframes rippleEffect {
                  0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 0.8;
                  }
                  100% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                  }
                }
                @keyframes gradientShift {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
                .surgery-benefit-icon {
                  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                  position: relative;
                  overflow: visible;
                }
                .surgery-benefit-icon::before {
                  content: '';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 100%;
                  height: 100%;
                  border-radius: 12px;
                  background: inherit;
                  opacity: 0;
                  z-index: -1;
                  transition: all 0.4s ease;
                }
                .surgery-benefit-card {
                  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                  position: relative;
                }
                .surgery-benefit-card:hover {
                  transform: translateY(-8px) scale(1.02);
                  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
                }
                .surgery-benefit-card:hover .surgery-benefit-icon {
                  transform: scale(1.15) rotate(5deg);
                }
                .surgery-benefit-card:hover .surgery-benefit-icon::before {
                  opacity: 0.3;
                  transform: translate(-50%, -50%) scale(1.5);
                  filter: blur(10px);
                }
                .surgery-benefit-icon-1 {
                  animation: iconFloatSmooth 4s ease-in-out infinite;
                  animation-delay: 0s;
                }
                .surgery-benefit-icon-2 {
                  animation: iconFloatSmooth 4s ease-in-out infinite;
                  animation-delay: 1.3s;
                }
                .surgery-benefit-icon-3 {
                  animation: iconFloatSmooth 4s ease-in-out infinite;
                  animation-delay: 2.6s;
                }
                .surgery-benefit-card:hover .surgery-benefit-icon-1 {
                  animation: iconGlowPulse 1.2s ease-in-out infinite, iconFloatSmooth 4s ease-in-out infinite;
                  background: linear-gradient(135deg, #8059ca 0%, #822BD4 50%, #8059ca 100%);
                  background-size: 200% 200%;
                  animation: iconGlowPulse 1.2s ease-in-out infinite, gradientShift 3s ease infinite;
                }
                .surgery-benefit-card:hover .surgery-benefit-icon-2 {
                  animation: iconRotate3D 2s ease-in-out infinite;
                }
                .surgery-benefit-card:hover .surgery-benefit-icon-3 {
                  animation: iconGlowPulse 1.4s ease-in-out infinite;
                  background: linear-gradient(135deg, #8059ca 0%, #6d48b8 50%, #8059ca 100%);
                  background-size: 200% 200%;
                  animation: iconGlowPulse 1.4s ease-in-out infinite, gradientShift 3s ease infinite;
                }
                .surgery-icon-pulse {
                  animation: rippleEffect 1.5s ease-out infinite;
                }
                .surgery-benefit-card:hover .surgery-icon-pulse {
                  opacity: 1;
                }
                .surgery-benefit-icon i {
                  transition: all 0.3s ease;
                  display: inline-block;
                }
                .surgery-benefit-card:hover .surgery-benefit-icon i {
                  transform: scale(1.2);
                }
              `}
            </style>
            <div className="container">
              <div className="text-center mb-5 aos" data-aos="fade-up">
                <h2
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    display: "inline-block",
                    width: "100%",
                    background: "linear-gradient(135deg, #8059ca 0%, #6d48b8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "#8059ca",
                  }}
                >
                  Explore Surgeries
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    maxWidth: "700px",
                    margin: "0 auto 20px",
                    lineHeight: "1.6",
                  }}
                >
                  Discover a wide range of surgical procedures across various
                  medical specialties. Compare prices, read patient reviews, and
                  find the best surgeons and hospitals near you.
                </p>
                <div
                  className="row g-3 justify-content-center mb-4"
                  style={{ maxWidth: "800px", margin: "0 auto" }}
                >
                  <div className="col-md-4 col-sm-6">
                    <div
                      className="surgery-benefit-card"
                      style={{
                        padding: "16px",
                        background: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        textAlign: "center",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        className="surgery-benefit-icon surgery-benefit-icon-1"
                        style={{
                          width: "50px",
                          height: "50px",
                          margin: "0 auto 12px",
                          background:
                            "linear-gradient(135deg, #8059ca 0%, #6d48b8 100%)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "#fff",
                          position: "relative",
                        }}
                      >
                        <i className="fas fa-search-dollar"></i>
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "rgba(125, 46, 255, 0.1)",
                            zIndex: -1,
                            opacity: 0,
                            transition: "all 0.3s ease",
                          }}
                          className="surgery-icon-pulse"
                        ></div>
                      </div>
                      <h5
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#1f2937",
                          marginBottom: "6px",
                        }}
                      >
                        Compare Prices
                      </h5>
                      <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                        Compare costs across multiple hospitals
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-6">
                    <div
                      className="surgery-benefit-card"
                      style={{
                        padding: "16px",
                        background: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        textAlign: "center",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        className="surgery-benefit-icon surgery-benefit-icon-2"
                        style={{
                          width: "50px",
                          height: "50px",
                          margin: "0 auto 12px",
                          background:
                            "linear-gradient(135deg, #8059ca 0%, #6d48b8 100%)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "#fff",
                          position: "relative",
                        }}
                      >
                        <i className="fas fa-user-md"></i>
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "rgba(128, 89, 202, 0.1)",
                            zIndex: -1,
                            opacity: 0,
                            transition: "all 0.3s ease",
                          }}
                          className="surgery-icon-pulse"
                        ></div>
                      </div>
                      <h5
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#1f2937",
                          marginBottom: "6px",
                        }}
                      >
                        Expert Surgeons
                      </h5>
                      <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                        Find experienced and qualified surgeons
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-6">
                    <div
                      className="surgery-benefit-card"
                      style={{
                        padding: "16px",
                        background: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        textAlign: "center",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        className="surgery-benefit-icon surgery-benefit-icon-3"
                        style={{
                          width: "50px",
                          height: "50px",
                          margin: "0 auto 12px",
                          background:
                            "linear-gradient(135deg, #8059ca 0%, #6d48b8 100%)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "#fff",
                          position: "relative",
                        }}
                      >
                        <i className="fas fa-shield-alt"></i>
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "rgba(128, 89, 202, 0.1)",
                            zIndex: -1,
                            opacity: 0,
                            transition: "all 0.3s ease",
                          }}
                          className="surgery-icon-pulse"
                        ></div>
                      </div>
                      <h5
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#1f2937",
                          marginBottom: "6px",
                        }}
                      >
                        Safe & Reliable
                      </h5>
                      <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                        Trusted hospitals with proven track records
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="py-4"
            style={{
              background:
                "linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f4ff 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <style>
              {`
                @keyframes float {
                  0%, 100% {
                    transform: translateY(0px) rotate(0deg);
                  }
                  50% {
                    transform: translateY(-10px) rotate(3deg);
                  }
                }
                @keyframes pulse {
                  0%, 100% {
                    transform: scale(1);
                    opacity: 0.7;
                  }
                  50% {
                    transform: scale(1.08);
                    opacity: 1;
                  }
                }
                @keyframes slideInUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                @keyframes gradient {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
                @keyframes iconBounce {
                  0%, 100% {
                    transform: translateY(0) scale(1);
                  }
                  50% {
                    transform: translateY(-8px) scale(1.05);
                  }
                }
                @keyframes glow {
                  0%, 100% {
                    box-shadow: 0 0 15px rgba(125, 46, 255, 0.3);
                  }
                  50% {
                    box-shadow: 0 0 25px rgba(125, 46, 255, 0.5);
                  }
                }
                .quick-access-card {
                  animation: slideInUp 0.5s ease-out both;
                }
                .quick-access-icon-wrapper {
                  position: relative;
                }
                .quick-access-icon-wrapper::before {
                  content: '';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 70px;
                  height: 70px;
                  border-radius: 50%;
                  background: rgba(125, 46, 255, 0.08);
                  animation: pulse 2.5s ease-in-out infinite;
                }
                .quick-access-card:hover .quick-access-icon-wrapper::before {
                  animation: pulse 1.2s ease-in-out infinite;
                  width: 75px;
                  height: 75px;
                }
                .quick-access-card:hover .quick-access-icon {
                  animation: iconBounce 0.5s ease-in-out;
                }
                .quick-access-bg-shape {
                  position: absolute;
                  border-radius: 50%;
                  opacity: 0.06;
                  animation: float 12s ease-in-out infinite;
                }
                .quick-access-bg-shape-1 {
                  width: 150px;
                  height: 150px;
                  background: linear-gradient(135deg, #8059ca, #3b82f6);
                  top: -50px;
                  right: -50px;
                  animation-delay: 0s;
                }
                .quick-access-bg-shape-2 {
                  width: 120px;
                  height: 120px;
                  background: linear-gradient(135deg, #3b82f6, #059669);
                  bottom: -40px;
                  left: -40px;
                  animation-delay: 4s;
                }
                .quick-access-card::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                  transition: left 0.5s ease;
                }
                .quick-access-card:hover::after {
                  left: 100%;
                }
              `}
            </style>
            <div className="quick-access-bg-shape quick-access-bg-shape-1"></div>
            <div className="quick-access-bg-shape quick-access-bg-shape-2"></div>
            <div className="container" style={{ position: "relative", zIndex: 2 }}>
              <div className="row align-items-center g-4">
                <div className="col-lg-5 col-md-12 aos" data-aos="fade-right">
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 20px",
                        background:
                          "linear-gradient(135deg, rgba(128, 89, 202, 0.2) 0%, rgba(109, 72, 184, 0.2) 100%)",
                        borderRadius: "50px",
                        marginBottom: "10px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#8059ca",
                      }}
                    >
                      <i
                        className="fas fa-clock"
                        style={{ marginRight: "8px", color: "#8059ca" }}
                      ></i>
                      Instant Healthcare Access
                    </div>
                    <h2
                      style={{
                        fontSize: "42px",

                        color: "#1a1a1a",
                        marginBottom: "10px",
                        letterSpacing: "-1px",
                        lineHeight: "1.2",
                      }}
                    >
                      Quick Access to{" "}
                      <span
                        style={{
                          background:
                            "linear-gradient(135deg, #8059ca 0%, #3b82f6 50%, #059669 100%)",
                          backgroundSize: "200% 200%",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          animation: "gradient 3s ease infinite",
                        }}
                      >
                        Healthcare Services
                      </span>
                    </h2>
                    <p
                      style={{
                        color: "#4b5563",
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "1.7",
                      }}
                    >
                      Get instant access to Dental, lab tests, and emergency
                      ambulance services. Compare prices, book appointments, and
                      find the best healthcare providers near you all in one place.
                    </p>

                    <div>
                      {[
                        {
                          icon: "fas fa-check-circle",
                          text: "Compare prices across multiple providers",
                        },
                        {
                          icon: "fas fa-check-circle",
                          text: "Book appointments instantly online",
                        },
                        {
                          icon: "fas fa-check-circle",
                          text: "24/7 emergency services available",
                        },
                      ].map((feature, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "14px",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background:
                                "linear-gradient(135deg, #8059ca 0%, #6d48b8 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "14px",
                              flexShrink: 0,
                            }}
                          >
                            <i
                              className={feature.icon}
                              style={{ color: "#fff", fontSize: "14px" }}
                            ></i>
                          </div>
                          <span
                            style={{
                              color: "#374151",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        flexWrap: "wrap",
                        padding: "12px",
                        background:
                          "linear-gradient(135deg, rgba(125, 46, 255, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)",
                        borderRadius: "16px",
                        border: "1px solid rgba(125, 46, 255, 0.1)",
                      }}
                    >
                      {/* Hospitals */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <i
                          className="fa fa-hospital"
                          style={{ fontSize: "32px", color: "#8059ca" }}
                        ></i>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            lineHeight: "1.2",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "28px",
                              background:
                                "linear-gradient(135deg, #8059ca 0%, #3b82f6 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                              fontWeight: "700",
                            }}
                          >
                            500+
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: "700" }}>
                            Hospitals
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <i
                          className="fa fa-smile"
                          style={{ fontSize: "32px", color: "#3b82f6" }}
                        ></i>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            lineHeight: "1.2",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "28px",
                              background:
                                "linear-gradient(135deg, #3b82f6 0%, #059669 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                              fontWeight: "700",
                            }}
                          >
                            10K+
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: "700" }}>
                            Happy Patients
                          </span>
                        </div>
                      </div>

                      {/* Support */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <i
                          className="fa fa-headset"
                          style={{ fontSize: "32px", color: "#059669" }}
                        ></i>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            lineHeight: "1.2",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "28px",
                              background:
                                "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                              fontWeight: "700",
                            }}
                          >
                            24/7
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: "700" }}>
                            Support
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-7 col-md-12">
                  <div className="row g-4">
                    {[
                      {
                        id: 1,
                        title: "Dental",
                        description:
                          "Find the best dental care options and compare prices",
                        icon: "fas fa-tooth",
                        gradient:
                          "linear-gradient(135deg, #8059ca 0%, #822BD4 100%)",
                        hoverGradient:
                          "linear-gradient(135deg, #822BD4 0%, #8059ca 100%)",
                        shadowColor: "rgba(125, 46, 255, 0.25)",
                        topBarGradient:
                          "linear-gradient(90deg, #8059ca, #3b82f6, #822BD4)",
                        link: "/dentalservice",
                      },
                      {
                        id: 2,
                        title: "Lab Tests",
                        description:
                          "Book lab tests online and get results quickly",
                        icon: "fas fa-vial",
                        gradient:
                          "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                        hoverGradient:
                          "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                        shadowColor: "rgba(59, 130, 246, 0.25)",
                        topBarGradient:
                          "linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)",
                        link: "/labtests",
                      },
                      {
                        id: 3,
                        title: "Ambulance",
                        description: "Emergency ambulance services available 24/7",
                        icon: "fas fa-ambulance",
                        gradient:
                          "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                        hoverGradient:
                          "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        shadowColor: "rgba(220, 38, 38, 0.25)",
                        topBarGradient:
                          "linear-gradient(90deg, #dc2626, #ef4444, #f87171)",
                        link: "/ambulanceservice",
                      },
                    ].map((item, index) => (
                      <div key={item.id} className="col-md-12">
                        <div
                          className="quick-access-card aos"
                          data-aos="fade-up"
                          data-aos-delay={index * 100}
                          onClick={() => navigate(item.link)}
                          style={{
                            padding: "12px",
                            borderRadius: "14px",
                            background: "#ffffff",
                            border: "2px solid transparent",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 3px 15px rgba(0, 0, 0, 0.08)",
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            animationDelay: `${index * 0.1}s`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-8px) scale(1.02)";
                            e.currentTarget.style.boxShadow = `0 12px 40px ${item.shadowColor}`;
                            e.currentTarget.style.borderColor =
                              item.gradient.includes("#8059ca")
                                ? "#8059ca"
                                : item.gradient.includes("#3b82f6")
                                  ? "#3b82f6"
                                  : "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(0) scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 3px 15px rgba(0, 0, 0, 0.08)";
                            e.currentTarget.style.borderColor = "transparent";
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: "3px",
                              background: item.topBarGradient,
                              transform: "scaleX(0)",
                              transformOrigin: "left",
                              transition: "transform 0.4s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scaleX(1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scaleX(0)";
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                            }}
                          >
                            <div
                              className="quick-access-icon-wrapper"
                              style={{
                                position: "relative",
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            >
                              <div
                                className="quick-access-icon"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  background: item.gradient,
                                  borderRadius: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "24px",
                                  color: "#fff",
                                  position: "relative",
                                  zIndex: 1,
                                  boxShadow: `0 6px 20px ${item.shadowColor}`,
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <i className={item.icon}></i>
                              </div>
                            </div>
                            <div style={{ flex: 1, textAlign: "left" }}>
                              <h4
                                style={{
                                  fontSize: "18px",
                                  fontWeight: "700",
                                  marginBottom: "6px",
                                  color: "#1f2937",
                                  lineHeight: "1.3",
                                }}
                              >
                                {item.title}
                              </h4>
                              <p
                                style={{
                                  color: "#6b7280",
                                  fontSize: "13px",
                                  lineHeight: "1.5",
                                  margin: 0,
                                  marginBottom: "8px",
                                }}
                              >
                                {item.description}
                              </p>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  color: item.gradient.includes("#8059ca")
                                    ? "#8059ca"
                                    : item.gradient.includes("#3b82f6")
                                      ? "#3b82f6"
                                      : "#dc2626",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateX(4px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "translateX(0)";
                                }}
                              >
                                <span>Explore</span>
                                <i className="fas fa-arrow-right"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="work-section">
            <div className="container">
              <div className="row">
                <div
                  className="col-lg-4 col-md-12 work-img-info aos"
                  data-aos="fade-up"
                >
                  <div className="work-img">
                    <img
                      src="/assets/img/work-img.png"
                      className="img-fluid"
                      alt="doctor-image"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="col-lg-8 col-md-12 work-details">
                  <div className="section-header-one aos" data-aos="fade-up">
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 20px",
                        background:
                          "linear-gradient(135deg, rgba(234, 88, 12, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)",
                        borderRadius: "50px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#ea580c",
                      }}
                      className="mb-2"
                    >
                      <i
                        className="fas fa-info-circle"
                        style={{ marginRight: "8px" }}
                      ></i>
                      How it Works
                    </div>
                    <br />
                    <h2
                      style={{
                        fontSize: "36px",

                        marginBottom: "12px",
                      }}
                    >
                      4 easy steps to get your solution
                    </h2>
                  </div>
                  <div className="row g-4">
                    <div className="col-lg-6 col-md-6 aos" data-aos="fade-up">
                      <div className="work-info">
                        <div className="work-icon">
                          <span>
                            <img
                              src="/assets/img/icons/searchubg.png"
                              alt="search-doctor-icon"
                              loading="lazy"
                            />
                          </span>
                        </div>
                        <div className="work-content">
                          <h5>Search Medicines</h5>
                          <p style={{ fontSize: "14px" }}>
                            Search for medicines by name, category, or health
                            condition.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 aos" data-aos="fade-up">
                      <div className="work-info">
                        <div className="work-icon">
                          <span>
                            <img
                              src="/assets/img/icons/first-aid-kit.png"
                              alt="doctor-profile-icon"
                              loading="lazy"
                            />
                          </span>
                        </div>
                        <div className="work-content">
                          <h5>Check Medicine Details</h5>
                          <p style={{ fontSize: "14px" }}>
                            View detailed information about the medicine including
                            brand, composition, and alternatives.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 aos" data-aos="fade-up">
                      <div className="work-info">
                        <div className="work-icon">
                          <span>
                            <img
                              src="/assets/img/icons/price-comparison.png"
                              alt="calendar-icon"
                              loading="lazy"
                            />
                          </span>
                        </div>
                        <div className="work-content">
                          <h5>Compare Prices</h5>
                          <p style={{ fontSize: "14px" }}>
                            Compare prices from multiple pharmacies and choose the
                            best deal.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 aos" data-aos="fade-up">
                      <div className="work-info">
                        <div className="work-icon">
                          <span>
                            <img
                              src="/assets/img/icons/doctor-consultation.png"
                              alt="solution-icon"
                              loading="lazy"
                            />
                          </span>
                        </div>
                        <div className="work-content">
                          <h5>Get Your Solution</h5>
                          <p style={{ fontSize: "14px" }}>
                            Select the pharmacy, place your order, and get your
                            medicines at the best price.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="features-section"
            style={{
              padding: "50px 0",
              background:
                "linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <style>
              {`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-15px) rotate(5deg);
              }
            }
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                opacity: 0.8;
              }
              50% {
                transform: scale(1.1);
                opacity: 1;
              }
            }
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes gradient {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
            @keyframes iconBounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-8px);
              }
            }
            .feature-card-animated {
              animation: slideInUp 0.6s ease-out both;
            }
            .feature-icon-wrapper {
              position: relative;
            }
            .feature-icon-wrapper::before {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 65px;
              height: 65px;
              border-radius: 50%;
              background: rgba(125, 46, 255, 0.1);
              animation: pulse 2s ease-in-out infinite;
            }
            .feature-card:hover .feature-icon-wrapper::before {
              animation: pulse 1s ease-in-out infinite;
            }
            .feature-card:hover .feature-icon {
              animation: iconBounce 0.6s ease-in-out;
            }
            .gradient-bg-shape {
              position: absolute;
              border-radius: 50%;
              opacity: 0.1;
              animation: float 8s ease-in-out infinite;
            }
            .gradient-bg-shape-1 {
              width: 200px;
              height: 200px;
              background: linear-gradient(135deg, #8059ca, #3b82f6);
              top: -60px;
              right: -60px;
              animation-delay: 0s;
            }
            .gradient-bg-shape-2 {
              width: 180px;
              height: 180px;
              background: linear-gradient(135deg, #3b82f6, #059669);
              bottom: -50px;
              left: -50px;
              animation-delay: 2s;
            }
          `}
            </style>
            <div className="gradient-bg-shape gradient-bg-shape-1"></div>
            <div className="gradient-bg-shape gradient-bg-shape-2"></div>
            <div className="container" style={{ position: "relative", zIndex: 2 }}>
              <div className="row">
                <div className="col-md-12 aos" data-aos="fade-up">
                  <div className="section-header-one section-header-slider text-center">
                    <h2
                      style={{
                        fontSize: "36px",

                        marginBottom: "12px",
                      }}
                    >
                      Key Features & Benefits
                    </h2>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        marginTop: "8px",
                        maxWidth: "600px",
                        margin: "8px auto 0",
                        fontWeight: "400",
                      }}
                    >
                      Compare prices from 500+ pharmacies, get 100% genuine
                      medicines, find cheaper alternatives, set price alerts, enjoy
                      fast delivery, and receive expert support 24/7.
                    </p>
                  </div>
                </div>
              </div>
              <div className="row g-3 mt-1">
                <div className="col-lg-4 col-md-6">
                  <div
                    className="feature-card feature-card-animated aos"
                    data-aos="fade-up"
                    style={{
                      textAlign: "center",
                      padding: "20px 18px",
                      borderRadius: "12px",
                      background: "#ffffff",
                      border: "2px solid transparent",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                      position: "relative",
                      overflow: "hidden",
                      height: "100%",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(125, 46, 255, 0.2)";
                      e.currentTarget.style.borderColor = "#8059ca";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background:
                          "linear-gradient(90deg, #8059ca, #3b82f6, #059669)",
                        transform: "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.4s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scaleX(1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scaleX(0)";
                      }}
                    />
                    <div
                      className="feature-icon-wrapper"
                      style={{
                        marginBottom: "14px",
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <div
                        className="feature-icon"
                        style={{
                          width: "55px",
                          height: "55px",
                          margin: "0 auto",
                          background:
                            "linear-gradient(135deg, #8059ca 0%, #6d48b8 100%)",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          color: "#fff",
                          position: "relative",
                          zIndex: 1,
                          boxShadow: "0 6px 20px rgba(125, 46, 255, 0.3)",
                        }}
                      >
                        <i className="fas fa-search-dollar"></i>
                      </div>
                    </div>
                    <h4
                      style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "#1f2937",
                        lineHeight: "1.3",
                      }}
                    >
                      Price Comparison
                    </h4>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        margin: 0,
                      }}
                    >
                      Compare prices from 500+ pharmacies instantly. Find the best
                      deals and save up to 40% on your medicine bills.
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div
                    className="feature-card feature-card-animated aos"
                    data-aos="fade-up"
                    data-aos-delay="100"
                    style={{
                      textAlign: "center",
                      padding: "32px 24px",
                      borderRadius: "16px",
                      background: "#ffffff",
                      border: "2px solid transparent",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                      position: "relative",
                      overflow: "hidden",
                      height: "100%",
                      animationDelay: "0.1s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(5, 150, 105, 0.2)";
                      e.currentTarget.style.borderColor = "#059669";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background:
                          "linear-gradient(90deg, #059669, #10b981, #34d399)",
                        transform: "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.4s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scaleX(1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scaleX(0)";
                      }}
                    />
                    <div
                      className="feature-icon-wrapper"
                      style={{
                        marginBottom: "14px",
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <div
                        className="feature-icon"
                        style={{
                          width: "55px",
                          height: "55px",
                          margin: "0 auto",
                          background:
                            "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          color: "#fff",
                          position: "relative",
                          zIndex: 1,
                          boxShadow: "0 6px 20px rgba(5, 150, 105, 0.3)",
                        }}
                      >
                        <i className="fas fa-shield-alt"></i>
                      </div>
                    </div>
                    <h4
                      style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "#1f2937",
                        lineHeight: "1.3",
                      }}
                    >
                      100% Genuine
                    </h4>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        margin: 0,
                      }}
                    >
                      All medicines are verified and sourced from licensed
                      pharmacies. Your health and safety is our top priority.
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div
                    className="feature-card feature-card-animated aos"
                    data-aos="fade-up"
                    data-aos-delay="200"
                    style={{
                      textAlign: "center",
                      padding: "32px 24px",
                      borderRadius: "16px",
                      background: "#ffffff",
                      border: "2px solid transparent",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                      position: "relative",
                      overflow: "hidden",
                      height: "100%",
                      animationDelay: "0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(125, 46, 255, 0.2)";
                      e.currentTarget.style.borderColor = "#8059ca";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background:
                          "linear-gradient(90deg, #8059ca, #3b82f6, #822BD4)",
                        transform: "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.4s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scaleX(1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scaleX(0)";
                      }}
                    />
                    <div
                      className="feature-icon-wrapper"
                      style={{
                        marginBottom: "14px",
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <div
                        className="feature-icon"
                        style={{
                          width: "55px",
                          height: "55px",
                          margin: "0 auto",
                          background:
                            "linear-gradient(135deg, #8059ca 0%, #6d48b8 100%)",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          color: "#fff",
                          position: "relative",
                          zIndex: 1,
                          boxShadow: "0 6px 20px rgba(125, 46, 255, 0.3)",
                        }}
                      >
                        <i className="fas fa-exchange-alt"></i>
                      </div>
                    </div>
                    <h4
                      style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "#1f2937",
                        lineHeight: "1.3",
                      }}
                    >
                      Find Alternatives
                    </h4>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        margin: 0,
                      }}
                    >
                      Discover cheaper alternatives with the same composition. Get
                      detailed information about substitutes and save more.
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div
                    className="feature-card feature-card-animated aos"
                    data-aos="fade-up"
                    data-aos-delay="300"
                    style={{
                      textAlign: "center",
                      padding: "32px 24px",
                      borderRadius: "16px",
                      background: "#ffffff",
                      border: "2px solid transparent",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                      position: "relative",
                      overflow: "hidden",
                      height: "100%",
                      animationDelay: "0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(220, 38, 38, 0.2)";
                      e.currentTarget.style.borderColor = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background:
                          "linear-gradient(90deg, #dc2626, #ef4444, #f87171)",
                        transform: "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.4s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scaleX(1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scaleX(0)";
                      }}
                    />
                    <div
                      className="feature-icon-wrapper"
                      style={{
                        marginBottom: "14px",
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <div
                        className="feature-icon"
                        style={{
                          width: "55px",
                          height: "55px",
                          margin: "0 auto",
                          background:
                            "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          color: "#fff",
                          position: "relative",
                          zIndex: 1,
                          boxShadow: "0 6px 20px rgba(220, 38, 38, 0.3)",
                        }}
                      >
                        <i className="fas fa-bell"></i>
                      </div>
                    </div>
                    <h4
                      style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "#1f2937",
                        lineHeight: "1.3",
                      }}
                    >
                      Price Alerts
                    </h4>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        margin: 0,
                      }}
                    >
                      Set price alerts for your regular medicines and get notified
                      when prices drop. Never miss a great deal again.
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div
                    className="feature-card feature-card-animated aos"
                    data-aos="fade-up"
                    data-aos-delay="400"
                    style={{
                      textAlign: "center",
                      padding: "32px 24px",
                      borderRadius: "16px",
                      background: "#ffffff",
                      border: "2px solid transparent",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                      position: "relative",
                      overflow: "hidden",
                      height: "100%",
                      animationDelay: "0.4s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(59, 130, 246, 0.2)";
                      e.currentTarget.style.borderColor = "#3b82f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background:
                          "linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)",
                        transform: "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.4s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scaleX(1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scaleX(0)";
                      }}
                    />
                    <div
                      className="feature-icon-wrapper"
                      style={{
                        marginBottom: "14px",
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <div
                        className="feature-icon"
                        style={{
                          width: "55px",
                          height: "55px",
                          margin: "0 auto",
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          color: "#fff",
                          position: "relative",
                          zIndex: 1,
                          boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        <i className="fas fa-truck"></i>
                      </div>
                    </div>
                    <h4
                      style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "#1f2937",
                        lineHeight: "1.3",
                      }}
                    >
                      Fast Delivery
                    </h4>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        margin: 0,
                      }}
                    >
                      Choose from home delivery or store pickup. Get your medicines
                      delivered to your doorstep quickly and safely.
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div
                    className="feature-card feature-card-animated aos"
                    data-aos="fade-up"
                    data-aos-delay="500"
                    style={{
                      textAlign: "center",
                      padding: "20px 18px",
                      borderRadius: "12px",
                      background: "#ffffff",
                      border: "2px solid transparent",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                      position: "relative",
                      overflow: "hidden",
                      height: "100%",
                      animationDelay: "0.5s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(5, 150, 105, 0.2)";
                      e.currentTarget.style.borderColor = "#059669";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background:
                          "linear-gradient(90deg, #059669, #10b981, #34d399)",
                        transform: "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.4s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scaleX(1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scaleX(0)";
                      }}
                    />
                    <div
                      className="feature-icon-wrapper"
                      style={{
                        marginBottom: "14px",
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <div
                        className="feature-icon"
                        style={{
                          width: "55px",
                          height: "55px",
                          margin: "0 auto",
                          background:
                            "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          color: "#fff",
                          position: "relative",
                          zIndex: 1,
                          boxShadow: "0 6px 20px rgba(5, 150, 105, 0.3)",
                        }}
                      >
                        <i className="fas fa-user-md"></i>
                      </div>
                    </div>
                    <h4
                      style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "#1f2937",
                        lineHeight: "1.3",
                      }}
                    >
                      Expert Support
                    </h4>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        margin: 0,
                      }}
                    >
                      Get expert guidance on medicines, alternatives, and health
                      tips. Our support team is available 24/7 to help you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="price-showcase-section"
            style={{
              padding: "40px 0",
              background: "linear-gradient(135deg, #8059ca 0%, #822BD4 100%)",
              color: "#fff",
            }}
          >
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-6 mb-4 mb-lg-0">
                  <div className="showcase-content aos" data-aos="fade-right">
                    <h2
                      style={{
                        fontSize: "42px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                        color: "#fff",
                      }}
                    >
                      See How Much You Can Save
                    </h2>
                    <p
                      style={{
                        fontSize: "18px",
                        lineHeight: "1.8",
                        marginBottom: "30px",
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      Compare prices across multiple pharmacies and find the best
                      deals. Our users save an average of 25-40% on their medicine
                      bills every month.
                    </p>
                    <div className="savings-stats d-flex gap-4 mb-4">
                      <div>
                        <h3
                          style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            margin: 0,
                            color: "#04BD6C",
                          }}
                        >
                          ₹2Cr+
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.8)",
                          }}
                        >
                          Total Savings
                        </p>
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            margin: 0,
                            color: "#04BD6C",
                          }}
                        >
                          25-40%
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.8)",
                          }}
                        >
                          Average Savings
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/medicine/all"
                      className="btn btn-light btn-lg"
                      style={{
                        padding: "15px 40px",
                        borderRadius: "50px",
                        fontWeight: "600",
                        fontSize: "16px",
                        textDecoration: "none",
                        display: "inline-block",
                        transition: "all 0.3s",
                      }}
                    >
                      Start Comparing Now{" "}
                      <i className="fas fa-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div
                    className="price-comparison-card aos"
                    data-aos="fade-left"
                    style={{
                      background: "#fff",
                      borderRadius: "20px",
                      padding: "30px",
                      border: "2px solid #e9ecef",
                    }}
                  >
                    <h4
                      style={{
                        color: "#2c3e50",
                        marginBottom: "25px",
                        fontSize: "22px",
                        fontWeight: "600",
                      }}
                    >
                      Example: Paracetamol 500mg
                    </h4>
                    <div
                      className="price-comparison-item mb-3"
                      style={{
                        padding: "15px",
                        background: "#f8f9fa",
                        borderRadius: "10px",
                        border: "2px solid #e9ecef",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6
                            style={{
                              margin: 0,
                              color: "#495057",
                              fontSize: "16px",
                              fontWeight: "600",
                            }}
                          >
                            Pharmacy A
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              color: "#6c757d",
                              fontSize: "14px",
                            }}
                          >
                            2.5 km away
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#495057",
                            }}
                          >
                            ₹45
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="price-comparison-item mb-3"
                      style={{
                        padding: "15px",
                        background:
                          "linear-gradient(135deg, #04BD6C 0%, #05a85c 100%)",
                        borderRadius: "10px",
                        border: "2px solid #04BD6C",
                        position: "relative",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6
                            style={{
                              margin: 0,
                              color: "#fff",
                              fontSize: "16px",
                              fontWeight: "600",
                            }}
                          >
                            Pharmacy B (Best Deal)
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              color: "rgba(255,255,255,0.9)",
                              fontSize: "14px",
                            }}
                          >
                            1.8 km away
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#fff",
                            }}
                          >
                            ₹32
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          top: "-10px",
                          right: "15px",
                          background: "#FFA726",
                          color: "#fff",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        Save 29%
                      </div>
                    </div>
                    <div
                      className="price-comparison-item"
                      style={{
                        padding: "15px",
                        background: "#f8f9fa",
                        borderRadius: "10px",
                        border: "2px solid #e9ecef",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6
                            style={{
                              margin: 0,
                              color: "#495057",
                              fontSize: "16px",
                              fontWeight: "600",
                            }}
                          >
                            Pharmacy C
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              color: "#6c757d",
                              fontSize: "14px",
                            }}
                          >
                            3.2 km away
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#495057",
                            }}
                          >
                            ₹50
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="total-savings mt-4 text-center"
                      style={{
                        padding: "20px",
                        background:
                          "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                        borderRadius: "15px",
                      }}
                    >
                      <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
                        You Save
                      </p>
                      <h3
                        style={{
                          margin: "5px 0 0",
                          color: "#04BD6C",
                          fontSize: "36px",
                          fontWeight: "bold",
                        }}
                      >
                        ₹13 per strip
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {testimonials && testimonials.length > 0 && (
            <section
              className="home-deferred-section py-5"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div className="container">
                <div
                  className="section-header sec-header-one text-center aos"
                  data-aos="fade-up"
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 20px",
                      background:
                        "linear-gradient(135deg, rgba(125, 46, 255, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
                      borderRadius: "50px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#8059ca",
                    }}
                    className="mb-2"
                  >
                    <i className="fas fa-bolt" style={{ marginRight: "8px" }}></i>
                    Reviews
                  </div>
                  <h2>What Our Users Say</h2>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginTop: "8px",
                      maxWidth: "600px",
                      margin: "8px auto 0",
                      fontWeight: "400",
                    }}
                  >
                    Read what our satisfied customers have to say about our
                    services, doctors, and platform. Real reviews from real users
                    who have experienced the benefits of our medical comparison
                    platform.
                  </p>
                </div>

                <div className="row g-4 aos" data-aos="fade-up">
                  {homeLiteMode ? (
                    <div className="row g-3">
                      {testimonials.slice(0, 3).map((review) => (
                        <div key={review._id} className="col-lg-4 col-md-6">
                          {renderTestimonialCard(review)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Slider {...bestDoctorsSlider}>
                      {testimonials.map((review) => (
                        <div key={review._id} className="col-lg-4 col-md-6 px-1">
                          {renderTestimonialCard(review)}
                        </div>
                      ))}
                    </Slider>
                  )}
                </div>
              </div>
            </section>
          )}

          {faqss && faqss.length > 0 && (
            <section className="faq-section mt-4 home-deferred-section">
              <div className="container">
                <div className="row">
                  <div className="col-md-12 ">
                    <div
                      className="section-header-one text-center"
                      data-aos="fade-up"
                    >
                      <div
                        style={{
                          display: "inline-block",
                          padding: "8px 20px",
                          background:
                            "linear-gradient(135deg, rgba(128, 89, 202, 0.2) 0%, rgba(109, 72, 184, 0.2) 100%)",
                          borderRadius: "50px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#8059ca",
                        }}
                        className="mb-2"
                      >
                        <i
                          className="fas fa-question-circle"
                          style={{ marginRight: "8px", color: "#8059ca" }}
                        ></i>
                        Get Your Answer
                      </div>
                      <h2
                        style={{
                          fontSize: "36px",
                          marginBottom: "12px",
                        }}
                      >
                        Frequently Asked Questions
                      </h2>
                      <p
                        style={{
                          color: "#6b7280",
                          fontSize: "14px",
                          marginTop: "8px",
                          maxWidth: "600px",
                          margin: "8px auto 0",
                          fontWeight: "400",
                        }}
                      >
                        Find the best medicine prices, ensure authenticity with
                        verified products, explore cost-effective alternatives, get
                        price alerts, enjoy quick delivery, and access expert
                        assistance anytime.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row align-items-center">
                  <div
                    className="col-lg-6 col-md-12 aos d-none d-lg-block"
                    data-aos="fade-up"
                  >
                    <div className="faq-img">
                      <img
                        src="/assets/Medicomapres FAQ (2).png"
                        className="img-fluid"
                        alt="img"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="faq-info aos" data-aos="fade-up">
                      <div className="accordion" id="faq-details">
                        {faqss.map((faq, index) => {
                          const isOpen = openIndex === index;

                          return (
                            <div className="accordion-item" key={index}>
                              <h2 className="accordion-header">
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion(index)}
                                  aria-expanded={isOpen}
                                  className={`accordion-button faq-toggle-btn ${!isOpen ? "collapsed" : ""
                                    }`}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    gap: "12px",
                                  }}
                                >
                                  <span style={{ flex: 1, textAlign: "left" }}>
                                    {faq.question}
                                  </span>
                                  <i
                                    className={`fas ${isOpen ? "fa-minus" : "fa-plus"}`}
                                    style={{
                                      flexShrink: 0,
                                      fontSize: "12px",
                                      color: isOpen ? "#ffffff" : "#8059ca",
                                      background: isOpen ? "#8059ca" : "#ffffff",
                                      width: "25px",
                                      height: "25px",
                                      borderRadius: "4px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                    aria-hidden="true"
                                  />
                                </button>
                              </h2>

                              <div
                                className={`accordion-collapse collapse ${isOpen ? "show" : ""
                                  }`}
                              >
                                <div className="accordion-body">
                                  <div className="accordion-content">
                                    <p>{faq.answer}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {blogss && blogss.length > 0 && (
            <section
              className="py-4 mb-2 home-deferred-section home-bg-pattern-section"
              style={{
                backgroundColor: "#E8E4F5",
                backgroundImage: homeLiteMode
                  ? "none"
                  : "url('/assets/Medicompares%20Background.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="container">
                <div
                  className="d-flex align-items-center justify-content-center flex-wrap gap-3 mb-3 aos"
                  data-aos="fade-up"
                >
                  <div
                    className="section-header-one text-center"
                    data-aos="fade-up"
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 20px",
                        background:
                          "linear-gradient(135deg, rgba(128, 89, 202, 0.2) 0%, rgba(109, 72, 184, 0.2) 100%)",
                        borderRadius: "50px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#8059ca",
                      }}
                      className="mb-2"
                    >
                      <i
                        className="fas fa-bolt"
                        style={{ marginRight: "8px", color: "#8059ca" }}
                      ></i>
                      Our Blogs
                    </div>
                    <h2
                      style={{
                        fontSize: "36px",
                        fontWeight: "700",
                        marginBottom: "12px",
                        display: "inline-block",
                        width: "100%",
                        background: "linear-gradient(135deg, #8059ca 0%, #6d48b8 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        color: "#8059ca",
                      }}
                    >
                      Insights and Tips on Medicines
                    </h2>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        marginTop: "8px",
                        maxWidth: "600px",
                        margin: "8px auto 0",
                        fontWeight: "400",
                      }}
                    >
                      Stay informed with our latest blog posts on medicine pricing,
                      authentic products, cost-effective alternatives, and health
                      tips. Learn how to save on medicines while ensuring quality
                      and safety.
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() => navigate("/blogs")}
                        className="btn btn-sm"
                        style={{
                          borderRadius: "30px",
                          background: "#8059ca",
                          color: "#fff",
                          padding: "8px 20px",
                          fontWeight: "600",
                          boxShadow: "0 4px 10px rgba(128, 89, 202, 0.3)",
                          border: "none",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        View All Blogs <i className="fas fa-arrow-right ms-2" />
                      </button>
                    </div>
                  </div>
                </div>
                {homeLiteMode ? (
                  <div className="row g-3">
                    {blogss.slice(0, 3).map((blog, index) => {
                      const BLOG_DESC_LIMIT = 120;
                      const plainDescription = (blog.description || "")
                        .replace(/<[^>]*>/g, "")
                        .trim();
                      const isLongDescription =
                        plainDescription.length > BLOG_DESC_LIMIT;
                      const shortDescription = isLongDescription
                        ? `${plainDescription.slice(0, BLOG_DESC_LIMIT)}...`
                        : plainDescription;

                      return (
                        <div className="col-lg-4 col-md-6" key={index}>
                          <div
                            onClick={() => getByBlogDetails(blog)}
                            style={{
                              background: "#ffffff",
                              borderRadius: "16px",
                              overflow: "hidden",
                              boxShadow: "0 2px 8px rgba(128, 89, 202, 0.08)",
                              border: "1px solid rgba(128, 89, 202, 0.1)",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "180px",
                                overflow: "hidden",
                                background: "#f8f4ff",
                              }}
                            >
                              <img
                                src={getImageUrl(blog.files[0])}
                                alt={blog.title}
                                loading={index < 2 ? "eager" : "lazy"}
                                decoding="async"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                            <div style={{ padding: "14px" }}>
                              <h5 style={{ fontSize: "15px", marginBottom: "8px" }}>
                                {blog.title}
                              </h5>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "14px",
                                  color: "#6b7280",
                                  lineHeight: "1.6",
                                }}
                                dangerouslySetInnerHTML={{ __html: shortDescription }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Slider {...blogsSettings}>
                    {blogss.map((blog, index) => {
                      const BLOG_DESC_LIMIT = 120;
                      const plainDescription = (blog.description || "")
                        .replace(/<[^>]*>/g, "")
                        .trim();
                      const isLongDescription =
                        plainDescription.length > BLOG_DESC_LIMIT;
                      const shortDescription = isLongDescription
                        ? `${plainDescription.slice(0, BLOG_DESC_LIMIT)}...`
                        : plainDescription;

                      return (
                        <div className="col-lg-4 col-md-6 px-2" key={index}>
                          <div
                            onClick={() => getByBlogDetails(blog)}
                            style={{
                              background: "#ffffff",
                              borderRadius: "16px",
                              overflow: "hidden",
                              boxShadow: "0 2px 12px rgba(128, 89, 202, 0.1)",
                              border: "1px solid rgba(128, 89, 202, 0.1)",
                              transition: "all 0.3s ease",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                position: "relative",
                                width: "100%",
                                height: "200px",
                                overflow: "hidden",
                                background: "#f8f4ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src={getImageUrl(blog.files[0])}
                                alt={blog.title}
                                loading={index < 3 ? "eager" : "lazy"}
                                fetchPriority={index === 0 ? "high" : "auto"}
                                decoding="async"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                            <div
                              style={{
                                padding: "14px",
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  marginBottom: "10px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <img
                                    src={getImageUrl(blog.files[0])}
                                    alt={blog.title}
                                    loading="lazy"
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                      border: "2px solid #e5e7eb",
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "500",
                                      color: "#4b5563",
                                    }}
                                  >
                                    {blog.title.slice(0, 12)}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "13px",
                                    color: "#9ca3af",
                                  }}
                                >
                                  <i className="fas fa-calendar-alt" />
                                  <span>{blog.createdAt?.slice(0, 10)}</span>
                                </div>
                              </div>

                              <h3
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "700",
                                  color: "#8059ca",
                                  marginBottom: "4px",
                                  lineHeight: "1.4",
                                }}
                              >
                                {blog.title}
                              </h3>

                              <div
                                style={{
                                  fontSize: "14px",
                                  color: "#6b7280",
                                  lineHeight: "1.6",
                                  flex: 1,
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    color: "#6b7280",
                                    lineHeight: "1.6",
                                  }}
                                  dangerouslySetInnerHTML={{ __html: shortDescription }}
                                />
                                {isLongDescription && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      getByBlogDetails(blog);
                                    }}
                                    style={{
                                      marginTop: "8px",
                                      padding: 0,
                                      border: "none",
                                      background: "none",
                                      color: "#8059ca",
                                      fontSize: "13px",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Read more
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </Slider>
                )}
              </div>
            </section>
          )}

          <section className="app-section app-sec-twelve pharmacy-app-sec home-deferred-section">
            <div className="container">
              <div className="app-twelve border-0">
                <div className="app-bg">
                  <div className="row align-items-center">
                    <div
                      className="col-lg-6 col-md-12 aos aos-init aos-animate"
                      data-aos="fade-up"
                    >
                      <div className="mobile-img">
                        <img
                          src="/assets/mobileapp.png"
                          className="img-fluid"
                          alt="mobileapp"
                          title="mobileapp"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-12">
                      <div className="app-content">
                        <div
                          className="app-header aos aos-init aos-animate"
                          data-aos="fade-up"
                        >
                          <h5>Download Our App Now.</h5>
                          <h2 style={{ fontSize: "38px !important" }}>
                            MediCompares India's #1 Medicine Price Comparision
                          </h2>
                        </div>
                        <div
                          className="app-scan aos aos-init aos-animate"
                          data-aos="fade-up"
                        >
                          <p>Scan the QR code to get the app now</p>
                          <img src="/assets/qurcode.png" alt="scan-image" />
                        </div>
                        <div className="app-store-links gap-2 d-flex flex-column flex-md-row ">
                          <a
                            href="https://www.apple.com/app-store/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src="/assets/img/icons/app-store-icon.svg"
                              alt="app-store"
                              title="app-store"
                            />
                          </a>
                          <a
                            href="https://play.google.com/store/games"
                            target="blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src="/assets/img/icons/playstore.svg"
                              alt="play-store"
                              title="play-store"
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="app-bgs">
                    <img
                      src="assets/img/bg/app-bg-01.png"
                      alt="image"
                      style={{ height: "360px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* <Modal
        show={show}
        onHide={handleClose}
        centered
        style={{ zIndex: 9999999999999, backgroundColor: "#010101db" }}
        backdrop="static"
      >
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 10000,
              backgroundColor: "#dc3545",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: "25px",
              height: "25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ×
          </button>

          <Modal.Body style={{ padding: 0 }}>
            <div className="call-box incoming-box">
              <img
                alt="coming-soon"
                title="coming-soon"
                src="/assets/img/products/commingsoon.jpg"
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
            </div>
          </Modal.Body>
        </div>
      </Modal> */}
          {/* <CustomerReviewsSuccessModal/> */}

          <style>
            {`
          .products-swiper .swiper-button-next,
          .products-swiper .swiper-button-prev {
            background: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            color: #8059ca;
            transition: all 0.3s ease;
          }
          .products-swiper .swiper-button-next:after,
          .products-swiper .swiper-button-prev:after {
            font-size: 16px;
            font-weight: bold;
          }
          .products-swiper .swiper-button-next:hover,
          .products-swiper .swiper-button-prev:hover {
            background: #8059ca;
            color: white;
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
          }
          .products-swiper {
            padding-bottom: 32px !important;
          }
          .products-swiper .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            background: #d1d5db;
            opacity: 1;
            transition: all 0.3s ease;
          }
          .products-swiper .swiper-pagination-bullet-active {
            background: #8059ca;
            width: 25px;
            border-radius: 5px;
          }
          .products-swiper .swiper-button-next,
          .products-swiper .swiper-button-prev {
            top: 40% !important;
          }
        `}
          </style>
          <PrescriptionUploadModal
            show={showPrescriptionModal}
            onClose={() => setShowPrescriptionModal(false)}
            onValidated={handlePrescriptionSearchCompleted}
            mode="search"
            pincode={selectedPincode}
            lat={latitude}
            lng={longitude}
          />
          <Home2Footer />
        </div>
      )}
    </>
  );
};

export default Home2;
