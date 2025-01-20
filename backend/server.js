import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';


const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Directory to store uploaded files
const uploadDir = path.join(process.cwd(), 'uploaded-files');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filename: req.file.filename, size: req.file.size });
});

// Fetch uploaded files
app.get('/files', (req, res) => {
  const files = fs.readdirSync(uploadDir).map((file) => {
    const stats = fs.statSync(path.join(uploadDir, file));
    return { name: file, size: stats.size };
  });
  res.json(files);
});


// Endpoint to compute hash of a file
app.get('/hash/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  res.json({ filename: req.params.filename, hash });
});

// Download endpoint
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  res.download(filePath);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
