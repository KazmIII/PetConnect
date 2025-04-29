// pages/Appointments.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const dummyAppointments = [
  {
    id: 1,
    vetName: "Dr. John Doe",
    roomID: "ROOM123",
    scheduledTime: new Date(new Date().getTime() + 60000), // 1 min from now
  },
  {
    id: 2,
    vetName: "Dr. Sarah Smith",
    roomID: "ROOM456",
    scheduledTime: new Date(new Date().getTime() + 300000), // 5 mins from now
  },
];

export default function Appointments() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (roomID) => {
    navigate(`/video?roomID=${roomID}&mode=join`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Scheduled Appointments</h1>
      <div className="space-y-6">
        {dummyAppointments.map((appt) => (
          <div key={appt.id} className="p-4 border rounded shadow-md flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{appt.vetName}</h2>
              <p className="text-gray-600">
                Scheduled at: {appt.scheduledTime.toLocaleTimeString()}
              </p>
            </div>

            {currentTime >= appt.scheduledTime ? (
              <button
                onClick={() => handleJoin(appt.roomID)}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Join Consultation
              </button>
            ) : (
              <span className="text-gray-500">Waiting for appointment time...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
