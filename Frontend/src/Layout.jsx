import React from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
