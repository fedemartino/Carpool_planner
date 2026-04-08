/**
 * Carpool Planner – auth.js
 * Handles Auth0 authentication using the SPA SDK v2.
 *
 * Relies on:
 *   - window.AUTH0_CONFIG  (domain, clientId) provided by config.js
 *   - auth0-spa-js v2 loaded from CDN before this script
 */

let auth0Client = null;

// ─── Public API (called from HTML onclick attributes) ─────────────────────────

async function login() {
  if (auth0Client) {
    await auth0Client.loginWithRedirect();
  }
}

async function logout() {
  if (auth0Client) {
    auth0Client.logout({
      logoutParams: { returnTo: window.location.origin }
    });
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app-content').style.display = 'none';
}

function showApp(user) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';

  if (user) {
    const userInfo = document.getElementById('user-info');
    const avatarEl = document.getElementById('user-avatar');
    const nameEl  = document.getElementById('user-name');

    if (avatarEl && user.picture) {
      avatarEl.src = user.picture;
      avatarEl.style.display = 'block';
    }
    if (nameEl) {
      nameEl.textContent = user.name || user.email || '';
    }
    if (userInfo) {
      userInfo.style.display = 'flex';
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.style.display = 'inline-flex';
    }
  }
}

// ─── Initialisation ───────────────────────────────────────────────────────────

async function initAuth() {
  const config = window.AUTH0_CONFIG || {};
  const isConfigured = config.domain &&
    config.domain !== 'YOUR_AUTH0_DOMAIN' &&
    config.clientId &&
    config.clientId !== 'YOUR_AUTH0_CLIENT_ID';

  if (!isConfigured) {
    // Development mode: Auth0 not configured – show app without authentication.
    console.warn(
      '[Carpool Planner] Auth0 is not configured. ' +
      'Edit config.js or set AUTH0_DOMAIN and AUTH0_CLIENT_ID in Docker to enable login.'
    );
    showApp(null);
    return;
  }

  try {
    auth0Client = await auth0.createAuth0Client({
      domain: config.domain,
      clientId: config.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    });

    // Handle the redirect callback (Auth0 returns ?code=...&state=...)
    const query = window.location.search;
    if (query.includes('code=') && query.includes('state=')) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const isAuthenticated = await auth0Client.isAuthenticated();
    if (isAuthenticated) {
      const user = await auth0Client.getUser();
      showApp(user);
    } else {
      showLoginScreen();
    }
  } catch (err) {
    console.error('[Carpool Planner] Auth0 initialisation error:', err);
    showLoginScreen();
  }
}

document.addEventListener('DOMContentLoaded', initAuth);
