// src/App.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import Callback from "./components/Callback";
import Layout from "./components/Layout";
import Login from "./components/Login";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </Layout>
  );
};

export default App;
