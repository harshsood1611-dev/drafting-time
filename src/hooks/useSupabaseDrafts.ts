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
    createdBy: dbDraft.created_by,
    fileContent: dbDraft.file_content,
    fileType: dbDraft.file_type
  });

  const fetchDrafts = async () => {
    try {
      console.log('Fetching drafts from Supabase...');
      
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drafts:', error);
        return;
      }

      if (data) {
        console.log('Drafts fetched successfully:', data.length, 'drafts');
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
      console.log('Adding new draft:', draft.title);
      
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
        console.log('Draft added successfully:', data.title);
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
      console.log('Updating draft:', id);
      
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
        console.log('Draft updated successfully:', data.title);
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
      console.log('Deleting draft:', id);
      
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting draft:', error);
        return;
      }

      console.log('Draft deleted successfully');
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
      console.log('Recording download for user:', userId, 'draft:', draftId);
      
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
          console.log('Draft download count updated');
          // Update local state
          setDrafts(prev => prev.map(draft => 
            draft.id === draftId 
              ? { ...draft, downloadCount: draft.downloadCount + 1 }
              : draft
          ));
        } else {
          console.error('Error updating draft download count:', updateError);
        }
      }

      console.log('Download recorded successfully');
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