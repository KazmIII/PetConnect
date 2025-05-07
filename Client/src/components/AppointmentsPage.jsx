// // src/pages/AppointmentsPage.jsx
// import { useEffect, useState } from "react";

// export default function AppointmentsPage() {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch("http://localhost:5000/auth/appointments", {
//       credentials: "include",      // send cookies
//       headers: { "Content-Type": "application/json" }
//     })
//     .then(async res => {
//       if (!res.ok) throw new Error((await res.json()).message || "Fetch failed");
//       return res.json();
//     })
//     .then(data => {
//       setAppointments(data);
//     })
//     .catch(err => {
//       console.error("Failed to load appointments:", err);
//       setError(err.message);
//     })
//     .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <p>Loading your appointments…</p>;
//   if (error) return <p className="text-red-600">Error: {error}</p>;
//   if (!appointments.length) return <p>You have no booked appointments.</p>;

//   return (
//     <div className="max-w-3xl mx-auto py-8">
//       <h1 className="text-2xl font-semibold mb-6">My Appointments</h1>
//       <ul className="space-y-4">
//         {appointments.map(appt => (
//           <li key={appt._id} className="p-4 border rounded-lg shadow-sm">
//             <div className="flex justify-between">
//               <span>
//                 <strong>Dr. {appt.vetId.name}</strong><br/>
//                 {new Date(appt.date).toLocaleDateString()} at {appt.slot.startTime}–{appt.slot.endTime}
//               </span>
//               <span className="text-right">
//                 <div>Fee: PKR {appt.fee}</div>
//                 <div className="mt-1">
//                   <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm">
//                     {appt.paymentStatus.toUpperCase()}
//                   </span>
//                   <span className="px-2 py-0.5 ml-2 bg-blue-100 text-blue-800 rounded-full text-sm">
//                     {appt.status.toUpperCase()}
//                   </span>
//                 </div>
//               </span>
//             </div>
//             {appt.consultationType && (
//               <div className="mt-2 text-sm text-gray-600">
//                 Type: {appt.consultationType}
//               </div>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


// // src/pages/AppointmentsPage.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";  // ← import
// import Spinner from "../components/Spinner";     // if you have one

// export default function AppointmentsPage() {
//   const [appointments, setAppointments] = useState([]);
//   const [loading,      setLoading]      = useState(true);
//   const [error,        setError]        = useState(null);
//   const navigate = useNavigate();                  // ← hook

//   // 1) Define your join‐handler once
//   const handleJoinConsultation = (roomID) => {
//     navigate(`/video?roomID=${roomID}&mode=join`);
//   };

//   // 2) Load appointments
//   useEffect(() => {
//     fetch("http://localhost:5000/auth/appointments", {
//       credentials: "include",
//       headers:    { "Content-Type": "application/json" }
//     })
//     .then(async res => {
//       if (!res.ok) throw new Error((await res.json()).message || "Fetch failed");
//       return res.json();
//     })
//     .then(data => setAppointments(data))
//     .catch(err => {
//       console.error("Failed to load appointments:", err);
//       setError(err.message);
//     })
//     .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <Spinner className="w-8 h-8 mx-auto my-8" />;
//   if (error)   return <p className="text-red-600 text-center my-8">Error: {error}</p>;
//   if (!appointments.length) return <p className="text-center my-8">You have no appointments.</p>;

//   return (
//     <div className="max-w-3xl mx-auto py-8">
//       <h1 className="text-2xl font-semibold mb-6">My Appointments</h1>
//       <ul className="space-y-4">
//         {appointments.map(appt => (
//           <li key={appt._id} className="p-4 border rounded-lg shadow-sm">
//             <div className="flex justify-between items-start">
//               <div>
//                 <p><strong>Dr. {appt.vetId.name}</strong></p>
//                 <p>
//                   {new Date(appt.date).toLocaleDateString()} @ {appt.slot.startTime}–{appt.slot.endTime}
//                 </p>
//                 <p>Type: {appt.consultationType}</p>
//               </div>
//               <div className="text-right">
//                 <p>Fee: PKR {appt.fee}</p>
//                 <div className="mt-1 space-x-2">
//                   <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm">
//                     {appt.paymentStatus.toUpperCase()}
//                   </span>
//                   <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-sm">
//                     {appt.status.toUpperCase()}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* 3) Show join button only for video & in‑progress appointments */}
//             {appt.consultationType === "video" && appt.roomID && appt.status === "in-progress" && (
//               <div className="mt-4 text-center">
//                 <button
//                   onClick={() => handleJoinConsultation(appt.roomID)}
//                   className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                 >
//                   Join Consultation
//                 </button>
//               </div>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
// src/pages/AppointmentsPage.jsx




// // src/pages/AppointmentsPage.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// // ── helper ──────────────────────────────────────────────────────────────
// const getDateTime = (dateString, timeString) => {
//   const [time, mer] = timeString.split(" ");
//   let [h, m] = time.split(":").map(Number);
//   if (mer === "PM" && h !== 12) h += 12;
//   if (mer === "AM" && h === 12) h = 0;
//   const dt = new Date(dateString);
//   dt.setHours(h, m, 0, 0);
//   return dt;
// };

// export default function AppointmentsPage() {
//   const [appointments, setAppointments] = useState([]);
//   const [loading,      setLoading]      = useState(true);
//   const [error,        setError]        = useState(null);
//   const [now, setNow] = useState(new Date());
//   const navigate = useNavigate();

//   // fetch on mount
//   useEffect(() => {
//     fetch("http://localhost:5000/auth/appointments", {
//       credentials: "include",
//       headers:    { "Content-Type": "application/json" }
//     })
//       .then(async res => {
//         if (!res.ok) throw new Error((await res.json()).message || "Fetch failed");
//         return res.json();
//       })
//       .then(data => setAppointments(data))
//       .catch(err => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   // ticking clock
//   useEffect(() => {
//     const id = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(id);
//   }, []);

//   // join handler now takes both roomID and endDT
//   const handleJoinConsultation = (roomID, endDT) => {

//     navigate(
//          `/video?roomID=${encodeURIComponent(roomID)}` +
//          `&mode=join` +
//          `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
//          `&role=client`
//       );
//   };

//   if (loading) return <p>Loading your appointments…</p>;
//   if (error)   return <p className="text-red-600">Error: {error}</p>;
//   if (!appointments.length) return <p>You have no booked appointments.</p>;

//   return (
//     <div className="max-w-3xl mx-auto py-8">
//       <h1 className="text-2xl font-semibold mb-6">My Appointments</h1>
//       <ul className="space-y-4">
//         {appointments.map(appt => {
//           const startDT = getDateTime(appt.date, appt.slot.startTime);
//           const endDT   = getDateTime(appt.date, appt.slot.endTime);
//           const isVideo = appt.consultationType === "video";
//           const canJoin = isVideo
//                        && appt.roomID
//                        && appt.status === "in-progress"
//                        && now >= startDT
//                        && now < endDT;

//           return (
//             <li key={appt._id} className="p-4 border rounded-lg shadow-sm">
//               <div className="flex justify-between">
//                 <span>
//                 <strong>Dr. {appt.vetId?.name || "Unknown Vet"}</strong><br/>
//                   {startDT.toLocaleDateString()} @ {appt.slot.startTime}–{appt.slot.endTime}
//                 </span>
//                 <span className="text-right">
//                   <div>Fee: PKR {appt.fee}</div>
//                   <div className="mt-1 space-x-2">
//                     <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm">
//                       {appt.paymentStatus.toUpperCase()}
//                     </span>
//                     <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-sm">
//                       {appt.status.toUpperCase()}
//                     </span>
//                   </div>
//                 </span>
//               </div>

//               {isVideo && (
//                 <>
//                   {canJoin && (
//                     <button
//                       onClick={() => handleJoinConsultation(appt.roomID, endDT)}
//                       className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                     >
//                       Join Consultation
//                     </button>
//                   )}
//                   {now >= endDT && (
//                     <p className="mt-4 text-gray-500">Meeting ended</p>
//                   )}
//                 </>
//               )}
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// }


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
                  <span className="text-gray-900">Dr.</span> {appt.vetId?.name || "Unknown Vet"}
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
