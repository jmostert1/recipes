const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Any';

// Curated list of family-friendly food jokes as backup
const FOOD_JOKES = [
  { setup: "Why did the tomato turn red?", delivery: "Because it saw the salad dressing!" },
  { setup: "What do you call cheese that isn't yours?", delivery: "Nacho cheese!" },
  { setup: "Why did the cookie go to the doctor?", delivery: "Because it felt crumbly!" },
  { setup: "What do you call a fake noodle?", delivery: "An impasta!" },
  { setup: "Why don't eggs tell jokes?", delivery: "They'd crack each other up!" },
  { setup: "What did the grape say when it got stepped on?", delivery: "Nothing, it just let out a little wine!" },
  { setup: "Why did the banana go to the doctor?", delivery: "Because it wasn't peeling well!" },
  { setup: "What's orange and sounds like a parrot?", delivery: "A carrot!" },
  { setup: "Why did the coffee file a police report?", delivery: "It got mugged!" },
  { setup: "What do you call a potato that's reluctant to jump into boiling water?", delivery: "A hes-i-tater!" },
  { setup: "Why shouldn't you tell a secret on a farm?", delivery: "Because the potatoes have eyes and the corn has ears!" },
  { setup: "What do you call a sad strawberry?", delivery: "A blueberry!" },
  { setup: "Why did the chef quit?", delivery: "They just didn't have the thyme!" },
  { setup: "What did the lettuce say to the celery?", delivery: "Quit stalking me!" },
  { setup: "Why do mushrooms get invited to all the parties?", delivery: "Because they're fungi!" }
];

/**
 * Gets a random food joke from the curated list
 * @returns {Object} Joke object with standardized format
 */
function getCuratedFoodJoke() {
  const joke = FOOD_JOKES[Math.floor(Math.random() * FOOD_JOKES.length)];
  return {
    id: Math.floor(Math.random() * 10000),
    type: 'twopart',
    category: 'Food',
    joke: null,
    setup: joke.setup,
    delivery: joke.delivery,
    language: 'en',
    safe: true,
    flags: {
      nsfw: false,
      religious: false,
      political: false,
      racist: false,
      sexist: false,
      explicit: false
    }
  };
}

/**
 * Fetches a random safe, family-friendly joke from JokeAPI
 * @returns {Promise<Object>} Joke object with 8+ attributes
 */
export async function getRandomJoke() {
  try {
    const response = await fetch(
      `${JOKE_API_URL}?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&safe-mode`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch joke');
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      type: data.type, // 'single' or 'twopart'
      category: data.category,
      joke: data.joke, // For single jokes
      setup: data.setup, // For two-part jokes
      delivery: data.delivery, // For two-part jokes
      language: data.lang,
      safe: data.safe, // Will always be true with safe-mode
      flags: data.flags // Object with nsfw, religious, political, etc.
    };
  } catch (error) {
    console.error('Error fetching joke:', error);
    throw error;
  }
}

/**
 * Fetches a food-related, family-friendly joke from JokeAPI
 * Tries multiple times to find a food-related joke
 * @returns {Promise<Object>} Food-related joke
 */
export async function getFoodJoke() {
  const foodKeywords = [
    'food', 'cook', 'chef', 'kitchen', 'restaurant', 'eat', 'dinner', 'lunch', 
    'breakfast', 'recipe', 'meal', 'dish', 'cuisine', 'ingredient', 'vegetable',
    'fruit', 'meat', 'bread', 'pizza', 'pasta', 'soup', 'salad', 'dessert',
    'coffee', 'tea', 'wine', 'beer', 'drink', 'hungry', 'taste', 'flavor',
    'spice', 'sauce', 'cheese', 'butter', 'egg', 'milk', 'cream', 'sugar',
    'salt', 'pepper', 'garlic', 'onion', 'tomato', 'potato', 'carrot',
    'chicken', 'beef', 'pork', 'fish', 'bacon', 'hamburger', 'sandwich',
    'taco', 'burrito', 'sushi', 'noodle', 'rice', 'bean', 'apple', 'banana',
    'orange', 'grape', 'strawberry', 'cake', 'cookie', 'pie', 'chocolate',
    'candy', 'waiter', 'menu', 'order', 'serve', 'plate', 'fork', 'spoon',
    'knife', 'oven', 'stove', 'grill', 'bake', 'fry', 'boil', 'roast'
  ];

  // Try up to 10 times to get a food-related joke
  const maxAttempts = 10;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Fetch a random safe joke from the API
      const response = await fetch(
        `${JOKE_API_URL}?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&safe-mode`
      );
      
      if (!response.ok) {
        continue; // Try again
      }
      
      const data = await response.json();
      
      // Check if the joke contains any food-related keywords
      const jokeText = data.type === 'single' 
        ? (data.joke || '').toLowerCase()
        : `${data.setup || ''} ${data.delivery || ''}`.toLowerCase();
      
      const isFoodRelated = foodKeywords.some(keyword => 
        jokeText.includes(keyword.toLowerCase())
      );
      
      if (isFoodRelated && data.safe) {
        // Found a food-related joke!
        return {
          id: data.id,
          type: data.type,
          category: data.category,
          joke: data.joke,
          setup: data.setup,
          delivery: data.delivery,
          language: data.lang,
          safe: data.safe,
          flags: data.flags
        };
      }
      
      // Not food-related, try again
    } catch (error) {
      console.error('Error fetching joke on attempt', attempt + 1, error);
    }
  }
  
  // If we couldn't find a food joke after all attempts, use curated backup
  console.log('Could not find food joke from API, using curated backup');
  return getCuratedFoodJoke();
}

/**
 * Formats joke for display
 * @param {Object} jokeData - Joke object from API
 * @returns {string} Formatted joke text
 */
export function formatJoke(jokeData) {
  if (jokeData.type === 'single') {
    return jokeData.joke;
  } else if (jokeData.type === 'twopart') {
    return `${jokeData.setup}\n\n${jokeData.delivery}`;
  }
  return 'No joke available';
}

/**
 * Get joke metadata for display/logging
 * @param {Object} jokeData - Joke object from API
 * @returns {Object} Metadata about the joke
 */
export function getJokeMetadata(jokeData) {
  return {
    id: jokeData.id,
    category: jokeData.category,
    type: jokeData.type,
    language: jokeData.language,
    isSafe: jokeData.safe,
    hasNoFlags: Object.values(jokeData.flags).every(flag => flag === false)
  };
}
