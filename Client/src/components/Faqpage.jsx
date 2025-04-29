import React from 'react';

const faqs = [
  {
    question: 'What is PetConnect?',
    answer: 'PetConnect is your one-stop platform for all pet care needs, bringing together services like veterinary consultations, grooming, pet sitting, adoption, and more in a few clicks.'
  },
  {
    question: 'Who can use PetConnect?',
    answer: 'Anyone who loves pets! Pet owners, adopters looking for a new furry friend, or anyone who finds a lost pet can use PetConnect without any special technical knowledge.'
  },
  {
    question: 'How do I create an account?',
    answer: 'Simply click Sign Up, fill in your details, choose your role (pet owner, adopter, or service provider), and verify your email to get started.' },
  {
    question: 'How can I book a pet care service?',
    answer: 'Go to the Services section, pick the service you need (like vet consult or grooming), choose your preferred date and time, and confirm your booking.'
  },
  {
    question: 'How do I adopt a pet?',
    answer: 'Browse pets available for adoption, read their profiles, and click Adopt. You’ll be guided through the adoption steps right on the platform.'
  },
  {
    question: 'What should I do if I find a lost pet?',
    answer: 'Head to the Lost & Found page, post details and a photo of the pet you found. We’ll help match them with their owner.'
  },
  {
    question: 'How does pet emotion detection work?',
    answer: 'Upload a clear photo of your pet, and our system will analyze their expression to give you insights into how they might be feeling.'
  },
  {
    question: 'What is the digital pet memory book?',
    answer: 'A personalized album where you can save and share your pet’s photos, milestones, and special moments all in one place.'
  },
  {
    question: 'Where can I find pet care tips and articles?',
    answer: 'Visit our Pet Care Blog for expert advice, tips, and the latest news on pet health and well-being.'
  },
  {
    question: 'How do I make a payment?',
    answer: 'Payments are easy and secure. After booking, choose your payment method and complete the transaction through our encrypted gateway.'
  },
  {
    question: 'I still have questions. How can I get help?',
    answer: 'No problem! Visit the Contact Us page to send us a message or chat with our support team.'
  }
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <details key={idx} className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer hover:text-gray-600">
              {item.question}
            </summary>
            <p className="mt-2 text-gray-700">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
