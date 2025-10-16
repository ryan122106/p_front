import axios from "axios";
import { API_URL } from "./constants";

// Login
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/users/login`, { email, password });
  return response.data;
};

// Signup
export const signup = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/users/signup`, { name, email, password });
  return response.data;
};

export const getUserProfile = async (userId, token) => {
  const res = await axios.get(`${API_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getUserNotes = async (userId, token) => {
  const res = await axios.get(`${API_URL}/users/${userId}/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getUserLikedNotes = async (userId, token) => {
  try {
    const res = await axios.get(`${API_URL}/users/${userId}/likes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data || [];
  } catch (err) {
    console.error("Error fetching liked notes:", err.response?.data || err.message);
    return [];
  }
};

export const getUsers = async (token, search = "") => {
  const res = await axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { search },
  });
  return res.data;
};


export const updateUserRole = async (userId, role, token) => {
  const res = await axios.put(
    `${API_URL}/users/${userId}/role`,
    { role },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Block / Unblock user (admin only)
export const toggleBlockUser = async (userId, isBlocked, token) => {
  const res = await axios.put(
    `${API_URL}/users/${userId}/block`,
    { isBlocked },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

