import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const SitterDetails = () => {
  const { sitterId } = useParams(); 
  console.log("Sitter ID:", sitterId);
  const [sitterDetails, setSitterDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileURL, setFileURL] = useState(null); 

  useEffect(() => {
    const fetchSitterDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/auth/admin/sitter-details/${sitterId}`
        );
        setSitterDetails(response.data);
        console.log("response in frontend:", response.data);
      } catch (error) {
        console.error("Error fetching sitter details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSitterDetails();
  }, [sitterId]);

  useEffect(() => {
    if (sitterDetails && sitterDetails.sitterCertificate) {
      const urls = {};
      const { sitterCertificate } = sitterDetails;
  
      try {
        // Check if certificate is already a base64 string
        const isPDF = sitterCertificate.startsWith("data:application/pdf");
        const fileType = isPDF ? "application/pdf" : "image/png";
  
        // Extract the base64 content
        const base64Content = sitterCertificate.split(",")[1];
  
        // Convert base64 to binary (Uint8Array) and create a Blob
        const blob = new Blob(
          [Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0))],
          { type: fileType }
        );
  
        // Create URL for the file and save it
        urls["sitterCertificate"] = URL.createObjectURL(blob);
        setFileURL(urls["sitterCertificate"]);
      } catch (error) {
        console.error("Failed to process sitter certificate:", error);
      }
    }
  
    // Cleanup to revoke the object URL
    return () => {
      if (fileURL) URL.revokeObjectURL(fileURL);
    };
  }, [sitterDetails]);
  

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;

  if (!sitterDetails)
    return <div className="text-center text-red-500">Provider not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg shadow-gray-400 p-8">
      <h2 className="text-xl md:text-3xl font-bold text-orange-800 mb-6">
        Sitter: {sitterDetails.name}
      </h2>

      {/* Sitter Information */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Sitter Information</h3>
        <p className="text-gray-700 mb-3">
          <strong>Email:</strong> {sitterDetails.email}
        </p>
        <p className="text-gray-700 mb-3">
          <strong>Phone:</strong> {sitterDetails.phone}
        </p>
        <p className="text-gray-700 mb-3">
          <strong>City:</strong> {sitterDetails.city}
        </p>
        <p className="text-gray-700 mb-3">
          <strong>Address:</strong> {sitterDetails.sitterAddress}
        </p>
        <p className="text-gray-700 mb-3">
          <strong>Years of Experience:</strong> {sitterDetails.yearsOfExperience}
        </p>
        <p className="text-gray-700 mb-3">
          <strong>Experience in Sitting:</strong> {sitterDetails.sittingExperience}
        </p>
        <p className="text-gray-700 mb-3">
          <strong>Verification Status:</strong>{" "}
          <span
            className={`px-3 py-1 rounded-lg font-medium ${
              sitterDetails.verificationStatus === "verified"
                ? "bg-green-100 text-green-800"
                : sitterDetails.verificationStatus === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {sitterDetails.verificationStatus}
          </span>
        </p>
      </div>

      {/* Sitter Certificate (File) */}
      {fileURL && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Sitter Certificate</h3>
          <div className="space-y-4 border border-gray-300 p-4 rounded-lg">
            <p className="text-gray-700 font-medium mb-2">Certificate:</p>
            <div className="flex flex-col items-center gap-4">
              {/* Display PDF or Image */}
              {fileURL.endsWith(".pdf") ? (
                <iframe
                  src={fileURL}
                  width="100%"
                  height="500px"
                  title="Sitter Certificate"
                  className="border border-gray-200 rounded-lg"
                />
              ) : (
                <img
                  src={fileURL}
                  alt="Sitter Certificate"
                  className="w-44 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
              )}
              <div>
                <a
                  href={fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  Open Certificate
                </a>
                <br />
                <a
                  href={fileURL}
                  download="Sitter_Certificate"
                  className="text-teal-600 hover:underline"
                >
                  Download Certificate
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitterDetails;
