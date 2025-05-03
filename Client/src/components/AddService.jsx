import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useNavbar } from "./NavbarContext";
import {ChevronLeft, ChevronDown, ChevronUp} from 'lucide-react';

const AddService = () => {
  const {userRole} = useNavbar();
  const [error, setError] = useState("");
  const [priceError, setPriceError] = useState('');
  const dropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [durationError, setDurationError] = useState('');
  const [expandedDays, setExpandedDays] = useState([]);

  const [formData, setFormData] = useState({
    description: "",
    price: "",
    duration: "",
    isPackage: false,
    customService: "", 
    services: [],  
    maxPets: 1, // Sitter only
    availability: [],
    deliveryMethod: "",
    startTime: "",
    endTime: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Reset form data or adjust based on userRole
    if (userRole === "vet") {
      setFormData((prevData) => ({
        ...prevData,
        maxPets: 1, // Reset fields that don't apply to vet
      }));
    } else if (userRole === "groomer") {
      setFormData((prevData) => ({
        ...prevData,
        maxPets: 1, // Reset fields that don't apply to groomer
      }));
    } else if (userRole === "sitter") {
      setFormData((prevData) => ({
        ...prevData,
      }));
    }
  }, [userRole]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
        setServiceDropdownOpen(false);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDayExpansion = (dayIndex) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const toggleService = (service) => {
    setFormData(prev => {
      const has = prev.services.includes(service);
      return {
        ...prev,
        services: has
          ? prev.services.filter(s => s !== service)
          : [...prev.services, service],
        // if user just selected “Other”, reset customService
        customService: !has && service === 'Other' ? '' : prev.customService
      };
    });
  };

  const roleServices = {
    vet: [
      "General Consultation",
      "Health Check-ups",
      "Vaccinations",
      "Microchipping",
      "Prescription Services",
      "Dental Care (Cleanings, Exams)",
      "Dentistry (Extractions, Advanced Treatments)",
      "Spaying/Neutering",
      "General Surgery",
      "Emergency Surgery",
      "Diagnostic Imaging (X-rays, Ultrasounds)",
      "Lab Tests (Bloodwork, Urinalysis)",
      "Emergency Care",
      "Other"
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
      "Other",
    ],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const val = Number(value);

    if (name === "price") {
      if(value === '' || isNaN(val)){
        setPriceError('');
      } else if (val < 500) {
        setPriceError("Price must be at least 500 PKR.");
      } else if (val > 10000) {
        setPriceError("Price must not exceed 10,000 PKR.");
      } else {
        setPriceError(""); // Clear error
      }
    }

    if (name === "duration") {
      const duration = Number(value);
      if(value === '' || isNaN(val)){
        setDurationError('');
      } else if (duration < 15 || duration > 30) {
        setDurationError("Duration must be between 15 and 45 minutes.");
      } else {
        setDurationError(""); // Clear error when valid
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleAddAvailability = () => {
    const { days, startTime, endTime, duration } = formData;
    setError("");
  
    if (!days || days.length === 0) {
      setError("Please select at least one day.");
      return;
    }
    if (!startTime) {
      setError("Please select a start time.");
      return;
    }
    if (!endTime) {
      setError("Please select an end time.");
      return;
    }
    if (!duration) {
      setError("Please enter the duration.");
      return;
    }
  
    const start = new Date(`1970-01-01T${startTime}:00`);
    let end = new Date(`1970-01-01T${endTime}:00`);
    if (end <= start) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }
  
    const slotMs = duration * 60000;
    const totalMs = end - start;
    if (slotMs > totalMs) {
      const maxMin = totalMs / 60000;
      setError(`Maximum duration is ${maxMin} minutes for that range.`);
      return;
    }
  
    const fmt = (time) => {
      const h = time.getHours();
      const m = time.getMinutes().toString().padStart(2, "0");
      const ap = h >= 12 ? "PM" : "AM";
      const hr = h % 12 || 12;
      return `${hr}:${m} ${ap}`;
    };
  
    // build the common slots array once
    const slots = [];
    let cur = start;
    while (cur < end) {
      const s = fmt(cur);
      cur = new Date(cur.getTime() + slotMs);
      if (cur > end) break;
      const e = fmt(cur);
      slots.push({ startTime: s, endTime: e });
    }
  
    // map each selected day to its own availability object
    const newAvailEntries = days.map((day) => ({
      day,
      slots,
    }));
  
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, ...newAvailEntries],
      days: [],       // clear selected days
      startTime: "",
      endTime: "",
      duration: "",
    }));
  };

  const handleDeleteSlot = (dayName, mergedSlotIndex) => {
    let currentIndex = 0;
    const updatedAvailability = formData.availability.flatMap((item) => {
      if (item.day !== dayName) return [item];
      
      const slotCount = item.slots.length;
      const isTarget = mergedSlotIndex >= currentIndex && 
                       mergedSlotIndex < currentIndex + slotCount;
      
      if (isTarget) {
        const itemSlotIndex = mergedSlotIndex - currentIndex;
        const newSlots = item.slots.filter((_, i) => i !== itemSlotIndex);
        currentIndex += slotCount;
        return newSlots.length > 0 ? [{ ...item, slots: newSlots }] : [];
      }
      
      currentIndex += slotCount;
      return [item];
    });
  
    setFormData(prev => ({ ...prev, availability: updatedAvailability }));
  };

  // inside your component, where userRole is in scope:
  const deliveryOptions = [
    // only vets get the video option
    ...(userRole === 'vet'
      ? [{
          value: 'Video Consultation',
          label: 'Video Consultation',
          description: 'Connect with clients via secure video calls.',
        }]
      : []),
    {
      value: 'In-Clinic',
      label: 'In-Clinic',
      description: 'Host pets at your clinic for appointments.',
    },
    {
      value: 'Home Visit',
      label: 'Home Visit',
      description: 'Provide on-site visits at the pet owner’s home.',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(formData.availability.length === 0){
      setError('Please add a slot');
      return;
    }
    if(formData.deliveryMethod.length === 0){
      setError('Please add a delivery method');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/auth/add-service', formData, { 
        params: { userRole },
        withCredentials: true, 
      });

      navigate('/services');
    } catch (error) {
      // Handle errors, e.g., show an error message to the user
    }
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from); 
    } else {
      navigate(-1); 
    }
  };

  const setFieldValue = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };


  return (
    <div className="max-w-4xl mx-auto bg-orange-200 mt-5 mb-10 p-8 rounded-lg shadow-lg">
      <button className='flex flex-row items-center mb-2 font-semibold hover:underline'onClick={handleBack}> 
        <ChevronLeft className="w-5 h-5"/> Back
      </button>
      <h2 className="text-2xl font-semibold text-center text-teal-600 mb-8">
        {userRole === "vet" && "Add a Veterinary Service"}
        {userRole === "groomer" && "Add a Grooming Service"}
        {userRole === "sitter" && "Add a Sitting Service"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Service Dropdown */}
          <div className="relative" ref={servicesDropdownRef}>
            <label className="block text-gray-700 font-semibold mb-2">
              Service Name
            </label>

            <button
              type="button"
                onClick={() => setServiceDropdownOpen(o => !o)}
                className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 flex justify-between items-center"
              >
                Select one or more services
                {serviceDropdownOpen ? (
                  <ChevronUp className="ml-2 h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="ml-2 h-5 w-5 text-gray-600" />
                )}
            </button>

            {/* Dropdown list */}
            {serviceDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {(roleServices[userRole] || []).map(service => (
                  <label
                    key={service}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-teal-600 mr-2"
                      checked={formData.services.includes(service)}
                      onChange={() => toggleService(service)}
                    />
                    <span>{service}</span>
                  </label>
                ))}

                {formData.services.includes('Other') && (
                  <div className="px-4 py-2 border-t border-gray-200">
                    <input
                      type="text"
                      name="customService"
                      value={formData.customService}
                      onChange={handleInputChange}
                      placeholder="Describe your custom service"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Render selected services below */}
            {formData.services.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.services.map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Price</label>
            <input
            type="number"
            name="price"
            min="500"
            max="5000"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
            />
            <small className="text-gray-500">
              The amount you want to charge for the session.
            </small>
            {priceError && (
              <p className="text-red-500 text-sm mt-1">{priceError}</p>
            )}
          </div>
          {/* Delivery Methods */}
          <div className="mt-6">
            <label className="block text-gray-700 font-semibold mb-2">
              How will you deliver these services?
            </label>
            <div className="flex flex-col space-y-3">
              {deliveryOptions.map(opt => (
                <label
                  key={opt.value}
                  className="flex items-start px-4 py-2 border bg-white border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="delivery-method"
                    className="form-radio h-5 w-5 accent-teal-600 mt-1"
                    checked={formData.deliveryMethod === opt.value}
                    onChange={() => setFieldValue('deliveryMethod', opt.value)}
                  />
                  <div className="ml-3">
                    <span className="font-medium text-teal-700">{opt.label}</span>
                    <p className="text-gray-500 text-sm">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what’s included in your service"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows="4"
          />
          <small className="text-gray-500">
            Briefly explain benefits or what’s covered.
          </small>
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
                  max="45"
                  step="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-auto" 
              />
              <small className="text-gray-500">
                E.g. 30 for a half-hour session.
              </small>
              {durationError && (
                <p className="text-red-500 text-sm mt-1">{durationError}</p>
              )}
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
                    <small className="text-gray-500">
                How many pets can you look after at once?
              </small>

                </div>
            )}
         
        </div>
        <div>
          <h3 className="text-lg font-semibold text-teal-600 mb-4">Add Availability</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-gray-700 font-semibold mb-2">Day(s)</label>
              
              {/* Dropdown Trigger */}
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer bg-white"
              >
                {formData.days && formData.days.length > 0
                  ? formData.days.includes("All Days")
                    ? "All Days"
                    : formData.days.join(", ")
                  : "Select Days"}
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {/* Select All Option */}
                  <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.days?.length === 7}
                      onChange={() => {
                        if (formData.days?.length === 7) {
                          setFormData({ ...formData, days: [] });
                        } else {
                          setFormData({ ...formData, days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] });
                        }
                      }}
                      className="mr-2"
                    />
                    Select All
                  </label>

                  {/* Individual Day Options */}
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <label key={day} className="flex items-center px-4 py-2 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.days?.includes(day)}
                        onChange={() => {
                          const selectedDays = formData.days || [];
                          if (selectedDays.includes(day)) {
                            setFormData({ ...formData, days: selectedDays.filter(d => d !== day) });
                          } else {
                            setFormData({ ...formData, days: [...selectedDays, day] });
                          }
                        }}
                        className="mr-2"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              )}
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
            <h4 className="text-lg font-semibold text-orange-600 mb-4">Availability Slots</h4>
            <div className="space-y-3">
              {Object.entries(
                formData.availability.reduce((acc, item) => {
                  if (!acc[item.day]) acc[item.day] = [];
                  acc[item.day].push(...item.slots);
                  return acc;
                }, {})
              ).map(([day, slots]) => {
                if (slots.length === 0) return null;

                // Function to merge contiguous slots
                const mergedBlocks = (() => {
                  const parseTime = timeStr => {
                    const [time, modifier] = timeStr.split(' ');
                    let [h, m] = time.split(':');
                    h = parseInt(h);
                    m = parseInt(m);
                    if (modifier === 'PM' && h !== 12) h += 12;
                    if (modifier === 'AM' && h === 12) h = 0;
                    return h * 60 + m;
                  };

                  const formatTime = minutes => {
                    const h = Math.floor(minutes / 60);
                    const m = minutes % 60;
                    const modifier = h >= 12 ? 'PM' : 'AM';
                    const hr = h % 12 || 12;
                    return `${hr}:${m.toString().padStart(2, '0')} ${modifier}`;
                  };

                  const sorted = [...slots]
                    .map(s => ({ start: parseTime(s.startTime), end: parseTime(s.endTime) }))
                    .sort((a, b) => a.start - b.start);

                  let merged = [];
                  let current = sorted[0];
                  
                  for (let i = 1; i < sorted.length; i++) {
                    const next = sorted[i];
                    if (next.start <= current.end) {
                      current.end = Math.max(current.end, next.end);
                    } else {
                      merged.push(current);
                      current = next;
                    }
                  }
                  merged.push(current);

                  return merged.map(b => ({
                    startTime: formatTime(b.start),
                    endTime: formatTime(b.end)
                  }));
                })();

                return (
                  <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDayExpansion(day);
                      }}
                    >
                      <div className="flex items-center gap-x-3">
                        <span className="text-teal-700 font-semibold">{day}</span>
                        <div className="flex flex-wrap items-center gap-x-1">
                          {mergedBlocks.map((block, i) => (
                            <React.Fragment key={i}>
                              <span className="text-gray-500 text-sm">
                                {block.startTime} - {block.endTime}
                              </span>
                              {i < mergedBlocks.length - 1 && (
                                <span className="text-sm font-bold text-orange-700 mx-2">
                                  and
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-600 transform transition-transform ${
                          expandedDays[day] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {expandedDays[day] && (
                      <ul className="px-4 pb-3 space-y-2">
                        {slots.map((slot, slotIndex) => (
                          <li
                            key={slotIndex}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                          >
                            <span className="text-gray-600 text-sm">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteSlot(day, slotIndex);
                              }}
                              className="text-red-400 hover:text-red-600 focus:outline-none text-sm"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {error && (
          <p className="text-red-600 text-center text-md font-medium mt-4">
            {error}
          </p>
        )}
        <div className="flex justify-center">
        <button
          type="submit"
          className="w-1/3 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white text-lg font-semibold rounded-lg hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-700"
        >
          Save Service
        </button>
        </div>
        
      </form>
    </div>
  );
};

export default AddService;
