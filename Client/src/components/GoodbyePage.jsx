// src/pages/GoodbyePage.jsx
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function GoodbyePage() {

  const navigate = useNavigate();


  const handleRejoin = () => {
    navigate(`/video?roomID=${roomID}&mode=join`);
  };
  return (
    <div className="h-screen max-w-full flex flex-col justify-center items-center bg-orange-200 text-black">
  <p className="text-3xl font-semibold mb-4 pb-6">You left the meeting</p>
  {/* optional: a button to go back home or start a new call */}
  <div className="flex gap-6">
    <button
      onClick={handleRejoin}
      className="px-6 py-3 bg-orange-500 rounded-full hover:bg-orange-600 transition"
    >
      Rejoin
    </button>
    <button
      onClick={() => window.location.href = "/"}
      className="px-6 py-3 bg-orange-500 rounded-full hover:bg-orange-600 transition"
    >
      Return to home screen
    </button>


  </div>
      {/* Submit Feedback button */}
      <Link to="/submit-feedback" className="mt-7 text-lg text-teal-700 hover:underline">
    Submit Feedback
  </Link>
</div>

  );
}

// // src/pages/GoodbyePage.jsx
// import React from "react";
// import { useNavigate } from 'react-router-dom';

// export default function GoodbyePage() {

//   const navigate = useNavigate();

//   const handleRejoin = () => {
//     // Corrected template string syntax for roomID
//     navigate(`/video?roomID=${roomID}&mode=join`);
//   };

//   return (
//     <div className="h-screen max-w-full flex flex-col justify-center items-center bg-orange-200 text-black">
//       <h1 className="text-5xl font-bold mb-4">Goodbye!</h1>
//       <p className="text-lg mb-8">Thanks for using our video consultation service.</p>
//       {/* optional: a button to go back home or start a new call */}
//       <button
//         onClick={() => window.location.href = "/"} 
//         className="px-6 py-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
//       >
//         Return to home screen
//       </button>
//       <button
//         onClick={handleRejoin}
//         className="px-6 py-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
//       >
//         Rejoin
//       </button>
//     </div>
//   );
// }
