
import axios from "axios";
import { API_URL } from "./constants";

export const toggleLike = async (itemId, token, itemType = "note") => {
  if (!token) throw new Error("User not authenticated");

  try {
    const res = await axios.post(
      `${API_URL}/likes/${itemId}/toggle`,
      { itemType },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Error toggling like:", err.response?.data || err.message);
    throw err;
  }
};

export const getLikesCount = async (itemId, itemType = "note", token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(
      `${API_URL}/likes/count?itemId=${itemId}&itemType=${itemType}`,
      { headers }
    );
    return res.data.count || 0;
  } catch (err) {
    console.error("Error getting likes count:", err.response?.data || err.message);
    return 0;
  }
};

export const getUserLikedNotes = async (userId, token) => {
  try {
    const res = await axios.get(`${API_URL}/users/${userId}/likes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error getting liked notes:", err.response?.data || err.message);
    throw err;
  }
};
