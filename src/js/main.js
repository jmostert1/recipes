//Beef of the site, handles all user interactions, rendering, etc.


import { getRecipesByIngredients, getRecipeDetails, downloadAsJson } from './api.js';
import { loadPartial, showError, showLoading, hideLoading, removeHyperlinks } from './utils.js';

// Cache for last search results
let lastSearchResults = null;
let lastSearchTerm = '';

async function init() {
  await loadPartial('header-container', './partials/header.html');
  await loadPartial('footer-container', './partials/footer.html');
  setupEventListeners();
  setupNavigation();
}

function setupEventListeners() {
  const searchBtn = document.getElementById('searchBtn');
  const surpriseBtn = document.getElementById('surpriseBtn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearchClick);
  }
  
  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', handleSurpriseClick);
  }
}

function setupNavigation() {
  const homeLink = document.getElementById('homeLink');
  const favoritesLink = document.getElementById('favoritesLink');
  
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      location.reload();
    });
  }
  
  if (favoritesLink) {
    favoritesLink.addEventListener('click', (e) => {
      e.preventDefault();
      renderFavoritesPage();
    });
  }
}

async function handleSearchClick() {
  console.log('Search button clicked!');
  const searchInput = document.getElementById('searchInput');
  const ingredients = searchInput.value.trim();
  
  console.log('Search input value:', ingredients);
  
  if (!ingredients) {
    showError('Please enter at least one ingredient');
    return;
  }
  
  try {
    showLoading('Searching recipes...');
    console.log('Calling API with ingredients:', ingredients);
    const recipes = await getRecipesByIngredients(ingredients, 10);
    console.log('Got recipes back:', recipes);
    hideLoading();
    
    // Cache the results
    lastSearchResults = recipes;
    lastSearchTerm = ingredients;
    
    renderRecipes(recipes);
  } catch (error) {
    hideLoading();
    showError('Failed to search recipes. Please try again.');
    console.error('Search error:', error);
  }
}

async function handleSurpriseClick() {
  const ingredients = ['chicken', 'pasta', 'tomato', 'cheese', 'onion'];
  const randomIngredient = ingredients[Math.floor(Math.random() * ingredients.length)];
  
  try {
    showLoading('Finding surprise recipes...');
    const recipes = await getRecipesByIngredients(randomIngredient, 5);
    hideLoading();
    
    // Cache the results
    lastSearchResults = recipes;
    lastSearchTerm = randomIngredient;
    
    renderRecipes(recipes);
  } catch (error) {
    hideLoading();
    showError('Failed to load surprise recipes. Please try again.');
    console.error('Surprise error:', error);
  }
}

function renderRecipes(recipes) {
  console.log('renderRecipes called with:', recipes);
  const resultsContainer = document.getElementById('recipes-list');
  
  if (!resultsContainer) {
    console.error('Recipes container not found');
    return;
  }
  
  console.log('Results container found:', resultsContainer);
  
  if (!recipes || recipes.length === 0) {
    console.log('No recipes to display');
    resultsContainer.innerHTML = '<p>No recipes found. Try different ingredients!</p>';
    return;
  }
  
  console.log(`Rendering ${recipes.length} recipes`);
  
  resultsContainer.innerHTML = recipes.map(recipe => `
    <div class="recipe-card">
      <img src="${recipe.image}" alt="${recipe.title}" />
      <h3>${recipe.title}</h3>
      <p>Uses ${recipe.usedIngredientCount} of your ingredients</p>
      <p>Missing ${recipe.missedIngredientCount} ingredients</p>
      <button onclick="viewRecipe(${recipe.id})">View Recipe</button>
    </div>
  `).join('');
  
  console.log('Recipes rendered successfully');
}

window.viewRecipe = async function(recipeId) {
  console.log('View recipe:', recipeId);
  
  try {
    showLoading('Loading recipe details...');
    const recipe = await getRecipeDetails(recipeId);
    hideLoading();
    renderRecipeDetail(recipe);
  } catch (error) {
    hideLoading();
    showError('Failed to load recipe details. Please try again.');
    console.error('Recipe detail error:', error);
  }
};

function getTimeInfo(recipe) {
  // Extract time information from recipe data
  const prepTime = recipe.preparationMinutes || null;
  const cookTime = recipe.cookingMinutes || null;
  const readyTime = recipe.readyInMinutes || null;
  
  // If we have both prep and cook, use them
  if (prepTime && cookTime) {
    return { prep: prepTime, cook: cookTime };
  }
  
  // If we only have ready time, estimate prep and cook
  if (readyTime) {
    return {
      prep: prepTime || Math.floor(readyTime * 0.3),
      cook: cookTime || Math.floor(readyTime * 0.7)
    };
  }
  
  // Fallback
  return {
    prep: prepTime || null,
    cook: cookTime || null
  };
}

function getDifficulty(recipe) {
  // Determine difficulty based on various factors
  const readyTime = recipe.readyInMinutes || 0;
  const steps = recipe.analyzedInstructions?.[0]?.steps?.length || 0;
  
  if (recipe.veryHealthy) return 'Healthy';
  if (readyTime <= 20 || steps <= 5) return 'Easy';
  if (readyTime <= 45 || steps <= 10) return 'Medium';
  return 'Hard';
}

function renderRecipeDetail(recipe) {
  const mainContent = document.getElementById('main-content');
  
  if (!mainContent) {
    console.error('Main content container not found');
    return;
  }
  
  const timeInfo = getTimeInfo(recipe);
  
  // Hide search section and show detail view
  mainContent.innerHTML = `
    <button id="backBtn">← Back to Results</button>
    
    <div class="recipe-detail">
      <div class="recipe-detail-header">
        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-detail-image" />
        <div class="recipe-detail-info">
          <h1>${recipe.title}</h1>
          <div class="recipe-meta">
            <div class="meta-item">
              <strong>Prep Time</strong>
              <span>${timeInfo.prep ? timeInfo.prep + ' min' : 'N/A'}</span>
            </div>
            <div class="meta-item">
              <strong>Cook Time</strong>
              <span>${timeInfo.cook ? timeInfo.cook + ' min' : 'N/A'}</span>
            </div>
            <div class="meta-item">
              <strong>Servings</strong>
              <span>${recipe.servings || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <strong>Difficulty</strong>
              <span>${getDifficulty(recipe)}</span>
            </div>
          </div>
          <div class="recipe-description">
            ${removeHyperlinks(recipe.summary) || 'This area contains a brief overview of the dish, what makes it special, and any key highlights that entice interest for tasters!'}
          </div>
        </div>
      </div>
      
      <div class="recipe-content">
        <div class="ingredients-section">
          <h2>Ingredients</h2>
          <ul>
            ${recipe.extendedIngredients.map(ing => `
              <li>
                <span class="ingredient-name">${ing.original}</span>
                <span class="ingredient-amount">${ing.measures?.metric?.amount || ''} ${ing.measures?.metric?.unitShort || ''}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="instructions-section">
          <h2>Instructions</h2>
          ${renderInstructions(recipe)}
        </div>
      </div>
      
      <!-- Add to Favorites Button -->
      <div class="favorites-action">
        <button id="addToFavoritesBtn" class="btn-favorites">
          <span class="heart-icon">♥</span> Add to Favorites
        </button>
      </div>
    </div>
  `;
  
  // Add back button listener
  document.getElementById('backBtn').addEventListener('click', backToResults);
  
  // Add to favorites button listener
  const favBtn = document.getElementById('addToFavoritesBtn');
  if (favBtn) {
    // Check if already favorited
    if (isFavorite(recipe.id)) {
      favBtn.innerHTML = '<span class="heart-icon">♥</span> Remove from Favorites';
      favBtn.classList.add('favorited');
    }
    
    favBtn.addEventListener('click', () => toggleFavorite(recipe));
  }
}

function backToResults() {
  const mainContent = document.getElementById('main-content');
  
  if (!mainContent) return;
  
  // Restore the search page
  mainContent.innerHTML = `
    <!-- Search Section -->
    <section class="search-section">
      <h1>Find Your Perfect Recipe</h1>
      <div class="search-bar">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Enter ingredients (e.g., chicken, tomato, cheese)..." 
          value="${lastSearchTerm}"
        />
        <button id="searchBtn" class="btn btn-primary">Search</button>
        <button id="surpriseBtn" class="btn btn-secondary">Surprise Me!</button>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results-section">
      <div id="recipes-list"></div>
    </section>
  `;
  
  // Re-setup event listeners
  setupEventListeners();
  
  // Restore the last search results if available
  if (lastSearchResults) {
    renderRecipes(lastSearchResults);
  }
}

function isEnglishText(text) {
  // Check if text contains mostly English characters
  // Allow letters, numbers, common punctuation, and some accented characters
  const englishPattern = /^[\x00-\x7F\u00C0-\u00FF\s.,!?;:()\-'"]+$/;
  return englishPattern.test(text);
}

function renderInstructions(recipe) {
  if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
    const steps = recipe.analyzedInstructions[0].steps;
    
    // Check if the first step is in English
    if (steps.length > 0 && !isEnglishText(steps[0].step)) {
      return `
        <div class="no-instructions">
          <p>⚠️ Instructions are not available in English for this recipe.</p>
          <p>Please try searching for a similar recipe or check the source website.</p>
        </div>
      `;
    }
    
    return `
      <ol>
        ${steps.map(step => `
          <li>${step.step}</li>
        `).join('')}
      </ol>
    `;
  } else if (recipe.instructions) {
    // Check if instructions are in English
    if (!isEnglishText(recipe.instructions)) {
      return `
        <div class="no-instructions">
          <p>⚠️ Instructions are not available in English for this recipe.</p>
          <p>Please try searching for a similar recipe or check the source website.</p>
        </div>
      `;
    }
    return `<p>${recipe.instructions}</p>`;
  } else {
    return `
      <div class="no-instructions">
        <p>No instructions available for this recipe.</p>
      </div>
    `;
  }
}

// Favorites Page
function renderFavoritesPage() {
  const mainContent = document.getElementById('main-content');
  
  if (!mainContent) return;
  
  const favorites = getFavorites();
  
  mainContent.innerHTML = `
    <div class="favorites-page">
      <h1>❤️ My Favorite Recipes</h1>
      <p class="favorites-count">${favorites.length} recipe${favorites.length !== 1 ? 's' : ''} saved</p>
      
      ${favorites.length === 0 ? `
        <div class="empty-favorites">
          <p>You haven't saved any favorites yet!</p>
          <p>Search for recipes and click "Add to Favorites" to save them here.</p>
          <button id="backToHomeBtn" class="btn btn-primary">Start Searching</button>
        </div>
      ` : `
        <div class="favorites-grid">
          ${favorites.map(recipe => `
            <div class="recipe-card">
              <img src="${recipe.image}" alt="${recipe.title}" />
              <h3>${recipe.title}</h3>
              <p>${recipe.readyInMinutes ? recipe.readyInMinutes + ' min' : 'Quick & Easy'}</p>
              <div class="card-actions">
                <button onclick="viewRecipe(${recipe.id})" class="btn-view">View Recipe</button>
                <button onclick="removeFavorite(${recipe.id})" class="btn-remove">Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  
  // Add event listener for back to home button if empty
  const backBtn = document.getElementById('backToHomeBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => location.reload());
  }
}

// Favorites Management Functions
function getFavorites() {
  const favorites = localStorage.getItem('recipesFavorites');
  return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem('recipesFavorites', JSON.stringify(favorites));
}

function isFavorite(recipeId) {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === recipeId);
}

function toggleFavorite(recipe) {
  const favorites = getFavorites();
  const existingIndex = favorites.findIndex(fav => fav.id === recipe.id);
  
  if (existingIndex > -1) {
    // Remove from favorites
    favorites.splice(existingIndex, 1);
    saveFavorites(favorites);
    showError('Removed from favorites!');
    
    // Update button
    const btn = document.getElementById('addToFavoritesBtn');
    if (btn) {
      btn.innerHTML = '<span class="heart-icon">♥</span> Add to Favorites';
      btn.classList.remove('favorited');
    }
  } else {
    // Add to favorites - store essential recipe info
    const favoriteRecipe = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      summary: recipe.summary,
      extendedIngredients: recipe.extendedIngredients,
      analyzedInstructions: recipe.analyzedInstructions,
      instructions: recipe.instructions,
      preparationMinutes: recipe.preparationMinutes,
      cookingMinutes: recipe.cookingMinutes,
      veryHealthy: recipe.veryHealthy,
      savedAt: new Date().toISOString()
    };
    
    favorites.push(favoriteRecipe);
    saveFavorites(favorites);
    showError('Added to favorites!');
    
    // Update button
    const btn = document.getElementById('addToFavoritesBtn');
    if (btn) {
      btn.innerHTML = '<span class="heart-icon">♥</span> Remove from Favorites';
      btn.classList.add('favorited');
    }
  }
}

window.removeFavorite = function(recipeId) {
  const favorites = getFavorites();
  const filtered = favorites.filter(fav => fav.id !== recipeId);
  saveFavorites(filtered);
  renderFavoritesPage(); 
  showError('Removed from favorites!');
};

document.addEventListener('DOMContentLoaded', init);
