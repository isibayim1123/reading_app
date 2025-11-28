import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  AccessTime as TimeIcon,
  TextFields as WordIcon,
} from '@mui/icons-material';
import { Content } from '@/types/database';

interface ContentCardProps {
  content: Content;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  elementary: '小学生',
  junior_high: '中学生',
  high_school: '高校生',
  advanced: '上級',
};

const DIFFICULTY_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  elementary: 'success',
  junior_high: 'info',
  high_school: 'warning',
  advanced: 'error',
};

const CATEGORY_LABELS: Record<string, string> = {
  daily: '日常会話',
  exam: '試験対策',
  eiken: '英検',
  toeic: 'TOEIC',
  story: '物語',
  science: '科学',
  history: '歴史',
};

export const ContentCard = ({ content }: ContentCardProps) => {
  const navigate = useNavigate();

  const handlePractice = () => {
    navigate(`/practice/${content.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={DIFFICULTY_LABELS[content.difficulty_level] || content.difficulty_level}
            color={DIFFICULTY_COLORS[content.difficulty_level] || 'default'}
            size="small"
          />
          <Chip
            label={CATEGORY_LABELS[content.category] || content.category}
            variant="outlined"
            size="small"
          />
        </Box>

        <Typography variant="h6" component="h2" gutterBottom>
          {content.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 2,
          }}
        >
          {content.text}
        </Typography>

        {content.tags && content.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {content.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
            {content.tags.length > 3 && (
              <Chip label={`+${content.tags.length - 3}`} size="small" variant="outlined" />
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {content.word_count && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WordIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {content.word_count}語
              </Typography>
            </Box>
          )}
          {content.estimated_duration && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                約{content.estimated_duration}秒
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={handlePractice}
          fullWidth
        >
          練習する
        </Button>
      </CardActions>
    </Card>
  );
};
