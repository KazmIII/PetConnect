// src/components/TermsAndConditions.jsx
import React from 'react';

const TermsAndConditions = () => (
  <div className="container mx-auto px-4 py-8 prose prose-lg">
    <h1 className="text-3xl font-bold mb-8 text-center">Terms and Conditions</h1>

    <section className="mb-8 px-10" >
      <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
      <p className="mb-4 text-justify">
        By accessing or using PetConnect, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use our platform.
      </p>
    </section>

    <section className="mb-8 px-10">
      <h2 className="text-2xl font-semibold mb-4">2. Services Provided</h2>
      <p className="mb-4 text-justify">
        PetConnect offers services such as veterinary consultations, pet sitting, grooming appointments, pet adoptions, lost and found reporting, and pet memory features. These services are subject to availability and may change at any time without prior notice.
      </p>
    </section>

    <section className="mb-8 px-10">
      <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
      <p className="mb-4 text-justify">
        Users are responsible for maintaining accurate information on their profiles, respecting service providers and other users, and complying with all applicable laws when using PetConnect services.
      </p>
    </section>

    <section className="mb-8 px-10">
      <h2 className="text-2xl font-semibold mb-4">4. Payment and Transactions</h2>
      <p className="mb-4 text-justify">
        All payments made through PetConnect must be completed using the provided secure payment system. PetConnect is not responsible for any unauthorized transactions outside of the platform.
      </p>
    </section>

    <section className="mb-8 px-10" >
      <h2 className="text-2xl font-semibold mb-4">5. Content and Media Uploads</h2>
      <p className="mb-4 text-justify">
        Users may upload images and information related to their pets. By uploading, users grant PetConnect a non-exclusive right to use this content for the purposes of providing services within the platform.
      </p>
    </section>

    <section className="mb-8 px-10">
      <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
      <p className="mb-4 text-justify">
        PetConnect is not liable for any direct, indirect, or consequential damages arising from the use of our services. Users assume full responsibility for interactions with service providers and adopters.
      </p>
    </section>

    <section className="mb-8 px-10">
      <h2 className="text-2xl font-semibold mb-4">7. Modifications to Terms</h2>
      <p className="mb-4 text-justify">
        We reserve the right to modify these Terms and Conditions at any time. Continued use of PetConnect after changes are posted constitutes acceptance of the updated terms.
      </p>
    </section>

    <section className="px-10">
      <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
      <p className="mb-4 text-justify">
        PetConnect reserves the right to suspend or terminate user accounts that violate these Terms and Conditions or engage in harmful behavior on the platform.
      </p>
    </section>
  </div>
);

export default TermsAndConditions;
