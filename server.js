const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Ensure catalog.json exists
const catalogPath = path.join(__dirname, 'catalog.json');
if (!fs.existsSync(catalogPath)) {
  fs.writeFileSync(catalogPath, '[]');
}

// Serve static files
app.use(express.static(path.join(__dirname, 'src')));
app.use('/uploads', express.static(uploadsDir));
app.use(express.json());

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Load catalog from file
function loadCatalog() {
  try {
    return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  } catch {
    return [];
  }
}

// Save catalog to file
function saveCatalog(catalog) {
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
}

// API: Get catalog
app.get('/api/catalog', (req, res) => {
  res.json(loadCatalog());
});

// API: Add product
app.post('/api/catalog', upload.single('productImage'), (req, res) => {
  const { productName, productTagline, productPrice } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const catalog = loadCatalog();
  catalog.push({
    image: imageUrl,
    name: productName,
    tagline: productTagline,
    price: productPrice
  });
  saveCatalog(catalog);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});