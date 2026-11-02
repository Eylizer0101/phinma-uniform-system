import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Alert,
  Stack,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Email, Phone, LocationOn, School, Assignment, TrackChanges, Security, Notifications, Schedule, Description, Search, Groups, History, Policy, Checkroom, FactCheck, Place } from '@mui/icons-material';
import { motion } from 'framer-motion';

const colors = {
  primary: "#0071a5",
  dark: "#005a8c",
  lightBg: "#E6F4F1",
  neutral: "#F5F5F5",
  text: "#000000",
  white: "#FFFFFF",
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Home = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack width="100%" alignItems="center" sx={{ backgroundColor: colors.white }}>

             {/* HERO SECTION - responsive two-column university landing page */}
       <Box component="section" className="uniform-home-hero" sx={{
         position: 'relative', width: '100%', overflow: 'hidden',
         background: 'linear-gradient(135deg, #50b4cd 0%, #0071a5 100%)',
         color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center',
         minHeight: { xs: 'auto', md: 'calc(100svh - 74px)' },
         pt: { xs: 6, sm: 7, lg: 9 }, pb: { xs: 5, md: 4 }
       }}>
         {/* Decorative corner accents: no wavy backdrop */}
         <Box aria-hidden="true" sx={{ position:'absolute',top:0,left:0,width:{xs:70,md:130},height:{xs:56,md:95},
           background:'linear-gradient(135deg,#f7c45b 0 18%,transparent 18% 30%,#f7c45b 30% 40%,transparent 40%)',opacity:.9,pointerEvents:'none' }} />
         <Container maxWidth={false} sx={{ maxWidth:'1500px',width:'100%', flex:1,display:'flex',alignItems:'center',px:{xs:3,sm:5,lg:9},zIndex:1 }}>
           <Box className="uniform-hero-columns" sx={{width:"100%",display:"grid",gridTemplateColumns:{xs:"minmax(0,1fr)",md:"minmax(0,1fr) minmax(0,1fr)"},gap:{xs:4,md:4,lg:5},alignItems:"center"}}>
             <Box sx={{minWidth:0,width:"100%"}}>
               <Box sx={{maxWidth:680, mx:{xs:'auto',md:0},textAlign:{xs:'center',md:'left'}}}>
                 <Typography component="div" sx={{fontSize:{xs:'1.35rem',sm:'1.75rem',lg:'2.25rem'},fontWeight:800,
                   letterSpacing:'.055em',borderLeft:{xs:'none',md:'6px solid #ffc64d'},pl:{md:2},mb:1}}>
                   PHINMA AU
                 </Typography>
                 <Typography component="h1" sx={{fontSize:{xs:'clamp(2rem,8vw,3.2rem)',md:'clamp(2.05rem,3.15vw,3.8rem)'},
                   fontWeight:800,lineHeight:1.12,letterSpacing:'-.035em',mb:2}}>
                   Uniform Request and <Box component="span" sx={{color:'#ffffff'}}>Tracking System</Box>
                 </Typography>
                 <Box sx={{display:'inline-flex',alignItems:'center',gap:1,px:2,py:.85,mb:2.2,
                   border:'1px solid rgba(255,255,255,.45)',borderRadius:6,backgroundColor:'rgba(0,35,74,.25)'}}>
                   <Place sx={{color:'#ffca55',fontSize:24}}/>
                   <Typography sx={{fontWeight:700,fontSize:{xs:'1rem',md:'1.15rem'}}}>South Campus</Typography>
                 </Box>
                 <Typography sx={{fontSize:{xs:'1rem',md:'1.1rem'},maxWidth:620,lineHeight:1.65,mb:3.5,mx:{xs:'auto',md:0},color:'#eef8ff'}}>
                   Request your uniforms online, track your request status in real time, and get notified when it's ready for pickup.
                 </Typography>
                 {!user && <Stack direction={{xs:'column',sm:'row'}} spacing={1.8} alignItems="center"
                   justifyContent={{xs:'center',md:'flex-start'}} sx={{width:'100%'}}>
                   <Button component={RouterLink} to="/register" variant="contained" startIcon={<Checkroom/>}
                     sx={{height:54,width:{xs:'min(100%,300px)',sm:225},borderRadius:'12px',backgroundColor:'#fff',
                       color:'#0071a5',fontWeight:800,fontSize:'1rem',boxShadow:'0 5px 16px rgba(0,0,0,.13)',
                       '&:hover':{backgroundColor:'#e9f6ff'}}}>GET STARTED</Button>
                   <Button component={RouterLink} to="/login" variant="outlined" startIcon={<School/>}
                     sx={{height:54,width:{xs:'min(100%,300px)',sm:225},borderRadius:'12px',border:'2px solid #fff',
                       color:'#fff',fontWeight:800,fontSize:'1rem',whiteSpace:'nowrap',
                       '&:hover':{border:'2px solid #fff',backgroundColor:'rgba(255,255,255,.13)'}}}>STUDENT LOGIN</Button>
                 </Stack>}
               </Box>
             </Box>
             <Box sx={{minWidth:0,width:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
               <Box component="img" src="/images/Smiling%20Students.png" alt="Students wearing PHINMA AU uniforms"
                 sx={{display:'block',width:'100%',maxWidth:{xs:440,sm:560,md:570,lg:680},height:'auto',objectFit:'contain',
                   maxHeight:{xs:390,sm:460,md:540,lg:610},filter:'drop-shadow(0 14px 24px rgba(0,19,44,.22))'}} />
             </Box>
           </Box>
         </Container>
         {/* Three main benefits - appear below the hero message without covering the image */}
         {!user && <Container maxWidth={false} sx={{maxWidth:'1450px',px:{xs:2.5,sm:4,lg:7},mt:{xs:5,md:3},zIndex:2}}>
           <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(3,minmax(0,1fr))'},
             bgcolor:'#fff',color:'#132d50',borderRadius:'18px',boxShadow:'0 9px 28px rgba(0,25,64,.16)',overflow:'hidden'}}>
             {[
               {title:'Request Uniform',desc:'Submit your uniform request quickly and easily.',icon:<Checkroom/>},
               {title:'Track Request',desc:'Monitor the status of your request in real time.',icon:<FactCheck/>},
               {title:'Get Notified',desc:'Receive updates when your uniform is ready for pickup.',icon:<Notifications/>}
             ].map((feature,index)=><Box key={feature.title} sx={{px:{xs:2.5,lg:3.5},py:{xs:2.5,lg:3},
               display:'flex',alignItems:'center',gap:2,borderRight:{sm:index<2?'1px solid #d4e2ee':'none'},
               borderBottom:{xs:index<2?'1px solid #e4edf5':'none',sm:'none'}}}>
               <Box sx={{display:'grid',placeItems:'center',flexShrink:0,width:60,height:60,bgcolor:'#e5f4ff',borderRadius:'14px',color:'#006aa7',
                 '& svg':{fontSize:33}}}>{feature.icon}</Box>
               <Box><Typography sx={{fontSize:{xs:'1rem',lg:'1.1rem'},fontWeight:800}}>{feature.title}</Typography>
                 <Typography sx={{color:'#42576a',fontSize:'.89rem',lineHeight:1.45,mt:.4}}>{feature.desc}</Typography></Box>
             </Box>)}
           </Box>
         </Container>}
       </Box>

{/* QUICK ACTIONS FOR LOGGED IN USERS */}
      {user && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom color={colors.primary} fontWeight="bold">
            Quick Actions
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }, borderRadius: '20px' }}>
                <Assignment sx={{ fontSize: 60, color: colors.primary, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold" color={colors.primary}>
                  Request Uniform
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Submit a new uniform request for Daily, PE, NSTP, or Formal uniforms.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/request-uniform"
                  size="large"
                  sx={{ 
                    fontWeight: 'bold', 
                    px: 4,
                    bgcolor: colors.primary,
                    borderRadius: '10px',
                    '&:hover': {
                      bgcolor: colors.dark,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Request Now
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }, borderRadius: '20px' }}>
                <TrackChanges sx={{ fontSize: 60, color: colors.primary, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold" color={colors.primary}>
                  Track Requests
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Check the status of your uniform requests and manage them.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/track-request"
                  size="large"
                  sx={{ 
                    fontWeight: 'bold', 
                    px: 4,
                    bgcolor: colors.primary,
                    borderRadius: '10px',
                    '&:hover': {
                      bgcolor: colors.dark,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  View Requests
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}

    {/* ABOUT SYSTEM */}

<Container id="about" sx={{ py: 6, my: 2 }}>
  <Typography variant="h4" fontWeight="bold" textAlign="center" color={colors.dark} mb={4}>
    About This System
  </Typography>
  
  <Grid container spacing={3} justifyContent="center">
    <Grid item xs={12} md={5}>
      <Card sx={{ 
        p: 4, 
        textAlign: 'center',
        borderRadius: '16px',
        backgroundColor: colors.white,
        border: `2px solid ${colors.primary}`,
        boxShadow: '0 8px 20px rgba(0,113,165,0.15)',
        height: '100%'
      }}>
        <Assignment sx={{ fontSize: 50, color: colors.primary, mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" color={colors.primary} gutterBottom>
          For Students
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Request school uniforms online. Upload your ORF (Official Receipt Form) as payment proof.
        </Typography>
      </Card>
    </Grid>
    
    <Grid item xs={12} md={5}>
      <Card sx={{ 
        p: 4, 
        textAlign: 'center',
        borderRadius: '16px',
        backgroundColor: colors.primary,
        color: colors.white,
        boxShadow: '0 8px 20px rgba(0,113,165,0.2)',
        height: '100%'
      }}>
        <LocationOn sx={{ fontSize: 50, color: colors.white, mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" color={colors.white} gutterBottom>
          Campus Pickup
        </Typography>
        <Typography variant="body1" sx={{ color: colors.white }}>
          Collect uniforms at PHINMA AU South Campus. No delivery service. We notify you when ready.
        </Typography>
      </Card>
    </Grid>
  </Grid>

  
</Container>

      {/* HOW IT WORKS SECTION */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" color={colors.dark} mb={2}>
          How It Works
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={4}>
          Get your uniform in 3 simple steps
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {[
            {
              title: "Request Uniform",
              desc: "Choose from different uniform types and sizes",
              icon: <Description sx={{ fontSize: 50, color: colors.primary }} />,
            },
            {
              title: "Track Status", 
              desc: "Monitor your request status in real-time",
              icon: <Search sx={{ fontSize: 50, color: colors.primary }} />,
            },
            {
              title: "Pickup Ready",
              desc: "Get notified when ready for collection",
              icon: <Notifications sx={{ fontSize: 50, color: colors.primary }} />,
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index} sx={{ display: 'flex' }}>
              <Card 
                sx={{
                  p: 3,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: "12px",
                  border: `2px solid ${colors.primary}20`,
                  backgroundColor: colors.white,
                  transition: "all 0.3s ease",
                  minHeight: '250px',
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 25px rgba(0,113,165,0.15)",
                  },
                }}
              >
                {/* Step Number */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: colors.primary,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.white,
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    mb: 2
                  }}
                >
                  {index + 1}
                </Box>

                {/* Icon */}
                <Box sx={{ mb: 2 }}>
                  {item.icon}
                </Box>

                {/* Content */}
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  color={colors.dark}
                  sx={{ mb: 1 }}
                >
                  {item.title}
                </Typography>
                
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CONTACT SECTION */}
      <Container id="contact" sx={{ py: 8 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={6}
          sx={{
            backgroundColor: colors.white,
            borderTop: `3px solid ${colors.primary}`,
            boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            borderRadius: "16px",
            p: 4,
          }}
        >
          {/* Left Side - Contact Info */}
          <Stack spacing={3} width={{ xs: "100%", md: "50%" }}>
            <Typography variant="h5" fontWeight="bold" color={colors.dark} textTransform="uppercase" letterSpacing={1}>
              Contact Us
            </Typography>

            <Typography color="text.secondary" maxWidth="500px" sx={{ lineHeight: 1.7 }}>
              Have questions or need assistance with uniform requests? Feel free to reach out to us. We're here to help you with any concerns.
            </Typography>

            <Stack spacing={2.5} mt={2}>
              {/* Location */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ backgroundColor: colors.lightBg, p: 1.5, borderRadius: "12px", transition: "0.3s", "&:hover": { backgroundColor: "#D8F0EA" } }}>
                <LocationOn sx={{ fontSize: "2rem", color: colors.primary }} />
                <Typography color={colors.dark} fontWeight={500}>
                  PHINMA AU South Campus, Cabanatuan City
                </Typography>
              </Stack>

              {/* Email */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ backgroundColor: colors.lightBg, p: 1.5, borderRadius: "12px", transition: "0.3s", "&:hover": { backgroundColor: "#D8F0EA" } }}>
                <Email sx={{ fontSize: "2rem", color: colors.primary }} />
                <Typography color={colors.dark} fontWeight={500}>
                  uniform.office@phinmaed.edu.ph
                </Typography>
              </Stack>

              {/* Phone */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ backgroundColor: colors.lightBg, p: 1.5, borderRadius: "12px", transition: "0.3s", "&:hover": { backgroundColor: "#D8F0EA" } }}>
                <Phone sx={{ fontSize: "2rem", color: colors.primary }} />
                <Typography color={colors.dark} fontWeight={500}>
                  (044) 940-9856
                </Typography>
              </Stack>

              {/* Schedule */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ backgroundColor: colors.lightBg, p: 1.5, borderRadius: "12px", transition: "0.3s", "&:hover": { backgroundColor: "#D8F0EA" } }}>
                <Schedule sx={{ fontSize: "2rem", color: colors.primary }} />
                <Typography color={colors.dark} fontWeight={500}>
                  Mon-Fri: 8AM-5PM, Sat: 8AM-12PM
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Contact Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2.5, width: { xs: "100%", md: "80%" }, backgroundColor: "#F9FBFB", p: 4, borderRadius: "16px", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
            {success && (
              <Alert severity="success" sx={{ borderRadius: '10px' }}>
                Your message has been sent successfully! We will get back to you soon.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            <TextField
              placeholder="Your Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              InputLabelProps={{ shrink: false }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#B0DCD1" },
                  "&:hover fieldset": { borderColor: colors.primary },
                  "&.Mui-focused fieldset": { borderColor: colors.primary },
                },
                "& input::placeholder": { color: "#888", opacity: 1 },
              }}
            />

            <TextField
              placeholder="Your Email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              InputLabelProps={{ shrink: false }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#B0DCD1" },
                  "&:hover fieldset": { borderColor: colors.primary },
                  "&.Mui-focused fieldset": { borderColor: colors.primary },
                },
                "& input::placeholder": { color: "#888", opacity: 1 },
              }}
            />

            <TextField
              placeholder="Your Message"
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
              InputLabelProps={{ shrink: false }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#B0DCD1" },
                  "&:hover fieldset": { borderColor: colors.primary },
                  "&.Mui-focused fieldset": { borderColor: colors.primary },
                },
                "& textarea::placeholder": { color: "#888", opacity: 1 },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: colors.primary,
                color: colors.white,
                fontWeight: "bold",
                fontSize: "1rem",
                borderRadius: "10px",
                py: 1.2,
                px: 4,
                alignSelf: "flex-start",
                textTransform: "none",
                transition: "0.3s",
                "&:hover": { 
                  bgcolor: colors.dark, 
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,113,165,0.3)"
                },
                "&:disabled": {
                  bgcolor: "#cccccc",
                  color: "#666666"
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'inherit' }} />
                  Sending...
                </Box>
              ) : (
                "Send Message"
              )}
            </Button>
          </Box>
        </Stack>
      </Container>

      {/* FOOTER */}
      <Box sx={{ bgcolor: colors.primary, color: colors.white, py: 4, width: '100%' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" textAlign="center">
            © 2024 PHINMA Araullo University - South Campus. All rights reserved.
          </Typography>
          <Typography variant="body2" textAlign="center" sx={{ mt: 1, opacity: 0.8 }}>
            Uniform Request System v1.0
          </Typography>
        </Container>
      </Box>
    </Stack>
  );
};

export default Home;