import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

const PublicFileViewer = () => {
  const { sharedId } = useParams(); // Get the sharedId from the URL
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [error, setError] = useState('');
  const didMount = useRef(false); // To prevent the second invocation

  useEffect(() => {
    if (didMount.current) return; // Skip if already ran
    didMount.current = true;

    console.log("Fetching file URL for sharedId:", sharedId);

    const fetchFileUrl = async () => {
      try {
        const response = await fetch(`http://localhost:5001/view/${sharedId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch file URL');
        }
        const data = await response.json();
        const url = data.url;

        const contentType = url.includes('.pdf')
          ? 'application/pdf'
          : url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')
          ? 'image/jpeg'
          : url.includes('.mp4')
          ? 'video/mp4'
          : '';
        setFileUrl(url);
        setFileType(contentType);
      } catch (err) {
        setError('File not found or inaccessible.');
      }
    };

    fetchFileUrl();
  }, [sharedId]);

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-lg font-semibold mb-4">Public File Viewer</h1>
      {fileUrl ? (
        <>
          {fileType.startsWith('image/') ? (
            <img src={fileUrl} alt="Shared file" className="max-w-full mx-auto" />
          ) : fileType === 'application/pdf' ? (
            <iframe
              src={fileUrl}
              title="PDF Viewer"
              className="w-full h-screen"
            ></iframe>
          ) : fileType.startsWith('video/') ? (
            <video src={fileUrl} controls className="max-w-full mx-auto"></video>
          ) : (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Download File
            </a>
          )}
        </>
      ) : (
        <div>Loading file...</div>
      )}
    </div>
  );
};

export default PublicFileViewer;
