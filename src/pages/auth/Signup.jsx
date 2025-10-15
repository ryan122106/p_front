import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import Header from "../../components/Header";
import { toast } from "sonner";
import { signup } from "../../utils/api_user";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // new state

  const handleFormSubmit = async () => {
    try {
      if (!name || !email || !password || !confirmPassword) {
        toast.error("Please fill up all the fields");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      await signup(name, email, password);
      toast.success("Account created! You can now login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <>
      <Header current="signup" />

      <Box
        sx={{
          height: "calc(100vh - 64px)",
          bgcolor: "linear-gradient(135deg, #1a1c20, #0d1117)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xs">
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 6px 25px rgba(0,0,0,0.4)",
              bgcolor: "rgba(30, 30, 40, 0.95)",
              color: "grey.100",
              backdropFilter: "blur(8px)",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "translateY(-3px)" },
              maxWidth: 360,
              mx: "auto",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Logo */}
              <Box textAlign="center" mb={1.5}>
                <img
                  src="/chat.png"
                  alt="Chattrix Logo"
                  style={{ width: 48, height: 48}}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="h6"
                align="center"
                fontWeight={700}
                gutterBottom
              >
                Create Account
              </Typography>
              <Typography
                variant="body2"
                align="center"
                color="grey.400"
                mb={2}
              >
                Join Chattrix today
              </Typography>

              {/* Name */}
              <TextField
                label="Full Name"
                type="text"
                fullWidth
                margin="dense"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{
                  style: { color: "white" },
                }}
              />

              {/* Email */}
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="dense"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{
                  style: { color: "white" },
                }}
              />

              {/* Password */}
              <TextField
                type="password"
                label="Password"
                fullWidth
                margin="dense"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{
                  style: { color: "white" },
                }}
              />

              {/* Confirm Password */}
              <TextField
                type="password"
                label="Confirm Password"
                fullWidth
                margin="dense"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{
                  style: { color: "white" },
                }}
              />

              {/* Signup Button */}
              <Button
                variant="contained"
                fullWidth
                size="medium"
                sx={{
                  mt: 2,
                  bgcolor: "primary.main",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 2,
                  py: 1,
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
                onClick={handleFormSubmit}
              >
                Sign Up
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }}>
                <Typography variant="caption" color="grey.500">
                  OR
                </Typography>
              </Divider>

              {/* Redirect to Login */}
              <Typography variant="body2" align="center" color="grey.400">
                Already have an account?{" "}
                <Button
                  onClick={() => navigate("/login")}
                  sx={{
                    textTransform: "none",
                    color: "primary.main",
                    fontWeight: "bold",
                  }}
                >
                  Login
                </Button>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default Signup;
