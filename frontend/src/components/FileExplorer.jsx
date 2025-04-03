import React, { useState, useEffect, useRef } from 'react';
import { usePyodide } from './PyodideProvider';

const FileExplorer = () => {
  const { pyodide, loading } = usePyodide();
  const [currentDir, setCurrentDir] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch files from the current directory.
  // We filter out '.' but keep '..' for upward navigation.
  const fetchFiles = () => {
    try {
      const { FS } = pyodide;
      if (!FS) throw new Error('Filesystem API not available on the Pyodide instance.');
      const cwd = FS.cwd();
      setCurrentDir(cwd);
      const dirContents = FS.readdir(cwd);
      const filtered = dirContents.filter(name => name !== '.');
      setFiles(filtered);
      setError(null);
    } catch (err) {
      console.error('Error reading directory:', err);
      setError(`Error reading directory: ${err.message}`);
    }
  };

  useEffect(() => {
    if (pyodide) {
      fetchFiles();
    }
  }, [pyodide]);

  // Navigate into a directory (or ".." to go up) using relative paths.
  const handleNavigate = (directory) => {
    try {
      const { FS } = pyodide;
      FS.chdir(directory); // Using relative path. Works for subdirectories and ".."
      fetchFiles();
    } catch (err) {
      console.error('Error navigating to directory:', err);
      setError(`Error navigating to directory: ${err.message}`);
    }
  };

  // Delete an item (file or directory) using its name (relative to cwd)
  const handleDelete = (item) => {
    try {
      const { FS } = pyodide;
      FS.unlink(item);
      fetchFiles();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(`Error deleting item: ${err.message}`);
    }
  };

  // Handle multiple file uploads.
  const handleFileUpload = (event) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const uploadPromises = Array.from(fileList).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
          try {
            const { FS } = pyodide;
            const fileData = new Uint8Array(e.target.result);
            // Write the file with its original name in the current working directory
            FS.writeFile(file.name, fileData);
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

    Promise.all(uploadPromises)
      .then(() => {
        fetchFiles();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })
      .catch(err => {
        console.error('Error uploading files:', err);
        setError(`Error uploading files: ${err.message}`);
      });
  };

  if (loading || currentDir === null) {
    return <div>Loading Pyodide...</div>;
  }

  return (
    <div>
      <h2>File Explorer: {currentDir}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* File Upload Input */}
      <div>
        <label htmlFor="fileUpload">Upload file(s): </label>
        <input
          id="fileUpload"
          type="file"
          multiple
          onChange={handleFileUpload}
          ref={fileInputRef}
        />
      </div>
      
      {/* List Directory Contents */}
      <ul>
        {files.map((item, index) => {
          let isDir = false;
          try {
            if (item === "..") {
              // Treat ".." as a directory by default
              isDir = true;
            } else {
              const stat = pyodide.FS.stat(item);
              isDir = pyodide.FS.isDir(stat.mode);
            }
          } catch (err) {
            console.error('Error checking item type:', err);
          }
          return (
            <li key={index}>
              {isDir ? (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNavigate(item)}
                >
                  &#x1F5C0; {item}
                </span>
              ) : (
              <div>
                <span draggable="true">&#x1F5CB; {item}</span>
                <button onClick={() => handleDelete(item)} style={{ marginLeft: '10px' }}>
                  &#x1F5D1;
                </button>
              </div>
              )}
            </li>
          );
        })}
      </ul>
      <button onClick={fetchFiles}>Refresh</button>
    </div>
  );
};

export default FileExplorer;
