// src/config.js
const AUTH_CONFIG = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  callbackUrl: import.meta.env.VITE_AUTH0_CALLBACK_URL,
  audience: import.meta.env.VITE_AUTH0_API_IDENTIFIER,
};

export default AUTH_CONFIG;
