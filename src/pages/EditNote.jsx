import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../components/Header";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import axios from "axios";
import { getNoteById, updateNote } from "../utils/api_notes";
import { API_URL } from "../utils/constants";

// Helper: determine MIME type from file extension
const getMimeTypeFromUrl = (url) => {
  const ext = url.split(".").pop()?.toLowerCase();
  if (["mp4", "webm", "ogg"].includes(ext)) return `video/${ext}`;
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
    return `image/${ext}`;
  return "application/octet-stream";
};

// Helper: convert relative/absolute URLs to full URL
const getFullFileUrl = (url) => {
  if (url.startsWith("http")) return url;
  return `${API_URL.replace(/\/api$/, "")}${url}`;
};

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cookies] = useCookies(["currentuser"]);
  const { currentuser = {} } = cookies;
  const { token = "" } = currentuser;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]); // newly added files
  const [preview, setPreview] = useState([]); // {url, type, isNew}
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const note = await getNoteById(id, token);
        setTitle(note.title);
        setContent(note.content);
        const fullPreviews = (note.media || []).map((url) => ({
          url: getFullFileUrl(url),
          type: getMimeTypeFromUrl(url),
          isNew: false, // existing files
        }));
        setPreview(fullPreviews);
      } catch {
        toast.error("Error loading note");
      }
    };
    fetchNote();
  }, [id, token]);

  // Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    const newPreviews = acceptedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      isNew: true, // mark as newly added
    }));
    setPreview((prev) => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  const handleRemovePreview = (index) => {
    const p = preview[index];
    if (p.isNew) {
      setFiles((prev) => prev.filter((_, i) => i !== files.indexOf(p)));
    }
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      // Keep only existing files' relative URLs
      return preview
        .filter((p) => !p.isNew)
        .map((p) => p.url.replace(API_URL.replace(/\/api$/, ""), ""));
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("media", file));

    const res = await axios.post(`${API_URL}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    // combine existing files with newly uploaded URLs
    const uploadedUrls = res.data.urls;
    const existingUrls = preview
      .filter((p) => !p.isNew)
      .map((p) => p.url.replace(API_URL.replace(/\/api$/, ""), ""));
    return [...existingUrls, ...uploadedUrls];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      const mediaUrls = await uploadFiles();
      await updateNote(id, { title, content, media: mediaUrls }, token);
      toast.success("Note updated successfully");
      navigate("/notes");
    } catch (err) {
      console.error(err);
      toast.error("Error updating note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header current="notes" title="Edit Note" />
      <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
        <Paper
          sx={{ p: 4, borderRadius: 4, bgcolor: "#1e1e1e", color: "#f5f5f5" }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Edit Your Note
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              margin="normal"
              InputLabelProps={{ style: { color: "#aaa" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": { borderColor: "#444" },
                  "&:hover fieldset": { borderColor: "#888" },
                },
              }}
            />

            <TextField
              fullWidth
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              multiline
              rows={4}
              margin="normal"
              InputLabelProps={{ style: { color: "#aaa" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": { borderColor: "#444" },
                  "&:hover fieldset": { borderColor: "#888" },
                },
              }}
            />

            {/* Dropzone */}
            <Box
              {...getRootProps()}
              sx={{
                mt: 2,
                mb: 2,
                p: 2,
                border: "2px dashed #888",
                borderRadius: 3,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: isDragActive ? "#333" : "#1e1e1e",
              }}
            >
              <input {...getInputProps()} />
              <Typography>
                {isDragActive
                  ? "Drop files here..."
                  : "Drag & drop media here or click to select files"}
              </Typography>
            </Box>

            {/* Previews */}
            {preview.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
                {preview.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: 120,
                      height: 120,
                      borderRadius: 3,
                      overflow: "hidden",
                      border: "1px solid #333",
                      backgroundColor: "#000",
                    }}
                  >
                    {item.type.startsWith("video") ? (
                      <video
                        src={item.url}
                        controls
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={`preview-${index}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePreview(index)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "rgba(0,0,0,0.5)",
                        color: "#fff",
                        "&:hover": { background: "rgba(0,0,0,0.7)" },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ borderRadius: 3 }}
              >
                Update Note
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/notes")}
                sx={{ borderRadius: 3, color: "#fff", borderColor: "#444" }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to update this note?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditNote;
