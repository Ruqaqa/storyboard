require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { statements } = require('./db/database');
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3856;

// Session configuration
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || 60 * 24 * 60 * 60 * 1000); // Default: 60 days in milliseconds
const SESSION_SECRET = process.env.SESSION_SECRET || 'storyboard-secret-change-in-production';

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: SESSION_MAX_AGE
  }
}));

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// API Routes

// Auth routes
app.use('/api/auth', authRoutes);

// Get all parts
app.get('/api/parts', (req, res) => {
  try {
    const parts = statements.getAllParts.all();
    res.json(parts);
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ error: 'Failed to fetch parts' });
  }
});

// Get single part by ID
app.get('/api/parts/:id', (req, res) => {
  try {
    const part = statements.getPartById.get(req.params.id);
    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }
    res.json(part);
  } catch (error) {
    console.error('Error fetching part:', error);
    res.status(500).json({ error: 'Failed to fetch part' });
  }
});

// Create new part (protected)
app.post('/api/parts', requireAuth, (req, res) => {
  try {
    const { title, image_path, movement_description, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Get the max order_index and add 1
    const maxOrder = statements.getMaxOrderIndex.get();
    const orderIndex = (maxOrder.max_order || 0) + 1;
    
    const result = statements.createPart.run(
      orderIndex,
      title,
      image_path || null,
      movement_description || '',
      content
    );
    
    const newPart = statements.getPartById.get(result.lastInsertRowid);
    res.status(201).json(newPart);
  } catch (error) {
    console.error('Error creating part:', error);
    res.status(500).json({ error: 'Failed to create part' });
  }
});

// Reorder parts (must be before /api/parts/:id to avoid route conflict) (protected)
app.put('/api/parts/reorder', requireAuth, (req, res) => {
  try {
    const { parts } = req.body;
    
    if (!Array.isArray(parts)) {
      return res.status(400).json({ error: 'Parts array is required' });
    }
    
    // Update order_index for each part in a transaction-like manner
    const updateTransaction = statements.db.transaction((partsToUpdate) => {
      for (const part of partsToUpdate) {
        statements.updateOrderIndex.run(part.order_index, part.id);
      }
    });
    
    updateTransaction(parts);
    
    const updatedParts = statements.getAllParts.all();
    res.json(updatedParts);
  } catch (error) {
    console.error('Error reordering parts:', error);
    res.status(500).json({ error: 'Failed to reorder parts' });
  }
});

// Update part (protected)
app.put('/api/parts/:id', requireAuth, (req, res) => {
  try {
    const { title, image_path, movement_description, content } = req.body;
    const partId = req.params.id;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const result = statements.updatePart.run(
      title,
      image_path || null,
      movement_description || '',
      content,
      partId
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }
    
    const updatedPart = statements.getPartById.get(partId);
    res.json(updatedPart);
  } catch (error) {
    console.error('Error updating part:', error);
    res.status(500).json({ error: 'Failed to update part' });
  }
});

// Delete part (protected)
app.delete('/api/parts/:id', requireAuth, (req, res) => {
  try {
    const partId = req.params.id;
    const part = statements.getPartById.get(partId);
    
    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }
    
    // Delete associated image file if exists
    if (part.image_path) {
      const imagePath = path.join(__dirname, '../public', part.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    statements.deletePart.run(partId);
    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    console.error('Error deleting part:', error);
    res.status(500).json({ error: 'Failed to delete part' });
  }
});

// Upload image (protected)
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imagePath = '/uploads/' + req.file.filename;
    res.json({ path: imagePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Storyboard server running on http://localhost:${PORT}`);
});

module.exports = app;

