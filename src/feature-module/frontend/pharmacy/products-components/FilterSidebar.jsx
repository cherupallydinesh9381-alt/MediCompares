import { useCallback, useMemo, useState, useEffect } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
const mi_filter = "/assets/mi_filter.png";

const FilterSidebar = ({
  categories,
  brands,
  selectedCategories,
  onCategoryToggle,
  onBrandToggle,
  selectedBrands,
  defaultCategoryId,
  priceRange,
  availablePriceRange,
  onPriceRangeChange,
  service,
  isDesktopSidebarOpen,
  toggleSidebar,
}) => {
  const [openAccordion, setOpenAccordion] = useState({
    category: true,
    price: true,
    brands: true,
    form: true,
    nature: true,
  });

  const toggleAccordion = (key) => {
    setOpenAccordion((prev) => {
      const isCurrentlyOpen = prev[key];

      return {
        category: prev.category,
        price: prev.price,
        brands: prev.brands,
        form: prev.form,
        nature: prev.nature,
        [key]: !isCurrentlyOpen, // toggle only clicked section
      };
    });
  };
  const getDefaultPriceRange = (serviceType) => {
    if (serviceType === "medicine" || serviceType === "medicines") {
      return [1, 10000];
    }
    return [200, 100000];
  };

  const formatPrice = (price) => {
    if (typeof price !== "number") return "₹0";
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const defaultPriceRange = getDefaultPriceRange(service);
  const defaultPriceRangeProp = priceRange || defaultPriceRange;
  const defaultAvailablePriceRange = availablePriceRange || defaultPriceRange;

  const formatter = (value) => `₹${value}`;
  const [localValue, setLocalValue] = useState(defaultPriceRangeProp);

  useEffect(() => {
    setLocalValue(defaultPriceRangeProp);
  }, [defaultPriceRangeProp]);

  const handlePriceChange = useCallback((values) => {
    setLocalValue(values);
  }, []);

  const handleAfterChange = useCallback(
    (values) => {
      onPriceRangeChange(values);
    },
    [onPriceRangeChange],
  );

  const sliderValue = useMemo(() => localValue, [localValue]);

  const productform = [
    { name: "Tablet" },
    { name: "Capsule" },
    { name: "Syrup" },
    { name: "Injections" },
    { name: "Cream" },
    { name: "OintMent" },
  ];

  const productnature = [
    { name: "Herbal" },
    { name: "Ayurved" },
    { name: "Organic" },
    { name: "Vegan" },
  ];

  const HeadingName = (service) => {
    if (service === "medicines") return "MEDICINE";
    if (service === "surgeries") return "SURGERY";
    if (service === "lab-tests") return "LAB TEST";
    if (service === "diagnostics") return "DIAGNOSTIC";
    if (service === "home-care-services") return "HOME CARE SERVICE";
    if (service === "medical-equipment") return "MEDICAL EQUIPMENT";
    if (service === "nursing-care") return "NURSING CARE";
    if (service === "medical-treatment") return "MEDICAL TREATMENT";
    if (service === "healthcare") return "HEALTHCARE";
    if (service === "ambulance-service") return "AMBULANCE SERVICE";
    if (service === "dental-service") return "DENTAL SERVICE";
    return "";
  };

  const PlusMinus = ({ open }) => (
    <span
      style={{
        fontSize: "22px",
        fontWeight: "700",
        position: "relative",
        bottom: "6px",
      }}
    >
      {open ? "−" : "+"}
    </span>
  );

  return (
    <div className="modern-filter-sidebar">
      <div className="card-body p-0">
        <div className="accordion-content">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              fontSize: "17px",
              fontWeight: "600",
              color: "#000",
              cursor: "pointer",
            }}
            onClick={toggleSidebar}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={mi_filter} width={25} height={25} />
              <span>Apply Filters</span>
            </div>

            {isDesktopSidebarOpen && (
              <div
                className="bg-light"
                style={{
                  borderRadius: "50%",
                  width: "25px",
                  height: "25px",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fas fa-times"></i>
              </div>
            )}
          </div>

          {categories && categories.length > 0 && (
          <div className="modern-accordion-body bg-white">
            <div
              onClick={() => toggleAccordion("category")}
              style={{
                fontSize: "15px",
                fontWeight: "600",
                marginLeft: "15px",
                display: "flex",
                justifyContent: "space-between",
                paddingRight: "15px",
                cursor: "pointer",
                color: "#000",
              }}
            >
              {HeadingName(service)} CATEGORY
              <PlusMinus open={openAccordion.category} />
            </div>

            {openAccordion.category &&
              categories?.map((cat) => {
                const isActive = selectedCategories.includes(cat.slug);
                const isDefaultCategory = cat.slug === defaultCategoryId;

                return (
                  <div
                    key={cat.slug}
                    className={`modern-checkbox-item ${
                      isActive ? "active" : ""
                    } ${isDefaultCategory ? "default-category" : ""}`}
                    onClick={() => onCategoryToggle(cat.slug)}
                    style={{ marginLeft: "10px" }}
                  >
                    <div style={{ display: "flex", gap: "5px" }}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        disabled={isDefaultCategory}
                      />
                      <span style={{ fontSize: "12px" }}>{cat.name}</span>
                    </div>
                    <span>{cat.productCount || 0}</span>
                  </div>
                );
              })}
          </div>
          )}

          <hr style={{ maxWidth: "100%", margin: "0px 0px 0px 0px" }} />

          <div className="modern-accordion-body bg-white">
            <div
              onClick={() => toggleAccordion("price")}
              style={{
                fontSize: "15px",
                fontWeight: "600",
                marginLeft: "15px",
                display: "flex",
                justifyContent: "space-between",
                paddingRight: "15px",
                cursor: "pointer",
                color: "#000",
              }}
            >
              PRICE RANGE
              <PlusMinus open={openAccordion.price} />
            </div>

            {openAccordion.price && (
              <div className="filter-section">
                <div
                  className="filter-section-body"
                  style={{ paddingLeft: "15px", paddingRight: "15px" }}
                >
                  <Slider
                    range
                    tooltip={{ formatter }}
                    min={defaultAvailablePriceRange[0]}
                    max={defaultAvailablePriceRange[1]}
                    value={sliderValue}
                    onChange={handlePriceChange}
                    onAfterChange={handleAfterChange}
                    allowCross={false}
                    styles={{
                      track: {
                        backgroundColor: "#8059ca",
                        height: 4,
                      },
                      rail: {
                        backgroundColor: "#e0e0e0",
                        height: 4,
                      },
                      handle: {
                        borderColor: "#8059ca",
                        backgroundColor: "#fff",
                        width: 18,
                        height: 18,
                        marginTop: -7,
                        boxShadow: "0 2px 4px rgba(125, 46, 255, 0.3)",
                      },
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#666",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Min
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#8059ca",
                      }}
                    >
                      {formatPrice(defaultPriceRangeProp[0])}
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#999",
                      fontSize: "16px",
                      margin: "0 8px",
                    }}
                  >
                    -
                  </div>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#666",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Max
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#8059ca",
                      }}
                    >
                      {formatPrice(defaultPriceRangeProp[1])}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {brands && brands.length > 0 && (
          <>
          <hr style={{ maxWidth: "100%", margin: "0px 0px 0px 0px" }} />
          <div className="modern-accordion-body bg-white" style={{ display: brands.length > 0 ? "block" : "none" }}>
            <div
              onClick={() => toggleAccordion("brands")}
              style={{
                fontSize: "15px",
                fontWeight: "600",
                marginBottom: "7px",
                marginLeft: "15px",
                color: "#191C1F",
                lineHeight: "24px",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                paddingRight: "15px",
                cursor: "pointer",
              }}
            >
              POPULAR BRANDS
              <span style={{ fontSize: "22px", fontWeight: "700" }}>
                {openAccordion.brands ? "−" : "+"}
              </span>
            </div>

            {openAccordion.brands &&
              brands?.map((brand) => {
                const isActive = selectedBrands.includes(brand.slug);
                return (
                <div
                key={brand.slug}
                className={`modern-checkbox-item ${
                  isActive ? "active" : ""} `}
                onClick={() => onBrandToggle(brand.slug)}
                style={{ marginLeft: "10px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <input type="checkbox" />
                    <span style={{ fontSize: "12px", fontWeight: "500" }}>
                      {brand.name}
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: "#f0f0f0",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    0
                  </span>
                </div>
                )})}
          </div>
          </>
          )}

          <hr style={{ maxWidth: "100%", margin: "0px 0px 0px 0px", display: "none" }} />
          <div className="modern-accordion-body bg-white d-none">
            <div
              onClick={() => toggleAccordion("form")}
              style={{
                fontSize: "15px",
                fontWeight: "600",
                marginBottom: "7px",
                marginLeft: "15px",
                color: "#191C1F",
                lineHeight: "24px",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                paddingRight: "15px",
                cursor: "pointer",
              }}
            >
              PRODUCT FORM
              <span style={{ fontSize: "22px", fontWeight: "700" }}>
                {openAccordion.form ? "−" : "+"}
              </span>
            </div>

            {openAccordion.form &&
              productform.map((form, index) => (
                <div
                  key={index}
                  className="modern-checkbox-item"
                  style={{
                    position: "relative",
                    marginLeft: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <input type="checkbox" />
                    <span style={{ fontSize: "12px", fontWeight: "500" }}>
                      {form.name}
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: "#f0f0f0",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    0
                  </span>
                </div>
              ))}
          </div>

          <hr style={{ maxWidth: "100%", margin: "0px 0px 0px 0px", display: "none" }} />
          <div className="modern-accordion-body bg-white  d-none">
            <div
              onClick={() => toggleAccordion("nature")}
              style={{
                fontSize: "15px",
                fontWeight: "600",
                marginBottom: "7px",
                marginLeft: "15px",
                color: "#191C1F",
                lineHeight: "24px",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                paddingRight: "15px",
                cursor: "pointer",
              }}
            >
              PRODUCT NATURE
              <span style={{ fontSize: "22px", fontWeight: "700" }}>
                {openAccordion.nature ? "−" : "+"}
              </span>
            </div>

            {openAccordion.nature &&
              productnature.map((nature, index) => (
                <div
                  key={index}
                  className="modern-checkbox-item"
                  style={{
                    position: "relative",
                    marginLeft: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <input type="checkbox" />
                    <span style={{ fontSize: "12px", fontWeight: "500" }}>
                      {nature.name}
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: "#f0f0f0",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    0
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;