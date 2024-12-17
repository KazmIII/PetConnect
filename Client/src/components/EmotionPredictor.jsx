import React, { useState } from 'react';
import axios from 'axios';

function EmotionPredictor() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    setImage(event.target.files[0]);  // Get the uploaded file
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!image) {
      alert('Please select an image to upload.');
      return;
    }

    setLoading(true);  // Set loading state
    const formData = new FormData();
    formData.append('image', image);  // Append image to form data

    try {
      // Send the image to FastAPI backend
      const response = await axios.post('http://localhost:8000/predict/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Important for file upload
        },
      });
      // Set prediction result
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);  // Reset loading state
    }
  };

  return (
    <div className="EmotionPredictor">
      <h1>Pet Emotion Prediction</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Upload & Predict'}
        </button>
      </form>

      {prediction && (
        <div>
          <h3>Prediction:</h3>
          <pre>{JSON.stringify(prediction, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default EmotionPredictor;