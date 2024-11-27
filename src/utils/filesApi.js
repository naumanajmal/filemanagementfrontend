import axios from 'axios';
const BASE_URL = 'http://46.101.155.18:5002/api'; // Replace with your API URL

export const uploadFiles = async (files, tags = [], token) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('tags', tags.join(','));
  try {
    const response = await axios.post(`${BASE_URL}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`, // Attach the token here
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error.response ? error.response.data : error.message;
  }
};


export const fetchUserFiles = async (token) => {
    console.log("here in fetch api")
    const response = await axios.get(`${BASE_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response)
  
    return response.data;
  };



  export const deleteFile = async (filename, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/files/file/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error.response ? error.response.data : error.message;
    }
  };
  


  // utils/filesApi.js

export const updateFileTags = async (filename, tags, token) => {
    const apiUrl = `${BASE_URL}/files/files/update-tags`; // Replace with your API endpoint

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ filename, tags }),
        });

        if (!response.ok) {
            throw new Error('Failed to update tags');
        }

        const updatedFile = await response.json();
        return updatedFile;
    } catch (error) {
        console.error(error);
        throw error;
    }
};



export const generateShareableLink = async (fileId, token) => {
    try {
      const response = await axios.post(`${BASE_URL}/files/share/${fileId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.sharedLink;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw error.response ? error.response.data : error.message;
    }
  };

  export const fetchSharedFile = async (sharedId) => {
    try {
      const response = await fetch(`${BASE_URL}/files/view/${sharedId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file URL');
      }
      const data = await response.json();
      return data.url;
    } catch (error) {
      throw new Error('File not found or inaccessible.');
    }
  };


  export const updateFileOrder = async (order, token) => {
    const response = await fetch(`${BASE_URL}/files/update-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order }),
    });

    if (!response.ok) {
        throw new Error('Failed to save file order');
    }
    return response.json();
};
