import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoiceTemplate from "../InvoiceTemplate";
import OrdersReviewModal from "../OrdersReviewModal";
import { axiosUserInstance } from "../../../../Apiservice";
import { getImageUrl } from "../../../../utils/index";
import { useMediaQuery } from "react-responsive";
import toast from "react-hot-toast";
import autoTable from "jspdf-autotable";

const customStyles = `
  .order-card {
    background: #fff;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    transition: box-shadow 0.3s ease;
  }

  .order-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 12px;
    margin-bottom: 15px;
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
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 500;
  }

  .processing {
    background-color: #ffe9d6;
    color: #ff7a00;
  }

  .delivered {
    background-color: #d7f5e8;
    color: #00a86b;
  }

  .cancelled {
    background-color: #ffe0e0;
    color: #dc3545;
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

  .btn-purple {
    background-color: #6f42c1;
    color: #fff;
    border-radius: 8px;
    font-size: 14px;
    padding: 6px 16px;
  }

  .btn-purple:hover {
    background-color: #5a32a3;
    color: #fff;
  }

  .btn-outline-custom {
    border-radius: 8px;
    font-size: 14px;
    padding: 6px 16px;
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

const MedicalEquipmentBookings = ({ HomeNavigate }) => {
  const invoiceRef = useRef();
  const [cartOrders, setCartOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendorOrder, setSelectedVendorOrder] = useState(null);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [serviceTab, setServiceTab] = useState("rental");
  const [cartTab, setCartTab] = useState("all")

  const tabs = [
    { id: "cart", name: "Cart" },
    { id: "rental", name: "Rentals" }
  ]

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
        servicefixedTypes: "medicalequipment"
      });

      let res;
      if (serviceTab === "rental") {
        res = await axiosUserInstance.get(
          `rentals/list?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setOrders(res?.data?.data?.orders || []);
      } else {
        res = await axiosUserInstance.get(
          `orders/list?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setCartOrders(res?.data?.data?.orders || []);
      }

      // setOrders(res?.data?.data?.orders || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
      setCurrentPage(res?.data?.data?.pagination?.currentPage || 1);
    } catch (err) {
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
      // cartLoading(false)
    }
  };

  useEffect(() => {
    // if (selectedTab === "rental") {
    fetchOrders();
    // }
  }, [currentPage, serviceTab]);

  useEffect(() => {
    fetchOrders(currentPage, selectedTab);
  }, [currentPage, selectedTab]);

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
      case "completed":
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

  const handleViewInstallments = (order) => {
    if (order.installments && order.installments.length > 0) {
      setSelectedInstallments(order.installments);
      setShowInstallmentsModal(true);
    } else {
      toast.error("No installments found for this order");
    }
  };

  const handleReview = (order) => {
    setSelectedReviewOrder(order);
    setShowReviewModal(true);
  };

  const productSubtotal = selectedOrder?.subtotal || 0;
  const deliveryFee = selectedOrder?.shipping || 0;
  const cgstAmount = selectedOrder?.cgst || 0;
  const sgstAmount = selectedOrder?.sgst || 0;
  const gstAmount = selectedOrder?.tax || 0;
  const grandTotal = selectedOrder?.total || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTab]);

  //  custom styles
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

  const exportInstallmentsPDF = () => {
    const unit = "pt";
    const size = "A4";
    const orientation = "portrait";

    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(14);
    doc.text("Installment Details", 40, 30);

    const headers = [["S.No", "Amount", "Due Date", "Status", "Type"]];

    const datas = selectedInstallments.map((item, index) => [
      index + 1,
      `Rs. ${item.amount?.toFixed(2)}`,
      item.dueDate ? item.dueDate.slice(0, 10) : "N/A",
      item.status || "N/A",
      item.paymentMethod || "N/A",
    ]);

    autoTable(doc, {
      startY: 50,
      head: headers,
      body: datas,
      styles: {
        halign: "center",
      },
    });

    doc.save("Installments.pdf");
  };

  // Cart filtered orders (client-side status filter)
  const filteredCartOrders = cartOrders.filter((order) => {
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
    switch (cartTab) {
      case "all": return true;
      case "processing": return orderStatus === "pending" || orderStatus === "processing" || orderStatus === "new";
      case "delivered": return orderStatus === "completed" || orderStatus === "delivered";
      case "cancelled": return orderStatus === "cancelled" || orderStatus === "canceled";
      case "failed": return orderStatus === "failed";
      default: return true;
    }
  });

  return (
    <div className="main-wrapper">
      <div className="content doctor-content">
        <div className="container">
          {/* ===== TOP-LEVEL SERVICE TABS: Rental | Cart ===== */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", marginTop: "8px" }}>
            {[
              { id: "rental", label: "Rental", icon: "fa-calendar-check" },
              { id: "cart", label: "Cart Orders", icon: "fa-shopping-cart" },
            ].map((tab) => {
              const isActive = serviceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setServiceTab(tab.id);
                    setCurrentPage(1);
                    // setCurrentPage(1);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 24px",
                    borderRadius: "50px",
                    border: isActive ? "none" : "1.5px solid #d8c8f5",
                    backgroundColor: isActive ? "#8059ca" : "#fff",
                    color: isActive ? "#fff" : "#8059ca",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: isActive ? "0 4px 14px rgba(128,89,202,0.3)" : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  <i className={`fa-solid ${tab.icon}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Rental content - only show when serviceTab === rental */}
          {serviceTab === "rental" && <div className="row">
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
                        className="fa-solid fa-calendar-days"
                        style={{
                          color: "#8059ca",
                        }}
                      />
                      <span>Rental Orders </span>
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
                    View and manage all your rental orders
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
                      width: isMobile ? "100%" : "250px",
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search by Order ID or Item Name..."
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
                      { id: "all", label: "All Orders" },
                      { id: "completed", label: "Completed" },
                      { id: "cancelled", label: "Cancelled" },
                      { id: "failed", label: "Failed" },
                    ].map((tab) => {
                      const tabCount =
                        tab.id === "all"
                          ? orders.length
                          : orders.filter((order) => {
                            const orderStatus =
                              order.orderStatus?.toLowerCase() || "";
                            switch (tab.id) {
                              case "completed":
                                return (
                                  orderStatus === "completed" ||
                                  orderStatus === "delivered"
                                );
                              case "cancelled":
                                return (
                                  orderStatus === "cancelled" ||
                                  orderStatus === "canceled"
                                );
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
                  /* Desktop:  */
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
                      { id: "all", label: "All Orders", icon: "fa-list" },
                      {
                        id: "completed",
                        label: "Completed",
                        icon: "fa-check-circle",
                      },
                      {
                        id: "cancelled",
                        label: "Cancelled",
                        icon: "fa-times-circle",
                      },
                      {
                        id: "failed",
                        label: "Failed",
                        icon: "fa-exclamation-circle",
                      },
                    ].map((tab) => {
                      const isActive = selectedTab === tab.id;
                      const tabCount =
                        tab.id === "all"
                          ? orders.length
                          : orders.filter((order) => {
                            const orderStatus =
                              order.orderStatus?.toLowerCase() || "";
                            switch (tab.id) {
                              case "completed":
                                return (
                                  orderStatus === "completed" ||
                                  orderStatus === "delivered"
                                );
                              case "cancelled":
                                return (
                                  orderStatus === "cancelled" ||
                                  orderStatus === "canceled"
                                );
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
                            {/* {tabCount > 0 && (
                              <span className="badge bg-white text-primary ms-1">
                                {tabCount}
                              </span>
                            )} */}
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
                currentOrders.map((order, index) => {
                  const orderStatus = order.orderStatus?.toLowerCase() || "";
                  const isProcessing =
                    orderStatus === "new" || orderStatus === "pending";
                  const isDelivered =
                    orderStatus === "completed" || orderStatus === "delivered";
                  const isCancelled =
                    orderStatus === "cancelled" || orderStatus === "canceled";

                  return (
                    <div key={index} className="order-card">
                      <div className="order-header">
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div className="order-id" style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                              #{order.orderId}
                            </div>
                            {(() => {
                              const allVendors = getOrderVendors(order);
                              if (allVendors.length === 0) return null;
                              const displayedVendors = allVendors.slice(0, 2);
                              const remainingCount = allVendors.length - 2;

                              return (
                                <>
                                  <span style={{ color: "#ddd" }}>|</span>
                                  {/* <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>
                                    Sold by:
                                  </span> */}
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    {displayedVendors.map((vendor) => (
                                      <div
                                        key={vendor.vendorId || vendor.name}
                                        className="d-inline-flex align-items-center gap-2"
                                        style={{
                                          backgroundColor: "#f5f3ff",
                                          border: "1.5px solid #dcd3ff",
                                          borderRadius: "20px",
                                          padding: "4px 12px 4px 6px",
                                          height: "32px",
                                          boxShadow: "0 2px 4px rgba(128, 89, 202, 0.05)",
                                        }}
                                      >
                                        <img
                                          src={vendor.imageUrl}
                                          alt={vendor.name}
                                          style={{
                                            width: "22px",
                                            height: "22px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "1px solid #fff",
                                          }}
                                          onError={(e) => {
                                            e.currentTarget.src = "/assets/default.png";
                                          }}
                                        />
                                        <span style={{ fontSize: "12px", color: "#8059ca", fontWeight: 600, whiteSpace: "nowrap" }}>
                                          {vendor.name}
                                        </span>
                                      </div>
                                    ))}
                                    {remainingCount > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedVendorOrder(order);
                                          setShowVendorModal(true);
                                        }}
                                        style={{
                                          backgroundColor: "#8059ca",
                                          border: "none",
                                          borderRadius: "20px",
                                          color: "#fff",
                                          fontSize: "11px",
                                          fontWeight: "bold",
                                          padding: "0 12px",
                                          height: "32px",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          cursor: "pointer",
                                          boxShadow: "0 2px 4px rgba(128, 89, 202, 0.2)",
                                          marginLeft: "4px"
                                        }}
                                      >
                                        +{remainingCount} More
                                      </button>
                                    )}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                          <div className="order-date">
                            Ordered on{" "}
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
                        <span
                          className={`status-badge ${isDelivered
                            ? "delivered"
                            : isCancelled
                              ? "cancelled"
                              : "processing"
                            }`}
                        >
                          {order.orderStatus
                            ? order.orderStatus.toUpperCase()
                            : "N/A"}
                        </span>
                      </div>

                      <div className="row align-items-center">
                        <div className="col-md-2 col-12 text-center mb-3 mb-md-0">
                          <div
                            onClick={() => handleView(order)}
                            style={{
                              position: "relative",
                              cursor: "pointer",
                              display: "inline-block",
                              marginBottom: "25px",
                            }}
                            className="mobile-no-margin"
                          >
                            <img
                              src={resolveOrderImage(order)}
                              className="product-img"
                              style={{ marginRight: "0px" }}
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
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  textDecoration: "underline",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                +{order.items.length - 1} more items
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="col-md-6 col-12">
                          <div
                            className="product-title"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleView(order)}
                          >
                            {order?.items?.[0]?.productDetails?.tabletdetails
                              ?.name ||
                              order?.items?.[0]?.productDetails
                                ?.variantcurrentDetails?.productname ||
                              order?.items?.[0]?.packageDetails?.name ||
                              "No Available"}
                          </div>

                          <div
                            className="row"
                            style={{ textTransform: "capitalize" }}
                          >
                            <div className="col-6">
                              {order?.rentalPlan && (
                                <>
                                  <div className="info-label">Plan :</div>
                                  <div className="info-value">
                                    {order?.rentalPlan}
                                  </div>
                                </>
                              )}
                              {order?.numberOfInstallments && (
                                <>
                                  <div className="info-label">
                                    {" "}
                                    No. Of Instalments :
                                  </div>
                                  <div className="info-value">
                                    {order?.numberOfInstallments}
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="col-6">

                              {order?.serviceCharges && (
                                <>
                                  <div className="info-label">
                                    {" "}
                                    Delivery Charges :
                                  </div>
                                  <div className="info-value">
                                    {order?.serviceCharges?.toFixed(2)}
                                  </div>
                                </>
                              )}
                              {order?.fixedDeposit && (
                                <>
                                  <div className="info-label">
                                    {" "}
                                    Deposit :
                                  </div>
                                  <div className="info-value">
                                    {order?.fixedDeposit?.toFixed(2)}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="col-md-4 col-12 payment-box">
                          <div className="info-label">Paid Amount</div>
                          <div className="amount">
                            ₹{order.total?.toFixed(2) || "0.00"}
                          </div>
                          <div className="d-flex justify-content-end mt-1 gap-2">
                            <button
                              className="btn btn-outline-secondary btn-outline-custom d-flex gap-1"
                              style={{
                                borderRadius: "5px",
                                fontSize: "11px",
                                padding: "5px 2px",
                              }}
                              onClick={() => handleViewInstallments(order)}
                            >
                              <i className="fas fa-money-bill-wave"></i>
                              View
                            </button>

                            <button
                              className="btn btn-outline-secondary btn-outline-custom d-flex gap-1"
                              style={{
                                borderRadius: "5px",
                                fontSize: "11px",
                                padding: "5px 2px",
                              }}
                              onClick={() => {
                                setSelectedOrder(order);
                                setTimeout(() => downloadInvoice(), 100);
                              }}
                            >
                              <i className="fas fa-file-invoice"></i>
                              Download Invoice
                            </button>
                            {order?.isRated !== true && (
                              <button
                                className="btn btn-purple btn-outline-custom d-flex gap-1"
                                style={{
                                  borderRadius: "5px",
                                  fontSize: "11px",
                                  padding: "5px 2px",
                                }}
                                onClick={() => handleReview(order)}
                              >
                                <i className="fas fa-star"></i>
                                Review
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-5">
                  <div className="empty-state">
                    <i className="fa-solid fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No rental orders found</h5>
                    <p className="text-muted">
                      You haven't placed any rental orders yet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {showModel && (
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
                  alignItems: "flex-end",
                  justifyContent: "center",
                  animation: "fadeIn 0.4s ease-in-out",
                }}
              >
                <div
                  className="modal-dialog modal-dialog-centered modal-l"
                  role="document"
                >
                  <div className="modal-content">
                    {/* HEADER */}
                    <div
                      className="modal-header"
                      style={{ padding: "20px 24px 16px" }}
                    >
                      <div>
                        <h5
                          className="modal-title"
                          style={{
                            fontWeight: 600,
                            fontSize: "18px",
                            margin: 0,
                          }}
                        >
                          Rental Details
                        </h5>
                        <div style={{ fontSize: "12px" }}>
                          Order Id :{" "}
                          <strong>{selectedOrder?.orderId || "N/A"}</strong>
                        </div>
                        {/* <button
                          type="button"
                          style={{ padding: "3px", fontSize: "11px" }}
                          className="btn btn-primary"
                          onClick={downloadInvoice}
                        >
                          Download Invoice
                        </button> */}
                      </div>
                      <button
                        type="button"
                        style={{ border: "none" }}
                        className="close"
                        onClick={() => setShowModel(false)}
                      >
                        <span>&times;</span>
                      </button>
                    </div>

                    {/* BODY */}
                    <div
                      className="modal-body"
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        padding: "16px 24px",
                      }}
                    >
                      {selectedOrder?.items?.length > 0 ? (
                        selectedOrder.items.map((orderItem, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              marginBottom: "10px",
                            }}
                          >
                            {/* LEFT */}
                            <div
                              style={{
                                display: "flex",
                                flex: 1,
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  border: "1px solid #eee",
                                  borderRadius: "5px",
                                }}
                              >
                                <div className="text-center">
                                  <img
                                    className="avatar-img rounded-3"
                                    src={resolveOrderItemImage(orderItem)}
                                    alt="product"
                                    style={{
                                      height: "80px",
                                      width: "80px",
                                      objectFit: "contain",
                                    }}
                                  />
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                  marginLeft: "10px",
                                }}
                              >
                                <p style={{ margin: 0, fontWeight: 600 }}>
                                  {(
                                    orderItem?.productDetails
                                      ?.variantcurrentDetails?.productname ||
                                    orderItem?.productDetails?.tabletdetails
                                      ?.name ||
                                    orderItem?.packageDetails?.name ||
                                    "N/A"
                                  ).length > 20
                                    ? (
                                      orderItem?.productDetails
                                        ?.variantcurrentDetails
                                        ?.productname ||
                                      orderItem?.productDetails?.tabletdetails
                                        ?.name ||
                                      orderItem?.packageDetails?.name ||
                                      "N/A"
                                    ).slice(0, 20) + "..."
                                    : orderItem?.productDetails
                                      ?.variantcurrentDetails?.productname ||
                                    orderItem?.productDetails?.tabletdetails
                                      ?.name ||
                                    orderItem?.packageDetails?.name ||
                                    "N/A"}
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "12px",
                                    color: "#8059ca",
                                    fontWeight: 500,
                                  }}
                                >
                                  {Array.isArray(
                                    orderItem?.packageDetails?.vendorDetails,
                                  ) &&
                                    orderItem.packageDetails.vendorDetails
                                      .length > 0
                                    ? orderItem.packageDetails.vendorDetails[0]
                                      .name
                                    : Array.isArray(
                                      orderItem?.productDetails
                                        ?.vendorDetails,
                                    ) &&
                                      orderItem.productDetails.vendorDetails
                                        .length > 0
                                      ? orderItem.productDetails
                                        .vendorDetails[0].name
                                      : "N/A"}
                                </p>

                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "12px",
                                    color: "#666",
                                  }}
                                >
                                  Qty: <strong>{orderItem?.quantity}</strong>
                                </p>

                                {/* RENTAL PLAN INFO */}
                                <p style={{ margin: 0, fontSize: "12px", color: "#8059ca" }}>
                                  <span style={{ fontWeight: 500 }}>
                                    {orderItem?.rentalDetails?.rentalPlan || "N/A"} Plan
                                  </span>

                                </p>

                                {/* RENTAL PRICE INLINE */}
                                <p style={{ margin: 0, fontSize: "12px" }}>
                                  <span style={{ color: "#666", fontSize: "11px" }}>
                                    Per Day:
                                  </span>
                                  &nbsp;
                                  <span style={{ fontWeight: 600 }}>
                                    {orderItem?.rentalDetails?.basePricePerDay || 0}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* RIGHT TOTAL - RENTAL TOTAL */}
                            <div
                              style={{
                                minWidth: "140px",
                                textAlign: "right",
                                fontWeight: 700,
                                fontSize: "14px",
                              }}
                            >
                              ₹{(orderItem?.totalPrice || 0).toFixed(2)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No items found</p>
                      )}

                      {/* SUMMARY */}
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "12px",
                          borderTop: "2px dashed #eaeaea",
                        }}
                      >
                        {/* Rental Dates */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            Start Date
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 500 }}>
                            {selectedOrder?.startDate
                              ? new Date(selectedOrder.startDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                              : "N/A"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            End Date
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 500 }}>
                            {selectedOrder?.endDate
                              ? new Date(selectedOrder.endDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                              : "N/A"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Rental Charges</span>
                          <span>₹{(selectedOrder?.items?.[0]?.totalPrice || 0).toFixed(2)}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span> Deposit</span>
                          <span>₹{(selectedOrder?.items?.[0]?.rentalDetails?.fixedDeposit || 0).toFixed(2)}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Delivery Charges</span>
                          <span>₹{(selectedOrder?.items?.[0]?.rentalDetails?.serviceCharges || 0).toFixed(2)}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Return Charges</span>
                          <span>₹{(selectedOrder?.items?.[0]?.rentalDetails?.returnCharge || 0).toFixed(2)}</span>
                        </div>

                        {selectedOrder.samplecollection > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Sample Collection fee</span>
                            <span>
                              ₹{selectedOrder.samplecollection.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>CGST</span>
                          <span>₹{selectedOrder?.cgst?.toFixed(2) || 0}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>SGST</span>
                          <span>₹{selectedOrder?.sgst?.toFixed(2) || 0}</span>
                        </div>

                        {selectedOrder.discount > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              color: "#28a745",
                            }}
                          >
                            <span>
                              Coupon Discount (
                              {Math.round(
                                (selectedOrder.discount /
                                  (productSubtotal + cgstAmount + sgstAmount)) *
                                100,
                              )}
                              %)
                            </span>

                            <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: 700,
                            fontSize: "16px",
                            borderTop: "1px solid #ddd",
                            paddingTop: "10px",
                            marginTop: "10px",
                          }}
                        >
                          <span>Total Amount</span>
                          <span>
                            {(() => {
                              const rentalCharges = selectedOrder?.items?.[0]?.totalPrice || 0;
                              const fixedDeposit = selectedOrder?.items?.[0]?.rentalDetails?.fixedDeposit || 0;
                              const serviceCharges = selectedOrder?.items?.[0]?.rentalDetails?.serviceCharges || 0;
                              const returnCharges = selectedOrder?.items?.[0]?.rentalDetails?.returnCharge || 0;
                              const discount = selectedOrder?.discount || 0;

                              const total = rentalCharges + fixedDeposit + serviceCharges + returnCharges - discount;
                              return `Rs ${total.toFixed(2)}`;
                            })()}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "10px 0 0 0",
                            textAlign: "center",
                            fontSize: "14px",
                            color: "#8059ca",
                            cursor: "pointer",
                            textDecoration: "underline"
                          }}
                          onClick={() => {
                            if (selectedOrder?.installments && selectedOrder.installments.length > 0) {
                              setSelectedInstallments(selectedOrder.installments);
                              setShowInstallmentsModal(true);
                            } else {
                              toast.error("No installments found for this order");
                            }
                          }}
                        >
                          View Installment Details
                        </p>
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
                                <div className="d-flex align-items-start gap-2" style={{ fontSize: "12px", color: "#555" }}>
                                  <i className="fa-solid fa-location-dot" style={{ color: "#8059ca", width: "16px", marginTop: "3px" }} />
                                  <span>{vendor.address}</span>
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
          </div>}

          {/* ===== CART ORDERS SECTION ===== */}
          {serviceTab === "cart" && (
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
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginBottom: "12px" }}>
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
                  <div>
                    <nav style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#333", fontWeight: "600" }}>
                        <i className="fa-solid fa-shopping-cart" style={{ color: "#8059ca" }} />
                        <span>Cart Orders</span>
                      </span>
                    </nav>
                    <p style={{ color: "#666", fontSize: isMobile ? "13px" : "14px", marginTop: "5px", marginBottom: "0" }}>
                      View and manage your medical equipment cart purchases
                    </p>
                  </div>
                  <div style={{ position: "relative", width: isMobile ? "100%" : "250px" }}>
                    <input
                      type="text"
                      placeholder="Search by Order ID or Item..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        height: "42px",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        padding: "10px 15px 10px 40px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                    <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#999", pointerEvents: "none" }}>
                      <i className="fa-solid fa-search" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Cart sub-tabs */}
              <div className="mb-3 position-relative">
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "nowrap" }}>
                  {isMobile ? (
                    <select
                      value={cartTab}
                      className="form-select"
                      onChange={(e) => { setCartTab(e.target.value); setCartPage(1); }}
                      style={{ border: "1px solid #ddd" }}
                    >
                      {[
                        { id: "all", label: "All Orders" },
                        { id: "processing", label: "Processing" },
                        { id: "delivered", label: "Delivered" },
                        { id: "cancelled", label: "Cancelled" },
                        { id: "failed", label: "Failed" },
                      ].map((tab) => (
                        <option key={tab.id} value={tab.id}>{tab.label}</option>
                      ))}
                    </select>
                  ) : (
                    <ul className="nav nav-tabs nav-tabs-solid" style={{ flex: 1, display: "flex", marginBottom: 0, overflow: "visible", minWidth: 0 }}>
                      {[
                        { id: "all", label: "All Orders", icon: "fa-list" },
                        { id: "processing", label: "Processing", icon: "fa-clock" },
                        { id: "delivered", label: "Delivered", icon: "fa-truck" },
                        { id: "cancelled", label: "Cancelled", icon: "fa-times-circle" },
                        { id: "failed", label: "Failed", icon: "fa-exclamation-circle" },
                      ].map((tab) => {
                        const isActive = cartTab === tab.id;
                        return (
                          <li className="nav-item" key={tab.id}>
                            <button
                              className={`nav-link ${isActive ? "active" : ""}`}
                              onClick={() => { setCartTab(tab.id); setCartPage(1); }}
                              style={{ display: "flex", alignItems: "center", gap: "6px" }}
                            >
                              <i className={`fa-solid ${tab.icon}`} />
                              {tab.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Cart order cards */}
              <div className="container py-4">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredCartOrders.length > 0 ? (
                  filteredCartOrders.map((order, index) => {
                    const orderStatus = order.orderStatus?.toLowerCase() || "";
                    const isDelivered = orderStatus === "completed" || orderStatus === "delivered";
                    const isCancelled = orderStatus === "cancelled" || orderStatus === "canceled";
                    return (
                      <div key={index} className="order-card">
                        <div className="order-header">
                          <div className="d-flex flex-column gap-1">
                            <div className="order-id" style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                              #{order.orderId}
                            </div>
                            <div className="order-date">
                              Ordered on{" "}
                              {new Date(order.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                            </div>
                          </div>
                          <span className={`status-badge ${isDelivered ? "delivered" : isCancelled ? "cancelled" : "processing"}`}>
                            {order.orderStatus ? order.orderStatus.toUpperCase() : "N/A"}
                          </span>
                        </div>

                        <div className="row align-items-center">
                          <div className="col-md-2 col-12 text-center mb-3 mb-md-0">
                            <div
                              onClick={() => handleView(order)}
                              style={{ position: "relative", cursor: "pointer", display: "inline-block", marginBottom: "25px" }}
                              className="mobile-no-margin"
                            >
                              <img
                                src={resolveOrderImage(order)}
                                className="product-img"
                                style={{ marginRight: "0px" }}
                                alt="Product"
                                onError={(e) => { e.currentTarget.src = "/assets/default.png"; }}
                              />
                              {order.items && order.items.length > 1 && (
                                <div style={{ position: "absolute", bottom: "-20px", left: "50%", transform: "translateX(-50%)", color: "#8059ca", fontSize: "13px", fontWeight: "600", textDecoration: "underline", whiteSpace: "nowrap" }}>
                                  +{order.items.length - 1} more items
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 col-12">
                            <div className="product-title" style={{ cursor: "pointer" }} onClick={() => handleView(order)}>
                              {order?.items?.[0]?.productDetails?.tabletdetails?.name ||
                                order?.items?.[0]?.productDetails?.variantcurrentDetails?.productname ||
                                order?.items?.[0]?.packageDetails?.name ||
                                "No Available"}
                            </div>
                            <div className="row" style={{ textTransform: "capitalize" }}>
                              <div className="col-6">
                                <div className="info-label">Qty:</div>
                                <div className="info-value">{order?.items?.[0]?.quantity || 1}</div>
                              </div>
                              <div className="col-6">
                                {order?.shipping > 0 && (
                                  <>
                                    <div className="info-label">Delivery:</div>
                                    <div className="info-value">₹{order?.shipping?.toFixed(2)}</div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-md-4 col-12 payment-box">
                            <div className="info-label">Paid Amount</div>
                            <div className="amount">₹{order.total?.toFixed(2) || "0.00"}</div>
                            <div className="d-flex justify-content-end mt-1 gap-2">
                              <button
                                className="btn btn-outline-secondary btn-outline-custom d-flex gap-1"
                                style={{ borderRadius: "5px", fontSize: "11px", padding: "5px 8px" }}
                                onClick={() => handleView(order)}
                              >
                                <i className="fas fa-eye" /> View
                              </button>
                              <button
                                className="btn btn-outline-secondary btn-outline-custom d-flex gap-1"
                                style={{ borderRadius: "5px", fontSize: "11px", padding: "5px 8px" }}
                                onClick={() => { setSelectedOrder(order); setTimeout(() => downloadInvoice(), 100); }}
                              >
                                <i className="fas fa-file-invoice" /> Invoice
                              </button>
                              {order?.isRated !== true && (
                                <button
                                  className="btn btn-purple btn-outline-custom d-flex gap-1"
                                  style={{ borderRadius: "5px", fontSize: "11px", padding: "5px 8px" }}
                                  onClick={() => handleReview(order)}
                                >
                                  <i className="fas fa-star" /> Review
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-5">
                    <div className="empty-state">
                      <i className="fa-solid fa-shopping-cart fa-3x text-muted mb-3" />
                      <h5 className="text-muted">No cart orders found</h5>
                      <p className="text-muted">You haven&apos;t placed any cart orders for medical equipment yet.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Pagination */}
              {totalPages > 1 && (
                <div className="pagination dashboard-pagination mt-0">
                  <ul className="d-flex justify-content-center align-items-center gap-1">
                    <li>
                      <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                        <i className="fa-solid fa-chevron-left" />
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page}>
                        <button className={`page-link ${currentPage === page ? "active" : ""}`} onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      </li>
                    ))}
                    <li>
                      <button className="page-link" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                        <i className="fa-solid fa-chevron-right" />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Installments  */}
      {showInstallmentsModal && (
        <div
          className="modal fade show"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999999999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            animation: "fadeIn 0.4s ease-in-out",
          }}
          tabIndex="-1"
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{
              maxWidth: "800px",
              width: "100%",
              margin: "0",
            }}
          >
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ padding: "20px 24px 16px" }}
              >
                <div>
                  <h5
                    className="modal-title"
                    style={{
                      fontSize: "16px",
                      margin: 0,
                    }}
                  >
                    Installment Details
                  </h5>
                  <button
                    onClick={exportInstallmentsPDF}
                  >
                    <i className="fa-solid fa-download"></i>
                  </button>
                </div>
                <button
                  type="button"
                  style={{ border: "none" }}
                  className="close"
                  onClick={() => setShowInstallmentsModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                {selectedInstallments.length > 0 ? (
                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    <table className="table table-bordered table-hover table-striped">
                      <thead>
                        <tr>
                          <th>S.no</th>
                          <th>Amount</th>
                          <th>Due Date</th>
                          <th>Plan</th>
                          <th>Status</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody
                        style={{
                          textTransform: "capitalize",
                        }}
                      >
                        {selectedInstallments.map((installment, index) => (
                          <tr key={installment._id || index}>
                            <td>{installment.installmentNumber}</td>
                            <td>₹{installment.amount?.toFixed(2) || "0.00"}</td>
                            <td>{installment.dueDate.slice(0, 10)}</td>
                            <td>
                              {orders.find((o) => o._id === installment.orderId)
                                ?.rentalPlan || "N/A"}
                            </td>
                            <td>{installment.status}</td>
                            <td>{installment.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center">No installments found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <OrdersReviewModal
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
    </div>
  );
};

export default MedicalEquipmentBookings;
