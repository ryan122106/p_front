
import axios from "axios";
import { API_URL } from "./constants";


export const getFeedbacks = async (token, params = {}) => {
  const response = await axios.get(`${API_URL}/feedback`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    params,
  });
  return response.data || [];
};

export const getFeedbackById = async (id, token) => {
  const response = await axios.get(`${API_URL}/feedback/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data || {};
};

export const createFeedback = async (feedback, token) => {
  const response = await axios.post(`${API_URL}/feedback`, feedback, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateFeedback = async (id, feedback, token) => {
  const response = await axios.put(`${API_URL}/feedback/${id}`, feedback, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteFeedback = async (id, token) => {
  const response = await axios.delete(`${API_URL}/feedback/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
