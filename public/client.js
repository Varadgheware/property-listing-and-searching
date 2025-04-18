// Connect to socket.io
const socket = io(); // Socket connection

// Real-time popup when a property is added
socket.on('property-added', (data) => {
  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerText = `New property added: ${data.title} in ${data.city}`;
  
  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 4000);
});

function addProperty() {
  const data = {
    title: document.getElementById('title').value,
    city: document.getElementById('city').value,
    description: document.getElementById('description').value,
    houseType: document.getElementById('houseType').value,
    bhkType: document.getElementById('bhkType').value,
    area: document.getElementById('area').value,
    furnishingType: document.getElementById('furnishingType').value,
    facilities: document.getElementById('facilities').value,
    price: document.getElementById('price').value
  };

  fetch('/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(result => {
    // alert box — notification will appear via socket
    console.log(result.message);
  })
  .catch(err => {
    console.error(err);
    alert('Failed to add property.');
  });
}

function searchProperties() {
  const location = document.getElementById('location').value;
  const bhkType = document.getElementById('bhkTypeSearch').value;
  const priceMin = document.getElementById('priceMin').value;
  const priceMax = document.getElementById('priceMax').value;

  const query = `/search?location=${encodeURIComponent(location)}&bhkType=${encodeURIComponent(bhkType)}&priceMin=${priceMin}&priceMax=${priceMax}`;

  fetch(query)
    .then(res => {
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    })
    .then(data => {
      const resultDiv = document.getElementById('property-results');
      resultDiv.innerHTML = '';

      if (data.length === 0) {
        resultDiv.innerHTML = '<p>No properties found.</p>';
        return;
      }

      data.forEach(item => {
        resultDiv.innerHTML += `
          <div class="card">
            <h3>${item["Property Title"]}</h3>
            <p><strong>Price:</strong> ${item.Price}</p>
            <p><strong>Location:</strong> ${item.Location}</p>
            <p><strong>Area:</strong> ${item.Total_Area || 'N/A'} sqft</p>
            <p><strong>Baths:</strong> ${item.Baths || 'N/A'}</p>
            <p><strong>Balcony:</strong> ${item.Balcony || 'N/A'}</p>
            <p><strong>Description:</strong> ${item.Description}</p>
          </div>
        `;
      });
    })
    .catch(err => {
      console.error(err);
      alert('Failed to fetch properties.');
    });
}
