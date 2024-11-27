import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, file, onDelete, onGenerateLink, onAddTag, onRemoveTag }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const [newTag, setNewTag] = useState('');
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleAddTag = () => {
        if (newTag.trim()) {
            onAddTag(file.filename, newTag);
            setNewTag('');
        }
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-4 border rounded flex flex-col gap-2"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">{file.filename}</p>
                    <p className="text-xs text-gray-500">Views: {file.views}</p>
                    {file.sharedLink ? (
                        <a
                            href={file.sharedLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 text-xs"
                        >
                            View File
                        </a>
                    ) : (
                        <button
                            onClick={() => onGenerateLink(file._id)}
                            className="text-blue-500 text-xs"
                        >
                            Generate Link
                        </button>
                    )}
                </div>
                <button onClick={() => onDelete(file.filename)} className="text-red-500 text-sm">
                    Delete
                </button>
            </div>

            {/* Tag Section */}
            <div className="mt-2">
                <h4 className="text-xs font-semibold">Tags:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                    {file.tags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-gray-200 px-2 py-1 text-xs rounded flex items-center"
                        >
                            {tag}
                            <button
                                className="ml-1 text-red-500"
                                onClick={() => onRemoveTag(file.filename, tag)}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex mt-2">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        className="border rounded px-2 py-1 text-xs flex-grow"
                    />
                    <button
                        onClick={handleAddTag}
                        className="ml-2 px-4 py-1 text-xs bg-blue-500 text-white rounded"
                    >
                        Add
                    </button>
                </div>
            </div>
        </li>
    );
};

export default SortableItem;
