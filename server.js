const express = require('express');
const cors = require('cors');
const db = require('./db');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store socket reference
io.on('connection', (socket) => {
  console.log('A user connected');
});

// Add Property (with socket emit)
app.post('/add', (req, res) => {
  const {
    title, city, description, houseType,
    bhkType, area, furnishingType, facilities, price
  } = req.body;

  const sql = `INSERT INTO properties 
    (title, city, description, house_type, bhk_type, area, furnishing_type, facilities, price) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [title, city, description, houseType, bhkType, area, furnishingType, facilities, price];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to add property' });
    }

    // Emit real-time notification to all users
    io.emit('property-added', { title, city });

    res.json({ message: 'Property added!', id: result.insertId });
  });
});

// Search Route
app.get('/search', (req, res) => {
  const { location, bhkType, priceMin, priceMax } = req.query;

  const sql = `
    SELECT * FROM realestate 
    WHERE Location LIKE ? 
      AND (\`Property Title\` LIKE ? OR \`Description\` LIKE ?)`;

  const values = [`%${location}%`, `%${bhkType}%`, `%${bhkType}%`];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    const filtered = results.filter(item => {
      const price = parsePrice(item.Price);
      const bhkInTitle = extractBHK(item["Property Title"]);
      const bhkInDescription = extractBHK(item.Description);
      const bhk = bhkInTitle || bhkInDescription;

      const isBHKMatch = !bhkType || parseInt(bhkType) === bhk;
      const isPriceMatch = (!priceMin || price >= parseInt(priceMin)) &&
                           (!priceMax || price <= parseInt(priceMax));

      return isBHKMatch && isPriceMatch;
    });

    res.json(filtered);
  });
});

function parsePrice(str) {
  if (!str) return 0;
  str = str.toLowerCase();
  const cleaned = str.replace(/[^\d.]/g, '');
  if (str.includes('cr')) return parseFloat(cleaned) * 1e7;
  if (str.includes('lakh')) return parseFloat(cleaned) * 1e5;
  return parseFloat(cleaned);
}

function extractBHK(text) {
  if (!text) return null;
  const match = text.match(/(\d+)\s*BHK/i);
  if (match) return parseInt(match[1]);

  const wordMap = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  for (let word in wordMap) {
    if (text.toLowerCase().includes(`${word} bhk`)) {
      return wordMap[word];
    }
  }
  return null;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
