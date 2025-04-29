import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const Vets = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/auth/vets', {
          withCredentials: true,
        });
        setVets(data.vets);
      } catch (err) {
        console.error('Failed to load vets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVets();
  }, []);

  if (loading) return <p className="text-center py-10">Loading vets…</p>;
  if (!vets.length) return <p className="text-center py-10">No vets found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {vets.length} Best Veterinarians available for video consultation
      </h1>
      <p className="text-gray-600 mb-6">
        Also known as Animal Specialist, Pet Doctor, and Veterinary Physician
      </p>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          Doctors Near Me
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          Most Experienced
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          Lowest Fee
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          Highest Rated
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          Available Today
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          Discounts
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap">
          Video Consultative
        </button>
      </div>

      <div className="space-y-6">
        {vets.map((vet) => (
          <div key={vet._id} className="bg-gray-100 border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{vet.name}</h2>
                <p className="text-sm text-gray-600">{vet.specialization || 'Veterinarian'}</p>
                <p className="text-sm text-gray-600 mt-1">{vet.qualifications || 'DVM (Doctor of Veterinary Medicine)'}</p>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {vet.yearsOfExperience || '5'} Years Experience
                  </p>
                  <p className="text-sm text-gray-600">
                    97% (421) Satisfied Patients
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <Link
                  to={`/video-consultation/vet/${vet._id}`}
                  className="px-4 py-3 w-48 bg-white font-semibold rounded-sm text-teal-800 border border-teal-800 text-xs hover:bg-teal-700 hover:text-white transition flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Video Consultation
                </Link>
                <button className="px-4 py-3 w-48 bg-orange-600 text-white text-sm rounded-sm hover:bg-orange-500 transition">
                  Book Appointment
                </button>
              </div>
            </div>

            <Link
              to={`/video-consultation/vet/${vet._id}`}
              className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 justify-between items-center hover:bg-gray-100 block"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Online Video Consultation</span>
                <span className="flex items-center text-sm text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                  Online
                </span>
                <span className="text-sm text-gray-500">15 - 30 Min Wait Time</span>
              </div>
              <span className="font-semibold">Rs. {vet.services?.[0]?.price || '1,400'}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vets;