import React, { useContext, useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadFiles, fetchUserFiles, updateFileTags, deleteFile , generateShareableLink} from '../utils/filesApi'; // Mock or implement API
import { AuthContext } from '../contexts/AuthContext';

const FileManagementPage = () => {
    const { user } = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

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
            'video/mp4'
        ];
        const maxSize = 10 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('File type not supported');
        }
        if (file.size > maxSize) {
            throw new Error('File size exceeds 5MB limit');
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

    const handleAddTag = async (filename, newTag) => {
        if (!newTag.trim()) return;
        try {
            setLoading(true);
            const updatedFile = await updateFileTags(filename, [...new Set([...files.find(file => file.filename === filename).tags, newTag])], user.token);
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
            const updatedFile = await updateFileTags(filename, files.find(file => file.filename === filename).tags.filter(tag => tag !== tagToRemove), user.token);
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
        console.log("here in generate", fileId)
        try {
          const sharedLink = await generateShareableLink(fileId, user.token);
          alert(`Shareable Link: ${sharedLink}`);
        } catch (error) {
          console.error('Failed to generate shareable link:', error);
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
                    Supported files: Images, PDF, DOC (Max 5MB)
                </p>
            </div>

            {error && (
                <div className="mt-4 text-red-500 text-sm">{error}</div>
            )}

            {loading ? (
                <div className="mt-8 text-center text-sm text-gray-500">
                    Loading files...
                </div>
            ) : (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold">Your Files</h2>
                    {files.length > 0 ? (
                        <ul className="mt-4">
                            {files.map((file) => (
                                <li
                                    key={file._id}
                                    className="flex flex-col border-b py-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium">{file.filename}</p>
                                            <div>
                                                <p className="text-xs text-gray-500">Views: {file.views}</p>
                                                {file.sharedLink && (
                                                    <p className="text-xs text-blue-500">
                                                        <a href={file.sharedLink} target="_blank" rel="noopener noreferrer">
                                                            View File
                                                        </a>
                                                    </p>
                                                )}
                                                {!file.sharedLink && (
                                                    <button
                                                        className="text-blue-500 text-xs"
                                                        onClick={() => handleGenerateLink(file._id)}
                                                    >
                                                        Generate Shareable Link
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="text-red-500 text-sm"
                                            onClick={() => handleDelete(file.filename)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <div className="mt-2">
                                        <h4 className="text-xs font-semibold">Tags:</h4>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {file.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="bg-gray-200 px-2 py-1 text-xs rounded"
                                                >
                                                    {tag}
                                                    <button
                                                        className="ml-1 text-red-500"
                                                        onClick={() => handleRemoveTag(file.filename, tag)}
                                                    >
                                                        x
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Add a tag"
                                            className="mt-2 border rounded px-2 py-1 text-xs w-full"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddTag(file.filename, e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 text-gray-500 text-sm">
                            No files uploaded yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileManagementPage;
