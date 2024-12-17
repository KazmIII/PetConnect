import React, { useState, useRef } from "react";
import axios from "axios";
import { Button, Typography, Paper } from "@mui/material";
import image1 from "../assets/image1.jpg";

const EmotionPrediction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // New state for image preview
  const [errorMessage, setErrorMessage] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [petMessage, setPetMessage] = useState("");

  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];

  // Emotion classes with emojis
  const emotionClasses = {
    0: { label: "Angry", emoji: "😡" },
    1: { label: "Happy", emoji: "😊" },
    2: { label: "Relaxed", emoji: "😌" },
    3: { label: "Sad", emoji: "😢" },
  };

  // Create ref for file input
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!allowedFileTypes.includes(file.type)) {
        setErrorMessage("Only JPG, JPEG, and PNG files are allowed.");
        setSelectedFile(null);
        setImagePreview(null); // Clear the preview if the file is invalid
      } else {
        setErrorMessage("");
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file)); // Generate image preview
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsLoading(true);
      setPredictionResult(null);
      setPetMessage("");

      const response = await axios.post("http://127.0.0.1:8000/predict/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.message) {
        // Non-Pet Response
        setPetMessage(response.data.message);
      } else {
        // Emotion Prediction Response
        setPredictionResult(response.data);
      }
    } catch (error) {
      if (error.response) {
        // Check for specific status codes and display corresponding messages
        if (error.response.status === 500) {
          setErrorMessage("Prediction failed.");
        }
      } else {
        setErrorMessage("Failed to predict emotion. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${image1})`, // Corrected background image URL
      }}
    >
      <Paper
        elevation={10}
        className="p-8 bg-gradient-to-br text-white rounded-xl shadow-lg max-w-lg w-full"
      >
        <Typography variant="h3" className="text-center font-extrabold text-4xl mb-6 text-gradient">
          Pet Emotion Predictor
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-lg font-medium text-black">
              Upload an Image
            </label>
            <input
              type="file"
              id="file"
              ref={fileInputRef} // Attach ref here
              onChange={handleFileChange}
              className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
            />
            {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
          </div>

          {/* Display Image Preview */}
          {imagePreview && (
            <div className="mt-4 relative">
              <button
                onClick={() => {
                  setImagePreview(null); // Clear the image preview
                  setSelectedFile(null); // Clear the selected file state
                  fileInputRef.current.value = ""; // Clear the file input value
                }}
                className="absolute -top-3 right-28 text-white bg-gray-900 rounded-full p-2 z-10 hover:bg-gray-700 focus:outline-none shadow-lg transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>{" "}
                {/* Cross icon */}
              </button>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg shadow-md mx-auto" // Adjust width and height here
              />
            </div>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-extrabold py-2 px-4 rounded-lg focus:outline-none shadow-md"
          >
            {isLoading ? (
              <span className="text-white">Processing...</span> // Ensures "Processing..." text is white
            ) : (
              "Predict Emotion"
            )}
          </Button>
        </form>

        {/* Display Message if not a Pet */}
        {petMessage && (
          <div className="mt-6 p-4 bg-orange-300 text-gray-900 rounded-lg shadow-md">
            <Typography variant="h6">{petMessage}</Typography>
          </div>
        )}

        {/* Display Emotion Prediction Results */}
        {predictionResult && (
          <div className="mt-6 p-4 bg-orange-300 text-gray-900 rounded-lg shadow-md">
            <Typography variant="h6" className="font-semibold">
              Prediction Result:
            </Typography>
            <p className="text-black">
              Emotion: <strong>{predictionResult.emotion}</strong>
            </p>
            <h4 className="mt-2 font-semibold text-black">Confidence Level:</h4>
            <ul className="list-disc text-black">
              {predictionResult.probabilities[0].map((prob, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">{emotionClasses[index].emoji}</span>
                  {`${emotionClasses[index].label}: ${(prob * 100).toFixed(2)}%`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Paper>
    </div>
  );
};

export default EmotionPrediction;
