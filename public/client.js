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
  }).then(res => res.json())
    .then(result => alert(result.message));
}

function searchProperties() {
  const location = document.getElementById('location').value;
  const bhkType = document.getElementById('bhkTypeSearch').value;
  const priceMin = document.getElementById('priceMin').value;
  const priceMax = document.getElementById('priceMax').value;

  const query = `/search?location=${encodeURIComponent(location)}&bhkType=${encodeURIComponent(bhkType)}&priceMin=${priceMin}&priceMax=${priceMax}`;

  fetch(query)
    .then(res => res.json())
    .then(data => {
      const resultDiv = document.getElementById('property-results');
      resultDiv.innerHTML = '';
      data.forEach(item => {
        resultDiv.innerHTML += `
          <div class="card">
            <h3>${item.PropertyTitle}</h3>
            <p><strong>Price:</strong> ${item.Price}</p>
            <p><strong>Location:</strong> ${item.Location}</p>
            <p><strong>Area:</strong> ${item.Total_Area} sqft</p>
            <p><strong>Baths:</strong> ${item.Baths}</p>
            <p><strong>Balcony:</strong> ${item.Balcony}</p>
            <p><strong>Description:</strong> ${item.Description}</p>
          </div>
        `;
      });
    });
}
