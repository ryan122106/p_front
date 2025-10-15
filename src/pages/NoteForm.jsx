import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
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
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    const formData = new FormData();
    files.forEach((file) => formData.append("media", file));

    const res = await axios.post(`${process.env.REACT_APP_API_URL}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        <Paper sx={{ p: 4, borderRadius: 4, bgcolor: "#1e1e1e", color: "#fff" }}>
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
              {isDragActive ? (
                <Typography>Drop the files here...</Typography>
              ) : (
                <Typography>Drag & drop media here, or click to select files</Typography>
              )}
            </Box>

            {/* Previews */}
            {files.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
                {files.map((file, index) => (
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
                    {file.type.startsWith("video") ? (
                      <video
                        src={URL.createObjectURL(file)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        controls
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(index)}
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
              <Button type="submit" variant="contained" disabled={loading} sx={{ borderRadius: 3 }}>
                Create Note
              </Button>
              <Button variant="outlined" onClick={() => navigate("/notes")} sx={{ borderRadius: 3, color: "#fff", borderColor: "#444" }}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default NoteForm;
