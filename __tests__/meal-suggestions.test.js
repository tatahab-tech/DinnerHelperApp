/**
 * Unit tests for meal suggestion functionality
 */

// Mock the DOM elements and functions that would be available in the browser
const mockDOM = {
  getElementById: jest.fn(),
  querySelectorAll: jest.fn(),
  addEventListener: jest.fn(),
};

// Mock the RECIPE_DATABASE
const RECIPE_DATABASE = {
  "pasta-carbonara": {
    name: "Pasta Carbonara",
    ingredients: ["pasta", "eggs", "cheese", "bacon", "garlic", "olive-oil"],
    difficulty: "Medium",
    time: "25 min",
    cuisine: "Italian",
    description: "Classic Italian pasta with eggs, cheese, and bacon"
  },
  "chicken-stir-fry": {
    name: "Chicken Stir Fry",
    ingredients: ["chicken", "rice", "vegetables", "soy-sauce", "garlic", "olive-oil"],
    difficulty: "Easy",
    time: "20 min",
    cuisine: "Asian",
    description: "Quick and healthy chicken with vegetables over rice"
  },
  "vegetarian-pasta": {
    name: "Vegetarian Pasta",
    ingredients: ["pasta", "tomatoes", "cheese", "garlic", "olive-oil", "herbs"],
    difficulty: "Easy",
    time: "15 min",
    cuisine: "Italian",
    description: "Simple vegetarian pasta with fresh tomatoes and herbs"
  },
  "beef-tacos": {
    name: "Beef Tacos",
    ingredients: ["beef", "tortillas", "cheese", "tomatoes", "lettuce", "onions"],
    difficulty: "Easy",
    time: "30 min",
    cuisine: "Mexican",
    description: "Spicy ground beef tacos with fresh toppings"
  }
};

// Import the functions we want to test (we'll need to extract them from script.js)
// For now, we'll define them here for testing
function findMatchingMeals(availableIngredients) {
  const suggestions = [];
  
  Object.keys(RECIPE_DATABASE).forEach(recipeId => {
    const recipe = RECIPE_DATABASE[recipeId];
    const matchingIngredients = recipe.ingredients.filter(ingredient => 
      availableIngredients.includes(ingredient)
    );
    
    const matchPercentage = (matchingIngredients.length / recipe.ingredients.length) * 100;
    
    if (matchPercentage >= 50) { // Suggest if at least 50% of ingredients match
      suggestions.push({
        id: recipeId,
        ...recipe,
        matchPercentage: Math.round(matchPercentage),
        missingIngredients: recipe.ingredients.filter(ingredient => 
          !availableIngredients.includes(ingredient)
        )
      });
    }
  });
  
  // Sort by match percentage (highest first)
  return suggestions.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

function suggestMeals() {
  try {
    const savedIngredients = JSON.parse(localStorage.getItem('dinnerHelperIngredients')) || [];
    
    if (savedIngredients.length === 0) {
      return { success: false, message: 'No ingredients saved' };
    }
    
    const suggestedMeals = findMatchingMeals(savedIngredients);
    return { success: true, meals: suggestedMeals };
  } catch (error) {
    return { success: false, message: 'Error parsing saved ingredients' };
  }
}

describe('Meal Suggestion System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findMatchingMeals', () => {
    test('should return empty array when no ingredients provided', () => {
      const result = findMatchingMeals([]);
      expect(result).toEqual([]);
    });

    test('should find meals with 100% ingredient match', () => {
      const ingredients = ["pasta", "eggs", "cheese", "bacon", "garlic", "olive-oil"];
      const result = findMatchingMeals(ingredients);
      
      expect(result.length).toBeGreaterThanOrEqual(1);
      const pastaCarbonara = result.find(meal => meal.id === 'pasta-carbonara');
      expect(pastaCarbonara).toBeDefined();
      expect(pastaCarbonara.matchPercentage).toBe(100);
      expect(pastaCarbonara.missingIngredients).toEqual([]);
    });

    test('should find meals with partial ingredient match (50%+)', () => {
      const ingredients = ["pasta", "cheese", "garlic", "olive-oil"]; // 4 out of 6 ingredients
      const result = findMatchingMeals(ingredients);
      
      expect(result).toHaveLength(2); // pasta-carbonara and vegetarian-pasta
      expect(result[0].id).toBe('pasta-carbonara');
      expect(result[0].matchPercentage).toBe(67); // 4/6 = 66.67% rounded to 67%
      expect(result[0].missingIngredients).toEqual(["eggs", "bacon"]);
    });

    test('should not suggest meals with less than 50% match', () => {
      const ingredients = ["pasta"]; // Only 1 out of 6 ingredients
      const result = findMatchingMeals(ingredients);
      
      expect(result).toHaveLength(0);
    });

    test('should sort results by match percentage (highest first)', () => {
      const ingredients = ["pasta", "cheese", "garlic", "olive-oil", "chicken", "rice"];
      const result = findMatchingMeals(ingredients);
      
      expect(result).toHaveLength(3);
      expect(result[0].matchPercentage).toBeGreaterThanOrEqual(result[1].matchPercentage);
      expect(result[1].matchPercentage).toBeGreaterThanOrEqual(result[2].matchPercentage);
    });

    test('should correctly identify missing ingredients', () => {
      const ingredients = ["pasta", "cheese", "garlic"];
      const result = findMatchingMeals(ingredients);
      
      const pastaCarbonara = result.find(meal => meal.id === 'pasta-carbonara');
      expect(pastaCarbonara).toBeDefined();
      expect(pastaCarbonara.missingIngredients).toEqual(["eggs", "bacon", "olive-oil"]);
    });

    test('should handle multiple cuisines correctly', () => {
      const ingredients = ["chicken", "rice", "vegetables", "soy-sauce", "garlic", "olive-oil"];
      const result = findMatchingMeals(ingredients);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('chicken-stir-fry');
      expect(result[0].cuisine).toBe('Asian');
    });
  });

  describe('suggestMeals', () => {
    test('should return error when no ingredients are saved', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = suggestMeals();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('No ingredients saved');
    });

    test('should return error when localStorage contains invalid JSON', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const result = suggestMeals();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Error parsing saved ingredients');
    });

    test('should return suggestions when ingredients are saved', () => {
      const savedIngredients = ["pasta", "cheese", "garlic", "olive-oil"];
      localStorage.getItem.mockReturnValue(JSON.stringify(savedIngredients));
      
      const result = suggestMeals();
      
      expect(result.success).toBe(true);
      expect(result.meals).toBeDefined();
      expect(Array.isArray(result.meals)).toBe(true);
    });

    test('should handle empty saved ingredients array', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]));
      
      const result = suggestMeals();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('No ingredients saved');
    });
  });

  describe('Recipe Database Structure', () => {
    test('should have valid recipe structure', () => {
      Object.values(RECIPE_DATABASE).forEach(recipe => {
        expect(recipe).toHaveProperty('name');
        expect(recipe).toHaveProperty('ingredients');
        expect(recipe).toHaveProperty('difficulty');
        expect(recipe).toHaveProperty('time');
        expect(recipe).toHaveProperty('cuisine');
        expect(recipe).toHaveProperty('description');
        
        expect(typeof recipe.name).toBe('string');
        expect(Array.isArray(recipe.ingredients)).toBe(true);
        expect(recipe.ingredients.length).toBeGreaterThan(0);
        expect(['Easy', 'Medium', 'Hard']).toContain(recipe.difficulty);
        expect(recipe.time).toMatch(/\d+\s*min/);
        expect(typeof recipe.cuisine).toBe('string');
        expect(typeof recipe.description).toBe('string');
      });
    });

    test('should have unique recipe IDs', () => {
      const recipeIds = Object.keys(RECIPE_DATABASE);
      const uniqueIds = new Set(recipeIds);
      expect(recipeIds.length).toBe(uniqueIds.size);
    });

    test('should have valid ingredient names', () => {
      Object.values(RECIPE_DATABASE).forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
          expect(typeof ingredient).toBe('string');
          expect(ingredient.length).toBeGreaterThan(0);
          expect(ingredient).toMatch(/^[a-z-]+$/); // Only lowercase letters and hyphens
        });
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle ingredients with special characters', () => {
      const ingredients = ["soy-sauce", "olive-oil", "chicken", "rice"]; // 4 out of 6 ingredients = 67%
      const result = findMatchingMeals(ingredients);
      
      // Should find chicken-stir-fry which has these ingredients
      const chickenStirFry = result.find(meal => meal.id === 'chicken-stir-fry');
      expect(chickenStirFry).toBeDefined();
      expect(chickenStirFry.matchPercentage).toBe(67); // 4 out of 6 ingredients
    });

    test('should handle exact 50% match threshold', () => {
      const ingredients = ["pasta", "cheese", "garlic"]; // Exactly 3 out of 6 for pasta-carbonara
      const result = findMatchingMeals(ingredients);
      
      const pastaCarbonara = result.find(meal => meal.id === 'pasta-carbonara');
      expect(pastaCarbonara).toBeDefined();
      expect(pastaCarbonara.matchPercentage).toBe(50);
    });

    test('should handle case sensitivity', () => {
      const ingredients = ["PASTA", "CHEESE", "GARLIC"]; // Uppercase
      const result = findMatchingMeals(ingredients);
      
      // Should not match because our database uses lowercase
      expect(result).toHaveLength(0);
    });
  });
});
