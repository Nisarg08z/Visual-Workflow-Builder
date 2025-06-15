import React from 'react';
import ThreeDAnimation from '../components/common/ThreeDAnimation';
import Button from '../components/common/Button';

const HomePage = () => {
  const handleNewProjectClick = () => alert('New Project clicked!');
  const handleHistoryClick = () => alert('Workflow History clicked!');

  return (
    <div className="flex flex-col md:flex-row items-center justify-center p-8 gap-48">
      <ThreeDAnimation />
      <div className="flex flex-col items-center justify-center flex-grow text-center max-w-2xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          <span>Automate</span>
          <span>Anything with</span>
          <span className="block animated-gradient-text">
            Visual AI Workflows
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-4">
          Drag, drop, and connect to build powerful automation flows and AI agents.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button onClick={handleNewProjectClick} iconClass="fas fa-plus-circle">New Project</Button>
          <Button onClick={handleHistoryClick} type="secondary" iconClass="fas fa-history">Workflow History</Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
