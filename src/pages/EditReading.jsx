import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";
import "./EditReading.css";

const EditReading = () => {
  const { user } = useAuth();
  const { readingId } = useParams();
  const navigate = useNavigate();

  const [reading, setReading] = useState(null);

  const [readingDate, setReadingDate] =
    useState("");

  const [currentReading, setCurrentReading] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !readingId) return;

    const fetchReading = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/readings/${user.uid}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch readings"
          );
        }

        const data = await response.json();

        const selectedReading = data.find(
          (item) =>
            item._id === readingId
        );

        if (!selectedReading) {
          setError("Reading not found.");
          return;
        }

        setReading(selectedReading);

        const date = new Date(
          selectedReading.readingDate
        );

        const formattedDate =
          date.toISOString().split("T")[0];

        setReadingDate(formattedDate);

        setCurrentReading(
          selectedReading.reading
        );
      } catch (error) {
        console.error(
          "Fetch reading error:",
          error
        );

        setError(
          "Failed to load reading."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReading();
  }, [user, readingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!readingDate || currentReading === "") {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    const readingValue =
      Number(currentReading);

    if (
      !Number.isFinite(readingValue) ||
      readingValue < 0
    ) {
      setError(
        "Please enter a valid meter reading."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/readings/${user.uid}/edit/${readingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            readingDate,
            reading: readingValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update reading."
        );
      }

      alert(
        "Reading updated successfully!"
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Update reading error:",
        error
      );

      setError(
        error.message ||
          "Failed to update reading."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-reading-page">
        <div className="edit-reading-card">
          <p>Loading reading...</p>
        </div>
      </div>
    );
  }

  if (error && !reading) {
    return (
      <div className="edit-reading-page">
        <div className="edit-reading-card">
          <h2>Unable to load reading</h2>

          <p className="error-message">
            {error}
          </p>

          <button
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-reading-page">
      <div className="edit-reading-card">

        <div className="edit-reading-header">
          <h1>Edit Reading</h1>

          <p>
            Update your meter reading details
          </p>
        </div>

        {reading && (
          <div className="reading-info">
            <div>
              <span>Previous Reading</span>
              <strong>
                {reading.previousReading}
              </strong>
            </div>

            <div>
              <span>Current Usage</span>
              <strong>
                {reading.unitsUsed} Units
              </strong>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>
              Reading Date
            </label>

            <input
              type="date"
              value={readingDate}
              onChange={(e) =>
                setReadingDate(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              Current Meter Reading
            </label>

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
              placeholder="Enter meter reading"
              required
            />
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate("/dashboard")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Update Reading"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default EditReading;