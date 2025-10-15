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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  Add as AddIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import { toast } from "sonner";
import { getNotes, deleteNote } from "../utils/api_notes";
import { toggleLike, getLikesCount } from "../utils/api_likes";
import { saveAs } from "file-saver";

const MotionDiv = motion.div;

// ✅ Dropzone-ready media helpers
const getFullFileUrl = (file) => {
  if (!file) return "";
  return file.startsWith("http")
    ? file
    : `http://localhost:5123/${file.replace(/^\/+/, "").replace(/\\/g, "/")}`;
};

const getMimeTypeFromFile = (file) => {
  const ext = file.split(".").pop()?.toLowerCase();
  if (["mp4", "webm", "ogg"].includes(ext)) return `video/${ext}`;
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
    return `image/${ext}`;
  return "application/octet-stream";
};

const renderMedia = (media) => {
  if (!media || media.length === 0) return null;

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" mt={2}>
      {media.map((file, idx) => {
        const src = getFullFileUrl(file);
        const type = getMimeTypeFromFile(file);
        const isVideo = type.startsWith("video");

        return (
          <Box
            key={idx}
            sx={{
              width: 140,
              height: 140,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #333",
              position: "relative",
              bgcolor: "#000",
            }}
          >
            {isVideo ? (
              <video
                src={src}
                controls
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <img
                src={src}
                alt={`media-${idx}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}

            <IconButton
              size="small"
              onClick={() => saveAs(src, src.split("/").pop())}
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                bgcolor: "rgba(0,0,0,0.6)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                color: "#fff",
                p: 0.5,
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      })}
    </Stack>
  );
};

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

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 300);
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

      // fetch likes count
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
        sx={{ bgcolor: "#121212", minHeight: "100vh", pt: 2, color: "#fff" }}
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

          <TextField
            fullWidth
            size="small"
            placeholder="Search notes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{
              mb: 2,
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#90caf9" },
              },
            }}
          />

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
            <Typography sx={{ mt: 6, color: "#aaa", textAlign: "center" }}>
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
                          mb: 5,
                          borderRadius: 4,
                          overflow: "hidden",
                          background:
                            "linear-gradient(135deg, rgba(20,20,20,0.9), rgba(25,25,25,0.8))",
                          border: "1px solid rgba(255,255,255,0.08)",
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

                        {/* ✅ Render all media using Dropzone-style */}
                        {renderMedia(note.media)}

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

                        <CardActions
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            px: 2,
                            pb: 1.5,
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
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
                          </Stack>

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

        {/* Delete Confirmation Dialog */}
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
      </Box>
    </>
  );
};

export default Notes;
