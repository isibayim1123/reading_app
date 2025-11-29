import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Layout } from '@/components/Layout';
import { useContent } from '@/hooks/useContents';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { evaluatePronunciation } from '@/utils/evaluatePronunciation';
import { useAuth } from '@/hooks/useAuth';
import { useSavePracticeRecord } from '@/hooks/usePracticeRecords';

const GRADE_COLORS = {
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'error',
} as const;

const GRADE_LABELS = {
  A: 'Excellent（素晴らしい！）',
  B: 'Good（良くできました！）',
  C: 'Fair（もう少し！）',
  D: 'Keep Practicing（練習を続けよう！）',
} as const;

export const PracticePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: content, isLoading, error } = useContent(id!);
  const savePracticeRecord = useSavePracticeRecord();

  const {
    isRecording,
    audioURL,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  const {
    isListening,
    transcript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [evaluation, setEvaluation] = useState<ReturnType<
    typeof evaluatePronunciation
  > | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  const handleStartPractice = async () => {
    try {
      clearRecording();
      resetTranscript();
      setEvaluation(null);
      setRecordingStartTime(Date.now());

      await startRecording();
      startListening();
    } catch (err: any) {
      alert(err.message || '録音の開始に失敗しました');
    }
  };

  const handleStopPractice = () => {
    stopRecording();
    stopListening();

    const duration = recordingStartTime
      ? Math.floor((Date.now() - recordingStartTime) / 1000)
      : undefined;

    // Evaluate after a short delay to ensure transcript is updated
    setTimeout(async () => {
      if (content && transcript && user) {
        const result = evaluatePronunciation(content.text, transcript);
        setEvaluation(result);

        // Save practice record automatically
        try {
          await savePracticeRecord.mutateAsync({
            userId: user.id,
            contentId: content.id,
            transcription: result.transcription,
            wordAccuracy: result.wordAccuracy,
            accuracyScore: result.accuracyScore,
            grade: result.grade,
            feedback: result.feedback,
            duration,
          });
          setShowSaveSuccess(true);
        } catch (error) {
          console.error('Failed to save practice record:', error);
        }
      }
    }, 500);
  };

  const handleRetry = () => {
    clearRecording();
    resetTranscript();
    setEvaluation(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="md">
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

  if (error || !content) {
    return (
      <Layout>
        <Container maxWidth="md">
          <Box sx={{ mt: 4 }}>
            <Alert severity="error">
              コンテンツの読み込みに失敗しました。
            </Alert>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/contents')}
              sx={{ mt: 2 }}
            >
              コンテンツ一覧に戻る
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {content.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={content.difficulty_level} size="small" />
              <Chip label={content.category} size="small" variant="outlined" />
            </Box>
          </Box>

          {/* Content Text */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              英文
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              {content.text}
            </Typography>
            {content.translation && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {content.translation}
                </Typography>
              </>
            )}
          </Paper>

          {/* Browser Support Check */}
          {!isSupported() && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              このブラウザは音声認識に対応していません。Chrome、Edge、Safariをお試しください。
            </Alert>
          )}

          {speechError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {speechError}
            </Alert>
          )}

          {/* Recording Controls */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              音読練習
            </Typography>

            {!isRecording && !evaluation && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  下のボタンを押して、英文を音読してください
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<MicIcon />}
                  onClick={handleStartPractice}
                  disabled={!isSupported()}
                >
                  録音開始
                </Button>
              </Box>
            )}

            {isRecording && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <MicIcon
                    sx={{ fontSize: 60, color: 'error.main', animation: 'pulse 1.5s ease-in-out infinite' }}
                  />
                </Box>
                <Typography variant="body1" gutterBottom>
                  録音中...
                </Typography>
                <LinearProgress sx={{ my: 2 }} />
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<StopIcon />}
                  onClick={handleStopPractice}
                >
                  録音停止
                </Button>
              </Box>
            )}

            {audioURL && !isRecording && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  あなたの録音:
                </Typography>
                <audio src={audioURL} controls style={{ width: '100%' }} />
              </Box>
            )}
          </Paper>

          {/* Evaluation Results */}
          {evaluation && (
            <>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  評価結果
                </Typography>

                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h2" color="primary" gutterBottom>
                    {evaluation.accuracyScore}
                  </Typography>
                  <Chip
                    label={GRADE_LABELS[evaluation.grade]}
                    color={GRADE_COLORS[evaluation.grade]}
                    size="large"
                    sx={{ fontSize: '1rem', py: 2 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Positive Feedback */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="success.main" gutterBottom>
                    ✓ 良かった点
                  </Typography>
                  {evaluation.feedback.positive.map((msg, i) => (
                    <Typography key={i} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                      • {msg}
                    </Typography>
                  ))}
                </Box>

                {/* Improvements */}
                {evaluation.feedback.improvements.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="warning.main" gutterBottom>
                      ⚠ 改善ポイント
                    </Typography>
                    {evaluation.feedback.improvements.map((item, i) => (
                      <Typography key={i} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                        • {item.suggestion}
                      </Typography>
                    ))}
                  </Box>
                )}

                {/* Overall Feedback */}
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body1">
                    {evaluation.feedback.overall}
                  </Typography>
                </Box>
              </Paper>

              {/* Word Accuracy Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    単語ごとの評価
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {evaluation.wordAccuracy.words.map((word, i) => (
                      <Chip
                        key={i}
                        label={`${word.word} (${word.score}%)`}
                        color={word.correct ? 'success' : 'error'}
                        variant={word.correct ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleRetry}
                  size="large"
                >
                  もう一度練習
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/contents')}
                  size="large"
                >
                  コンテンツ一覧に戻る
                </Button>
              </Box>
            </>
          )}
        </Box>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>

        {/* Success Snackbar */}
        <Snackbar
          open={showSaveSuccess}
          autoHideDuration={4000}
          onClose={() => setShowSaveSuccess(false)}
          message="練習記録を保存しました！"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </Layout>
  );
};
