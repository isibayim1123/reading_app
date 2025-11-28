import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ContentCard } from '@/components/ContentCard';
import { ContentFilters } from '@/components/ContentFilters';
import { useContents } from '@/hooks/useContents';
import { Layout } from '@/components/Layout';

export const ContentsPage = () => {
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: contents, isLoading, error } = useContents({
    difficulty: difficulty || undefined,
    category: category || undefined,
    searchQuery: searchQuery || undefined,
  });

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          英文コンテンツ
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          練習したい英文を選んで、音読練習を始めましょう
        </Typography>

        <ContentFilters
          difficulty={difficulty}
          category={category}
          searchQuery={searchQuery}
          onDifficultyChange={setDifficulty}
          onCategoryChange={setCategory}
          onSearchChange={setSearchQuery}
        />

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            コンテンツの読み込みに失敗しました。もう一度お試しください。
          </Alert>
        )}

        {!isLoading && !error && contents && contents.length === 0 && (
          <Alert severity="info">
            条件に一致するコンテンツが見つかりませんでした。フィルターを変更してみてください。
          </Alert>
        )}

        {!isLoading && !error && contents && contents.length > 0 && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {contents.length}件のコンテンツ
            </Typography>
            <Grid container spacing={3}>
              {contents.map((content) => (
                <Grid item xs={12} sm={6} md={4} key={content.id}>
                  <ContentCard content={content} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
        </Box>
      </Container>
    </Layout>
  );
};
