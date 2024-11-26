import React, { useState, useRef } from 'react';
import { Upload, X, FileText, File } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { AlertDescription } from '../components/ui/Alert';
const FileManagementPage = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      throw new Error('File type not supported');
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }
  };

  const handleFiles = (fileList) => {
    setError('');
    const newFiles = Array.from(fileList).map(file => {
      try {
        validateFile(file);
        return {
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          type: file.type
        };
      } catch (err) {
        setError(err.message);
        return null;
      }
    }).filter(Boolean);

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <File className="h-8 w-8 text-blue-500" />;
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          multiple
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive ? 
            'Drop the files here...' : 
            'Drag & drop files here, or click to select files'
          }
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supported files: Images, PDF, DOC, DOCX (Max 5MB)
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-50">
                    {getFileIcon(file.type)}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 truncate">
                {file.file.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileManagementPage;