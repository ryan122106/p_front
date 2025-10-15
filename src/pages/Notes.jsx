import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Avatar,
  CardActions,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CommentIcon from "@mui/icons-material/Comment";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import { toast } from "sonner";
import { getNotes, deleteNote } from "../utils/api_notes";
import { toggleLike, getLikesCount } from "../utils/api_likes";
import { saveAs } from "file-saver";

const MotionDiv = motion.div;

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [likes, setLikes] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [sortOption, setSortOption] = useState("newest");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [cookies] = useCookies(["currentuser"]);
  const { currentuser = {} } = cookies;
  const { token = "", role = "", _id: userId = "" } = currentuser;

  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 1);
    return () => clearTimeout(handler);
  }, [searchText]);
  const fetchNotes = async () => {
    try {
      const res = await getNotes(token || "", {
        search: debouncedSearch,
        sort: sortOption,
      });
      setNotes(res);
      setFilteredNotes(res);

      const counts = {};
      for (const n of res) {
        counts[n._id] = await getLikesCount(n._id, "note", token || "");
      }
      setLikes(counts);
    } catch (err) {
      console.error(err);
      toast.error("Error loading notes");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [debouncedSearch, sortOption]);
  useEffect(() => {
    if (!searchText.trim()) return setFilteredNotes(notes);
    const filtered = notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        n.content?.toLowerCase().includes(searchText.toLowerCase()) ||
        n.user?.name?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchText, notes]);

  const handleLike = async (noteId) => {
    if (!token) return toast.error("Please login to like posts");
    try {
      await toggleLike(noteId, token);
      const count = await getLikesCount(noteId, "note", token);
      setLikes((prev) => ({ ...prev, [noteId]: count }));
    } catch {
      toast.error("Error toggling like");
    }
  };

  const openDeleteConfirm = (note) => {
    setNoteToDelete(note);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete || !token) return;
    try {
      await deleteNote(noteToDelete._id, token);
      toast.success("Note deleted");
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);
      fetchNotes();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting note");
    }
  };

  const renderMedia = (media) => {
    if (!media || media.length === 0) return null;
    const file = media[0];
    const isVideo = file.endsWith(".mp4");
    const src = file.startsWith("http")
      ? file
      : `${window.location.origin}/api/uploads/${file
          .replace(/^\/+/, "")
          .replace(/\\/g, "/")}`;

    return (
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          background: "#000",
        }}
      >
        {isVideo ? (
          <video
            src={src}
            controls
            style={{ width: "100%", borderRadius: 10 }}
          />
        ) : (
          <img
            src={src}
            alt="note"
            style={{ width: "100%", borderRadius: 10, objectFit: "cover" }}
            onError={(e) => (e.target.style.display = "none")}
          />
        )}
      </MotionDiv>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.08 },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
  };

  return (
    <>
      <Header current="notes" title="Chattrix" />
      <Box
        sx={{
          bgcolor: "linear-gradient(180deg, #0d0d0d 0%, #121212 100%)",
          minHeight: "100vh",
          color: "#fff",
          pt: 2,
          position: "relative",
        }}
      >
        <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
          <Paper
            elevation={8}
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 2,
              mb: 4,
              borderRadius: 3,
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!token}
              onClick={() => navigate("/notes/new")}
              sx={{
                px: 4,
                py: 1.3,
                borderRadius: 3,
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              {token
                ? "Share Your Thought Here"
                : "Login to Share Your Thought"}
            </Button>
          </Paper>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Search notes..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{
                input: { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#90caf9" },
                },
              }}
            />
          </Box>
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
          {filteredNotes.length === 0 ? (
            <Typography
              variant="h6"
              sx={{ mt: 6, color: "#aaa", textAlign: "center" }}
            >
              📝 No posts found for "{searchText}"
            </Typography>
          ) : (
            <MotionDiv
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filteredNotes.map((note) => {
                  const noteUser = note.user || {};
                  const canDelete =
                    token && (role === "admin" || noteUser._id === userId);
                  const canEdit = token && noteUser._id === userId;

                  return (
                    <MotionDiv
                      key={note._id}
                      variants={cardVariants}
                      exit="exit"
                    >
                      <Card
                        elevation={10}
                        sx={{
                          position: "relative",
                          mb: 5,
                          borderRadius: 4,
                          overflow: "hidden",
                          background:
                            "linear-gradient(135deg, rgba(20,20,20,0.9), rgba(25,25,25,0.8))",
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-6px)",
                            boxShadow: "0 12px 35px rgba(0,0,0,0.7)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2.5,
                            py: 1.5,
                            bgcolor: "rgba(255,255,255,0.04)",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              src={note.user?.avatar}
                              sx={{
                                width: 44,
                                height: 44,
                                mr: 2,
                                bgcolor: "primary.main",
                                cursor: "pointer",
                                transition: "0.3s",
                                "&:hover": { transform: "scale(1.1)" },
                              }}
                              onClick={() =>
                                navigate(`/profile/${note.user?._id}`)
                              }
                            />
                            <Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{ cursor: "pointer", color: "#fff" }}
                                onClick={() =>
                                  navigate(`/profile/${note.user?._id}`)
                                }
                              >
                                {note.user?.name}
                              </Typography>
                              {note.user?.role === "admin" && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    bgcolor: "#00e5ff",
                                    color: "#000",
                                    px: 1,
                                    borderRadius: 1,
                                    fontWeight: "bold",
                                  }}
                                >
                                  Owner
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Typography variant="caption" sx={{ color: "#bbb" }}>
                            {new Date(note.createdAt).toLocaleString()}
                          </Typography>
                        </Box>

                        {/* 🖼 Media */}

                        {renderMedia(note.media, note.title)}

                        {/* 📝 Content */}
                        <CardContent sx={{ px: 3, py: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", mb: 1, color: "#fff" }}
                          >
                            {note.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#ccc", whiteSpace: "pre-line" }}
                          >
                            {note.content}
                          </Typography>
                        </CardContent>

                        <Divider sx={{ borderColor: "#333" }} />

                        {/* ❤️ Actions */}
                        <CardActions
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            px: 2,
                            pb: 1.5,
                          }}
                        >
                          {/* ❤️ Like + 💬 Comment */}
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <motion.div
                              whileTap={{ scale: 1.2 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <IconButton
                                onClick={() => handleLike(note._id)}
                                sx={{
                                  color: "#90caf9",
                                  "&:hover": { color: "#64b5f6" },
                                }}
                              >
                                <ThumbUpIcon fontSize="small" />
                              </IconButton>
                            </motion.div>
                            <Typography variant="body2" color="#bbb">
                              {likes[note._id] || 0}
                            </Typography>

                            <IconButton
                              onClick={() => navigate(`/comments/${note._id}`)}
                              sx={{
                                color: "#90caf9",
                                "&:hover": { color: "#64b5f6" },
                              }}
                            >
                              <CommentIcon fontSize="small" />
                            </IconButton>

                            {/* ⬇️ Small Download Button beside comment */}
                            {note.media?.length > 0 && (
                              <IconButton
                                onClick={() => {
                                  const file = note.media[0];
                                  const src = file.startsWith("http")
                                    ? file
                                    : `http://localhost:5123/${file
                                        .replace(/^\/+/, "")
                                        .replace(/\\/g, "/")}`;
                                  const fileName =
                                    src.split("/").pop() || "downloaded_file";
                                  saveAs(src, fileName);
                                }}
                                sx={{
                                  color: "#90caf9",
                                  "&:hover": { color: "#64b5f6" },
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>

                          {/* ✏️ Edit & 🗑 Delete (if allowed) */}
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {canEdit && (
                              <IconButton
                                onClick={() =>
                                  navigate(`/notes/${note._id}/edit`)
                                }
                                sx={{ color: "#bbb" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                color="error"
                                onClick={() => openDeleteConfirm(note)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </CardActions>
                      </Card>
                    </MotionDiv>
                  );
                })}
              </AnimatePresence>
            </MotionDiv>
          )}
        </Container>

        {/* 📍 Fixed Feedback Button */}
        {currentuser && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/feedback/list")}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              borderRadius: "50px",
              px: 3,
              py: 1,
              fontWeight: "bold",
              boxShadow: "0 0 20px rgba(0,136,255,0.6)",
              zIndex: 1000,
              animation: "jump 1.2s ease-in-out infinite", // 🔹 animation added
              "@keyframes jump": {
                "0%, 100%": {
                  transform: "translateY(0)",
                },
                "50%": {
                  transform: "translateY(-10px)",
                },
              },
            }}
          >
            Give Us Feedback
          </Button>
        )}
      </Box>

      {/* 🗑️ Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this post?</Typography>
          {noteToDelete && (
            <Typography sx={{ mt: 1, fontStyle: "italic" }}>
              “{noteToDelete.title || noteToDelete.content.slice(0, 40)}”
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
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

export default Notes;
