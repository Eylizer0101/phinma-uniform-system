import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stack,
  Avatar,
  Grid,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState({
    fullName: "",
    contactNumber: "",
    yearLevel: "",
    email: "",
    studentId: "",
    address: "",
    course: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        contactNumber: user.contactNumber || "",
        yearLevel: user.yearLevel || "",
        email: user.email || "",
        studentId: user.studentId || "",
        address: user.address || "",
        course: user.course || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile({
        fullName: profileData.fullName,
        contactNumber: profileData.contactNumber,
        yearLevel: profileData.yearLevel,
        address: profileData.address,
        course: profileData.course,
      });
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const yearLevels = [
    "1st Year College",
    "2nd Year College",
    "3rd Year College",
    "4th Year College",
  ];

  const courses = [
    "BS Accountancy",
    "BS Business Administration",
    "BS Business Administration (Marketing Management)",
    "BS Business Administration (Banking and Microfinance)",
    "BS Business Administration (Financial Management)",
    "BS Business Administration (Human Resource Management)",
    "BS Entrepreneurship",
    "BS Hospitality Management",
    "BS Tourism Management",
    "BS Criminology",
    "BS Civil Engineering",
    "BS Electrical Engineering",
    "BS Information Technology",
    "BS Information Technology (Business Informatics)",
    "BS Information Technology (System Development)",
    "BS Nursing",
    "BS Pharmacy",
    "BS Medical Laboratory Science",
    "BS Psychology",
    "BSED (Bachelor of Secondary Education)",
    "BSED (Science)",
    "BSED (Mathematics)",
    "BSED (English)",
    "BSED (Filipino)",
    "BA Political Science",
    "BA English Language",
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: "linear-gradient(180deg, #b9d9f9ff 0%, #ffffffff 100%)",
      py: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={4}
          sx={{
            p: 5,
            borderRadius: 4,
            backgroundColor: "#fff",
            minHeight: "85vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: "#0071a5",
              color: "white",
              p: 3,
              borderRadius: 2,
              textAlign: "center",
              mb: 4,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              My Profile
            </Typography>
            <Typography variant="body2">
              View and edit your personal information
            </Typography>
          </Box>

          {/* Profile Info */}
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 4 }}>
            <Avatar
              alt="Profile"
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#0071a5",
                fontSize: 40,
                fontWeight: "bold",
              }}
            >
              {profileData.fullName ? profileData.fullName[0].toUpperCase() : "U"}
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight="bold">
                {profileData.fullName || "Unnamed User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.email}
              </Typography>
            </Box>
          </Stack>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  fullWidth
                  size="medium"
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Student ID"
                  name="studentId"
                  value={profileData.studentId}
                  fullWidth
                  size="medium"
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Number"
                  name="contactNumber"
                  value={profileData.contactNumber}
                  onChange={handleChange}
                  fullWidth
                  size="medium"
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  fullWidth
                  size="medium"
                  disabled={!editMode}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Year Level"
                  name="yearLevel"
                  value={profileData.yearLevel}
                  onChange={handleChange}
                  fullWidth
                  size="medium"
                  disabled={!editMode}
                  SelectProps={{
                    native: true,
                  }}
                >
                 
                  {yearLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Course"
                  name="course"
                  value={profileData.course}
                  onChange={handleChange}
                  fullWidth
                  size="medium"
                  disabled={!editMode}
                  SelectProps={{
                    native: true,
                  }}
                >
                 
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  value={profileData.email}
                  fullWidth
                  size="medium"
                  disabled
                />
              </Grid>
            </Grid>

            {/* Buttons */}
            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={2}
              sx={{ mt: 5 }}
            >
              {!editMode ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  sx={{
                    backgroundColor: "#0071a5",
                    "&:hover": { backgroundColor: "#005f8a" },
                    textTransform: "none",
                    px: 3,
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setEditMode(false);
                      setProfileData({
                        fullName: user.fullName || "",
                        contactNumber: user.contactNumber || "",
                        yearLevel: user.yearLevel || "",
                        email: user.email || "",
                        studentId: user.studentId || "",
                        address: user.address || "",
                        course: user.course || "",
                      });
                    }}
                    sx={{
                      borderColor: "#0071a5",
                      color: "#0071a5",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#E6F2FA",
                        borderColor: "#005f8a",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      backgroundColor: "#0071a5",
                      "&:hover": { backgroundColor: "#005f8a" },
                      textTransform: "none",
                    }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;