// src/components/Login.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { AuthConsumer } from "../auth/AuthContext";

const Login = () => {
  return (
    <AuthConsumer>
      {({ auth, isAuthenticated }) => {
        if (isAuthenticated()) {
          return <Navigate to="/dashboard" />;
        }
        return (
          <div className="section">
            <div className="section-heading">
              <h2>Login</h2>
              <p>Please log in to continue.</p>
              <button className="button primary" onClick={() => auth.login()}>
                Log In
              </button>
            </div>
          </div>
        );
      }}
    </AuthConsumer>
  );
};

export default Login;
