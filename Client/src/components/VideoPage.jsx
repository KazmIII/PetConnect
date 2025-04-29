// src/pages/VideoPage.jsx
import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import VideoCall from "../components/VideoCall";

export default function VideoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomID = searchParams.get("roomID");
  const mode   = searchParams.get("mode");  // "start" or "join"

  if (!roomID || !mode) {
    return (
      <div className="p-8 text-red-500">
        URL must include <code>?roomID=&lt;id&gt;&mode=&lt;start|join&gt;</code>
      </div>
    );
  }

  return (
    <VideoCall
      roomID={roomID}
      mode={mode}
      onEnd={() => navigate("/leave")}
    />
  );
}
