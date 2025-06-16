import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import WorkflowBuilderPage from "./pages/WorkflowBuilderPage.jsx"; 
import WorkflowHistoryPage from "./pages/WorkflowHistoryPage.jsx"; 
import { Toaster } from 'react-hot-toast';


const App = () => {
  return (
    <>
    <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2d2d2d',
            color: '#fff',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} /> 
            <Route path="workflow-history" element={<WorkflowHistoryPage />} /> 
          </Route>
          <Route path="/new-project" element={<WorkflowBuilderPage />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
        </Routes>
      </Router>
    </>

  );
};

export default App;
