import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import "./AddReading.css";


const AddReading = () => {

  const { user } = useAuth();
  const navigate = useNavigate();


  const [meters, setMeters] = useState([]);

  const [meterId, setMeterId] = useState("");

  const [readingDate, setReadingDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [reading, setReading] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ========================================
  // FETCH METERS
  // ========================================

  useEffect(() => {

    const fetchMeters = async () => {

      if (!user?.uid) return;

      try {

        const response =
          await fetch(
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

        if (data.length > 0) {

          setMeterId(
            data[0]._id
          );

        }

      } catch (error) {

        console.error(error);

        setError(
          "Failed to load meters."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchMeters();

  }, [user]);


  // ========================================
  // SELECTED METER
  // ========================================

  const selectedMeter =
    meters.find(
      (meter) =>
        meter._id === meterId
    );


  // ========================================
  // PREVIOUS READING
  // ========================================

  const previousReading =
    selectedMeter
      ? Number(
          selectedMeter.currentReading || 0
        )
      : 0;


  // ========================================
  // CURRENT USAGE
  // ========================================

  const currentReading =
    Number(reading || 0);


  const unitsUsed =
    currentReading >= previousReading
      ? currentReading -
        previousReading
      : 0;


  // ========================================
  // SAVE READING
  // ========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (!meterId) {

      setError(
        "Please select a meter."
      );

      return;

    }


    if (!readingDate) {

      setError(
        "Please select reading date."
      );

      return;

    }


    if (
      reading === "" ||
      !Number.isFinite(currentReading)
    ) {

      setError(
        "Please enter a valid reading."
      );

      return;

    }


    if (
      currentReading <
      previousReading
    ) {

      setError(
        `Reading cannot be lower than previous reading (${previousReading}).`
      );

      return;

    }


    try {

      setSaving(true);


      const response =
        await fetch(
          `${API_URL}/api/readings`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              userId:
                user.uid,

              meterId,

              readingDate,

              reading:
                currentReading,

            }),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to save reading"
        );

      }


      setSuccess(
        "Reading saved successfully!"
      );


      setReading("");


      setTimeout(() => {

        navigate("/dashboard");

      }, 1000);


    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Failed to save reading."
      );

    } finally {

      setSaving(false);

    }

  };


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (

      <div className="reading-loading">

        <div className="reading-loader"></div>

        <p>
          Loading meters...
        </p>

      </div>

    );

  }


  // ========================================
  // NO METERS
  // ========================================

  if (meters.length === 0) {

    return (

      <div className="reading-page">

        <div className="reading-empty">

          <div className="reading-empty-icon">

            <Home size={28} />

          </div>

          <h2>
            No meters found
          </h2>

          <p>
            Please add a meter before
            entering a reading.
          </p>

          <button
            onClick={() =>
              navigate("/add-meter")
            }
          >
            Add Meter
          </button>

        </div>

      </div>

    );

  }


  return (

    <div className="reading-page">


      {/* HEADER */}

      <header className="reading-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <ArrowLeft size={18} />

          Dashboard

        </button>


        <div className="reading-brand">

          <div className="reading-logo">

            <Zap
              size={20}
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


      {/* CONTENT */}

      <main className="reading-content">


        <div className="reading-title">

          <span>
            METER MANAGEMENT
          </span>

          <h1>
            Add Meter Reading
          </h1>

          <p>
            Update your electricity meter
            reading to track your usage.
          </p>

        </div>


        <form
          className="reading-card"
          onSubmit={handleSubmit}
        >


          {/* METER */}

          <div className="form-group">

            <label>
              Select Meter
            </label>

            <div className="select-wrapper">

              <Home size={17} />

              <select
                value={meterId}
                onChange={(e) =>
                  setMeterId(
                    e.target.value
                  )
                }
              >

                {meters.map(
                  (meter) => (

                    <option
                      key={
                        meter._id
                      }
                      value={
                        meter._id
                      }
                    >

                      {
                        meter.propertyName
                      }

                      {" — "}

                      {
                        meter.serviceNumber
                      }

                    </option>

                  )
                )}

              </select>

            </div>

          </div>


          {/* PREVIOUS READING */}

          <div className="previous-reading">

            <div>

              <span>
                Previous Reading
              </span>

              <strong>

                {previousReading.toLocaleString(
                  "en-IN"
                )}

                <small>
                  Units
                </small>

              </strong>

            </div>


            <Gauge size={24} />

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
                value={
                  readingDate
                }
                onChange={(e) =>
                  setReadingDate(
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
                min={
                  previousReading
                }
                step="1"
                placeholder="Enter current reading"
                value={
                  reading
                }
                onChange={(e) =>
                  setReading(
                    e.target.value
                  )
                }
              />

              <span>
                Units
              </span>

            </div>

          </div>


          {/* USAGE PREVIEW */}

          <div className="usage-preview">

            <div>

              <span>
                Previous
              </span>

              <strong>
                {previousReading}
              </strong>

            </div>


            <div className="usage-arrow">
              →
            </div>


            <div>

              <span>
                Current
              </span>

              <strong>
                {currentReading || 0}
              </strong>

            </div>


            <div className="usage-result">

              <span>
                Usage
              </span>

              <strong>
                {unitsUsed}
                {" "}Units
              </strong>

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="reading-error">

              {error}

            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div className="reading-success">

              {success}

            </div>

          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="save-reading-button"
            disabled={saving}
          >

            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save Reading"}

          </button>


        </form>

      </main>

    </div>

  );

};


export default AddReading;