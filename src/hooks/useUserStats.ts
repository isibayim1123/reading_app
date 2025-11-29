import { useMemo } from 'react';
import { usePracticeRecords } from './usePracticeRecords';
import { PracticeRecord } from '@/types/database';

interface UserStats {
  totalPractices: number;
  averageScore: number;
  highestScore: number;
  thisWeekPractices: number;
  streakDays: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  recentScores: number[];
}

export const useUserStats = (userId?: string) => {
  const { data: records, isLoading, error } = usePracticeRecords(userId);

  const stats = useMemo<UserStats>(() => {
    if (!records || records.length === 0) {
      return {
        totalPractices: 0,
        averageScore: 0,
        highestScore: 0,
        thisWeekPractices: 0,
        streakDays: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0 },
        recentScores: [],
      };
    }

    // Total practices
    const totalPractices = records.length;

    // Average score
    const totalScore = records.reduce((sum, record) => sum + record.accuracy_score, 0);
    const averageScore = Math.round(totalScore / totalPractices);

    // Highest score
    const highestScore = Math.max(...records.map((r) => r.accuracy_score));

    // This week's practices
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const thisWeekPractices = records.filter(
      (record) => new Date(record.created_at) >= weekAgo
    ).length;

    // Streak days - consecutive days with practice
    const streakDays = calculateStreakDays(records);

    // Grade distribution
    const gradeDistribution = records.reduce(
      (acc, record) => {
        acc[record.grade]++;
        return acc;
      },
      { A: 0, B: 0, C: 0, D: 0 } as { A: number; B: number; C: number; D: number }
    );

    // Recent scores (last 10 practices)
    const recentScores = records
      .slice(0, 10)
      .map((r) => r.accuracy_score)
      .reverse();

    return {
      totalPractices,
      averageScore,
      highestScore,
      thisWeekPractices,
      streakDays,
      gradeDistribution,
      recentScores,
    };
  }, [records]);

  return {
    stats,
    isLoading,
    error,
  };
};

/**
 * Calculate consecutive days with practice (streak)
 */
const calculateStreakDays = (records: Array<PracticeRecord & { contents: any }>): number => {
  if (records.length === 0) return 0;

  // Get unique practice dates (YYYY-MM-DD format)
  const practiceDates = new Set(
    records.map((record) => {
      const date = new Date(record.created_at);
      return date.toISOString().split('T')[0];
    })
  );

  const sortedDates = Array.from(practiceDates).sort().reverse();

  // Check if today or yesterday was practiced
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If no practice today or yesterday, streak is broken
  if (!sortedDates.includes(todayStr) && !sortedDates.includes(yesterdayStr)) {
    return 0;
  }

  // Count consecutive days
  let streak = 0;
  let currentDate = new Date(today);

  // If today hasn't been practiced yet, start from yesterday
  if (!sortedDates.includes(todayStr)) {
    currentDate = yesterday;
  }

  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (sortedDates.includes(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
