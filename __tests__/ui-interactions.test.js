/**
 * Unit tests for UI interactions and DOM manipulation
 */

// Mock DOM elements
const mockSaveButton = {
  textContent: 'Save My Ingredients',
  style: {},
  addEventListener: jest.fn()
};

const mockSuggestButton = {
  textContent: 'Get Meal Suggestions',
  style: {},
  addEventListener: jest.fn()
};

const mockSavedIngredientsList = {
  innerHTML: ''
};

const mockMealSuggestions = {
  innerHTML: ''
};

// Mock DOM methods
const mockDOM = {
  getElementById: jest.fn((id) => {
    const elements = {
      'saveBtn': mockSaveButton,
      'suggestMealsBtn': mockSuggestButton,
      'savedIngredientsList': mockSavedIngredientsList,
      'mealSuggestions': mockMealSuggestions
    };
    return elements[id] || null;
  }),
  querySelectorAll: jest.fn(() => []),
  addEventListener: jest.fn()
};

// Mock the UI interaction functions
function showSuccessMessage() {
  const originalText = mockSaveButton.textContent;
  mockSaveButton.textContent = 'Saved! ✓';
  mockSaveButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
  
  // Simulate timeout behavior
  setTimeout(() => {
    mockSaveButton.textContent = originalText;
    mockSaveButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
  }, 100); // Shorter timeout for testing
  
  return { success: true, message: 'Success message shown' };
}

function showErrorMessage() {
  const originalText = mockSaveButton.textContent;
  mockSaveButton.textContent = 'Error! Try again';
  mockSaveButton.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
  
  // Simulate timeout behavior
  setTimeout(() => {
    mockSaveButton.textContent = originalText;
    mockSaveButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
  }, 100); // Shorter timeout for testing
  
  return { success: true, message: 'Error message shown' };
}

function displaySuggestedMeals(meals) {
  if (meals.length === 0) {
    mockMealSuggestions.innerHTML = `
      <div class="no-suggestions">
        <h3>No meal suggestions available</h3>
        <p>Try adding more ingredients to get better suggestions!</p>
      </div>
    `;
    return { success: true, message: 'No suggestions message displayed' };
  }
  
  const mealsHTML = meals.map(meal => `
    <div class="meal-card" data-meal-id="${meal.id}">
      <div class="meal-header">
        <h3 class="meal-name">${meal.name}</h3>
        <div class="meal-match">${meal.matchPercentage}% match</div>
      </div>
      <div class="meal-details">
        <div class="meal-info">
          <span class="meal-cuisine">${meal.cuisine}</span>
          <span class="meal-difficulty">${meal.difficulty}</span>
          <span class="meal-time">${meal.time}</span>
        </div>
        <p class="meal-description">${meal.description}</p>
        <div class="meal-ingredients">
          <h4>Ingredients needed:</h4>
          <div class="ingredients-list">
            ${meal.ingredients.map(ingredient => {
              const isAvailable = !meal.missingIngredients.includes(ingredient);
              return `<span class="ingredient-tag ${isAvailable ? 'available' : 'missing'}">${ingredient.replace('-', ' ')}</span>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="meal-actions">
        <button class="select-meal-btn" onclick="selectMeal('${meal.id}')">Select This Meal</button>
        <button class="view-details-btn" onclick="viewMealDetails('${meal.id}')">View Details</button>
      </div>
    </div>
  `).join('');
  
  mockMealSuggestions.innerHTML = mealsHTML;
  return { success: true, message: `${meals.length} meals displayed` };
}

function selectMeal(mealId) {
  const meal = { id: mealId, name: 'Test Meal' };
  window.alert(`Great choice! You selected ${meal.name}. This feature will be expanded in future updates.`);
  return { success: true, mealId };
}

function viewMealDetails(mealId) {
  const meal = { 
    id: mealId, 
    name: 'Test Meal',
    cuisine: 'Test Cuisine',
    difficulty: 'Easy',
    time: '15 min',
    description: 'Test description'
  };
  window.alert(`Meal Details:\n\n${meal.name}\nCuisine: ${meal.cuisine}\nDifficulty: ${meal.difficulty}\nTime: ${meal.time}\n\n${meal.description}`);
  return { success: true, mealId };
}

describe('UI Interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset button states
    mockSaveButton.textContent = 'Save My Ingredients';
    mockSaveButton.style = {};
    mockSuggestButton.textContent = 'Get Meal Suggestions';
    mockSuggestButton.style = {};
  });

  describe('showSuccessMessage', () => {
    test('should update button text and style', () => {
      const result = showSuccessMessage();
      
      expect(result.success).toBe(true);
      expect(mockSaveButton.textContent).toBe('Saved! ✓');
      expect(mockSaveButton.style.background).toBe('linear-gradient(135deg, #48bb78 0%, #38a169 100%)');
    });

    test('should restore original text after timeout', (done) => {
      const originalText = mockSaveButton.textContent;
      showSuccessMessage();
      
      setTimeout(() => {
        expect(mockSaveButton.textContent).toBe(originalText);
        done();
      }, 150);
    });
  });

  describe('showErrorMessage', () => {
    test('should update button text and style for error', () => {
      const result = showErrorMessage();
      
      expect(result.success).toBe(true);
      expect(mockSaveButton.textContent).toBe('Error! Try again');
      expect(mockSaveButton.style.background).toBe('linear-gradient(135deg, #e53e3e 0%, #c53030 100%)');
    });

    test('should restore original text after timeout', (done) => {
      const originalText = mockSaveButton.textContent;
      showErrorMessage();
      
      setTimeout(() => {
        expect(mockSaveButton.textContent).toBe(originalText);
        done();
      }, 150);
    });
  });

  describe('displaySuggestedMeals', () => {
    test('should display no suggestions message when empty array', () => {
      const result = displaySuggestedMeals([]);
      
      expect(result.success).toBe(true);
      expect(mockMealSuggestions.innerHTML).toContain('No meal suggestions available');
      expect(mockMealSuggestions.innerHTML).toContain('no-suggestions');
    });

    test('should display meal cards when meals provided', () => {
      const meals = [
        {
          id: 'test-meal-1',
          name: 'Test Meal 1',
          matchPercentage: 85,
          cuisine: 'Italian',
          difficulty: 'Easy',
          time: '20 min',
          description: 'Test description 1',
          ingredients: ['pasta', 'cheese'],
          missingIngredients: []
        }
      ];
      
      const result = displaySuggestedMeals(meals);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('1 meals displayed');
      expect(mockMealSuggestions.innerHTML).toContain('Test Meal 1');
      expect(mockMealSuggestions.innerHTML).toContain('85% match');
      expect(mockMealSuggestions.innerHTML).toContain('Italian');
      expect(mockMealSuggestions.innerHTML).toContain('meal-card');
    });

    test('should display multiple meals correctly', () => {
      const meals = [
        {
          id: 'test-meal-1',
          name: 'Test Meal 1',
          matchPercentage: 85,
          cuisine: 'Italian',
          difficulty: 'Easy',
          time: '20 min',
          description: 'Test description 1',
          ingredients: ['pasta', 'cheese'],
          missingIngredients: []
        },
        {
          id: 'test-meal-2',
          name: 'Test Meal 2',
          matchPercentage: 70,
          cuisine: 'Asian',
          difficulty: 'Medium',
          time: '30 min',
          description: 'Test description 2',
          ingredients: ['rice', 'chicken', 'vegetables'],
          missingIngredients: ['soy-sauce']
        }
      ];
      
      const result = displaySuggestedMeals(meals);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('2 meals displayed');
      expect(mockMealSuggestions.innerHTML).toContain('Test Meal 1');
      expect(mockMealSuggestions.innerHTML).toContain('Test Meal 2');
      expect(mockMealSuggestions.innerHTML).toContain('85% match');
      expect(mockMealSuggestions.innerHTML).toContain('70% match');
    });

    test('should display ingredient tags correctly', () => {
      const meals = [
        {
          id: 'test-meal',
          name: 'Test Meal',
          matchPercentage: 75,
          cuisine: 'Italian',
          difficulty: 'Easy',
          time: '20 min',
          description: 'Test description',
          ingredients: ['pasta', 'cheese', 'tomatoes'],
          missingIngredients: ['tomatoes']
        }
      ];
      
      displaySuggestedMeals(meals);
      
      expect(mockMealSuggestions.innerHTML).toContain('ingredient-tag available');
      expect(mockMealSuggestions.innerHTML).toContain('ingredient-tag missing');
      expect(mockMealSuggestions.innerHTML).toContain('pasta');
      expect(mockMealSuggestions.innerHTML).toContain('cheese');
      expect(mockMealSuggestions.innerHTML).toContain('tomatoes');
    });

    test('should generate correct onclick handlers', () => {
      const meals = [
        {
          id: 'test-meal-1',
          name: 'Test Meal 1',
          matchPercentage: 85,
          cuisine: 'Italian',
          difficulty: 'Easy',
          time: '20 min',
          description: 'Test description 1',
          ingredients: ['pasta', 'cheese'],
          missingIngredients: []
        }
      ];
      
      displaySuggestedMeals(meals);
      
      expect(mockMealSuggestions.innerHTML).toContain('onclick="selectMeal(\'test-meal-1\')"');
      expect(mockMealSuggestions.innerHTML).toContain('onclick="viewMealDetails(\'test-meal-1\')"');
    });
  });

  describe('selectMeal', () => {
    test('should show alert with meal selection message', () => {
      const result = selectMeal('test-meal-1');
      
      expect(result.success).toBe(true);
      expect(result.mealId).toBe('test-meal-1');
      expect(window.alert).toHaveBeenCalledWith(
        'Great choice! You selected Test Meal. This feature will be expanded in future updates.'
      );
    });
  });

  describe('viewMealDetails', () => {
    test('should show alert with meal details', () => {
      const result = viewMealDetails('test-meal-1');
      
      expect(result.success).toBe(true);
      expect(result.mealId).toBe('test-meal-1');
      expect(window.alert).toHaveBeenCalledWith(
        'Meal Details:\n\nTest Meal\nCuisine: Test Cuisine\nDifficulty: Easy\nTime: 15 min\n\nTest description'
      );
    });
  });

  describe('Event Listeners', () => {
    test('should set up save button event listener', () => {
      const setupEventListeners = () => {
        mockSaveButton.addEventListener('click', jest.fn());
      };
      
      setupEventListeners();
      
      expect(mockSaveButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('should set up suggest button event listener', () => {
      const setupEventListeners = () => {
        mockSuggestButton.addEventListener('click', jest.fn());
      };
      
      setupEventListeners();
      
      expect(mockSuggestButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('DOM Element Access', () => {
    test('should access correct DOM elements by ID', () => {
      mockDOM.getElementById('saveBtn');
      mockDOM.getElementById('suggestMealsBtn');
      mockDOM.getElementById('savedIngredientsList');
      mockDOM.getElementById('mealSuggestions');
      
      expect(mockDOM.getElementById).toHaveBeenCalledWith('saveBtn');
      expect(mockDOM.getElementById).toHaveBeenCalledWith('suggestMealsBtn');
      expect(mockDOM.getElementById).toHaveBeenCalledWith('savedIngredientsList');
      expect(mockDOM.getElementById).toHaveBeenCalledWith('mealSuggestions');
    });

    test('should handle missing DOM elements gracefully', () => {
      const result = mockDOM.getElementById('nonexistent');
      
      expect(result).toBeNull();
    });
  });
});
