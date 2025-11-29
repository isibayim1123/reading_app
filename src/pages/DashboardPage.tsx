import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { usePracticeRecords } from '@/hooks/usePracticeRecords';
import { Layout } from '@/components/Layout';
import { PracticeRecordCard } from '@/components/PracticeRecordCard';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { data: allRecords, isLoading: recordsLoading } = usePracticeRecords(user?.id);

  const recentRecords = allRecords?.slice(0, 3) || [];

  if (statsLoading || recordsLoading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <CalendarIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h3" color="primary">
                  {stats.totalPractices}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  総練習回数
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h3" color="primary">
                  {stats.averageScore}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  平均スコア
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <TrophyIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h3" color="primary">
                  {stats.highestScore}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  最高スコア
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <CalendarIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h3" color="primary">
                  {stats.thisWeekPractices}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  今週の練習回数
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <FireIcon color="error" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h3" color="error.main">
                  {stats.streakDays}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  連続学習日数
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <StarIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h3" color="warning.main">
                  {stats.gradeDistribution.A}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Aグレード獲得数
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Practice Records */}
          {recentRecords.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h5" component="h2">
                  最近の練習記録
                </Typography>
                <Button
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/history')}
                >
                  すべて見る
                </Button>
              </Box>

              <Grid container spacing={3}>
                {recentRecords.map((record) => (
                  <Grid item xs={12} sm={6} md={4} key={record.id}>
                    <PracticeRecordCard
                      record={record}
                      onClick={() => navigate('/history')}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Welcome Message / Getting Started */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {stats.totalPractices === 0
                ? 'ようこそ、Reading Appへ！'
                : '練習を続けましょう！'}
            </Typography>

            {stats.totalPractices === 0 ? (
              <>
                <Typography variant="body1" paragraph>
                  英文音読練習を始めましょう。コンテンツを選んで、自分で音読してみましょう。
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/contents')}
                >
                  コンテンツを見る
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body1" paragraph>
                  素晴らしい進捗です！継続は力なり。今日も練習を続けましょう。
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    グレード別成績
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant="body2" align="center">
                        A: {stats.gradeDistribution.A}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" align="center">
                        B: {stats.gradeDistribution.B}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" align="center">
                        C: {stats.gradeDistribution.C}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" align="center">
                        D: {stats.gradeDistribution.D}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};
