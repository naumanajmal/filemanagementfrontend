import axios from 'axios';
const BASE_URL = 'http://http://138.68.71.102:5001'; // Replace with your API URL

export const uploadFiles = async (files, tags = [], token) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('tags', tags.join(','));
  try {
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
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
      const response = await axios.delete(`${BASE_URL}/file/${filename}`, {
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
    const apiUrl = `${BASE_URL}/files/update-tags`; // Replace with your API endpoint

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
      const response = await axios.post(`${BASE_URL}/share/${fileId}`, {}, {
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
      const response = await axios.get(`${BASE_URL}/view/${sharedId}`, {
        responseType: 'blob', // Fetch as a file blob
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching shared file:', error);
      throw error.response ? error.response.data : error.message;
    }
  };