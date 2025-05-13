import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Star } from "lucide-react";

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function SubmitFeedbackPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const appointmentId = params.get("appointmentId");
  const vetId = params.get("vetId");
  const userId = params.get("userId");

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/auth/create-review",
        { appointmentId, vetId, userId, rating, review },
        { withCredentials: true }
      );
      navigate("/thank-you");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        How was your consultation?
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 space-y-6">
        <div>
          <label className="block font-semibold text-lg mb-2">Your Rating</label>
          <div className="flex items-center gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-transform ${
                  rating >= star ? "text-yellow-500" : "text-gray-300"
                } hover:scale-110`}
              >
                <Star size={32} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm mt-2 text-gray-600 italic">
              {ratingLabels[rating]}
            </p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-lg mb-2" htmlFor="review">
            Your Review
          </label>
          <textarea
            id="review"
            rows={5}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Tell us what went well (or what could be improved)…"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          {submitting ? "Submitting…" : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
