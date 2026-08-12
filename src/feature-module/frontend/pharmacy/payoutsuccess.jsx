import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Home2Header from "../home/home-4/Header-k.jsx";
import Footer from "../home/home-4/Footer-f.jsx";
import "./payoutsuccess.css";
import toast from "react-hot-toast";


const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [productType, setProductType] = useState("package");
  const [isAmbulance, setIsAmbulance] = useState(false);
  const [isRental, setIsRental] = useState(false);
  const [isSlot, setIsSlot] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const id = sessionStorage.getItem("orderId") || "N/A";
    setOrderId(id);

    if (id !== "N/A") {
      sessionStorage.removeItem("orderId");
    }

    const method = sessionStorage.getItem("paymentMethod");
    setPaymentMethod(method);

    window.dispatchEvent(new Event("paymentSuccess"));

    const type = searchParams.get('type');
    if (type === 'ambulance') {
      setIsAmbulance(true);
      setProductType('ambulance');
    }
    if (type === 'slot') {
      setIsSlot(true);
      setProductType('slot');
    }
    const orderItemsStr = sessionStorage.getItem("orderItems");
    if (orderItemsStr) {
      sessionStorage.removeItem("orderItems");
      try {
        const orderItems = JSON.parse(orderItemsStr);
        if (orderItems && orderItems.length > 0) {
          const firstItemType = orderItems[0]?.type || "package";
          setProductType(firstItemType);

          // Set rental flag if type is rental
          if (firstItemType === "rental") {
            setIsRental(true);
          }
        }
      } catch (error) {
        toast.error("Error parsing order items:", error);
      }
    }

    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, [searchParams]);

  return (
    <div className="payment-success-page">
      <Home2Header />
      <div className="payment-success-wrapper">
        <div className="payment-success-container">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7 col-xl-6">
                <div className="payment-success-card">
                  <div className="success-icon-wrapper">
                    <div className="success-icon-circle">
                      <div className="success-check-icon">
                        <i className="fas fa-check"></i>
                      </div>
                      <div className="success-ripple"></div>
                      <div className="success-ripple delay-1"></div>
                      <div className="success-ripple delay-2"></div>
                    </div>
                  </div>

                  <div className="success-content">
                    <h1 className="success-title">
                      {paymentMethod === "cod" ? "Order confirmed!" : "Payment Successful!"}
                    </h1>
                    <p className="success-message">
                      {paymentMethod === "cod"
                        ? "Payment will be collected at the time of delivery"
                        : productType === "ambulance"
                          ? "Your ambulance booking has been confirmed and will be processed shortly."
                          : productType === "rental"
                            ? "Your rental booking has been confirmed and will be processed shortly."
                            : productType === "package"
                              ? "Your booking has been confirmed and will be processed shortly."
                              : productType === "product"
                                ? "Your order has been confirmed and will be delivered shortly."
                                : "Your order has been confirmed and will be processed shortly."}
                    </p>

                    {/* Order Details Card */}
                    <div className="order-details-card">
                      <div className="order-details-header">
                        <i className="fas fa-receipt"></i>
                        <h3>Order Details</h3>
                      </div>
                      <div className="order-details-body">
                        <div className="order-detail-row">
                          <span className="order-detail-label">
                            <i className="fas fa-hashtag"></i>
                            Order ID
                          </span>
                          <span className="order-detail-value">{orderId}</span>
                        </div>
                        <div className="order-detail-row">
                          <span className="order-detail-label">
                            <i className="fas fa-calendar-alt"></i>
                            Order Date
                          </span>
                          <span className="order-detail-value">
                            {currentDate}
                          </span>
                        </div>
                        <div className="order-detail-row order-detail-row-status">
                          <span className="order-detail-label">
                            <i className="fas fa-check-circle"></i>
                            Status
                          </span>
                          <span className="order-detail-value status-confirmed">
                            Confirmed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="next-steps-card">
                      <h4 className="next-steps-title">
                        <i className="fas fa-info-circle"></i>
                        What's Next?
                      </h4>
                      <ul className="next-steps-list">
                        <li>
                          <i className="fas fa-check"></i>
                          <span>
                            You will receive a confirmation email shortly
                          </span>
                        </li>
                        <li>
                          <i className="fas fa-check"></i>
                          <span>
                            {productType === "ambulance"
                              ? "Our team will contact you to schedule your ambulance service"
                              : productType === "rental"
                                ? "Our team will contact you to schedule your rental delivery"
                                : productType === "package"
                                  ? "Our team will contact you to schedule your appointment"
                                  : productType === "product"
                                    ? "Your order will be prepared and shipped to your address"
                                    : "Our team will contact you to schedule your appointment"}
                          </span>
                        </li>
                        <li>
                          <i className="fas fa-check"></i>
                          <span>
                            Track your{" "}
                            {productType === "ambulance"
                              ? "ambulance booking"
                              : productType === "rental"
                                ? "rental booking"
                                : productType === "package"
                                  ? "booking"
                                  : "order"}{" "}
                            status in your account
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="success-action-buttons">
                      <Link
                        to={
                          isAmbulance
                            ? "/ambulance-booking"
                            : isRental
                              ? "/rental-booking"
                              : isSlot ? "/my-appointments" : "/my-orders"
                        }
                        className="btn-view-orders"
                      >
                        <i className="fas fa-list-alt"></i>
                        {isAmbulance
                          ? "View My Bookings"
                          : isRental
                            ? "View My Rentals"
                            : isSlot ? "View My Appointments" : "View My Orders"}
                      </Link>
                      <Link to="/" className="btn-back-home">
                        <i className="fas fa-home"></i>
                        Back to Home
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
