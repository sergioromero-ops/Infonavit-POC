// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { AuthConsumer } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <AuthConsumer>
      {({ isAuthenticated }) => {
        if (!isAuthenticated()) {
          return <Navigate to="/login" />;
        }

        if (loading) {
          return <div>Loading profile...</div>;
        }

        if (error) {
          return <div>Error: {error}</div>;
        }

        return (
          <div className="section">
            <div className="section-heading">
              <h2>Profile</h2>
              {profile && <p>Welcome, {profile.name}</p>}
            </div>
            {profile && <pre>{JSON.stringify(profile, null, 2)}</pre>}
          </div>
        );
      }}
    </AuthConsumer>
  );
};

export default ProfilePage;
