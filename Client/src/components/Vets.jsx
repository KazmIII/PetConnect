import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Video, MapPin, Home, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Spinner from "./Spinner.jsx";

const Vets = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { serviceType: routeServiceType } = useParams();
  const [searchParams] = useSearchParams();
  const initialServiceTypes = useMemo(() => {
    const queryTypes = searchParams.getAll('serviceType');
    // Combine route param with query params, removing duplicates
    return routeServiceType 
      ? [...new Set([routeServiceType, ...queryTypes])]
      : queryTypes;
  }, [routeServiceType, searchParams]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState(initialServiceTypes);
  const [city, setCity] = useState(searchParams.get('city') || '');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalServices, setModalServices] = useState([]);
  const [modalVetId, setModalVetId] = useState(null);
  const [modalVetName, setModalVetName] = useState('');
  const [modalClinicName, setModalClinicName] = useState('');
  const [modalClinicCity, setModalClinicCity] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const queryTypes = searchParams.getAll('serviceType').filter(Boolean);
    const newTypes = [...new Set([routeServiceType, ...queryTypes].filter(Boolean))];
    setSelectedServiceTypes(newTypes);
  }, [routeServiceType, searchParams]);

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

  const getDeliveryMethod = (serviceType) => {
    switch (serviceType) {
      case 'video-consultation':
        return 'Video Consultation';
      case 'in-clinic':
        return 'In-Clinic';
      case 'home-visit':
        return 'Home Visit';
      default:
        return '';
    }
  };

  const filteredVets = useMemo(() => {
    const activeTypes = selectedServiceTypes.length > 0 
      ? selectedServiceTypes 
      : ['video-consultation']; // Default to video consultation

    return vets.filter(vet => {
      const hasService = activeTypes.some(type => {
        const method = getDeliveryMethod(type);
        return vet.services?.some(s => s.deliveryMethod === method);
      });

      const needsCityCheck = activeTypes.includes('in-clinic') && city;
      const cityMatch = needsCityCheck
        ? vet.clinicId?.city?.toLowerCase() === city.toLowerCase()
        : true;

      return hasService && cityMatch;
    });
  }, [vets, selectedServiceTypes, city]);


  const handleFilter = (type) => {
    const currentTypes = [...selectedServiceTypes];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];

    // Determine URL structure
    let path = '';
    const params = new URLSearchParams();
    
    // Handle service types
    const hasRouteParam = newTypes.length === 1 && !routeServiceType;
    if (newTypes.length === 1) {
      path = `/vets/${newTypes[0]}`;
    } else if (newTypes.length > 1) {
      newTypes.forEach(t => params.append('serviceType', t));
    }

    // Handle city parameter
    if (city) params.set('city', city);

    // Clean up empty parameters
    Array.from(params.entries()).forEach(([key, value]) => {
      if (!value) params.delete(key);
    });

    navigate(`${path}${params.toString() ? `?${params.toString()}` : ''}`);
  };
  
  const isActive = (type) => {
    return selectedServiceTypes.includes(type);
  };

  const handleBookClick = (vet) => {
    const services = vet.services || [];
    if (services.length === 1) {
      const svc = services[0];
      let path = '';
      if (svc.deliveryMethod === 'Video Consultation') {
        path = `/consultation/video-consultation/vet/${vet._id}`;
      } else if (svc.deliveryMethod === 'In-Clinic') {
        path = `/consultation/in-clinic/vet/${vet._id}`;
      } else if (svc.deliveryMethod === 'Home Visit') {
        path = `/consultation/home-visit/vet/${vet._id}`;
      }
      navigate(path);
    } else {
      setModalServices(services);
      setModalVetId(vet._id);
      setModalVetName(vet.name);
      setModalClinicName(vet.clinicId.clinicName);
      setModalClinicCity(vet.clinicId.city);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-medium text-gray-800 mb-2">
        {filteredVets.length} Best Veterinarians available for video consultation
      </h1>
      <p className="text-gray-700 mb-6 text-xs">
        Also known as Animal Specialist, Pet Doctor, and Veterinary Physician
      </p>

      <div className="max-w-[58rem] flex gap-2 mb-6 text-xs font-medium text-lime-700 overflow-x-auto pb-2">
        <button className="px-3 bg-white border border-lime-700 rounded-full whitespace-nowrap">
          Doctors Near Me
        </button>
        <button className="px-3 py-2 bg-white border border-lime-700 rounded-full whitespace-nowrap">
          Most Experienced
        </button>
        <button className="px-3 bg-white border border-lime-700 rounded-full whitespace-nowrap">
          Lowest Fee
        </button>
        <button className="px-3 bg-white border border-lime-700 rounded-full whitespace-nowrap">
          Highest Rated
        </button>
        <button className="px-3 bg-white border border-lime-700 rounded-full whitespace-nowrap">
          Available Today
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${isActive('video-consultation')
              ? 'bg-lime-200 '
              : 'bg-white'
            }`}
          onClick={() => handleFilter('video-consultation')}
        >
          Video Consultation
        </button>

        <button className="px-3 bg-white border border-lime-700 rounded-full whitespace-nowrap">
          Online Now
        </button>
      </div>

      {loading ? (
        <Spinner className="text-center py-4" />
      ) : (
        <div className="space-y-6">
          {filteredVets.map((vet) => (
            <div
              key={vet._id}
              className="max-w-[58rem] bg-white border border-gray-200 rounded-lg p-6 shadow-md shadow-gray-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg text-gray-800">Dr. {vet.name}</h2>
                  <p className="text-sm text-gray-600">
                    {vet.specialization || 'Veterinarian'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {vet.qualifications ||
                      'DVM (Doctor of Veterinary Medicine)'}
                  </p>
                  <div className="mt-6 flex gap-8">
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {vet.yearsOfExperience || '10'} Years
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Experience
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <Link
                    to={`/consultation/video-consultation/vet/${vet._id}`}
                    className="px-4 py-3 w-48 bg-white font-semibold rounded-sm text-teal-800 border border-teal-800 text-xs hover:bg-teal-700 hover:text-white transition flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Video Consultation
                  </Link>
                  <button
                    onClick={() => handleBookClick(vet)}
                    className="px-4 py-3 w-48 bg-orange-600 text-white text-sm rounded-sm hover:bg-orange-500 transition"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto mt-4 pb-2">
                {vet.services?.some(
                  (s) => s.deliveryMethod === 'Video Consultation'
                ) && (
                  <Link
                    to={`/consultation/video-consultation/vet/${vet._id}`}
                    className="min-w-[18rem] p-3 rounded-md border border-teal-800 hover:bg-gray-100 block"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-teal-700" />
                          <span className="font-medium text-gray-700 text-sm">
                            Online Video Consultation
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-xs text-green-600">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                          Available today
                        </span>
                        <span className="font-normal text-xs">
                          Rs.{' '}
                          {
                            vet.services.find(
                              (s) => s.deliveryMethod === 'Video Consultation'
                            )?.price
                          }
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {vet.services?.some((s) => s.deliveryMethod === 'In-Clinic') && (
                  <Link
                    to={`/consultation/in-clinic/vet/${vet._id}`}
                    className="min-w-[18rem] p-3 rounded-md border border-blue-800 hover:bg-gray-100 block"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-700" />
                          <span className="font-medium text-gray-700 text-sm">
                            {vet.clinicId?.clinicName} ({vet.clinicId?.city})
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-xs text-green-600">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                          Available today
                        </span>
                        <span className="font-normal text-xs">
                          Rs.{' '}
                          {
                            vet.services.find(
                              (s) => s.deliveryMethod === 'In-Clinic'
                            )?.price
                          }
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {vet.services?.some((s) => s.deliveryMethod === 'Home Visit') && (
                  <Link
                    to={`/consultation/home-visit/vet/${vet._id}`}
                    className="min-w-[18rem] p-3 rounded-md border border-purple-800 hover:bg-gray-100 block"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-purple-700" />
                          <span className="font-medium text-gray-700 text-sm">
                            Home Visit
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-xs text-green-600">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                          Available today
                        </span>
                        <span className="font-normal text-xs">
                          Rs.{' '}
                          {
                            vet.services.find(
                              (s) => s.deliveryMethod === 'Home Visit'
                            )?.price
                          }
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 font-semibold text-gray-500 hover:text-gray-600 text-xs"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-sm font-semibold text-gray-800">
                Book appointment with Dr. {modalVetName}
              </h2>
              <p className="text-gray-500 text-xs">
                Please select one
              </p>
            </div>

            {/* Services list */}
            <div className="space-y-1">
              {modalServices.map((s, idx) => {
                let Icon, serviceName;
                if (s.deliveryMethod === 'Video Consultation') {
                  Icon = Video;
                  serviceName = 'Online Video Consultation';
                } else if (s.deliveryMethod === 'In-Clinic') {
                  Icon = MapPin;
                  serviceName = modalClinicName;
                } else if (s.deliveryMethod === 'Home Visit') {
                  Icon = Home;
                  serviceName = 'Home Visit';
                }

                return (
                  <Link
                    key={idx}
                    to={`/consultation/${serviceName}/vet/${modalVetId}`}
                    className="block p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-teal-800 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm">
                            {serviceName}
                          </h3>
                          {s.deliveryMethod === 'In-Clinic' && modalClinicCity && (
                            <p className="text-xs text-orange-700 mt-1">
                              Location: {modalClinicCity}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-gray-600">
                            {s.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {s.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1 text-green-600">
                              <span className="w-2 h-2 bg-green-600 rounded-full" />
                              {s.availableToday ? 'Available today' : `Available ${s.nextAvailable}`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price and chevron */}
                      <div className="text-right flex flex-col items-end">
                        <span className="font-semibold text-gray-800 text-sm"><span className='text-xs'>Rs. </span>{s.price}</span>
                        <span className='w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full mt-1'>
                        <ChevronRight className="w-3.5 h-3.5 text-bold text-cyan-950" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vets;
