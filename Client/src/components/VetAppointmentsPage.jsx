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

// // src/components/VetAppointmentsPage.jsx
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const handleStart = async (appt, endDT) => {
    try {
      await axios.post(
        `http://localhost:5000/auth/appointments/${appt._id}/start`,
        {},
        { withCredentials: true }
      );
      navigate(
        `/video?roomID=${appt.roomID}` +
        `&mode=start` +
        `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
        `&role=vet`
      );
    } catch (err) {
      console.error("Could not start:", err);
      alert("Failed to start consultation");
    }
  };

  const handleComplete = async (appointmentId) => {
    // Optimistically update status in local state
    setAppointments(prev =>
      prev.map(appt =>
        appt._id === appointmentId ? { ...appt, status: "completed" } : appt
      )
    );

    try {
      await axios.post(
        `http://localhost:5000/auth/appointments/${appointmentId}/complete`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to complete appointment:", err);
      alert("Could not mark appointment as completed.");

      // Revert optimistic update if error
      setAppointments(prev =>
        prev.map(appt =>
          appt._id === appointmentId ? { ...appt, status: "in-progress" } : appt
        )
      );
    }
  };


  if (loading) return <Spinner className="w-8 h-8 mx-auto my-8" />;
  if (error) return <p className="text-center text-red-600 my-8">Error: {error}</p>;
  if (!appointments.length) {
    return <p className="text-center my-8">No appointments booked yet.</p>;
  }


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex text-orange-600 items-center gap-2">
        <CalendarCheck size={24} /> My Appointments
      </h1>

      <div className="space-y-6">
        {appointments.map(appt => {
          const startDT = getDateTime(appt.date, appt.slot.startTime);
          const endDT = getDateTime(appt.date, appt.slot.endTime);
          const isVideo = appt.consultationType === "video";

          return (
            <div
              key={appt._id}
              className="p-5  rounded-xl shadow-lg flex flex-col sm:flex-row sm:justify-between sm:items-center bg-orange-200"
            >
              <div className="space-y-1">
                <p className="text-gray-900 mb-2 text-2xl font-semibold">
                  <span className=" text-gray-900">Client:</span>{" "}
                  {appt.userId.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Date & Time:</span>{" "}
                  {startDT.toLocaleDateString()} at {appt.slot.startTime}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Type:</span>{" "}
                  <span className="inline-block px-2 py-0.5 text-sm rounded-full bg-white text-black capitalize">
                    {appt.consultationType}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Status:</span>{" "}
                  <span className={`inline-block px-2 py-0.5 text-sm rounded-full 
                    ${appt.status === "booked" ? "bg-yellow-100 text-yellow-800" :
                      appt.status === "in-progress" ? "bg-green-100 text-green-800" :
                        "bg-teal-100 text-teal-800"}
                  `}>
                    {appt.status}
                  </span>
                </p>
              </div>

              {isVideo && (
                <div className="mt-4 sm:mt-0 sm:text-right">

                  {now < startDT && (
                    <span className="text-sm text-gray-500 italic">
                      Waiting for appointment time…
                    </span>
                  )}

                  {now >= startDT && now < endDT && (
                    appt.status === "booked" ? (
                      <button
                        onClick={() => handleStart(appt, endDT)}
                        className="mt-2 sm:mt-0 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Start Consultation
                      </button>
                    ) : appt.status === "in-progress" ? (
                      <button
                        onClick={() =>
                          navigate(
                            `/video?roomID=${appt.roomID}` +
                            `&mode=join` +
                            `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
                            `&role=vet`
                          )
                        }
                        className="mt-2 sm:mt-0 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Join Consultation
                      </button>
                    ) : null
                  )}

                  {now >= endDT && appt.status === "in-progress" && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                      {/* This button will appear only after the scheduled time */}
                      <button
                        onClick={() => handleComplete(appt._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Mark as Completed
                      </button>
                    </div>
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


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import {CalendarClock } from "lucide-react";

// // ── Helper to combine date + time into a single Date object ───────────────
// const getDateTime = (dateString, timeString) => {
//   const [time, mer] = timeString.split(" ");
//   let [h, m] = time.split(":").map(Number);
//   if (mer === "PM" && h !== 12) h += 12;
//   if (mer === "AM" && h === 12) h = 0;
//   const dt = new Date(dateString);
//   dt.setHours(h, m, 0, 0);
//   return dt;
// };

// export default function VetAppointmentsPage() {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [now, setNow] = useState(new Date());
//   const navigate = useNavigate();

//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/auth/appointments/vet", { withCredentials: true })
//       .then(({ data }) => setAppointments(data))
//       .catch(err => setError(err.response?.data?.message || err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     const id = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(id);
//   }, []);

//   const handleStart = async (appt, endDT) => {
//     try {
//       await axios.post(
//         `http://localhost:5000/auth/appointments/${appt._id}/start`,
//         {},
//         { withCredentials: true }
//       );
//       navigate(
//         `/video?roomID=${appt.roomID}` +
//         `&mode=start` +
//         `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
//         `&role=vet`
//       );
//     } catch (err) {
//       console.error("Could not start:", err);
//       alert("Failed to start consultation");
//     }
//   };

//   if (loading) return <p className="text-center py-8">Loading appointments…</p>;
//   if (error) return <p className="text-center py-8 text-red-600">Error: {error}</p>;
//   if (!appointments.length) return <p className="text-center py-8">No appointments booked yet.</p>;

//   return (
//     <div className="max-w-3xl mx-auto py-8 space-y-6">
//       <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
//         <CalendarClock size={28} /> My Appointments
//       </h1>

//       <div className="space-y-4">
//         {appointments.map(appt => {
//           const startDT = getDateTime(appt.date, appt.slot.startTime);
//           const endDT = getDateTime(appt.date, appt.slot.endTime);
//           const isVideo = appt.consultationType === "video";
//           const inProgress = appt.status === "in-progress" && now < endDT;
//           const booked = appt.status === "booked" && now < endDT;
//           const ended = now >= endDT;
//           const canStart = isVideo && now >= startDT && now < endDT && appt.status === "booked";
//           const canRejoin = isVideo && appt.status === "in-progress" && now < endDT;

//           const formattedDate = startDT.toLocaleDateString(undefined, {
//             weekday: 'long',
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//           });
//           const formattedStart = startDT.toLocaleTimeString(undefined, {
//             hour: 'numeric',
//             minute: '2-digit',
//           });
//           const formattedEnd = endDT.toLocaleTimeString(undefined, {
//             hour: 'numeric',
//             minute: '2-digit',
//           });

//           return (
//             <article
//               key={appt._id}
//               className="bg-orange-100 text-gray-900 rounded-lg shadow-lg p-6 flex flex-col items-start space-y-4 md:space-y-0 md:flex-row md:items-start md:space-x-6"
//             >
//               <div className="flex-1 text-left">
//                 <h2 className="text-xl font-medium">Client: {appt.userId?.name || "Unknown"}</h2>
//                 <p className="mt-3 text-gray-800">
//                 <span className="font-semibold">Date: </span>
//                          {formattedDate}</p>
//                 <p className="mt-2 text-gray-800">
//                 <span className="font-semibold">Timings: </span>{formattedStart} – {formattedEnd}</p>
//                 <p className="mt-2 text-gray-800">
//                   <span className="font-semibold">Type:</span>{' '}
//                   <span className="capitalize">{appt.consultationType} Consultation</span>
//                 </p>
//                 <p className="mt-2 text-gray-800">
//                   <span className="font-semibold">Fee:</span> PKR {appt.fee}
//                 </p>
//               </div>

//               {/* <div className="flex items-center space-x-3">
//                 {inProgress && (
//                   <span className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm">
//                     IN PROGRESS
//                   </span>
//                 )}
//                 {ended && (
//                   <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
//                     COMPLETED
//                   </span>
//                 )}
//                 {canStart && (
//                   <button
//                     onClick={() => handleStart(appt, endDT)}
//                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//                   >
//                     Start Consultation
//                   </button>
//                 )}
//                 {canRejoin && (
//                   <button
//                     onClick={() =>
//                       navigate(
//                         `/video?roomID=${appt.roomID}` +
//                         `&mode=join` +
//                         `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
//                         `&role=vet`
//                       )
//                     }
//                     className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
//                   >
//                     Join Consultation
//                   </button>
//                 )}
//               </div> */}
//               <div className="flex items-center space-x-3">
//   {inProgress && (
//     <span className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm">
//       IN PROGRESS
//     </span>
//   )}
//   {ended && (
//     <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
//       COMPLETED
//     </span>
//   )}
//   {/* Show PAID label if fee is present and status is booked */}
//   {booked && appt.fee > 0 && (
//     <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
//       PAID
//     </span>
//   )}
//   {canStart && (
//     <button
//       onClick={() => handleStart(appt, endDT)}
//       className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//     >
//       Start Consultation
//     </button>
//   )}
//   {canRejoin && (
//     <button
//       onClick={() =>
//         navigate(
//           `/video?roomID=${appt.roomID}` +
//           `&mode=join` +
//           `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
//           `&role=vet`
//         )
//       }
//       className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
//     >
//       Join Consultation
//     </button>
//   )}
// </div>
//             </article>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
