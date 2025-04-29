// src/components/PrivacyPolicy.jsx
import React from 'react';

const PrivacyPolicy = () => (
  <div className="container mx-auto px-4 py-8 prose prose-lg">
    <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>

    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">1. Information & Use</h2>
      <p className="mb-4 text-justify">
        At PetConnect, we collect various types of information to deliver and improve our services. This includes account details, profile information, data related to adoptions and lost-and-found reports, service data, uploaded media for features like emotion detection and the digital memory book, and usage data.
      </p>
      <p className="mb-4 text-justify">
        We use this information to provide and manage pet care services, securely process payments, facilitate pet adoptions and reunions for lost pets, power features like emotion detection and the digital memory book, send confirmations, reminders, and optional updates, and analyze usage patterns to enhance performance, security, and overall user experience.
      </p>
    </section>

    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">2. Sharing & Security</h2>
      <p className="mb-4 text-justify">
        PetConnect may share your information with trusted service providers strictly to perform services on our behalf. We also disclose data when required by law or to protect the rights, safety, or property of PetConnect or its users, and in connection with business transfers such as mergers, acquisitions, or sales, always under the same privacy commitments.
      </p>
      <p className="mb-4 text-justify">
        To protect your data, we implement reasonable administrative, technical, and physical safeguards and continuously review our measures. We use cookies and similar technologies to keep you logged in, remember preferences, and analyze site usage; you can manage cookies via your browser settings, but some functionality may be limited. PetConnect is not intended for children under 16, and we do not knowingly collect personal data from minors. If you believe we have, please contact us to have it removed.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-4">3. Your Rights & Changes</h2>
      <p className="mb-4 text-justify">
        We may update this Privacy Policy to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of major changes via email or a notice on our platform.
      </p>
      <p className="text-justify">
        You have the right to access and correct your personal information, request deletion of your account and data, and opt out of marketing communications at any time. To exercise these rights, please visit your account settings or contact our support team.
      </p>
    </section>
  </div>
);

export default PrivacyPolicy;
