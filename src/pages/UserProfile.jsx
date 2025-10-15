import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "sonner";
import {
  getUserProfile,
  getUserNotes,
  getUserLikedNotes,
  toggleBlockUser,
} from "../utils/api_user";
import { deleteNote } from "../utils/api_notes";
import { toggleLike, getLikesCount } from "../utils/api_likes";
import Header from "../components/Header";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import CommentIcon from "@mui/icons-material/Comment";

const UserProfile = () => {
  const [cookies, , removeCookie] = useCookies(["currentuser"]);
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentuser } = cookies;

  const [profile, setProfile] = useState(null);
  const [myNotes, setMyNotes] = useState([]);
  const [likedNotes, setLikedNotes] = useState([]);
  const [likes, setLikes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentuser?.token) {
      toast.error("Please log in first");
      navigate("/login");
    }
  }, [currentuser, navigate]);

  const userIdToFetch = id || currentuser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(userIdToFetch, currentuser.token);
        setProfile(data);

        const notes = await getUserNotes(userIdToFetch, currentuser.token);
        setMyNotes(notes);

        const liked = await getUserLikedNotes(userIdToFetch, currentuser.token);
        setLikedNotes(liked);

        setLikedNotes(liked);

        const counts = {};
        for (const n of [...notes, ...liked]) {
          counts[n._id] = await getLikesCount(n._id, "note", currentuser.token);
        }
        setLikes(counts);
      } catch (err) {
        console.error("Error loading profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (currentuser?.token) fetchProfile();
  }, [userIdToFetch, currentuser, id]);

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId, currentuser.token);
      setMyNotes(myNotes.filter((n) => n._id !== noteId));
      toast.success("Note deleted");
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  const handleUnlike = async (noteId) => {
    try {
      await toggleLike(noteId, currentuser.token);
      setLikedNotes((prev) => prev.filter((n) => n._id !== noteId));
      const count = await getLikesCount(noteId, "note", currentuser.token);
      setLikes((prev) => ({ ...prev, [noteId]: count }));
      toast.success("Unliked note");
    } catch (err) {
      toast.error("Failed to unlike note");
    }
  };

  const handleLike = async (noteId) => {
    try {
      await toggleLike(noteId, currentuser.token);
      const count = await getLikesCount(noteId, "note", currentuser.token);
      setLikes((prev) => ({ ...prev, [noteId]: count }));
    } catch {
      toast.error("Error toggling like");
    }
  };

  const handleConfirmBlock = (userId, isBlocked) => {
    setConfirmDialog({
      open: true,
      userId,
      isBlocked,
    });
  };

  const handleToggleBlock = async () => {
    const { userId, isBlocked } = confirmDialog;
    if (!currentuser?.token) return toast.error("Please login first");

    try {
      await toggleBlockUser(userId, !isBlocked, currentuser.token);
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      setProfile((prev) => ({ ...prev, isBlocked: !isBlocked }));
    } catch (err) {
      console.error(err);
      toast.error("Error updating block status");
    } finally {
      setConfirmDialog({ open: false, userId: null, isBlocked: false });
    }
  };

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: null,
    isBlocked: false,
  });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) return null;

  const renderMedia = (media) => {
    if (!media || media.length === 0) return null;

    const file = media[0];
    const isVideo = file.endsWith(".mp4");

    const src = file.startsWith("http")
      ? file
      : `http://localhost:5123/${file.replace(/^\/+/, "").replace(/\\/g, "/")}`;

    return (
      <Box
        sx={{
          mt: 2,
          mb: 2,
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#111",
          height: 180,
          px: 1,
        }}
      >
        {isVideo ? (
          <video
            src={src}
            controls
            style={{
              width: "65%",
              height: "auto",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "10px",
            }}
          />
        ) : (
          <img
            src={src}
            alt="note media"
            style={{
              width: "65%",
              height: "auto",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "10px",
              backgroundColor: "#000",
              transition: "transform 0.3s ease",
            }}
            onError={(e) => (e.target.style.display = "none")}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.03)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          />
        )}
      </Box>
    );
  };

  const renderNoteCard = (note, isOwn = false, isLiked = false) => (
    <Paper
      key={note._id}
      elevation={5}
      sx={{
        borderRadius: 3,
        p: 2,
        mb: 3,
        bgcolor: "#1c1c1c",
        color: "#fff",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
        },
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        {note.title}
      </Typography>
      {renderMedia(note.media)}
      <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
        {note.content}
      </Typography>
      <Divider sx={{ my: 1, borderColor: "#333" }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1}>
          {!isLiked ? (
            <>
              <IconButton
                onClick={() => handleLike(note._id)}
                sx={{
                  color: "#90caf9",
                  "&:hover": { color: "#64b5f6", transform: "scale(1.1)" },
                  transition: "0.2s",
                }}
              >
                <ThumbUpIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" color="#bbb">
                {likes[note._id] || 0}
              </Typography>
            </>
          ) : (
            //  If this IS a liked note, just show like count (no like button)
            <Typography variant="body2" color="#bbb">
              👍 {likes[note._id] || 0} Likes
            </Typography>
          )}

          <IconButton
            onClick={() => navigate(`/comments/${note._id}`)}
            sx={{
              color: "#90caf9",
              "&:hover": { color: "#64b5f6", transform: "scale(1.1)" },
              transition: "0.2s",
            }}
          >
            <CommentIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1}>
          {(isOwn || isAdmin) && (
            <>
              {isOwn && (
                <IconButton
                  onClick={() => navigate(`/notes/${note._id}/edit`)}
                  sx={{ color: "#ffca28" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton color="error" onClick={() => handleDelete(note._id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}

          {/* Dislike (unlike) only visible for liked notes */}
          {isLiked && String(userIdToFetch) === String(currentuser._id) && (
            <IconButton
              onClick={() => handleUnlike(note._id)}
              sx={{
                color: "#f44336",
                "&:hover": { color: "#e53935", transform: "scale(1.1)" },
                transition: "0.2s",
              }}
            >
              <ThumbDownIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </Paper>
  );

  const isAdmin = currentuser?.role === "admin";

  return (
    <>
      <Header current="profile" title="User Profile" />
      <Container
        maxWidth="sm"
        sx={{
          mt: 6,
          mb: 6,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            p: 3,
            bgcolor: "#181818",
            color: "#fff",
            border: "1px solid #2a2a2a",
            boxShadow: "0 4px 25px rgba(0,0,0,0.4)",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            mb={3}
          >
            <Avatar
              sx={{
                width: 90,
                height: 90,
                mb: 1.5,
                bgcolor:
                  profile.role === "admin" ? "error.main" : "primary.main",
                fontSize: 36,
                fontWeight: "bold",
                boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              }}
            ></Avatar>

            <Typography variant="h6" fontWeight="bold">
              {profile.name}
            </Typography>
            <Chip
              label={profile.role.toUpperCase()}
              color={profile.role === "admin" ? "error" : "primary"}
              sx={{
                mt: 0.5,
                mb: 1,
                fontWeight: "bold",
              }}
            />

            <Typography variant="body2" sx={{ color: "#bbb" }}>
              {profile.email}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2, borderColor: "#333" }} />

          {/* Admin View */}
          {isAdmin && profile._id !== currentuser._id ? (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                🛠 Manage {profile.role === "admin" ? "Admin" : "User"}
              </Typography>

              <Button
                variant="contained"
                color={profile.isBlocked ? "success" : "error"}
                onClick={() =>
                  handleConfirmBlock(profile._id, profile.isBlocked)
                }
                sx={{ borderRadius: 3, px: 3, mb: 2 }}
              >
                {profile.isBlocked ? "Unblock" : "Block"}
              </Button>

              <Divider sx={{ my: 2, borderColor: "#333" }} />

              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                📝 {profile.name}'s Notes
              </Typography>
              {myNotes.length > 0 ? (
                myNotes.map((n) => renderNoteCard(n, false, false))
              ) : (
                <Typography color="#aaa">No notes yet.</Typography>
              )}

              <Divider sx={{ my: 2, borderColor: "#333" }} />

              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                ❤️ Liked Notes
              </Typography>
              {likedNotes.length > 0 ? (
                likedNotes.map((n) => renderNoteCard(n, false, true))
              ) : (
                <Typography color="#aaa">No liked notes yet.</Typography>
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                📝 My Notes
              </Typography>
              {myNotes.length > 0 ? (
                myNotes.map((n) =>
                  renderNoteCard(
                    n,
                    !id && n.user?._id === currentuser._id,
                    false
                  )
                )
              ) : (
                <Typography color="#aaa">No notes yet.</Typography>
              )}

              <Divider sx={{ my: 2, borderColor: "#333" }} />

              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                ❤️ Liked Notes
              </Typography>
              {likedNotes.length > 0 ? (
                likedNotes.map((n) => renderNoteCard(n, false, true))
              ) : (
                <Typography color="#aaa">No liked notes yet.</Typography>
              )}
            </>
          )}

          <Stack direction="row" spacing={2} mt={3} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => navigate("/notes")}
              sx={{
                borderRadius: 3,
                px: 4,
                borderColor: "#555",
                color: "#fff",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              Back
            </Button>

            {/* Logout button only if it's your own profile */}
            {String(profile._id) === String(currentuser._id) && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  removeCookie("currentuser", { path: "/" });
                  toast.success("Logged out successfully");
                  navigate("/login");
                }}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  borderColor: "#ff4444",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#ff4444", color: "#000" },
                }}
              >
                Logout
              </Button>
            )}
          </Stack>
        </Card>

        {/* Dialogs */}
        <Dialog
          open={confirmDialog.open}
          onClose={() =>
            setConfirmDialog({ open: false, userId: null, isBlocked: false })
          }
        >
          <DialogTitle>
            {confirmDialog.isBlocked ? "Unblock User?" : "Block User?"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to{" "}
              <strong>{confirmDialog.isBlocked ? "unblock" : "block"}</strong>{" "}
              this{" "}
              {profile.role === "admin" ? (
                <strong style={{ color: "red" }}>admin</strong>
              ) : (
                "user"
              )}
              ?
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() =>
                setConfirmDialog({
                  open: false,
                  userId: null,
                  isBlocked: false,
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleBlock}
              color={confirmDialog.isBlocked ? "success" : "error"}
              variant="contained"
            >
              {confirmDialog.isBlocked ? "Unblock" : "Block"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default UserProfile;
