import React from "react";

/**
 * CartOrderCard
 *
 * Reusable card component for displaying a single cart / booking order.
 * Matches the AppointmentOrderCard style exactly.
 *
 * Props:
 *  - order              {object}   The order object from the API
 *  - onView             {function} Called with (order) when user clicks details
 *  - onInvoice          {function} Called with (order) to download invoice
 *  - onReschedule       {function} Called with (order) to open reschedule modal
 *  - onReportIssue      {function} Called with (order) to open report-issue modal
 *  - resolveOrderImage  {function} (order) => imageUrl string
 *  - getOrderVendors    {function} (order) => array of vendor objects
 *  - getOrderStatusMeta {function} (status) => { badgeClass, label }
 */
const CartOrderCard = ({
  order,
  onView,
  onReview,
  onInvoice,
  onReschedule,
  onReportIssue,
  onCancel,
  resolveOrderImage,
  getOrderVendors,
  getOrderStatusMeta,
}) => {
  const firstItem = order?.items?.[0];
  const statusMeta = getOrderStatusMeta(order.orderStatus);
  const allVendors = getOrderVendors(order);
  const total = order?.billingSummary?.total ?? order?.billingSummary?.finalAmount ?? order?.total ?? 0;

  return (
    <div
      className="order-card p-3 h-100 d-flex flex-column justify-content-between"
      style={{
        background: "#fff",
        border: "1.5px solid #f0f0f0",
        borderRadius: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      <div>
        {/* ── HEADER: Order ID + vendor inline + date + status badge ── */}
        <div
          className="order-header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 pb-2"
          style={{ borderBottom: "1px solid #f8f8f8" }}
        >
          <div className="d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span
                className="order-id"
                style={{ fontSize: "14px", fontWeight: "700", color: "#333" }}
              >
                #{order.orderId}
              </span>

              {allVendors.length > 0 && (
                <>
                  <span style={{ color: "#ddd" }}>|</span>
                  <div className="d-flex align-items-center gap-1">
                    <img
                      src={allVendors[0].imageUrl}
                      alt={allVendors[0].name}
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/medicine.jpg";
                      }}
                    />
                    <span
                      style={{ fontSize: "12px", color: "#8059ca", fontWeight: 600, textTransform: "capitalize" }}
                    >
                      {allVendors[0].name}
                    </span>
                  </div>
                </>
              )}
            </div>

            <span style={{ fontSize: "11px", color: "#999" }}>
              Ordered on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <span
            className={`status-badge ${statusMeta.badgeClass}`}
            style={{
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "30px",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* Cancellation Reason Alert */}
        {(order.orderStatus?.toLowerCase() === "cancelled" || order.orderStatus?.toLowerCase() === "canceled") && order.cancelReason && (
          <div
            className="mb-3 p-2 d-flex align-items-center gap-2"
            style={{
              background: "#fff5f5",
              border: "1px solid #ffe3e3",
              borderRadius: "8px",
              fontSize: "11.5px",
              color: "#c53030",
            }}
          >
            <i className="fa-solid fa-circle-info" style={{ color: "#e53e3e" }} />
            <span>
              <strong>Cancellation Reason:</strong> {order.cancelReason}
            </span>
          </div>
        )}

        {/* ── CARD BODY: Image + Info ── */}
        <div className="row align-items-start">
          {/* IMAGE */}
          <div className="col-sm-3 col-12 mb-3 mb-sm-0">
            <div
              onClick={() => onView(order)}
              style={{
                position: "relative",
                cursor: "pointer",
                width: "72px",
                height: "72px",
                border: "1px solid #eee",
                borderRadius: "10px",
                overflow: "hidden",
                background: "#fafafa",
              }}
            >
              <img
                src={resolveOrderImage(order)}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                alt="Product"
                onError={(e) => {
                  e.currentTarget.src = "/medicine.jpg";
                }}
              />
              {order?.items?.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(128, 89, 202, 0.85)",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: "700",
                    textAlign: "center",
                    padding: "1px 0",
                  }}
                >
                  +{order.items.length - 1} more
                </div>
              )}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="col-sm-9 col-12">
            <div
              className="product-title mb-2"
              style={{
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                color: "#222",
                textTransform: "capitalize",
              }}
              onClick={() => onView(order)}
            >
              {firstItem?.productSnapshot?.name ||
                firstItem?.productDetails?.tabletdetails?.name ||
                firstItem?.productDetails?.variantcurrentDetails?.productname ||
                firstItem?.packageDetails?.name ||
                "Not Available"}
            </div>

            <div className="row g-2">
              <div className="col-6">
                <div style={{ fontSize: "11px", color: "#aaa" }}>Payment</div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: order.paymentStatus === "paid" ? "#28a745" : "#e0a000",
                    textTransform: "capitalize",
                  }}
                >
                  {order.paymentStatus
                    ? order.paymentStatus.toLowerCase()
                    : "N/A"}
                </div>
              </div>
              <div className="col-6">
                <div style={{ fontSize: "11px", color: "#aaa" }}>Method</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#444", textTransform: "capitalize" }}>
                  {order.paymentmethod ? order.paymentmethod.toLowerCase() : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER: Total Paid + Action Buttons ── */}
      <div
        className="d-flex flex-column align-items-sm-end justify-content-between mt-3 pt-2"
        style={{ borderTop: "1px solid #f8f8f8" }}
      >
        <div className="d-flex justify-content-between align-items-center w-100 mb-2">
          <div>
            <span style={{ fontSize: "11px", color: "#aaa" }}>Total Paid</span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#7c4dc4",
                display: "block",
              }}
            >
              ₹{total != null ? Number(total).toFixed(2) : "0.00"}
            </span>
          </div>

          {order?.orderStatus !== "failed" && (
            <div className="d-flex gap-2 col-8 justify-content-end flex-wrap">
              {/* Details */}
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-1"
                style={{
                  borderRadius: "6px",
                  fontSize: "11px",
                  padding: "6px 12px",
                  borderColor: "#e0e0e0",
                }}
                onClick={() => onView(order)}
              >
                <i className="fa-solid fa-eye" /> Details
              </button>

              {/* Report download */}
              {firstItem?.reportfile && (
                <a
                  href={firstItem.reportfile}
                  download={`Report_${order._id}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary d-flex align-items-center gap-1"
                  style={{
                    borderRadius: "6px",
                    fontSize: "11px",
                    padding: "6px 12px",
                    borderColor: "#e0e0e0",
                  }}
                >
                  <i className="fas fa-file-medical" /> Report
                </a>
              )}

              {/* Invoice */}
              {order?.paymentStatus !== "pending" &&
                order?.paymentStatus !== "cancelled" && order?.orderStatus !== "cancelled" && order?.orderStatus !== "failed" && order?.orderStatus !== "returned" && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-1"
                    style={{
                      borderRadius: "6px",
                      fontSize: "11px",
                      padding: "6px 12px",
                      borderColor: "#e0e0e0",
                    }}
                    onClick={() => onInvoice(order)}
                  >
                    <i className="fa-solid fa-file-invoice" /> Invoice
                  </button>
                )}

              {(!order?.isRated) && order?.paymentStatus !== "pending" &&
                order?.paymentStatus !== "cancelled" && order?.orderStatus !== "cancelled" && order?.orderStatus !== "failed" && order?.orderStatus !== "returned" && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-1"
                    style={{
                      borderRadius: "6px",
                      fontSize: "11px",
                      padding: "6px 12px",
                      borderColor: "#e0e0e0",
                    }}
                    onClick={() => onReview(order)}
                  >
                    <i className="fa-solid fa-star" /> Review
                  </button>
                )}


              {/* Reschedule */}
              {/* {order?.selectedDate &&
                order?.selectedTimeSlot &&
                !order?.isRescheduled &&
                order?.paymentStatus !== "pending" &&
                order?.paymentStatus !== "cancelled" &&
                order?.orderStatus !== "cancelled" &&
                order?.orderStatus !== "failed" &&
                order?.orderStatus !== "refunded" &&
                (
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-1"
                    style={{
                      borderRadius: "6px",
                      fontSize: "11px",
                      padding: "6px 12px",
                      borderColor: "#e0e0e0",
                    }}
                    onClick={() => onReschedule(order)}
                  >
                    <i className="fas fa-calendar-check" /> Reschedule
                  </button>
                )} */}

              {/* Report Issue */}
              {!order?.isRaiseTicket && order?.paymentStatus !== "pending" && order?.paymentStatus !== "refunded" &&
                order?.paymentStatus !== "cancelled" && order?.orderStatus !== "cancelled" && order?.orderStatus !== "failed" && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-1"
                    style={{
                      borderRadius: "6px",
                      fontSize: "11px",
                      padding: "6px 12px",
                      borderColor: "#e0e0e0",
                    }}
                    onClick={() => onReportIssue(order)}
                  >
                    <i className="fas fa-headset" /> Report
                  </button>
                )}

              {/* Cancel Order */}
              {!["completed", "delivered", "cancelled", "canceled", "failed", "returned"].includes(order.orderStatus?.toLowerCase()) && (
                <button
                  type="button"
                  className="btn btn-outline-danger d-flex align-items-center gap-1"
                  style={{
                    borderRadius: "6px",
                    fontSize: "11px",
                    padding: "6px 12px",
                  }}
                  onClick={() => onCancel(order)}
                >
                  <i className="fa-solid fa-ban" /> Cancel Order
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartOrderCard;
