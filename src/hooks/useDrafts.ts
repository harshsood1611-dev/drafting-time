import { useState, useEffect } from 'react';
import { Draft } from '../types';

// Sample draft data
const sampleDrafts: Draft[] = [
  {
    id: '1',
    title: 'Business Proposal Template',
    description: 'Professional business proposal template for client presentations. Includes sections for executive summary, project scope, timeline, and budget.',
    fileName: 'business_proposal_template.docx',
    fileSize: '2.3 MB',
    uploadDate: '2024-01-15T10:00:00Z',
    category: 'Business',
    tags: ['proposal', 'business', 'template', 'professional'],
    downloadCount: 45,
    isPublished: true,
    createdBy: 'admin',
    fileContent: undefined
  },
  {
    id: '2',
    title: 'Resume Template - Modern',
    description: 'Clean and modern resume template for job applications. Features contemporary design with sections for experience, skills, and education.',
    fileName: 'modern_resume_template.doc',
    fileSize: '1.8 MB',
    uploadDate: '2024-01-14T14:30:00Z',
    category: 'Career',
    tags: ['resume', 'cv', 'job', 'template', 'modern'],
    downloadCount: 89,
    isPublished: true,
    createdBy: 'admin'
  },
  {
    id: '3',
    title: 'Project Report Format',
    description: 'Academic project report template with proper formatting. Includes title page, abstract, methodology, results, and references sections.',
    fileName: 'project_report_format.doc',
    fileSize: '1.5 MB',
    uploadDate: '2024-01-13T09:15:00Z',
    category: 'Academic',
    tags: ['project', 'report', 'academic', 'format', 'research'],
    downloadCount: 23,
    isPublished: true,
    createdBy: 'admin'
  },
  {
    id: '4',
    title: 'Invoice Template',
    description: 'Professional invoice template for freelancers and small businesses. Includes company details, itemized billing, and payment terms.',
    fileName: 'invoice_template.doc',
    fileSize: '1.2 MB',
    uploadDate: '2024-01-12T16:45:00Z',
    category: 'Business',
    tags: ['invoice', 'billing', 'business', 'freelance'],
    downloadCount: 67,
    isPublished: true,
    createdBy: 'admin'
  },
  {
    id: '5',
    title: 'Cover Letter Template',
    description: 'Professional cover letter template that complements the modern resume. Customizable for different job applications.',
    fileName: 'cover_letter_template.doc',
    fileSize: '1.1 MB',
    uploadDate: '2024-01-11T11:20:00Z',
    category: 'Career',
    tags: ['cover letter', 'job application', 'career', 'professional'],
    downloadCount: 34,
    isPublished: true,
    createdBy: 'admin'
  },
  {
    id: '6',
    title: 'Meeting Minutes Template',
    description: 'Structured template for recording meeting minutes. Includes agenda items, action points, and attendee tracking.',
    fileName: 'meeting_minutes_template.doc',
    fileSize: '1.0 MB',
    uploadDate: '2024-01-10T13:00:00Z',
    category: 'Business',
    tags: ['meeting', 'minutes', 'business', 'organization'],
    downloadCount: 28,
    isPublished: true,
    createdBy: 'admin',
    fileContent: undefined,
    fileType: undefined
  }
];

export const useDrafts = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize drafts from localStorage or use sample data
    const savedDrafts = localStorage.getItem('drafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    } else {
      setDrafts(sampleDrafts);
      localStorage.setItem('drafts', JSON.stringify(sampleDrafts));
    }
    setLoading(false);
  }, []);

  const saveDrafts = (updatedDrafts: Draft[]) => {
    setDrafts(updatedDrafts);
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
  };

  const addDraft = async (draft: Omit<Draft, 'id'>) => {
    const newDraft: Draft = {
      ...draft,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString(),
      downloadCount: 0
    };
    
    const updatedDrafts = [newDraft, ...drafts];
    saveDrafts(updatedDrafts);
    return newDraft;
  };

  const updateDraft = async (id: string, updates: Partial<Draft>) => {
    const updatedDrafts = drafts.map(draft =>
      draft.id === id ? { ...draft, ...updates } : draft
    );
    saveDrafts(updatedDrafts);
  };

  const deleteDraft = async (id: string) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== id);
    saveDrafts(updatedDrafts);
  };

  const getPublishedDrafts = () => {
    return drafts.filter(draft => draft.isPublished);
  };

  const recordDownload = async (userId: string, draftId: string) => {
    // Record download in localStorage
    const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    const newDownload = {
      id: Date.now().toString(),
      userId,
      draftId,
      downloadedAt: new Date().toISOString()
    };
    downloads.push(newDownload);
    localStorage.setItem('downloads', JSON.stringify(downloads));

    // Update draft download count
    const updatedDrafts = drafts.map(draft =>
      draft.id === draftId 
        ? { ...draft, downloadCount: draft.downloadCount + 1 }
        : draft
    );
    saveDrafts(updatedDrafts);

    return true;
  };

  return {
    drafts,
    loading,
    addDraft,
    updateDraft,
    deleteDraft,
    getPublishedDrafts,
    recordDownload,
    refetch: () => {
      const savedDrafts = localStorage.getItem('drafts');
      if (savedDrafts) {
        setDrafts(JSON.parse(savedDrafts));
      }
    }
  };
};