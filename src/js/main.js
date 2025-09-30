async function loadPartial(id, url) {
  const res = await fetch(url);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

loadPartial('header', '/partials/header.html');
loadPartial('footer', '/partials/footer.html');

// Dynamic main content
const recipes = [
  { title: "Spaghetti Bolognese", desc: "Classic Italian pasta with rich meat sauce.", img: "https://source.unsplash.com/100x100/?spaghetti" },
  { title: "Chicken Salad", desc: "Fresh salad with grilled chicken and veggies.", img: "https://source.unsplash.com/100x100/?salad" },
  { title: "Veggie Stir Fry", desc: "Colorful vegetables stir-fried in savory sauce.", img: "https://source.unsplash.com/100x100/?stirfry" }
];

function renderMainContent() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="search-row">
      <input type="text" placeholder="Enter ingredients" id="searchInput">
      <button id="searchBtn">Search</button>
    </div>
    <button class="surprise-btn" id="surpriseBtn"><span>Surprise Me!</span></button>
    <div class="recipes">
      ${recipes.map(r => `
        <div class="recipe-card">
          <div class="recipe-image"></div>
          <div class="recipe-text">
            <div class="recipe-title">${r.title}</div>
            <div class="recipe-desc">${r.desc}</div>
          </div>
          <button class="recipe-btn">View</button>
        </div>
      `).join('')}
    </div>
    <div class="description">
      <div class="description-line"></div>
      <div class="description-line short"></div>
    </div>
  `;
}

renderMainContent();

// Example: Add event listeners for dynamic actions
document.addEventListener('click', (e) => {
  if (e.target.id === 'surpriseBtn') {
    const random = recipes[Math.floor(Math.random() * recipes.length)];
    alert('Try this: ' + random.title);
  }
  if (e.target.id === 'searchBtn') {
    const val = document.getElementById('searchInput').value;
    alert('Searching for: ' + val);
  }
});