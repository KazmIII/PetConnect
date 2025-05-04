// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import Spinner from "./Spinner"; // or your spinner component
// // import { CalendarCheck } from "lucide-react";

// // export default function VetAppointmentsPage() {
// //   const [appointments, setAppointments] = useState([]);
// //   const [loading,      setLoading]      = useState(true);
// //   const [error,        setError]        = useState(null);

// //   useEffect(() => {
// //     const fetchAppointments = async () => {
// //       try {
// //         const { data } = await axios.get(
// //           "http://localhost:5000/auth/appointments/vet",
// //           { withCredentials: true }
// //         );
// //         setAppointments(data);
// //       } catch (err) {
// //         console.error("Error fetching vet appointments:", err);
// //         setError(err.response?.data?.message || err.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchAppointments();
// //   }, []);

// //   if (loading) return <Spinner className="w-8 h-8 mx-auto my-8" />;
// //   if (error)   return <p className="text-center text-red-600 my-8">Error: {error}</p>;
// //   if (!appointments.length) {
// //     return <p className="text-center my-8">No appointments booked yet.</p>;
// //   }

// //   return (
// //     <div className="max-w-4xl mx-auto p-6">
// //       <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
// //         <CalendarCheck size={24} /> My Appointments
// //       </h1>

// //       <ul className="space-y-4">
// //         {appointments.map(appt => (
// //           <li key={appt._id} className="p-4 border rounded-lg shadow-sm">
// //             <div className="flex justify-between items-start">
// //               <div>
// //                 <p>
// //                   <strong>User:</strong> {appt.userId.name} &lt;{appt.userId.email}&gt;
// //                 </p>
// //                 <p>
// //                   <strong>Date:</strong>{" "}
// //                   {new Date(appt.date).toLocaleDateString()}
// //                 </p>
// //                 <p>
// //                   <strong>Time:</strong>{" "}
// //                   {appt.slot.startTime} – {appt.slot.endTime}
// //                 </p>
// //                 {appt.consultationType && (
// //                   <p>
// //                     <strong>Type:</strong> {appt.consultationType}
// //                   </p>
// //                 )}
// //               </div>
// //               <div className="text-right">
// //                 <p>
// //                   <strong>Fee:</strong> Rs. {appt.fee}
// //                 </p>
// //                 <div className="mt-2 flex flex-col items-end gap-1">
// //                   <span className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded">
// //                     {appt.paymentStatus.toUpperCase()}
// //                   </span>
// //                   <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
// //                     {appt.status.toUpperCase()}
// //                   </span>
// //                 </div>
// //               </div>
// //             </div>
// //           </li>
// //         ))}
// //       </ul>
// //     </div>
// //   );
// // }

// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import { useNavigate } from "react-router-dom";
// // import Spinner from "./Spinner";
// // import { CalendarCheck } from "lucide-react";

// // export default function VetAppointmentsPage() {
// //   const [appointments, setAppointments] = useState([]);
// //   const [loading,      setLoading]      = useState(true);
// //   const [error,        setError]        = useState(null);
// //   const [now, setNow] = useState(new Date());
// //   const navigate = useNavigate();

// //   // fetch on mount
// //   useEffect(() => {
// //     axios.get("http://localhost:5000/auth/appointments/vet", { withCredentials: true })
// //       .then(({ data }) => setAppointments(data))
// //       .catch(err => setError(err.response?.data?.message || err.message))
// //       .finally(() => setLoading(false));
// //   }, []);

// //   // tick clock every second
// //   useEffect(() => {
// //     const id = setInterval(() => setNow(new Date()), 1000);
// //     return () => clearInterval(id);
// //   }, []);

// //   // build JS Date from appt.date + slot.startTime
// //   const getScheduled = (appt) => {
// //     const [time, mer] = appt.slot.startTime.split(" ");
// //     let [h, m] = time.split(":").map(Number);
// //     if (mer === "PM" && h !== 12) h += 12;
// //     if (mer === "AM" && h === 12) h = 0;
// //     const dt = new Date(appt.date);
// //     dt.setHours(h, m, 0, 0);
// //     return dt;
// //   };

// //   // navigate into your video page
// //   const handleStart = async (appt) => {
// //     try {
// //       await axios.post(
// //         `http://localhost:5000/auth/appointments/${appt._id}/start`,
// //         {},
// //         { withCredentials: true }
// //       );
// //       // then navigate into your video room
// //       navigate(`/video?roomID=${appt.roomID}&mode=start`);
// //     } catch (err) {
// //       console.error("Could not start:", err);
// //       alert("Failed to start consultation");
// //     }
// //   };

// //   if (loading) return <Spinner className="w-8 h-8 mx-auto my-8" />;
// //   if (error)   return <p className="text-center text-red-600 my-8">Error: {error}</p>;
// //   if (!appointments.length) {
// //     return <p className="text-center my-8">No appointments booked yet.</p>;
// //   }

// //   return (
// //     <div className="max-w-4xl mx-auto p-6">
// //       <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
// //         <CalendarCheck size={24} /> My Appointments
// //       </h1>

// //       <div className="space-y-4">
// //         {appointments.map(appt => {
// //           const scheduled = getScheduled(appt);
// //           const isVideo   = appt.consultationType === "video";
// //           const canStart  = isVideo && appt.roomID && now >= scheduled;

// //           return (
// //             <div
// //               key={appt._id}
// //               className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
// //             >
// //               <div>
// //                 <p><strong>Client:</strong> {appt.userId.name}</p>
// //                 <p>
// //                   <strong>When:</strong>{" "}
// //                   {scheduled.toLocaleDateString()} @ {appt.slot.startTime}
// //                 </p>
// //                 <p><strong>Type:</strong> {appt.consultationType}</p>
// //               </div>

// //               {isVideo ? (
// //                 canStart ? (
// //                   <button
// //                     onClick={() => handleStart(appt.roomID)}
// //                     className="px-4 py-2 bg-blue-600 text-white rounded"
// //                   >
// //                     Start Consultation
// //                   </button>
// //                 ) : (
// //                   <span className="text-gray-500">
// //                     {now < scheduled
// //                       ? "Waiting for appointment time…"
// //                       : "Room not available"}
// //                   </span>
// //                 )
// //               ) : null}
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }

// // src/components/VetAppointmentsPage.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Spinner from "./Spinner";
// import { CalendarCheck } from "lucide-react";

// export default function VetAppointmentsPage() {
//   const [appointments, setAppointments] = useState([]);
//   const [loading,      setLoading]      = useState(true);
//   const [error,        setError]        = useState(null);
//   const [now, setNow] = useState(new Date());
//   const navigate = useNavigate();

//   // 1) Fetch vet appointments on mount
//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/auth/appointments/vet", { withCredentials: true })
//       .then(({ data }) => setAppointments(data))
//       .catch(err => setError(err.response?.data?.message || err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   // 2) Keep a ticking clock
//   useEffect(() => {
//     const id = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(id);
//   }, []);

//   // 3) Helper: build a JS Date from the appointment’s date + slot.startTime
//   const getScheduled = (appt) => {
//     const [time, mer] = appt.slot.startTime.split(" ");
//     let [h, m] = time.split(":").map(Number);
//     if (mer === "PM" && h !== 12) h += 12;
//     if (mer === "AM" && h === 12) h = 0;
//     const dt = new Date(appt.date);
//     dt.setHours(h, m, 0, 0);
//     return dt;
//   };

//   // 4) When vet clicks “Start,” mark in-progress then navigate into video
//   const handleStart = async (appt) => {
//     try {
//       await axios.post(
//         `http://localhost:5000/auth/appointments/${appt._id}/start`,
//         {},
//         { withCredentials: true }
//       );
//       navigate(`/video?roomID=${appt.roomID}&mode=start`);
//     } catch (err) {
//       console.error("Could not start:", err);
//       alert("Failed to start consultation");
//     }
//   };

//   if (loading) return <Spinner className="w-8 h-8 mx-auto my-8" />;
//   if (error)   return <p className="text-center text-red-600 my-8">Error: {error}</p>;
//   if (!appointments.length) {
//     return <p className="text-center my-8">No appointments booked yet.</p>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
//         <CalendarCheck size={24} /> My Appointments
//       </h1>

//       <div className="space-y-4">
//         {appointments.map((appt) => {
//           const scheduled = getScheduled(appt);
//           const isVideo   = appt.consultationType === "video";
//           const canStart  = isVideo && appt.roomID && now >= scheduled;

//           return (
//             <div
//               key={appt._id}
//               className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
//             >
//               <div>
//                 <p><strong>Client:</strong> {appt.userId.name}</p>
//                 <p>
//                   <strong>When:</strong>{" "}
//                   {scheduled.toLocaleDateString()} @ {appt.slot.startTime}
//                 </p>
//                 <p><strong>Type:</strong> {appt.consultationType}</p>
//               </div>

//               {isVideo && (
//                 canStart ? (
//                   <button
//                     onClick={() => handleStart(appt)}
//                     className="px-4 py-2 bg-blue-600 text-white rounded"
//                   >
//                     Start Consultation
//                   </button>
//                 ) : (
//                   <span className="text-gray-500">
//                     {now < scheduled
//                       ? "Waiting for appointment time…"
//                       : "Room not available"}
//                   </span>
//                 )
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// src/components/VetAppointmentsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import { CalendarCheck } from "lucide-react";

// ── Helper to combine date + time into a single Date object ───────────────
const getDateTime = (dateString, timeString) => {
  const [time, mer] = timeString.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  const dt = new Date(dateString);
  dt.setHours(h, m, 0, 0);
  return dt;
};

export default function VetAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  // 1) Load appointments
  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/appointments/vet", { withCredentials: true })
      .then(({ data }) => setAppointments(data))
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  // 2) Tick the clock every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 3) When vet clicks “Start Consultation”
  const handleStart = async (appt) => {
    try {
      await axios.post(
        `http://localhost:5000/auth/appointments/${appt._id}/start`,
        {},
        { withCredentials: true }
      );
      // After marking in‑progress, enter the video room
      navigate(
        `/video?roomID=${appt.roomID}` +
        `&mode=start` +
        `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}`
      );
    } catch (err) {
      console.error("Could not start:", err);
      alert("Failed to start consultation");
    }
  };

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

      <div className="space-y-4">
        {appointments.map(appt => {
          const startDT = getDateTime(appt.date,     appt.slot.startTime);
          const endDT   = getDateTime(appt.date,     appt.slot.endTime);
          const isVideo = appt.consultationType === "video";

          return (
            <div
              key={appt._id}
              className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <p><strong>Client:</strong> {appt.userId.name}</p>
                <p>
                  <strong>When:</strong>{" "}
                  {startDT.toLocaleDateString()} @ {appt.slot.startTime}
                </p>
                <p><strong>Type:</strong> {appt.consultationType}</p>
              </div>

              {isVideo && (
                <>
                  {/* Before the consultation window */}
                  {now < startDT && (
                    <span className="text-gray-500">Waiting for appointment time…</span>
                  )}

                  {/* During the window */}
                  {now >= startDT && now < endDT && (
                    appt.status === "booked" ? (
                                          <button
                                            onClick={() => handleStart(appt)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                          >
                                            Start Consultation
                                          </button>
                                        ) : appt.status === "in-progress" ? (
                                          <button
                                            onClick={() =>
                                             navigate(
                                                `/video?roomID=${appt.roomID}` +
                                                `&mode=join` +               // <<— change here
                                                `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}`
                                              )
                                            }
                                             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                           >
                                             Join Consultation
                                           </button>
                                         ) : null
                  )}

                  {/* After the consultation end time */}
                  {now >= endDT && (
                    <span className="text-gray-500">Meeting ended</span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
