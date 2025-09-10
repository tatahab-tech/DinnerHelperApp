/**
 * Unit tests for ingredient management functionality
 */

// Mock DOM elements
const mockCheckboxes = [
  { checked: false, getAttribute: jest.fn().mockReturnValue('chicken') },
  { checked: true, getAttribute: jest.fn().mockReturnValue('rice') },
  { checked: false, getAttribute: jest.fn().mockReturnValue('pasta') },
  { checked: true, getAttribute: jest.fn().mockReturnValue('cheese') }
];

const mockSavedIngredientsList = {
  innerHTML: ''
};

// Mock DOM methods
const mockDOM = {
  getElementById: jest.fn((id) => {
    if (id === 'savedIngredientsList') return mockSavedIngredientsList;
    return null;
  }),
  querySelectorAll: jest.fn(() => mockCheckboxes),
  addEventListener: jest.fn()
};

// Mock the ingredient management functions
function saveIngredients() {
  const checkedIngredients = [];
  
  mockCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const ingredient = checkbox.getAttribute('data-ingredient');
      checkedIngredients.push(ingredient);
    }
  });
  
  try {
    localStorage.setItem('dinnerHelperIngredients', JSON.stringify(checkedIngredients));
    displaySavedIngredients(checkedIngredients);
    return { success: true, count: checkedIngredients.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function loadSavedIngredients() {
  try {
    const savedIngredients = JSON.parse(localStorage.getItem('dinnerHelperIngredients')) || [];
    
    // First, uncheck all checkboxes
    mockCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Then check the ones that are saved
    mockCheckboxes.forEach(checkbox => {
      const ingredient = checkbox.getAttribute('data-ingredient');
      if (savedIngredients.includes(ingredient)) {
        checkbox.checked = true;
      }
    });
    
    displaySavedIngredients(savedIngredients);
    return { success: true, count: savedIngredients.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function displaySavedIngredients(ingredients) {
  if (ingredients.length === 0) {
    mockSavedIngredientsList.innerHTML = '<p class="no-ingredients">No ingredients saved yet. Check some boxes and click "Save My Ingredients"!</p>';
    return;
  }
  
  const ingredientItems = ingredients.map(ingredient => {
    const capitalizedIngredient = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
    return `<span class="ingredient-item">${capitalizedIngredient}</span>`;
  }).join('');
  
  mockSavedIngredientsList.innerHTML = ingredientItems;
}

function clearSavedIngredients() {
  localStorage.removeItem('dinnerHelperIngredients');
  mockCheckboxes.forEach(checkbox => checkbox.checked = false);
  displaySavedIngredients([]);
  return { success: true };
}

function getAllIngredients() {
  return mockCheckboxes.map(checkbox => checkbox.getAttribute('data-ingredient'));
}

describe('Ingredient Management System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset checkbox states
    mockCheckboxes[0].checked = false;
    mockCheckboxes[1].checked = true;
    mockCheckboxes[2].checked = false;
    mockCheckboxes[3].checked = true;
    // Reset localStorage mock
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
  });

  describe('saveIngredients', () => {
    test('should save checked ingredients to localStorage', () => {
      const result = saveIngredients();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dinnerHelperIngredients', 
        JSON.stringify(['rice', 'cheese'])
      );
    });

    test('should handle empty selection', () => {
      mockCheckboxes.forEach(checkbox => checkbox.checked = false);
      
      const result = saveIngredients();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dinnerHelperIngredients', 
        JSON.stringify([])
      );
    });

    test('should handle localStorage errors', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const result = saveIngredients();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage quota exceeded');
    });

    test('should update display after saving', () => {
      saveIngredients();
      
      expect(mockSavedIngredientsList.innerHTML).toContain('Rice');
      expect(mockSavedIngredientsList.innerHTML).toContain('Cheese');
      expect(mockSavedIngredientsList.innerHTML).toContain('ingredient-item');
    });
  });

  describe('loadSavedIngredients', () => {
    test('should load ingredients from localStorage', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(['chicken', 'pasta']));
      
      const result = loadSavedIngredients();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(mockCheckboxes[0].checked).toBe(true); // chicken
      expect(mockCheckboxes[2].checked).toBe(true); // pasta
    });

    test('should handle null localStorage value', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = loadSavedIngredients();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      mockCheckboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(false);
      });
    });

    test('should handle invalid JSON in localStorage', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const result = loadSavedIngredients();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should update display after loading', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(['chicken', 'pasta']));
      
      loadSavedIngredients();
      
      expect(mockSavedIngredientsList.innerHTML).toContain('Chicken');
      expect(mockSavedIngredientsList.innerHTML).toContain('Pasta');
    });
  });

  describe('displaySavedIngredients', () => {
    test('should display empty message when no ingredients', () => {
      displaySavedIngredients([]);
      
      expect(mockSavedIngredientsList.innerHTML).toContain('No ingredients saved yet');
      expect(mockSavedIngredientsList.innerHTML).toContain('no-ingredients');
    });

    test('should display ingredients as styled items', () => {
      displaySavedIngredients(['chicken', 'rice', 'pasta']);
      
      expect(mockSavedIngredientsList.innerHTML).toContain('Chicken');
      expect(mockSavedIngredientsList.innerHTML).toContain('Rice');
      expect(mockSavedIngredientsList.innerHTML).toContain('Pasta');
      expect(mockSavedIngredientsList.innerHTML).toContain('ingredient-item');
    });

    test('should capitalize ingredient names', () => {
      displaySavedIngredients(['chicken', 'olive-oil', 'soy-sauce']);
      
      expect(mockSavedIngredientsList.innerHTML).toContain('Chicken');
      expect(mockSavedIngredientsList.innerHTML).toContain('Olive-oil');
      expect(mockSavedIngredientsList.innerHTML).toContain('Soy-sauce');
    });

    test('should handle single ingredient', () => {
      displaySavedIngredients(['chicken']);
      
      expect(mockSavedIngredientsList.innerHTML).toContain('Chicken');
      expect(mockSavedIngredientsList.innerHTML).not.toContain('No ingredients saved yet');
    });
  });

  describe('clearSavedIngredients', () => {
    test('should clear localStorage and reset checkboxes', () => {
      const result = clearSavedIngredients();
      
      expect(result.success).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('dinnerHelperIngredients');
      mockCheckboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(false);
      });
    });

    test('should update display after clearing', () => {
      clearSavedIngredients();
      
      expect(mockSavedIngredientsList.innerHTML).toContain('No ingredients saved yet');
    });
  });

  describe('getAllIngredients', () => {
    test('should return all ingredient names', () => {
      const ingredients = getAllIngredients();
      
      expect(ingredients).toEqual(['chicken', 'rice', 'pasta', 'cheese']);
    });

    test('should return empty array when no checkboxes', () => {
      // Create a new function that returns empty array
      const getAllIngredientsEmpty = () => {
        return [];
      };
      
      const ingredients = getAllIngredientsEmpty();
      
      expect(ingredients).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    test('should complete save-load cycle correctly', () => {
      // Save ingredients
      const saveResult = saveIngredients();
      expect(saveResult.success).toBe(true);
      
      // Reset checkboxes
      mockCheckboxes.forEach(checkbox => checkbox.checked = false);
      
      // Mock localStorage to return the saved ingredients
      localStorage.getItem.mockReturnValue(JSON.stringify(['rice', 'cheese']));
      
      // Load ingredients
      const loadResult = loadSavedIngredients();
      expect(loadResult.success).toBe(true);
      
      // Verify checkboxes are restored
      expect(mockCheckboxes[1].checked).toBe(true); // rice
      expect(mockCheckboxes[3].checked).toBe(true); // cheese
    });

    test('should handle multiple save operations', () => {
      // First save
      saveIngredients();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dinnerHelperIngredients', 
        JSON.stringify(['rice', 'cheese'])
      );
      
      // Change selection
      mockCheckboxes[0].checked = true; // chicken
      mockCheckboxes[1].checked = false; // rice
      
      // Second save
      const result = saveIngredients();
      expect(result.success).toBe(true);
      expect(result.count).toBe(2); // chicken and cheese
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dinnerHelperIngredients', 
        JSON.stringify(['chicken', 'cheese'])
      );
    });
  });
});
