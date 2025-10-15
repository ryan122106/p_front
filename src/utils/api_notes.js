import axios from "axios";
import { API_URL } from "./constants";

export const getNotes = async (token, params) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_URL}/notes`, {
      headers,
      params,
    });
    return res.data || [];
  } catch (err) {
    console.error("Error fetching notes:", err);
    throw err;
  }
};

export const getNoteById = async (id, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_URL}/notes/${id}`, { headers });
    return res.data || {};
  } catch (err) {
    console.error("Error fetching note:", err);
    throw err;
  }
};

export const createNote = async (noteData, token) => {
  try {
    const res = await axios.post(`${API_URL}/notes`, noteData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error creating note:", err);
    throw err;
  }
};

export const updateNote = async (id, noteData, token) => {
  try {
    const res = await axios.put(`${API_URL}/notes/${id}`, noteData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error updating note:", err);
    throw err;
  }
};

export const deleteNote = async (id, token) => {
  try {
    const res = await axios.delete(`${API_URL}/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error deleting note:", err);
    throw err;
  }
};

// Upload file
export const uploadFile = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axios.post(`${API_URL}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.image_url;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};
