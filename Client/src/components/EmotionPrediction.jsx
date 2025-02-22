import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button, Typography, Paper, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import image1 from "../assets/image1.jpg";

const EmotionPrediction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // New state for image preview
  const [errorMessage, setErrorMessage] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [petMessage, setPetMessage] = useState("");
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");

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

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/get-user-pets", {
          withCredentials: true, // Ensure the cookie is sent
        });
        if (response.data.success) {
          setPets(response.data.pets);
        } else {
          setErrorMessage(response.data.message);
        }
      } catch (error) {
        console.error("Failed to predict emotion", error);
      }

    };

    fetchPets(); // Call the function
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPredictionResult(null); // Clear the prediction result immediately
      setPetMessage(""); // Clear any previous pet message
      setErrorMessage(""); // Clear any previous error message

      if (!allowedFileTypes.includes(file.type)) {
        setErrorMessage("Only JPG, JPEG, and PNG files are allowed.");
        setSelectedFile(null);
        setImagePreview(null); // Clear the preview if the file is invalid
      } else {
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

    // Include the pet ID in the formData only if a pet is selected
    if (selectedPet) {
      formData.append("petId", selectedPet);
    }

    try {
      setIsLoading(true);
      setPredictionResult(null);
      setPetMessage("");

      // Step 1: Send file for prediction
      const response = await axios.post("http://127.0.0.1:8000/predict/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.message) {
        setPetMessage(response.data.message);
      } else {
        setPredictionResult(response.data);

        // Step 2: Store the predicted emotion in the database only if a pet is selected
        if (selectedPet) {
          await axios.post("http://localhost:5000/pets/store-prediction", {
            petId: selectedPet,
            emotion: response.data.emotion,
            confidence: response.data.probabilities[0], // Assuming it's the probabilities array
          });
        }

        setErrorMessage(""); // Clear any error
      }
    } catch (error) {
      if (error.response) {
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
        className="p-8 bg-gradient-to-br bg-white rounded-lg border border-x-2 border-y-2 shadow-md max-w-lg w-full"
      >
        <Typography
          component="h1"
          variant="h3"
          className="!text-center !text-3xl !font-bold !text-orange-700 !mb-6"
        >
          Pet Emotion Predictor
        </Typography>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Selection Dropdown */}
          <FormControl fullWidth variant="outlined" className="mb-4">
            <InputLabel id="pet-select-label" className="text-gray-600">
              Select Pet
            </InputLabel>
            <Select
              labelId="pet-select-label"
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
              label="Select Pet" // Important: Bind the label here to keep it in place
              className="bg-white text-black border border-gray-300 rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-teal-500"
            >
              <MenuItem value="">
                None
              </MenuItem>
              {pets.map((pet) => (
                <MenuItem key={pet._id} value={pet._id}>
                  {pet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div>
            <label htmlFor="file" className="block text-lg font-medium text-gray-600">
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
                  setSelectedFile(null);
                  setPredictionResult(null); // Clear the prediction result
                  setErrorMessage(""); // Clear any error message
                  setPetMessage(""); // Clear the selected file state
                  fileInputRef.current.value = ""; // Clear the file input value
                }}
                className="absolute -top-3 right-28 text-white bg-gray-600 rounded-full p-2 z-10 hover:bg-gray-900 focus:outline-none shadow-lg transition-all"
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
            className="bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-200"
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
