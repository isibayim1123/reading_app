import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Content } from '@/types/database';

interface UseContentsFilters {
  difficulty?: string;
  category?: string;
  searchQuery?: string;
}

export const useContents = (filters?: UseContentsFilters) => {
  return useQuery({
    queryKey: ['contents', filters],
    queryFn: async () => {
      let query = supabase
        .from('contents')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,text.ilike.%${filters.searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as Content[];
    },
  });
};

export const useContent = (id: string) => {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as Content;
    },
    enabled: !!id,
  });
};
