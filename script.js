// Dinner Helper App JavaScript

// DOM elements - will be initialized after DOM loads
let saveButton;
let savedIngredientsList;
let suggestMealsButton;

// Storage key for localStorage
const STORAGE_KEY = 'dinnerHelperIngredients';

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements after DOM is loaded
    saveButton = document.getElementById('saveBtn');
    savedIngredientsList = document.getElementById('savedIngredientsList');
    suggestMealsButton = document.getElementById('suggestMealsBtn');
    
    loadSavedIngredients();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    console.log('Save button found:', saveButton);
    console.log('Suggest button found:', suggestMealsButton);
    
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save button clicked!');
            saveIngredients();
        });
        console.log('Save button event listener added');
    } else {
        console.error('Save button not found!');
    }
    
    if (suggestMealsButton) {
        suggestMealsButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Suggest meals button clicked!');
            suggestMeals();
        });
        console.log('Suggest button event listener added');
    } else {
        console.error('Suggest button not found!');
    }
}

// Load saved ingredients from localStorage and update UI
function loadSavedIngredients() {
    try {
        const savedIngredients = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // Check the corresponding checkboxes (get fresh checkbox list each time)
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(checkbox => {
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
    console.log('Save ingredients function called!');
    const checkedIngredients = [];
    
    // Collect all checked ingredients (get fresh checkbox list each time)
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log('Found checkboxes:', allCheckboxes.length);
    
    allCheckboxes.forEach(checkbox => {
        console.log('Checkbox:', checkbox.id, 'Checked:', checkbox.checked, 'Data-ingredient:', checkbox.getAttribute('data-ingredient'));
        if (checkbox.checked) {
            const ingredient = checkbox.getAttribute('data-ingredient');
            checkedIngredients.push(ingredient);
        }
    });
    
    console.log('Checked ingredients found:', checkedIngredients);
    
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
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    return Array.from(allCheckboxes).map(checkbox => checkbox.getAttribute('data-ingredient'));
}

// Utility function to clear all saved ingredients (for debugging/testing)
function clearSavedIngredients() {
    localStorage.removeItem(STORAGE_KEY);
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => checkbox.checked = false);
    displaySavedIngredients([]);
}

// Meal API Configuration (TheMealDB)
const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// UI pagination defaults for meal suggestions
const INITIAL_DISPLAY_COUNT = 3;
let allSuggestedMeals = [];
let currentlyDisplayedCount = 0;
let usedMealImages = new Set();

async function fetchMealDbByIngredient(ingredient) {
    const formattedIngredient = ingredient.replace(/-/g, ' ');
    const url = `${THEMEALDB_BASE_URL}/filter.php?i=${encodeURIComponent(formattedIngredient)}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`TheMealDB ingredient request failed: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data?.meals) ? data.meals : [];
}

async function fetchMealDbDetails(mealId) {
    const url = `${THEMEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(mealId)}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`TheMealDB details request failed: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data?.meals) || data.meals.length === 0) {
        return null;
    }

    return data.meals[0];
}

function convertMealDbRecipe(meal) {
    if (!meal) {
        return null;
    }

    const normalizeName = (value) => {
        if (!value) return '';
        return value.toString().toLowerCase().trim().replace(/\s+/g, '-');
    };

    const ingredients = [];
    for (let i = 1; i <= 20; i += 1) {
        const name = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (name && name.trim()) {
            ingredients.push({
                name: normalizeName(name),
                quantity: measure ? measure.trim() : '',
                displayName: name.trim()
            });
        }
    }

    const instructions = (() => {
        if (meal.strInstructions) {
            return meal.strInstructions
                .split(/\r?\n+/)
                .map(line => line.trim())
                .filter(Boolean);
        }
        return [];
    })();

    const description = meal.strCategory || meal.strTags || instructions[0] || 'Tasty recipe from TheMealDB.';

    return {
        id: meal.idMeal ? meal.idMeal.toString() : '',
        name: meal.strMeal || 'Delicious Recipe',
        cuisine: meal.strArea || 'Unknown',
        difficulty: 'Medium',
        time: 'Unknown',
        description,
        ingredients,
        missingIngredients: [],
        instructions,
        image: meal.strMealThumb || '',
        sourceUrl: meal.strSource || meal.strYoutube || null
    };
}

const MAIN_INGREDIENT_CATEGORIES = {
    proteins: ['chicken', 'beef', 'pork', 'fish', 'shrimps', 'salmon', 'bacon', 'tofu', 'beans', 'veal', 'paneer'],
    carbs: ['rice', 'pasta', 'bread', 'noodles', 'tortillas', 'flour', 'quinoa', 'oats', 'barley', 'couscous', 'wonton-wrappers', 'hominy', 'lentils'],
    vegetables: ['potatoes', 'tomatoes', 'onions', 'garlic', 'carrots', 'bell-peppers', 'mushrooms', 'spinach', 'broccoli', 'lettuce', 'avocado', 'vegetables', 'eggplant', 'beets', 'cabbage']
};

const PRIMARY_MAIN_INGREDIENTS = [
    ...MAIN_INGREDIENT_CATEGORIES.proteins,
    ...MAIN_INGREDIENT_CATEGORIES.carbs
];

// Recipe Database - 210+ recipes across 14+ cuisines
// This will be replaced with API calls
const RECIPE_DATABASE = {};

async function fetchMealDbSuggestions(availableIngredients) {
    const matchingContext = createIngredientMatchingContext(availableIngredients);
    const { activeMainSet, normalizedAvailable } = matchingContext;

    const fetchTargets = activeMainSet.size > 0
        ? Array.from(activeMainSet)
        : normalizedAvailable.slice(0, 5);

    const uniqueTargets = Array.from(new Set(fetchTargets)).filter(Boolean);
    if (uniqueTargets.length === 0) {
        return [];
    }

    const mealSummaries = new Map();

    for (const target of uniqueTargets) {
        try {
            const meals = await fetchMealDbByIngredient(target);
            meals.forEach(meal => {
                if (meal?.idMeal && !mealSummaries.has(meal.idMeal)) {
                    mealSummaries.set(meal.idMeal, meal);
                }
            });
        } catch (error) {
            console.warn(`Failed to fetch meals for ${target}:`, error);
        }
    }

    const mealIds = Array.from(mealSummaries.keys()).slice(0, 40);
    if (mealIds.length === 0) {
        return [];
    }

    const detailedMeals = await Promise.all(mealIds.map(async (mealId) => {
        try {
            const mealDetails = await fetchMealDbDetails(mealId);
            return convertMealDbRecipe(mealDetails);
        } catch (error) {
            console.warn(`Failed to fetch details for meal ${mealId}:`, error);
            return null;
        }
    }));

    return detailedMeals.filter(Boolean);
}

function createIngredientMatchingContext(availableIngredients) {
    const normalizedAvailable = availableIngredients.map(ingredient => ingredient.toLowerCase());
    const availableIngredientSet = new Set(normalizedAvailable);

    const mainIngredientSet = new Set(PRIMARY_MAIN_INGREDIENTS);
    const mainIngredientAliasMap = new Map();

    PRIMARY_MAIN_INGREDIENTS.forEach(mainIngredient => {
        const variations = getIngredientVariations(mainIngredient);
        variations.forEach(variation => {
            if (!mainIngredientSet.has(variation) && !mainIngredientAliasMap.has(variation)) {
                mainIngredientAliasMap.set(variation, mainIngredient);
            }
        });
    });

    const resolveToMainIngredient = (ingredient) => {
        const normalized = ingredient.toLowerCase();
        if (mainIngredientSet.has(normalized)) {
            return normalized;
        }
        return mainIngredientAliasMap.get(normalized) || null;
    };

    const hasIngredient = (ingredientName) => {
        const normalized = ingredientName.toLowerCase();
        if (availableIngredientSet.has(normalized)) {
            return true;
        }
        const variations = getIngredientVariations(normalized);
        return variations.some(variation => availableIngredientSet.has(variation));
    };

    const userProteinCanonicalSet = new Set();
    const userCarbCanonicalSet = new Set();

    normalizedAvailable.forEach(ingredient => {
        const canonical = resolveToMainIngredient(ingredient);
        if (!canonical) {
            return;
        }
        if (MAIN_INGREDIENT_CATEGORIES.proteins.includes(canonical)) {
            userProteinCanonicalSet.add(canonical);
        } else if (MAIN_INGREDIENT_CATEGORIES.carbs.includes(canonical)) {
            userCarbCanonicalSet.add(canonical);
        }
    });

    const activeMainSet = userProteinCanonicalSet.size > 0
        ? userProteinCanonicalSet
        : userCarbCanonicalSet;

    return {
        normalizedAvailable,
        availableIngredientSet,
        resolveToMainIngredient,
        hasIngredient,
        userProteinCanonicalSet,
        userCarbCanonicalSet,
        activeMainSet,
        activeMainSize: activeMainSet.size
    };
}

// Meal suggestion functionality
async function suggestMeals() {
    const savedIngredients = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    if (savedIngredients.length === 0) {
        showNoIngredientsMessage();
        return;
    }
    
    // Show loading message
    const suggestionsContainer = document.getElementById('mealSuggestions');
    suggestionsContainer.innerHTML = `
        <div class="loading-message">
            <h3>Finding recipes for you...</h3>
            <p>Searching through thousands of recipes with matching images!</p>
        </div>
    `;
    
    try {
        const mealDbRecipes = await fetchMealDbSuggestions(savedIngredients);
        const suggestedMeals = findMatchingMeals(savedIngredients, mealDbRecipes);

        if (suggestedMeals.length === 0) {
            displaySuggestedMeals([]);
            return;
        }

        displaySuggestedMeals(suggestedMeals);
    } catch (error) {
        console.error('Error fetching recipes from API:', error);
        displaySuggestedMeals([]);
        showErrorMessage('Unable to fetch recipes right now. Please try again later.');
    }
}

// Helper function to handle ingredient name variations for dominant matching
function getIngredientVariations(ingredient) {
    const variations = [ingredient.toLowerCase()];
    
    // Add common variations
    const variationMap = {
        'beef': ['beef', 'steak'],
        'chicken': ['chicken', 'poultry'],
        'fish': ['fish', 'salmon', 'tuna', 'cod'],
        'salmon': ['salmon', 'fish'],
        'shrimps': ['shrimps', 'prawns'],
        'pasta': ['pasta', 'spaghetti', 'penne', 'linguine', 'fettuccine'],
        'rice': ['rice', 'risotto', 'pilaf'],
        'potatoes': ['potato', 'potatoes'],
        'tomatoes': ['tomato', 'tomatoes'],
        'mushrooms': ['mushroom', 'mushrooms'],
        'onions': ['onion', 'onions'],
        'bell-peppers': ['pepper', 'peppers'],
        'noodles': ['noodle', 'noodles', 'ramen', 'udon'],
        'bread': ['bread', 'toast', 'sandwich'],
        'eggs': ['egg', 'eggs', 'omelette', 'frittata'],
        'beans': ['bean', 'beans', 'legumes', 'chickpeas'],
        'chickpeas': ['chickpea', 'chickpeas', 'garbanzo', 'garbanzo-beans', 'beans', 'legumes'],
        'lentils': ['lentil', 'lentils', 'dal']
    };
    
    if (variationMap[ingredient]) {
        return variationMap[ingredient];
    }
    
    return variations;
}

function findMatchingMeals(availableIngredients, recipes = []) {
    const suggestions = [];
    const matchingContext = createIngredientMatchingContext(availableIngredients);
    const {
        resolveToMainIngredient,
        hasIngredient,
        activeMainSet,
        activeMainSize,
        normalizedAvailable
    } = matchingContext;

    const userMainIngredientsAll = normalizedAvailable.filter(ingredient => resolveToMainIngredient(ingredient));

    const recipeEntries = (Array.isArray(recipes) && recipes.length > 0)
        ? recipes.map(recipe => [recipe.id ? recipe.id.toString() : recipe.name, recipe])
        : Object.entries(RECIPE_DATABASE);

    recipeEntries.forEach(([recipeId, recipe]) => {
        if (!recipe) {
            return;
        }

        // Extract ingredient names from the new object structure
        const recipeIngredientNames = recipe.ingredients.map(ingredient => {
            if (typeof ingredient === 'object' && ingredient.name) {
                return ingredient.name;
            }
            return ingredient; // fallback for old string format
        });
        
        const recipeMainComponents = recipeIngredientNames
            .map(name => ({ original: name, canonical: resolveToMainIngredient(name) }))
            .filter(component => component.canonical);

        if (recipeMainComponents.length === 0 && activeMainSize > 0) {
            return; // Skip recipes without required main ingredients when mains are selected
        }

        const recipeActiveComponents = recipeMainComponents.filter(component => activeMainSet.has(component.canonical));
        const recipeActiveCoverageSet = new Set();

        recipeActiveComponents.forEach(component => {
            if (hasIngredient(component.original)) {
                recipeActiveCoverageSet.add(component.canonical);
            }
        });

        if (activeMainSize > 0) {
            if (recipeActiveComponents.length === 0) {
                return; // Recipe doesn't include the selected primary mains
            }

            if (recipeActiveCoverageSet.size === 0) {
                return; // Recipe includes selected mains but user is missing them
            }
        }

        const hasAnyUserMain = recipeMainComponents.some(component => hasIngredient(component.original));
        if (!hasAnyUserMain) {
            return; // Skip recipes where user has none of the mains
        }

        const mainCoverageCount = activeMainSize > 0
            ? recipeActiveCoverageSet.size
            : 0;
        const coversAllUserMains = activeMainSize > 0 && mainCoverageCount === activeMainSize;

        // DOMINANT INGREDIENT PRIORITY SYSTEM
        // Check if recipe name or ID contains ANY of the user's main ingredients
        
        const isDominantMatch = userMainIngredientsAll.some(ingredient => {
            const recipeName = (recipe.name || '').toLowerCase();
            const recipeKey = recipeId.toLowerCase();
            const ingredientName = ingredient.toLowerCase();
            
            // Direct name matching
            if (recipeName.includes(ingredientName) || recipeKey.includes(ingredientName)) {
                return true;
            }
            
            // Handle special cases and variations
            const ingredientVariations = getIngredientVariations(ingredient);
            return ingredientVariations.some(variation => 
                recipeName.includes(variation) || recipeKey.includes(variation)
            );
        });
        
        // Find the primary ingredient (first ingredient that's a protein, carb, or vegetable)
        const recipePrimaryIngredientEntry = recipeMainComponents.find(() => true);
        const recipePrimaryIngredient = recipePrimaryIngredientEntry ? recipePrimaryIngredientEntry.original : null;
        
        // Calculate overall ingredient matching
        const matchingIngredients = recipeIngredientNames.filter(ingredientName => hasIngredient(ingredientName));
        
        let matchPercentage = (matchingIngredients.length / recipeIngredientNames.length) * 100;
        
        // BOOST score for dominant ingredient matches
        if (isDominantMatch) {
            matchPercentage += 15; // Give 15% bonus for dominant ingredient match
        }
        
        const meetsIngredientThreshold = matchPercentage >= 50
            || (activeMainSize > 0 && mainCoverageCount > 0);

        if (meetsIngredientThreshold) {
            const uniqueRecipeMainIngredients = Array.from(new Set(recipeMainComponents.map(component => component.original)));
            suggestions.push({
                id: recipeId,
                ...recipe,
                matchPercentage: Math.round(Math.min(matchPercentage, 100)), // Cap at 100%
                isDominantMatch: isDominantMatch,
                primaryIngredient: recipePrimaryIngredient,
                mainIngredientsAvailable: uniqueRecipeMainIngredients.filter(ingredient => hasIngredient(ingredient)),
                missingIngredients: recipeIngredientNames.filter(ingredientName => !hasIngredient(ingredientName)),
                coversAllUserMains,
                mainCoverageCount
            });
        }
    });
    
    // Sort by dominant match first, then by match percentage
    return suggestions.sort((a, b) => {
        if (activeMainSize > 0) {
            if (a.coversAllUserMains && !b.coversAllUserMains) return -1;
            if (!a.coversAllUserMains && b.coversAllUserMains) return 1;

            if (b.mainCoverageCount !== a.mainCoverageCount) {
                return b.mainCoverageCount - a.mainCoverageCount;
            }
        }
        // First priority: dominant ingredient matches
        if (a.isDominantMatch && !b.isDominantMatch) return -1;
        if (!a.isDominantMatch && b.isDominantMatch) return 1;
        
        // Second priority: match percentage (highest first)
        return b.matchPercentage - a.matchPercentage;
    });
}

function displaySuggestedMeals(meals) {
    const suggestionsContainer = document.getElementById('mealSuggestions');
    
    if (meals.length === 0) {
        suggestionsContainer.innerHTML = `
            <div class="no-suggestions">
                <h3>No meal suggestions available</h3>
                <p>Start with at least one <strong>protein</strong>. If you don’t have any proteins checked, we’ll look for checked <strong>carbs</strong> and match recipes around those.</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li><strong>Proteins:</strong> Chicken, Beef, Fish, Salmon, Beans, Tofu, etc.</li>
                    <li><strong>Carbs:</strong> Rice, Pasta, Bread, Noodles, Tortillas, Quinoa, etc.</li>
                </ul>
                <p>Once a main is covered, try to have roughly half of a recipe’s remaining ingredients available so it clears the 50% match threshold.</p>
            </div>
        `;
        return;
    }
    
    // Store all meals for pagination
    allSuggestedMeals = meals;
    currentlyDisplayedCount = 0;
    usedMealImages = new Set();
    
    // Display initial set of meals
    displayMealBatch(INITIAL_DISPLAY_COUNT);
}

function displayMealBatch(count) {
    const suggestionsContainer = document.getElementById('mealSuggestions');
    const mealsToShow = allSuggestedMeals.slice(0, currentlyDisplayedCount + count);
    currentlyDisplayedCount = mealsToShow.length;
    
    const mealsHTML = mealsToShow.map(meal => `
        <div class="meal-card" data-meal-id="${meal.id}">
            <div class="meal-content">
                <div class="meal-header">
                    <div class="meal-name-container">
                        ${(() => {
                            const imageUrl = meal.image;
                            if (!imageUrl || usedMealImages.has(imageUrl)) {
                                return '';
                            }
                            usedMealImages.add(imageUrl);
                            return `<img src="${imageUrl}" alt="${meal.name}" class="meal-image" onerror="this.style.display='none'>`;
                        })()}
                        <h3 class="meal-name">${meal.name}</h3>
                    </div>
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
                                // Handle both object and string ingredient formats
                                const ingredientName = typeof ingredient === 'object' && ingredient.name ? ingredient.name : ingredient;
                                const isAvailable = !meal.missingIngredients.includes(ingredientName);
                                return `<span class="ingredient-tag ${isAvailable ? 'available' : 'missing'}">${ingredientName.replace(/-/g, ' ')}</span>`;
                            }).join('')}
                        </div>
                    </div>
                    ${meal.missingIngredients.length > 0 ? `
                        <div class="missing-ingredients">
                            <h4>Missing ingredients:</h4>
                            <p>${meal.missingIngredients.map(ing => ing.replace('-', ' ')).join(', ')}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="meal-actions">
                    <button class="select-meal-btn" onclick="selectMeal('${meal.id}')">Find Similar Recipes</button>
                    <button class="view-details-btn" onclick="viewMealDetails('${meal.id}')">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add "Show More" button if there are more recipes to show
    const showMoreButton = currentlyDisplayedCount < allSuggestedMeals.length ? `
        <div class="show-more-container">
            <button class="show-more-btn" onclick="showMoreRecipes()">
                Show More Recipes (${allSuggestedMeals.length - currentlyDisplayedCount} remaining)
            </button>
        </div>
    ` : '';
    
    suggestionsContainer.innerHTML = `
        <div class="suggestions-header">
            <h3>Top ${currentlyDisplayedCount} Recipe${currentlyDisplayedCount > 1 ? 's' : ''} for You</h3>
            <p>Showing ${currentlyDisplayedCount} of ${allSuggestedMeals.length} matching recipes</p>
        </div>
        ${mealsHTML}
        ${showMoreButton}
    `;
}

function escapeHtml(text) {
    if (text === undefined || text === null) {
        return '';
    }
    return text
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatIngredientDisplay(ingredient) {
    if (!ingredient) {
        return '';
    }

    if (typeof ingredient === 'string') {
        return ingredient.replace(/-/g, ' ');
    }

    const name = (ingredient.displayName || ingredient.name || '')
        .toString()
        .replace(/-/g, ' ')
        .trim();
    const quantity = (ingredient.quantity || ingredient.original || '')
        .toString()
        .trim();

    if (name && quantity) {
        return `${name} – ${quantity}`;
    }

    return name || quantity;
}

function normalizeInstructions(instructions) {
    if (!instructions) {
        return [];
    }

    if (Array.isArray(instructions)) {
        return instructions.filter(Boolean);
    }

    if (typeof instructions === 'string') {
        return instructions.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    }

    return [];
}

function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
        return CSS.escape(value);
    }
    return value.replace(/([\0-\x1F\x7F\s!"#$%&'()*+,./:;<=>?@[\]`{|}~])/g, '\\$1');
}

function findMealCandidate(mealId) {
    const idString = mealId != null ? mealId.toString() : '';

    if (Array.isArray(allSuggestedMeals) && allSuggestedMeals.length > 0) {
        const matchedMeal = allSuggestedMeals.find(meal => (meal.id != null && meal.id.toString() === idString));
        if (matchedMeal) {
            return { ...matchedMeal, id: idString };
        }
    }

    return null;
}

async function hydrateMealWithDetails(meal, forceDetails = false) {
    if (!meal || !meal.id) {
        return meal;
    }

    const isNumericId = /^\d+$/.test(meal.id);
    if (!isNumericId) {
        return meal;
    }

    const needsDetails = forceDetails
        || !meal.sourceUrl
        || !meal.image
        || !Array.isArray(meal.ingredients) || meal.ingredients.length === 0
        || normalizeInstructions(meal.instructions).length === 0;

    if (!needsDetails) {
        return meal;
    }

    try {
        const detailedRecipe = await fetchMealDbDetails(meal.id);
        if (detailedRecipe) {
            const converted = convertMealDbRecipe(detailedRecipe);
            if (converted) {
                return { ...meal, ...converted, id: meal.id.toString() };
            }
        }
    } catch (error) {
        console.error('Error hydrating recipe details:', error);
    }

    return meal;
}

function buildRecipeDocument(meal) {
    const title = escapeHtml(meal.name || 'Delicious Recipe');
    const description = escapeHtml(meal.description || 'A tasty dish prepared with love.');
    const cuisine = escapeHtml(meal.cuisine || 'Unknown');
    const difficulty = escapeHtml(meal.difficulty || 'Unknown');
    const time = escapeHtml(meal.time || 'Unknown');
    const imageSection = meal.image ? `<img src="${escapeHtml(meal.image)}" alt="${title}" class="recipe-image">` : '';

    const ingredientItems = (meal.ingredients || []).map(ingredient => {
        const formatted = escapeHtml(formatIngredientDisplay(ingredient));
        return formatted ? `<li>${formatted}</li>` : '';
    }).filter(Boolean).join('');

    const instructions = normalizeInstructions(meal.instructions || meal.steps);
    const instructionItems = instructions.length > 0
        ? instructions.map((step, index) => `<li><span class="step-number">Step ${index + 1}:</span> ${escapeHtml(step)}</li>`).join('')
        : '<li>No instructions available for this recipe.</li>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} – Dinner Helper</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f7fafc;
            color: #2d3748;
            margin: 0;
            padding: 0;
        }
        .recipe-container {
            max-width: 760px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 45px rgba(64, 72, 82, 0.15);
            overflow: hidden;
        }
        .recipe-header {
            padding: 32px 32px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
        }
        .recipe-header h1 {
            margin: 0 0 12px;
            font-size: 32px;
            line-height: 1.2;
        }
        .recipe-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            font-size: 14px;
            opacity: 0.9;
        }
        .recipe-meta span {
            background: rgba(255, 255, 255, 0.15);
            padding: 6px 12px;
            border-radius: 999px;
        }
        .recipe-body {
            padding: 32px;
        }
        .recipe-image {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 12px;
            margin-bottom: 24px;
        }
        .recipe-section {
            margin-bottom: 32px;
        }
        .recipe-section h2 {
            margin: 0 0 16px;
            font-size: 22px;
            color: #2c5282;
        }
        .recipe-section ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .recipe-section li {
            background: #edf2f7;
            padding: 14px 16px;
            border-radius: 12px;
            margin-bottom: 12px;
            line-height: 1.5;
        }
        .recipe-section li:last-child {
            margin-bottom: 0;
        }
        .step-number {
            display: inline-block;
            font-weight: 600;
            margin-right: 8px;
            color: #2c5282;
        }
        .recipe-description {
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 24px;
        }
        @media (max-width: 600px) {
            .recipe-container {
                margin: 0;
                border-radius: 0;
            }
            .recipe-body {
                padding: 24px;
            }
            .recipe-header {
                padding: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="recipe-container">
        <div class="recipe-header">
            <h1>${title}</h1>
            <div class="recipe-meta">
                <span>⏱️ ${time}</span>
                <span>🥣 ${difficulty}</span>
                <span>🌎 ${cuisine}</span>
            </div>
        </div>
        <div class="recipe-body">
            ${imageSection}
            <p class="recipe-description">${description}</p>
            <div class="recipe-section">
                <h2>Ingredients</h2>
                <ul>
                    ${ingredientItems || '<li>No ingredient information available.</li>'}
                </ul>
            </div>
            <div class="recipe-section">
                <h2>Instructions</h2>
                <ul>
                    ${instructionItems}
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function openHtmlDocumentInNewTab(htmlString) {
    if (!htmlString) {
        return false;
    }

    const newWindow = window.open('', '_blank', 'noopener');

    if (newWindow && newWindow.document) {
        newWindow.document.open();
        newWindow.document.write(htmlString);
        newWindow.document.close();
        return true;
    }

    try {
        const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        anchor.style.display = 'none';

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
        return true;
    } catch (error) {
        console.error('Failed to open HTML document in new tab:', error);
    }

    return false;
}

function openUrlInNewTab(url) {
    if (!url) {
        return false;
    }

    const openedWindow = window.open(url, '_blank', 'noopener');
    if (openedWindow) {
        return true;
    }

    try {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        anchor.style.display = 'none';

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        return true;
    } catch (error) {
        console.error('Failed to open URL in new tab:', error);
    }

    return false;
}

function openRecipeInNewTab(meal, preferSourceUrl = false) {
    if (!meal) {
        return;
    }

    const externalUrl = preferSourceUrl && meal.sourceUrl ? meal.sourceUrl : null;
    if (externalUrl) {
        if (openUrlInNewTab(externalUrl)) {
            return;
        }
        window.location.assign(externalUrl);
        return;
    }

    const recipeDocument = buildRecipeDocument(meal);

    if (openHtmlDocumentInNewTab(recipeDocument)) {
        return;
    }

    const dataUrl = 'data:text/html;charset=UTF-8,' + encodeURIComponent(recipeDocument);
    window.location.assign(dataUrl);
}

async function viewMealDetails(mealId) {
    try {
        const mealIdString = mealId != null ? mealId.toString() : '';
        const mealCard = document.querySelector(`.meal-card[data-meal-id="${escapeSelector(mealIdString)}"]`);

        if (!mealCard) {
            window.alert('We could not locate that recipe card.');
            return;
        }

        const existingInstructions = mealCard.querySelector('.meal-instructions');
        if (existingInstructions && existingInstructions.getAttribute('data-meal-id') === mealIdString) {
            existingInstructions.remove();
            return;
        }

        if (existingInstructions) {
            existingInstructions.remove();
        }

        const instructionContainer = document.createElement('div');
        instructionContainer.className = 'meal-instructions';
        instructionContainer.setAttribute('data-meal-id', mealIdString);
        instructionContainer.innerHTML = '<p>Loading instructions...</p>';
        mealCard.appendChild(instructionContainer);

        const baseMeal = findMealCandidate(mealIdString);
        if (!baseMeal) {
            instructionContainer.remove();
            window.alert('Recipe details could not be found.');
            return;
        }

        const hydratedMeal = await hydrateMealWithDetails(baseMeal, true);
        const instructions = normalizeInstructions(hydratedMeal.instructions);

        const instructionItems = instructions.map((step, index) => {
            return `<li><span class="step-number">Step ${index + 1}:</span> ${escapeHtml(step)}</li>`;
        }).join('');

        const instructionsHTML = instructions.length > 0
            ? `<ol class="instructions-list">${instructionItems}</ol>`
            : '<p>No cooking instructions available for this recipe.</p>';

        const sourceLink = hydratedMeal.sourceUrl
            ? `<p class="instructions-source"><a href="${escapeHtml(hydratedMeal.sourceUrl)}" target="_blank" rel="noopener">View original recipe</a></p>`
            : '';

        instructionContainer.innerHTML = `
            <div class="instructions-content">
                <h4>Cooking Instructions</h4>
                ${instructionsHTML}
                ${sourceLink}
            </div>
        `;
    } catch (error) {
        console.error('Error opening meal details:', error);
        window.alert('Sorry, we could not load those instructions. Please try again later.');
    }
}

function buildRecipeSearchUrl(meal) {
    const mealName = meal?.name ? meal.name.toString().trim() : '';
    if (!mealName) {
        return null;
    }

    const cuisine = meal?.cuisine ? meal.cuisine.toString().trim() : '';
    const mains = Array.isArray(meal?.mainIngredientsAvailable) ? meal.mainIngredientsAvailable.join(' ') : '';
    const queryParts = [mealName, 'recipe'];

    if (cuisine) {
        queryParts.push(cuisine);
    }

    if (mains) {
        queryParts.push(mains);
    }

    const query = queryParts
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!query) {
        return null;
    }

    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function openRecipeSearchInNewTab(meal) {
    const searchUrl = buildRecipeSearchUrl(meal);

    if (searchUrl) {
        if (openUrlInNewTab(searchUrl)) {
            return;
        }
        window.location.assign(searchUrl);
    } else {
        window.alert('We could not determine a recipe name to search for.');
    }
}

async function selectMeal(mealId) {
    try {
        const baseMeal = findMealCandidate(mealId);
        if (!baseMeal) {
            window.alert('Recipe details could not be found.');
            return;
        }

        const hydratedMeal = await hydrateMealWithDetails(baseMeal, false);
        openRecipeSearchInNewTab(hydratedMeal || baseMeal);
    } catch (error) {
        console.error('Error selecting meal:', error);
        window.alert('Sorry, we could not open that recipe search.');
    }
}

// Function to show more recipes
function showMoreRecipes() {
    displayMealBatch(7); // Show 7 more recipes
}

// Make utility functions available globally for debugging
window.clearSavedIngredients = clearSavedIngredients;
window.getAllIngredients = getAllIngredients;
window.suggestMeals = suggestMeals;
window.selectMeal = selectMeal;
window.viewMealDetails = viewMealDetails;
