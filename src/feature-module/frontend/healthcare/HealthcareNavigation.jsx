import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils";
import { PAGE_LOADER_IMAGE } from "../../../components/ui/PageLoader.jsx";


const HealthcareNavigation = ({ categories: propCategories, isLoading: propLoading = false }) => {
  const categories = propCategories || [];
  const tabLoading = propLoading;
  const [hasSearchBar, setHasSearchBar] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 4);
    setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 4);
  }, []);

  const scrollCategoryToCenter = (itemSlug) => {
    const container = scrollRef.current;
    if (!container) return;
    const categoryElements = container.querySelectorAll('.nav-item');
    let targetElement = null;

    categoryElements.forEach((el) => {
      const navText = el.querySelector('.nav-text');
      if (navText) {
        const category = categories.find(cat => cat.slug === itemSlug);
        if (category && navText.textContent.trim() === category.name) {
          targetElement = el;
        }
      }
    });

    if (!targetElement) {
      const categoryIndex = categories.findIndex(cat => cat.slug === itemSlug);
      if (categoryIndex !== -1 && categoryElements[categoryIndex]) {
        targetElement = categoryElements[categoryIndex];
      }
    }

    if (targetElement) {
      const containerWidth = container.offsetWidth;
      const elementLeft = targetElement.offsetLeft;
      const elementWidth = targetElement.offsetWidth;
      const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const checkSearchBar = () => {
      if (window.innerWidth > 991) {
        setHasSearchBar(false);
        return;
      }

      const searchBarSections = document.querySelectorAll('section.d-lg-none');
      let searchBarVisible = false;

      searchBarSections.forEach((section) => {
        const styles = window.getComputedStyle(section);
        const inlineStyle = section.getAttribute('style') || '';

        if (
          styles.position === 'fixed' &&
          (inlineStyle.includes('top: 60px') || inlineStyle.includes('top:60px')) &&
          styles.display !== 'none' &&
          section.offsetParent !== null
        ) {
          searchBarVisible = true;
        }
      });

      setHasSearchBar(searchBarVisible);
    };

    checkSearchBar();
    const interval = setInterval(checkSearchBar, 200);

    window.addEventListener("resize", checkSearchBar);
    window.addEventListener("scroll", checkSearchBar, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkSearchBar);
      window.removeEventListener("scroll", checkSearchBar);
    };
  }, []);

  // Attach scroll listener to the nav list to keep arrow visibility updated
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", updateScrollButtons, { passive: true });
    // Initial check after categories render
    updateScrollButtons();
    return () => container.removeEventListener("scroll", updateScrollButtons);
  }, [updateScrollButtons, categories]);

  // Re-check on window resize
  useEffect(() => {
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [updateScrollButtons]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentPath = location.pathname;
      if (currentPath.startsWith('/view-all-categories/')) {
        const pathParts = currentPath.split('/');
        const serviceSlug = pathParts[2];
        if (serviceSlug) {
          const activeCategory = categories.find(item => item.slug === serviceSlug);
          if (activeCategory) {
            scrollCategoryToCenter(activeCategory.slug);
          }
        }
      } else {
        const activeCategory = categories.find(item => currentPath.startsWith(`/${item.slug}`));
        if (activeCategory) {
          scrollCategoryToCenter(activeCategory.slug);
        }
      }
      // Update arrows after auto-scroll settles
      setTimeout(updateScrollButtons, 350);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, categories]);

  const handleCategoryClick = (item) => {
    navigate(`/${item.slug}`);
    setTimeout(() => {
      scrollCategoryToCenter(item.slug);
    }, 150);
  };

  const scrollLeft = () => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({
        left: container.scrollLeft - 200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({
        left: container.scrollLeft + 200,
        behavior: "smooth",
      });
    }
  };

  const shouldShow = true;

  return (
    <div
      className={`healthcare-navigation-wrapper w-100 ${shouldShow ? 'show' : 'hide'} ${hasSearchBar ? 'has-search-bar' : ''}`}
      style={{
        display: shouldShow ? 'block' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Left scroll arrow */}
      <button
        type="button"
        className="scroll-btn left-btn"
        onClick={scrollLeft}
        aria-label="Scroll categories left"
        style={{
          opacity: canScrollLeft ? 1 : 0,
          pointerEvents: canScrollLeft ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      {tabLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "99999999",
            backdropFilter: "blur(2px)",
          }}
        >
          <div className="text-center">
            <img src={PAGE_LOADER_IMAGE} alt="loading..." />
          </div>
        </div>
      )}
      <div className="healthcare-navigation">
        <div className="container-lg-fluid">
          <div className="navigation-scroll-container d-flex justify-content-center align-items-center">
            <ul
              className="nav healthcare-nav-pills d-flex flex-nowrap overflow-auto"
              ref={scrollRef}
            >
              {categories.map((item) => (
                <li key={item._id} className="nav-item text-center">
                  <div
                    className={`nav-link d-flex align-items-center justify-content-center gap-1 ${
                      location.pathname.startsWith(`/${item.slug}`) ||
                      (location.pathname.startsWith('/view-all-categories/') &&
                        location.pathname.split('/')[2] === item.slug)
                        ? "active"
                        : ""
                    }`}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    onClick={() => handleCategoryClick(item)}
                  >
                    <img
                      src={
                        item?.files
                          ? getImageUrl(item.files)
                          : "/assets/default.png"
                      }
                      title={item.name}
                      style={{
                        height: "20px",
                        width: "20px",
                        objectFit: "contain",
                      }}
                      loading="lazy"
                    />
                    <span className="nav-text" style={{ fontSize: "12px" }}>
                      {item.name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right scroll arrow */}
      <button
        type="button"
        className="scroll-btn right-btn"
        onClick={scrollRight}
        aria-label="Scroll categories right"
        style={{
          opacity: canScrollRight ? 1 : 0,
          pointerEvents: canScrollRight ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default HealthcareNavigation;
