import React from 'react';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');  
  };

  return (
    <header className="w-full flex justify-between items-center p-6 bg-white shadow-md rounded-b-xl">
      <div className="text-3xl font-extrabold text-blue-700 rounded-lg p-2 bg-blue-50">VisualFlow AI</div>
      <Button onClick={handleLoginClick} type="secondary">Login</Button>
    </header>
  );
};

export default Header;
