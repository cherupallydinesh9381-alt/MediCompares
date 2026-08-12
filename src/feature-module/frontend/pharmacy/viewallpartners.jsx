import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams, Link } from "react-router-dom";
import Home2Header from "../home/home-4/Header-k.jsx";
import Footer from "../home/home-4/Footer-f.jsx";
import CategoryProvider from "../../../components/CategoryProvider.jsx";
import { axiosCommonInstance, axiosInstance } from "../../../Apiservice.jsx";
import { getImageUrl } from "../../../utils/index";
import breadcrumbBg from "/assets/Medicompares Background.png";
import doctors from "/assets/doctors.png";
import toast from "react-hot-toast";

const ViewAllPartners = () => {
  const navigate = useNavigate();
  const { service } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [partners, setPartners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const itemsPerPage = 9;

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedServices.length > 0) {
        params.append("services", selectedServices.join(","));
      }
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const response = await axiosCommonInstance.get("vendor/list", { params });
      const data = response.data?.data || {};

      setPartners(data.vendors || []);

      if (data.pagination) {
        const pag = data.pagination;
        setCurrentPage(pag.page || 1);
        setTotalPages(pag.totalPages || 1);
        setHasNextPage(pag.hasNextPage || false);
        setHasPrevPage(pag.hasPrevPage || false);
      }
    } catch (error) {
      toast.error("Vendor API error:", error);
      setPartners([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("categorylist");
      const { categories } = response.data?.data || {};
      setCategories(Array.isArray(categories) ? categories : []);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    // Redirect if service is undefined to clean up the URL
    if (service === "undefined") {
      navigate("/partners", { replace: true });
      return;
    }
    fetchCategories();
  }, [service, navigate]);

  useEffect(() => {
    fetchVendors();
  }, [currentPage, selectedServices]);

  useEffect(() => {
    const servicesFromUrl =
      searchParams.get("services")?.split(",").filter(Boolean) || [];

    const pageFromUrl = parseInt(searchParams.get("page")) || 1;

    setSelectedServices((prev) =>
      JSON.stringify(prev) === JSON.stringify(servicesFromUrl)
        ? prev
        : servicesFromUrl,
    );

    setCurrentPage((prev) => (prev === pageFromUrl ? prev : pageFromUrl));
  }, [searchParams]);

  const toggleService = (slug) => {
    setSelectedServices((prev) => {
      let updated;
      if (prev.includes(slug)) {
        updated = prev.filter((s) => s !== slug);
      } else {
        updated = [...prev, slug];
      }

      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (updated.length > 0) {
          next.set("services", updated.join(","));
        } else {
          next.delete("services");
        }
        next.set("page", "1");
        return next;
      });

      return updated;
    });
  };

  const clearAllFilters = () => {
    setSelectedServices([]);
    setSearchParams({ page: "1" });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", newPage.toString());
      return next;
    });
  };

  const handlePartnerClick = (partner) => {
    const name =
      partner?.businessdetails?.name || partner?.name || "Partner Store";
    const vendorSlug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const vendorId = partner?.vendorId || partner?.businessdetails?.vendorId;
    if (vendorId) {
      sessionStorage.setItem("vendorId", vendorId);
      navigate(`/vendor-profile/${vendorSlug}`);
    }
  };

  return (
    <>
      <Home2Header />
      <CategoryProvider />

      <style>{`
        .custom-shift {
          position: relative;
        }

        @media (min-width: 992px) {
          .breadcrumb-row-custom {
            min-height:60px;
          }
        }

        @media (min-width: 768px) {
          .custom-shift {
            left: 150px;
          }
        }

        @media (max-width: 767px) {
          .custom-shift {
            left: 0;
          }
        }
      `}</style>

      <div className="breadcrumb-bar">
        <div className="breadcrumbb-bggg">
          <img src={breadcrumbBg} />
        </div>
        <div className="breadcrumbb-contentt">
          <div className="row align-items-center justify-content-between breadcrumb-row-custom">
            <div className="col-lg-6">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-light btn-sm d-inline-flex align-items-center gap-2 mb-2"
                style={{
                  borderRadius: "20px",
                  padding: "6px 16px",
                  fontWeight: "500",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
                }}
              >
                <i className="fa-solid fa-arrow-left" />
                Go Back
              </button>
              <div
                style={{ position: "relative" }}
                className="d-none d-lg-block"
              >
                <img
                  src={doctors}
                  style={{
                    height: "150px",
                    position: "absolute",
                    top: "0px",
                    left: "0",
                  }}
                />
              </div>
            </div>

            <div className="col-lg-6 text-lg-end mt-3 mt-lg-0">
              <h2 className="text-dark mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>
                All Vendors
              </h2>
              <p className="text-secondary mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                Find your desired medical providers and book healthcare services
              </p>
            </div>

          </div>
        </div>
      </div>

      <div className="content" style={{ padding: "20px 0px 60px" }}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 mb-4 d-none d-lg-block">
              <div className="filter-cardd shadow p-4 bg-white rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="filter-titlee mb-0">Filter By</h6>
                  {selectedServices.length > 0 && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <label className="form-label mt-3">Categories</label>
                <ul className="list-unstyled category-listt mt-2">
                  {categories.length === 0 ? (
                    <li className="py-2 text-muted">No categories available</li>
                  ) : (
                    categories.map((cat) => (
                      <li key={cat._id || cat.slug} className="py-2">
                        <div className="form-check d-flex align-items-center">
                          <input
                            className="form-check-input me-2"
                            type="checkbox"
                            id={`cat-${cat.slug}`}
                            checked={selectedServices.includes(cat.slug)}
                            onChange={() => toggleService(cat.slug)}
                          />
                          <label
                            className="form-check-label d-flex align-items-center"
                            htmlFor={`cat-${cat.slug}`}
                            style={{ cursor: "pointer", flex: 1 }}
                          >
                            <img
                              src={
                                getImageUrl(cat.files) || "/assets/default.png"
                              }
                              alt={cat.name}
                              style={{
                                width: "24px",
                                height: "24px",
                                objectFit: "contain",
                                marginRight: "10px",
                                borderRadius: "4px",
                              }}
                              onError={(e) =>
                                (e.target.src = "/assets/default.png")
                              }
                            />
                            <span>{cat.name}</span>
                          </label>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="col-lg-9">
              <div className="d-flex align-items-center justify-content-between d-lg-none mb-3 mobile-filter-buttons-container">
                <button
                  type="button"
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#filterOffcanvas"
                  aria-controls="filterOffcanvas"
                >
                  <i className="fas fa-filter"></i>
                  <span>Filter</span>

                  {selectedServices.length > 0 && (
                    <span className="badge bg-danger ms-1 filter-count-badge-inline">
                      {selectedServices.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  onClick={clearAllFilters}
                >
                  <i className="fas fa-redo"></i>
                  <span>Clear</span>
                </button>
              </div>
              {isLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                  }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : partners.length === 0 ? (
                <div
                  className="text-center py-5"
                  style={{ minHeight: "300px" }}
                >
                  <img
                    src="https://cdni.iconscout.com/illustration/premium/thumb/data-not-found-illustration-svg-download-png-9404367.png"
                    alt="No Partners Found"
                    style={{ opacity: 0.9, marginBottom: "20px" }}
                  />
                  <h4 style={{ color: "#666", marginBottom: "10px" }}>
                    No Partners Found
                  </h4>
                  <p style={{ color: "#999" }}>
                    There are no partners available at the moment.
                  </p>
                </div>
              ) : (
                <>
                  <div className="row g-4">
                    {partners.map((partner, index) => {
                      const logoSrc = partner?.bussiness_image?.url;
                      const bannerSrc = partner?.bussiness_banner_image?.url;
                      const name =
                        partner?.businessdetails?.name ||
                        partner?.name ||
                        "Partner Store";
                      const ProductsCount =
                        partner?.businessdetails?.productCount ||
                        partner?.productCount ||
                        "0";

                      const address =
                        partner?.businessdetails?.address ||
                        partner?.address ||
                        "No Address";

                      return (
                        <div
                          className="col-lg-4 col-md-6 col-12"
                          key={partner._id || index}
                        >
                          <div
                            className="store-cardd shadow"
                            onClick={() => handlePartnerClick(partner)}
                            style={{
                              cursor: "pointer",
                              transition: "all 0.25s ease",
                            }}
                          >
                            <div
                              className="store-bannerr"
                              style={{
                                backgroundImage: bannerSrc
                                  ? `url(${encodeURI(getImageUrl(bannerSrc))})`
                                  : `url("/assets/breadcrumb.png")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                            <div className="store-contentt">
                              <div
                                className="store-info"
                                style={{ textTransform: "capitalize" }}
                              >
                                <img
                                  src={
                                    getImageUrl(logoSrc) ||
                                    "../assets/default.png"
                                  }
                                  className="store-logoo"
                                  alt={name}
                                />
                                <div className="store-details">
                                  <div
                                    className="text-dark "
                                    style={{ fontSize: "14px", fontWeight: "500" }}
                                  >
                                    {name}
                                  </div>
                                  <small>
                                    <i className="fas fa-map-marker-alt me-1"></i>
                                    {address.slice(0, 10)}
                                  </small>
                                </div>
                              </div>
                              <button
                                className="store-button rounded"
                                style={{
                                  backgroundColor: "#a36ff92e",
                                  border: "none",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePartnerClick(partner);
                                }}
                              >
                                <strong className="text-primary fw-bold">
                                  {ProductsCount}
                                </strong>{" "}
                                <span className="text-dark">Products</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination dashboard-pagination mb-4 d-flex justify-content-center mt-5">
                      <ul className="d-flex justify-content-center mb-0">
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
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </button>
                              </li>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <li key={`dots-${page}`}>
                                <span
                                  className="page-link"
                                  style={{ cursor: "default" }}
                                >
                                  ...
                                </span>
                              </li>
                            );
                          }
                          return null;
                        })}

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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile  */}
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="filterOffcanvas"
          aria-labelledby="filterOffcanvasLabel"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          style={{ width: "50%", maxWidth: "400px", minWidth: "280px" }}
        >
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title" id="filterOffcanvasLabel">
              <i className="fas fa-filter me-2"></i> Filters
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <div className="filter-cardd p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-bold">Filter By</h6>
                {selectedServices.length > 0 && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <label className="form-label fw-medium">Categories</label>
              <ul className="list-unstyled category-listt mt-2">
                {categories.length === 0 ? (
                  <li className="py-2 text-muted">No categories available</li>
                ) : (
                  categories.map((cat) => (
                    <li key={cat._id || cat.slug} className="py-2">
                      <div className="form-check d-flex align-items-center">
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          id={`mobile-cat-${cat.slug}`}
                          checked={selectedServices.includes(cat.slug)}
                          onChange={() => toggleService(cat.slug)}
                        />
                        <label
                          className="form-check-label d-flex align-items-center"
                          htmlFor={`mobile-cat-${cat.slug}`}
                          style={{ cursor: "pointer", flex: 1 }}
                        >
                          <img
                            src={
                              cat?.files
                                ? getImageUrl(cat.files)
                                : "/assets/default.png"
                            }
                            alt={cat.name}
                            style={{
                              width: "24px",
                              height: "24px",
                              objectFit: "contain",
                              marginRight: "12px",
                              borderRadius: "4px",
                            }}
                            onError={(e) =>
                              (e.target.src = "/assets/default.png")
                            }
                          />
                          <span>{cat.name}</span>
                        </label>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="mt-5">
              <button
                className="btn btn-primary w-100 py-3"
                data-bs-dismiss="offcanvas"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ViewAllPartners;
