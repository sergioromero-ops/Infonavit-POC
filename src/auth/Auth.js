// src/auth/Auth.js
import auth0 from "auth0-js";
import AUTH_CONFIG from "../config";

class Auth {
  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: AUTH_CONFIG.domain,
      clientID: AUTH_CONFIG.clientId,
      redirectUri: AUTH_CONFIG.callbackUrl,
      audience: AUTH_CONFIG.audience,
      responseType: "token id_token",
      scope: "openid profile email",
    });

    this.getProfile = this.getProfile.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.setSession = this.setSession.bind(this);
  }

  getProfile() {
    return this.profile;
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) return reject(err);
        if (!authResult || !authResult.idToken) {
          return reject(err);
        }
        this.setSession(authResult);
        resolve();
      });
    });
  }

  isAuthenticated() {
    return new Date().getTime() < this.expiresAt;
  }

  login() {
    this.auth0.authorize();
  }

  logout() {
    // clear access token, id token, and expiration
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;
    this.profile = null;
  }

  setSession(authResult) {
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;
    // set the time that the access token will expire
    this.expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
  }
}

const auth = new Auth();

export default auth;
