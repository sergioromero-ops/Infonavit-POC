// src/pages/ProfilePage.jsx
import React from "react";
import { AuthConsumer } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

const ProfilePage = () => {
  return (
    <AuthConsumer>
      {({ auth, isAuthenticated }) => {
        if (!isAuthenticated()) {
          return <Navigate to="/login" />;
        }
        const profile = auth.getProfile();
        return (
          <div className="section">
            <div className="section-heading">
              <h2>Profile</h2>
              <p>Welcome, {profile.name}</p>
            </div>
            <pre>{JSON.stringify(profile, null, 2)}</pre>
          </div>
        );
      }}
    </AuthConsumer>
  );
};

export default ProfilePage;
