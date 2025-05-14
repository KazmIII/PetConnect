import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';

export default function AdoptionApplicationDetail() {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch the application details when the component mounts.
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/adoption-applications/${applicationId}`);
        setApplication(response.data.application);
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  // Handler for when the "Interested" button is clicked.
  const handleInterestedClick = async () => {
    try {
      // Simulate a successful status update:
      setStatusMessage('We will change your pet status to pending.');
    } catch (error) {
      console.error('Error updating pet status:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg font-medium">Loading application details...</div>;
  }

  if (!application) {
    return <div className="text-center mt-8 text-lg">Application not found.</div>;
  }

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1); 
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto bg-orange-200 rounded-lg shadow-lg p-6">
        <button className='flex flex-row items-center mb-2 text-gray-700 font-semibold hover:underline'onClick={handleBack}> 
            <ChevronLeft className="w-5 h-5"/> Back
        </button>
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-700">Adoption Application Details</h1>
        
        {/* Adopter Information */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Adopter Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Name:</strong> {application.adopter.fullName}</p>
            <p><strong>Email:</strong> {application.adopter.email}</p>
            <p><strong>City:</strong> {application.adopter.city}</p>
            <p><strong>Over 18:</strong> {application.adopter.over18 ? 'Yes' : 'No'}</p>
          </div>
        </section>
        
        {/* Home Details */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Home Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Living Situation:</strong> {application.homeDetails.livingSituation}</p>
            <p><strong>Household Setting:</strong> {application.homeDetails.householdSetting}</p>
            {application.homeDetails.landlordPermission && (
              <p><strong>Landlord Permission:</strong> {application.homeDetails.landlordPermission}</p>
            )}
            {application.homeDetails.activityLevel && (
              <p><strong>Activity Level:</strong> {application.homeDetails.activityLevel}</p>
            )}
          </div>
          {application.homeDetails.homeImages && application.homeDetails.homeImages.length > 0 && (
            <div className="mt-4">
              <strong className="block mb-2">Home Images:</strong>
              <ul className="flex flex-wrap gap-2">
                {application.homeDetails.homeImages.map((img, index) => (
                  <li key={index}>
                    <img 
                      src={img} 
                      alt={`Home image ${index + 1}`} 
                      className="w-32 h-32 object-cover rounded border"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
        
        {/* Family Details */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Family Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Number of Adults:</strong> {application.familyDetails.numberOfAdults}</p>
            {application.familyDetails.numberOfKids !== undefined && (
              <p><strong>Number of Kids:</strong> {application.familyDetails.numberOfKids}</p>
            )}
            {application.familyDetails.youngestChildAge !== undefined && (
              <p><strong>Youngest Child Age:</strong> {application.familyDetails.youngestChildAge}</p>
            )}
            <p><strong>Visiting Children:</strong> {application.familyDetails.visitingChildren ? 'Yes' : 'No'}</p>
            <p><strong>Flatmates:</strong> {application.familyDetails.flatmates ? 'Yes' : 'No'}</p>
            <p><strong>Pet Allergies:</strong> {application.familyDetails.petAllergies ? 'Yes' : 'No'}</p>
            {application.familyDetails.otherAnimals && (
              <p><strong>Other Animals:</strong> {application.familyDetails.otherAnimals}</p>
            )}
          </div>
        </section>
        
        {/* Lifestyle */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Lifestyle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Description:</strong> {application.lifestyle.description}</p>
            <p><strong>Moving Soon:</strong> {application.lifestyle.movingSoon ? 'Yes' : 'No'}</p>
            <p><strong>Holidays Planned:</strong> {application.lifestyle.holidaysPlanned ? 'Yes' : 'No'}</p>
            <p><strong>Own Transport:</strong> {application.lifestyle.ownTransport ? 'Yes' : 'No'}</p>
          </div>
        </section>
        
        {/* Experience */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Experience</h2>
          <p>{application.experience.description}</p>
        </section>
        
        {/* Submitted Date */}
        <div className="text-gray-600 text-sm mb-8">
          <p><strong>Submitted At:</strong> {new Date(application.submittedAt).toLocaleString()}</p>
        </div>
        
        {/* Interested Button */}
        {/* <div className="text-center">
          <button 
            onClick={handleInterestedClick} 
            className="px-6 py-3 bg-lime-700 text-white font-semibold rounded hover:bg-lime-800 transition duration-200"
          >
            Interested
          </button>
          {statusMessage && (
            <p className="mt-4 text-green-600 font-medium">{statusMessage}</p>
          )}
        </div> */}
      </div>
    </div>
  );
}
