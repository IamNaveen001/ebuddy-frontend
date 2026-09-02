import { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Gauge,
  Home,
  IndianRupee,
  Pencil,
  RefreshCw,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";

import "./UsageHistory.css";


const UsageHistory = () => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();


  // ==========================================
  // STATES
  // ==========================================

  const [meters, setMeters] =
    useState([]);

  const [selectedMeter, setSelectedMeter] =
    useState(
      searchParams.get("meter") || ""
    );

  const [readings, setReadings] =
    useState([]);

  const [billing, setBilling] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");


  // ==========================================
  // FETCH METERS
  // ==========================================

  const fetchMeters = async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(
        `${API_URL}/api/meters/${user.uid}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch meters"
        );
      }

      setMeters(data);

      // Select first meter if
      // nothing is selected
      if (
        !selectedMeter &&
        data.length > 0
      ) {
        setSelectedMeter(
          data[0]._id
        );
      }

    } catch (error) {
      console.error(
        "Fetch meters error:",
        error
      );

      setError(
        "Failed to load meters."
      );
    }
  };


  // ==========================================
  // FETCH METER READINGS
  // ==========================================

  const fetchReadings = async (
    meterId
  ) => {
    if (
      !user?.uid ||
      !meterId
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/readings/${user.uid}/${meterId}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch readings"
        );
      }

      setReadings(data);

    } catch (error) {
      console.error(
        "Fetch readings error:",
        error
      );

      setError(
        "Failed to load readings."
      );
    }
  };


  // ==========================================
  // FETCH BILLING
  // ==========================================

  const fetchBilling = async (
    meterId
  ) => {
    if (
      !user?.uid ||
      !meterId
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/billing/${user.uid}/${meterId}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch billing"
        );
      }

      setBilling(data);

    } catch (error) {
      console.error(
        "Fetch billing error:",
        error
      );

      setBilling(null);
    }
  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      setLoading(true);

      await fetchMeters();

      setLoading(false);
    };

    load();
  }, [user]);


  // ==========================================
  // METER CHANGE
  // ==========================================

  useEffect(() => {
    if (
      user?.uid &&
      selectedMeter
    ) {
      setError("");

      fetchReadings(
        selectedMeter
      );

      fetchBilling(
        selectedMeter
      );
    }
  }, [
    user,
    selectedMeter,
  ]);


  // ==========================================
  // SELECTED METER
  // ==========================================

  const meter =
    meters.find(
      (item) =>
        item._id === selectedMeter
    );


  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    if (!selectedMeter) {
      return;
    }

    setRefreshing(true);
    setError("");

    await fetchReadings(
      selectedMeter
    );

    await fetchBilling(
      selectedMeter
    );

    setRefreshing(false);
  };


  // ==========================================
  // DELETE READING
  // ==========================================

  const handleDeleteReading = async (
    readingId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this reading?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(readingId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/readings/${user.uid}/${readingId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete reading."
        );
      }

      // Refresh readings
      await fetchReadings(
        selectedMeter
      );

      // Recalculate billing
      await fetchBilling(
        selectedMeter
      );

    } catch (error) {
      console.error(
        "Delete reading error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete reading."
      );

    } finally {
      setDeletingId(null);
    }
  };


  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==========================================
  // CYCLE DATES
  // ==========================================

  const cycleStart =
    billing?.startDate
      ? formatDate(
          billing.startDate
        )
      : "-";

  const cycleEnd =
    billing?.endDate
      ? formatDate(
          billing.endDate
        )
      : "-";


  // ==========================================
  // CHART DATA
  // ==========================================

  const chartReadings =
    [...readings]
      .sort(
        (a, b) =>
          new Date(
            a.readingDate
          ) -
          new Date(
            b.readingDate
          )
      )
      .slice(-8);


  const maxUsage =
    Math.max(
      ...chartReadings.map(
        (item) =>
          Number(
            item.unitsUsed || 0
          )
      ),
      1
    );


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="history-loading">
        <div className="history-loader"></div>

        <p>
          Loading usage history...
        </p>
      </div>
    );
  }


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="history-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="history-header">

        <button
          className="history-back"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <ArrowLeft size={17} />

          Dashboard
        </button>


        <div className="history-brand">

          <div className="history-logo">
            <Zap
              size={19}
              fill="currentColor"
            />
          </div>

          <div>
            <strong>
              EBuddy
            </strong>

            <span>
              Smart EB Manager
            </span>
          </div>

        </div>

      </header>


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="history-main">


        {/* TITLE */}

        <div className="history-title">

          <div>

            <span>
              ANALYTICS
            </span>

            <h1>
              Usage History
            </h1>

            <p>
              Track your electricity
              consumption and billing cycle.
            </p>

          </div>


          <button
            className="history-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >

            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "refresh-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="history-error">
            {error}
          </div>
        )}


        {/* ===================================
            METER SELECTOR
        =================================== */}

        <div className="meter-selector-card">

          <div className="meter-selector-label">

            <Home size={17} />

            <div>

              <span>
                Select Meter
              </span>

              <strong>
                Choose a meter to view
                its usage
              </strong>

            </div>

          </div>


          <select
            value={selectedMeter}
            onChange={(e) =>
              setSelectedMeter(
                e.target.value
              )
            }
          >

            {meters.length === 0 && (
              <option value="">
                No meters available
              </option>
            )}

            {meters.map(
              (item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.propertyName}
                  {" — "}
                  {item.serviceNumber}
                </option>
              )
            )}

          </select>

        </div>


        {/* ===================================
            METER INFO
        =================================== */}

        {meter && (
          <div className="selected-meter-info">

            <div>

              <div className="selected-meter-icon">
                <Home size={18} />
              </div>

              <div>

                <strong>
                  {meter.propertyName}
                </strong>

                <span>
                  EB No:{" "}
                  {meter.serviceNumber}
                </span>

              </div>

            </div>


            <div className="current-reading-small">

              <span>
                Current Reading
              </span>

              <strong>

                {Number(
                  meter.currentReading ??
                    billing?.currentReading ??
                    0
                ).toLocaleString(
                  "en-IN"
                )}

                <small>
                  Units
                </small>

              </strong>

            </div>

          </div>
        )}


        {/* ===================================
            BILLING CYCLE
        =================================== */}

        <section className="billing-cycle-section">

          <div className="history-section-heading">

            <div>

              <h2>
                Current Billing Cycle
              </h2>

              <p>
                Two-month electricity
                consumption overview
              </p>

            </div>


            {billing?.status && (
              <span className="cycle-status">
                {billing.status}
              </span>
            )}

          </div>


          <div className="cycle-date">

            <CalendarDays size={15} />

            {cycleStart}

            <span>
              →
            </span>

            {cycleEnd}

          </div>


          <div className="history-summary-grid">


            {/* CONSUMPTION */}

            <div className="history-summary-card">

              <div className="history-summary-icon">
                <Zap size={19} />
              </div>

              <span>
                Total Consumption
              </span>

              <strong>

                {Number(
                  billing?.totalUnits || 0
                ).toLocaleString(
                  "en-IN"
                )}

                <small>
                  Units
                </small>

              </strong>

            </div>


            {/* FREE */}

            <div className="history-summary-card">

              <div className="history-summary-icon">
                <Gauge size={19} />
              </div>

              <span>
                Free Units Remaining
              </span>

              <strong>

                {Number(
                  billing?.freeUnitsRemaining ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}

                <small>
                  Units
                </small>

              </strong>

            </div>


            {/* CHARGEABLE */}

            <div className="history-summary-card">

              <div className="history-summary-icon">
                <TrendingUp size={19} />
              </div>

              <span>
                Chargeable Units
              </span>

              <strong>

                {Number(
                  billing?.chargeableUnits ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}

                <small>
                  Units
                </small>

              </strong>

            </div>


            {/* BILL */}

            <div className="history-summary-card">

              <div className="history-summary-icon">
                <IndianRupee size={19} />
              </div>

              <span>
                Estimated Bill
              </span>

              <strong>

                ₹{" "}

                {Number(
                  billing?.estimatedBill || 0
                ).toLocaleString(
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
            USAGE CHART
        =================================== */}

        <section className="chart-section">

          <div className="history-section-heading">

            <div>

              <h2>
                Usage Trend
              </h2>

              <p>
                Recent meter reading
                consumption
              </p>

            </div>

          </div>


          {chartReadings.length === 0 ? (

            <div className="history-no-data">

              <TrendingUp size={25} />

              <p>
                No reading data available
                for the chart.
              </p>

            </div>

          ) : (

            <div className="usage-chart">

              {chartReadings.map(
                (item) => {

                  const usage =
                    Number(
                      item.unitsUsed || 0
                    );


                  const height =
                    Math.max(
                      (usage /
                        maxUsage) *
                        100,
                      4
                    );


                  return (
                    <div
                      className="chart-column"
                      key={item._id}
                    >

                      <div className="chart-value">
                        {usage}
                      </div>


                      <div className="chart-bar-wrapper">

                        <div
                          className="chart-bar"
                          style={{
                            height:
                              `${height}%`,
                          }}
                        ></div>

                      </div>


                      <span>
                        {new Date(
                          item.readingDate
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )}
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>


        {/* ===================================
            READING TABLE
        =================================== */}

        <section className="reading-history-section">

          <div className="history-section-heading">

            <div>

              <h2>
                Reading History
              </h2>

              <p>
                All recorded meter readings
              </p>

            </div>

            <span className="reading-count">

              {readings.length}

              {" "}

              {readings.length === 1
                ? "Reading"
                : "Readings"}

            </span>

          </div>


          {readings.length === 0 ? (

            <div className="history-no-data">

              <CalendarDays size={25} />

              <p>
                No readings have been
                recorded yet.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/add-reading"
                  )
                }
              >
                Add Reading
              </button>

            </div>

          ) : (

            <div className="history-table-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Previous
                    </th>

                    <th>
                      Current
                    </th>

                    <th>
                      Usage
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {readings.map(
                    (item) => (

                      <tr
                        key={
                          item._id
                        }
                      >

                        {/* DATE */}

                        <td>

                          <div className="date-cell">

                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              item.readingDate
                            )}

                          </div>

                        </td>


                        {/* PREVIOUS */}

                        <td>

                          {Number(
                            item.previousReading ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        {/* CURRENT */}

                        <td>

                          <strong>

                            {Number(
                              item.reading ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </td>


                        {/* USAGE */}

                        <td>

                          <span className="usage-badge">

                            +{" "}

                            {Number(
                              item.unitsUsed ||
                                0
                            )}

                            {" "}Units

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="reading-actions">

                            {/* EDIT */}

                            <button
                              type="button"
                              className="reading-edit-button"
                              title="Edit Reading"
                              onClick={() =>
                                navigate(
                                  `/edit-reading/${item._id}`
                                )
                              }
                            >
                              <Pencil
                                size={14}
                              />

                              <span>
                                Edit
                              </span>
                            </button>


                            {/* DELETE */}

                            <button
                              type="button"
                              className="reading-delete-button"
                              title="Delete Reading"
                              disabled={
                                deletingId ===
                                item._id
                              }
                              onClick={() =>
                                handleDeleteReading(
                                  item._id
                                )
                              }
                            >

                              <Trash2
                                size={14}
                              />

                              <span>
                                {deletingId ===
                                item._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </span>

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


      </main>

    </div>
  );
};


export default UsageHistory;