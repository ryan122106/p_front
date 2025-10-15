import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Box,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import Header from "../components/Header";
import { getUsers, updateUserRole, toggleBlockUser } from "../utils/api_user";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cookies, setCookie] = useCookies(["currentuser"]);
  const { currentuser } = cookies;
  const navigate = useNavigate();

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers(currentuser?.token, debouncedSearch);
        setUsers(res);
        setFilteredUsers(res);
      } catch (err) {
        toast.error("Failed to fetch users");
      }
    };
    if (currentuser?.token) fetchUsers();
  }, [debouncedSearch, currentuser]);
  useEffect(() => {
    if (!search.trim()) return setFilteredUsers(users);
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const openConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };
  const handleRoleChange = async (id, newRole) => {
    try {
      const updated = await updateUserRole(id, newRole, currentuser?.token);
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u))
      );
      if (updated._id === currentuser?._id) {
        setCookie(
          "currentuser",
          { ...currentuser, role: updated.role },
          { path: "/" }
        );
      }
      toast.success(`User role updated to ${newRole}`);
    } catch {
      toast.error("Error updating role");
    }
  };
  const handleBlockToggle = async (id, isBlocked) => {
    try {
      const updated = await toggleBlockUser(id, isBlocked, currentuser?.token);
      setUsers((prev) =>
        prev.map((u) => (u._id === updated.user._id ? updated.user : u))
      );
      toast.success(`User ${isBlocked ? "blocked" : "unblocked"} successfully`);
    } catch {
      toast.error("Error updating block status");
    }
  };
  if (!currentuser || currentuser.role !== "admin") {
    return (
      <Box
        sx={{ bgcolor: "#121212", minHeight: "100vh", color: "#f5f5f5", pt: 4 }}
      >
        <Container maxWidth="sm">
          <Typography variant="h6" color="error">
            Access denied. Admins only.
          </Typography>
        </Container>
      </Box>
    );
  }
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
  };

  return (
    <>
      <Header title="Admin Panel" current="admin" />
      <Box
        sx={{ bgcolor: "#121212", minHeight: "100vh", color: "#f5f5f5", pt: 3 }}
      >
        <Container maxWidth="md">
          <MotionDiv
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Manage Users
            </Typography>
            <Divider sx={{ borderColor: "#333", mb: 3 }} />
            <TextField
              fullWidth
              placeholder="Search by name or email..."
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                mb: 3,
                bgcolor: "#1e1e1e",
                borderRadius: 2,
                input: { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#555" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#aaa" }} />
                  </InputAdornment>
                ),
              }}
            />

            {filteredUsers.length === 0 ? (
              <Typography sx={{ color: "#aaa" }}>
                No users found for "{search}".
              </Typography>
            ) : (
              <MotionDiv
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredUsers.map((u) => (
                    <MotionDiv key={u._id} variants={cardVariants} exit="exit">
                      <Card
                        sx={{
                          mb: 2,
                          borderRadius: 3,
                          bgcolor: "#1e1e1e",
                          color: "#fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                          transition: "transform 0.25s, box-shadow 0.25s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                          },
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
                              src={u.avatar}
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                bgcolor: "primary.main",
                                cursor: "pointer",
                                "&:hover": { transform: "scale(1.1)" },
                                transition: "0.2s",
                              }}
                              onClick={() => navigate(`/profile/${u._id}`)}
                            />
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {u.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#aaa" }}
                              >
                                {u.email}
                              </Typography>
                              <Typography variant="caption">
                                Role: {u.role}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>

                        <Divider sx={{ borderColor: "#333" }} />

                        <CardActions sx={{ p: 2, gap: 1 }}>
                          {u.role !== "admin" ? (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() =>
                                openConfirmDialog(
                                  "Promote to Admin",
                                  `Are you sure you want to make ${u.name} an admin?`,
                                  () => handleRoleChange(u._id, "admin")
                                )
                              }
                            >
                              Make Admin
                            </Button>
                          ) : (
                            <Button
                              sx={{
                                color: "white",
                                border: "1px solid white",
                                borderRadius: "6px",
                                textTransform: "none",
                                pointerEvents: "none",
                                opacity: 0.8,
                              }}
                            >
                              Admin (Locked)
                            </Button>
                          )}

                          {/* Block / Unblock */}
                          {u._id !== currentuser._id && u.role !== "admin" && (
                            <Button
                              variant="outlined"
                              color={u.isBlocked ? "success" : "error"}
                              onClick={() =>
                                openConfirmDialog(
                                  `${u.isBlocked ? "Unblock" : "Block"} User`,
                                  `Are you sure you want to ${
                                    u.isBlocked ? "unblock" : "block"
                                  } ${u.name}?`,
                                  () => handleBlockToggle(u._id, !u.isBlocked)
                                )
                              }
                            >
                              {u.isBlocked ? "Unblock" : "Block"}
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </MotionDiv>
                  ))}
                </AnimatePresence>
              </MotionDiv>
            )}
          </MotionDiv>
        </Container>
      </Box>

      {/* Dialogs */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              confirmDialog.onConfirm?.();
              setConfirmDialog({ ...confirmDialog, open: false });
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminPage;
