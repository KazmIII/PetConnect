import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PetEmotions = () => {
  const { petName } = useParams(); // Get petName from the URL parameters
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/pets/emotions/${petName}`
        );
        if (response.data.success) {
          setEmotions(response.data.emotions);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Error fetching emotions:", err);
        setError("Could not fetch emotions.");
      } finally {
        setLoading(false);
      }
    };

    if (petName) {
      fetchEmotions();
    }
  }, [petName]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading emotions...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500 font-semibold">{error}</p>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6  text-orange-700">
      {`${petName.charAt(0).toUpperCase()}${petName.slice(1)}'s Emotional Trends`}
      </h2>
      {emotions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-300">
            <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
              <tr>
                <th className="py-3 px-6 text-center border-r border-gray-300">
                  Emotion
                </th>
                <th className="py-3 px-6 text-center border-r border-gray-300">
                  Date
                </th>
                <th className="py-3 px-6 text-center">Time</th>
              </tr>
            </thead>
            <tbody>
              {emotions.map((emotion, index) => {
                const dateObj = new Date(emotion.timestamp);
                const date = dateObj.toLocaleDateString();
                const time = dateObj.toLocaleTimeString();
                return (
                  <tr
                    key={index}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                    }`}
                  >
                    <td className="py-3 px-6 text-center border-r border-gray-300">
                      {emotion.emotion}
                    </td>
                    <td className="py-3 px-6 text-center border-r border-gray-300">
                      {date}
                    </td>
                    <td className="py-3 px-6 text-center">{time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No emotions recorded for this pet.
        </p>
      )}
    </div>
  );
};

export default PetEmotions;
