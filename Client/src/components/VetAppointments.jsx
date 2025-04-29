// pages/VetAppointments.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const dummyVetAppointments = [
  {
    id: 1,
    userName: "Client: Alex Johnson",
    roomID: "ROOM123",
    scheduledTime: new Date(new Date().getTime() + 60000), // 1 min from now
  },
  {
    id: 2,
    userName: "Client: Emily Brown",
    roomID: "ROOM456",
    scheduledTime: new Date(new Date().getTime() + 300000), // 5 mins from now
  },
];

export default function VetAppointments() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = (roomID) => {
    navigate(`/video?roomID=${roomID}&mode=start`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Upcoming Consultations</h1>
      <div className="space-y-6">
        {dummyVetAppointments.map((appt) => (
          <div key={appt.id} className="p-4 border rounded shadow-md flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{appt.userName}</h2>
              <p className="text-gray-600">
                Scheduled at: {appt.scheduledTime.toLocaleTimeString()}
              </p>
            </div>

            {currentTime >= appt.scheduledTime ? (
              <button
                onClick={() => handleStart(appt.roomID)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Start Consultation
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
