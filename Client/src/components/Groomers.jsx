import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { Video, MapPin, Home, ChevronRight, Scissors } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Spinner from './Spinner.jsx';
import { detectCityByGeo } from '../utils/geolocation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Groomers = () => {
  const [groomers, setGroomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { serviceType: routeServiceType } = useParams();
  const [searchParams] = useSearchParams();
  const [sortOptions, setSortOptions] = useState([]);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  
  const initialServiceTypes = useMemo(() => {
    const queryTypes = searchParams.getAll('serviceType');
    return routeServiceType 
      ? [...new Set([routeServiceType, ...queryTypes])]
      : queryTypes;
  }, [routeServiceType, searchParams]);
  
  const [selectedServiceTypes, setSelectedServiceTypes] = useState(initialServiceTypes);
  const [city, setCity] = useState(searchParams.get('city') || '');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalServices, setModalServices] = useState([]);
  const [modalGroomerId, setModalGroomerId] = useState(null);
  const [modalGroomerName, setModalGroomerName] = useState('');
  const [modalClinicName, setModalClinicName] = useState('');
  const [modalClinicCity, setModalClinicCity] = useState('');

  const navigate = useNavigate();
  const [groomerInfo, setGroomerInfo] = useState('');

  // Load markdown info
  useEffect(() => {
    fetch('/pet_groomer_info.md')
      .then(res => res.text())
      .then(setGroomerInfo)
      .catch(console.error);
  }, []);

  // Sync URL params with state
  useEffect(() => {
    const types = searchParams.getAll('serviceType');
    const init = routeServiceType
      ? [...new Set([routeServiceType, ...types])]
      : types;
    setSelectedServiceTypes(init);
    setCity(searchParams.get('city') || '');
  }, [routeServiceType, searchParams]);

  // Fetch groomers
 useEffect(() => {
  const fetchGrooms = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/auth/groomers', {
        withCredentials: true,
      });
      
      // ✅ Validate response structure
      if (!data?.groomers) {
        throw new Error('Invalid API response format');
      }
      
      setGroomers(data.groomers);
      
    } catch (err) {
      console.error('Failed to load groomers:', err);
      setGroomers([]); // ✅ Reset to empty array
    } finally {
      setLoading(false);
    }
  };
  fetchGrooms();
}, []);

  const toggleSortOption = option => {
    setSortOptions(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const getDeliveryMethod = type => {
    switch (type) {
      case 'In-Clinic':          return 'At Salon';
      case 'Home Visit':        return 'Home Visit';
      default:                  return '';
    }
  };

  const handleFilter = (type) => {
    setSelectedServiceTypes(prev => {
      const newTypes = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
      navigate(`?${new URLSearchParams({
        serviceType: newTypes,
        ...(city && { city })
      })}`);
      return newTypes;
    });
  };

  const isActive = (type) => selectedServiceTypes.includes(type);

  const handleDoctorsNearMe = async () => {
  try {
    const detectedCity = await detectCityByGeo();
    setCity(detectedCity);
    setIsNearMeActive(true);
    navigate(`?city=${encodeURIComponent(detectedCity)}`); // ✅ Add serviceType param
  } catch (error) {
    console.error('Error detecting location:', error);
  }
};

 const filteredGroomers = useMemo(() => {
  const cityKey = city?.trim().toLowerCase();
  const hasCityFilter    = cityKey !== '';
  const hasServiceFilter = selectedServiceTypes.length > 0;

  console.log('Filtering groomers for city:', cityKey);
  groomers.forEach(g => {
    console.log(
      `→ ${g.name}: clinic city =`,
      g.clinicId?.city?.toLowerCase()
    );
  });

  return groomers
    .filter(g => {
      // 1) service filtering (only if you clicked at least one)
      const serviceMatch = hasServiceFilter
        ? selectedServiceTypes.some(t => {
            const method = getDeliveryMethod(t);
            return g.services?.some(s => s.deliveryMethod === method);
          })
        : true;

      // 2) city filtering (only when ?city= is present)
      const locationMatch = hasCityFilter
        ? (g.clinicId?.city?.toLowerCase() === cityKey)
        : true;

      return serviceMatch && locationMatch;
    })
    // 3) then sort
    .sort((a, b) => {
      for (const opt of sortOptions) {
        let diff = 0;
        switch (opt) {
          case 'experience':
            diff = b.yearsOfExperience - a.yearsOfExperience; break;
          case 'fee':
            diff = a.fee - b.fee; break;
          case 'rating':
            diff = b.rating - a.rating; break;
          case 'availability':
            diff = (b.availableToday ? 1 : 0)
                 - (a.availableToday ? 1 : 0);
            break;
        }
        if (diff) return diff;
      }
      return 0;
    });
}, [groomers, selectedServiceTypes, city, sortOptions]);


  const handleBookClick = groomer => {
    const services = groomer.services || [];
    if (services.length === 1) {
      const svc = services[0];
      let path = '';
      if (svc.deliveryMethod === 'In-Clinic') {
        path = `/appointment/at-salon/groomer/${groomer._id}`;
      } else if (svc.deliveryMethod === 'Home Visit') {
        path = `/appointment/home-visit/groomer/${groomer._id}`;
      }
      navigate(path);
    } else {
      setModalServices(services);
      setModalGroomerId(groomer._id);
      setModalGroomerName(groomer.name);
      setModalClinicName(groomer.clinicId?.clinicName);
      setModalClinicCity(groomer.clinicId?.city);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-medium text-gray-800 mb-2">
        {filteredGroomers.length} Groomer
        {filteredGroomers.length !== 1 && 's'}{' '}
         in {city}
      </h1>
      <p className="text-gray-700 mb-6 text-xs">
        Professional pet grooming services near you
      </p>

      <div className="max-w-[58rem] flex gap-2 mb-6 text-xs font-medium text-lime-700 overflow-x-auto pb-2">
        <button 
          className={`px-3 py-2 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${isNearMeActive ? 'bg-lime-200' : 'bg-white'}`}
          onClick={handleDoctorsNearMe}
        >
          Groomers Near Me
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('experience') ? 'bg-lime-200' : 'bg-white'}`}
          onClick={() => toggleSortOption('experience')}
        >
          Most Experienced
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('fee') ? 'bg-lime-200' : 'bg-white'}`}
          onClick={() => toggleSortOption('fee')}
        >
          Lowest Fee
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('rating') ? 'bg-lime-200' : 'bg-white'}`}
          onClick={() => toggleSortOption('rating')}
        >
          Highest Rated
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('availability') ? 'bg-lime-200' : 'bg-white'}`}
          onClick={() => toggleSortOption('availability')}
        >
          Available Today
        </button>
        
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${isActive('home-visit') ? 'bg-lime-200' : 'bg-white'}`}
          onClick={() => handleFilter('home-visit')}
        >
          Home Visit
        </button>
      </div>

      {loading ? (
        <Spinner className="text-center py-4" />
      ) : (
        <div className="space-y-6">
          {filteredGroomers.map(g => (
            <div
              key={g._id}
              className="max-w-[58rem] bg-white border border-gray-200 rounded-lg p-6 shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg text-gray-800">{g.name}</h2>
                  <p className="text-sm text-gray-600">{g.clinicId?.clinicName}</p>
                  <div className="mt-6 flex gap-8 text-xs">
                    <div>
                      <div className="font-medium text-gray-900">
                        {g.yearsOfExperience || 5} Years
                      </div>
                      <div className="text-gray-500">Experience</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  
                  <button
                    onClick={() => handleBookClick(g)}
                    className="px-4 py-3 w-48 bg-orange-600 text-white text-sm rounded-sm hover:bg-orange-500 transition"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto mt-4 pb-2">
                {g.services?.map((s, idx) => {
                  let Icon, label, borderColor;
                  switch (s.deliveryMethod) {
                    case 'In-Clinic':
                      Icon = Scissors; label = g.clinicId?.clinicName; borderColor = 'blue';
                      break;
                    case 'Home Visit':
                      Icon = Home; label = 'Home Visit'; borderColor = 'purple';
                      break;
                    default:
                      return null;
                  }
                  return (
                    <Link
                      key={idx}
                      to={`/appointment/${s.deliveryMethod.toLowerCase().replace(/\s/g, '-')}/groomer/${g._id}`}
                      className={`min-w-[18rem] p-3 rounded-md border border-${borderColor}-800 hover:bg-gray-100 block`}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 text-${borderColor}-700`} />
                          <span className="font-medium text-gray-700 text-sm">{label}</span>
                        </div>
                        <span className="font-normal text-xs">Rs. {s.price}</span>
                      </div>
                      {/* <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-600 rounded-full" />
                        {s.availableToday ? 'Available today' : `Next: ${s.nextAvailable}`}
                      </div> */}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {groomerInfo && (
            <div className="prose lg:prose-lg mx-auto px-4 py-20 text-[#1a1a1a]">
            <ReactMarkdown
                children={groomerInfo}
                remarkPlugins={[remarkGfm]}
                components={{
                h1: ({ node, ...props }) => <h2 className="text-base font-medium text-teal-800 my-6" {...props} />,
                h2: ({ node, ...props }) => <h3 className="text-base font-normal text-teal-700 mt-6 mb-4" {...props} />,
                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-justify text-sm text-gray-600" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc ml-6 space-y-2 text-sm text-gray-700" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700" {...props} />, 
                li: ({ node, ...props }) => <li className="leading-snug" {...props} />,
                blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-blue-400 italic pl-4 text-teal-700 bg-blue-50 py-2 my-4" {...props} />
                ),
                strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />
                }}              
            />
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 font-semibold text-gray-500 hover:text-gray-600 text-xs"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <h2 className="text-sm font-semibold text-gray-800">
                Book appointment with {modalGroomerName}
              </h2>
              <p className="text-gray-500 text-xs">Please select one</p>
            </div>

            <div className="space-y-1">
              {modalServices.map((s, idx) => {
                let Icon, serviceName;
                console.log("deilvery method: ", s.deliveryMethod);
                if (s.deliveryMethod === 'In-Clinic') {
                  Icon = MapPin;
                  serviceName = 'in-clinic';
                  console.log("modal clinic name: ", serviceName);
                } else if (s.deliveryMethod === 'Home Visit') {
                  Icon = Home;
                  serviceName = 'Home Visit';
                }

                return (
                  <Link
                    key={idx}
                    to={`/appointment/${serviceName.toLowerCase().replace(/\s/g, '-')}/groomer/${modalGroomerId}`}
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
                          {s.deliveryMethod === 'At Salon' && modalClinicCity && (
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
                      <div className="text-right flex flex-col items-end">
                        <span className="font-semibold text-gray-800 text-sm">
                          <span className='text-xs'>Rs. </span>{s.price}
                        </span>
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

export default Groomers;