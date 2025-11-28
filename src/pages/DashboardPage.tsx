import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Typography variant="h4" component="h1" gutterBottom>
            ダッシュボード
          </Typography>

        {/* User Info */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              {user?.user_type === 'teacher' ? (
                <SchoolIcon fontSize="large" />
              ) : (
                <PersonIcon fontSize="large" />
              )}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.user_type === 'teacher' ? '先生' : '生徒'}
                {user?.grade && ` - ${user.grade}`}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                0
              </Typography>
              <Typography variant="body1" color="text.secondary">
                練習回数
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                0
              </Typography>
              <Typography variant="body1" color="text.secondary">
                獲得バッジ
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                1
              </Typography>
              <Typography variant="body1" color="text.secondary">
                現在のレベル
              </Typography>
            </Paper>
          </Grid>
        </Grid>

          {/* Welcome Message */}
          <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              ようこそ、Reading Appへ！
            </Typography>
            <Typography variant="body1" paragraph>
              英文音読練習を始めましょう。お手本を聞いて、自分で音読してみましょう。
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ※ 現在、基本機能を開発中です。もうしばらくお待ちください。
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};
