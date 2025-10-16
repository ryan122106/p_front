import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Avatar,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
} from "@mui/material";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import Header from "../components/Header";
import {
  getFeedbacks,
  createFeedback,
  deleteFeedback,
  updateFeedback,
} from "../utils/api_feedback";
import { toggleLike, getLikesCount } from "../utils/api_likes";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { LazyMotion, domAnimation, m } from "framer-motion";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [likes, setLikes] = useState({});
  const [newFeedback, setNewFeedback] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const [addConfirmOpen, setAddConfirmOpen] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [pendingFeedback, setPendingFeedback] = useState("");
  const [feedbackToEdit, setFeedbackToEdit] = useState(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const [hasAnimated, setHasAnimated] = useState(false);

  const [cookies] = useCookies(["currentuser"]);
  const navigate = useNavigate();

  const { currentuser = {} } = cookies;
  const {
    token = "",
    _id: userId = "",
    role = "",
    username = "",
    email = "",
  } = currentuser;

  const fetchFeedbacks = async (sort = "") => {
    if (!token) return;
    try {
      const res = await getFeedbacks(token);
      const counts = {};
      await Promise.all(
        res.map(async (fb) => {
          const count = await getLikesCount(fb._id, "feedback", token);
          counts[fb._id] = count;
        })
      );

      if (sort === "mostLiked") {
        res.sort((a, b) => (counts[b._id] || 0) - (counts[a._id] || 0));
      } else {
        res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setLikes(counts);
      setFeedbacks(res);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching feedbacks");
    }
  };

  useEffect(() => {
    fetchFeedbacks(sortOption);
  }, [token, sortOption]);

  const handleOpenAddConfirm = () => {
    if (!newFeedback.trim()) return toast.error("Please type something first!");
    setPendingFeedback(newFeedback);
    setAddConfirmOpen(true);
  };

  const handleAddFeedback = async () => {
    try {
      const feedbackData = {
        user: username || email,
        email,
        message: pendingFeedback,
      };
      const created = await createFeedback(feedbackData, token);
      setFeedbacks((prev) => [created, ...prev]);
      setLikes((prev) => ({ ...prev, [created._id]: 0 }));
      setNewFeedback("");
      toast.success("Feedback added!");
    } catch (err) {
      console.error(err);
      toast.error("Error creating feedback");
    } finally {
      setAddConfirmOpen(false);
      setPendingFeedback("");
    }
  };

  const handleEdit = (feedback) => {
    setEditingId(feedback._id);
    setEditedMessage(feedback.message);
  };

  const handleSaveEdit = (id) => {
    if (!editedMessage.trim()) return toast.error("Message cannot be empty");
    setFeedbackToEdit({ id, newMessage: editedMessage });
    setEditConfirmOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!feedbackToEdit) return;
    try {
      await updateFeedback(
        feedbackToEdit.id,
        { message: feedbackToEdit.newMessage },
        token
      );
      setFeedbacks((prev) =>
        prev.map((fb) =>
          fb._id === feedbackToEdit.id
            ? { ...fb, message: feedbackToEdit.newMessage }
            : fb
        )
      );
      toast.success("Feedback updated!");
      setEditingId(null);
      setEditedMessage("");
    } catch {
      toast.error("Error updating feedback");
    } finally {
      setEditConfirmOpen(false);
      setFeedbackToEdit(null);
    }
  };

  const handleDeleteClick = (fb) => {
    setFeedbackToDelete(fb);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFeedback(feedbackToDelete._id, token);
      setFeedbacks((prev) =>
        prev.filter((f) => f._id !== feedbackToDelete._id)
      );
      toast.success("Feedback deleted!");
    } catch {
      toast.error("Error deleting feedback");
    } finally {
      setDeleteConfirmOpen(false);
      setFeedbackToDelete(null);
    }
  };

  const handleLike = async (feedbackId) => {
    try {
      await toggleLike(feedbackId, token, "feedback");
      const count = await getLikesCount(feedbackId, "feedback", token);
      setLikes((prev) => ({ ...prev, [feedbackId]: count }));
    } catch {
      toast.error("Error toggling like");
    }
  };

  return (
    <>
      <Header current="feedback" title="Feedbacks" />

      <Box
        sx={{ bgcolor: "#121212", minHeight: "100vh", color: "#f5f5f5", pt: 2 }}
      >
        <Container maxWidth="sm" sx={{ mt: 3, mb: 6 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant={sortOption === "mostLiked" ? "contained" : "outlined"}
              onClick={() => setSortOption("mostLiked")}
              sx={{ mr: 1 }}
            >
              Most Liked
            </Button>
            <Button
              variant={sortOption === "newest" ? "contained" : "outlined"}
              onClick={() => setSortOption("newest")}
            >
              Newest
            </Button>
          </Box>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              color: "#f5f5f5",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.03))",
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography variant="h5" fontWeight={700}>
              Feedbacks
            </Typography>

            {token ? (
              <Box mt={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Write your feedback..."
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  sx={{
                    mb: 1.5,
                    bgcolor: "#0f0f10",
                    borderRadius: 2,
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#2a2a2a" },
                      "&:hover fieldset": { borderColor: "#444" },
                      "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                    },
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={handleOpenAddConfirm}
                    sx={{
                      background: "linear-gradient(90deg,#2196f3,#00bcd4)",
                      textTransform: "none",
                      boxShadow: "0 6px 20px rgba(0,188,212,0.12)",
                    }}
                  >
                    Post Feedback
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setNewFeedback("")}
                    sx={{
                      color: "#fff",
                      borderColor: "#333",
                      textTransform: "none",
                    }}
                  >
                    Clear
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Typography sx={{ color: "#aaa", mt: 2 }}>
                Please
                <Button
                  onClick={() => navigate("/login")}
                  sx={{ color: "#1976d2" }}
                >
                  log in
                </Button>
                to add feedback.
              </Typography>
            )}
          </Paper>

          {/* Feedback List */}
          <LazyMotion features={domAnimation}>
            <m.div
              initial={!hasAnimated ? "hidden" : false}
              animate={!hasAnimated ? "visible" : false}
            >
              {feedbacks.length === 0 ? (
                <Typography sx={{ color: "#aaa", mt: 6, textAlign: "center" }}>
                  No feedback yet.
                </Typography>
              ) : (
                feedbacks.map((fb) => {
                  const feedbackUserId = fb.userId?._id || fb.userId || "";
                  const canDelete =
                    role === "admin" || feedbackUserId === userId;
                  const canEdit = feedbackUserId === userId;

                  return (
                    <m.div key={fb._id} style={{ marginBottom: "12px" }}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          bgcolor: "rgba(30,30,30,0.85)",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                          backdropFilter: "blur(6px)",
                          transition: "transform 0.2s ease",
                          "&:hover": { transform: "translateY(-4px)" },
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                mr: 2,
                                bgcolor: "primary.main",
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{ color: "#fff" }}
                              >
                                {fb.email}{" "}
                                {fb.userId?.role === "admin" && (
                                  <Box
                                    component="span"
                                    sx={{
                                      ml: 1,
                                      px: 1,
                                      py: 0.2,
                                      borderRadius: 1,
                                      bgcolor: "#1976d2",
                                      color: "#fff",
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    OWNER
                                  </Box>
                                )}
                              </Typography>

                              {fb.createdAt && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#aaa" }}
                                >
                                  {new Date(fb.createdAt).toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          {editingId === fb._id ? (
                            <>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                value={editedMessage}
                                onChange={(e) =>
                                  setEditedMessage(e.target.value)
                                }
                                sx={{
                                  mb: 1,
                                  "& .MuiInputBase-input": {
                                    color: "#fff",
                                    background: "transparent", 
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    background: "transparent",
                                    "& fieldset": { borderColor: "#2a2a2a" },
                                    "&:hover fieldset": { borderColor: "#444" },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#1976d2",
                                    },
                                  },
                                }}
                              />

                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleSaveEdit(fb._id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </>
                          ) : (
                            <Typography
                              sx={{
                                mb: 1.5,
                                color: "#ddd",
                                whiteSpace: "pre-wrap", // preserves line breaks
                                wordBreak: "break-word", // prevents overflow from long words
                              }}
                            >
                              {fb.message}
                            </Typography>
                          )}

                          <Divider sx={{ borderColor: "#2b2b2b", my: 1 }} />

                          <CardActions
                            sx={{ justifyContent: "space-between", p: 0 }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <m.div whileTap={{ scale: 1.15 }}>
                                <IconButton
                                  onClick={() => handleLike(fb._id)}
                                  sx={{
                                    color: "#90caf9",
                                    "&:hover": { color: "#64b5f6" },
                                  }}
                                >
                                  <ThumbUpIcon fontSize="small" />
                                </IconButton>
                              </m.div>
                              <Typography variant="body2" color="#bbb">
                                {likes[fb._id] || 0}
                              </Typography>
                            </Box>

                            <Box sx={{ display: "flex", gap: 1 }}>
                              {canEdit && editingId !== fb._id && (
                                <Button
                                  size="small"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleEdit(fb)}
                                >
                                  Edit
                                </Button>
                              )}
                              {canDelete && (
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteClick(fb)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          </CardActions>
                        </CardContent>
                      </Card>
                    </m.div>
                  );
                })
              )}
            </m.div>
          </LazyMotion>
        </Container>
      </Box>

      {/* Dialogs */}
      <Dialog open={addConfirmOpen} onClose={() => setAddConfirmOpen(false)}>
        <DialogTitle>Confirm Post</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to post this feedback?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddFeedback}
            variant="contained"
            color="primary"
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editConfirmOpen} onClose={() => setEditConfirmOpen(false)}>
        <DialogTitle>Confirm Edit</DialogTitle>
        <DialogContent>
          <Typography>Save changes to this feedback?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmEdit}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this feedback?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeedbackList;
