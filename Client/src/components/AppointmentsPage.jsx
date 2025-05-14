import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock } from "lucide-react";

// ── helper to combine date + time into a Date object ────────────────────
const getDateTime = (dateString, timeString) => {
  const [time, mer] = timeString.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  const dt = new Date(dateString);
  dt.setHours(h, m, 0, 0);
  return dt;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  // fetch appointments on mount
  useEffect(() => {
    fetch("http://localhost:5000/auth/appointments", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).message || "Fetch failed");
        return res.json();
      })
      .then((data) => setAppointments(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ticking clock to re-render for time-based UI
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // navigate to video room
  const handleJoinConsultation = (roomID, endDT) => {
    navigate(
      `/video?roomID=${encodeURIComponent(roomID)}` +
      `&mode=join` +
      `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
      `&role=client`
    );
  };

  if (loading)
    return <p className="text-center py-8">Loading your appointments…</p>;
  if (error)
    return <p className="text-center py-8 text-red-600">Error: {error}</p>;
  if (!appointments.length)
    return <p className="text-center py-8">You have no booked appointments.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex text-orange-600 items-center gap-2">
        <CalendarClock size={24} /> My Appointments
      </h1>

      <div className="space-y-6">
        {appointments.map((appt) => {
          const startDT = getDateTime(appt.date, appt.slot.startTime);
          const endDT = getDateTime(appt.date, appt.slot.endTime);
          const isVideo = appt.consultationType === "video";
          const canJoin = isVideo && appt.roomID && now < endDT && appt.status === "in-progress";

          return (
            <div
              key={appt._id}
              className="p-5 rounded-xl shadow-lg flex flex-col sm:flex-row sm:justify-between sm:items-center bg-orange-200"
            >
              <div className="space-y-1">
                <p className="text-gray-900 mb-2 text-2xl font-semibold">
                  <span className="text-gray-900">
                    {appt.providerType === "vet" ? "Dr." : appt.providerType === "groomer" ? "Stylist" : "Sitter"}
                  </span>{" "}
                  {appt.providerName}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Date & Time:</span> {startDT.toLocaleDateString()} at {appt.slot.startTime}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Type:</span>{' '}
                  <span className="inline-block px-2 py-0.5 text-sm rounded-full bg-white text-black capitalize">
                    {appt.consultationType}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Status:</span>{' '}
                  <span className={`inline-block px-2 py-0.5 text-sm rounded-full ${appt.status === "booked" ? "bg-yellow-100 text-yellow-800" :
                      appt.status === "in-progress" ? "bg-green-100 text-green-800" :
                        "bg-teal-100 text-teal-800"
                    }`}>
                    {appt.status}
                  </span>
                </p>
              </div>
              {/* ── NEW: after status, show button if completed & not reviewed ── */}
              {appt.status === "completed" && !appt.hasReview && (
                <button
                  onClick={() =>
                    navigate(
                      `/submit-feedback?appointmentId=${appt._id}&vetId=${appt.providerType === "vet" ? appt.providerId : ""}`
                    )
                  }
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-teal-400 to-teal-700 text-white rounded hover:opacity-75"
                >
                  Leave a Review
                </button>
              )}
              {/* If they already reviewed… */}
              {appt.status === "completed" && appt.hasReview && (
                <span className="mt-2 inline-block text-green-600">Thank you for your feedback!</span>
              )}
              {/* ──────────────────────────────────────────────────────────────── */}

              {isVideo && (
                <div className="mt-4 sm:mt-0 sm:text-right">
                  {canJoin && (
                    <button
                      onClick={() => handleJoinConsultation(appt.roomID, endDT)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Join Consultation
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
