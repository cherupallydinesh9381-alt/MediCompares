import React, { useState } from "react";
import Home2Header from "../home/home-4/Header-k";
import Footer from "../home/home-4/Footer-f";
import { axiosCommonInstance } from "../../../Apiservice";
import toast, { Toaster } from "react-hot-toast";
import SEOHelmet from "../../../components/SEOHelmet";

const DeleteAccount = () => {
    const [step, setStep] = useState(1); // 1: identifier, 2: otp, 3: success
    const [identifierType, setIdentifierType] = useState("email"); // "email" | "mobile"
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [maskedTarget, setMaskedTarget] = useState("");

    const isEmail = (val) => /\S+@\S+\.\S+/.test(val);
    const isPhone = (val) => /^[0-9]{10}$/.test(val.replace(/\D/g, ""));

    const maskIdentifier = (val, type) => {
        if (type === "email") {
            const [user, domain] = val.split("@");
            const visible = user.slice(0, 2);
            return `${visible}${"*".repeat(Math.max(user.length - 2, 2))}@${domain}`;
        }
        const digits = val.replace(/\D/g, "");
        return `${"*".repeat(Math.max(digits.length - 2, 0))}${digits.slice(-2)}`;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!identifier.trim()) {
            toast.error(
                `Please enter your ${identifierType === "email" ? "registered email" : "registered mobile number"}`
            );
            return;
        }

        if (identifierType === "email" && !isEmail(identifier)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (identifierType === "phone" && !isPhone(identifier)) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }

        setIsSubmitting(true);
        try {
            const payloadIdentifier =
                identifierType === "phone" ? `${identifier.trim()}` : identifier.trim();

            const response = await axiosCommonInstance.post("account/delete/send-otp", {
                identifier: payloadIdentifier,
                type: identifierType,
            });
            const isSuccess = response?.data?.success !== false;
            if (isSuccess) {
                setMaskedTarget(maskIdentifier(identifier.trim(), identifierType));
                toast.success("OTP sent successfully");
                setStep(2);
            } else {
                // setStep(2)
                toast.error(response?.data?.message || "Could not find an account with these details");
            }
        } catch (err) {
            // setStep(2)
            toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!otp.trim() || otp.trim().length < 4) {
            toast.error("Please enter a valid OTP");
            return;
        }
        setIsSubmitting(true);
        try {
            const payloadIdentifier =
                identifierType === "phone" ? `${identifier.trim()}` : identifier.trim();

            const response = await axiosCommonInstance.post("account/delete/verify-otp", {
                identifier: payloadIdentifier || setMaskedTarget,
                otp: otp.trim(),
            });
            const isSuccess = response?.data?.success !== false;
            if (isSuccess) {
                setStep(3);
                toast.success(response?.data?.message || "Your Account Delated Sucessfully");
            } else {
                // setStep(3);
                toast.error(response?.data?.message || "Invalid or expired OTP");
            }
        } catch (err) {
            // setStep(3);
            toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        setIsSubmitting(true);
        try {
            const payloadIdentifier =
                identifierType === "phone" ? `+91${identifier.trim()}` : identifier.trim();

            const response = await axiosCommonInstance.post("account/delete/send-otp", {
                identifier: payloadIdentifier,
                type: identifierType,
            });
            const isSuccess = response?.data?.success !== false;
            if (isSuccess) {
                toast.success("OTP resent successfully");
            } else {
                toast.error(response?.data?.message || "Could not resend OTP");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 14px",
        fontSize: "14px",
        color: "#0f172a",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        textAlign: "center",
        letterSpacing: "2px",
    };

    const onFocusStyle = (e) => {
        e.target.style.borderColor = "#8059ca";
        e.target.style.boxShadow = "0 0 0 3px rgba(128, 89, 202, 0.12)";
        e.target.style.background = "#fff";
    };

    const onBlurStyle = (e) => {
        e.target.style.borderColor = "#e2e8f0";
        e.target.style.boxShadow = "none";
        e.target.style.background = "#f8fafc";
    };

    return (
        <>
            <SEOHelmet page="delete-account" />
            <Toaster />
            <Home2Header />

            <div
                className="breadcrumb-bar"
                style={{
                    backgroundImage: "url('/assets/Medicompares Background.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    padding: "96px 0 36px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div className="container" style={{ position: "relative", zIndex: 1 }}>
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10 col-12 text-center">
                            <div className="page-breadcrumb">
                                <span
                                    style={{
                                        display: "inline-block",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        letterSpacing: "1.4px",
                                        textTransform: "uppercase",
                                        color: "#8059ca",
                                        background: "rgba(128, 89, 202, 0.1)",
                                        padding: "5px 14px",
                                        borderRadius: "20px",
                                        marginBottom: "12px",
                                    }}
                                >
                                    Account Settings
                                </span>

                                <h2
                                    className="breadcrumb-title"
                                    style={{
                                        fontSize: "clamp(26px, 4vw, 34px)",
                                        color: "#0f172a",
                                        margin: "0 0 10px",
                                        lineHeight: 1.25,
                                    }}
                                >
                                    Delete Account
                                </h2>

                                <p
                                    style={{
                                        fontSize: "15px",
                                        color: "#64748b",
                                        margin: "0 auto",
                                        maxWidth: "460px",
                                        lineHeight: 1.6,
                                        fontWeight: 400,
                                    }}
                                >
                                    We&apos;re sorry to see you go. Verify your identity below to permanently delete your account.
                                </p>

                                <div
                                    style={{
                                        width: "52px",
                                        height: "3px",
                                        borderRadius: "3px",
                                        background: "linear-gradient(90deg, #8059ca, #a78bfa)",
                                        margin: "18px auto 0",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section style={{ padding: "48px 0 80px" }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6 col-md-8 col-12">
                            <div
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "16px",
                                    border: "1px solid #f1f5f9",
                                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03), 0 2px 8px rgba(15, 23, 42, 0.04)",
                                    padding: "32px 28px",
                                }}
                            >
                                {/* STEP 1: Identifier */}
                                {step === 1 && (
                                    <>
                                        <div
                                            style={{
                                                width: "52px",
                                                height: "52px",
                                                borderRadius: "14px",
                                                background: "rgba(220, 38, 38, 0.1)",
                                                color: "#dc2626",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "22px",
                                                marginBottom: "18px",
                                            }}
                                        >
                                            <i className="fa-solid fa-user-slash" />
                                        </div>

                                        <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>
                                            Verify your account
                                        </h3>
                                        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px", lineHeight: 1.6 }}>
                                            Enter the email or mobile number linked to your account. We&apos;ll send you a one-time
                                            password (OTP) to confirm this request.
                                        </p>

                                        <div
                                            style={{
                                                background: "rgba(220, 38, 38, 0.06)",
                                                border: "1px solid rgba(220, 38, 38, 0.15)",
                                                borderRadius: "10px",
                                                padding: "12px 14px",
                                                marginBottom: "22px",
                                                display: "flex",
                                                gap: "10px",
                                                alignItems: "flex-start",
                                            }}
                                        >
                                            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#dc2626", fontSize: "13px", marginTop: "2px" }} />
                                            <p style={{ fontSize: "12.5px", color: "#991b1b", margin: 0, lineHeight: 1.55 }}>
                                                This action is permanent. All your bookings, orders, saved addresses, and personal
                                                data will be deleted and cannot be recovered.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSendOtp}>
                                            {/* Identifier Type Toggle */}
                                            <label
                                                style={{
                                                    display: "block",
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    color: "#334155",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                Verify using
                                            </label>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px",
                                                    marginBottom: "16px",
                                                    background: "#f8fafc",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "10px",
                                                    padding: "4px",
                                                }}
                                            >
                                                {[
                                                    { key: "email", label: "Email", icon: "fa-envelope" },
                                                    { key: "phone", label: "Mobile Number", icon: "fa-mobile-screen" },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.key}
                                                        type="button"
                                                        onClick={() => {
                                                            setIdentifierType(opt.key);
                                                            setIdentifier("");
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            gap: "7px",
                                                            padding: "9px 12px",
                                                            fontSize: "13px",
                                                            fontWeight: 600,
                                                            color: identifierType === opt.key ? "#8059ca" : "#64748b",
                                                            background: identifierType === opt.key ? "#ffffff" : "transparent",
                                                            border: "none",
                                                            borderRadius: "8px",
                                                            boxShadow: identifierType === opt.key ? "0 1px 4px rgba(15, 23, 42, 0.08)" : "none",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s ease",
                                                        }}
                                                    >
                                                        <i className={`fa-solid ${opt.icon}`} style={{ fontSize: "12px" }} />
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <label
                                                style={{
                                                    display: "block",
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    color: "#334155",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                {identifierType === "email" ? "Email Address" : "Mobile Number"}
                                            </label>

                                            <div style={{ position: "relative", marginBottom: "20px" }}>
                                                {identifierType === "phone" && (
                                                    <span
                                                        style={{
                                                            position: "absolute",
                                                            left: "14px",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            fontSize: "14px",
                                                            color: "#64748b",
                                                            fontWeight: 500,
                                                            pointerEvents: "none",
                                                        }}
                                                    >
                                                        +91
                                                    </span>
                                                )}
                                                <input
                                                    type={identifierType === "email" ? "email" : "tel"}
                                                    inputMode={identifierType === "email" ? "email" : "numeric"}
                                                    maxLength={identifierType === "phone" ? 10 : undefined}
                                                    value={identifier}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (identifierType === "phone") {
                                                            setIdentifier(val.replace(/\D/g, "").slice(0, 10));
                                                        } else {
                                                            setIdentifier(val);
                                                        }
                                                    }}
                                                    placeholder={
                                                        identifierType === "email"
                                                            ? "Enter your registered email address"
                                                            : "Enter your registered mobile number"
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        padding: identifierType === "phone" ? "10px 14px 10px 44px" : "10px 14px",
                                                        fontSize: "14px",
                                                        color: "#0f172a",
                                                        background: "#f8fafc",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "10px",
                                                        outline: "none",
                                                        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                                                    }}
                                                    onFocus={onFocusStyle}
                                                    onBlur={onBlurStyle}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px 28px",
                                                    fontSize: "14px",
                                                    fontWeight: 600,
                                                    color: "#ffffff",
                                                    background: isSubmitting ? "#ef8b8b" : "#dc2626",
                                                    border: "none",
                                                    borderRadius: "10px",
                                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                                    boxShadow: "0 2px 6px rgba(220, 38, 38, 0.2)",
                                                    transition: "all 0.2s ease",
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSubmitting) e.currentTarget.style.background = "#b91c1c";
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSubmitting) e.currentTarget.style.background = "#dc2626";
                                                }}
                                            >
                                                {isSubmitting ? "Sending OTP..." : "Send OTP"}
                                            </button>
                                        </form>
                                    </>
                                )}

                                {/* STEP 2: OTP */}
                                {step === 2 && (
                                    <>
                                        <div
                                            style={{
                                                width: "52px",
                                                height: "52px",
                                                borderRadius: "14px",
                                                background: "rgba(128, 89, 202, 0.1)",
                                                color: "#8059ca",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "22px",
                                                marginBottom: "18px",
                                            }}
                                        >
                                            <i className="fa-solid fa-shield-halved" />
                                        </div>

                                        <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>
                                            Enter verification code
                                        </h3>
                                        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px", lineHeight: 1.6 }}>
                                            We&apos;ve sent a 6-digit OTP to <strong style={{ color: "#0f172a" }}>{maskedTarget}</strong>.
                                            Enter it below to confirm account deletion.
                                        </p>

                                        <form onSubmit={handleVerifyOtp}>
                                            <label
                                                style={{
                                                    display: "block",
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    color: "#334155",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                OTP
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                                placeholder="------"
                                                style={{ ...inputStyle, marginBottom: "12px", fontSize: "18px", fontWeight: 600 }}
                                                onFocus={onFocusStyle}
                                                onBlur={onBlurStyle}
                                            />

                                            {/* <div style={{ textAlign: "right", marginBottom: "20px" }}>
                                                <button
                                                    type="button"
                                                    onClick={handleResendOtp}
                                                    disabled={isSubmitting}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        color: "#8059ca",
                                                        fontSize: "13px",
                                                        fontWeight: 600,
                                                        cursor: isSubmitting ? "not-allowed" : "pointer",
                                                        padding: 0,
                                                    }}
                                                >
                                                    Resend OTP
                                                </button>
                                            </div> */}

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px 28px",
                                                    fontSize: "14px",
                                                    fontWeight: 600,
                                                    color: "#ffffff",
                                                    background: isSubmitting ? "#ef8b8b" : "#dc2626",
                                                    border: "none",
                                                    borderRadius: "10px",
                                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                                    boxShadow: "0 2px 6px rgba(220, 38, 38, 0.2)",
                                                    transition: "all 0.2s ease",
                                                    marginBottom: "12px",
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSubmitting) e.currentTarget.style.background = "#b91c1c";
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSubmitting) e.currentTarget.style.background = "#dc2626";
                                                }}
                                            >
                                                {isSubmitting ? "Verifying..." : "Verify & Delete Account"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStep(1);
                                                    setOtp("");
                                                }}
                                                style={{
                                                    width: "100%",
                                                    padding: "10px 28px",
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: "#64748b",
                                                    background: "transparent",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "10px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Go Back
                                            </button>
                                        </form>
                                    </>
                                )}

                                {/* STEP 3: Success */}
                                {step === 3 && (
                                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                                        <div
                                            style={{
                                                width: "64px",
                                                height: "64px",
                                                borderRadius: "50%",
                                                background: "rgba(46, 204, 113, 0.1)",
                                                color: "#2ecc71",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "28px",
                                                margin: "0 auto 20px",
                                            }}
                                        >
                                            <i className="fa-solid fa-check" />
                                        </div>

                                        <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }}>
                                            Account Deleted Successfully
                                        </h3>
                                        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 0", lineHeight: 1.65 }}>
                                            Your account and all associated data have been permanently removed from our systems.
                                            We&apos;re sad to see you go — thank you for having been with us.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Step indicator */}
                            {step !== 3 && (
                                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
                                    {[1, 2].map((s) => (
                                        <div
                                            key={s}
                                            style={{
                                                width: s === step ? "22px" : "8px",
                                                height: "8px",
                                                borderRadius: "10px",
                                                background: s === step ? "#8059ca" : "#e2e8f0",
                                                transition: "all 0.25s ease",
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default DeleteAccount;