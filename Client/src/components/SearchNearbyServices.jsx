import { useState } from 'react';

const SearchNearbyServices = () => {
  const [cityOpen, setCityOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Enter locality or city');
  const [selectedService, setSelectedService] = useState('Search for doctors, hospitals, specialties, services, diseases');

  const cities = ['Lahore', 'Lahore Road Pindi Bhattian, Hafizabad', 'Lahore Cantt, Lahore'];
  const services = ['Consultation', 'Grooming', 'Sitting', 'Pet Care'];

  return (
    <div className="relative w-full max-w-xl mx-auto mt-8">
      {/* Main Search Container */}
      <div className="bg-white p-4 rounded-md shadow-lg">
        {/* City Search */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600">Enter locality or city</label>
          <div
            className="flex justify-between items-center border border-gray-300 rounded-md p-2 cursor-pointer"
            onClick={() => setCityOpen(!cityOpen)}
          >
            <span>{selectedCity}</span>
            <span className="text-blue-500">▼</span>
          </div>

          {/* City Dropdown */}
          {cityOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-md mt-1 z-10">
              <ul className="max-h-40 overflow-y-auto">
                {cities.map((city, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedCity(city);
                      setCityOpen(false);
                    }}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Service Search */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600">Search for services</label>
          <div
            className="flex justify-between items-center border border-gray-300 rounded-md p-2 cursor-pointer"
            onClick={() => setServiceOpen(!serviceOpen)}
          >
            <span>{selectedService}</span>
            <span className="text-blue-500">▼</span>
          </div>

          {/* Service Dropdown */}
          {serviceOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-md mt-1 z-10">
              <ul className="max-h-40 overflow-y-auto">
                {services.map((service, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedService(service);
                      setServiceOpen(false);
                    }}
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button className="bg-blue-500 text-white w-full py-2 rounded-md mt-4">
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchNearbyServices;
