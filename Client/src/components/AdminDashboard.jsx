// AdminDashboard.js
import React, { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import RegisteredUsers from './RegisteredUsers';
import { PendingClinicRequests } from "./PendingClinicRequests";
import PendingSitterRequests from "./PendingSitterRequests";
import { ClinicDetails } from "./ClinicDetails";
import SitterDetails from "./SitterDetails";
import AdminNavbar from "./AdminNavbar";
import AdminSidePanel from "./AdminSidePanel";
import RegisteredStaff from './RegisteredStaff';

const AdminDashboard = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const toggleSidePanel = () => setIsSidePanelOpen((prev) => !prev);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen((prev) => !prev);

  const handleSectionChange = (section) => setActiveSection(section);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsSidePanelOpen(false); // Close side panel on smaller screens
      } else {
        setIsSidePanelOpen(true);
      }
    };

    const handleClickOutside = (event) => {
      // Profile Dropdown
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    // Add event listeners
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    // Call the resize handler on mount to set the initial state
    handleResize();

    // Cleanup the event listeners on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return (
    <>
      <AdminNavbar
        toggleSidePanel={toggleSidePanel}
        isSidePanelOpen={isSidePanelOpen}
        isProfileDropdownOpen={isProfileDropdownOpen}
        toggleProfileDropdown={toggleProfileDropdown}
        profileDropdownRef={profileDropdownRef}
        profileButtonRef={profileButtonRef}
      />
      
      <div className="flex h-screen">
        <AdminSidePanel 
          activeSection={activeSection} 
          handleSectionChange={handleSectionChange} 
          isSidePanelOpen={isSidePanelOpen}
          setIsSidePanelOpen={setIsSidePanelOpen}
        />

        <div className={`transition-all duration-300 ${isSidePanelOpen ? "w-3/4" : "w-full"} bg-gray-100 overflow-auto hide-scrollbar`}>
          <Routes>
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            <Route path="/requests/clinic" element={<PendingClinicRequests />} />
            <Route path="/requests/clinic/:clinicName" element={<ClinicDetails />} />
            <Route path="/requests/sitter" element={<PendingSitterRequests />} />
            <Route path="/service-providers/sitter/:sitterId" element={<SitterDetails />} />
<Route path="/requests/sitter/:sitterId" element={<SitterDetails />} />

            <Route path="/users" element={<RegisteredUsers />} />
            <Route path="/service-providers" element={<RegisteredStaff />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
