// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { AuthConsumer } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

const ProfilePage = () => {
  return (
    <AuthConsumer>
      {({ auth, isAuthenticated }) => {
        if (!isAuthenticated()) {
          return <Navigate to="/login" />;
        }
        return <Profile auth={auth} />;
      }}
    </AuthConsumer>
  );
};

const Profile = ({ auth }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = auth.getAccessToken();
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
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
  }, [auth]);

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
};

export default ProfilePage;
