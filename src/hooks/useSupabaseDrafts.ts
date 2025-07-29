import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Draft } from '../types';

export const useSupabaseDrafts = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const mapDatabaseDraftToDraft = (dbDraft: any): Draft => ({
    id: dbDraft.id,
    title: dbDraft.title,
    description: dbDraft.description,
    fileName: dbDraft.file_name,
    fileSize: dbDraft.file_size,
    uploadDate: dbDraft.upload_date,
    category: dbDraft.category,
    tags: dbDraft.tags || [],
    downloadCount: dbDraft.download_count,
    isPublished: dbDraft.is_published,
    createdBy: dbDraft.created_by
  });

  const fetchDrafts = async () => {
    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drafts:', error);
        return;
      }

      if (data) {
        setDrafts(data.map(mapDatabaseDraftToDraft));
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDraft = async (draft: Omit<Draft, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('drafts')
        .insert({
          title: draft.title,
          description: draft.description,
          file_name: draft.fileName,
          file_size: draft.fileSize,
          upload_date: draft.uploadDate,
          category: draft.category,
          tags: draft.tags,
          download_count: draft.downloadCount,
          is_published: draft.isPublished,
          created_by: draft.createdBy
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding draft:', error);
        return null;
      }

      if (data) {
        const newDraft = mapDatabaseDraftToDraft(data);
        setDrafts(prev => [newDraft, ...prev]);
        return newDraft;
      }
    } catch (error) {
      console.error('Error adding draft:', error);
    }
    return null;
  };

  const updateDraft = async (id: string, updates: Partial<Draft>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.fileName !== undefined) dbUpdates.file_name = updates.fileName;
      if (updates.fileSize !== undefined) dbUpdates.file_size = updates.fileSize;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.downloadCount !== undefined) dbUpdates.download_count = updates.downloadCount;
      if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;

      const { data, error } = await supabase
        .from('drafts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating draft:', error);
        return;
      }

      if (data) {
        const updatedDraft = mapDatabaseDraftToDraft(data);
        setDrafts(prev => prev.map(draft => 
          draft.id === id ? updatedDraft : draft
        ));
      }
    } catch (error) {
      console.error('Error updating draft:', error);
    }
  };

  const deleteDraft = async (id: string) => {
    try {
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting draft:', error);
        return;
      }

      setDrafts(prev => prev.filter(draft => draft.id !== id));
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const getPublishedDrafts = () => {
    return drafts.filter(draft => draft.isPublished);
  };

  const recordDownload = async (userId: string, draftId: string) => {
    try {
      // Record the download
      const { error: downloadError } = await supabase
        .from('downloads')
        .insert({
          user_id: userId,
          draft_id: draftId
        });

      if (downloadError) {
        console.error('Error recording download:', downloadError);
        return false;
      }

      // Update draft download count
      const currentDraft = drafts.find(d => d.id === draftId);
      if (currentDraft) {
        const { error: updateError } = await supabase
          .from('drafts')
          .update({ download_count: currentDraft.downloadCount + 1 })
          .eq('id', draftId);

        if (!updateError) {
          // Update local state
          setDrafts(prev => prev.map(draft => 
            draft.id === draftId 
              ? { ...draft, downloadCount: draft.downloadCount + 1 }
              : draft
          ));
        }
      }

      return true;
    } catch (error) {
      console.error('Error recording download:', error);
      return false;
    }
  };

  return {
    drafts,
    loading,
    addDraft,
    updateDraft,
    deleteDraft,
    getPublishedDrafts,
    recordDownload,
    refetch: fetchDrafts
  };
};