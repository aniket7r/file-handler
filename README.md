# File Manager Application

A simple React-based file management system that allows users to upload, download, and compare files for similarity. Includes features like corrupted file detection (0 KB check) and file hash-based comparison.

## Features
- Upload and download files.
- Detect corrupted files (0 KB) and prevent their upload or download.
- File similarity check using hash values.
- User-friendly interface with table view.

## Prerequisites
- **Node.js** (v14 or above)
- **npm** or **yarn**

## Setup and Run Locally

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/file-manager.git
   cd file-checker```
2. **Install Dependencies**:
    ```
    npm install
    ```
3. **Run App**:
    ```
    cd backend
    node server.js
    cd ..
    cd frontend
    npm run dev
    ```

## Backend API Endpoints
- GET /files: Fetch all uploaded files.
- POST /upload: Upload a new file.
- GET /hash/:filename: Get the hash value of a file.
- GET /download/:filename: Download a file.

## File Similarity Check
1. Click on File Similarity Check.
2. Select two files using checkboxes.
3. Compare their hash values to determine similarity.

## Notes
- Files with a size of 0 KB are marked as corrupted and cannot be downloaded.
- Ensure the backend is configured correctly for file operations.