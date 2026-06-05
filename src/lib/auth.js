const TOKEN_KEY = 'bgg-mobile-token';
const USER_KEY = 'bgg-mobile-user';
const REMEMBER_KEY = 'bgg-mobile-remember';

let unauthorizedHandler = null;

export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function parseUser(raw) {
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    if (user?.email || user?.name) return user;
  } catch {
    /* ignore */
  }
  return null;
}

/** Drop legacy tokens saved without "remember me" so dev opens on login. */
export function normalizeSessionOnBoot() {
  if (localStorage.getItem(REMEMBER_KEY) !== '1') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function getToken() {
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) return sessionToken;
  if (localStorage.getItem(REMEMBER_KEY) === '1') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function getStoredUser() {
  const sessionRaw = sessionStorage.getItem(USER_KEY);
  const fromSession = parseUser(sessionRaw);
  if (fromSession) return fromSession;
  if (localStorage.getItem(REMEMBER_KEY) === '1') {
    return parseUser(localStorage.getItem(USER_KEY));
  }
  return null;
}

export function hasStoredSession() {
  return Boolean(getToken() && getStoredUser());
}

export function setSession(accessToken, user, { remember = false } = {}) {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, accessToken);
  store.setItem(USER_KEY, JSON.stringify(user));
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, '1');
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

export function handleUnauthorized(reason = 'expired') {
  clearSession();
  unauthorizedHandler?.(reason);
}
