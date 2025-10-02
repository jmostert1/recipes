const SPOONACULAR_API_KEY = 'fa060e9d23734366b9aab2c5434b86f3';

// Fetch recipes by ingredients
export async function getRecipesByIngredients(ingredients, number = 5) {
  console.log('=== getRecipesByIngredients called ===');
  console.log('Ingredients parameter:', ingredients);
  console.log('Number parameter:', number);
  console.log('API Key from env:', SPOONACULAR_API_KEY);
  console.log('Is API key undefined?', SPOONACULAR_API_KEY === undefined);
  
  if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'undefined') {
    throw new Error('API key is not configured. Please check your .env file.');
  }
  
  if (!ingredients) {
    throw new Error('Ingredients parameter is required');
  }
  
  const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${encodeURIComponent(ingredients)}&number=${number}`;
  
  console.log('Fetching from URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error('Failed to fetch recipes');
    }
    
    const data = await response.json();
    console.log('Received recipes:', data);
    return data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
}

// Fetch detailed recipe information by ID
export async function getRecipeDetails(recipeId) {
  const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`;
  
  console.log('Fetching recipe details:', recipeId);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipe details');
    }
    
    const data = await response.json();
    console.log('Received recipe details:', data);
    return data;
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    throw error;
  }
}

// Download data as JSON file so we can use it later
export function downloadAsJson(data, filename = 'recipes.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
