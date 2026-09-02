import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Gauge,
  CalendarDays,
  Save,
  Zap,
} from "lucide-react";

import API_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

import "./AddMeter.css";

const AddMeter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [propertyName, setPropertyName] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [currentReading, setCurrentReading] = useState("");

  // Initial / previous EB reading date
  // User must select this manually
  const [readingDate, setReadingDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // OPEN DATE PICKER
  // ==========================================

  const handleDateClick = (e) => {
    try {
      if (typeof e.currentTarget.showPicker === "function") {
        e.currentTarget.showPicker();
      }
    } catch (error) {
      // Browser may already have opened the picker.
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!user?.uid) {
      setError("User not logged in.");
      return;
    }

    if (!propertyName.trim()) {
      setError("Please enter property name.");
      return;
    }

    if (!serviceNumber.trim()) {
      setError("Please enter service number.");
      return;
    }

    if (
      currentReading === "" ||
      !Number.isFinite(Number(currentReading)) ||
      Number(currentReading) < 0
    ) {
      setError("Please enter a valid initial reading.");
      return;
    }

    if (!readingDate) {
      setError("Please select the initial reading date.");
      return;
    }

    // ----------------------------------------
    // SAVE
    // ----------------------------------------

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/meters`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: user.uid,
          propertyName: propertyName.trim(),
          serviceNumber: serviceNumber.trim(),
          meterNumber: meterNumber.trim(),
          currentReading: Number(currentReading),
          readingDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add meter"
        );
      }

      setSuccess("Meter added successfully!");

      // ----------------------------------------
      // CLEAR FORM
      // ----------------------------------------

      setPropertyName("");
      setServiceNumber("");
      setMeterNumber("");
      setCurrentReading("");
      setReadingDate("");

      // ----------------------------------------
      // GO TO DASHBOARD
      // ----------------------------------------

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Add meter error:", error);

      setError(
        error.message || "Failed to add meter."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="add-meter-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="add-meter-header">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="add-meter-brand">

          <div className="add-meter-logo">
            <Zap
              size={20}
              fill="currentColor"
            />
          </div>

          <div>
            <strong>EBuddy</strong>

            <span>
              Smart EB Manager
            </span>
          </div>

        </div>

      </header>

      {/* =====================================
          CONTENT
      ===================================== */}

      <main className="add-meter-content">

        <div className="add-meter-title">

          <span>
            METER MANAGEMENT
          </span>

          <h1>
            Add New Meter
          </h1>

          <p>
            Add your EB connection and enter
            your previous reading to start
            tracking electricity usage.
          </p>

        </div>

        {/* ===================================
            FORM
        =================================== */}

        <form
          className="add-meter-card"
          onSubmit={handleSubmit}
        >

          {/* PROPERTY NAME */}

          <div className="form-group">

            <label>
              Property Name
            </label>

            <div className="input-wrapper">

              <Home size={17} />

              <input
                type="text"
                placeholder="Example: My Home"
                value={propertyName}
                onChange={(e) =>
                  setPropertyName(e.target.value)
                }
              />

            </div>

          </div>

          {/* SERVICE NUMBER */}

          <div className="form-group">

            <label>
              EB Service Number
            </label>

            <div className="input-wrapper">

              <Zap size={17} />

              <input
                type="text"
                placeholder="Example: 01-234-567"
                value={serviceNumber}
                onChange={(e) =>
                  setServiceNumber(e.target.value)
                }
              />

            </div>

          </div>

          {/* METER NUMBER */}

          <div className="form-group">

            <label>
              Meter Number
              <span className="optional">
                Optional
              </span>
            </label>

            <div className="input-wrapper">

              <Gauge size={17} />

              <input
                type="text"
                placeholder="Enter meter number"
                value={meterNumber}
                onChange={(e) =>
                  setMeterNumber(e.target.value)
                }
              />

            </div>

          </div>

          {/* =================================
              INITIAL READING
          ================================= */}

          <div className="form-group">

            <label>
              Initial Meter Reading
            </label>

            <div className="input-wrapper">

              <Gauge size={17} />

              <input
                type="number"
                min="0"
                step="1"
                placeholder="Example: 18002"
                value={currentReading}
                onChange={(e) =>
                  setCurrentReading(e.target.value)
                }
              />

              <span>
                Units
              </span>

            </div>

          </div>

          {/* =================================
              INITIAL READING DATE
          ================================= */}

          <div className="form-group">

            <label>
              Initial Reading Date
            </label>

            <div
              className="input-wrapper date-input-wrapper"
            >

              <CalendarDays size={17} />

              <input
                type="date"
                value={readingDate}
                onChange={(e) =>
                  setReadingDate(e.target.value)
                }
                onClick={handleDateClick}
                aria-label="Initial reading date"
              />

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="add-meter-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="add-meter-success">
              {success}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="save-meter-button"
            disabled={saving}
          >

            <Save size={17} />

            {saving
              ? "Adding Meter..."
              : "Add Meter"}

          </button>

        </form>

      </main>

    </div>
  );
};

export default AddMeter;