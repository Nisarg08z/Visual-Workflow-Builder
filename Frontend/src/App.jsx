import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import Login from "./pages/Login/Login.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import Workflow from "./pages/Workflow/Workflow.jsx";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./services/ProtectedRoute.jsx";

const App = () => {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#2d2d2d",
            color: "#fff",
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/workflow" element={<ProtectedRoute> <Workflow /> </ProtectedRoute>} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
