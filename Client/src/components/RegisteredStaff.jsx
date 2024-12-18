import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Phone, User, Mail, MapPin } from "lucide-react";
import Spinner from "./Spinner";

const RegisteredStaff = () => {
  const [users, setUsers] = useState({ vets: [], groomers: [], sitters: [] });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [vetResponse, groomerResponse, sitterResponse] = await Promise.all([
          axios.get("http://localhost:5000/auth/admin/get-vets"),
          axios.get("http://localhost:5000/auth/admin/get-groomers"),
          axios.get("http://localhost:5000/auth/admin/get-sitters"),
        ]);

        setUsers({
          vets: vetResponse.data.vets,
          groomers: groomerResponse.data.groomers,
          sitters: sitterResponse.data.sitters,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (userId, title) => {
    if(title === 'Sitters'){
    navigate(`/admin/service-providers/sitter/${userId}`);
    }
  };

  // Function to render Table Section
  const renderTableSection = (title, userList) => (
    <div className="mb-6">
      <h2 className="hidden md:block text-lg font-semibold text-orange-800">{title}</h2>
      <div className="hidden md:block">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Name</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Email</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Phone</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">City</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  <Spinner />
                </td>
              </tr>
            ) : (
              userList.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserClick(user._id, title)}>
                  <td className="border px-4 py-2">
                    <div className="inline-flex items-center">
                      <User className="mr-2 text-teal-600" /> {user.name}
                    </div>
                  </td>
                  <td className="border px-2 py-2">
                    <div className="inline-flex items-center">
                      <Mail className="mr-2 text-orange-600" /> {user.email}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="inline-flex items-center">
                      <Phone className="mr-2 text-blue-600" /> {user.phone}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="inline-flex items-center">
                      <MapPin className="mr-2 text-red-600" /> {user.city}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <button className="text-teal-600 hover:underline">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
        {userList.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 m-4">No {title} available.</p>
        )}
      </div>
    </div>
  );

  // Function to render Mobile View Section
  const renderMobileSection = (title, userList) => (
    <div>
      <h2 className="text-lg font-semibold text-orange-800 mt-4 mb-2">{title}</h2>
      {userList.map((user) => (
        <div key={user._id} className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:bg-gray-50">
          <div className="flex justify-start space-x-2 mb-2">
            <div className="font-bold text-teal-800">Name:</div>
            <div>{user.name}</div>
          </div>
          <div className="flex justify-start space-x-2 mb-2">
            <div className="font-bold text-teal-800">Email:</div>
            <div>{user.email}</div>
          </div>
          <div className="flex justify-start space-x-2 mb-2">
            <div className="font-bold text-teal-800">Phone:</div>
            <div>{user.phone}</div>
          </div>
          <div className="flex justify-start space-x-2 mb-2">
            <div className="font-bold text-teal-800">City:</div>
            <div>{user.city}</div>
          </div>
          <button className="text-teal-600 hover:underline mt-2">View</button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="overflow-auto p-4 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 md:mb-4 lg:mb-6">
        Registered Service Providers
      </h1>

      {/* Table Sections */}
      {renderTableSection("Vets", users.vets)}
      {renderTableSection("Groomers", users.groomers)}
      {renderTableSection("Sitters", users.sitters)}

      {/* Mobile Sections */}
      <div className="md:hidden">
        {users.vets.length > 0 && renderMobileSection("Vets", users.vets)}
        {users.groomers.length > 0 && renderMobileSection("Groomers", users.groomers)}
        {users.sitters.length > 0 && renderMobileSection("Sitters", users.sitters)}
      </div>
    </div>
  );
};

export default RegisteredStaff;
