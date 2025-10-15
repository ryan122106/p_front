import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Box,
  TextField,
  Button,
  IconButton,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Header from "../components/Header";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../utils/api_comments";
import { toggleLike, getLikesCount } from "../utils/api_likes";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams, useNavigate } from "react-router";

const CommentsPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [cookies] = useCookies(["currentuser"]);
  const { currentuser = {} } = cookies;
  const {
    token = "",
    _id: userId = "",
    role = "",
    username = "",
  } = currentuser;

  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState({});
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const [addConfirmOpen, setAddConfirmOpen] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingComment, setPendingComment] = useState("");
  const [commentToEdit, setCommentToEdit] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const fetchComments = async () => {
    if (!token) return;
    try {
      const data = await getComments(noteId, token);
      setComments(data);

      const counts = {};
      await Promise.all(
        data.map(async (c) => {
          const count = await getLikesCount(c._id, "comment", token);
          counts[c._id] = count;
        })
      );
      setLikes(counts);
    } catch {
      toast.error("Error fetching comments");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [noteId, token]);

  const handleOpenAddConfirm = () => {
    if (!newComment.trim()) return toast.error("Please type something first!");
    setPendingComment(newComment);
    setAddConfirmOpen(true);
  };

  const handleAddComment = async () => {
    try {
      const created = await createComment(noteId, pendingComment, token);
      setComments([created, ...comments]);
      setNewComment("");
      setLikes((prev) => ({ ...prev, [created._id]: 0 }));
      toast.success("Comment added!");
    } catch {
      toast.error("Error creating comment");
    } finally {
      setAddConfirmOpen(false);
      setPendingComment("");
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = (id) => {
    if (!editingContent.trim()) return toast.error("Message cannot be empty");
    setCommentToEdit({ id, newContent: editingContent });
    setEditConfirmOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!commentToEdit) return;
    try {
      const updated = await updateComment(
        commentToEdit.id,
        commentToEdit.newContent,
        token
      );
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentToEdit.id
            ? { ...c, content: commentToEdit.newContent }
            : c
        )
      );
      toast.success("Comment updated!");
      setEditingId(null);
      setEditingContent("");
    } catch {
      toast.error("Error updating comment");
    } finally {
      setEditConfirmOpen(false);
      setCommentToEdit(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment(commentToDelete._id, token);
      setComments((prev) => prev.filter((c) => c._id !== commentToDelete._id));
      toast.success("Comment deleted!");
    } catch {
      toast.error("Error deleting comment");
    } finally {
      setDeleteConfirmOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleLike = async (commentId) => {
    if (!token) {
      toast.error("Please log in to like comments");
      return;
    }
    try {
      await toggleLike(commentId, token, "comment");
      const count = await getLikesCount(commentId, "comment", token);
      setLikes((prev) => ({ ...prev, [commentId]: count }));
    } catch (err) {
      toast.error("Error toggling like");
    }
  };
  return (
    <>
      <Header current="comments" title="Comments" />
      <Box
        sx={{ bgcolor: "#121212", minHeight: "100vh", color: "#f5f5f5", pt: 2 }}
      >
        <Container maxWidth="sm" sx={{ mt: 3, mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Comments
          </Typography>
          {token ? (
            <Box mt={2} mb={3}>
              <TextField
                fullWidth
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{
                  mb: 1,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  "& .MuiInputBase-input": { color: "#000" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#1976d2" },
                    "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                  },
                }}
              />
              <Button variant="contained" onClick={handleOpenAddConfirm}>
                Post Comment
              </Button>
            </Box>
          ) : (
            <Typography sx={{ color: "#aaa" }}>
              Please{" "}
              <Button
                onClick={() => navigate("/login")}
                sx={{ color: "#1976d2" }}
              >
                log in
              </Button>{" "}
              to add a comment.
            </Typography>
          )}

          <Divider sx={{ borderColor: "#333", mb: 2 }} />
          {comments.length === 0 ? (
            <Typography sx={{ color: "#aaa" }}>No comments yet.</Typography>
          ) : (
            comments.map((c) => {
              const canDelete = role === "admin" || c.userId?._id === userId;
              const canEdit = c.userId?._id === userId;

              return (
                <Card
                  key={c._id}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    bgcolor: "#1e1e1e",
                    color: "#fff",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 2,
                          bgcolor: "primary.main",
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {c.userId?.name || c.userName || username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#aaa" }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    {editingId === c._id ? (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          sx={{
                            mb: 1,
                            "& .MuiInputBase-input": { color: "#fff" },
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { borderColor: "#444" },
                              "&:hover fieldset": { borderColor: "#777" },
                              "&.Mui-focused fieldset": {
                                borderColor: "#1976d2",
                              },
                            },
                          }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleSaveEdit(c._id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography sx={{ mb: 1, color: "#ddd" }}>
                        {c.content}
                      </Typography>
                    )}

                    <Divider sx={{ borderColor: "#333", my: 1 }} />

                    <CardActions sx={{ p: 0, gap: 1 }}>
                      {canEdit && editingId !== c._id && (
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(c)}
                        >
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(c)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      <Button
                        size="small"
                        startIcon={<ThumbUpIcon />}
                        onClick={() => handleLike(c._id)}
                        sx={{ color: "#bbb" }}
                      >
                        {likes[c._id] || 0} Likes
                      </Button>
                    </CardActions>
                  </CardContent>
                </Card>
              );
            })
          )}

          <Box mt={3}>
            <Button variant="outlined" onClick={() => navigate("/notes")}>
              Back
            </Button>
          </Box>
        </Container>
      </Box>
      <Dialog
        open={addConfirmOpen}
        onClose={() => setAddConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Comment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to post this comment?</Typography>
          <Typography
            sx={{
              mt: 2,
              p: 1,
              bgcolor: "#f0f0f0",
              borderRadius: 2,
              color: "#000",
              fontStyle: "italic",
            }}
          >
            “{pendingComment}”
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddConfirmOpen(false)} color="error">
            Cancel
          </Button>
          <Button
            onClick={handleAddComment}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT CONFIRM */}
      <Dialog
        open={editConfirmOpen}
        onClose={() => setEditConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Save Changes</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save this edited comment?
          </Typography>
          {commentToEdit && (
            <Typography
              sx={{
                mt: 2,
                p: 1,
                bgcolor: "#f0f0f0",
                borderRadius: 2,
                color: "#000",
                fontStyle: "italic",
              }}
            >
              “{commentToEdit.newContent}”
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditConfirmOpen(false)} color="error">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmEdit}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this comment?</Typography>
          {commentToDelete && (
            <Typography
              sx={{
                mt: 2,
                p: 1,
                bgcolor: "#f0f0f0",
                borderRadius: 2,
                color: "#000",
                fontStyle: "italic",
              }}
            >
              “{commentToDelete.content}”
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommentsPage;
