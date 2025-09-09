// Dinner Helper App JavaScript

// DOM elements
const saveButton = document.getElementById('saveBtn');
const savedIngredientsList = document.getElementById('savedIngredientsList');
const checkboxes = document.querySelectorAll('input[type="checkbox"]');

// Storage key for localStorage
const STORAGE_KEY = 'dinnerHelperIngredients';

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSavedIngredients();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    saveButton.addEventListener('click', saveIngredients);
}

// Load saved ingredients from localStorage and update UI
function loadSavedIngredients() {
    try {
        const savedIngredients = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // Check the corresponding checkboxes
        checkboxes.forEach(checkbox => {
            const ingredient = checkbox.getAttribute('data-ingredient');
            if (savedIngredients.includes(ingredient)) {
                checkbox.checked = true;
            }
        });
        
        // Display saved ingredients
        displaySavedIngredients(savedIngredients);
    } catch (error) {
        console.error('Error loading saved ingredients:', error);
        displaySavedIngredients([]);
    }
}

// Save ingredients to localStorage and update display
function saveIngredients() {
    const checkedIngredients = [];
    
    // Collect all checked ingredients
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const ingredient = checkbox.getAttribute('data-ingredient');
            checkedIngredients.push(ingredient);
        }
    });
    
    try {
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIngredients));
        
        // Update display
        displaySavedIngredients(checkedIngredients);
        
        // Show success feedback
        showSuccessMessage();
    } catch (error) {
        console.error('Error saving ingredients:', error);
        showErrorMessage();
    }
}

// Display saved ingredients in the list section
function displaySavedIngredients(ingredients) {
    const listContainer = savedIngredientsList;
    
    if (ingredients.length === 0) {
        listContainer.innerHTML = '<p class="no-ingredients">No ingredients saved yet. Check some boxes and click "Save My Ingredients"!</p>';
        return;
    }
    
    // Create ingredient items
    const ingredientItems = ingredients.map(ingredient => {
        const capitalizedIngredient = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
        return `<span class="ingredient-item">${capitalizedIngredient}</span>`;
    }).join('');
    
    listContainer.innerHTML = ingredientItems;
}

// Show success message when ingredients are saved
function showSuccessMessage() {
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saved! ✓';
    saveButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    
    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    }, 2000);
}

// Show error message if saving fails
function showErrorMessage() {
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Error! Try again';
    saveButton.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
    
    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    }, 3000);
}

// Utility function to get all available ingredients (for future use)
function getAllIngredients() {
    return Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-ingredient'));
}

// Utility function to clear all saved ingredients (for debugging/testing)
function clearSavedIngredients() {
    localStorage.removeItem(STORAGE_KEY);
    checkboxes.forEach(checkbox => checkbox.checked = false);
    displaySavedIngredients([]);
}

// Make utility functions available globally for debugging
window.clearSavedIngredients = clearSavedIngredients;
window.getAllIngredients = getAllIngredients;
