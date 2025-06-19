import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const ProtectedRoute = ({ children }) => {
  const { isLogedin, loading } = useContext(UserContext);

  if (loading) {
    return <div className="text-center mt-20 text-orange-500 text-lg">Checking authentication...</div>;
  }

  if (!isLogedin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
