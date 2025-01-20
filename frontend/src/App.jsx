import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [similarityMode, setSimilarityMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [hashValues, setHashValues] = useState({});
  const [corruptFiles, setCorruptFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const response = await axios.get('http://localhost:5000/files');
    setFiles(response.data);
    const corruptFilesList = response.data.filter(file => file.size === 0).map(file => file.name);
    setCorruptFiles(corruptFilesList);
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size === 0) {
        alert('The selected file is corrupted (0 KB). Please upload a valid file.');
        return;
      }
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploading(false);
      fetchFiles();
    }
  };

  const toggleSimilarityMode = () => {
    setSimilarityMode(!similarityMode);
    setSelectedFiles([]);
    setResult(null);
    setHashValues({});
  };

  const handleFileSelect = (filename) => {
    if (selectedFiles.includes(filename)) {
      setSelectedFiles(selectedFiles.filter((file) => file !== filename));
    } else if (selectedFiles.length < 2) {
      setSelectedFiles([...selectedFiles, filename]);
    }
  };

  const compareFiles = async () => {
    if (selectedFiles.length !== 2) {
      alert('Please select exactly two files for comparison.');
      return;
    }

    const [file1, file2] = selectedFiles;

    try {
      const hash1 = await axios.get(`http://localhost:5000/hash/${file1}`);
      const hash2 = await axios.get(`http://localhost:5000/hash/${file2}`);

      setHashValues({
        [file1]: hash1.data.hash,
        [file2]: hash2.data.hash,
      });

      if (hash1.data.hash === hash2.data.hash) {
        setResult('The selected files are the same.');
      } else {
        setResult('The selected files are different.');
      }
    } catch (error) {
      console.error('Error fetching file hashes:', error);
      alert('An error occurred while comparing files.');
    }
  };

  return (
    <div className="App">
      <h1>File Manager</h1>
      <div className="upload-container">
        <label className="upload-button">
          Upload Files
          <input type="file" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.txt" hidden />
        </label>
        <button className="similarity-button" onClick={toggleSimilarityMode}>
          {similarityMode ? 'Cancel Similarity Check' : 'File Similarity Check'}
        </button>
      </div>

      {uploading && <p>Uploading...</p>}

      <table>
        <thead>
          <tr>
            <th>Uploaded Files</th>
            <th>Size (KB)</th>
            {similarityMode && <th>Select</th>}
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: corruptFiles.includes(file.name) ? '#ffcccc' : similarityMode ? '#f0f0f0' : 'white',
              }}
            >
              <td>
                {corruptFiles.includes(file.name) ? (
                  <span style={{ color: 'red' }}>{file.name} (Corrupted)</span>
                ) : (
                  file.name
                )}
              </td>
              <td>{(file.size / 1024).toFixed(2)}</td>
              {similarityMode && !corruptFiles.includes(file.name) && (
                <td>
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.name)}
                    onChange={() => handleFileSelect(file.name)}
                    disabled={!selectedFiles.includes(file.name) && selectedFiles.length >= 2}
                  />
                </td>
              )}
              <td>
                {corruptFiles.includes(file.name) ? (
                  <span style={{ color: 'red' }}>Unavailable</span>
                ) : (
                  <a href={`http://localhost:5000/download/${file.name}`} target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {similarityMode && (
        <div className="similarity-result">
          <button onClick={compareFiles}>Compare Files</button>
          {result && (
            <div>
              <p>{result}</p>
              <p>
                <strong>File 1 ({selectedFiles[0]}):</strong> {hashValues[selectedFiles[0]] || 'Loading...'}
              </p>
              <p>
                <strong>File 2 ({selectedFiles[1]}):</strong> {hashValues[selectedFiles[1]] || 'Loading...'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
