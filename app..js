var app = angular.module('RecipeApp', []);

// Custom directive to handle file input (AngularJS doesn't bind type="file" by default)
app.directive('fileInput', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('change', function() {
                var file = element[0].files[0];
                
                // Validation: Check file size (Limit to 500KB for LocalStorage safety)
                if(file.size > 500000) {
                    alert("File is too big! Please choose an image under 500KB.");
                    element.val(null);
                    return;
                }

                var reader = new FileReader();
                reader.onload = function(event) {
                    scope.$apply(function() {
                        // Store the Base64 string into the scope
                        scope.currentRecipe.image = event.target.result;
                    });
                };
                reader.readAsDataURL(file);
            });
        }
    };
});

app.controller('RecipeController', function($scope) {
    // Initial State
    $scope.recipes = [];
    $scope.viewMode = 'list'; // Options: 'list', 'form'
    $scope.formTitle = 'Add New Recipe';
    $scope.searchQuery = '';

    // Template for a blank recipe
    var emptyRecipe = {
        id: null,
        title: '',
        ingredients: '',
        instructions: '',
        image: '' 
    };

    $scope.currentRecipe = angular.copy(emptyRecipe);

    // --- 1. READ & INIT (LocalStorage) ---
    $scope.init = function() {
        var savedData = localStorage.getItem('recipes');
        if (savedData) {
            $scope.recipes = JSON.parse(savedData);
        } else {
            // Dummy data for demonstration
            $scope.recipes = [
                {
                    id: 1,
                    title: 'Spaghetti Aglio e Olio',
                    ingredients: 'Spaghetti, Garlic, Olive Oil, Chili Flakes, Parsley',
                    instructions: 'Boil pasta. Sauté garlic in oil. Toss pasta in oil. Serve.',
                    image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=400&q=80'
                }
            ];
        }
    };

    // --- 2. CREATE / UPDATE HANDLER ---
    $scope.saveRecipe = function() {
        if ($scope.currentRecipe.id) {
            // Update existing
            var index = $scope.recipes.findIndex(r => r.id === $scope.currentRecipe.id);
            if (index !== -1) {
                $scope.recipes[index] = angular.copy($scope.currentRecipe);
            }
        } else {
            // Create new
            $scope.currentRecipe.id = Date.now(); // Unique ID based on timestamp
            // Use default image if none uploaded
            if(!$scope.currentRecipe.image) {
                $scope.currentRecipe.image = 'https://via.placeholder.com/400x300?text=No+Image';
            }
            $scope.recipes.push(angular.copy($scope.currentRecipe));
        }
        
        $scope.saveToLocalStorage();
        $scope.cancelForm();
    };

    // --- 3. EDIT PREPARATION ---
    $scope.editRecipe = function(recipe) {
        $scope.currentRecipe = angular.copy(recipe);
        $scope.formTitle = 'Edit Recipe';
        $scope.viewMode = 'form';
    };

    // --- 4. DELETE ---
    $scope.deleteRecipe = function(id) {
        if(confirm("Are you sure you want to delete this recipe?")) {
            $scope.recipes = $scope.recipes.filter(r => r.id !== id);
            $scope.saveToLocalStorage();
        }
    };

    // --- UTILITIES ---
    $scope.showAddForm = function() {
        $scope.currentRecipe = angular.copy(emptyRecipe);
        // Reset file input manually
        document.getElementById('recipeImage').value = null;
        $scope.formTitle = 'Add New Recipe';
        $scope.viewMode = 'form';
    };

    $scope.cancelForm = function() {
        $scope.viewMode = 'list';
        $scope.currentRecipe = angular.copy(emptyRecipe);
    };

    $scope.saveToLocalStorage = function() {
        localStorage.setItem('recipes', JSON.stringify($scope.recipes));
    };

    // Initialize app
    $scope.init();
});