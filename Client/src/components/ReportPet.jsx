import React, { useState, useRef } from "react";
import axios from "axios";
import backgroundImage from "../assets/BgMemoryhd.jpg";
import { FaPhone, FaUser } from "react-icons/fa";

function ReportPet() {
  const [reportType, setReportType] = useState("lost");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState(""); // New state for name
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageStyle, setMessageStyle] = useState("text-red-600"); // Default error style
  const [lostSubmitted, setLostSubmitted] = useState(false);

  // Ref for file input
  const fileInputRef = useRef(null);

  const handleReportTypeChange = (type) => {
    setReportType(type);
    setMatches([]);
    setMessage("");
    setMessageStyle("text-red-600"); // Reset message style on type change
    setLostSubmitted(false); // Reset submission flag on switching types
    if (type === "lost") {
      setPhoneNumber("");
      setName("");
    }
  };

  const handleFileChange = (e) => {
    // Clear previous messages and match flags when a new file is chosen
    setMessage("");
    setLostSubmitted(false);
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const clearFileAndPreview = () => {
    setFile(null);
    setPreviewUrl(null);
    setMatches([]); // Clear matches as well
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Validate Pakistani phone number (e.g., +923001234567 or 03001234567)
  const isValidPhoneNumber = (number) => {
    const phoneRegex = /^(?:\+92|0)?3\d{2}\d{7}$/;
    return phoneRegex.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    setMatches([]);

    try {
      if (!file) {
        setMessage("Please upload an image.");
        setMessageStyle("text-red-600");
        setLoading(false);
        return;
      }

      // For found reports, validate phone number and name
      if (reportType === "found") {
        if (!name) {
          setMessage("Please enter your name.");
          setMessageStyle("text-red-600");
          setLoading(false);
          return;
        }
        if (!phoneNumber) {
          setMessage("Please enter a phone number.");
          setMessageStyle("text-red-600");
          setLoading(false);
          return;
        }
        if (!isValidPhoneNumber(phoneNumber)) {
          setMessage("Please enter a valid phone number.");
          setMessageStyle("text-red-600");
          setLoading(false);
          return;
        }
      }

      const imageBase64 = await fileToBase64(file);
      const payload = {
        report_type: reportType,
        image: imageBase64,
      };
      if (reportType === "found") {
        payload.phone_number = phoneNumber;
        payload.name = name; // Include name in payload for found reports
      }

      const response = await axios.post("http://localhost:8000/report/", payload);
      
      if (reportType === "lost") {
        setMatches(response.data.matches);
        setLostSubmitted(true);
        if (response.data.matches && response.data.matches.length > 0) {
          setMessage("Match search completed!");
          setMessageStyle("text-green-600");
        } else {
          setMessage("Match search completed with no match found.");
          setMessageStyle("text-green-600");
        }
      } else {
        setMessage("Report submitted successfully!");
        setMessageStyle("text-green-600");
        setPhoneNumber("");
        setName(""); // Reset name on submission
        clearFileAndPreview();
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to submit report. Please try again.");
      setMessageStyle("text-red-600");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* White box container for form and preview */}
      <div className="bg-white rounded-lg shadow-md border border-gray-300 p-8 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-700">
          {reportType === "lost" ? "Lost Your Pet?" : "Found a Pet?"}
        </h1>
        <p className="text-gray-700 mb-4 text-center text-lg">
          {reportType === "lost"
            ? "Help us find your furry friend by uploading a picture of your lost pet."
            : "Help reunite a pet with its owner by uploading a picture of a found pet."}
        </p>

        <div className="mb-6 flex justify-center space-x-6">
          <button
            onClick={() => handleReportTypeChange("lost")}
            className={`${
              reportType === "lost"
                ? "bg-teal-800 text-white"
                : "bg-white text-teal-800 border border-teal-800"
            } min-w-[150px] py-3 rounded-md font-semibold transition duration-300 transform hover:bg-teal-700 hover:text-white`}
          >
            Lost Pet
          </button>
          <button
            onClick={() => handleReportTypeChange("found")}
            className={`${
              reportType === "found"
                ? "bg-teal-800 text-white"
                : "bg-white text-teal-800 border border-teal-800"
            } min-w-[150px] py-3 rounded-md font-semibold transition duration-300 transform hover:bg-teal-700 hover:text-white`}
          >
            Found Pet
          </button>
        </div>

        {/* Flex container for form fields and preview */}
        <div className="flex flex-col sm:flex-row sm:space-x-6">
          {/* Form Fields Column */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Upload Image of the Pet
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onClick={() => { setMessage(""); setLostSubmitted(false); }}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {reportType === "found" && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {message && (
                <div className={`mb-4 text-center ${messageStyle}`}>
                  {message}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white font-medium p-3 rounded-lg"
              >
                {loading
                  ? reportType === "lost"
                    ? "Finding Match..."
                    : "Submitting..."
                  : reportType === "lost"
                  ? "Find Match"
                  : "Submit Report"}
              </button>
            </form>
          </div>
          {/* Image Preview Column */}
          <div className="flex-1 relative flex items-center justify-center mt-6 sm:mt-0">
            {previewUrl ? (
              <>
                {/* Cancel icon */}
                <button
                  onClick={clearFileAndPreview}
                  className="absolute top-1 right-1 bg-teal-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-teal-600"
                >
                  &times;
                </button>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain rounded-lg shadow-md"
                />
              </>
            ) : (
              <div className="text-gray-400">Image preview will appear here</div>
            )}
          </div>
        </div>
      </div>

      {/* Matching results container (displayed below the white box) */}
      {/* Matching results container (displayed below the white box) */}
{reportType === "lost" && lostSubmitted && matches.length > 0 && (
  <div className="w-full max-w-5xl px-4 mt-8">
    <h2 className="text-2xl font-bold mb-6 text-center">
      Matching Found Pets
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {matches.map((match, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-lg shadow-lg p-6"
        >
          <img
            src={match.found_image} // Assuming found_image is provided as Base64 or URL
            alt="Found pet"
            className="w-full h-48 object-contain mb-4 rounded-lg"
          />
          
          {/* Uncomment this if you want to display similarity percentage */}
          {/* <p className="text-gray-700 font-medium">
            Similarity: {(match.similarity * 100).toFixed(2)}%
          </p> */}

          {match.name && (
            <div className="flex items-center text-gray-600 text-lg mt-2">
              <FaUser className="mr-2 text-teal-600" />
              <span>Found by {match.name}</span>
            </div>
          )}
          {match.phone_number && (
            <div className="flex items-center text-gray-600 text-lg mt-2">
              <FaPhone className="mr-2 text-teal-600" />
              <span>{match.phone_number}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
}

export default ReportPet;