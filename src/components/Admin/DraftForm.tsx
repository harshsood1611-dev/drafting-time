import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Tag, Calendar } from 'lucide-react';
import { Draft } from '../../types';

interface DraftFormProps {
  draft?: Draft | null;
  onSubmit: (draft: Omit<Draft, 'id'>) => void;
  onCancel: () => void;
}

const DraftForm: React.FC<DraftFormProps> = ({ draft, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileName: '',
    fileSize: '',
    category: '',
    tags: '',
    isPublished: false,
    fileContent: undefined as string | undefined
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (draft) {
      setFormData({
        title: draft.title,
        description: draft.description,
        fileName: draft.fileName,
        fileSize: draft.fileSize,
        category: draft.category,
        tags: draft.tags.join(', '),
        isPublished: draft.isPublished,
        fileContent: draft.fileContent,
        fileType: draft.fileType
      });
    }
  }, [draft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const draftData: Omit<Draft, 'id'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        fileName: formData.fileName.trim(),
        fileSize: formData.fileSize.trim(),
        category: formData.category.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        uploadDate: draft?.uploadDate || new Date().toISOString(),
        downloadCount: draft?.downloadCount || 0,
        isPublished: formData.isPublished,
        createdBy: 'admin',
        fileContent: formData.fileContent,
        fileType: formData.fileType
      };

      onSubmit(draftData);
    } catch (error) {
      console.error('Error submitting draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

//  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//    const file = e.target.files?.[0];
//    if (file) {
      // Read file as ArrayBuffer to preserve binary data
//      const reader = new FileReader();
//      reader.onload = (event) => {
//        const arrayBuffer = event.target?.result as ArrayBuffer;
        // Convert ArrayBuffer to base64 for storage
//        const uint8Array = new Uint8Array(arrayBuffer);
//        const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
//        const base64Content = btoa(binaryString);
        
 //       setFormData(prev => ({
  //        ...prev,
  //        fileName: file.name,
  //        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
  //        fileContent: base64Content,
  //        fileType: file.type || 'application/octet-stream'
  //      }));
  //   };
  //    reader.readAsArrayBuffer(file);
  //  } else {
  //    setFormData(prev => ({
  //      ...prev,
  //      fileName: '',
  //      fileSize: '',
 //       fileContent: undefined,
 //       fileType: undefined
 //     }));
 //   }
 // };

  const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      const base64Content = btoa(binaryString);

      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileContent: base64Content,
        fileType: file.type || 'application/octet-stream'
      }));
    };
    reader.readAsArrayBuffer(file);
  } else {
    setFormData(prev => ({
      ...prev,
      fileName: '',
      fileSize: '',
      fileContent: undefined,
      fileType: undefined
    }));
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {draft ? 'Edit Draft' : 'Add New Draft'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter draft title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter draft description"
            />
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              File Upload
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".doc,.docx,.pdf"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">DOC, DOCX, PDF up to 10MB</p>
                {formData.fileName && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>{formData.fileName} ({formData.fileSize})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Manual File Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-2">
                File Name *
              </label>
              <input
                id="fileName"
                name="fileName"
                type="text"
                required
                value={formData.fileName}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="document.docx"
              />
            </div>
            <div>
              <label htmlFor="fileSize" className="block text-sm font-medium text-gray-700 mb-2">
                File Size *
              </label>
              <input
                id="fileSize"
                name="fileSize"
                type="text"
                required
                value={formData.fileSize}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="2.5 MB"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select a category</option>
              <option value="Business">Business</option>
              <option value="Academic">Academic</option>
              <option value="Career">Career</option>
              <option value="Legal">Legal</option>
              <option value="Personal">Personal</option>
              <option value="Creative">Creative</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="template, business, professional (comma separated)"
              />
            </div>
          </div>

          {/* Published Status */}
          <div className="flex items-center">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              checked={formData.isPublished}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
              Publish immediately
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : (draft ? 'Update Draft' : 'Create Draft')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DraftForm;
