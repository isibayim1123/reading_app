import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  CalendarToday as DateIcon,
} from '@mui/icons-material';
import { PracticeRecord } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

const GRADE_COLORS = {
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'error',
} as const;

const GRADE_LABELS = {
  A: 'Excellent',
  B: 'Good',
  C: 'Fair',
  D: 'Keep Practicing',
} as const;

interface PracticeRecordCardProps {
  record: PracticeRecord & { contents: any };
  onClick?: () => void;
}

export const PracticeRecordCard = ({ record, onClick }: PracticeRecordCardProps) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '---';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card elevation={2}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          {/* Title */}
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {record.contents?.title || 'Unknown Content'}
          </Typography>

          {/* Score and Grade */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
            <Typography variant="h4" color="primary">
              {record.accuracy_score}
            </Typography>
            <Chip
              label={GRADE_LABELS[record.grade]}
              color={GRADE_COLORS[record.grade]}
              size="small"
            />
          </Box>

          {/* Metadata */}
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DateIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDistanceToNow(new Date(record.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </Typography>
            </Box>

            {record.duration && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  録音時間: {formatDuration(record.duration)}
                </Typography>
              </Box>
            )}

            {/* Content Info */}
            {record.contents && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                <Chip
                  label={record.contents.difficulty_level}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={record.contents.category}
                  size="small"
                  variant="outlined"
                />
              </Box>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
