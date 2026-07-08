// src/auth/AuthContext.jsx
import React, { Component, createContext } from "react";
import auth from "./Auth";

const AuthContext = createContext();

class AuthProvider extends Component {
  state = {
    auth,
    isAuthenticated: auth.isAuthenticated,
  };

  render() {
    return (
      <AuthContext.Provider value={this.state}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

const AuthConsumer = AuthContext.Consumer;

export { AuthProvider, AuthConsumer };
