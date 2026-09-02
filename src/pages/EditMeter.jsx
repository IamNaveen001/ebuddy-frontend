import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Gauge,
  Home,
  Save,
  Zap,
} from "lucide-react";

import API_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

import "./EditMeter.css";

const EditMeter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { meterId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [propertyName, setPropertyName] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [readingDate, setReadingDate] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD METER
  // ==========================================

  useEffect(() => {
    const fetchMeter = async () => {
      if (!user?.uid || !meterId) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/meters/${user.uid}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch meters"
          );
        }

        const meter = data.find(
          (item) => item._id === meterId
        );

        if (!meter) {
          throw new Error("Meter not found.");
        }

        setPropertyName(
          meter.propertyName || ""
        );

        setServiceNumber(
          meter.serviceNumber || ""
        );

        setMeterNumber(
          meter.meterNumber || ""
        );

        setCurrentReading(
          meter.currentReading ?? ""
        );

        setReadingDate(
          meter.readingDate
            ? new Date(meter.readingDate)
                .toISOString()
                .split("T")[0]
            : ""
        );
      } catch (error) {
        console.error(
          "Fetch meter error:",
          error
        );

        setError(
          error.message ||
            "Failed to load meter."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMeter();
  }, [user, meterId]);

  // ==========================================
  // UPDATE METER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!propertyName.trim()) {
      setError("Please enter property name.");
      return;
    }

    if (!serviceNumber.trim()) {
      setError(
        "Please enter service number."
      );
      return;
    }

    if (
      currentReading === "" ||
      !Number.isFinite(
        Number(currentReading)
      ) ||
      Number(currentReading) < 0
    ) {
      setError(
        "Please enter a valid meter reading."
      );
      return;
    }

    if (!readingDate) {
      setError(
        "Please select reading date."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/meters/${user.uid}/${meterId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            propertyName:
              propertyName.trim(),

            serviceNumber:
              serviceNumber.trim(),

            meterNumber:
              meterNumber.trim(),

            currentReading:
              Number(currentReading),

            readingDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update meter"
        );
      }

      setSuccess(
        "Meter updated successfully!"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error(
        "Update meter error:",
        error
      );

      setError(
        error.message ||
          "Failed to update meter."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="edit-meter-loading">
        <div className="edit-meter-loader"></div>

        <p>
          Loading meter...
        </p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="edit-meter-page">

      {/* HEADER */}

      <header className="edit-meter-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="edit-meter-brand">

          <div className="edit-meter-logo">
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

      {/* CONTENT */}

      <main className="edit-meter-content">

        <div className="edit-meter-title">

          <span>
            METER MANAGEMENT
          </span>

          <h1>
            Edit Meter
          </h1>

          <p>
            Update your EB connection
            details and current reading.
          </p>

        </div>

        <form
          className="edit-meter-card"
          onSubmit={handleSubmit}
        >

          {/* PROPERTY */}

          <div className="form-group">

            <label>
              Property Name
            </label>

            <div className="input-wrapper">

              <Home size={17} />

              <input
                type="text"
                value={propertyName}
                onChange={(e) =>
                  setPropertyName(
                    e.target.value
                  )
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
                value={serviceNumber}
                onChange={(e) =>
                  setServiceNumber(
                    e.target.value
                  )
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
                value={meterNumber}
                onChange={(e) =>
                  setMeterNumber(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* CURRENT READING */}

          <div className="form-group">

            <label>
              Current Meter Reading
            </label>

            <div className="input-wrapper">

              <Gauge size={17} />

              <input
                type="number"
                min="0"
                step="1"
                value={currentReading}
                onChange={(e) =>
                  setCurrentReading(
                    e.target.value
                  )
                }
              />

              <span>
                Units
              </span>

            </div>

          </div>

          {/* DATE */}

          <div className="form-group">

            <label>
              Reading Date
            </label>

            <div className="input-wrapper">

              <CalendarDays size={17} />

              <input
                type="date"
                value={readingDate}
                onChange={(e) =>
                  setReadingDate(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="edit-meter-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="edit-meter-success">
              {success}
            </div>
          )}

          {/* SAVE */}

          <button
            type="submit"
            className="save-meter-button"
            disabled={saving}
          >
            <Save size={17} />

            {saving
              ? "Updating..."
              : "Update Meter"}
          </button>

        </form>

      </main>
    </div>
  );
};

export default EditMeter;