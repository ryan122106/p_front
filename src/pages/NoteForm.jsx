import { useState } from "react";
import { useNavigate } from "react-router";
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
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../components/Header";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import axios from "axios";
import { createNote } from "../utils/api_notes";

const NoteForm = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies(["currentuser"]);
  const { currentuser = {} } = cookies;
  const { token = "" } = currentuser;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previews = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setPreview(previews);
  };

  const handleRemovePreview = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    const formData = new FormData();
    files.forEach((file) => formData.append("media", file));

    const res = await axios.post(
      `${window.location.origin}/api/image`, // <-- use current origin dynamically
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.urls;
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
      await createNote({ title, content, media: mediaUrls }, token);
      toast.success("Note created successfully");
      navigate("/notes");
    } catch (err) {
      console.error(err);
      toast.error("Error creating note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header current="notes" title="Create Note" />

      <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: 3,
            bgcolor: "#1e1e1e",
            color: "#f5f5f5",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Share a New Note
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
              label="What's on your mind?"
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

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{
                mt: 2,
                mb: 2,
                borderRadius: 3,
                color: "#fff",
                borderColor: "#444",
              }}
            >
              Upload Media
              <input
                type="file"
                name="media"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </Button>

            {preview.length > 0 && (
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={2}
                sx={{ mt: 2, mb: 2 }}
              >
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#000",
                    }}
                  >
                    {item.type.startsWith("video") ? (
                      <video
                        src={item.url}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        controls
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
                Create Note
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/notes")}
                sx={{
                  borderRadius: 3,
                  color: "#fff",
                  borderColor: "#444",
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Creation</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to create this note?</Typography>
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

export default NoteForm;
