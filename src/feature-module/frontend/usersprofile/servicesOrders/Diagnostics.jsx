import React from "react";

const DiagnosticsBookings = ({ HomeNavigate }) => {
  return (
    <div className="main-wrapper">
      <div className="content doctor-content">
        <div className="container">
          <div className="row">
            {HomeNavigate && (
              <div className="col-12 mb-3 d-flex justify-content-end">
                <HomeNavigate />
              </div>
            )}
            <div className="col-lg-12">
              <div
                className="dashboard-header"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "25px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                  width: "100%",
                }}
              >
                <h3 style={{ fontSize: "24px", fontWeight: "600", color: "#333", margin: "0" }}>
                  Diagnostics
                </h3>
                <p style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
                  Manage and track all your Diagnostics bookings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsBookings;
