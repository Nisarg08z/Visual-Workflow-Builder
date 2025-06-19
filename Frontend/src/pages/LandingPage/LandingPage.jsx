import React from "react";
import Header from "../../components/LandingPage/Header";
import HeroSection from "../../components/LandingPage/HeroSection";
import WorkflowPreview from "../../components/LandingPage/WorkflowPreview";
import Questions from "../../components/LandingPage/Questions";
import Footer from "../../components/LandingPage/Footer";
import PartitionAnimation from "../../components/Animation/PartitionAnimation"

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <Header />
      <HeroSection />
      <PartitionAnimation/>
      <WorkflowPreview />
      <Questions />
      <Footer />
    </div>
  );
};

export default LandingPage;
