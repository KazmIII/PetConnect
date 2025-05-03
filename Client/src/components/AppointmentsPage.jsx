// src/pages/AppointmentsPage.jsx
import { useEffect, useState } from "react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/auth/appointments", {
      credentials: "include",      // send cookies
      headers: { "Content-Type": "application/json" }
    })
    .then(async res => {
      if (!res.ok) throw new Error((await res.json()).message || "Fetch failed");
      return res.json();
    })
    .then(data => {
      setAppointments(data);
    })
    .catch(err => {
      console.error("Failed to load appointments:", err);
      setError(err.message);
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your appointments…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!appointments.length) return <p>You have no booked appointments.</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">My Appointments</h1>
      <ul className="space-y-4">
        {appointments.map(appt => (
          <li key={appt._id} className="p-4 border rounded-lg shadow-sm">
            <div className="flex justify-between">
              <span>
                <strong>Dr. {appt.vetId.name}</strong><br/>
                {new Date(appt.date).toLocaleDateString()} at {appt.slot.startTime}–{appt.slot.endTime}
              </span>
              <span className="text-right">
                <div>Fee: PKR {appt.fee}</div>
                <div className="mt-1">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm">
                    {appt.paymentStatus.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 ml-2 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {appt.status.toUpperCase()}
                  </span>
                </div>
              </span>
            </div>
            {appt.consultationType && (
              <div className="mt-2 text-sm text-gray-600">
                Type: {appt.consultationType}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
