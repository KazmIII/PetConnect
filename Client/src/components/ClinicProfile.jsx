import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClinicProfile = () => {
  const [clinicData, setClinicData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/clinic/profile', {
            withCredentials: true,
        });
        console.log("fetched clinic data:", response.data);
        setClinicData(response.data.clinic); // assuming response.data.clinic is the clinic object
      } catch (error) {
        console.error('Error fetching clinic data:', error);
      }
    };

    fetchClinicData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      await axios.put('/api/clinic/profile', formData);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // If clinicData is not available, show a loading state
  if (!clinicData) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-5 bg-teal-500 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-black mb-6">Clinic Profile</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
          <input
            type="text"
            value={clinicData.clinicName || ''}
            disabled
            className="mt-1 p-2 w-full bg-gray-100 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={clinicData.city || ''}
            disabled
            className="mt-1 p-2 w-full bg-gray-100 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={clinicData.address || ''}
            disabled
            className="mt-1 p-2 w-full bg-gray-100 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            value={isEditing ? formData.phone : clinicData.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={isEditing ? formData.email : clinicData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        {isEditing && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-md"
              />
            </div>
          </>
        )}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handleEditToggle}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default ClinicProfile;
