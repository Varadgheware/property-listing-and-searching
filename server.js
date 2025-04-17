const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = 3000;
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Add Property
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
    if (err) throw err;
    res.json({ message: 'Property added!', id: result.insertId });
  });
});

// Search Properties
// Search from realestate table
app.get('/search', (req, res) => {
  const { location, bhkType, priceMin, priceMax } = req.query;

  let sql = `
    SELECT * FROM realestate 
    WHERE Location LIKE ? 
      AND (PropertyTitle LIKE ? OR Description LIKE ?)`;

  const values = [`%${location}%`, `%${bhkType}%`, `%${bhkType}%`];

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).send(err);

    const filtered = results.filter(item => {
      const priceStr = item.Price;
      const price = parsePrice(priceStr);
      return (!priceMin || price >= parseInt(priceMin)) &&
             (!priceMax || price <= parseInt(priceMax));
    });

    res.json(filtered);
  });
});

function parsePrice(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[^\d.]/g, '');
  if (str.toLowerCase().includes('cr')) return parseFloat(cleaned) * 1e7;
  if (str.toLowerCase().includes('lakh')) return parseFloat(cleaned) * 1e5;
  return parseFloat(cleaned);
}



// Helper to convert price strings like '₹1.99 Cr' or '₹45 Lakh' to number
function parsePrice(str) {
  if (!str) return 0;
  str = str.replace(/[^\d.]/g, '');
  if (str.toLowerCase().includes('cr')) {
    return parseFloat(str) * 10000000;
  } else if (str.toLowerCase().includes('lakh')) {
    return parseFloat(str) * 100000;
  } else {
    return parseFloat(str);
  }
}


// Helper to convert price strings like '₹1.99 Cr' or '₹45 Lakh' to number
function parsePrice(str) {
  if (!str) return 0;
  str = str.replace(/[^\d.]/g, '');
  if (str.toLowerCase().includes('cr')) {
    return parseFloat(str) * 10000000;
  } else if (str.toLowerCase().includes('lakh')) {
    return parseFloat(str) * 100000;
  } else {
    return parseFloat(str);
  }
}


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
