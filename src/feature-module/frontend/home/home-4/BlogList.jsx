import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Home2Header from "./Header-k";
import Home2Footer from "./Footer-f";
import { axiosInstance } from "../../../../Apiservice";
import { getImageUrl } from "../../../../utils";
import PageLoader from "../../../../components/ui/PageLoader.jsx";
import { useResponsive } from "../../../../hooks/index.js"
const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { isTabletOrBelow } = useResponsive();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchBlogs = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`blog/list?page=${currentPage}&limit=9`);
      setBlogs(response?.data?.data?.list || []);
      setPagination(response?.data?.data?.pagination || { total: 0, totalPages: 1 });
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories = [
    "All",
    ...Array.from(new Set(blogs.map((b) => b.category?.name).filter(Boolean))),
  ];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || blog.category?.name === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBlogClick = (blog) => {
    navigate(`/blog-details/${blog.slug}`);
  };

  const truncate = (text, limit = 130) => {
    const plain = (text || "").replace(/<[^>]*>/g, "").trim();
    return plain.length > limit ? plain.slice(0, limit) + "..." : plain;
  };

  return (
    <>
      <style>{`
        .blog-list-page {
          min-height: 100vh;
          background: #f5f3ff;
        }

        .blog-list-hero {
          background: linear-gradient(135deg, #8059ca 0%, #6d48b8 60%, #5a3a99 100%);
          padding: 60px 0 50px;
          position: relative;
          overflow: hidden;
        }

        .blog-list-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url('/assets/Medicompares Background.png');
          background-size: cover;
          background-position: center;
          opacity: 0.12;
        }

        .blog-list-hero .hero-title {
          font-size: 42px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 10px;
        }

        .blog-list-hero .hero-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.82);
          max-width: 540px;
          margin: 0 auto;
        }

        .blog-search-bar {
          background: #fff;
          border-radius: 50px;
          display: flex;
          align-items: center;
          padding: 8px 20px;
          box-shadow: 0 4px 20px rgba(128,89,202,0.15);
          max-width: 480px;
          margin: 28px auto 0;
          border: 1.5px solid rgba(128,89,202,0.15);
          gap: 10px;
        }

        .blog-search-bar input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 14px;
          color: #1e1e24;
          background: transparent;
        }

        .blog-search-bar i {
          color: #8059ca;
          font-size: 15px;
        }

        .blog-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          padding: 28px 0 4px;
        }

        .category-pill {
          padding: 6px 18px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid rgba(128,89,202,0.3);
          background: #fff;
          color: #8059ca;
          transition: all 0.2s;
        }

        .category-pill.active, .category-pill:hover {
          background: #8059ca;
          color: #fff;
          border-color: #8059ca;
          box-shadow: 0 3px 10px rgba(128,89,202,0.25);
        }

        .blog-grid-section {
          padding: 28px 0 60px;
        }

        .blog-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(128,89,202,0.08);
          border: 1px solid rgba(128,89,202,0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(128,89,202,0.18);
        }

        .blog-card-img-wrap {
          width: 100%;
          height: 190px;
          background: #f5f3ff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .blog-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .blog-card:hover .blog-card-img-wrap img {
          transform: scale(1.05);
        }

        .blog-card-category-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(128,89,202,0.9);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          backdrop-filter: blur(6px);
        }

        .blog-card-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .blog-card-date {
          font-size: 12px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 8px;
        }

        .blog-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e1e24;
          margin-bottom: 8px;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .blog-card-desc {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.65;
          flex: 1;
        }

        .blog-card-footer {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .read-more-link {
          font-size: 13px;
          font-weight: 600;
          color: #8059ca;
          display: flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          transition: gap 0.2s;
        }

        .blog-card:hover .read-more-link {
          gap: 8px;
        }

        .no-blogs-wrap {
          text-align: center;
          padding: 60px 20px;
        }

        .no-blogs-wrap i {
          font-size: 48px;
          color: #d1c4e9;
          margin-bottom: 14px;
        }

        .no-blogs-wrap h5 {
          color: #6b7280;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .blog-list-hero .hero-title {
            font-size: 28px;
          }
        }
      `}</style>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="blog-list-page">
          <Home2Header />

          {/* Hero Banner */}
          <div
            className="blog-list-hero text-center"
            style={{ marginTop: isTabletOrBelow ? "70px" : "40px" }}
          >
            <div style={{ position: "relative", marginTop: "20px" }}>
              {/* <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "50px",
                  padding: "6px 18px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#fff",
                  marginBottom: "12px",
                  backdropFilter: "blur(4px)",
                  marginTop: "10px"
                }}
              >
                <i className="fas fa-blog me-2" />
                MediCompares Blog
              </div> */}
              <h1 className="hero-title">Insights &amp; Health Tips</h1>
              <p className="hero-subtitle">
                Stay informed with expert articles on medicine pricing,
                alternatives, and smart healthcare decisions.
              </p>

              {/* Search */}
              {/* <div className="blog-search-bar">
                <i className="fas fa-search" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <i
                    className="fas fa-times"
                    style={{ cursor: "pointer", color: "#9ca3af" }}
                    onClick={() => setSearchQuery("")}
                  />
                )}
              </div> */}
            </div>
          </div>

          {/* Category Pills */}
          <div className="container">
            <div className="blog-categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Count */}
            <div
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                fontWeight: "500",
                paddingTop: "8px",
                paddingBottom: "4px",
              }}
            >
              Showing {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? "s" : ""}
              {activeCategory !== "All" && (
                <span> in <strong style={{ color: "#8059ca" }}>{activeCategory}</strong></span>
              )}
            </div>
          </div>

          {/* Blog Cards Grid */}
          <div className="blog-grid-section">
            <div className="container">
              {filteredBlogs.length === 0 ? (
                <div className="no-blogs-wrap">
                  <i className="fas fa-newspaper" />
                  <h5>No blogs found</h5>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                    Try a different keyword or category.
                  </p>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredBlogs.map((blog, index) => (
                    <div className="col-lg-4 col-md-6 col-12" key={blog._id || index}>
                      <div
                        className="blog-card"
                        onClick={() => handleBlogClick(blog)}
                      >
                        {/* Image */}
                        <div className="blog-card-img-wrap">
                          <img
                            src={
                              blog.files?.[0]
                                ? blog.files[0].startsWith("http")
                                  ? blog.files[0]
                                  : getImageUrl(blog.files[0])
                                : "/assets/default.png"
                            }
                            alt={blog.title}
                            loading={index < 3 ? "eager" : "lazy"}
                            onError={(e) => {
                              e.target.src = "/assets/default.png";
                            }}
                          />
                          {blog.category?.name && (
                            <span className="blog-card-category-badge">
                              {blog.category.name}
                            </span>
                          )}
                        </div>

                        {/* Body */}
                        <div className="blog-card-body">
                          <div className="blog-card-date">
                            <i className="fas fa-calendar-alt" />
                            {blog.createdAt
                              ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                              : ""}
                          </div>
                          <div className="blog-card-title">{blog.title}</div>
                           <div
                            className="blog-card-desc"
                            dangerouslySetInnerHTML={{ __html: truncate(blog.description, 130) }}
                          />
                          <div className="blog-card-footer">
                            <span className="read-more-link">
                              Read more <i className="fas fa-arrow-right" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                padding: "24px 0 40px",
              }}
            >
              {/* Prev */}
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "1.5px solid #d1c4e9",
                  background: page <= 1 ? "#f5f3ff" : "#fff",
                  color: page <= 1 ? "#c4b5e0" : "#8059ca",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <i className="fas fa-chevron-left" style={{ fontSize: "12px" }} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    border: p === page ? "none" : "1.5px solid #d1c4e9",
                    background: p === page ? "#8059ca" : "#fff",
                    color: p === page ? "#fff" : "#6b7280",
                    cursor: "pointer",
                    fontWeight: p === page ? "700" : "500",
                    fontSize: "14px",
                    boxShadow: p === page ? "0 3px 10px rgba(128,89,202,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {p}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "1.5px solid #d1c4e9",
                  background: page >= pagination.totalPages ? "#f5f3ff" : "#fff",
                  color: page >= pagination.totalPages ? "#c4b5e0" : "#8059ca",
                  cursor: page >= pagination.totalPages ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <i className="fas fa-chevron-right" style={{ fontSize: "12px" }} />
              </button>
            </div>
          )}

          <Home2Footer />
        </div>
      )}
    </>
  );
};

export default BlogList;
