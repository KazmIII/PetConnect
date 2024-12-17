import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faYoutube, faGooglePlay, faAppStore } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <div className="flex flex-col">
    <footer className="bg-black opacity-85 w-full  text-white pt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="w-full md:w-1/3 text-center md:text-left mb-4 md:mb-0">
            <h5 className="font-bold text-lg pb-4">PetConnect</h5>
            <h5 className="font-bold text-xl pb-2">About Us</h5>
            <p className="text-lg text-slate-400 font-semibold">
              At PetConnect, we bridge the gap between pet owners and service providers, 
              ensuring your furry friends receive the best care possible.
            </p>
          </div>

          <div className="w-full md:w-1/3 text-center mb-4 md:mb-0 md:pl-40">
            <ul className="list-none text-center md:text-left">
              <li className="text-lg font-semibold mb-2">Our Services</li>
              <li>
                <a href="#!" className="text-white hover:text-gray-400 block">Consult Veterinarian</a>
              </li>
              <li>
                <a href="#!" className="text-white hover:text-gray-400 block">Pet Sitting/Grooming</a>
              </li>
              <li>
                <a href="#!" className="text-white hover:text-gray-400 block">Lost & Found</a>
              </li>
              <li>
                <a href="#!" className="text-white hover:text-gray-400 block">Detect Pet Emotion</a>
              </li>
            </ul>
          </div>

          <div className="w-full md:w-1/3 text-center mb-4 md:mb-0 md:pl-40">
            <ul className="list-none text-center md:text-left">
              <li className="text-lg font-semibold mb-2">Our Services</li>
              <li>
                <a href="#!" className="text-white hover:text-gray-400 block">Pet Adoption</a>
              </li>
              <li>
                <a href="#!" className="text-white hover:text-gray-400 block">Pet Grooming</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-t border-white w-full"/>

        <div className="flex flex-wrap items-center justify-between">
          <div className="w-full md:w-1/4 text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm">© 2024 Company Name. All rights reserved.</p>
          </div>

          <div className="w-full md:w-1/2 text-center mb-4 md:mb-0">
            <ul className="list-none flex flex-wrap justify-center gap-6 text-xs">
              <li><a href="#!" className="text-white hover:text-gray-400">FAQs</a></li>
              <li><a href="#!" className="text-white hover:text-gray-400">Contact</a></li>
              <li><a href="#!" className="text-white hover:text-gray-400">Privacy Policy</a></li>
              <li><a href="#!" className="text-white hover:text-gray-400">Terms & Conditions</a></li>
            </ul>
          </div>

          <div className="w-full md:w-1/4 text-center md:text-right mb-4 md:mb-0">
            <div className="flex flex-col items-center md:items-end gap-4 mb-4">
            <div className="flex gap-4">
                <a
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white py-1 px-2 rounded flex items-center text-sm transition-transform transform hover:scale-105 hover:bg-gray-800 hover:shadow-lg"
                >
                    <FontAwesomeIcon icon={faGooglePlay} className="h-5 w-5" />
                    <span className="ml-2 hidden md:inline">Google Play</span>
                </a>
                <a
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white py-1 px-2 rounded flex items-center text-sm transition-transform transform hover:scale-105 hover:bg-gray-800 hover:shadow-lg"
                >
                    <FontAwesomeIcon icon={faAppStore} className="h-5 w-5" />
                    <span className="ml-2 hidden md:inline">App Store</span>
                </a>
            </div>


              <h4 className="text-md">Connect with us</h4>
              <ul className="list-none flex justify-center md:justify-end gap-6">
                <li>
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
                    <FontAwesomeIcon icon={faFacebookF} className="h-6 w-6" />
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
                    <FontAwesomeIcon icon={faInstagram} className="h-6 w-6" />
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
                    <FontAwesomeIcon icon={faYoutube} className="h-6 w-6" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}