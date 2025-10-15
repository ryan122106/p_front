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
import { useCookies } from "react-cookie";
import { login } from "../../utils/api_user";

const Login = () => {
  const navigate = useNavigate();
  const [, setCookie] = useCookies(["currentuser"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleFormSubmit = async () => {
    try {
      if (!email || !password) {
        toast.error("Please fill up all the fields");
        return;
      }
      const userData = await login(email, password);
      setCookie("currentuser", userData, { maxAge: 60 * 60 * 8 });
      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <Header current="login" />

      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          bgcolor: "linear-gradient(135deg, #1a1c20, #0d1117)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Container maxWidth="xs">
          <Card
            sx={{
              p: 4,
              borderRadius: 4,
              boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
              bgcolor: "rgba(30, 30, 40, 0.95)",
              color: "grey.100",
              backdropFilter: "blur(8px)",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              {/* Logo */}
              <Box textAlign="center" mb={2}>
                <img
                  src="/chat.png"
                  alt="Chattrix Logo"
                  style={{ width: 60, height: 60}}
                />
              </Box>

              <Typography
                variant="h4"
                align="center"
                fontWeight={700}
                gutterBottom
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body2"
                align="center"
                color="grey.400"
                mb={3}
              >
                Log in to continue your journey
              </Typography>

              {/* Email */}
              <Box mb={3}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  InputProps={{
                    style: { color: "white" },
                  }}
                />
              </Box>

              {/* Password */}
              <Box mb={3}>
                <TextField
                  type="password"
                  label="Password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  InputProps={{
                    style: { color: "white" },
                  }}
                />
              </Box>

              {/* Submit Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  bgcolor: "primary.main",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 2,
                  py: 1.2,
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
                onClick={handleFormSubmit}
              >
                Login
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }}>
                <Typography variant="caption" color="grey.500">
                  OR
                </Typography>
              </Divider>

              {/* Sign Up Redirect */}
              <Typography
                variant="body2"
                align="center"
                color="grey.400"
              >
                Don’t have an account?{" "}
                <Button
                  onClick={() => navigate("/signup")}
                  sx={{
                    textTransform: "none",
                    color: "primary.main",
                    fontWeight: "bold",
                  }}
                >
                  Sign Up
                </Button>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default Login;
