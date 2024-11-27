import React, { useContext, useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { Eye, Link, Trash2, GripVertical } from 'lucide-react';

import { arrayMove } from '@dnd-kit/sortable';
import {
    uploadFiles,
    fetchUserFiles,
    updateFileTags,
    deleteFile,
    generateShareableLink,
    updateFileOrder
} from '../utils/filesApi';
import { AuthContext } from '../contexts/AuthContext';

const FileManagementPage = () => {
    const { user } = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 5, // Dragging will only start after the pointer moves 5px
          },
        })
      );
    useEffect(() => {
        const fetchFiles = async () => {
            if (user?.token) {
                setLoading(true);
                setError('');
                try {
                    const data = await fetchUserFiles(user.token);
                    setFiles(data);
                } catch (err) {
                    setError('Failed to fetch files. Please try again later.');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchFiles();
    }, [user]);

    const validateFile = (file) => {
        const validTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'application/pdf',
            'video/mp4',
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            throw new Error('File type not supported');
        }
        if (file.size > maxSize) {
            throw new Error('File size exceeds 10MB limit');
        }
    };

    const handleFiles = async (fileList) => {
        setError('');
        if (!user?.token) {
            setError('You must be logged in to upload files.');
            return;
        }

        try {
            const validFiles = Array.from(fileList).map((file) => {
                validateFile(file);
                return file;
            });

            setLoading(true);
            await uploadFiles(validFiles, [], user.token);
            alert('Files uploaded successfully');
            const updatedFiles = await fetchUserFiles(user.token); // Refresh the file list
            setFiles(updatedFiles);
        } catch (err) {
            setError(err.message || 'Failed to upload files');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = files.findIndex((file) => file._id === active.id);
            const newIndex = files.findIndex((file) => file._id === over?.id);
    
            const updatedFiles = arrayMove(files, oldIndex, newIndex);
            setFiles(updatedFiles);
    
            // Save the new order to the backend
            try {
                const order = updatedFiles.map((file) => file._id);
                await updateFileOrder(order, user.token);
            } catch (err) {
                console.error('Failed to save file order:', err);
                setError('Failed to save file order');
            }
        }
    };
    

    const handleAddTag = async (filename, newTag) => {
        if (!newTag.trim()) return;
        try {
            setLoading(true);
            const updatedFile = await updateFileTags(
                filename,
                [...new Set([...files.find((file) => file.filename === filename).tags, newTag])],
                user.token
            );
            setFiles((prevFiles) =>
                prevFiles.map((file) =>
                    file.filename === updatedFile.filename ? updatedFile : file
                )
            );
        } catch (err) {
            setError(err.message || 'Failed to add tag');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveTag = async (filename, tagToRemove) => {
        try {
            setLoading(true);
            const updatedFile = await updateFileTags(
                filename,
                files.find((file) => file.filename === filename).tags.filter((tag) => tag !== tagToRemove),
                user.token
            );
            setFiles((prevFiles) =>
                prevFiles.map((file) =>
                    file.filename === updatedFile.filename ? updatedFile : file
                )
            );
        } catch (err) {
            setError(err.message || 'Failed to remove tag');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateLink = async (fileId) => {
        try {
            const sharedLink = await generateShareableLink(fileId, user.token);
            alert(`Shareable Link: ${sharedLink}`);
    
            // Refresh the file list to show the generated link
            const updatedFiles = await fetchUserFiles(user.token);
            setFiles(updatedFiles);
        } catch (error) {
            console.error('Failed to generate shareable link:', error);
            setError('Failed to generate shareable link');
        }
    };
    

    const handleDelete = async (filename) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this file?');
        if (!confirmDelete) return;

        try {
            setLoading(true);
            await deleteFile(filename, user.token);
            setFiles((prevFiles) => prevFiles.filter((file) => file.filename !== filename));
        } catch (err) {
            setError(err.message || 'Failed to delete the file');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        handleFiles(e.target.files);
    };

    const SortableItem = ({ file }) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
          id: file._id,
        });
      
        const style = {
          transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
          transition,
        };
      
        return (
          <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
              <div className="flex items-start gap-4">
                <div className="cursor-move">
                  <GripVertical className="text-gray-400 h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg">{file.filename}</h3>
                    <button 
                      onClick={() => handleDelete(file.filename)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
      
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{file.views} views</span>
                    </div>
                    {file.sharedLink ? (
                      <a 
                        href={file.sharedLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                      >
                        <Link className="h-4 w-4" />
                        <span>View File</span>
                      </a>
                    ) : (
                      <button 
                        onClick={() => handleGenerateLink(file._id)}
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50"
                      >
                        <Link className="h-4 w-4" />
                        Generate Link
                      </button>
                    )}
                  </div>
      
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {file.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(file.filename, tag)}
                            className="ml-1 text-gray-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a tag (press Enter)"
                      className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(file.filename, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      };
      
    return (
        <div className="max-w-2xl mx-auto p-6">
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-400"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.mp4"
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                    Click to select files for upload
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    Supported files: Images, PDF, MP4 (Max 10MB)
                </p>
            </div>

            {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

            {loading ? (
                <div className="mt-8 text-center text-sm text-gray-500">
                    Loading files...
                </div>
            ) : (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold">Your Files</h2>
                    {files.length > 0 ? (
                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                            <SortableContext items={files.map((file) => file._id)} strategy={rectSortingStrategy}>
                                <ul className="mt-4">
                                    {files.map((file) => (
                                        <SortableItem key={file._id} file={file} />
                                    ))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <p className="mt-4 text-gray-500 text-sm">No files uploaded yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileManagementPage;
