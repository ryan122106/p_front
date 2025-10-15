import { Link, useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";

const Header = ({ current, title = "Chattrix" }) => {
  const [cookies, , removeCookie] = useCookies(["currentuser"]);
  const navigate = useNavigate();
  const { currentuser } = cookies;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    removeCookie("currentuser");
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={3}
      sx={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(6px)",
        color: "text.primary",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          cursor: "default",
          position: "relative",
        }}
      >
        {/* Left Section - Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src="/chat.png"
            alt="Chattrix Logo"
            style={{ width: 32, height: 32 }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Center Section - Navigation (hidden on mobile) */}
        {!isMobile && (
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 2,
            }}
          >
            <Button
              component={Link}
              to="/notes"
              color={current === "notes" ? "primary" : "inherit"}
              variant={current === "notes" ? "contained" : "text"}
              sx={{ borderRadius: 2 }}
            >
              Chattrix
            </Button>

            {currentuser?.role === "admin" && (
              <Button
                color={current === "admin" ? "primary" : "inherit"}
                variant={current === "admin" ? "contained" : "text"}
                onClick={() => navigate("/admin")}
              >
                Manage User
              </Button>
            )}
          </Box>
        )}

        {/* Right Section - User / Auth */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isMobile && (
            <>
              <IconButton onClick={handleMenuOpen} color="inherit">
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  component={Link}
                  to="/notes"
                  onClick={handleMenuClose}
                >
                  Chattrix
                </MenuItem>

                {currentuser?.role === "admin" && (
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/admin");
                    }}
                  >
                    Manage User
                  </MenuItem>
                )}

                {!currentuser && (
                  <>
                    <MenuItem
                      component={Link}
                      to="/login"
                      onClick={handleMenuClose}
                    >
                      Login
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/signup"
                      onClick={handleMenuClose}
                    >
                      Sign Up
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          )}

          {currentuser ? (
            <>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                onClick={() => navigate("/profile")}
                style={{ cursor: "pointer" }}
              >
                <Avatar
                  sx={{ bgcolor: "primary.main", width: 32, height: 32 }}
                ></Avatar>
                {!isMobile && (
                  <Typography variant="body2" fontWeight={500}>
                    {currentuser.name}
                  </Typography>
                )}
              </Box>
              {!isMobile && <Divider orientation="vertical" flexItem />}
              {!isMobile && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  sx={{ textTransform: "none" }}
                >
                  Logout
                </Button>
              )}
            </>
          ) : (
            !isMobile && (
              <>
                <Button
                  component={Link}
                  to="/login"
                  color={current === "login" ? "primary" : "inherit"}
                  variant={current === "login" ? "contained" : "outlined"}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  color={current === "signup" ? "primary" : "inherit"}
                  variant={current === "signup" ? "contained" : "outlined"}
                >
                  Sign Up
                </Button>
              </>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
