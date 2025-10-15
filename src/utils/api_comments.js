import axios from "axios";
import { API_URL } from "./constants";

export const getComments = async (noteId, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_URL}/comments/${noteId}`, { headers });
    return res.data || [];
  } catch (err) {
    console.error("Error fetching comments:", err);
    throw err;
  }
};

export const createComment = async (noteId, content, token) => {
  try {
    const res = await axios.post(
      `${API_URL}/comments/${noteId}`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Error creating comment:", err);
    throw err;
  }
};

export const updateComment = async (commentId, content, token) => {
  try {
    const res = await axios.put(
      `${API_URL}/comments/${commentId}`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Error updating comment:", err);
    throw err;
  }
};

export const deleteComment = async (commentId, token) => {
  try {
    const res = await axios.delete(`${API_URL}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error deleting comment:", err);
    throw err;
  }
};

export const getCommentCount = async (noteId, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_URL}/comments/${noteId}/count`, { headers });
    return res.data.count || 0;
  } catch (err) {
    console.error("Error fetching comment count:", err);
    throw err;
  }
};

