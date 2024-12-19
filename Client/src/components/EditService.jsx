import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { useNavbar } from './NavbarContext';
import Spinner from './Spinner'; 
import {ChevronLeft} from 'lucide-react';

const EditService = () => {
  const { userRole } = useNavbar();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);  // Add loading state
  const [formData, setFormData] = useState({
    serviceName: "",
    customService: "",
    description: "",
    price: "",
    duration: "",
    isPackage: false,
    maxPets: 1, // Sitter only
    availability: [],
    day: "",
    startTime: "",
    endTime: "",
  });

  const roleServices = {
    vet: [
      "General Consultation",
      "Vaccinations",
      "Surgery",
      "Emergency Care",
      "Health Check-ups",
      "Microchipping",
      "Dental Care",
      "Spaying/Neutering",
      "Diagnostic Imaging (X-rays, Ultrasounds)",
      "Lab Tests (Blood tests, Urinalysis)",
      "Prescription Services",
    ],
    groomer: [
      "Bathing",
      "Nail Trimming",
      "Haircuts/Styling",
      "Ear Cleaning",
      "Flea & Tick Treatment",
      "Deshedding Services",
      "Anal Gland Cleaning",
      "Teeth Brushing",
      "Full Grooming Packages",
      "Other",
    ],
    sitter: [
      "Pet Sitting at Home",
      "Boarding Services",
      "Walking Services",
      "Feeding & Medication Administration",
      "Playtime & Exercise",
      "Overnight Stay",
      "House Visits",
      "Special Needs Care (e.g., senior or disabled pets)",
    ],
  };

  const { serviceId } = useParams();  // Get the service ID from the URL
  const navigate = useNavigate();

  // Fetch the service details when the component mounts
  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);  // Set loading to true when fetching starts
      try {
        const response = await axios.get(`http://localhost:5000/auth/service/${serviceId}`, {
          params: { userRole },
          withCredentials: true,
        });
  
        // Ensure you're accessing 'data' within the response structure
        const service = response.data.data;
  
        // Set the formData with the correct response data
        setFormData({
          serviceName: service.serviceName || "",  
          description: service.description || "",
          customService: service.customService || "",
          price: service.price || "",
          duration: service.duration || "",
          isPackage: service.isPackage || false,
          maxPets: service.maxPets,
          availability: service.availability || [],
          day: service.availability[0]?.day || "",  // Assuming availability is an array
          startTime: service.availability[0]?.slots[0]?.startTime || "",  
          endTime: service.availability[0]?.slots[0]?.endTime || "",  
        });
  
      } catch (error) {
        console.error("Error fetching service:", error);
        setError("Error fetching service data.");
      } finally {
        setLoading(false);  // Set loading to false once fetching is done
      }
    };
  
    fetchService();
  }, [serviceId]);
  

  const handleInputChange = (e) => {
    setError('');
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "startTime" || name === "endTime" 
      ? convertTo24HourFormat(value) // Ensure time is saved in 24-hour format
      : value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const convertTo24HourFormat = (time12h) => {
    const [time, modifier] = time12h.split(" ");
  
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }
  
    return `${hours}:${minutes}`;
  };
  
  const handleAddAvailability = () => {
    const { day, startTime, endTime, duration } = formData;
  
    if (!day || !startTime || !endTime || !duration) {
      setError("Please fill out all fields.");
      return;
    }
  
    const start = new Date(`1970-01-01T${startTime}:00`);
    let end = new Date(`1970-01-01T${endTime}:00`);
  
    // Handle overnight cases (e.g., 10 PM to 12 AM)
    if (end <= start) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours to the end time
    }
  
    const minDuration = duration * 60000; // Convert duration to milliseconds
  
    const totalTime = end - start; // Total time in milliseconds
    const maxDuration = totalTime / 60000; // Convert to minutes
  
    if (minDuration > totalTime) {
      setError(
        `The selected duration is too large. The maximum allowable duration is ${maxDuration} minutes for the selected time range.`
      );
      return;
    }
  
    const formatTimeWithAMPM = (time) => {
      const hours = time.getHours();
      const minutes = time.getMinutes().toString().padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Convert 0 hour to 12 for 12-hour format
      return `${formattedHours}:${minutes} ${period}`;
    };
  
    const slots = [];
    let currentTime = start;
  
    while (currentTime < end) {
      const slotStart = formatTimeWithAMPM(currentTime);
      currentTime = new Date(currentTime.getTime() + minDuration);
      if (currentTime > end) break; // Avoid creating an incomplete slot
      const slotEnd = formatTimeWithAMPM(currentTime);
      slots.push({ startTime: slotStart, endTime: slotEnd });
    }
  
    setFormData((prevData) => ({
      ...prevData,
      availability: [...prevData.availability, { day, slots }],
      day: "",
      startTime: "",
      endTime: "",
      duration: "",
    }));
    setError("");
  };

  const handleDeleteSlot = (dayIndex, slotIndex) => {
    const updatedAvailability = formData.availability.map((item, index) => {
      if (index === dayIndex) {
        return {
          ...item,
          slots: item.slots.filter((_, sIndex) => sIndex !== slotIndex),
        };
      }
      return item;
    }).filter(item => item.slots.length > 0);

    setFormData((prevData) => ({
      ...prevData,
      availability: updatedAvailability,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put( `http://localhost:5000/auth/edit-service/${serviceId}`,
        formData,
        {  params: { userRole }, withCredentials: true }
      );
      navigate('/services');  // Redirect to services page after successful update
    } catch (error) {
      console.error('Error updating service:', error.response?.data || error.message);
      setError('Failed to update the service.');
    }
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from); 
    } else {
      navigate(-1); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-orange-200 mt-5 mb-10 p-8 rounded-lg shadow-lg">
      {loading ? (
        <div className="flex justify-center items-center p-4 m-20">
          <Spinner />  {/* Show spinner while loading */}
        </div>
      ) : (
        <>
            <button className='flex flex-row items-center mb-2 font-semibold hover:underline'onClick={handleBack}> 
                <ChevronLeft className="w-5 h-5"/> Back
            </button>
            <h2 className="text-2xl font-semibold text-center text-teal-600 mb-8">
            {userRole === "vet" && "Edit Veterinary Service"}
            {userRole === "groomer" && "Edit Grooming Service"}
            {userRole === "sitter" && "Edit Sitting Service"}
            </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Service Name */}
                <div>
                <label className="block text-gray-700 font-semibold mb-2">Service Name</label>
                <select
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                >
                    <option value="">Select a Service</option>
                    {roleServices[userRole]?.map((service) => (
                    <option key={service} value={service}>
                        {service}
                    </option>
                    ))}
                </select>
                </div>

                {formData.serviceName === "Other" && (
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                    Custom Service Name
                    </label>
                    <input
                    type="text"
                    name="customService"
                    value={formData.customService}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter the service name"
                    required
                    />
                </div>
                )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                <label className="block text-gray-700 font-semibold mb-2">Duration (minutes)</label>
                <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="10"
                    step="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-auto" 
                />
                </div>
                {userRole === 'groomer' && (
                <div>
                    <label className="block text-gray-700 font-semibold my-2">Package Service?</label>
                    <input
                    type="checkbox"
                    name="isPackage"
                    checked={formData.isPackage}
                    onChange={handleCheckboxChange}
                    className="w-5 h-5 text-teal-500 focus:ring-teal-500"
                    />
                </div>
                )}
                 {userRole === 'sitter' && (
                    <div>
                        <label className="block text-gray-700 font-semibold my-2">Maximum Number of Pets</label>
                        <input
                        type="number"
                        name="maxPets"
                        value={formData.maxPets}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                )}
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-lg font-semibold text-teal-600 mb-4">Availability</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                <label className="block text-gray-700 font-semibold mb-2">Day</label>
                <select
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">Select Day</option>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                    (day) => (
                        <option key={day} value={day}>
                        {day}
                        </option>
                    )
                    )}
                </select>
                </div>
                <div>
                <label className="block text-gray-700 font-semibold mb-2">Start Time</label>
                <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                </div>
                <div>
                <label className="block text-gray-700 font-semibold mb-2">End Time</label>
                <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                </div>
                </div>
                <button
                    type="button"
                    onClick={handleAddAvailability}
                    className="w-1/4 mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    Add Slot
                </button>
            </div>
            {formData.availability.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-orange-600">Availability Slots</h4>
                    {formData.availability.map((item, dayIndex) => (
                    <div key={dayIndex} className="mt-4">
                        <p className="text-teal-700 font-bold">{item.day}</p>
                        <ul className="mt-2 space-y-2">
                        {item.slots.map((slot, slotIndex) => (
                            <li
                            key={slotIndex}
                            className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg shadow-md"
                            >
                            <span className="text-gray-600">
                                {slot.startTime} - {slot.endTime}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    handleDeleteSlot(dayIndex, slotIndex);
                                }}
                                className="text-red-500 hover:text-red-700 focus:outline-none"
                            >
                                Delete
                            </button>
                            </li>
                        ))}
                        </ul>
                    </div>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && <p className="text-red-600 text-center text-md font-medium mt-4">{error}</p>}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/3 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white text-lg font-semibold rounded-lg hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-700"
              >
                Save
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default EditService;
