// src/components/ContactUs.jsx
import React from 'react';

const ContactUs = () => (
  <div className="container h-[50vh] mt-11 mx-auto px-4 py-8 prose prose-lg">
    <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
    <p className="mb-4">
      We’re here to help! If you have any questions, concerns, or complain about PetConnect,
      please reach out to us using the information below.
    </p>
    <ul className="list-disc list-inside space-y-2">
      <li>
        <strong>Email:</strong>{' '}
        <a
          href="mailto:support@petconnect.com"
          className="text-blue-600 hover:underline"
        >
          support@petconnect.com
        </a>
      </li>
      <li>
        <strong>Address:</strong> PetConnect, 1234 Paw Lane, Islamabad, Pakistan
      </li>
    </ul>
  </div>
);

export default ContactUs;
