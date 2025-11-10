// src/authUtils.jsx

export function setAuth({ token, role }) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUserRole() {
  return localStorage.getItem("role");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}
