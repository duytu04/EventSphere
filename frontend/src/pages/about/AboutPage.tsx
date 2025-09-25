import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  BoltRounded as BoltRoundedIcon,
  PeopleAltRounded as PeopleAltRoundedIcon,
  EventAvailableRounded as EventAvailableRoundedIcon,
  SecurityRounded as SecurityRoundedIcon,
  SpeedRounded as SpeedRoundedIcon,
  SupportAgentRounded as SupportAgentRoundedIcon,
} from "@mui/icons-material";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (d = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] } 
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (d = 0) => ({ 
    opacity: 1, 
    transition: { duration: 0.5, delay: d } 
  }),
};

const features = [
  {
    icon: <EventAvailableRoundedIcon sx={{ fontSize: 40 }} />,
    title: "Quản lý sự kiện thông minh",
    description: "Tạo, quản lý và theo dõi sự kiện một cách dễ dàng với giao diện trực quan và tính năng đầy đủ.",
  },
  {
    icon: <PeopleAltRoundedIcon sx={{ fontSize: 40 }} />,
    title: "Kết nối cộng đồng",
    description: "Xây dựng cộng đồng mạnh mẽ thông qua các sự kiện tương tác và trải nghiệm đáng nhớ.",
  },
  {
    icon: <SecurityRoundedIcon sx={{ fontSize: 40 }} />,
    title: "Bảo mật cao",
    description: "Dữ liệu và thông tin cá nhân được bảo vệ với các tiêu chuẩn bảo mật hàng đầu.",
  },
  {
    icon: <SpeedRoundedIcon sx={{ fontSize: 40 }} />,
    title: "Hiệu suất tối ưu",
    description: "Trải nghiệm mượt mà và nhanh chóng trên mọi thiết bị với công nghệ hiện đại.",
  },
  {
    icon: <SupportAgentRoundedIcon sx={{ fontSize: 40 }} />,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ hỗ trợ chuyên nghiệp luôn sẵn sàng giúp đỡ bạn mọi lúc, mọi nơi.",
  },
  {
    icon: <BoltRoundedIcon sx={{ fontSize: 40 }} />,
    title: "Đổi mới liên tục",
    description: "Không ngừng cải tiến và phát triển các tính năng mới để mang lại trải nghiệm tốt nhất.",
  },
];

const team = [
  {
    name: "Nguyễn Văn A",
    role: "CEO & Founder",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Trần Thị B",
    role: "CTO",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Lê Văn C",
    role: "Lead Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Phạm Thị D",
    role: "UI/UX Designer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
];

export default function AboutPage() {
  const theme = useTheme();

  const bgMesh = `
    radial-gradient(800px 500px at 20% 5%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 60%),
    radial-gradient(700px 420px at 85% 0%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 60%),
    radial-gradient(700px 520px at 10% 90%, ${alpha(theme.palette.success.main, 0.1)} 0%, transparent 60%)
  `;

  return (
    <Box sx={{ 
      position: "relative", 
      overflow: "hidden", 
      minHeight: "100vh", 
      background: bgMesh 
    }}>
      {/* Subtle grid overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          opacity: 0.5,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        {/* Hero Section */}
        <motion.div variants={fadeIn} initial="hidden" animate="show">
          <Stack spacing={4} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <BoltRoundedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            </Box>
            
            <Stack spacing={2}>
              <Typography variant="h2" fontWeight={900} sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Về EventSphere
              </Typography>
              <Typography variant="h5" color="text.secondary" maxWidth="600px">
                Nền tảng quản lý sự kiện hàng đầu, kết nối cộng đồng và tạo ra những trải nghiệm đáng nhớ
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <Chip label="Đáng tin cậy" color="primary" variant="outlined" />
              <Chip label="Dễ sử dụng" color="secondary" variant="outlined" />
              <Chip label="Bảo mật cao" color="success" variant="outlined" />
            </Stack>
          </Stack>
        </motion.div>

        {/* Mission Section */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Card sx={{ 
            p: { xs: 4, md: 6 }, 
            mb: 8,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}>
            <Stack spacing={3} textAlign="center">
              <Typography variant="h4" fontWeight={800} color="primary">
                Sứ mệnh của chúng tôi
              </Typography>
              <Typography variant="h6" color="text.secondary" lineHeight={1.6}>
                EventSphere được sinh ra với sứ mệnh tạo ra một nền tảng quản lý sự kiện toàn diện, 
                giúp các tổ chức, doanh nghiệp và cá nhân dễ dàng tạo ra, quản lý và tham gia các sự kiện 
                một cách hiệu quả và chuyên nghiệp.
              </Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
                Chúng tôi tin rằng mỗi sự kiện đều có thể trở thành một trải nghiệm đáng nhớ, 
                và công nghệ sẽ là cầu nối giúp biến điều đó thành hiện thực.
              </Typography>
            </Stack>
          </Card>
        </motion.div>

        {/* Features Section */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Stack spacing={4} sx={{ mb: 8 }}>
            <Stack spacing={2} textAlign="center">
              <Typography variant="h4" fontWeight={800}>
                Tại sao chọn EventSphere?
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Những tính năng nổi bật giúp bạn quản lý sự kiện hiệu quả
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <motion.div 
                    variants={fadeUp} 
                    initial="hidden" 
                    whileInView="show" 
                    viewport={{ once: true }}
                    custom={index * 0.1}
                  >
                    <Card sx={{ 
                      height: "100%", 
                      p: 3, 
                      borderRadius: 3,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                    }}>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" fontWeight={700}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                          {feature.description}
                        </Typography>
                      </Stack>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </motion.div>

        {/* Team Section */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Stack spacing={4} sx={{ mb: 8 }}>
            <Stack spacing={2} textAlign="center">
              <Typography variant="h4" fontWeight={800}>
                Đội ngũ của chúng tôi
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Những con người tài năng đằng sau EventSphere
              </Typography>
            </Stack>

            <Grid container spacing={4} justifyContent="center">
              {team.map((member, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <motion.div 
                    variants={fadeUp} 
                    initial="hidden" 
                    whileInView="show" 
                    viewport={{ once: true }}
                    custom={index * 0.1}
                  >
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Avatar
                        src={member.avatar}
                        sx={{ 
                          width: 120, 
                          height: 120,
                          border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      />
                      <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.role}
                        </Typography>
                      </Stack>
                    </Stack>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </motion.div>

        {/* Contact Section */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Card sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}>
            <Stack spacing={3} textAlign="center">
              <Typography variant="h4" fontWeight={800}>
                Liên hệ với chúng tôi
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Có câu hỏi hoặc muốn hợp tác? Chúng tôi luôn sẵn sàng lắng nghe!
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                <Chip 
                  label="contact@eventsphere.com" 
                  color="primary" 
                  variant="outlined"
                  clickable
                />
                <Chip 
                  label="+84 123 456 789" 
                  color="secondary" 
                  variant="outlined"
                  clickable
                />
                <Chip 
                  label="Hà Nội, Việt Nam" 
                  color="success" 
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
