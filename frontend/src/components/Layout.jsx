// src/components/Layout.jsx
import React from "react";
import { Link } from "react-router-dom";
import { AuthConsumer } from "../auth/AuthContext";

const Layout = ({ children }) => {
  return (
    <div className="page-shell">
      <AuthConsumer>
        {({ auth, isAuthenticated }) => (
          <nav className="topbar">
            <span className="brand">
              <Link to="/">Infonavit POC</Link>
            </span>
            <div className="pill-row">
              {isAuthenticated() ? (
                <>
                  <Link to="/dashboard" className="pill">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="pill">
                    Profile
                  </Link>
                  <button className="pill" onClick={() => auth.logout()}>
                    Log Out
                  </button>
                </>
              ) : (
                <button className="pill" onClick={() => auth.login()}>
                  Log In
                </button>
              )}
            </div>
          </nav>
        )}
      </AuthConsumer>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
