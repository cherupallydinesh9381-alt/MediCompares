import React, { useState, useEffect } from "react";
import { Link, useNavigate, } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../../Apiservice";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Reviews = ({ HomeNavigate, BackButton }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("rating/get", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("medicomparestoken")}`,
          },
        });

        if (response.data?.success) {
          setReviews(response.data.data || []);
        } else {
          throw new Error(response.data?.message || "Failed to fetch reviews");
        }
      } catch (err) {
        setError("Failed to load reviews. Please try again.");
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < Math.floor(rating) ? (
          <FaStar key={i} style={{ color: "#FFD700", fontSize: "14px" }} />
        ) : i === Math.floor(rating) && rating % 1 >= 0.5 ? (
          <FaStarHalfAlt
            key={i}
            style={{ color: "#FFD700", fontSize: "14px" }}
          />
        ) : (
          <FaRegStar key={i} style={{ color: "#FFD700", fontSize: "14px" }} />
        ),
      );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderReviewCard = (review, index) => {
    const userAvatar = review.user?.files?.[0];
    const userName = review.user
      ? `${review.user.first_name} ${review.user.last_name}`
      : "You";

    return (
      <div className="review-card h-100 d-flex flex-column justify-content-between" style={{ margin: 0, padding: "20px" }}>
        <div>
          <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex align-items-center gap-2">
              {userAvatar ? (
                <img src={userAvatar} className="avatar" alt="User" />
              ) : (
                <div className="avatar-letter">
                  {userName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div>
                {/* <span className="badge badge-you mb-1" style={{ display: "inline-block" }}>You</span> */}
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    textTransform: "capitalize",
                    color: "#333"
                  }}
                >
                  {review?.tablet?.name?.length > 80
                    ? review?.tablet?.name.slice(0, 80) + "..."
                    : review?.tablet?.name}
                </div>
              </div>
            </div>

            <div className="text-end" style={{ flexShrink: 0 }}>
              <div className="rating" style={{ marginBottom: "4px" }}>{renderStars(review.rating)}</div>
              <div className="time-text" style={{ fontSize: "11px", color: "#888" }}>{formatDate(review.createdAt)}</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="product-link">
              <div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
                {review?.productreviewType && (
                  <span className="tag tag-green">
                    {review.productreviewType}
                  </span>
                )}

                {review.tablet?.strength && (
                  <span className="tag tag-gray">{review.tablet.strength}</span>
                )}
              </div>
            </div>

            {review.review && (
              <p className="review-text" style={{ fontSize: "13px", color: "#555", marginTop: "10px", lineHeight: "1.5", background: "#fcfcfc", padding: "10px", borderRadius: "8px", border: "1px solid #f0f0f0", margin: 0 }}>
                {review.review}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "15px", color: "#666" }}>
            Loading your reviews...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#dc3545",
          }}
        >
          <i
            className="fas fa-exclamation-circle"
            style={{
              fontSize: "36px",
              marginBottom: "15px",
              color: "#dc3545",
            }}
          ></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={buttonStyle}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const totalReviews = safeReviews.length;
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = safeReviews.slice(
    indexOfFirstReview,
    indexOfLastReview,
  );
  const totalPages = Math.ceil(totalReviews / reviewsPerPage) || 0;

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={containerStyle}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .review-card {
          border-radius: 12px;
          border: 1px solid #e5e5e5;
          background: #fff;
          padding: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .review-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
       .avatar-letter {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #8059ca;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            text-transform: uppercase;
          }
         .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }
        .badge-you {
          background: #e8f0fe !important;
          color: #4c6ef5 !important;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 500;
        }
        .rating {
          color: #ffc107;
          font-size: 14px;
        }
        .time-text {
          font-size: 12px;
          color: #888;
        }
        .tag {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-block;
        }
        .tag-green {
          background: #e6f9ed;
          color: #0f9d58;
        }
        .tag-gray {
          background: #f0f0f0;
          color: #666;
        }
        .review-text {
          font-size: 14px;
          color: #555;
          margin-top: 10px;
          line-height: 1.6;
        }
        .product-link {
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        .dashboard-pagination ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .page-link {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px !important;
          border: 1px solid #e5e5e5;
          background: #fff;
          color: #555;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
        }
        .page-link:hover:not(:disabled) {
          background: #f8f9fa;
          color: #8059ca;
          border-color: #8059ca;
        }
        .page-link.active {
          background: #8059ca;
          color: #fff;
          border-color: #8059ca;
        }
        .page-link:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f5f5f5;
        }
      `,
        }}
      />
      <div
        className="dashboard-header"
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: isMobile ? "20px 15px" : "25px",
          marginBottom: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          width: "100%",
          overflow: "visible",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            marginBottom: "12px",
          }}
        >
          <HomeNavigate />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? "16px" : "24px",
            width: "100%",
          }}
        >
          <div
            style={{
              flex: "1",
              minWidth: 0,
              maxWidth: isMobile ? "100%" : "100%",
              wordBreak: "break-word",
              overflow: "hidden",
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: "600",
                color: "#333",
                margin: "0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: isMobile ? "wrap" : "nowrap",
              }}
            >
              <i
                className="fa-solid fa-comment-alt"
                style={{
                  color: "#8059ca",
                  flexShrink: 0,
                }}
              ></i>
              <span
                style={{
                  whiteSpace: isMobile ? "normal" : "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "block",
                  flex: "1",
                  minWidth: 0,
                }}
              >
                My Reviews
              </span>
            </h3>
            <p
              style={{
                color: "#666",
                fontSize: isMobile ? "13px" : "14px",
                marginTop: "5px",
                marginBottom: "0",
                whiteSpace: isMobile ? "normal" : "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              View and manage all your product reviews
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        {currentReviews.length > 0 ? (
          currentReviews.map((review, index) => (
            <div className="col-md-6 col-12 mb-4" key={index}>
              {renderReviewCard(review, index)}
            </div>
          ))
        ) : (
          <div className="col-12" style={emptyStateStyle}>
            <i className="far fa-comment-alt" style={emptyIconStyle}></i>
            <h4 style={emptyTitleStyle}>No Reviews Yet</h4>
            <p style={emptyTextStyle}>You haven't reviewed any products yet.</p>
          </div>
        )}
      </div>

      {totalReviews > reviewsPerPage && (
        <div className="pagination dashboard-pagination mt-4">
          <ul className="d-flex justify-content-center align-items-center gap-1">
            <li>
              <button
                className="page-link"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <li key={number}>
                  <button
                    className={`page-link ${currentPage === number ? "active" : ""}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                </li>
              ),
            )}

            <li>
              <button
                className="page-link"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "15px",
};

const gridStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",
};

const buttonStyle = {
  padding: "8px 16px",
  borderRadius: "6px",
  backgroundColor: "#8059ca",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
  transition: "background-color 0.2s",
};

const emptyStateStyle = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "40px 20px",
  color: "#666",
};

const emptyIconStyle = {
  fontSize: "36px",
  color: "#ddd",
  marginBottom: "12px",
  display: "block",
};

const emptyTitleStyle = {
  margin: "0 0 8px 0",
  color: "#444",
  fontWeight: 500,
  fontSize: "16px",
};

const emptyTextStyle = {
  margin: "0 0 16px 0",
  fontSize: "14px",
  color: "#777",
};

export default Reviews;
