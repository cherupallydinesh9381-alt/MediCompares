import React from "react";

/**
 * AppointmentOrderCard
 *
 * Reusable card component for displaying a single appointment order.
 *
 * Props:
 *  - order           {object}   The order object from the API
 *  - onView          {function} Called with (order) when user clicks to view details
 *  - onInvoice       {function} Called with (order) to download invoice
 *  - onReschedule    {function} Called with (order) to open reschedule modal
 *  - onReview        {function} Called with (order) to open review modal
 *  - onReportIssue   {function} Called with (order) to open report-issue modal
 *  - resolveOrderImage {function} (order) => imageUrl string
 *  - getOrderVendors  {function} (order) => array of vendor objects
 *  - getOrderStatusMeta {function} (status) => { badgeClass, label }
 */
const AppointmentOrderCard = ({
  order,
  onView,
  onInvoice,
  onReschedule,
  onReview,
  onReportIssue,
  resolveOrderImage,
  getOrderVendors,
  getOrderStatusMeta,
  selectedFilterTab
}) => {
  const getOrderItems = (order) => {
    if (Array.isArray(order?.items) && order.items.length > 0) {
      return order.items;
    }

    if (Array.isArray(order?.groupDetails)) {
      return order.groupDetails.flatMap((group) => group.items || []);
    }

    return [];
  };

  const orderItems = getOrderItems(order);
  const firstItem = orderItems[0];
  const statusMeta = getOrderStatusMeta(order.orderStatus);
  const allVendors = getOrderVendors(order);

  return (
    <div className="order-card d-flex flex-column justify-content-between">
      <div>
        {/* ── HEADER: Order ID + Date + Appointment slot ── */}
        <div className="order-header">
          <div className="d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div
                className="order-id"
                style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}
              >
                #{order.orderId}
              </div>
            </div>
            <div className="order-date" style={{ fontSize: "12px" }}>
              Booked at{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="d-flex flex-column align-items-end gap-2">
            {/* Appointment date/time pill */}
            {order?.selectedDate && order?.selectedTimeSlot && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  // console.log(selectedFilterTab);
                  if (selectedFilterTab !== "upcoming" || order?.isRescheduled || order?.orderStatus === "completed" || order?.orderStatus === "sample_collected") return;
                  onReschedule(order);

                }}
                style={{
                  background: "#f5f3ff",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px dashed #8059ca",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  cursor: order?.isRescheduled ? "default" : "pointer",
                  transition: "background 0.2s",
                }}
                title={order?.isRescheduled ? "" : "Click to reschedule"}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "#8059ca",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <i className="fa-solid fa-calendar-days" />
                  Appointment:
                </span>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#333",
                    marginTop: "2px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(() => {
                    try {
                      const d = new Date(order.selectedDate);
                      return isNaN(d.getTime())
                        ? order.selectedDate
                        : `${d.getUTCFullYear()}-${String(
                          d.getUTCMonth() + 1,
                        ).padStart(2, "0")}-${String(d.getUTCDate()).padStart(
                          2,
                          "0",
                        )}`;
                    } catch {
                      return order.selectedDate;
                    }
                  })()}{" "}
                  at {order.selectedTimeSlot}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── BODY: Image + Details ── */}
        <div className="d-flex align-items-start gap-3 flex-sm-nowrap flex-wrap">
          {/* Product image */}
          <div
            onClick={() => onView(order)}
            style={{
              position: "relative",
              cursor: "pointer",
              display: "inline-block",
              flexShrink: 0,
              marginBottom: "10px",
            }}
          >
            <img
              src={resolveOrderImage(order)}
              className="product-img"
              style={{ width: "70px", height: "70px", objectFit: "contain" }}
              alt="Product"
              onError={(e) => {
                e.currentTarget.src = "/medicine.jpg";
              }}
            />
            {orderItems.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "#8059ca",
                  fontSize: "12px",
                  fontWeight: "600",
                  textDecoration: "underline",
                  whiteSpace: "nowrap",
                }}
              >
                +{orderItems.length - 1} more items
              </div>
            )}
          </div>

          {/* Product details */}
          <div style={{ minWidth: 0, flex: 1, width: "100%" }}>
            <div
              className="product-title text-capitalize"
              style={{ cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
              onClick={() => onView(order)}
            >
              {firstItem?.productSnapshot?.name ||
                firstItem?.productSnapshot?.productDetails?.tabletDetails
                  ?.name ||
                firstItem?.productDetails?.variantcurrentDetails?.productname ||
                firstItem?.packageDetails?.name ||
                "Not Available"}

              {/* {order?.groupDetails?[0]?.items?.[0]?.productSnapshot?.productname ||
              order?.groupDetails?.[0]?.items?.[0]?.productSnapshot?.productDetails?.tabletDetails?.name }     */}
            </div>

            <div className="row mt-2">
              <div className="col-4">
                <div className="info-label" style={{ fontSize: "12px" }}>
                  Payment Status:
                </div>
                <div
                  className="info-value text-capitalize"
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color:
                      order.paymentStatus === "paid" ? "#28a745" : "#ffc107",
                  }}
                >
                  {order.paymentStatus
                    ? order.paymentStatus.toLowerCase()
                    : "N/A"}
                </div>
              </div>
              <div className="col-4">
                <div className="info-label" style={{ fontSize: "12px" }}>
                  Payment Method:
                </div>
                <div className="info-value text-capitalize" style={{ fontSize: "12px" }}>
                  {order.paymentmethod
                    ? order.paymentmethod.toLowerCase()
                    : "N/A"}
                </div>
              </div>
              <div className="col-4">
                <div className="info-label" style={{ fontSize: "12px" }}>
                  Appointment Status:
                </div>
                <div className="info-value" style={{ fontSize: "12px" }}>
                  <span
                    className={`status-badge ${statusMeta.badgeClass}`}
                    style={{ fontSize: "11px", padding: "3px 8px" }}
                  >
                    {statusMeta.label || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER: Amount + Action Buttons ── */}
      <div className="col-12 d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
        <div>
          <span
            className="info-label"
            style={{ fontSize: "12px", marginRight: "6px" }}
          >
            Amount:
          </span>
          <span
            className="amount"
            style={{ fontSize: "16px", fontWeight: "700" }}
          >
            ₹{order.billingSummary.subtotal?.toFixed(2) || "0.00"}
          </span>
        </div>

        {order?.orderStatus !== "failed" && (
          <div className="d-flex flex-wrap gap-2">
            {/* View Details */}
            <button
              type="button"
              className="btn order-action-btn"
              style={{ padding: "4px 8px", fontSize: "11px" }}
              onClick={() => onView(order)}
            >
              <i className="fas fa-eye" />
              View Details
            </button>

            {/* Medical report download */}
            {firstItem?.reportfile && (
              <a
                href={firstItem.reportfile}
                download={`Report_${order.orderId}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn order-action-btn"
                style={{ padding: "4px 8px", fontSize: "11px" }}
              >
                <i className="fas fa-file-medical" />
                Report
              </a>
            )}

            {/* Invoice */}
            {order?.paymentStatus !== "pending" && order?.paymentStatus !== "failed" &&
              order?.paymentStatus !== "cancelled" && order?.orderStatus !== "cancelled" && order?.orderStatus !== "failed" && (
                <button
                  type="button"
                  className="btn order-action-btn"
                  style={{ padding: "4px 8px", fontSize: "11px" }}
                  onClick={() => onInvoice(order)}
                >
                  <i className="fas fa-receipt" />
                  Invoice
                </button>
              )}

            {/* Reschedule */}
            {order?.selectedDate &&
              !order?.isRescheduled &&
              order?.paymentStatus !== "cancelled" && order?.orderStatus !== "cancelled" && order?.orderStatus !== "failed" && selectedFilterTab === "upcoming" && order?.orderStatus !== "sample_collected" && order?.orderStatus !== "completed" && (
                <button
                  type="button"
                  className="btn order-action-btn"
                  style={{ padding: "4px 8px", fontSize: "11px" }}
                  onClick={() => onReschedule(order)}
                >
                  <i className="fas fa-calendar-check" />
                  Reschedule
                </button>
              )}

            {/* Review (only for package orders that haven't been rated) */}
            {
              order?.isRated === false && order?.paymentStatus !== "pending" &&
              order?.paymentStatus !== "cancelled" && order?.orderStatus !== "cancelled" && order?.orderStatus !== "failed" && (
                <button
                  type="button"
                  className="btn order-action-btn"
                  style={{ padding: "4px 8px", fontSize: "11px" }}
                  onClick={() => onReview(order)}
                >
                  <i className="fas fa-star" />
                  Review
                </button>
              )}

            {/* Report Issue / Support ticket */}
            {!order?.isRaiseTicket && order?.paymentStatus !== "pending" &&
              order?.paymentStatus !== "cancelled" && order?.orderStatus !== "cancelled" && order?.orderStatus !== "failed" && order?.orderStatus !== "completed" && (
                <button
                  type="button"
                  className="btn order-action-btn"
                  style={{ padding: "4px 8px", fontSize: "11px" }}
                  onClick={() => onReportIssue(order)}
                >
                  <i className="fas fa-headset" />
                  Report Issue
                </button>
              )}
          </div>
        )}
      </div>

      {/* ── VENDOR STRIP ── */}
      {allVendors?.length > 0 && (
        <div
          className="mt-2 p-2"
          style={{
            background: "#faf9fe",
            border: "1px solid #f1eff9",
            borderRadius: "8px",
            fontSize: "11px",
          }}
        >
          {allVendors.map((vendor, idx) => (
            <div
              key={vendor.vendorId || vendor.name || idx}
              className="d-flex align-items-center justify-content-between flex-wrap gap-2"
              style={{
                borderBottom: idx < allVendors.length - 1 ? "1px solid #f1eff9" : "none",
                paddingBottom: idx < allVendors.length - 1 ? "6px" : "0",
                marginBottom: idx < allVendors.length - 1 ? "6px" : "0",
              }}
            >
              <div
                className="d-flex align-items-center gap-2"
                style={{ minWidth: 0, flex: 1 }}
              >
                <img
                  src={vendor.imageUrl}
                  alt={vendor.name}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #e1dcf5",
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/medicine.jpg";
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#4f358a",
                      fontSize: "11.5px",
                      textTransform: "capitalize",
                    }}
                  >
                    {vendor.name}
                  </div>
                  {vendor.address && (
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "10.5px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                      title={vendor.address}
                    >
                      <i
                        className="fa-solid fa-location-dot me-1"
                        style={{ color: "#a088d8" }}
                      />
                      {vendor.address}
                    </div>
                  )}
                </div>

                {/* Show Maps link */}
                {(vendor.location?.coordinates?.length === 2 ||
                  vendor.address) && (
                    <a
                      href={
                        vendor.location?.coordinates?.length === 2
                          ? `https://www.google.com/maps?q=${vendor.location.coordinates[1]},${vendor.location.coordinates[0]}`
                          : `https://www.google.com/maps?q=${encodeURIComponent(
                            vendor.address,
                          )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center gap-1 text-decoration-none"
                      style={{
                        fontSize: "10px",
                        color: "#8059ca",
                        fontWeight: "600",
                        padding: "2px 6px",
                        border: "1px solid #8059ca",
                        borderRadius: "4px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <i className="fa-solid fa-map-location-dot" />
                      Show Maps
                    </a>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentOrderCard;
