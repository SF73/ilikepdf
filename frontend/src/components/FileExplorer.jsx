// FileExplorer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { usePyodide } from './PyodideProvider';

const FileExplorer = ({ path = '/' }) => {
  let { pyodide, loading } = usePyodide();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch files from the directory using the FS API from Pyodide
  const fetchFiles = () => {
    try {
      const { FS } = pyodide;
      if (!FS) {
        throw new Error('Filesystem API not available on the Pyodide instance.');
      }
      const dirContents = FS.readdir(path);
      // Filter out special entries "." and ".."
      const filtered = dirContents.filter(name => name !== '.' && name !== '..');
      setFiles(filtered);
      setError(null);
    } catch (err) {
      console.error("Error reading directory:", err);
      setError(`Error reading directory: ${err.message}`);
    }
  };

  useEffect(() => {
    if (pyodide) {
      fetchFiles();
    }
  }, [pyodide, path]);

  // Delete a file (or empty directory)
  const handleDelete = (file) => {
    try {
      const { FS } = pyodide;
      const filePath = `${path}${path.endsWith('/') ? '' : '/'}${file}`;
      FS.unlink(filePath);
      fetchFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
      setError(`Error deleting file: ${err.message}`);
    }
  };

  // Handle file uploads for multiple files at once
  const handleFileUpload = (event) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    // Convert the FileList to an array and upload each file
    const uploadPromises = Array.from(fileList).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
          try {
            const { FS } = pyodide;
            // Convert the ArrayBuffer result to a Uint8Array
            const fileData = new Uint8Array(e.target.result);
            // Construct the destination path using the current directory and the file name
            const destPath = `${path}${path.endsWith('/') ? '' : '/'}${file.name}`;
            FS.writeFile(destPath, fileData);
            resolve();
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = function(err) {
          reject(err);
        };

        reader.readAsArrayBuffer(file);
      });
    });

    // Once all files have been uploaded, refresh the file list
    Promise.all(uploadPromises)
    .then(() => {
        fetchFiles();
        // Clear the file input by resetting its value
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })
      .catch(err => {
        console.error("Error uploading files:", err);
        setError(`Error uploading files: ${err.message}`);
      });
  };

  if (loading) {
    return <div>Loading Pyodide...</div>;
  }

  return (
    <div>
      <h2>File Explorer: {path}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* File Upload Input */}
      <div>
        <label htmlFor="fileUpload">Upload file(s): </label>
        <input id="fileUpload" type="file" multiple onChange={handleFileUpload} ref={fileInputRef}/>
      </div>
      
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            {file}
            <button onClick={() => handleDelete(file)} style={{ marginLeft: '10px' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button onClick={fetchFiles}>Refresh</button>
    </div>
  );
};

export default FileExplorer;
