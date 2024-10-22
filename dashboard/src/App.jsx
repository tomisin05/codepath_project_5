import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dietFilter, setDietFilter] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [calorieRange, setCalorieRange] = useState({ min: 0, max: 1000 });
  const [cookingTimeFilter, setCookingTimeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = 'cc9a03684e2c480d96ba351943a4d0c1';

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=100&addRecipeNutrition=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await response.json();
      setRecipes(data.results);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes
    .filter(recipe => recipe.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(recipe => !dietFilter || recipe.diets.includes(dietFilter))
    .filter(recipe => !cuisineFilter || recipe.cuisines.includes(cuisineFilter))
    .filter(recipe => {
      const calories = recipe.nutrition.nutrients.find(n => n.name === "Calories").amount;
      return calories >= calorieRange.min && calories <= calorieRange.max;
    })
    .filter(recipe => {
      if (!cookingTimeFilter) return true;
      const [min, max] = cookingTimeFilter.split('-').map(Number);
      return recipe.readyInMinutes >= min && recipe.readyInMinutes <= max;
    });

  const totalRecipes = filteredRecipes.length;
  const averageCalories = filteredRecipes.reduce((sum, recipe) => sum + recipe.nutrition.nutrients.find(n => n.name === "Calories").amount, 0) / totalRecipes || 0;
  const mostCommonDiet = getMostCommonItem(filteredRecipes.flatMap(recipe => recipe.diets));
  const averageCookingTime = filteredRecipes.reduce((sum, recipe) => sum + recipe.readyInMinutes, 0) / totalRecipes || 0;
  const medianCalories = getMedian(filteredRecipes.map(recipe => recipe.nutrition.nutrients.find(n => n.name === "Calories").amount));

  function getMostCommonItem(arr) {
    return arr.sort((a,b) =>
      arr.filter(v => v===a).length - arr.filter(v => v===b).length
    ).pop();
  }

  function getMedian(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  }

  return (
    <div className="App">
      <h1>Spoonacular Recipe Dashboard</h1>
      
      {loading ? (
        <div className="loading-spinner">Loading recipes...</div>
      ) : error ? (
        <div className="error-message">Error: {error}</div>
      ) : (
        <>
          <div className="summary-stats">
            <p>Total Recipes: {totalRecipes}</p>
            <p>Average Calories: {averageCalories.toFixed(2)}</p>
            <p>Median Calories: {medianCalories.toFixed(2)}</p>
            <p>Most Common Diet: {mostCommonDiet || 'N/A'}</p>
            <p>Average Cooking Time: {averageCookingTime.toFixed(2)} minutes</p>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={dietFilter} onChange={(e) => setDietFilter(e.target.value)}>
              <option value="">All Diets</option>
              <option value="gluten free">Gluten Free</option>
              <option value="ketogenic">Ketogenic</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
            <select value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)}>
              <option value="">All Cuisines</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Asian">Asian</option>
              <option value="American">American</option>
            </select>
            <select value={cookingTimeFilter} onChange={(e) => setCookingTimeFilter(e.target.value)}>
              <option value="">All Cooking Times</option>
              <option value="0-15">Quick (0-15 minutes)</option>
              <option value="16-30">Medium (16-30 minutes)</option>
              <option value="31-60">Long (31-60 minutes)</option>
              <option value="61-1000">Very Long (60+ minutes)</option>
            </select>
            <div className="calorie-range">
              <label>
                Calorie Range:
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={calorieRange.min}
                  onChange={(e) => setCalorieRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={calorieRange.max}
                  onChange={(e) => setCalorieRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                />
                <span>{calorieRange.min} - {calorieRange.max} calories</span>
              </label>
            </div>
          </div>

          <div className="recipe-list">
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-card">
                <h3>{recipe.title}</h3>
                <img src={recipe.image} alt={recipe.title} />
                <p>Calories: {recipe.nutrition.nutrients.find(n => n.name === "Calories").amount.toFixed(2)}</p>
                <p>Cooking Time: {recipe.readyInMinutes} minutes</p>
                <p>Diets: {recipe.diets.join(', ') || 'None'}</p>
                <p>Cuisines: {recipe.cuisines.join(', ') || 'None'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
