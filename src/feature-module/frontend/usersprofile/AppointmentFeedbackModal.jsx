import { useState, useEffect } from "react";
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from "react-bootstrap";
import { axiosInstance } from "../../../Apiservice";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../utils";

const AppointmentFeedbackOffcanvas = ({ isOpen, toggle, order, onReviewSubmitted }) => {
  const [vendorRatings, setVendorRatings] = useState({}); // vendorId -> rating
  const [productRatings, setProductRatings] = useState({}); // uniqueKey -> rating
  const [comments, setComments] = useState({}); // uniqueKey -> comment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupedItems, setGroupedItems] = useState([]);

  // Helper functions matching Appointment-Order.jsx exactly
  const getOrderItemName = (item) => {
    return (
      item?.productSnapshot?.name ||
      item?.productDetails?.tabletdetails?.name ||
      item?.packageDetails?.name ||
      "N/A"
    );
  };

  const resolveOrderItemImage = (item) => {
    if (
      Array.isArray(item?.productSnapshot?.imageUrl) &&
      item.productSnapshot.imageUrl.length > 0
    ) {
      return getImageUrl(item.productSnapshot.imageUrl[0]);
    }

    if (
      Array.isArray(item?.productDetails?.tabletdetails?.imageUrl) &&
      item.productDetails.tabletdetails.imageUrl.length > 0
    ) {
      return getImageUrl(item.productDetails.tabletdetails.imageUrl[0]);
    }

    if (
      Array.isArray(item?.productDetails?.variantcurrentDetails?.files) &&
      item.productDetails.variantcurrentDetails.files.length > 0
    ) {
      return getImageUrl(item.productDetails.variantcurrentDetails.files[0]);
    }

    if (
      Array.isArray(item?.packageDetails?.files) &&
      item.packageDetails.files.length > 0
    ) {
      return getImageUrl(item.packageDetails.files[0]);
    }

    return "/assets/default.png";
  };

  const resolveItemVendor = (item) => {
    const vendorDetails =
      (Array.isArray(item?.packageDetails?.vendorDetails) &&
        item.packageDetails.vendorDetails.length > 0
        ? item.packageDetails.vendorDetails[0]
        : null) ||
      (Array.isArray(item?.productDetails?.vendorDetails) &&
        item.productDetails.vendorDetails.length > 0
        ? item.productDetails.vendorDetails[0]
        : null) ||
      (Array.isArray(item?.productSnapshot?.vendorDetails) &&
        item.productSnapshot.vendorDetails.length > 0
        ? item.productSnapshot.vendorDetails[0]
        : null);

    if (!vendorDetails) return null;

    const rawImage = Array.isArray(vendorDetails.bussiness_image)
      ? vendorDetails.bussiness_image[0]?.url
      : vendorDetails.bussiness_image?.url;

    return {
      vendorId: vendorDetails.vendorId || vendorDetails._id,
      name: vendorDetails.name || vendorDetails.bussiness_name || "N/A",
      imageUrl: rawImage ? getImageUrl(rawImage) : "/assets/default.png",
      address: vendorDetails.address || vendorDetails.bussiness_address || "",
      phone: vendorDetails.phone || vendorDetails.bussiness_mobile || "",
      email: vendorDetails.email || vendorDetails.bussiness_email || "",
      location: vendorDetails.location || null,
    };
  };

  useEffect(() => {
    let items = [];

    if (Array.isArray(order?.groupDetails) && order.groupDetails.length > 0) {
      items = order.groupDetails?.flatMap(group => group?.items || []);
    } else if (Array.isArray(order?.items) && order.items.length > 0) {
      items = order.items;
    }

    // Filter duplicates using the exact same keys
    const uniqueItems = [];
    const seenKeys = new Set();

    items.forEach(item => {
      if (!item) return;

      const vendor = resolveItemVendor(item);
      const vendorId = vendor?.vendorId || "unknown_vendor";
      const productId = item.productId || item.packageId || "";
      const key = `${vendorId}-${productId}`;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueItems.push(item);
      }
    });

    // Group items by vendor
    const groups = {};

    uniqueItems.forEach(item => {
      const vendor = resolveItemVendor(item);
      const vendorId = vendor?.vendorId || "unknown_vendor";

      if (!groups[vendorId]) {
        groups[vendorId] = {
          vendor: vendor || { vendorId, name: "Healthcare Partner", imageUrl: "/assets/default.png" },
          vendorId,
          items: []
        };
      }
      groups[vendorId].items.push(item);
    });

    setGroupedItems(Object.values(groups));
  }, [order]);

  const handleVendorRating = (vendorId, rating) => {
    setVendorRatings((prev) => ({
      ...prev,
      [vendorId]: rating,
    }));
  };

  const handleProductRating = (itemKey, rating) => {
    setProductRatings((prev) => ({
      ...prev,
      [itemKey]: rating,
    }));
  };

  const handleCommentChange = (itemKey, comment) => {
    setComments((prev) => ({
      ...prev,
      [itemKey]: comment,
    }));
  };

  const clearAllRatings = () => {
    setVendorRatings({});
    setProductRatings({});
    setComments({});
  };

  const handleClose = () => {
    clearAllRatings();
    toggle();
  };

  const handleSubmit = async () => {
    if (!groupedItems?.length) {
      toast.error("No items found.");
      return;
    }

    // Validation: check that each vendor is rated
    for (const group of groupedItems) {
      const vRating = Number(vendorRatings[group.vendorId]) || 0;
      if (vRating < 1 || vRating > 5) {
        const vendorName = group.vendor?.name || "the vendor";
        toast.error(`Please provide a rating for the vendor: ${vendorName}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const vendorIds = groupedItems.map(g => g.vendorId).filter(Boolean);
      const ratingsArray = [];

      groupedItems.forEach(group => {
        const vRating = Number(vendorRatings[group.vendorId]) || 0;

        group.items.forEach(item => {
          const productId = item.productId || null;
          const packageId = item.packageId || null;
          const key = `${group.vendorId}-${productId || packageId}`;

          const pRating = Number(productRatings[key]) || 0;
          const comment = String(comments[key] || "").trim();

          const ratingData = {
            productId,
            packageId,
            vendorId: group.vendorId || null,
            rating: Math.min(5, Math.max(0, pRating)),
            vendorrating: Math.min(5, Math.max(0, vRating)),
            productreviewType: "product",
          };

          if (comment) {
            ratingData.comment = comment;
          }

          ratingsArray.push(ratingData);
        });
      });

      const payload = {
        orderId: order?._id || order?.orderId,
        vendorIds,
        ratings: ratingsArray,
      };

      const token = localStorage.getItem("medicomparestoken");
      const response = await axiosInstance.post("rating/multirating", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success("Feedback submitted successfully!");
        if (onReviewSubmitted) {
          onReviewSubmitted(order?._id || order?.orderId);
        }
        clearAllRatings();
        toggle();
      } else {
        toast.error(response.data?.message || "Failed to submit feedback");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Error submitting feedback",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .vendor-review-card {
          background: #f8f6fc;
          border: 1px solid #eadeff;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 2px 6px rgba(128, 89, 202, 0.04);
        }

        .vendor-header-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          border-bottom: 1px dashed #e2d5f8;
          padding-bottom: 12px;
        }

        .product-review-subcard {
          background: #ffffff;
          border: 1px solid #f0ecf7;
          border-radius: 10px;
          padding: 12px;
          margin-top: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .rating-star-btn i {
          font-size: 16px;
          color: #cfcfcf;
          cursor: pointer;
          margin-right: 4px;
          transition: color 0.15s ease;
        }

        .rating-star-btn i.active {
          color: #ffc107;
        }

        .vendor-logo-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #8059ca;
        }

        .product-thumbnail-img {
          width: 45px;
          height: 45px;
          border-radius: 8px;
          object-fit: contain;
          background: #fdfdfd;
        }

        .submit-btn-container {
          border-top: 1px solid #eef0f2;
          background: #ffffff;
        }

        .submit-action-btn {
          border: none;
          width: 100%;
          background: #8059ca;
          color: #ffffff;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .submit-action-btn:hover {
          background: #6d46b8;
        }

        .submit-action-btn:disabled {
          background: #cccccc;
        }
      `}</style>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999999999,
          }}
          onClick={handleClose}
        />
      )}

      <Offcanvas
        show={isOpen}
        onHide={handleClose}
        placement="end"
        style={{ width: "380px", zIndex: 1000000000 }}
      >
        <OffcanvasHeader closeButton className="fw-bold">
          Appointment Feedback
        </OffcanvasHeader>

        <OffcanvasBody style={{ paddingBottom: "90px", backgroundColor: "#fafafc" }}>
          {groupedItems.map((group) => {
            const vendor = group.vendor;
            const vendorId = group.vendorId;

            const vendorImage = vendor?.bussiness_image?.[0]?.url || vendor?.imageUrl;
            const formattedVendorImage = vendorImage
              ? getImageUrl(vendorImage)
              : "/assets/default.png";

            return (
              <div key={vendorId} className="vendor-review-card">
                {/* Vendor Section */}
                <div className="vendor-header-row">
                  <img
                    src={formattedVendorImage}
                    className="vendor-logo-img"
                    alt="Vendor Logo"
                    onError={(e) => { e.currentTarget.src = "/assets/default.png"; }}
                  />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a1a" }}>
                      {vendor?.name || "Lab Provider"}
                      <span style={{ color: "#dc3545", marginLeft: "4px" }}>*</span>
                    </div>
                    <div className="rating-star-btn mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fa-solid fa-star ${
                            (vendorRatings[vendorId] || 0) >= star ? "active" : ""
                          }`}
                          onClick={() => handleVendorRating(vendorId, star)}
                        ></i>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Products/Tests List under this Vendor */}
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "8px" }}>
                  Items Booked:
                </div>
                {group.items.map((item) => {
                  const productId = item.productId || item.packageId || "";
                  const key = `${vendorId}-${productId}`;

                  const productName = getOrderItemName(item);
                  const productImage = resolveOrderItemImage(item);

                  return (
                    <div key={productId} className="product-review-subcard">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <img
                          src={productImage}
                          className="product-thumbnail-img"
                          alt={productName}
                          onError={(e) => { e.currentTarget.src = "/assets/default.png"; }}
                        />
                        <div style={{ fontWeight: 500, fontSize: "13px", color: "#333", wordBreak: "break-word" }}>
                          {productName}
                        </div>
                      </div>

                      {/* Product Rating */}
                      <div className="rating-star-btn mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fa-solid fa-star ${
                              (productRatings[key] || 0) >= star ? "active" : ""
                            }`}
                            onClick={() => handleProductRating(key, star)}
                          ></i>
                        ))}
                      </div>

                      {/* Product Comment */}
                      <textarea
                        className="form-control form-control-sm"
                        placeholder="Add your review for this item..."
                        rows="2"
                        value={comments[key] || ""}
                        onChange={(e) => handleCommentChange(key, e.target.value)}
                        style={{ fontSize: "12px", borderRadius: "6px" }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </OffcanvasBody>

        <div className="p-3 position-absolute bottom-0 start-0 end-0 submit-btn-container border-top">
          <button
            className="submit-action-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </Offcanvas>
    </>
  );
};

export default AppointmentFeedbackOffcanvas;
