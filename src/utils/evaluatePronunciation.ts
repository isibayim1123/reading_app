import { Grade, WordAccuracy, Feedback } from '@/types/database';

/**
 * 単語の正誤を評価する
 */
const evaluateWords = (
  originalText: string,
  transcribedText: string
): WordAccuracy => {
  const originalWords = originalText
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const transcribedWords = transcribedText
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const wordAccuracy = originalWords.map((word, index) => {
    const transcribedWord = transcribedWords[index] || '';
    const isCorrect = word === transcribedWord;

    // Simple similarity score (can be improved)
    const score = isCorrect ? 100 : calculateSimilarity(word, transcribedWord);

    return {
      word,
      score,
      correct: isCorrect,
      error_type: !isCorrect ? 'pronunciation' : undefined,
    };
  });

  return { words: wordAccuracy };
};

/**
 * 2つの単語の類似度を計算（簡易版）
 */
const calculateSimilarity = (word1: string, word2: string): number => {
  if (!word2) return 0;

  const maxLength = Math.max(word1.length, word2.length);
  const distance = levenshteinDistance(word1, word2);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.max(0, Math.round(similarity));
};

/**
 * レーベンシュタイン距離（編集距離）を計算
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * 正確性スコアを計算
 */
const calculateAccuracyScore = (wordAccuracy: WordAccuracy): number => {
  if (wordAccuracy.words.length === 0) return 0;

  const totalScore = wordAccuracy.words.reduce(
    (sum, word) => sum + word.score,
    0
  );
  return Math.round(totalScore / wordAccuracy.words.length);
};

/**
 * スコアからグレードを決定
 */
const determineGrade = (score: number): Grade => {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 50) return 'C';
  return 'D';
};

/**
 * フィードバックを生成
 */
const generateFeedback = (
  wordAccuracy: WordAccuracy,
  grade: Grade
): Feedback => {
  const correctWords = wordAccuracy.words.filter((w) => w.correct);
  const incorrectWords = wordAccuracy.words.filter((w) => !w.correct);

  const positive: string[] = [];
  const improvements: Array<{
    word: string;
    suggestion: string;
    ipa?: string;
  }> = [];

  // Positive feedback
  if (grade === 'A') {
    positive.push('素晴らしい発音です！完璧に近い正確さです。');
  } else if (grade === 'B') {
    positive.push('良くできました！ほとんどの単語を正しく発音できています。');
  } else if (grade === 'C') {
    positive.push('頑張りました！もう少しで上達します。');
  } else {
    positive.push('練習を続けましょう！少しずつ上達していきます。');
  }

  if (correctWords.length > 0) {
    positive.push(
      `${correctWords.length}個の単語を正しく発音できました！`
    );
  }

  // Improvement suggestions
  incorrectWords.slice(0, 3).forEach((word) => {
    improvements.push({
      word: word.word,
      suggestion: `「${word.word}」の発音をもう一度確認してみましょう。`,
    });
  });

  const overall =
    grade === 'A'
      ? 'このまま練習を続けてください！'
      : grade === 'B'
      ? '少しの改善で完璧になります！'
      : grade === 'C'
      ? '基本的な発音は良好です。繰り返し練習してみましょう。'
      : 'ゆっくりと一つ一つの単語を意識して練習してみてください。';

  return {
    positive,
    improvements,
    overall,
  };
};

/**
 * 発音を評価する（メイン関数）
 */
export const evaluatePronunciation = (
  originalText: string,
  transcribedText: string
) => {
  const wordAccuracy = evaluateWords(originalText, transcribedText);
  const accuracyScore = calculateAccuracyScore(wordAccuracy);
  const grade = determineGrade(accuracyScore);
  const feedback = generateFeedback(wordAccuracy, grade);

  return {
    wordAccuracy,
    accuracyScore,
    grade,
    feedback,
    transcription: transcribedText,
  };
};
