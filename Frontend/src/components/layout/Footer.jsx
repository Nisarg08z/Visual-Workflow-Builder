import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const handleEmailClick = () => {
    const email = 'nisarg693z@gmail.com';
    navigator.clipboard.writeText(email)
      .then(() => {
        alert(`Email copied: ${email}`);
      })
      .catch(err => {
        console.error('Failed to copy email:', err);
        alert('Failed to copy email');
      });
  };

  return (
    <footer className="w-full flex justify-end p-2 bg-white shadow-md rounded-t-xl mt-auto">
      <div className="flex space-x-5 pr-4 text-2xl">
        <a 
          href="https://www.linkedin.com/in/nisarg-fultariya-5ba908277?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
          aria-label="LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faLinkedin} className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-transform duration-300" />
        </a>
        <a 
          href="https://github.com/nisarg08z" 
          aria-label="GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faGithub} className="text-gray-800 hover:text-black hover:scale-110 transition-transform duration-300" />
        </a>
        <a 
          href="https://youtube.com/@const_nisarg?si=h0xjJC3KHMFCbmE6" 
          aria-label="YouTube"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faYoutube} className="text-red-600 hover:text-red-800 hover:scale-110 transition-transform duration-300" />
        </a>
        <button 
          onClick={handleEmailClick}
          aria-label="Copy Email"
          className="focus:outline-none"
        >
          <FontAwesomeIcon icon={faEnvelope} className="text-green-600 hover:text-green-800 hover:scale-110 transition-transform duration-300" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
