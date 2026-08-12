import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoiceTemplate from "../InvoiceTemplate";
import { axiosUserInstance, axiosCommonInstance } from "../../../../Apiservice";
import VendorCalendarSlotPicker from "../../pharmacy/VendorCalendarSlotPicker";
import { getImageUrl } from "../../../../utils/index";
import { useMediaQuery } from "react-responsive";
import toast from "react-hot-toast";
import OrderFeedbackOffcanvas from "../OrdersReviewModal";

const customStyles = `
  .order-card {
    background: #fff;
    border-radius: 10px;
    padding: 12px 14px;
    box-shadow: 0 2px 12px rgba(128, 89, 202, 0.05);
    margin-bottom: 16px;
    transition: all 0.3s ease;
    border: 1px solid #f0edf7;
    // border-left: 4px solid #8059ca;
    height: 100%;
  }

  .order-card:hover {
    box-shadow: 0 6px 18px rgba(128, 89, 202, 0.12);
    transform: translateY(-1px);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    margin-bottom: 10px;
    overflow: visible;
  }

  .order-id {
    font-weight: 600;
    font-size: 15px;
  }

  .order-date {
    font-size: 13px;
    color: #888;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 12px;
    line-height: 1.35;
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: 500;
    white-space: nowrap;
    overflow: visible;
  }

  .processing,
  .in-progress {
    background-color: #ffe9d6;
    color: #ff7a00;
  }

  .confirmed {
    background-color: #e8f4fd;
    color: #0d6efd;
  }

  .delivered {
    background-color: #d7f5e8;
    color: #00a86b;
  }

  .cancelled {
    background-color: #ffe0e0;
    color: #dc3545;
  }

  .failed {
    background-color: #f8d7da;
    color: #842029;
  }

  .product-img {
    width: 160px;
    height: 90px;
    object-fit:contain;
  }

  .product-title {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 8px;
  }

  .info-label {
    font-size: 13px;
    color: #777;
  }

  .info-value {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .payment-box {
    text-align: right;
  }

  .amount {
    font-weight: 600;
    font-size: 15px;
    margin-top: 5px;
  }

  .order-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    min-width: fit-content;
    white-space: nowrap;
    line-height: 1.2;
    border: 1px solid #8059ca;
    color: #8059ca;
    background: #fff;
    transition: all 0.2s ease;
    text-decoration: none;
    box-shadow: none;
  }

  .order-action-btn:hover,
  .order-action-btn:focus {
    background: #8059ca;
    color: #fff;
    border-color: #8059ca;
    text-decoration: none;
  }

  .order-action-btn i {
    font-size: 12px;
    width: 14px;
    text-align: center;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .order-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .status-badge {
      align-self: flex-start;
    }

    .payment-box {
      text-align: left;
      margin-top: 15px;
    }

    .mobile-no-margin {
      margin-bottom: 0 !important;
    }
  }
`;

const getOrderStatusMeta = (status) => {
  const orderStatus = status?.toLowerCase() || "";
  const isProcessing = orderStatus === "new" || orderStatus === "pending";
  const isDelivered =
    orderStatus === "completed" || orderStatus === "delivered";
  const isConfirmed = orderStatus === "confirmed";
  const isCancelled =
    orderStatus === "cancelled" || orderStatus === "canceled";
  const isFailed = orderStatus === "failed";

  if (isDelivered) {
    return {
      badgeClass: "delivered",
      label: orderStatus === "completed" ? "Completed" : "Delivered",
    };
  }
  if (isConfirmed) {
    return { badgeClass: "confirmed", label: "Confirmed" };
  }
  if (isCancelled) {
    return { badgeClass: "cancelled", label: "Cancelled" };
  }
  if (isFailed) {
    return { badgeClass: "failed", label: "Failed" };
  }
  if (isProcessing) {
    return { badgeClass: "processing", label: "Processing" };
  }
  return {
    badgeClass: "in-progress",
    label: orderStatus ? "In Progress" : "N/A",
  };
};

const parseOrderDate = (dateValue) => {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatDateForApi = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatOrderAppointmentLabel = (order) => {
  try {
    const dateLabel = parseOrderDate(order?.selectedDate).toLocaleDateString(
      "en-US",
      { year: "numeric", month: "short", day: "numeric" },
    );
    return `${dateLabel} (${order?.selectedTimeSlot || ""})`;
  } catch {
    return `${order?.selectedDate || ""} (${order?.selectedTimeSlot || ""})`;
  }
};

const HomeCareBooking = ({ HomeNavigate }) => {
  const invoiceRef = useRef();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportOrder, setSelectedReportOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleOrder, setRescheduleOrder] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState("");
  const [rescheduleCalendarDays, setRescheduleCalendarDays] = useState([]);
  const [rescheduleCalendarMonth, setRescheduleCalendarMonth] = useState(null);
  const [rescheduleCalendarYear, setRescheduleCalendarYear] = useState(null);
  const [rescheduleTimingsLoading, setRescheduleTimingsLoading] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleModalKey, setRescheduleModalKey] = useState(0);
  const [formData, setFormData] = useState({
    product: "",
    category: "",
    subject: "",
    description: "",
    priority: "",
    attachments: [],
  });
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendorOrder, setSelectedVendorOrder] = useState(null);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const ordersPerPage = 4;

  const downloadInvoice = async () => {
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(
            "[data-invoice-template]",
          );
          if (clonedElement) {
            clonedElement.style.transform = "scale(1)";
            clonedElement.style.transformOrigin = "top left";
            clonedElement.style.imageRendering = "crisp-edges";
            clonedElement.style.imageRendering = "-webkit-optimize-contrast";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
      // pdf.save(`Invoice_${selectedOrder.orderId}.pdf`);
      pdf.save("Invoice.pdf");
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate invoice. Please try again.");
    }
  };

  const fetchOrders = async (page = 1, status = "all") => {
    const token = localStorage.getItem("medicomparestoken");
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ordersPerPage.toString(),
        orderstatus: status,
        search: searchTerm,
        type: "medicine"
      });

      const res = await axiosUserInstance.get(
        `orders/list?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setOrders(res?.data?.data?.orders || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
      setCurrentPage(res?.data?.data?.pagination?.currentPage || 1);
    } catch (err) {
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, selectedTab, searchTerm);
  }, [currentPage, selectedTab, searchTerm]);

  const filteredOrders = orders.filter((order) => {
    if (!order.createdAt) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesOrderId = order.orderId?.toLowerCase().includes(searchLower);

      const matchesItemName = order.items?.some((item) => {
        const itemName =
          item?.productDetails?.variantcurrentDetails?.productname ||
          item?.productDetails?.tabletdetails?.name ||
          item?.packageDetails?.name ||
          "";
        return itemName.toLowerCase().includes(searchLower);
      });

      if (!matchesOrderId && !matchesItemName) return false;
    }

    const orderStatus = order.orderStatus?.toLowerCase() || "";

    switch (selectedTab) {
      case "all":
        return true;
      case "delivered":
        return orderStatus === "completed" || orderStatus === "delivered";
      case "cancelled":
        return orderStatus === "cancelled" || orderStatus === "canceled";
      case "failed":
        return orderStatus === "failed";
      default:
        return true;
    }
  });

  const currentOrders = filteredOrders;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowModel(true);
  };

  const handleReview = (order) => {
    setSelectedReviewOrder(order);
    setShowReviewModal(true);
  };

  const handleReportIssue = (order) => {
    setSelectedReportOrder(order);
    setShowReportModal(true);
    setFormData({
      product: "",
      category: "",
      subject: "",
      description: "",
      priority: "",
      attachments: [],
    });
  };

  const fetchVendorCalendar = async (order, month, year) => {
    const vendorId = order?.items?.[0]?.vendorId;
    if (!vendorId) {
      return { days: [], month, year };
    }

    try {
      const token = localStorage.getItem("medicomparestoken");
      const res = await axiosCommonInstance.get("getvendortimings", {
        params: {
          month,
          year,
          vendorId,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const calendarData = res.data?.data || {};
      return {
        days: calendarData.days || [],
        month: calendarData.month || month,
        year: calendarData.year || year,
      };
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to load vendor calendar. Please try again.",
      );
      return { days: [], month, year };
    }
  };

  const loadRescheduleCalendar = async (order, date) => {
    const targetDate = date || new Date();
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();

    setRescheduleTimingsLoading(true);
    try {
      const calendarData = await fetchVendorCalendar(order, month, year);
      setRescheduleCalendarDays(calendarData.days);
      setRescheduleCalendarMonth(calendarData.month);
      setRescheduleCalendarYear(calendarData.year);
    } finally {
      setRescheduleTimingsLoading(false);
    }
  };

  const handleOpenReschedule = async (order) => {
    const initialDate = parseOrderDate(order.selectedDate);
    setRescheduleOrder(order);
    setRescheduleDate(initialDate);
    setRescheduleTimeSlot(order.selectedTimeSlot || "");
    setRescheduleCalendarDays([]);
    setRescheduleCalendarMonth(null);
    setRescheduleCalendarYear(null);
    setRescheduleModalKey((prev) => prev + 1);
    setShowRescheduleModal(true);
    await loadRescheduleCalendar(order, initialDate);
  };

  const handleRescheduleMonthChange = async (month, year) => {
    if (!rescheduleOrder) return;
    await loadRescheduleCalendar(
      rescheduleOrder,
      new Date(year, month - 1, 1),
    );
  };

  const submitRescheduleOrder = async (order, date, timeSlot) => {
    const orderId = order?._id || order?.id;
    if (!orderId || !date || !timeSlot) {
      toast.error("Please select a date and time slot");
      return false;
    }

    const res = await axiosUserInstance.post(
      `orders/reschedule/${orderId}`,
      {
        selectedDate: formatDateForApi(date),
        selectedTimeSlot: timeSlot,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (res.data?.success === false) {
      toast.error(res.data?.message || "Failed to reschedule appointment");
      return false;
    }

    toast.success(
      res.data?.message || "Appointment rescheduled successfully",
    );
    return true;
  };

  const handleRescheduleConfirm = async (date, timeSlot) => {
    if (!rescheduleOrder || !date || !timeSlot || isRescheduling) return;

    setIsRescheduling(true);
    try {
      const success = await submitRescheduleOrder(
        rescheduleOrder,
        date,
        timeSlot,
      );
      if (success) {
        setShowRescheduleModal(false);
        setRescheduleOrder(null);
        fetchOrders(currentPage, selectedTab);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to reschedule appointment. Please try again.",
      );
    } finally {
      setIsRescheduling(false);
    }
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("medicomparestoken");
      const selectedProduct = selectedReportOrder?.items?.find((item) => {
        const productName = formData.product;
        if (item.type === "normal") {
          return item.productDetails?.tabletdetails?.name === productName;
        } else if (item.type === "package") {
          return item.packageDetails?.name === productName;
        }
        return false;
      });

      let productId = null;
      let packageId = null;
      let vendorId = selectedReportOrder?.items?.[0]?.vendorId;

      if (selectedProduct) {
        if (selectedProduct.type === "normal") {
          productId = selectedProduct.productDetails?.tabletdetails?._id;
        } else if (selectedProduct.type === "package") {
          packageId = selectedProduct.packageDetails?._id;
        }
      }

      const formDataPayload = new FormData();
      formDataPayload.append("orderId", selectedReportOrder.orderId || "");
      formDataPayload.append("productId", productId || "");
      formDataPayload.append("packageId", packageId || "");
      formDataPayload.append("vendorId", vendorId || "");
      formDataPayload.append("category", formData.category);
      formDataPayload.append("subject", formData.subject);
      formDataPayload.append("description", formData.description);
      formDataPayload.append("priority", formData.priority);

      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach((file, index) => {
          formDataPayload.append(`attachments`, file);
        });
      }

      const res = await axiosUserInstance.post(
        "raise-ticket/create",
        formDataPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        toast.success("Ticket submitted successfully!");
        setShowReportModal(false);
        // Reset form
        setFormData({
          product: "",
          category: "",
          subject: "",
          description: "",
          priority: "",
          attachments: [],
        });
      } else {
        toast.error(res.data.message || "Failed to submit ticket");
      }
    } catch (error) {
      toast.error("Error submitting ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const productSubtotal = selectedOrder?.subtotal || 0;
  const deliveryFee = selectedOrder?.shipping || 0;
  const cgstAmount = selectedOrder?.cgst || 0;
  const sgstAmount = selectedOrder?.sgst || 0;
  const gstAmount = selectedOrder?.tax || 0;
  const grandTotal = selectedOrder?.total || 0;
  const patientCount = selectedOrder?.groups && selectedOrder.groups.length > 0 ? selectedOrder.groups.length : 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTab]);

  useEffect(() => { }, [showReviewModal]);

  useEffect(() => {
    const styleId = "orders-custom-styles";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.type = "text/css";
      document.head.appendChild(styleElement);
    }

    styleElement.innerHTML = customStyles;

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  const resolveOrderImage = (order) => {
    const item = order?.items?.[0];

    if (
      Array.isArray(item?.productDetails?.tabletdetails?.files) &&
      item.productDetails.tabletdetails.files.length > 0
    ) {
      return getImageUrl(item.productDetails.tabletdetails.files[0]);
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

  const resolveOrderItemImage = (item) => {
    if (
      Array.isArray(item?.productDetails?.tabletdetails?.files) &&
      item.productDetails.tabletdetails.files.length > 0
    ) {
      return getImageUrl(item.productDetails.tabletdetails.files[0]);
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

    return "/assets/img/placeholder.png";
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

  const getOrderVendors = (order) => {
    const seen = new Set();
    const vendors = [];

    (order?.items || []).forEach((item) => {
      const vendor = resolveItemVendor(item);
      if (!vendor) return;

      const key = String(vendor.vendorId || vendor.name);
      if (seen.has(key)) return;

      seen.add(key);
      vendors.push(vendor);
    });

    return vendors;
  };

  const getPatientName = (group, order) => {
    if (group.selectType === "self") {
      return order.userDetails ? `${order.userDetails.first_name || ""} ${order.userDetails.last_name || ""}`.trim() || "Self" : "Self";
    }
    if (group.selectType === "family") {
      const member = order.familyDetails?.find(m => String(m._id) === String(group.patientId));
      return member ? `${member.name} (${member.relationship})` : "Family Member";
    }
    return "Unknown Patient";
  };


  return (
    <div className="main-wrapper">
      <div className="content doctor-content">
        <div className="container">
          <div className="row">
            <div
              className="dashboard-header"
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: isMobile ? "20px 15px" : "25px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                width: "100%",
                overflow: "visible",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                    marginBottom: "12px",
                  }}
                >
                  <HomeNavigate />
                </div>
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
                    maxWidth: isMobile ? "100%" : "calc(100% - 480px)",
                    wordBreak: "break-word",
                    overflow: "hidden",
                  }}
                >
                  <nav
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginBottom: "4px",
                    }}
                    aria-label="breadcrumb"
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#333",
                        fontWeight: "600",
                      }}
                    >
                      <i
                        className="fa-solid fa-pills"
                        style={{
                          color: "#8059ca",
                        }}
                      />
                      <span>Medicine Orders</span>
                    </span>
                  </nav>
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
                    View and manage all your medicine orders
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: "12px",
                    width: isMobile ? "100%" : "auto",
                    alignItems: isMobile ? "stretch" : "center",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: isMobile ? "100%" : "270px",
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search by ID and Name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        height: "42px",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        padding: "10px 15px 10px 40px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                        width: "100%",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                        pointerEvents: "none",
                      }}
                    >
                      <i className="fa-solid fa-search" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="mb-3 position-relative">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "nowrap",
                }}
              >
                {/* Mobile */}
                {isMobile ? (
                  <select
                    value={selectedTab}
                    className="form-select"
                    onChange={(e) => {
                      setSelectedTab(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      border: "1px solid #ddd",
                    }}
                  >
                    {[
                      { id: "pending", label: "In Progress" },
                      { id: "delivered", label: "Delivered" },
                      { id: "cancelled", label: "Cancelled" },
                      { id: "failed", label: "Failed" },
                    ].map((tab) => {
                      const tabCount =
                        tab.id === "all"
                          ? orders.length
                          : orders.filter((order) => {
                            const orderStatus = order.orderStatus?.toLowerCase() || "";
                            switch (tab.id) {
                              case "delivered":
                                return orderStatus === "completed" || orderStatus === "delivered";
                              case "pending":
                                return orderStatus === "pending" || orderStatus === "new";
                              case "cancelled":
                                return orderStatus === "cancelled" || orderStatus === "canceled";
                              case "failed":
                                return orderStatus === "failed";
                              default:
                                return false;
                            }
                          }).length;
                      return (
                        <option key={tab.id} value={tab.id}>
                          {tab.label} {tabCount > 0 && `(${tabCount})`}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  /* Desktop */
                  <ul
                    className="nav nav-tabs nav-tabs-solid"
                    style={{
                      flex: 1,
                      display: "flex",
                      marginBottom: 0,
                      overflow: "visible",
                      minWidth: 0,
                    }}
                  >
                    {[
                      { id: "pending", label: "In Progress", icon: "fa-list" },
                      { id: "delivered", label: "Delivered", icon: "fa-truck" },
                      { id: "cancelled", label: "Cancelled", icon: "fa-times-circle" },
                      { id: "failed", label: "Failed", icon: "fa-exclamation-circle" },
                    ].map((tab) => {
                      const isActive = selectedTab === tab.id;
                      const tabCount =
                        tab.id === "all"
                          ? orders.length
                          : orders.filter((order) => {
                            const orderStatus = order.orderStatus?.toLowerCase() || "";
                            switch (tab.id) {
                              case "delivered":
                                return orderStatus === "completed" || orderStatus === "delivered";
                              case "pending":
                                return orderStatus === "pending" || orderStatus === "new";
                              case "cancelled":
                                return orderStatus === "cancelled" || orderStatus === "canceled";
                              case "failed":
                                return orderStatus === "failed";
                              default:
                                return false;
                            }
                          }).length;

                      return (
                        <li className="nav-item" key={tab.id}>
                          <button
                            className={`nav-link ${isActive ? "active" : ""}`}
                            onClick={() => {
                              setSelectedTab(tab.id);
                              setCurrentPage(1);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <i className={`fa-solid ${tab.icon}`}></i>
                            {tab.label}
                            {tabCount > 0 && (
                              <span
                                style={{
                                  background: isActive ? "rgba(255,255,255,0.3)" : "#e8e0f5",
                                  color: isActive ? "#fff" : "#8059ca",
                                  borderRadius: "10px",
                                  padding: "1px 7px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  minWidth: "20px",
                                  textAlign: "center",
                                }}
                              >
                                {tabCount}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="container py-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : currentOrders.length > 0 ? (
                <div className="row">
                  {currentOrders.map((order, index) => {
                    const statusMeta = getOrderStatusMeta(order.orderStatus);

                    return (
                      <div key={index} className="col-lg-6 col-12 mb-4">
                        <div className="order-card d-flex flex-column justify-content-between">
                          <div>
                            <div className="order-header">
                              <div className="d-flex flex-column gap-1">
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <div className="order-id" style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>
                                    #{order.orderId}
                                  </div>
                                </div>
                                <div className="order-date" style={{ fontSize: "12px" }}>
                                  Booked at{" "}
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </div>
                              </div>
                              <div className="d-flex flex-column align-items-end gap-2">

                                {(order?.selectedDate && order?.selectedTimeSlot) && (
                                  <div
                                    style={{
                                      background: "#f5f3ff",
                                      padding: "6px 10px",
                                      borderRadius: "6px",
                                      border: "1px dashed #8059ca",
                                      textAlign: "left",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start"
                                    }}
                                  >
                                    <span style={{ fontSize: "10px", color: "#8059ca", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                                      <i className="fa-solid fa-calendar-days"></i>
                                      Appointment:
                                    </span>
                                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#333", marginTop: "2px", whiteSpace: "nowrap" }}>
                                      {(() => {
                                        try {
                                          const d = new Date(order.selectedDate);

                                          return isNaN(d.getTime())
                                            ? order.selectedDate
                                            : `${d.getUTCFullYear()}-${String(
                                              d.getUTCMonth() + 1
                                            ).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
                                        } catch (e) {
                                          return order.selectedDate;
                                        }
                                      })()} at {order.selectedTimeSlot}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="d-flex align-items-start gap-3 flex-sm-nowrap flex-wrap">
                              {/* Image */}
                              <div
                                onClick={() => handleView(order)}
                                style={{
                                  position: "relative",
                                  cursor: "pointer",
                                  display: "inline-block",
                                  flexShrink: 0,
                                  marginBottom: "10px"
                                }}
                              >
                                <img
                                  src={resolveOrderImage(order)}
                                  className="product-img"
                                  style={{ width: "70px", height: "70px", objectFit: "contain" }}
                                  alt="Product"
                                  onError={(e) => {
                                    e.currentTarget.src = "/assets/default.png";
                                  }}
                                />
                                {order.items && order.items.length > 1 && (
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
                                    +{order.items.length - 1} more items
                                  </div>
                                )}
                              </div>

                              {/* Details */}
                              <div style={{ minWidth: 0, flex: 1, width: "100%" }}>
                                <div
                                  className="product-title"
                                  style={{ cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                                  onClick={() => handleView(order)}
                                >
                                  {order?.items?.[0]?.productDetails?.tabletdetails?.name ||
                                    order?.items?.[0]?.productDetails?.variantcurrentDetails?.productname ||
                                    order?.items?.[0]?.packageDetails?.name ||
                                    "No Available"}
                                </div>

                                <div className="row mt-2">
                                  <div className="col-4">
                                    <div className="info-label" style={{ fontSize: "12px" }}>Payment Status:</div>
                                    <div className="info-value" style={{ fontSize: "12px", fontWeight: "600", color: order.paymentStatus === "paid" ? "#28a745" : "#ffc107" }}>
                                      {order.paymentStatus
                                        ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
                                        : "N/A"}
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div className="info-label" style={{ fontSize: "12px" }}>Payment Method:</div>
                                    <div className="info-value" style={{ fontSize: "12px" }}>
                                      {order.paymentmethod
                                        ? order.paymentmethod.charAt(0).toUpperCase() + order.paymentmethod.slice(1)
                                        : "N/A"}
                                    </div>
                                  </div>

                                  <div className="col-4">
                                    <div className="info-label" style={{ fontSize: "12px" }}>Appointment Status:</div>
                                    <div className="info-value" style={{ fontSize: "12px" }}>
                                      {statusMeta.label || "N/A"}
                                    </div>
                                  </div>
                                </div>

                                {/* {(order.items.length === 1 && ["diagnostics", "dentalservice"].includes(order.items[0].serviceTypes)) && (
                                  <div className="mt-2">
                                    <div className="info-label" style={{ fontSize: "12px" }}>Service Location:</div>
                                    <div className="info-value" style={{ fontSize: "12px" }}>
                                      {order.items[0].productDetails?.vendorDetails?.[0]?.location?.coordinates ? (
                                        <a
                                          href={`https://www.google.com/maps?q=${order.items[0].productDetails.vendorDetails[0].location.coordinates[1]},${order.items[0].productDetails.vendorDetails[0].location.coordinates[0]}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 underline"
                                          style={{ fontWeight: "500" }}
                                        >
                                          <i className="fa-solid fa-map-location-dot me-1"></i>
                                          {order.items[0].productDetails?.vendorDetails?.[0]?.address || "View Location"}
                                        </a>
                                      ) : (
                                        "N/A"
                                      )}
                                    </div>
                                  </div>
                                )} */}
                              </div>
                            </div>

                          </div>

                          {/* Price & Actions Row */}
                          <div className="col-12   d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div>
                              <span className="info-label" style={{ fontSize: "12px", marginRight: "6px" }}>Amount:</span>
                              <span className="amount" style={{ fontSize: "16px", fontWeight: "700" }}>₹{order.total?.toFixed(2) || "0.00"}</span>
                            </div>
                            {order?.orderStatus !== "failed" && (
                              <div className="d-flex flex-wrap gap-2">
                                {(order?.items?.[0]?.reportfile) && (
                                  <a
                                    href={order.items[0].reportfile}
                                    download={`Report_${order.orderId}.pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn order-action-btn"
                                    style={{ padding: "4px 8px", fontSize: "11px" }}
                                  >
                                    <i className="fas fa-file-medical"></i>
                                    Report
                                  </a>
                                )}
                                {order?.paymentStatus !== ('pending' || 'cancelled') && (
                                  <button
                                    type="button"
                                    className="btn order-action-btn"
                                    style={{ padding: "4px 8px", fontSize: "11px" }}
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setTimeout(() => downloadInvoice(), 100);
                                    }}
                                  >
                                    <i className="fas fa-receipt"></i>
                                    Invoice
                                  </button>
                                )}

                                {(order?.selectedDate && order?.selectedTimeSlot && !order?.isRescheduled) && (
                                  <button
                                    type="button"
                                    className="btn order-action-btn"
                                    style={{ padding: "4px 8px", fontSize: "11px" }}
                                    onClick={() => handleOpenReschedule(order)}
                                  >
                                    <i className="fas fa-calendar-check"></i>
                                    Reschedule
                                  </button>
                                )}

                                {(order?.items?.packageDetails || order?.items?.[0]?.packageDetails) && order?.paymentStatus !== ('pending' || 'cancelled') &&
                                  Object.keys(order?.items?.packageDetails || order?.items?.[0]?.packageDetails).length === 0 &&
                                  order?.isRated === false && (
                                    <button
                                      type="button"
                                      className="btn order-action-btn"
                                      style={{ padding: "4px 8px", fontSize: "11px" }}
                                      onClick={() => handleReview(order)}
                                    >
                                      <i className="fas fa-star"></i>
                                      Review
                                    </button>
                                  )}
                                {!order?.isRaiseTicket && (
                                  <button
                                    type="button"
                                    className="btn order-action-btn"
                                    style={{ padding: "4px 8px", fontSize: "11px" }}
                                    onClick={() => handleReportIssue(order)}
                                  >
                                    <i className="fas fa-headset"></i>
                                    Report Issue
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Vendor details below the row */}
                          {(() => {
                            const allVendors = getOrderVendors(order);
                            if (allVendors.length === 0) return null;
                            return (
                              <div
                                className="mt-2 p-2"
                                style={{
                                  background: "#faf9fe",
                                  border: "1px solid #f1eff9",
                                  borderRadius: "8px",
                                  fontSize: "11px"
                                }}
                              >
                                {allVendors.map((vendor) => (
                                  <div key={vendor.vendorId || vendor.name} className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
                                      <img
                                        src={vendor.imageUrl}
                                        alt={vendor.name}
                                        style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover", border: "1px solid #e1dcf5", flexShrink: 0 }}
                                        onError={(e) => { e.currentTarget.src = "/assets/default.png"; }}
                                      />
                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontWeight: "600", color: "#4f358a", fontSize: "11.5px" }}>{vendor.name}</div>
                                        {vendor.address && (
                                          <div
                                            className="text-muted"
                                            style={{
                                              fontSize: "10.5px",
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              width: "100%"
                                            }}
                                            title={vendor.address}
                                          >
                                            <i className="fa-solid fa-location-dot me-1" style={{ color: "#a088d8" }}></i>
                                            {vendor.address}
                                          </div>
                                        )}
                                      </div>
                                      {(vendor.location?.coordinates?.length === 2 || vendor.address) && (
                                        <a
                                          href={
                                            vendor.location?.coordinates?.length === 2
                                              ? `https://www.google.com/maps/search/?api=1&query=${vendor.location.coordinates[1]},${vendor.location.coordinates[0]}`
                                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.address)}`
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
                                          <i className="fa-solid fa-map-location-dot"></i>
                                          Show Maps
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="empty-state">
                    <i className="fa-solid fa-calendar-times fa-3x text-muted mb-3" style={{ color: "#8059ca" }}></i>
                    <h5 className="text-muted">No appointments found</h5>
                    <p className="text-muted">
                      You haven't booked any appointments yet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {showModel && (
              <div
                onClick={() => setShowModel(false)}
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(15, 23, 42, 0.55)",
                  backdropFilter: "blur(6px)",
                  zIndex: 999999999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#fff",
                    borderRadius: "20px",
                    width: "100%",
                    maxWidth: "560px",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "90vh",
                  }}
                >
                  {/* HEADER */}
                  <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)", padding: "20px 24px 18px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="fas fa-calendar-check" style={{ color: "#fff", fontSize: "15px" }} />
                          </div>
                          <h5 style={{ margin: 0, fontWeight: 700, fontSize: "17px", color: "#fff" }}>Appointment Details</h5>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>ID:</span>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                            {selectedOrder?.orderId || "N/A"}
                          </span>
                          {selectedOrder?.orderStatus && (
                            <span style={{
                              fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", textTransform: "capitalize",
                              background: selectedOrder.orderStatus.toLowerCase() === "completed" ? "rgba(16,185,129,0.25)" : selectedOrder.orderStatus.toLowerCase() === "cancelled" ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.2)",
                              color: "#fff"
                            }}>
                              {selectedOrder.orderStatus}
                            </span>
                          )}
                        </div>
                        {/* Slot chip */}
                        {(selectedOrder?.selectedDate && selectedOrder?.selectedTimeSlot) && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "10px", background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "5px 10px" }}>
                            <i className="fas fa-clock" style={{ color: "#e0d7ff", fontSize: "12px" }} />
                            <span style={{ fontSize: "11.5px", color: "#fff", fontWeight: 600 }}>
                              {(() => {
                                try {
                                  const d = new Date(selectedOrder.selectedDate);
                                  return isNaN(d.getTime()) ? selectedOrder.selectedDate : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                                } catch (_) { return selectedOrder.selectedDate; }
                              })()} · {selectedOrder.selectedTimeSlot}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setShowModel(false)}
                        style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: "16px", flexShrink: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* BODY */}
                  <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>

                    {/* ITEMS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                      {selectedOrder?.items?.length > 0 ? selectedOrder.items.map((orderItem, idx) => {
                        const name = orderItem?.productDetails?.variantcurrentDetails?.productname || orderItem?.productDetails?.tabletdetails?.name || orderItem?.packageDetails?.name || "N/A";
                        const vendorName = (Array.isArray(orderItem?.packageDetails?.vendorDetails) && orderItem.packageDetails.vendorDetails.length > 0)
                          ? orderItem.packageDetails.vendorDetails[0].name
                          : (Array.isArray(orderItem?.productDetails?.vendorDetails) && orderItem.productDetails.vendorDetails.length > 0)
                            ? orderItem.productDetails.vendorDetails[0].name
                            : "N/A";
                        const originalPrice = orderItem?.price || orderItem?.productDetails?.variantDetails?.[0]?.price || orderItem?.productDetails?.price || orderItem?.packageDetails?.price || 0;
                        const discountPrice = orderItem?.discountprice || orderItem?.productDetails?.variantDetails?.[0]?.discountprice || orderItem?.packageDetails?.discountprice || 0;
                        const effectivePrice = discountPrice || originalPrice;
                        const hasDiscount = !!discountPrice && discountPrice < originalPrice;
                        const discountPct = hasDiscount && originalPrice > 0 ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;
                        const itemTotal = (effectivePrice * (orderItem?.quantity || 0) * patientCount).toFixed(2);
                        const status = orderItem?.orderStatus || "";
                        const statusStyle = status.toLowerCase() === "completed"
                          ? { bg: "#d1fae5", color: "#065f46" }
                          : status.toLowerCase() === "cancelled"
                            ? { bg: "#fee2e2", color: "#991b1b" }
                            : { bg: "#fef3c7", color: "#92400e" };
                        return (
                          <div key={idx} style={{ display: "flex", gap: "14px", padding: "14px", background: "#fdf8ff", border: "1.5px solid #ede9fe", borderRadius: "14px", alignItems: "center" }}>
                            <div style={{ width: 72, height: 72, borderRadius: "10px", border: "1px solid #ddd6fe", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                              <img src={resolveOrderItemImage(orderItem)} alt="product" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: "13.5px", color: "#1e1b4b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                  {name.length > 30 ? name.slice(0, 30) + "…" : name}
                                </p>
                                {status && (
                                  <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "5px", background: statusStyle.bg, color: statusStyle.color, flexShrink: 0, textTransform: "capitalize" }}>
                                    {status}
                                  </span>
                                )}
                              </div>
                              <p style={{ margin: "0 0 4px", fontSize: "11.5px", color: "#7c3aed", fontWeight: 600 }}>
                                <i className="fas fa-hospital" style={{ marginRight: "5px", fontSize: "10px" }} />{vendorName}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "11.5px", color: "#64748b" }}>Qty: <strong style={{ color: "#334155" }}>{orderItem?.quantity}{patientCount > 1 ? ` ×${patientCount}` : ""}</strong></span>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                  {hasDiscount && <span style={{ fontSize: "11px", color: "#94a3b8", textDecoration: "line-through" }}>₹{originalPrice}</span>}
                                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a" }}>₹{effectivePrice.toFixed ? effectivePrice.toFixed(2) : effectivePrice}</span>
                                  {hasDiscount && <span style={{ fontSize: "10px", fontWeight: 700, color: "#ef4444", background: "#fee2e2", padding: "1px 5px", borderRadius: "4px" }}>{discountPct}% off</span>}
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "2px" }}>Total</div>
                              <div style={{ fontWeight: 800, fontSize: "14.5px", color: "#7c3aed" }}>₹{itemTotal}</div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div style={{ textAlign: "center", color: "#94a3b8", padding: "24px 0" }}>
                          <i className="fas fa-calendar-times" style={{ fontSize: "28px", marginBottom: "8px" }} />
                          <p style={{ margin: 0 }}>No items found</p>
                        </div>
                      )}
                    </div>

                    {/* PATIENT DETAILS */}
                    {selectedOrder?.groups && selectedOrder.groups.length > 0 && (
                      <div style={{ background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
                          <i className="fas fa-users" style={{ color: "#8059ca", fontSize: "13px" }} />
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#6d28d9" }}>Patient Details ({selectedOrder.groups.length})</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          {selectedOrder.groups.map((group, gIdx) => {
                            const patientName = getPatientName(group, selectedOrder);
                            return (
                              <div key={gIdx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1px solid #ede9fe", borderRadius: "8px", padding: "7px 12px" }}>
                                <span style={{ fontSize: "12.5px", color: "#1e1b4b", fontWeight: 600 }}><span style={{ color: "#8059ca", marginRight: "6px" }}>{gIdx + 1}.</span>{patientName}</span>
                                {group.totalTests && <span style={{ fontSize: "11px", fontWeight: 600, color: "#8059ca", background: "#f3e8ff", padding: "2px 8px", borderRadius: "6px" }}>{group.totalTests} Test{group.totalTests !== 1 ? "s" : ""}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {(!selectedOrder?.groups || selectedOrder.groups.length === 0) && selectedOrder?.familyDetails && selectedOrder.familyDetails.length > 0 && (
                      <div style={{ background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
                          <i className="fas fa-users" style={{ color: "#8059ca", fontSize: "13px" }} />
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#6d28d9" }}>Patient Details ({selectedOrder.familyDetails.length})</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          {selectedOrder.familyDetails.map((member, mIdx) => (
                            <div key={mIdx} style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #ede9fe", borderRadius: "8px", padding: "7px 12px", gap: "8px" }}>
                              <span style={{ color: "#8059ca", fontWeight: 700, fontSize: "12px" }}>{mIdx + 1}.</span>
                              <span style={{ fontSize: "12.5px", color: "#1e1b4b", fontWeight: 600 }}>{member.name}</span>
                              <span style={{ fontSize: "11px", color: "#64748b", background: "#f1f5f9", borderRadius: "5px", padding: "1px 6px" }}>{member.relationship}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DOCTOR DETAILS */}
                    <div style={{ background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
                        <i className="fas fa-user-md" style={{ color: "#8059ca", fontSize: "13px" }} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#6d28d9" }}>Doctor Details</span>
                      </div>
                      <div style={{ background: "#fff", border: "1px solid #ede9fe", borderRadius: "8px", padding: "10px 12px" }}>
                        <span style={{ fontSize: "13px", color: "#1e1b4b", fontWeight: 600 }}>
                          {selectedOrder?.doctorName && selectedOrder?.doctorId ? selectedOrder.doctorName : "Self Referral"}
                        </span>
                      </div>
                    </div>

                    {/* BILL SUMMARY */}
                    <div style={{ background: "#f8fafc", border: "1px solid #e9ecef", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#475569", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bill Summary</div>
                      {[
                        { label: "Product Total", value: `₹${productSubtotal.toFixed(2)}` },
                        { label: "Delivery Fee", value: `₹${deliveryFee.toFixed(2)}` },
                        ...(selectedOrder.samplecollection > 0 ? [{ label: "Sample Collection", value: `₹${selectedOrder.samplecollection.toFixed(2)}` }] : []),
                        { label: "CGST (4%)", value: `₹${cgstAmount.toFixed(2)}` },
                        { label: "SGST (14%)", value: `₹${sgstAmount.toFixed(2)}` },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748b" }}>
                          <span>{label}</span>
                          <span style={{ fontWeight: 600, color: "#334155" }}>{value}</span>
                        </div>
                      ))}
                      {selectedOrder.discount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#16a34a", background: "#f0fdf4", borderRadius: "8px", padding: "6px 10px" }}>
                          <span style={{ fontWeight: 600 }}>Coupon Discount ({Math.round((selectedOrder.discount / (productSubtotal + cgstAmount + sgstAmount)) * 100)}%)</span>
                          <span style={{ fontWeight: 700 }}>−₹{selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ borderTop: "1.5px dashed #ddd6fe", paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e1b4b" }}>Total Payable</span>
                        <span style={{ fontWeight: 800, fontSize: "18px", color: "#7c3aed" }}>₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Vendor Modal */}
            {showVendorModal && selectedVendorOrder && (
              <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 999999999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "fadeIn 0.3s ease-in-out",
                }}
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    margin: "1.75rem",
                  }}
                >
                  <div className="modal-content" style={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                    {/* HEADER */}
                    <div
                      className="modal-header d-flex justify-content-between align-items-center"
                      style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0f0f0" }}
                    >
                      <h5
                        className="modal-title"
                        style={{
                          fontWeight: 600,
                          fontSize: "18px",
                          color: "#333",
                          margin: 0,
                        }}
                      >
                        Order Vendors
                      </h5>
                      <button
                        type="button"
                        style={{
                          border: "none",
                          background: "none",
                          fontSize: "24px",
                          lineHeight: 1,
                          color: "#999",
                          cursor: "pointer",
                          padding: 0,
                        }}
                        onClick={() => {
                          setShowVendorModal(false);
                          setSelectedVendorOrder(null);
                        }}
                      >
                        &times;
                      </button>
                    </div>

                    {/* BODY */}
                    <div
                      className="modal-body"
                      style={{
                        maxHeight: "450px",
                        overflowY: "auto",
                        padding: "24px",
                      }}
                    >
                      <div className="d-flex flex-column gap-3">
                        {getOrderVendors(selectedVendorOrder).map((vendor) => (
                          <div
                            key={vendor.vendorId || vendor.name}
                            className="p-3"
                            style={{
                              border: "1px solid #f0f0f0",
                              borderRadius: "12px",
                              backgroundColor: "#fcfaff",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                            }}
                          >
                            <div className="d-flex align-items-center gap-3 mb-3">
                              <img
                                src={vendor.imageUrl}
                                alt={vendor.name}
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  flexShrink: 0,
                                  border: "2px solid #8059ca",
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = "/assets/default.png";
                                }}
                              />
                              <div className="d-flex flex-column">
                                <span
                                  style={{
                                    fontSize: "15px",
                                    color: "#333",
                                    fontWeight: 600,
                                  }}
                                >
                                  {vendor.name}
                                </span>
                                <span style={{ fontSize: "11px", color: "#888" }}>
                                  ID: {vendor.vendorId || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="pt-2" style={{ borderTop: "1px dashed #eaeaea" }}>
                              {vendor.phone && (
                                <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: "12px", color: "#555" }}>
                                  <i className="fa-solid fa-phone" style={{ color: "#8059ca", width: "16px" }} />
                                  <span>{vendor.phone}</span>
                                </div>
                              )}
                              {vendor.email && (
                                <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: "12px", color: "#555" }}>
                                  <i className="fa-solid fa-envelope" style={{ color: "#8059ca", width: "16px" }} />
                                  <span style={{ wordBreak: "break-all" }}>{vendor.email}</span>
                                </div>
                              )}
                              {vendor.address && (
                                <div className="d-flex align-items-start gap-2 mb-2" style={{ fontSize: "12px", color: "#555" }}>
                                  <i className="fa-solid fa-location-dot" style={{ color: "#8059ca", width: "16px", marginTop: "3px" }} />
                                  <span>{vendor.address}</span>
                                </div>
                              )}
                              {(vendor.location?.coordinates?.length === 2 || vendor.address) && (
                                <div className="mt-3">
                                  <a
                                    href={
                                      vendor.location?.coordinates?.length === 2
                                        ? `https://www.google.com/maps/search/?api=1&query=${vendor.location.coordinates[1]},${vendor.location.coordinates[0]}`
                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.address)}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                                    style={{
                                      fontSize: "12px",
                                      padding: "6px 12px",
                                      borderRadius: "8px",
                                      borderColor: "#8059ca",
                                      color: "#8059ca",
                                      fontWeight: "600",
                                      backgroundColor: "transparent",
                                    }}
                                  >
                                    <i className="fa-solid fa-map-location-dot"></i>
                                    Show Maps
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Modal */}
            <OrderFeedbackOffcanvas
              isOpen={showReviewModal}
              toggle={() => setShowReviewModal(!showReviewModal)}
              order={selectedReviewOrder}
              onReviewSubmitted={(orderId) => {
                setOrders((prevOrders) =>
                  prevOrders.map((ord) =>
                    ord._id === orderId || ord.orderId === orderId
                      ? { ...ord, isRated: true }
                      : ord
                  )
                );

                setSelectedReviewOrder((prev) =>
                  prev
                    ? {
                      ...prev,
                      isRated: true,
                    }
                    : prev
                );
              }}
            />

            {/* Reschedule Modal */}
            {showRescheduleModal && (
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.85)",
                  zIndex: 99999999999,
                }}
              >
                <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                  <div className="modal-content border-0 rounded-4">
                    <div className="modal-header border-0 pb-0">
                      <div>
                        <h5 className="fw-bold mb-1">Reschedule Appointment</h5>
                        <p
                          className="text-muted mb-0"
                          style={{ fontSize: "13px" }}
                        >
                          Order #{rescheduleOrder?.orderId}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowRescheduleModal(false)}
                        disabled={isRescheduling}
                      />
                    </div>
                    <div className="modal-body pt-3">
                      <div
                        className="mb-3 p-3 rounded-3"
                        style={{
                          background: "#f8f5ff",
                          border: "1px solid #e9ddff",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#8059ca",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.4px",
                          }}
                        >
                          Current Appointment
                        </div>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#333",
                            marginTop: "4px",
                          }}
                        >
                          {formatOrderAppointmentLabel(rescheduleOrder)}
                        </div>
                      </div>

                      <div style={{ position: "relative", minHeight: "330px" }}>
                        <VendorCalendarSlotPicker
                          key={`reschedule-${rescheduleOrder?._id}-${rescheduleModalKey}-${rescheduleCalendarMonth}-${rescheduleCalendarYear}`}
                          layout="column"
                          selectedDate={rescheduleDate}
                          selectedTimeSlot={rescheduleTimeSlot}
                          calendarDays={rescheduleCalendarDays}
                          calendarMonth={rescheduleCalendarMonth}
                          calendarYear={rescheduleCalendarYear}
                          isLoading={rescheduleTimingsLoading}
                          onMonthChange={handleRescheduleMonthChange}
                          confirmLabel="Confirm Reschedule"
                          onSelectSlot={(date, time) => {
                            setRescheduleDate(date);
                            setRescheduleTimeSlot(time);
                            handleRescheduleConfirm(date, time);
                          }}
                        />
                        {isRescheduling && (
                          <div
                            className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
                            style={{
                              background: "rgba(255,255,255,0.75)",
                              zIndex: 30,
                              borderRadius: "12px",
                            }}
                          >
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Rescheduling...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Report Issue Modal */}
            {showReportModal && (
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.85)",
                  zIndex: 99999999999,
                }}
              >
                <div className="modal-dialog modal-dialog-centered modal-md">
                  <div className="modal-content border-0 rounded-4">
                    <div className="modal-body p-4 bg-white rounded-4">
                      {/* Header */}
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-exclamation-circle text-danger fs-5"></i>
                            <h5 className="fw-bold mb-0">Report an Issue</h5>
                          </div>
                          <p
                            className="text-muted mb-0"
                            style={{ fontSize: "13px" }}
                          >
                            Order Id {selectedReportOrder?.orderId}
                          </p>
                        </div>
                        <button
                          className="btn-close"
                          onClick={() => setShowReportModal(false)}
                        ></button>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                          {/* Product */}
                          <div className="col-md-6 col-12">
                            <select
                              name="product"
                              className="form-control form-select"
                              required
                              value={formData.product || ""}
                              onChange={onFormChange}
                              style={{
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "14px",
                                padding: "8px 12px",
                              }}
                            >
                              <option value="">Select Product</option>
                              {selectedReportOrder?.items?.map((item) => {
                                if (item.type === "normal") {
                                  return (
                                    <option
                                      key={item.orderItemId}
                                      value={
                                        item.productDetails?.tabletdetails?.name
                                      }
                                    >
                                      {item.productDetails?.tabletdetails
                                        ?.name || "Medicine"}
                                    </option>
                                  );
                                } else if (item.type === "package") {
                                  return (
                                    <option
                                      key={item.orderItemId}
                                      value={item.packageDetails?.name}
                                    >
                                      {item.packageDetails?.name || "Lab Test"}
                                    </option>
                                  );
                                }
                                return null;
                              })}
                            </select>
                          </div>

                          {/* Category */}
                          <div className="col-md-6 col-12">
                            <select
                              name="category"
                              className="form-control form-select"
                              required
                              value={formData.category || ""}
                              onChange={onFormChange}
                              style={{
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "14px",
                                padding: "8px 12px",
                              }}
                            >
                              <option value="">Select Category</option>
                              <option value="changed_mind">
                                Changed my mind
                              </option>
                              <option value="ordered_by_mistake">
                                Ordered by mistake
                              </option>
                              <option value="found_better_price">
                                Found a better price elsewhere
                              </option>
                              <option value="no_longer_needed">
                                No longer needed
                              </option>
                              <option value="wrong_product_selected">
                                Selected wrong product
                              </option>
                              <option value="delivery_too_long">
                                Delivery time is too long
                              </option>
                              <option value="wrong_address">
                                Entered wrong delivery address
                              </option>
                              <option value="payment_issue">
                                Payment issue
                              </option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          {/* Subject */}
                          <div className="col-12">
                            <input
                              type="text"
                              name="subject"
                              className="form-control"
                              placeholder="Subject"
                              required
                              value={formData.subject || ""}
                              onChange={onFormChange}
                              style={{
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "14px",
                                padding: "8px 12px",
                              }}
                            />
                          </div>

                          {/* Description */}
                          <div className="col-12">
                            <textarea
                              name="description"
                              className="form-control"
                              rows="4"
                              placeholder="Describe your issue..."
                              required
                              value={formData.description || ""}
                              onChange={onFormChange}
                              style={{
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "14px",
                                padding: "8px 12px",
                                resize: "vertical",
                              }}
                            ></textarea>
                          </div>

                          {/* Priority */}
                          {/* <div className="col-md-6 col-12">
                            <select
                              name="priority"
                              className="form-control form-select"
                              required
                              value={formData.priority || ""}
                              onChange={onFormChange}
                              style={{
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "14px",
                                padding: "8px 12px",
                              }}
                            >
                              <option value="">Select Priority</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div> */}

                          <div className="col-md-6 col-12">
                            <input
                              type="file"
                              name="attachments"
                              className="form-control"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files);
                                const validFiles = [];
                                const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit

                                files.forEach((file) => {
                                  if (file.size > maxSizeBytes) {
                                    toast.error(`${file.name} is too large. Max file size is 5MB.`);
                                  } else {
                                    validFiles.push(file);
                                  }
                                });

                                setFormData((prev) => ({
                                  ...prev,
                                  attachments: [...(prev.attachments || []), ...validFiles],
                                }));

                                // Reset value so user can upload the same file again if removed
                                e.target.value = "";
                              }}
                              style={{
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "14px",
                                padding: "11px 12px",
                              }}
                            />
                            <div className="text-muted mt-1" style={{ fontSize: "11px" }}>
                              Max file size: 5MB. Multiple files allowed.
                            </div>
                          </div>

                          {formData.attachments && formData.attachments.length > 0 && (
                            <div className="col-12 mt-2">
                              <label className="form-label d-block mb-1" style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>
                                Selected Attachments ({formData.attachments.length})
                              </label>
                              <div className="d-flex flex-wrap gap-2">
                                {formData.attachments.map((attachment, index) => {
                                  const objectUrl = URL.createObjectURL(attachment);
                                  return (
                                    <div
                                      key={index}
                                      className="position-relative"
                                      style={{
                                        width: "65px",
                                        height: "65px",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        border: "1px solid #e0e0e0",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                      }}
                                    >
                                      <img
                                        src={objectUrl}
                                        alt="attachment"
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className="btn btn-danger d-flex align-items-center justify-content-center position-absolute"
                                        onClick={() =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            attachments: prev.attachments.filter(
                                              (_, i) => i !== index,
                                            ),
                                          }))
                                        }
                                        style={{
                                          top: "2px",
                                          right: "2px",
                                          width: "18px",
                                          height: "18px",
                                          borderRadius: "50%",
                                          padding: 0,
                                          fontSize: "10px",
                                          lineHeight: 1,
                                          backgroundColor: "#dc3545",
                                          border: "none",
                                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                        }}
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Submit */}
                        <div className="text-center mt-4">
                          <button
                            type="submit"
                            className="btn btn-primary w-100 py-2"
                            disabled={isSubmitting}
                            style={{ fontWeight: 600, borderRadius: "8px" }}
                          >
                            {isSubmitting ? "Submitting..." : "Submit Issue"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
              {selectedOrder && (
                <InvoiceTemplate
                  ref={invoiceRef}
                  order={selectedOrder}
                  productSubtotal={productSubtotal}
                  cgstAmount={cgstAmount}
                  sgstAmount={sgstAmount}
                  gstAmount={gstAmount}
                  grandTotal={grandTotal}
                />
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination dashboard-pagination mt-0">
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
        </div>
      </div>
    </div>
  );
};

export default HomeCareBooking;
