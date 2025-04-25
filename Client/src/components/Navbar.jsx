import { Menu, X, ChevronDown, ChevronUp, User, LogOut, PawPrint, CircleHelp,
   LayoutDashboard, ClipboardPenLine, Dog, FolderSearch, ListCollapse } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { navItems } from "../constants";
import { useNavigate } from 'react-router-dom';
import { useNavbar } from './NavbarContext';
import axios from "axios";


const Navbar = () => {
  const {isLoggedIn, userRole, setIsLoggedIn, handleShowComponent} = useNavbar();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isJoinDropdownOpen, setIsJoinDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const servicesDropdownRef = useRef(null);
  const joinDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const servicesButtonRef = useRef(null);
  const joinButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const toggleDropdown = () => {
    setIsServicesDropdownOpen(!isServicesDropdownOpen);
    if (isJoinDropdownOpen) setIsJoinDropdownOpen(false); // Close Join dropdown if open
  };

  const toggleJoinDropdown = () => {
    console.log("toggle function triggered");
    setIsJoinDropdownOpen((prev) => !prev);
    if (isServicesDropdownOpen) setIsServicesDropdownOpen(false); // Close Services dropdown if open
  };
  
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };
  

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/logout', { role: userRole }, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setIsLoggedIn(false); // Update login state globally
      }
    } catch (error) {
      console.error('Error logging out:', error.response ? error.response.data : error.message);
    }
  };

  const handleNavigateToPets = () => {
    setIsProfileDropdownOpen(false);
    navigate('/myPets'); // navigate to '/myPets'
  };

  const handleNavigateToEnquiries = () => {
    setIsProfileDropdownOpen(false);
    navigate('/myEnquiries'); 
  };

  const handleNavigateToListings = () => {
    setIsProfileDropdownOpen(false);
    navigate('/myListings'); 
  };
  
  const handleNavigateToAdoption = () => {
    setIsProfileDropdownOpen(false);
    navigate('/profile/post-adoption'); 
  };

  const handleDashboardClick = () => {
    setIsProfileDropdownOpen(false);
    navigate('./clinic/dashboard');
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);

    if(userRole === 'vet'){
      navigate('./profile/vet');
    } else if(userRole === 'groomer'){
      navigate('./profile/groomer');
    } else if(userRole === 'sitter'){
      navigate('./profile/sitter');
    }
    else{
      navigate('./profile/clinic');
    }
  };

  const handleUserProfileClick = () => {
    setIsProfileDropdownOpen(false);
    navigate('./profile/user');
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Services Dropdown
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target) &&
        !servicesButtonRef.current.contains(event.target)
      ) {
        setIsServicesDropdownOpen(false);
      }

      // Join Dropdown
      if (
        joinDropdownRef.current &&
        !joinDropdownRef.current.contains(event.target) &&
        !joinButtonRef.current.contains(event.target)
      ) {
        setIsJoinDropdownOpen(false);
      }

      // Profile Dropdown
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }

      // Mobile Menu
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigation = (path) => {
    if (path !== "#") {  // Prevent navigation if path is "#"
      navigate(path);  // Use navigate to go to the path
    }
  };

  const handleServiceClick = () => {
    setIsProfileDropdownOpen(false);
    navigate('/services');
  };

  if(isLoggedIn === null){return null;}
  
  return (
    <nav className="flex justify-between items-center p-6 shadow-md bg-black opacity-75 sticky text-white top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="flex items-center sm:items-start">
        {/* Mobile Hamburger Menu */}
        <div className="lg:hidden items-center mr-4">
          <button onClick={toggleNavbar}>
            {mobileDrawerOpen ? <X /> : <Menu />}
          </button>
        </div>
        {/* Logo Section */}
        <span className="text-2xl mr-4 font-bold bg-gradient-to-r from-orange-500 to-orange-800 bg-clip-text text-transparent">
          PetConnect
        </span>
      </div>
      
      {/* Center Section: Desktop Navigation */}
      <ul className="flex-1 justify-center ml-3 xl:ml-8 md:justify-start space-x-6 xl:space-x-8 hidden lg:flex text-sm">
        {navItems.map((item, index) => {
          if (item.label === "Services") {
            return (
              <li key={index} className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center text-center justify-center hover:text-orange-500"
                  ref={servicesButtonRef}
                >
                  {item.label}
                  {isServicesDropdownOpen ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </button>
                {isServicesDropdownOpen && (
                  <div
                    className="absolute top-full mt-2 bg-neutral-800 rounded-md shadow-lg w-48"
                    ref={servicesDropdownRef}
                  >
                    <ul className="flex flex-col">
                      {item.subItems.map((subItem, subIndex) => (
                        <li
                          key={subIndex}
                          className="hover:bg-neutral-700"
                        >
                          <button
                            onClick={() => handleNavigation(subItem.path)}  // Use handleNavigation here
                            className="block px-4 py-2 text-center hover:text-orange-500"
                          >
                            {subItem.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          }
          return (
            <li key={index}>
              <button
                onClick={() => handleNavigation(item.path)}  // Use handleNavigation here
                className="hover:text-orange-500 block text-center"
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Profile Section */}
      <div className="flex items-center space-x-4 text-sm">
        {isLoggedIn ? (
          <>
            {userRole === 'pet_owner' && (
              <div className="relative">
              <button
                onClick={toggleJoinDropdown }
                className="hidden md:block py-2 px-2 bg-gradient-to-r from-orange-500 to-orange-800 rounded-md hover:opacity-90"
                ref={joinButtonRef}
              >
                Join PetConnect
              </button>
              {isJoinDropdownOpen && (
                <div className="absolute top-full mt-2 bg-neutral-800 rounded-md shadow-lg w-32"
                  ref={joinDropdownRef}>
                  <ul className="flex flex-col">
                    <li
                      className="px-4 py-2 hover:bg-neutral-700 hover:text-orange-500 cursor-pointer"
                      onClick={() => {
                        setIsJoinDropdownOpen(false);
                        handleShowComponent("clinicRegister");
                      }}
                    >
                      Clinic
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-neutral-700 hover:text-orange-500 cursor-pointer"
                      onClick={() => {
                        setIsJoinDropdownOpen(false);
                        handleShowComponent("providerRegister");
                      }}
                    >
                      Individual
                    </li>
                  </ul>
                </div>
              )}
            </div>
            )}
            

            <button
              className="relative py-2 px-2 space-x-2"
              onClick={toggleProfileDropdown}
              ref={profileButtonRef}
            >
              <User className="w-5 h-5" />
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && userRole === 'pet_owner' && (
              <div
                className="absolute right-0 top-12 z-30 shadow-lg bg-neutral-800 w-40 p-4 rounded-lg"
                ref={profileDropdownRef}
              >
                <ul className="space-y-4">
                  <li className="flex items-center hover:text-orange-500">
                    <User className="w-5 h-5 mr-4 text-lime-400" />
                    <button onClick={handleUserProfileClick}>My Profile</button>
                  </li>
                  <li className="flex items-center hover:text-orange-500">
                    <PawPrint className="w-5 h-5 mr-4 text-lime-400" />
                    <button onClick={handleNavigateToPets}>My Pets</button>
                  </li>
                  <li className="flex items-center hover:text-orange-500">
                    <FolderSearch className="w-5 h-5 mr-4 text-lime-400" />
                    <button onClick={handleNavigateToEnquiries}>My Enquiries</button>
                  </li>
                  <li className="flex items-center hover:text-orange-500">
                    <Dog className="w-5 h-5 mr-3 text-lime-400" />
                    <button onClick={handleNavigateToAdoption}>Rehome Pet</button>
                  </li>
                  <li className="flex items-center hover:text-orange-500">
                    <Dog className="w-5 h-5 mr-3 text-lime-400" />
                    <button onClick={handleNavigateToListings}>My Listings</button>
                  </li>
                  <li className="flex items-center hover:text-orange-500">
                    <CircleHelp className="w-5 h-5 mr-4 text-lime-400" />
                    <button>Help</button>
                  </li>
                  <li className="flex items-center hover:text-orange-500">
                    <LogOut className="w-5 h-5 mr-4 text-lime-400" />
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
             {isProfileDropdownOpen && userRole !== 'pet_owner' && (
              <div
                className="absolute right-0 top-12 z-30 shadow-lg bg-neutral-800 w-48 p-4 rounded-lg"
                ref={profileDropdownRef}
              >
                <ul className="space-y-4">
                  <li className="flex items-center hover:text-orange-500">
                    <User className="w-5 h-5 mr-3 text-orange-500" />
                    <button onClick={handleProfileClick}>Profile</button>
                  </li>
                  {userRole === 'clinic' && 
                    <li className="flex items-center hover:text-orange-500">
                      <LayoutDashboard className="w-5 h-5 mr-3 text-orange-500" />
                      <button onClick={handleDashboardClick}>Dashboard</button>
                    </li>
                  }
                  {userRole !== 'clinic' && 
                    <li className="flex items-center hover:text-orange-500">
                      <ClipboardPenLine className="w-5 h-5 mr-3 text-orange-500" />
                      <button onClick={handleServiceClick}>My Services</button>
                    </li>
                  }
                  <li className="flex items-center hover:text-orange-500">
                    <CircleHelp className="w-5 h-5 mr-3 text-orange-500" />
                    <button>Help</button>
                  </li>
                  <li className="flex items-center hover:text-orange-500">
                    <LogOut className="w-5 h-5 mr-3 text-orange-500" />
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Log In / Sign Up Button */}
            <a
              href="#"
              className="py-2 px-2 min-w-20 border rounded-md hover:bg-neutral-800"
              onClick={() => handleShowComponent("login")}
            >
              LogIn/SignUp
            </a>
            <div className="relative">
              <button
                onClick={toggleJoinDropdown}
                className=" hidden md:block py-2 px-2 bg-gradient-to-r from-orange-500 to-orange-800 rounded-md hover:opacity-90"
                ref={joinButtonRef}
              >
                Join PetConnect
              </button> 
              {isJoinDropdownOpen && (
                <div className="absolute top-full mt-2 bg-neutral-800 rounded-md shadow-lg w-32"
                  ref={joinDropdownRef}>
                  <ul className="flex flex-col">
                    <li
                      className="px-4 py-2 hover:bg-neutral-700 hover:text-orange-500 cursor-pointer"
                      onClick={() => {
                        setIsJoinDropdownOpen(false);
                        handleShowComponent("clinicRegister");
                      }}
                    >
                      Clinic
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-neutral-700 hover:text-orange-500 cursor-pointer"
                      onClick={() => {
                        setIsJoinDropdownOpen(false);
                        handleShowComponent("providerRegister");
                      }}
                    >
                      Individual
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed left-0 top-12 z-20 bg-neutral-900 w-56 rounded flex flex-col lg:hidden"
          ref={mobileMenuRef}
        >
          <ul>
            {navItems.map((item, index) => {
              if (item.label === "Services") {
                return (
                  <li key={index} className="relative w-full">
                    <ul className="mt-2">
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={subIndex} className="hover:bg-neutral-700">
                          <a
                            href={subItem.href}
                            className="block px-4 py-2 text-center hover:text-orange-500"
                          >
                            {subItem.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }
              return (
                <li key={index} className="py-2 w-full">
                  <a
                    href={item.href}
                    className="hover:text-orange-500 block text-center"
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-center mb-2">
            <button
              onClick={toggleJoinDropdown}
              className="py-2 px-3 bg-gradient-to-r from-orange-500 to-orange-800 rounded-md hover:opacity-90"
            >
              Join PetConnect
            </button>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;