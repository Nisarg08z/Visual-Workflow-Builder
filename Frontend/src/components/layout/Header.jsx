import React, { useContext, useState, useEffect } from 'react';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { logoutUser } from '../../utils/api';
import { motion } from 'framer-motion';

const Header = () => {
  const navigate = useNavigate();
  const { isLogedin, userDetail, setisLogedin, setuserDetail } = useContext(UserContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setisLogedin(false);
      setuserDetail(null);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err.message);
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-menu')) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isDropdownOpen]);

  return (
    <header className="w-full flex justify-between items-center p-3 bg-white shadow-md rounded-b-xl">
      <div className="text-3xl font-extrabold text-blue-700 rounded-lg p-2 bg-blue-50">
        VisualFlow AI
      </div>

      {!isLogedin ? (
        <Button onClick={handleLoginClick} type="secondary">
          Login
        </Button>
      ) : (
        <div className="relative dropdown-menu">
          <button
            onClick={toggleDropdown}
            className="w-10 h-10 rounded-full overflow-hidden border border-gray-300"
          >
            <img
              src={'https://res.cloudinary.com/dby0edrrn/image/upload/v1749206416/man_1_fxzlur.png'}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </button>

          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-4 w-64 bg-white rounded-xl shadow-xl border border-gray-20 z-[9999] overflow-hidden"
            >
              <div className="flex items-center p-4">
                <div className="text-sm">
                  <p className="font-medium text-gray-800">{userDetail?.fullName}</p>
                  <p className="text-gray-500">{userDetail?.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  🚪 Logout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
