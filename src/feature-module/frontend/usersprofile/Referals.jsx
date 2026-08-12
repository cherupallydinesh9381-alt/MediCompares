import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { FaCopy, FaShareAlt, FaCheck, FaUserPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";

const Referral = ({ HomeNavigate, BackButton, profile }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [isCopied, setIsCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("MEDI1234");
  const [referredUsers, setReferredUsers] = useState([]);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        // const response = await api.get('/user/referral');
        // setReferralCode(response.data.referralCode);
        // setReferredUsers(response.data.referredUsers || []);
      } catch (error) {
        // Error fetching referral data
      }
    };
    fetchReferralData();
  }, []);

  const referralLink = `https://medicompares.com/login?ref=${profile?.refferalcode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setIsCopied(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        toast.error('Failed to copy link');
      });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MedicalCompare with my referral',
          text: `Use my referral code ${profile?.refferalcode} to get special benefits on MedicalCompare!`,
          url: referralLink,
        });
      } catch (err) {
        // Error sharing
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="referral-container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: isMobile ? '15px' : '20px'
    }}>
      {/* Header Section */}
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
                className="fa-solid fa-user-plus"
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
                Refer & Earn
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
              Invite friends and earn rewards for each successful referral
            </p>
          </div>
        </div>
      </div>

      {/* Referral Card */}
      <div style={{
        backgroundColor: "#8059ca",
        color: "white",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
        textAlign: "center",
        background: "linear-gradient(135deg, #8059ca 0%, #5a0fd6 100%)",
      }}>
        <FaUserPlus size={40} style={{ marginBottom: "15px" }} />
        <h3 className="text-white" style={{ margin: "0 0 10px 0" }}>Invite Friends & Earn Rewards</h3>
        <p className="text-white" style={{ margin: "0 0 20px 0", opacity: 0.9 }}>
          Share your referral code and earn ₹100 for every friend who signs up
        </p>

        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px"
        }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#fff" }}>Your Referral Code</p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px"
          }}>
            <div style={{
              backgroundColor: "white",
              color: "#8059ca",
              padding: "8px 15px",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "18px",
              letterSpacing: "1px"
            }}>
              {profile?.refferalcode}
            </div>
            <button
              onClick={handleCopyLink}
              style={{
                backgroundColor: "white",
                color: "#8059ca",
                border: "none",
                padding: "8px 15px",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              {isCopied ? <FaCheck /> : <FaCopy />}
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <button
          onClick={handleShare}
          style={{
            backgroundColor: "white",
            color: "#8059ca",
            border: "none",
            padding: "12px 25px",
            borderRadius: "30px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "16px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
          }}
        >
          <FaShareAlt /> Share Referral Link
        </button>
      </div>

      {/* How It Works Section */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      }}>
        <h4 style={{ marginTop: 0, marginBottom: "15px", color: "#2c3e50" }}>How It Works</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {[
            {
              step: "1",
              title: "Share Your Link",
              description: "Share your referral link with friends and family"
            },
            {
              step: "2",
              title: "They Sign Up",
              description: "Your friends sign up using your referral link"
            },
            {
              step: "3",
              title: "You Earn Rewards",
              description: "Earn ₹100 for every successful referral"
            }
          ].map((item, index) => (
            <div key={index} style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
              <div style={{
                backgroundColor: "#f0f0ff",
                color: "#8059ca",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontWeight: "bold",
                fontSize: "14px"
              }}>
                {item.step}
              </div>
              <div>
                <h5 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "600" }}>{item.title}</h5>
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral History */}
      {referredUsers.length > 0 && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
        }}>
          <h4 style={{ marginTop: 0, marginBottom: "15px", color: "#2c3e50" }}>Your Referrals</h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: "10px", color: "#666", fontWeight: "normal" }}>Name</th>
                  <th style={{ textAlign: "left", padding: "10px", color: "#666", fontWeight: "normal" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "10px", color: "#666", fontWeight: "normal" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {referredUsers.map((user, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px 10px" }}>{user.name}</td>
                    <td style={{ padding: "12px 10px" }}>{new Date(user.date).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 10px", textAlign: "right" }}>
                      <span style={{
                        backgroundColor: user.status === 'Completed' ? '#e6f7ee' : '#fff4e6',
                        color: user.status === 'Completed' ? '#10b981' : '#f59e0b',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referral;