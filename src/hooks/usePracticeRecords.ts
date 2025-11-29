import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PracticeRecord, WordAccuracy, Feedback, Grade } from '@/types/database';

interface CreatePracticeRecordInput {
  userId: string;
  contentId: string;
  transcription: string;
  wordAccuracy: WordAccuracy;
  accuracyScore: number;
  grade: Grade;
  feedback: Feedback;
  duration?: number;
}

export const useSavePracticeRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePracticeRecordInput) => {
      const { data, error } = await supabase
        .from('practice_records')
        .insert({
          user_id: input.userId,
          content_id: input.contentId,
          transcription: input.transcription,
          word_accuracy: input.wordAccuracy,
          accuracy_score: input.accuracyScore,
          grade: input.grade,
          feedback: input.feedback,
          duration: input.duration,
          practice_mode: 'normal',
        })
        .select()
        .single();

      if (error) throw error;

      return data as PracticeRecord;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['practice-records'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
};

export const usePracticeRecords = (userId?: string) => {
  return useQuery({
    queryKey: ['practice-records', userId],
    queryFn: async () => {
      let query = supabase
        .from('practice_records')
        .select('*, contents(*)')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as Array<PracticeRecord & { contents: any }>;
    },
    enabled: !!userId,
  });
};
