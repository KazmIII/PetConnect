import React, { useEffect, useRef, useState } from "react";
import VideoService from "../services/videoService";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhone
} from "react-icons/fa";

export default function VideoCall({ roomID, mode, onEnd }) {
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const [micOn, setMicOn]       = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [remoteState, setRemoteState] = useState("waiting");

  // useEffect(() => {
  //   let mounted = true;
  
  //   const start = async () => {
  //     console.log("🚀 [Client] initLocalStream");
  //     await VideoService.initLocalStream(localVideoRef.current);
  
  //     console.log("🚀 [Client] createPeerConnection");
  //     await VideoService.createPeerConnection((stream) => {
  //       console.log("🎥 [Client] setting remote stream");
  //       if (mounted && remoteVideoRef.current) {
  //         remoteVideoRef.current.srcObject = stream;
  //       }
  //     });
  
  //     console.log("🚀 [Client] joinRoom", roomID);
  //     await VideoService.joinRoom(roomID);  // 🌟 Now the socket is connected here
  
  //     if (VideoService.socket) {
  //       // Listen for OFFER (only for joiners)
  //       VideoService.socket.on("offer", async ({ sdp }) => {
  //         console.log("📩 Received OFFER");
  
  //         await VideoService.pc.setRemoteDescription(new RTCSessionDescription(sdp));
  
  //         const answer = await VideoService.pc.createAnswer();
  //         await VideoService.pc.setLocalDescription(answer);
  
  //         console.log("📤 Sending ANSWER", answer);
  //         VideoService.socket.emit("answer", { roomID, sdp: answer });
  //       });
  
  //       // Listen for ICE Candidates (both sides need this)
  //       VideoService.socket.on("ice-candidate", async ({ candidate }) => {
  //         console.log("📩 Received ICE candidate", candidate);
  //         try {
  //           await VideoService.pc.addIceCandidate(new RTCIceCandidate(candidate));
  //         } catch (err) {
  //           console.warn("❌ ICE add failed", err);
  //         }
  //       });
  //     } else {
  //       console.error("❌ Socket is null after joinRoom!");
  //     }
  
  //     if (mode === "start") {
  //       console.log("🚀 [Client] startCall");
  //       await VideoService.startCall();
  //     }
  //   };
  
  //   start();
  
  //   return () => {
  //     mounted = false;
  //     console.log("🛑 [Client] endCall cleanup");
  //     VideoService.endCall();
  //   };
  // }, [roomID, mode, onEnd]);
  
  useEffect(() => {
    let mounted = true;
  
    const start = async () => {
      console.log("🚀 [Client] initLocalStream");
      await VideoService.initLocalStream(localVideoRef.current);
  
      console.log("🚀 [Client] createPeerConnection");
      // await VideoService.createPeerConnection(stream => {
      //   console.log("🎥 [Client] setting remote stream");
      //   if (mounted && remoteVideoRef.current) {
      //     remoteVideoRef.current.srcObject = stream;
      //   }
      // });
      await VideoService.createPeerConnection(stream => {
             // if the effect has already been torn down, or no video ref, do nothing
            //  if (!mounted || !remoteVideoRef.current) return;
        
            //  if (stream) {
            //    // remote has (re)joined
            //    remoteVideoRef.current.srcObject = stream;
            //    setRemoteLeft(false);
            //  } else {
            //    // remote has left
            //    remoteVideoRef.current.srcObject = null;
            //    setRemoteLeft(true);
            //  }

            if (!mounted || !remoteVideoRef.current) return;
 
            if (stream) {
          // peer just arrived (or re-joined)
             remoteVideoRef.current.srcObject = stream;
             setRemoteState("connected");
           } else {
          // peer dropped out
             remoteVideoRef.current.srcObject = null;
            setRemoteState("left");
         }
           });
  
      console.log("🚀 [Client] joinRoom", roomID);
      await VideoService.joinRoom(roomID);
  
      if (mode === "start") {
        console.log("🚀 [Client] startCall");
        await VideoService.startCall();
      }
    };
  
    start();
  
    return () => {
      mounted = false;
      console.log("🛑 [Client] endCall cleanup");
      VideoService.endCall();
    };
  }, [roomID, mode, onEnd]);
  
  

  const toggleMic = () => {
    const track = VideoService.localStream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleCamera = () => {
    const track = VideoService.localStream.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  };

  const handleEnd = () => {
    console.log("🛑 [Client] handleEnd");
    VideoService.endCall();
    if (onEnd) onEnd();
  };

  return (
    <div className=" h-screen max-w-full flex flex-col bg-gray-900 text-white">
      {/* Video panels */}
      <div className="flex-1 max-h-[75vh] grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 px-4">
        <div className="bg-black rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay muted playsInline
            className="h-full w-full object-cover"
          />
        </div>
        {/* <div className="bg-black rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay playsInline
            className="h-full w-full object-cover"
          />
        </div> */}
        {/* remote side: add `relative` and overlay your “user left” message
       <div className="bg-black rounded-lg overflow-hidden relative">
         {remoteLeft && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4">
             <p className="text-lg font-semibold">
               The other user has left the call.
             </p>
             
           </div>
         )}

         <video
           ref={remoteVideoRef}
           autoPlay playsInline
           className="h-full w-full object-cover"
         />
       </div> */}
       {/* remote side */}
<div className="bg-black rounded-lg overflow-hidden relative">
  {remoteState === "waiting" && (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4">
      <p className="text-lg">
        Waiting for other user to join consultation…
      </p>
    </div>
  )}

  {remoteState === "left" && (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4">
      <p className="text-lg ">
        The other user has left the call.
      </p>
    </div>
  )}

  <video
    ref={remoteVideoRef}
    autoPlay
    playsInline
    className="h-full w-full object-cover"
  />
</div>
      </div>

      {/* Controls
      <div className="flex justify-center items-center space-x-6 py-3 bg-gray-900">
        <button
          onClick={toggleMic}
          className="bg-gray-700 p-4 rounded-full hover:bg-gray-600 transition"
        >
          {micOn ? <FaMicrophone size={24}/> : <FaMicrophoneSlash size={24}/>}
        </button>
        <button
          onClick={toggleCamera}
          className="bg-gray-700 p-4 rounded-full hover:bg-gray-600 transition"
        >
          {cameraOn ? <FaVideo size={24}/> : <FaVideoSlash size={24}/>}
        </button>
        <button
          onClick={handleEnd}
          className="bg-red-600 p-4 rounded-full hover:bg-red-500 transition"
        >
          <FaPhone size={24}/>
        </button>
      </div> */}
      {/* Controls */}
<div className="flex justify-center items-center space-x-6 py-3 bg-gray-900">
  {/* Mic */}
  <div className="flex flex-col items-center">
    <button
      onClick={toggleMic}
      className="bg-gray-700 p-4 rounded-full hover:bg-gray-600 transition"
    >
      {micOn ? <FaMicrophone size={24}/> : <FaMicrophoneSlash size={24}/>}
    </button>
    <span className="mt-1 text-xs text-white">Mic</span>
  </div>

  {/* Video */}
  <div className="flex flex-col items-center">
    <button
      onClick={toggleCamera}
      className="bg-gray-700 p-4 rounded-full hover:bg-gray-600 transition"
    >
      {cameraOn ? <FaVideo size={24}/> : <FaVideoSlash size={24}/>}
    </button>
    <span className="mt-1 text-xs text-white">Video</span>
  </div>

  {/* End Call */}
  <div className="flex flex-col items-center">
    <button
      onClick={handleEnd}
      className="bg-red-600 p-4 rounded-full hover:bg-red-500 transition"
    >
      <FaPhone size={24}/>
    </button>
    <span className="mt-1 text-xs text-white">End</span>
  </div>
</div>

    </div>
  );
}


// import React, { useEffect, useRef, useState } from "react";
// import VideoService from "../services/videoService";
// import {
//   FaMicrophone,
//   FaMicrophoneSlash,
//   FaVideo,
//   FaVideoSlash,
//   FaPhone
// } from "react-icons/fa";

// export default function VideoCall({ roomID, mode, onEnd }) {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const [micOn, setMicOn] = useState(true);
//   const [cameraOn, setCameraOn] = useState(true);
//   const [remoteActive, setRemoteActive] = useState(false);

//   useEffect(() => {
//     let mounted = true;

//     const start = async () => {
//       await VideoService.initLocalStream(localVideoRef.current);

//       await VideoService.createPeerConnection(stream => {
//         if (!mounted) return;
//         // assign remote stream
//         remoteVideoRef.current.srcObject = stream;
//         setRemoteActive(true);

//         // listen for track removals (remote hangup)
//         stream.addEventListener('removetrack', () => {
//           if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//           setRemoteActive(false);
//         });

//         // fallback: connection state
//         const pc = VideoService.peerConnection;
//         if (pc) {
//           pc.onconnectionstatechange = () => {
//             const state = pc.connectionState;
//             if (['disconnected', 'failed', 'closed'].includes(state)) {
//               if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//               setRemoteActive(false);
//             }
//           };
//         }
//       });

//       await VideoService.joinRoom(roomID);
//       if (mode === "start") await VideoService.startCall();
//     };

//     start();

//     return () => {
//       mounted = false;
//       VideoService.endCall();
//       setRemoteActive(false);
//     };
//   }, [roomID, mode, onEnd]);

//   const toggleMic = () => {
//     const track = VideoService.localStream.getAudioTracks()[0];
//     track.enabled = !track.enabled;
//     setMicOn(track.enabled);
//   };

//   const toggleCamera = () => {
//     const track = VideoService.localStream.getVideoTracks()[0];
//     track.enabled = !track.enabled;
//     setCameraOn(track.enabled);
//   };

//   const handleEnd = () => {
//     VideoService.endCall();
//     if (onEnd) onEnd();
//     setRemoteActive(false);
//   };

//   return (
//     <div className="max-w-full  bg-gray-900 text-white">
//       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 px-4">
//         <div className= "bg-black rounded-lg overflow-hidden ">
//           <video
//             ref={localVideoRef}
//             autoPlay muted playsInline
//             className="h-full w-full object-cover"
//           />
//         </div>
//         <div className={`${remoteActive ? 'visible' : 'invisible'}  bg-black rounded-lg overflow-hidden`}>
//           <video
//             ref={remoteVideoRef}
//             autoPlay playsInline
//             className="h-full w-full object-cover"
//           />
//         </div>
//       </div>
//       <div className="flex justify-center items-center space-x-6 pb-4 pt-3 bg-gray-900">
//         <button onClick={toggleMic} className="bg-gray-700 p-4 rounded-full hover:bg-gray-600 transition">
//           {micOn ? <FaMicrophone size={24}/> : <FaMicrophoneSlash size={24}/>}
//         </button>
//         <button onClick={toggleCamera} className="bg-gray-700 p-4 rounded-full hover:bg-gray-600 transition">
//           {cameraOn ? <FaVideo size={24}/> : <FaVideoSlash size={24}/>}
//         </button>
//         <button onClick={handleEnd} className="bg-red-600 p-4 rounded-full hover:bg-red-500 transition">
//           <FaPhone size={24}/>
//         </button>
//       </div>
//     </div>
//   );
// }

