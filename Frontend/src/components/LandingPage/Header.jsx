import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserContext } from "../../contexts/UserContext";
import { logoutUser } from "../../utils/api";

const Header = () => {
  const { isLogedin, userDetail, setisLogedin, setuserDetail } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    setisLogedin(false);
    setuserDetail(null);
    setDropdownOpen(false);
    navigate("/");
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest(".user-dropdown")) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [dropdownOpen]);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="top-0 left-0 w-full z-50 bg-gradient-to-br bg-white shadow-md px-6 py-4 flex justify-between items-center"
    >
      <h1
        className="text-2xl font-bold text-orange-500 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Visual Workflow Builder
      </h1>

      {!isLogedin ? (
        <motion.button
          onClick={() => navigate("/login")}
          whileTap={{ scale: 0.95 }}
          className="rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 font-medium shadow-sm px-6 py-2 relative overflow-hidden group"
        >
          <span className="relative z-10">Login</span>
          <span className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-20 blur-md transition duration-300 rounded-md z-0" />
          <span className="absolute inset-0 border border-orange-400 rounded-md opacity-0 group-hover:opacity-50 transition duration-300 z-0 animate-none group-hover:animate-pulse" />
        </motion.button>
      ) : (
        <div className="relative user-dropdown">
          <button
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <img
              src={"https://res.cloudinary.com/dby0edrrn/image/upload/v1749206416/man_1_fxzlur.png"}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </button>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-4 w-60 rounded-xl bg-white border-2 border-orange-200 shadow-lg z-50"
            >
              {/* User Info */}
              <div className="p-4 border-b border-orange-200">
                <p className="text-sm font-semibold text-orange-500">
                  {userDetail?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">{userDetail?.email}</p>
              </div>

              {/* Menu Actions */}
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    navigate(`/profile/${userDetail?.username}`);
                    setDropdownOpen(false);
                  }}
                  className="text-left px-5 py-3 text-sm text-gray-800 hover:bg-orange-100 hover:text-orange-600 transition duration-150"
                >
                  👤 Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="text-left px-5 py-3 text-sm text-red-500 border-t border-orange-200 hover:bg-red-100 transition duration-150"
                >
                  🚪 Logout
                </button>
              </div>
            </motion.div>
          )}

        </div>
      )}
    </motion.header>
  );
};

export default Header;
