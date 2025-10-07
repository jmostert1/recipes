export async function loadPartial(containerId, url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (error) {
    console.error(`Error loading partial from ${url}:`, error);
  }
}

export function showError(message) {
  alert(`Error: ${message}`);
}

export function showLoading(message = 'Loading...') {
  // Remove existing loader if any
  const existingLoader = document.getElementById('loading-overlay');
  if (existingLoader) {
    existingLoader.remove();
  }
  
  // Create loading overlay with spinner
  const loader = document.createElement('div');
  loader.id = 'loading-overlay';
  loader.className = 'loading-overlay';
  loader.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(loader);
}

export function hideLoading() {
  const loader = document.getElementById('loading-overlay');
  if (loader) {
    loader.remove();
  }
}

/**
 * API returns hyperlinks in instructions, this function removes them, looks better
 */
export function removeHyperlinks(htmlString) {
  if (!htmlString) return '';
  
 
  return htmlString.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
}

// Meal Planner functions
const MEAL_PLAN_KEY = 'mealPlan';

/**
 * Get meal plan from localStorage
 * @returns {Object} Meal plan object with structure: { monday: { breakfast: null, lunch: null, dinner: null, snacks: null }, ... }
 */
export function getMealPlan() {
  const stored = localStorage.getItem(MEAL_PLAN_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Return empty meal plan structure
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const mealPlan = {};
  
  days.forEach(day => {
    mealPlan[day] = {};
    meals.forEach(meal => {
      mealPlan[day][meal] = null;
    });
  });
  
  return mealPlan;
}

/**
 * Save meal plan to localStorage
 * @param {Object} mealPlan - Meal plan object
 */
export function saveMealPlan(mealPlan) {
  localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(mealPlan));
}

/**
 * Add a recipe to a specific day and meal time
 * @param {string} day - Day of the week (lowercase)
 * @param {string} mealTime - Meal time (breakfast, lunch, dinner, snacks)
 * @param {Object} recipe - Recipe object
 */
export function addMealToPlan(day, mealTime, recipe) {
  const mealPlan = getMealPlan();
  mealPlan[day][mealTime] = {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    servings: recipe.servings
  };
  saveMealPlan(mealPlan);
}

/**
 * Remove a meal from the plan
 * @param {string} day - Day of the week
 * @param {string} mealTime - Meal time
 */
export function removeMealFromPlan(day, mealTime) {
  const mealPlan = getMealPlan();
  mealPlan[day][mealTime] = null;
  saveMealPlan(mealPlan);
}

/**
 * Get all unique recipe IDs from the meal plan
 * @returns {Array<number>} Array of recipe IDs
 */
export function getRecipeIdsFromMealPlan() {
  const mealPlan = getMealPlan();
  const recipeIds = new Set();
  
  Object.values(mealPlan).forEach(day => {
    Object.values(day).forEach(meal => {
      if (meal && meal.id) {
        recipeIds.add(meal.id);
      }
    });
  });
  
  return Array.from(recipeIds);
}

/**
 * Aggregate ingredients from multiple recipes
 * @param {Array<Object>} recipes - Array of recipe objects with extendedIngredients
 * @returns {Object} Aggregated ingredients grouped by category
 */
export function aggregateIngredients(recipes) {
  const ingredientMap = {};
  
  recipes.forEach(recipe => {
    if (!recipe.extendedIngredients) return;
    
    recipe.extendedIngredients.forEach(ingredient => {
      const name = ingredient.name || ingredient.original;
      const amount = ingredient.amount || 0;
      const unit = ingredient.unit || '';
      const aisle = ingredient.aisle || 'Other';
      
      // Create a key for grouping (name + unit)
      const key = `${name.toLowerCase()}_${unit.toLowerCase()}`;
      
      if (ingredientMap[key]) {
        // Add to existing ingredient
        ingredientMap[key].amount += amount;
      } else {
        // Create new ingredient entry
        ingredientMap[key] = {
          name: name,
          amount: amount,
          unit: unit,
          aisle: aisle,
          original: ingredient.original
        };
      }
    });
  });
  
  // Group by aisle/category
  const groupedIngredients = {};
  Object.values(ingredientMap).forEach(ingredient => {
    const category = ingredient.aisle;
    if (!groupedIngredients[category]) {
      groupedIngredients[category] = [];
    }
    groupedIngredients[category].push(ingredient);
  });
  
  return groupedIngredients;
}
