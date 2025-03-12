import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import backgroundImage from "../assets/BgMemoryhd.jpg";

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/user-adoption-ads", {
          withCredentials: true,
        });
        setListings(response.data.adoptionAds);
    } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleCardClick = (petId) => {
    navigate(`/pet-listing/${petId}`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div
      className="min-h-screen bg-fixed flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container rounded-lg shadow-gray-400 mb-96 md:bg-orange-200 md:shadow-md max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold text-center mb-6 text-orange-700">
          Your Adoption Listings
        </h1>

        {listings.length === 0 ? (
          <p className="text-center text-gray-700">You haven't listed any pets for adoption yet.</p>
        ) : (
          <div className="space-y-4">
            {listings.map((pet) => (
              <div
                key={pet._id}
                className="bg-slate-200 md:bg-white mx-auto md:mx-10 shadow-lg rounded-lg overflow-hidden p-4 border-l-8 border-orange-600 cursor-pointer hover:bg-slate-100"
                onClick={() => handleCardClick(pet._id)}
              >
                <div className="flex flex-row justify-between">
                  <div className="flex flex-col space-y-2">
                    <h2 className="text-xl font-semibold text-teal-700">{pet.name}</h2>
                    <p className="text-sm text-gray-600">{pet.breed || "Unknown Breed"}</p>
                    <p className="mt-2 text-lg font-bold text-orange-600">Age: {pet.age || "Unknown"}</p>
                  </div>
                  <div className="flex items-center">
                    {pet.photos && pet.photos.length > 0 ? (
                      <img
                        src={pet.photos[0]}
                        alt={pet.name}
                        className="w-40 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-300 flex items-center justify-center rounded-lg">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
