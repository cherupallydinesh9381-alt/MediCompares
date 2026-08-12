import { Link, useNavigate, useParams } from "react-router-dom";
import Home2Header from "../home/home-4/Header-k.jsx";
import Footer from "../home/home-4/Footer-f.jsx";
import CategoryProvider from "../../../components/CategoryProvider.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { axiosCommonInstance } from "../../../Apiservice.jsx";
import { getImageUrl } from "../../../utils/index";

const ViewAllCategories = () => {
  const navigate = useNavigate();
  const { service } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const categoriesPerPage = 18;

  const getCategoryData = async (page = 1) => {
    const params = {
      type: "website",
      positiontype: "top,bottom",
      page: page,
      limit: categoriesPerPage,
    };
    setLoading(true);
    try {
      const response = await axiosCommonInstance.get(
        `allcategory/slug/${service}`,
        {
          params,
        },
      );
      const { allcategory, pagination } = response.data.data;
      setCategories(allcategory || []);
      setTotalPages(pagination?.totalPages || 1);
      setCurrentPage(pagination?.page || 1);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategoryData(currentPage);
  }, [service, currentPage]);

  const handleCategoryClick = (item) => {
    navigate(`/${service}/all?maincategories=${item.slug}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const categoryName = service
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <Home2Header />
      <CategoryProvider />
      <section
        className="content-categories"
        style={{ padding: "150px 0px 20px" }}
      >
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between flex-wrap result-wrap gap-3 mb-4">
            <h3 className="mb-2 top-vendor-badge">
              <i className="fas fa-bolt"></i>
              {categoryName}
            </h3>

            <div className="d-flex align-items-center flex-wrap gap-3">
              <span
                onClick={() => navigate(-1)}
                className=" top-vendor-badge"
                style={{
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Go Back <i className="fa-solid fa-arrow-left ms-1"></i>
              </span>
            </div>
          </div>

          <div className="row g-2">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 mb-0">Loading categories...</p>
              </div>
            ) : categories && categories.length > 0 ? (
              categories.map((cat, index) => {
                const colorSchemes = [
                  {
                    iconColor: "#8059ca",
                    bg: "linear-gradient(135deg, #F8F5FE 0%, #E8D5FF 100%)",
                    border: "#E8D5FF",
                  },
                  {
                    iconColor: "#110EFD",
                    bg: "linear-gradient(135deg, #EAF3FF 0%, #D4E8FF 100%)",
                    border: "#D4E8FF",
                  },
                  {
                    iconColor: "#04BD6C",
                    bg: "linear-gradient(135deg, #F1FAF3 0%, #D4F4E0 100%)",
                    border: "#D4F4E0",
                  },
                  {
                    iconColor: "#FF6B6B",
                    bg: "linear-gradient(135deg, #FFF5F5 0%, #FFE5E5 100%)",
                    border: "#FFE5E5",
                  },
                  {
                    iconColor: "#FFA726",
                    bg: "linear-gradient(135deg, #FFF8E1 0%, #FFE5B4 100%)",
                    border: "#FFE5B4",
                  },
                  {
                    iconColor: "#26A69A",
                    bg: "linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)",
                    border: "#B2DFDB",
                  },
                ];
                const colors = colorSchemes[index % colorSchemes.length];
                return (
                  <div
                    className="col-lg-2 col-md-3 col-4 col-sm-6"
                    key={cat._id || index}
                    onClick={() => handleCategoryClick(cat)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="h-100"
                      style={{
                        borderRadius: "18px",
                        padding: "1px",
                        // background: `linear-gradient(140deg, ${colors.iconColor}40, rgba(255,255,255,0))`,
                      }}
                    >
                      <div
                        className="card border-0 h-100"
                        style={{
                          borderRadius: "16px",
                          background: "white",
                          border: "1px solid rgba(0,0,0,0.04)",
                          boxShadow: "0 10px 30px rgba(25, 25, 46, 0.08)",
                          transition: "all 0.35s ease",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-8px)";
                          e.currentTarget.style.boxShadow = `0 18px 35px ${colors.iconColor}25`;
                          const accent =
                            e.currentTarget.querySelector(".card-accent-bar");
                          if (accent) accent.style.transform = "scaleX(1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 10px 30px rgba(25, 25, 46, 0.08)";
                          const accent =
                            e.currentTarget.querySelector(".card-accent-bar");
                          if (accent) accent.style.transform = "scaleX(0)";
                        }}
                      >
                        <div
                          className="card-accent-bar"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: `linear-gradient(90deg, ${colors.iconColor}, ${colors.iconColor}55)`,
                            transform: "scaleX(0)",
                            transformOrigin: "left",
                            transition: "transform 0.3s ease",
                          }}
                        ></div>

                        <div
                          className="card-body d-flex flex-column align-items-center justify-content-center text-center"
                          style={{
                            padding: "24px 12px 18px",
                            minHeight: "150px",
                            gap: "12px",
                          }}
                        >
                          {/* Floating Icon */}
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "18px",
                              background: colors.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: `0 12px 24px ${colors.iconColor}20`,
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: "6px",
                                borderRadius: "14px",
                                background: "#ffffff",
                                opacity: 0.6,
                              }}
                            ></div>
                            <img
                              src={getImageUrl(cat?.files?.[0]) || "/assets/default.png"}
                              loading="lazy"
                              title={cat?.name}
                              alt={cat?.name}
                              style={{
                                width: "30px",
                                height: "30px",
                                objectFit: "contain",
                                position: "relative",
                                zIndex: 2,
                              }}
                            />
                          </div>

                          <h6
                            className="mb-0 fw-semibold"
                            style={{
                              fontSize: "12px",
                              color: "#1a1a1a",
                              lineHeight: "1.35",
                              minHeight: "32px",
                              fontWeight: "600",

                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textAlign: "center",
                            }}
                          >
                            {cat?.name || "No Category"}
                          </h6>

                          <p
                            className="mb-0"
                            style={{
                              fontSize: "11px",
                              color: "#7a7a7a",
                            }}
                          >
                            Explore now
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5">
                <h5>No Data Available</h5>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination dashboard-pagination mt-4">
              <ul className="d-flex justify-content-center align-items-center gap-1">
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
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <li key={`dots-${page}`}>
                        <span className="page-link disabled">…</span>
                      </li>
                    );
                  }
                  return null;
                })}

                <li>
                  <button
                    className="page-link"
                    onClick={() =>
                      handlePageChange(Math.min(currentPage + 1, totalPages))
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
      </section>
      <Footer />
    </>
  );
};

export default ViewAllCategories;
