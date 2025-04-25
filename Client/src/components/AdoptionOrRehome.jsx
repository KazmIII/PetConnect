import React from "react";
import { useNavigate } from "react-router-dom";
import dogImage from "../assets/dogImage.png"; 
import { Search, Home } from "lucide-react";
import { useNavbar } from "./NavbarContext";

const AdoptionOrRehome = () => {
  const navigate = useNavigate();
  const { isLoggedIn, handleShowComponent } = useNavbar();
  
  const handleAdoption = () => {
    navigate(`/find-a-pet`);
  };

  const handleRehome = () => {
    if(isLoggedIn){
        navigate(`/profile/post-adoption`);
    }else{
        handleShowComponent("login");
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-center gap-4 bg-teal-50">
      
      {/* LEFT COLUMN: 2 Cards */}
      <div className="flex flex-col space-y-6">
        <div
          onClick={handleAdoption}
          className="w-[30rem] cursor-pointer flex items-center p-5 rounded-md shadow-md 
                     bg-orange-200 border-l-4 border-orange-600
                     hover:shadow-lg transition transform hover:scale-105"
        >
          <div className="flex-shrink-0 mr-4">
            <Search size={30} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-orange-700 mb-1">
              I want to adopt a pet
            </h2>
            <p className="text-gray-700 text-sm">
              Search the available dogs, cats, and rabbits, listed on PetConnect
            </p>
          </div>
        </div>

        <div
          onClick={handleRehome}
          className="w-[30rem] cursor-pointer flex items-center p-5 rounded-md shadow-md 
                     bg-teal-100 border-l-4 border-teal-600
                     hover:shadow-lg transition transform hover:scale-105"
        >
          <div className="flex-shrink-0 mr-4">
            <Home size={30} className="text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-teal-700 mb-1">
              I need to rehome my pet
            </h2>
            <p className="text-gray-700 text-sm">
              Start the process. It's free to list your pet on PetConnect
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: IMAGE */}
      <div className="flex justify-center">
        <img
          src={dogImage}
          alt="A woman hugging a dog"
          className="max-w-6xl object-cover rounded-lg shadow"
        />
      </div>
    </div>
  );
};

export default AdoptionOrRehome;
