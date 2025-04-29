// SidePanel.js
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminSidePanel = ({ activeSection, handleSectionChange, isSidePanelOpen, setIsSidePanelOpen }) => {
  const navigate = useNavigate();

  const handleNavigation = (section) => {
    if (window.innerWidth < 768) {
      setIsSidePanelOpen(false);
    }
    handleSectionChange(section);
    if (section === 'dashboard') {
      navigate(`/admin/${section}`);
    }
    navigate(`/admin/${section}`);
  };
  return (
    <div
      className={`bg-gray-700 text-white h-full transition-all duration-300 ease-in-out ${isSidePanelOpen ? "absolute top-14 md:top-0 left-0 w-full md:relative md:w-1/5" : "hidden"
        }`}
    >
      <nav className="flex flex-col gap-2 p-4">
        {/* <button
        onClick={() => handleNavigation("dashboard")}
        className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${
          activeSection === "dashboard" ? "bg-gray-500" : ""
        }`}
      >
        Dashboard
      </button> */}
        <button
          onClick={() => handleNavigation("requests/clinic")}
          className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${activeSection === "requests/clinic" ? "bg-gray-500" : ""
            }`}
        >
          Pending Clinic Requests
        </button>
        <button
          onClick={() => handleNavigation("requests/sitter")}
          className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${activeSection === "requests/sitter" ? "bg-gray-500" : ""
            }`}
        >
          Pending Sitter Requests
        </button>
        <button
          onClick={() => handleNavigation("users")}
          className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${activeSection === "users" ? "bg-gray-500" : ""
            }`}
        >
          All Users
        </button>
        <button
          onClick={() => handleNavigation("service-providers")}
          className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${activeSection === "service-providers" ? "bg-gray-500" : ""
            }`}
        >
          All Service Providers
        </button>
        {/* <button
        onClick={() => handleNavigation("settings")}
        className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${
          activeSection === "settings" ? "bg-gray-500" : ""
        }`}
      >
        Settings
      </button> */}

        <button
          onClick={() => handleNavigation("blogs")}
          className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${activeSection === "blogs" ? "bg-gray-500" : ""
            }`}
        >
          Blog Library
        </button>
      </nav>
    </div>
  );
};

export default AdminSidePanel;
