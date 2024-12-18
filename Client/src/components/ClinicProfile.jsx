import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from './Spinner';

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
        console.log('fetched clinic data:', response.data);
        setClinicData(response.data.clinic);
        setFormData({
          phone: response.data.clinic.phone,
          email: response.data.clinic.email,
          password: '', // Password should remain empty until editing
          confirmPassword: '',
        });
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

  if (!clinicData) return <div><Spinner className="flex p-4 m-20 justify-center items-center" /></div>;

  return (
    <div className="max-w-4xl mx-auto my-10 p-5 bg-teal-500 shadow-lg rounded-lg ">
      <h2 className="text-2xl font-bold text-black mb-6 text-center">Clinic Profile</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-md font-medium text-black">Clinic Name</label>
          <input
            type="text"
            value={clinicData.clinicName || ''}
            disabled
            className={`mt-1 p-2 w-full rounded-md ${isEditing ? 'bg-teal-100' : 'bg-white'}`}
          />
        </div>
        <div>
          <label className="block text-md font-medium text-black">City</label>
          <input
            type="text"
            value={clinicData.city || ''}
            disabled
            className={`mt-1 p-2 w-full rounded-md ${isEditing ? 'bg-teal-100' : 'bg-white'}`}
          />
        </div>
        <div>
          <label className="block text-md font-medium text-black">Address</label>
          <input
            type="text"
            value={clinicData.address || ''}
            disabled
            className={`mt-1 p-2 w-full rounded-md ${isEditing ? 'bg-teal-100' : 'bg-white'}`}
          />
        </div>
        <div>
          <label className="block text-md font-medium text-black">Phone</label>
          <input
            type="text"
            name="phone"
            value={isEditing ? formData.phone : clinicData.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="mt-1 p-2 w-full bg-white border rounded-md"
          />
        </div>
        <div>
          <label className="block text-md font-medium text-black">Email</label>
          <input
            type="email"
            name="email"
            value={isEditing ? formData.email : clinicData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="mt-1 p-2 w-full bg-white border rounded-md"
          />
        </div>
        {isEditing && (
          <>
            <div>
              <label className="block text-md font-medium text-black">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full bg-white border rounded-md"
              />
            </div>
            <div>
              <label className="block text-md font-medium text-black">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full bg-white border rounded-md"
              />
            </div>
          </>
        )}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handleEditToggle}
          className="px-4 py-2 w-1/3 bg-gradient-to-r from-orange-500 to-orange-800 text-white rounded-lg"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            className="px-4 py-2 w-1/3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default ClinicProfile;
