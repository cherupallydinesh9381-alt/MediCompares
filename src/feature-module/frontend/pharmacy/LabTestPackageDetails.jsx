import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosCommonInstance } from "../../../Apiservice.jsx";
import { getImageUrl } from "../../../utils/index";
import Home2Header from "../home/home-4/Header-k";
import Footer from "../home/home-4/Footer-f";
import { useResponsive } from "../../../hooks";
import VendorActions from "../../../components/ui/VendorActions.jsx";
import { handleGeneralBookingProcess, handleRentalBookingProcess } from "../../../services/bookingService";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const formatCurrency = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const calcDiscount = (price, discountprice) => {
  if (!discountprice || discountprice <= 0 || discountprice >= price) return 0;
  return Math.round(((price - discountprice) / price) * 100);
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */

/** Single collapsible test row */
const TestAccordionRow = ({ test, index }) => {
  const [open, setOpen] = useState(false);
  const hasParams = test.parameterss?.length > 0;

  return (
    <div
      style={{
        border: "1px solid #ede9f8",
        borderRadius: "10px",
        marginBottom: "8px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <button
        type="button"
        onClick={() => hasParams && setOpen((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          cursor: hasParams ? "pointer" : "default",
          textAlign: "left",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#8059ca,#a875f7)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            {index + 1}
          </div>
          <div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#222", display: "block" }}>
              {test.name}
            </span>
          </div>
          {hasParams && (
            <span
              style={{
                fontSize: "11px",
                color: "#8059ca",
                background: "#f3eeff",
                borderRadius: "10px",
                padding: "2px 8px",
                whiteSpace: "nowrap",
                fontWeight: "500"
              }}
            >
              {test.parameterss.length} Parameter{test.parameterss.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {hasParams && (
          <i
            className={`fas fa-chevron-${open ? "up" : "down"}`}
            style={{ color: "#8059ca", fontSize: "12px", flexShrink: 0 }}
          />
        )}
      </button>

      {open && hasParams && (
        <div
          style={{
            borderTop: "1px solid #f0ebff",
            background: "#faf8ff",
            padding: "12px 18px 16px 58px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ color: "#888", borderBottom: "1.5px solid #ede9f8" }}>
                <th style={{ padding: "4px 8px 8px 0", fontWeight: "600", textAlign: "left" }}>Parameter Name</th>
                <th style={{ padding: "4px 8px 8px", fontWeight: "600", textAlign: "left" }}>Reference Range</th>
                <th style={{ padding: "4px 0 8px 8px", fontWeight: "600", textAlign: "left" }}>Units</th>
              </tr>
            </thead>
            <tbody>
              {test.parameterss.map((p) => (
                <tr
                  key={p._id}
                  style={{ borderBottom: "1px solid #ede9f8" }}
                >
                  <td style={{ padding: "8px 8px 8px 0", color: "#333", fontWeight: "500" }}>{p.name}</td>
                  <td style={{ padding: "8px 8px", color: "#555" }}>{p.normalRange || "—"}</td>
                  <td style={{ padding: "8px 0 8px 8px", color: "#777" }}>{p.units || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────────────────── */

const LabTestPackageDetails = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch ── */
  useEffect(() => {
    const idToFetch = packageId || location.state?.packageId;
    if (!idToFetch) {
      toast.error("Package not found");
      navigate(-1);
      return;
    }
    fetchPackage(idToFetch);
  }, [packageId]);

  const fetchPackage = async (id) => {
    try {
      setLoading(true);
      const res = await axiosCommonInstance.get(`packages/single/${id}`);
      setPkg(res.data?.data?.list || null);
    } catch (err) {
      toast.error("Failed to load package details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (vendor, med, effectiveVariantId, price, stock, path, servicePassed) => {
    await handleGeneralBookingProcess({
      productId: med?._id || med?.id || med?.name,
      variantId: effectiveVariantId || null,
      vendorId: vendor?.vendorId || vendor?._id || vendor?.businessDetails?._id,
      servicefixedTypes: pkg?.categories?.fixedType || "labtests",
      packageId: med?._id || null,
      navigate,
      redirectPath: path || "/booking-process",
    });
  };

  /* ── Price calc ── */
  const price = parseFloat(pkg?.price) || 0;
  const discountprice = parseFloat(pkg?.discountprice) || 0;
  const effectivePrice = discountprice > 0 && discountprice < price ? discountprice : price;
  const discount = calcDiscount(price, discountprice);
  const savings = price - effectivePrice;

  const vendorBiz = pkg?.vendor?.businessDetails;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="main-wrapper">
        <Home2Header />
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #f0ebff",
              borderTop: "4px solid #8059ca",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#8059ca", fontWeight: "500" }}>Loading package…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
        <Footer />
      </div>
    );
  }

  if (!pkg) return null;

  const tablets = pkg.tablets || [];
  const totalParams = tablets.reduce((s, t) => s + (t.parameterss?.length || 0), 0);

  return (
    <div className="main-wrapper">
      <Home2Header />



      {/* ── Main Content ── */}
      <div className="content" style={{ paddingTop: "24px", paddingBottom: "40px", marginTop: isMobile ? "75px" : "50px" }}>
        <div className="container-fluid">
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              color: "#666",
              borderRadius: "4px",
              padding: "6px 14px",
              fontSize: "12px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "5px",
              fontWeight: "500"
            }}
          >
            <i className="fas fa-arrow-left" /> Back
          </button>
          <div className="row">
            {/* ── Left: Details ── */}
            <div className="col-lg-8">

              {/* Package Hero Card */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(128,89,202,0.06)",
                  overflow: "hidden",
                  marginBottom: "20px",
                  border: "1px solid #ede9f8",
                  padding: "20px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "16px"
                  }}
                >
                  <img
                    src={pkg.files?.[0] ? getImageUrl(pkg.files[0]) : "/assets/default.png"}
                    alt={pkg.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      background: "#f8f6ff",
                      padding: "8px",
                      flexShrink: 0,
                      border: "1px solid #f0ebff"
                    }}
                    onError={(e) => { e.target.src = "/assets/default.png"; }}
                  />
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                      <span
                        style={{
                          background: "#f0ebff",
                          color: "#8059ca",
                          fontSize: "10px",
                          fontWeight: "600",
                          padding: "2px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        Lab Test Package
                      </span>
                      {discount > 0 && (
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#16a34a",
                            fontSize: "10px",
                            fontWeight: "600",
                            padding: "2px 8px",
                            borderRadius: "12px",
                          }}
                        >
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                    <h1
                      style={{
                        fontSize: isMobile ? "18px" : "20px",
                        fontWeight: "600",
                        color: "#1a1a2e",
                        margin: "0 0 8px",
                        textTransform: "capitalize",
                      }}
                    >
                      {pkg.name}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "600", color: "#8059ca" }}>
                        {formatCurrency(effectivePrice)}
                      </span>
                      {discount > 0 && (
                        <span style={{ fontSize: "13px", color: "#aaa", textDecoration: "line-through" }}>
                          {formatCurrency(price)}
                        </span>
                      )}
                      {savings > 0 && (
                        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>
                          Save {formatCurrency(savings)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subcategories / Departments tags */}
                {pkg.subcategories?.length > 0 && (
                  <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {pkg.subcategories.map((sub) => (
                      <span
                        key={sub._id}
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          backgroundColor: "#f5f5f5",
                          padding: "3px 10px",
                          borderRadius: "30px",
                          border: "1px solid #e5e5e5",
                          fontWeight: "500"
                        }}
                      >
                        <i className="fas fa-tags" style={{ marginRight: "4px", color: "#8059ca" }} />
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}

                <hr style={{ borderColor: "#ede9f8", margin: "0 0 16px" }} />

                {/* Stats row */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap"
                  }}
                >
                  {[
                    { icon: "fa-vial", label: "Tests Included", value: `${tablets.length} Tests` },
                    { icon: "fa-flask", label: "Parameters", value: `${totalParams}` },
                    // { icon: "fa-clock", label: "Reports Turnaround", value: "24–48 hrs" },
                    // { icon: "fa-home", label: "Sample Pickup", value: "Home Collection" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        flex: "1 1 120px",
                        display: "flex",
                        alignItems: "center",
                        padding: "10px",
                        borderRadius: "8px",
                        background: "#faf8ff",
                        border: "1px solid #f0ebff",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          backgroundColor: "#f0ebff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#8059ca",
                          fontSize: "13px",
                          flexShrink: 0
                        }}
                      >
                        <i className={`fas ${stat.icon}`} />
                      </div>
                      <div>
                        <span style={{ fontSize: "10px", color: "#888", display: "block" }}>{stat.label}</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#1a1a2e" }}>{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {pkg.description && (
                  <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #ede9f8" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e", marginBottom: "6px" }}>
                      Description
                    </h3>
                    <p style={{ fontSize: "12px", color: "#555", lineHeight: "1.6", margin: 0 }}>
                      {pkg.description}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* ── Right: Sticky Booking Panel ── */}
            <div className="col-lg-4">
              <div
                style={{
                  position: isMobile ? "static" : "sticky",
                  top: "80px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Price + CTA Card */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(128,89,202,0.08)",
                    border: "1px solid #ede9f8",
                    overflow: "hidden",
                    padding: "20px"
                  }}
                >
                  <p style={{ color: "#888", fontSize: "11px", margin: "0 0 2px", fontWeight: "600", textTransform: "uppercase" }}>
                    Package Price
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a2e" }}>
                      {formatCurrency(effectivePrice)}
                    </span>
                    {discount > 0 && (
                      <span style={{ fontSize: "13px", color: "#aaa", textDecoration: "line-through" }}>
                        {formatCurrency(price)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <span
                      style={{
                        display: "inline-block",
                        marginBottom: "16px",
                        background: "#fef3c7",
                        color: "#d97706",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {discount}% OFF · Save {formatCurrency(savings)}
                    </span>
                  )}

                  {/* Reusable Actions Component */}
                  <div style={{ width: "100%" }}>
                    <VendorActions
                      bookingType={pkg?.categories?.categoryType || "cartslots"}
                      IsPackage={true}
                      med={pkg}
                      vendor={pkg?.vendor || {}}
                      price={price}
                      calculatedDiscountPrice={discountprice > 0 ? discountprice : null}
                      stock={pkg?.stock || 999}
                      service={pkg?.categories?.fixedType || "labtests"}
                      handleRentalBookinProcess=""
                      handleNavigateToBooking={handleBooking}
                      handleAddLead=""
                      handleOpenConsultationModal=""
                      handleOpenAppointmentModal=""
                      handleOpenRideModal=""
                      className="w-100"
                      containerStyle={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        gap: "8px"
                      }}
                    />
                  </div>
                </div>

                {/* Vendor Card */}
                {pkg.vendor && (
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(128,89,202,0.06)",
                      border: "1px solid #ede9f8",
                      padding: "16px",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px" }}>
                      Provided By Lab
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={
                          vendorBiz?.bussiness_image?.url
                            ? getImageUrl(vendorBiz.bussiness_image.url)
                            : "/assets/default.png"
                        }
                        alt={vendorBiz?.name || "Vendor"}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid #ede9f8",
                          flexShrink: 0,
                        }}
                        onError={(e) => { e.target.src = "/assets/default.png"; }}
                      />
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 2px" }}>
                          {vendorBiz?.name || `${pkg.vendor.firstName} ${pkg.vendor.lastName}`}
                        </p>
                        {vendorBiz?.address && (
                          <p style={{ fontSize: "11px", color: "#777", margin: 0, display: "flex", alignItems: "flex-start", gap: "4px" }}>
                            <i className="fas fa-map-marker-alt" style={{ color: "#8059ca", marginTop: "2px", flexShrink: 0 }} />
                            {vendorBiz.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Tests Included (Full Width) ── */}
          {tablets.length > 0 && (
            <div className="row mt-4">
              <div className="col-12">
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(128,89,202,0.06)",
                    border: "1px solid #ede9f8",
                    marginBottom: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 20px",
                      borderBottom: "1px solid #f3eeff",
                    }}
                  >
                    <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="fas fa-vial" style={{ color: "#8059ca" }} />
                      Tests Included ({tablets.length})
                    </h3>
                  </div>
                  <div style={{ padding: "16px" }}>
                    {tablets.map((test, i) => (
                      <TestAccordionRow key={test._id} test={test} index={i} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LabTestPackageDetails;
