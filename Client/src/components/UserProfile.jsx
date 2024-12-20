import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import { Eye, EyeOff } from 'lucide-react';
import { useNavbar } from './NavbarContext';

const UserProfile = () => {
  const {handleShowComponent, userRole} = useNavbar();
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
          const response = await axios.get('http://localhost:5000/auth/user/profile', {
          params: { userRole },  // Passing role as query parameter
          withCredentials: true,
        });
    
        setUserData(response.data.user);
        setFormData({
          phone: response.data.user.phone || '',
          email: response.data.user.email || '',
          password: '',
          confirmPassword: '',
          name: response.data.user.name || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!validateEmail(formData.email)) {
      setError('Invalid email format.');
      return;
    }

    try {
      setIsLoading(true);

      await axios.put('http://localhost:5000/auth/user/update-profile', formData, { params: { userRole }, withCredentials: true, });
      setIsEditing(false);
      if(formData.email !== userData.email){
        handleShowComponent('verifyOTP', 'email', formData.email, '', userRole, true);
      }
      setError('');
      setUserData({
        ...userData,
        phone: formData.phone,
        email: formData.email,
        name: formData.name,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(''); // Clear errors when toggling edit mode
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({...formData, [name]: value, });

    if (name === 'phone') {
        if (!/^03\d{9}$/.test(value)) {
          setError("Invalid phone number format. Example: 03001234567");
        } else {
          setError(""); // Clear error if the phone number is valid
        }
    }

    if (name === 'password') {
      if (value.length === 0) {
        setError('');
      } else if (value.length < 6) {
        setError('Password must be at least 6 characters long.');
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        setError('Password must contain at least one special character.');
      } else {
        setError('');
      }
    }

    if (name === 'confirmPassword') {
      if(value.length === 0){
        setError('')
      } else if (value !== formData.password) {
        setError('Passwords do not match.');
      } else {
        setError('');
      }
    }

    if (name === 'email') {
      if (!validateEmail(value)) {
        setError('Invalid email format.');
      } else {
        setError('');
      }
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-5 bg-orange-200 shadow-lg rounded-lg">
    {!userData ? (
      <div className="flex justify-center items-center p-4 m-20">
        <Spinner />
      </div>
    ) : (
        <>
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Profile</h2>
        <div className="max-w-2xl mx-auto">
            <div>
            <label className="block text-md font-medium text-black">Name</label>
            <input
                type="text"
                name='name'
                value={isEditing ? formData.name : userData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 mb-4 p-2 w-full bg-white border rounded-md"
            />
            </div>
            <div>
            <label className="block text-md font-medium text-black">Phone</label>
            <input
                type="number"
                name="phone"
                value={isEditing ? formData.phone : userData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 mb-4  p-2 w-full bg-white border rounded-md"
            />
            </div>
            <div>
            <label className="block text-md font-medium text-black">Email</label>
            <input
                type="email"
                name="email"
                value={isEditing ? formData.email : userData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 mb-4  p-2 w-full bg-white border rounded-md"
            />
            </div>
            {isEditing && (
            <>
                <div>
                <label className="block text-md font-medium text-black">Password</label>
                <div className="relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 mb-4  p-2 w-full bg-white border rounded-md"
                    />
                    <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center"
                    >
                    {showPassword ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
                    </button>
                </div>
                </div>
                <div>
                <label className="block text-md font-medium text-black">Confirm Password</label>
                <div className="relative">
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="mt-1 mb-4  p-2 w-full bg-white border rounded-md"
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-3 flex items-center"
                        >
                        {showPassword ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
                    </button>
                </div>
                </div>
            </>
            )}
        </div>
        {error && <p className="text-red-500 text-md text-center mt-1">{error}</p>}
        <div className="max-w-2xl mx-auto mt-6 flex justify-between items-center">
        <button
            onClick={handleEditToggle}
            className={`px-4 py-2 w-1/3 text-white rounded-lg ${
                isEditing
                ? 'bg-gray-500 hover:bg-gray-600' // Styles for "Cancel"
                : 'bg-gradient-to-r from-orange-500 to-orange-800 hover:from-orange-400 hover:to-orange-700' // Styles for "Edit Profile"
            }`}
            >
            {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>

            {isEditing && (
            <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 w-1/3 bg-gradient-to-r from-teal-500 to-teal-800 hover:from-teal-400 hover:to-teal-700 text-white rounded-lg"
            >
                {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            )}
        </div>
        </>
    )}
    </div>
  );
};

export default UserProfile;
