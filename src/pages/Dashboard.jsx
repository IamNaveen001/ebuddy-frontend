import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Zap,
  Home,
  Gauge,
  IndianRupee,
  LogOut,
  Plus,
  TrendingUp,
  CalendarDays,
  RefreshCw,
  ReceiptText,
  CircleCheck,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { auth } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";

import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [meters, setMeters] = useState([]);
  const [meterBills, setMeterBills] = useState({});
  const [readings, setReadings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedBreakdowns, setExpandedBreakdowns] = useState({});

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      setMobileMenuOpen(false);
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Failed to logout.");
    }
  };

  // ==========================================
  // FETCH METERS + BILLING
  // ==========================================

  const fetchMeters = async () => {
    if (!user?.uid) return;

    try {
      setError("");

      // --------------------------------------
      // GET USER METERS
      // --------------------------------------

      const response = await fetch(
        `${API_URL}/api/meters/${user.uid}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch meters"
        );
      }

      setMeters(Array.isArray(data) ? data : []);

      // --------------------------------------
      // GET BILLING FOR EACH METER
      // --------------------------------------

      const billData = {};

      for (const meter of data) {
        try {
          const billResponse = await fetch(
            `${API_URL}/api/billing/${user.uid}/${meter._id}`
          );

          const bill = await billResponse.json();

          if (billResponse.ok) {
            billData[meter._id] = bill;
          }
        } catch (billError) {
          console.error(
            `Billing fetch failed for ${meter._id}:`,
            billError
          );
        }
      }

      setMeterBills(billData);
    } catch (error) {
      console.error("Fetch meters error:", error);

      setError(
        error.message || "Failed to load dashboard"
      );
    }
  };

  // ==========================================
  // FETCH READINGS
  // ==========================================

  const fetchReadings = async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(
        `${API_URL}/api/readings/${user.uid}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch readings"
        );
      }

      setReadings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch readings error:", error);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchMeters(),
          fetchReadings(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleDeleteMeter = async (meterId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this meter?\n\nThis will also delete its readings and billing history."
  );

  if (!confirmed) return;

  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/meters/${user.uid}/${meterId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to delete meter"
      );
    }

    await fetchMeters();
    await fetchReadings();

  } catch (error) {
    console.error(
      "Delete meter error:",
      error
    );

    setError(
      error.message ||
        "Failed to delete meter."
    );
  }
};


  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      await Promise.all([
        fetchMeters(),
        fetchReadings(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // TOTAL CONSUMPTION
  // ==========================================

  const totalConsumption = meters.reduce(
    (total, meter) => {
      const bill = meterBills[meter._id];

      return (
        total +
        Number(bill?.totalUnits || 0)
      );
    },
    0
  );

  // ==========================================
  // TOTAL BILL
  // ==========================================

  const totalBill = meters.reduce(
    (total, meter) => {
      const bill = meterBills[meter._id];

      return (
        total +
        Number(bill?.estimatedBill || 0)
      );
    },
    0
  );

  // ==========================================
  // TOTAL FREE UNITS
  // ==========================================

  const totalFreeRemaining = meters.reduce(
    (total, meter) => {
      const bill = meterBills[meter._id];

      return (
        total +
        Number(
          bill?.freeUnitsRemaining || 0
        )
      );
    },
    0
  );

  // ==========================================
  // TOTAL CHARGEABLE UNITS
  // ==========================================

  const totalChargeableUnits = meters.reduce(
    (total, meter) => {
      const bill = meterBills[meter._id];

      return (
        total +
        Number(
          bill?.chargeableUnits || 0
        )
      );
    },
    0
  );

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // GET METER NAME
  // ==========================================

  const getMeterName = (meterId) => {
    const meter = meters.find(
      (item) => item._id === meterId
    );

    return meter?.propertyName || "Meter";
  };

  // ==========================================
  // BILL BREAKDOWN HELPERS
  // ==========================================

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getBreakdownValue = (item, keys, fallback = 0) => {
    for (const key of keys) {
      if (item?.[key] !== undefined && item?.[key] !== null) {
        return item[key];
      }
    }
    return fallback;
  };

  const getBreakdownLabel = (item) =>
    getBreakdownValue(item, ["label", "range", "slab", "name"], "Tariff slab");

  const getBreakdownUnits = (item) =>
    Number(getBreakdownValue(item, ["units", "unit", "consumedUnits"], 0));

  const getBreakdownRate = (item) =>
    Number(getBreakdownValue(item, ["rate", "price", "perUnit"], 0));

  const getBreakdownAmount = (item) =>
    Number(
      getBreakdownValue(
        item,
        ["amount", "charge", "total"],
        getBreakdownUnits(item) * getBreakdownRate(item)
      )
    );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loader"></div>

        <p>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            
  <img
    src="/tnebb.png"
    alt="EBuddy Logo"
    className="sidebar-logo"
  />

          </div>

          <div>
            <h1>TN-eBuddy</h1>

            <span>
              Smart EB Manager
            </span>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() => {
              navigate("/dashboard");
              setMobileMenuOpen(false);
            }
            }
          >
            <Gauge size={19} />

            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => {
              document
                .getElementById("meters-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
              setMobileMenuOpen(false);
            }
            }
          >
            <Home size={19} />

            My Meters
          </button>

         

          <button
            className="nav-item"
            onClick={() => {
              navigate("/usage-history");
              setMobileMenuOpen(false);
            }
            }
          >
            <TrendingUp size={19} />

            Usage History
          </button>

        </nav>

        {/* LOGOUT */}

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />

          Logout
        </button>

      </aside>

      {mobileMenuOpen && (
        <button
          className="mobile-menu-overlay"
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="dashboard-main">

        {/* ===================================
            HEADER
        =================================== */}

        <header className="dashboard-header">

          <div>
            <h2>
              Dashboard
            </h2>

            <p>
              Monitor your electricity usage
            </p>
          </div>

          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <div className="header-actions">

            <button
              className={`refresh-button ${
                refreshing
                  ? "refreshing"
                  : ""
              }`}
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh"
            >
              <RefreshCw size={17} />

              {refreshing && (
                <span>Refreshing...</span>
              )}
            </button>

            <div className="user-section">

              <div className="user-avatar">

                {user?.displayName
                  ? user.displayName
                      .charAt(0)
                      .toUpperCase()
                  : user?.email
                      ?.charAt(0)
                      .toUpperCase()}

              </div>

              <div className="user-details">

                <strong>
                  {user?.displayName ||
                    "User"}
                </strong>

                <span>
                  {user?.email}
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* ===================================
            ERROR
        =================================== */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* ===================================
            WELCOME
        =================================== */}

        <section className="welcome-section">

          <div>

            <p className="welcome-small">
              Welcome 👋
            </p>

            <h1>
              Welcome back,{" "}
              {user?.displayName ||
                "User"}
            </h1>

            <p>
              Here's your electricity overview.
            </p>

          </div>

          <div className="welcome-actions">

            <button
              className="add-reading-button"
              onClick={() =>
                navigate("/add-reading")
              }
            >
              <Gauge size={17} />

              Add Reading
            </button>

            <button
              className="add-meter-button"
              onClick={() =>
                navigate("/add-meter")
              }
            >
              <Plus size={18} />

              Add Meter
            </button>

          </div>

        </section>

        {/* ===================================
            SUMMARY
        =================================== */}

        <section className="summary-section">

          {/* TOTAL CONSUMPTION */}

          <div className="summary-card">

            <div className="summary-icon">
              <Zap size={21} />
            </div>

            <div>

              <span>
                Total Consumption
              </span>

              <strong>
                {totalConsumption.toLocaleString(
                  "en-IN"
                )}

                <small>
                  {" "}Units
                </small>
              </strong>

            </div>

          </div>

          {/* FREE UNITS */}

          <div className="summary-card">

            <div className="summary-icon">
              <Gauge size={21} />
            </div>

            <div>

              <span>
                Free Units Remaining
              </span>

              <strong>
                {totalFreeRemaining.toLocaleString(
                  "en-IN"
                )}

                <small>
                  {" "}Units
                </small>
              </strong>

            </div>

          </div>

          {/* CHARGEABLE */}

          <div className="summary-card">

            <div className="summary-icon">
              <TrendingUp size={21} />
            </div>

            <div>

              <span>
                Chargeable Units
              </span>

              <strong>
                {totalChargeableUnits.toLocaleString(
                  "en-IN"
                )}

                <small>
                  {" "}Units
                </small>
              </strong>

            </div>

          </div>

          {/* BILL */}

          <div className="summary-card">

            <div className="summary-icon">
              <IndianRupee size={21} />
            </div>

            <div>

              <span>
                Estimated Bill
              </span>

              <strong>
                ₹{" "}
                {totalBill.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* ===================================
            METERS
        =================================== */}

        <section
          className="meters-section"
          id="meters-section"
        >

          <div className="section-heading">

            <div>

              <h2>
                My Meters
              </h2>

              <p>
                Your registered EB connections
              </p>

            </div>

            <span className="meter-count">

              {meters.length}{" "}

              {meters.length === 1
                ? "Meter"
                : "Meters"}

            </span>

          </div>

          {/* NO METERS */}

          {meters.length === 0 ? (

            <div className="dashboard-empty">

              <div className="empty-icon">
                <Home size={27} />
              </div>

              <h3>
                No meters added yet
              </h3>

              <p>
                Add your first EB meter to
                start tracking electricity
                usage.
              </p>

              <button
                onClick={() =>
                  navigate("/add-meter")
                }
              >
                <Plus size={16} />

                Add Your First Meter
              </button>

            </div>

          ) : (

            <div className="meter-grid">

              {meters.map((meter) => {

                const bill =
                  meterBills[meter._id];

                const currentReading =
                  Number(
                    bill?.currentReading ??
                    meter.currentReading ??
                    meter.initialReading ??
                    0
                  );

                const totalUnits =
                  Number(
                    bill?.totalUnits || 0
                  );

                const freeRemaining =
                  Number(
                    bill?.freeUnitsRemaining ||
                    0
                  );

                const chargeableUnits =
                  Number(
                    bill?.chargeableUnits ||
                    0
                  );

                const estimatedBill =
                  Number(
                    bill?.estimatedBill ||
                    0
                  );

                const breakdown = Array.isArray(bill?.breakdown)
                  ? bill.breakdown
                  : [];

                const freeUnits = Number(bill?.freeUnits || 0);

                const energyCharge = Number(
                  bill?.energyCharge ?? estimatedBill
                );

                const freeUsed = Math.min(
                  totalUnits,
                  freeUnits
                );

                const freeProgress =
                  freeUnits > 0
                    ? Math.min((freeUsed / freeUnits) * 100, 100)
                    : 100;

                return (

                  <div
                    className="meter-card"
                    key={meter._id}
                  >

                    {/* CARD HEADER */}

                    <div className="meter-card-header">

                      <div className="meter-icon">
                        <Home size={20} />
                      </div>

                      <span className="meter-status">
                        Active
                      </span>

                    </div>

                    {/* PROPERTY NAME */}

                    <h3>
                      {meter.propertyName ||
                        "My Property"}
                    </h3>

                    {/* SERVICE NUMBER */}

                    <p className="meter-number">
                      EB No:{" "}
                      {meter.serviceNumber ||
                        "-"}
                    </p>

                    {/* CURRENT READING */}

                    <div className="meter-reading">

                      <span>
                        Current Reading
                      </span>

                      <strong>
                        {currentReading.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <small>
                        Units
                      </small>

                    </div>

                    {/* USAGE */}

                    <div className="meter-usage">

                      <div>

                        <span>
                          This Cycle
                        </span>

                        <strong>
                          {totalUnits.toLocaleString(
                            "en-IN"
                          )}{" "}
                          Units
                        </strong>

                      </div>

                      <div>

                        <span>
                          Free Remaining
                        </span>

                        <strong>
                          {freeRemaining.toLocaleString(
                            "en-IN"
                          )}{" "}
                          Units
                        </strong>

                      </div>

                    </div>

                    {/* CHARGEABLE */}

                    <div className="meter-usage">

                      <div>

                        <span>
                          Chargeable
                        </span>

                        <strong>
                          {chargeableUnits.toLocaleString(
                            "en-IN"
                          )}{" "}
                          Units
                        </strong>

                      </div>

                    </div>

                    {/* BILL */}

                    <div className="meter-bill">

                      <span>
                        Estimated Bill
                      </span>

                      <strong>
                        ₹{" "}
                        {estimatedBill.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 0,
                          }
                        )}
                      </strong>

                    </div>

                    {/* FREE UNIT PROGRESS */}

                    <div className="free-unit-progress">
                      <div className="free-progress-header">
                        <span>Free Unit Usage</span>
                        <strong>
                          {freeUnits > 0
                            ? `${Math.round(freeProgress)}%`
                            : "—"}
                        </strong>
                      </div>

                      <div className="free-progress-track">
                        <span
                          style={{
                            width: `${freeProgress}%`,
                          }}
                        />
                      </div>

                      <div className="free-progress-footer">
                        <span>
                          {freeUsed.toLocaleString("en-IN")} used
                        </span>
                        <span>
                          {freeRemaining.toLocaleString("en-IN")} remaining
                        </span>
                      </div>
                    </div>

                    {/* BILL BREAKDOWN TOGGLE */}

                    {breakdown.length > 0 && (
                      <>
                        <button
                          type="button"
                          className={`bill-breakdown-toggle ${
                            expandedBreakdowns[meter._id] ? "open" : ""
                          }`}
                          onClick={() =>
                            setExpandedBreakdowns((prev) => ({
                              ...prev,
                              [meter._id]: !prev[meter._id],
                            }))
                          }
                          aria-expanded={!!expandedBreakdowns[meter._id]}
                        >
                          <span className="bill-breakdown-toggle-left">
                            <ReceiptText size={16} />
                            <span>Bill Breakdown</span>
                          </span>
                          <span className="bill-breakdown-toggle-right">
                            <small>{formatMoney(energyCharge) === "0.00" ? "Free / ₹0" : `₹${formatMoney(energyCharge)}`}</small>
                            <ChevronDown size={17} />
                          </span>
                        </button>

                        {expandedBreakdowns[meter._id] && (
                          <div className="dashboard-bill-breakdown">
                            <div className="dashboard-breakdown-header">
                              <div className="dashboard-breakdown-title">
                                <ReceiptText size={15} />
                                <div>
                                  <strong>Bill Breakdown</strong>
                                  <span>
                                    {bill?.tariffType || "Current tariff"}
                                  </span>
                                </div>
                              </div>

                              <CircleCheck size={17} />
                            </div>

                            <div className="dashboard-breakdown-free">
                              <span>Free units</span>
                              <strong>
                                {freeUnits.toLocaleString("en-IN")} units
                              </strong>
                            </div>

                            <div className="dashboard-breakdown-list">
                              {breakdown.map((item, index) => {
                                const units = getBreakdownUnits(item);
                                const rate = getBreakdownRate(item);
                                const amount = getBreakdownAmount(item);

                                return (
                                  <div
                                    className="dashboard-breakdown-row"
                                    key={item?._id || item?.id || index}
                                  >
                                    <div>
                                      <strong>{getBreakdownLabel(item)}</strong>
                                      <span>
                                        {units.toLocaleString("en-IN")} units × ₹
                                        {rate.toFixed(2)}
                                      </span>
                                    </div>

                                    <strong>
                                      ₹{formatMoney(amount)}
                                    </strong>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="dashboard-breakdown-total">
                              <span>Energy Charge</span>
                              <strong>₹{formatMoney(energyCharge)}</strong>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* CYCLE DATES */}

                    {bill?.startDate && (
                      <div className="meter-cycle-date">

                        <span>
                          Billing Cycle
                        </span>

                        <p>
                          {formatDate(
                            bill.startDate
                          )}
                          {" "}–{" "}
                          {formatDate(
                            bill.endDate
                          )}
                        </p>

                      </div>
                    )}

                     <div className="meter-card-actions">

  <button
    className="edit-meter-button"
    onClick={() =>
      navigate(
        `/edit-meter/${meter._id}`
      )
    }
  >
    Edit
  </button>

  <button
    className="delete-meter-button"
    onClick={() =>
      handleDeleteMeter(meter._id)
    }
  >
    Delete
  </button>

</div>

                    {/* VIEW HISTORY */}

                    <button
                      className="view-history-button"
                      onClick={() =>
                        navigate(
                          `/usage-history?meter=${meter._id}`
                        )
                      }
                    >
                      View Usage History

                      <TrendingUp
                        size={14}
                      />
                    </button>

                  </div>

                );
              })}

            </div>

          )}

        </section>

        {/* ===================================
            RECENT READINGS
        =================================== */}

        <section className="recent-section">

          <div className="section-heading">

            <div>

              <h2>
                Recent Readings
              </h2>

              <p>
                Latest meter reading updates
              </p>

            </div>

            {readings.length > 5 && (
              <button
                className="view-all-button"
                onClick={() => {
                  navigate("/usage-history");
                  setMobileMenuOpen(false);
                }}
                
              >
                View All
              </button>
            )}

          </div>

          {/* NO READINGS */}

          {readings.length === 0 ? (

            <div className="recent-empty">

              <CalendarDays
                size={24}
              />

              <p>
                No readings added yet.
              </p>

              <button
                onClick={() =>
                  navigate("/add-reading")
                }
              >
                Add your first reading
              </button>

            </div>

          ) : (

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Meter
                    </th>

                    <th>
                      Reading
                    </th>

                    <th>
                      Usage
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {readings
                    .slice(0, 5)
                    .map((reading) => (

                      <tr
                        key={reading._id}
                      >

                        <td>
                          {formatDate(
                            reading.readingDate
                          )}
                        </td>

                        <td>

                          <strong>
                            {getMeterName(
                              reading.meterId
                            )}
                          </strong>

                        </td>

                        <td>

                          {Number(
                            reading.reading || 0
                          ).toLocaleString(
                            "en-IN"
                          )}

                          <span className="table-unit">
                            Units
                          </span>

                        </td>

                        <td>

                          <span className="usage-table-badge">

                            +
                            {Number(
                              reading.unitsUsed ||
                              0
                            )}

                            {" "}Units

                          </span>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default Dashboard;