#!/bin/bash

# Linear CLI Commands to Create Tasks
# Make sure you have Linear CLI installed and authenticated

# Bug Fixes
linear create "🐛 Fix Save Ingredients Button Not Working" --description "The save ingredients button was not functioning due to DOM elements being accessed before DOM was fully loaded. Fixed by moving element initialization inside DOMContentLoaded event listener and changing const to let declarations." --priority "High" --labels "bug,frontend,dom-manipulation" --status "completed"

linear create "🐛 Fix JavaScript Syntax Error: Unexpected token ':'" --description "Resolved critical syntax error caused by orphaned recipe definitions outside the RECIPE_DATABASE object. Removed duplicate code blocks between lines 5365-7342 that were causing parsing failures." --priority "High" --labels "bug,javascript,syntax-error" --status "completed"

# Features
linear create "🔧 Implement Hybrid Meal Suggestion System" --description "Created a robust meal suggestion system that prioritizes external API (TheMealDB) for recipe data and falls back to local database when API is unavailable. Includes proper error handling and user feedback." --priority "High" --labels "feature,api-integration,architecture" --status "completed"

linear create "📝 Add Comprehensive User Feedback Messages" --description "Implemented detailed user feedback system including loading messages, error handling, no-ingredients warnings, and data source indicators to improve user experience." --priority "Medium" --labels "feature,ux,user-feedback" --status "completed"

# Refactoring
linear create "🔄 Update Protein Naming: Shrimp → Shrimps" --description "Systematically updated all instances of 'shrimp' to 'shrimps' across the application including UI elements, recipe database, and internal logic for consistency." --priority "Medium" --labels "refactor,naming,consistency" --status "completed"

# Deployment
linear create "🚀 Deploy to GitHub Pages" --description "Successfully deployed the DinnerHelperApp to GitHub Pages, making it publicly accessible at the provided URL with proper configuration and documentation." --priority "High" --labels "deployment,github-pages,infrastructure" --status "completed"

# Testing
linear create "🧪 Add Comprehensive Test Suite" --description "Implemented extensive testing framework with Jest including unit tests, integration tests, and real recipe database validation to ensure code quality and reliability." --priority "Medium" --labels "testing,quality-assurance,jest" --status "completed"

# Documentation
linear create "📚 Create API Integration Documentation" --description "Developed comprehensive documentation for external API integration including setup instructions, troubleshooting guides, and API response format specifications." --priority "Low" --labels "documentation,api,setup-guide" --status "completed"

# Quality Assurance
linear create "🔍 Implement Recipe Database Validation" --description "Added validation system to ensure recipe data integrity including image validation, ingredient matching, and recipe name consistency checks." --priority "Medium" --labels "validation,data-integrity,quality" --status "completed"

# UI/UX
linear create "🎨 Enhance UI/UX with Modern Styling" --description "Improved user interface with modern CSS styling, responsive design, loading animations, and better visual feedback for all user interactions." --priority "Medium" --labels "ui,ux,styling,responsive" --status "completed"

echo "All tasks created successfully!"
