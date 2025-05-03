import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "./Spinner"; // or your spinner component
import { CalendarCheck } from "lucide-react";

export default function VetAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/auth/appointments/vet",
          { withCredentials: true }
        );
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching vet appointments:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <Spinner className="w-8 h-8 mx-auto my-8" />;
  if (error)   return <p className="text-center text-red-600 my-8">Error: {error}</p>;
  if (!appointments.length) {
    return <p className="text-center my-8">No appointments booked yet.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CalendarCheck size={24} /> My Appointments
      </h1>

      <ul className="space-y-4">
        {appointments.map(appt => (
          <li key={appt._id} className="p-4 border rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p>
                  <strong>User:</strong> {appt.userId.name} &lt;{appt.userId.email}&gt;
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appt.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {appt.slot.startTime} – {appt.slot.endTime}
                </p>
                {appt.consultationType && (
                  <p>
                    <strong>Type:</strong> {appt.consultationType}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p>
                  <strong>Fee:</strong> Rs. {appt.fee}
                </p>
                <div className="mt-2 flex flex-col items-end gap-1">
                  <span className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded">
                    {appt.paymentStatus.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                    {appt.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
