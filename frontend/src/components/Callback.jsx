// src/components/Callback.jsx
import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import { AuthConsumer } from "../auth/AuthContext";

class Callback extends Component {
  state = {
    redirect: false,
  };

  componentDidMount() {
    this.props.auth
      .handleAuthentication()
      .then(() => {
        this.setState({ redirect: true });
      })
      .catch((err) => {
        console.error(err);
        this.setState({ redirect: true });
      });
  }

  render() {
    return this.state.redirect ? <Navigate to="/dashboard" /> : <div>Loading...</div>;
  }
}

const CallbackContainer = () => (
  <AuthConsumer>
    {({ auth }) => <Callback auth={auth} />}
  </AuthConsumer>
);

export default CallbackContainer;
