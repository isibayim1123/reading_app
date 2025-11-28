import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface ContentFiltersProps {
  difficulty: string;
  category: string;
  searchQuery: string;
  onDifficultyChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export const ContentFilters = ({
  difficulty,
  category,
  searchQuery,
  onDifficultyChange,
  onCategoryChange,
  onSearchChange,
}: ContentFiltersProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <TextField
        placeholder="タイトルや本文で検索..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1, minWidth: 250 }}
      />

      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>難易度</InputLabel>
        <Select
          value={difficulty}
          label="難易度"
          onChange={(e) => onDifficultyChange(e.target.value)}
        >
          <MenuItem value="">すべて</MenuItem>
          <MenuItem value="elementary">小学生</MenuItem>
          <MenuItem value="junior_high">中学生</MenuItem>
          <MenuItem value="high_school">高校生</MenuItem>
          <MenuItem value="advanced">上級</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>カテゴリー</InputLabel>
        <Select
          value={category}
          label="カテゴリー"
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <MenuItem value="">すべて</MenuItem>
          <MenuItem value="daily">日常会話</MenuItem>
          <MenuItem value="exam">試験対策</MenuItem>
          <MenuItem value="eiken">英検</MenuItem>
          <MenuItem value="toeic">TOEIC</MenuItem>
          <MenuItem value="story">物語</MenuItem>
          <MenuItem value="science">科学</MenuItem>
          <MenuItem value="history">歴史</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
