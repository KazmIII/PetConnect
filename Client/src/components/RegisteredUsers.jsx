import React, { useState, useEffect } from "react";
import axios from "axios";
import { Phone, User, Mail, MapPin } from "lucide-react";

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/admin/users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="overflow-auto p-4 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 md:mb-4 lg:mb-6">Registered Users</h1>

      {/* Table for medium and larger screens */}
      <div className="hidden md:block">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-md">
          <thead>
            <tr className="bg-gray-100 space-y-2">
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Name</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Email</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Phone</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex items-center">
                    <User className="mr-2 text-teal-600" />
                    {user.name}
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex items-center">
                    <Mail className="mr-2 text-orange-600" />
                    {user.email}
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex items-center">
                    <Phone className="mr-2 text-blue-600" />
                    {user.phone}
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <button className="text-teal-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stacked details for small screens */}
      <div className="md:hidden">
        {users.map((user, index) => (
            <div key={user._id}>
            <div className="border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer" >
                <div className="flex justify-start space-x-2">
                    <div className="font-bold text-teal-800">Name:</div>
                    <div>{user.name}</div>
                </div>
                <div className="flex justify-start space-x-2">
                    <div className="font-bold text-teal-800">Email:</div>
                    <div>{user.email}</div>
                </div>
                <div className="flex justify-start space-x-2">
                    <div className="font-bold text-teal-800">Phone:</div>
                    <div>{user.phone}</div>
                </div>
                <button className="mt-2 text-teal-600 hover:underline">View</button>
            </div>
            {/* Add a horizontal rule if it's not the last user */}
            {index < users.length - 1 && <hr className="border-gray-500 text-bold" />}
            </div>
        ))}
        </div>

        {users.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No registered users available.</p>
        )}
    </div>
  );
};

export default RegisteredUsers;
