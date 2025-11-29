import { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { PracticeRecordCard } from '@/components/PracticeRecordCard';
import { usePracticeRecords } from '@/hooks/usePracticeRecords';
import { useAuth } from '@/hooks/useAuth';
import { PracticeRecord } from '@/types/database';

const GRADE_COLORS = {
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'error',
} as const;

export const HistoryPage = () => {
  const { user } = useAuth();
  const { data: records, isLoading, error } = usePracticeRecords(user?.id);

  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<
    (PracticeRecord & { contents: any }) | null
  >(null);

  // Filter records
  const filteredRecords = useMemo(() => {
    if (!records) return [];

    let filtered = [...records];

    // Grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter((record) => record.grade === gradeFilter);
    }

    // Period filter
    if (periodFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (periodFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      if (periodFilter !== 'all') {
        filtered = filtered.filter(
          (record) => new Date(record.created_at) >= filterDate
        );
      }
    }

    return filtered;
  }, [records, gradeFilter, periodFilter]);

  const handleCloseDialog = () => {
    setSelectedRecord(null);
  };

  if (isLoading) {
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

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Alert severity="error">
              練習記録の読み込みに失敗しました。
            </Alert>
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
            学習履歴
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            これまでの練習記録を確認できます
          </Typography>

          {/* Filters */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>期間</InputLabel>
              <Select
                value={periodFilter}
                label="期間"
                onChange={(e) => setPeriodFilter(e.target.value)}
              >
                <MenuItem value="all">すべて</MenuItem>
                <MenuItem value="today">今日</MenuItem>
                <MenuItem value="week">過去1週間</MenuItem>
                <MenuItem value="month">過去1ヶ月</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>グレード</InputLabel>
              <Select
                value={gradeFilter}
                label="グレード"
                onChange={(e) => setGradeFilter(e.target.value)}
              >
                <MenuItem value="all">すべて</MenuItem>
                <MenuItem value="A">A - Excellent</MenuItem>
                <MenuItem value="B">B - Good</MenuItem>
                <MenuItem value="C">C - Fair</MenuItem>
                <MenuItem value="D">D - Keep Practicing</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Summary */}
          {records && records.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                全{records.length}件の記録
                {filteredRecords.length !== records.length &&
                  ` (${filteredRecords.length}件を表示中)`}
              </Typography>
            </Box>
          )}

          {/* Records Grid */}
          {filteredRecords.length === 0 ? (
            <Alert severity="info">
              {records && records.length > 0
                ? 'フィルター条件に一致する記録がありません。'
                : '練習記録がまだありません。コンテンツを選んで練習を始めましょう！'}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredRecords.map((record) => (
                <Grid item xs={12} sm={6} md={4} key={record.id}>
                  <PracticeRecordCard
                    record={record}
                    onClick={() => setSelectedRecord(record)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Detail Dialog */}
        <Dialog
          open={!!selectedRecord}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedRecord && (
            <>
              <DialogTitle>
                {selectedRecord.contents?.title || 'Unknown Content'}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  {/* Score and Grade */}
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h2" color="primary" gutterBottom>
                      {selectedRecord.accuracy_score}
                    </Typography>
                    <Chip
                      label={`グレード: ${selectedRecord.grade}`}
                      color={GRADE_COLORS[selectedRecord.grade]}
                      size="large"
                      sx={{ fontSize: '1rem', py: 2 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Transcription */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      あなたの音読
                    </Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      "{selectedRecord.transcription}"
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Feedback */}
                  {selectedRecord.feedback && (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle1"
                          color="success.main"
                          gutterBottom
                        >
                          ✓ 良かった点
                        </Typography>
                        {selectedRecord.feedback.positive?.map((msg, i) => (
                          <Typography
                            key={i}
                            variant="body2"
                            sx={{ ml: 2, mb: 0.5 }}
                          >
                            • {msg}
                          </Typography>
                        ))}
                      </Box>

                      {selectedRecord.feedback.improvements &&
                        selectedRecord.feedback.improvements.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle1"
                              color="warning.main"
                              gutterBottom
                            >
                              ⚠ 改善ポイント
                            </Typography>
                            {selectedRecord.feedback.improvements.map(
                              (item, i) => (
                                <Typography
                                  key={i}
                                  variant="body2"
                                  sx={{ ml: 2, mb: 0.5 }}
                                >
                                  • {item.suggestion}
                                </Typography>
                              )
                            )}
                          </Box>
                        )}

                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'background.default',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body1">
                          {selectedRecord.feedback.overall}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {/* Word Accuracy */}
                  {selectedRecord.word_accuracy?.words && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          単語ごとの評価
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedRecord.word_accuracy.words.map((word, i) => (
                            <Chip
                              key={i}
                              label={`${word.word} (${word.score}%)`}
                              color={word.correct ? 'success' : 'error'}
                              variant={word.correct ? 'filled' : 'outlined'}
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>閉じる</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Layout>
  );
};
