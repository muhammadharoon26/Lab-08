var app = angular.module('RecipeApp', []);

app.directive('fileInput', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('change', function() {
                var file = element[0].files[0];
                if(file && file.size > 500000) {
                    alert("File is too big! Max 500KB.");
                    element.val(null);
                    return;
                }
                var reader = new FileReader();
                reader.onload = function(event) {
                    scope.$apply(function() {
                        scope.currentRecipe.image = event.target.result;
                    });
                };
                if(file) reader.readAsDataURL(file);
            });
        }
    };
});

app.controller('RecipeController', function($scope) {
    // Default variables
    $scope.recipes = [];
    $scope.viewMode = 'list'; 
    $scope.formTitle = 'Add New Recipe';
    $scope.searchQuery = ''; // Ensures search model exists

    var emptyRecipe = { id: null, title: '', ingredients: '', instructions: '', image: '' };
    $scope.currentRecipe = angular.copy(emptyRecipe);

    // --- FIXED INITIALIZATION ---
    $scope.init = function() {
        // 1. Try to get data from LocalStorage with a NEW KEY
        var savedData = localStorage.getItem('recipe_data_v2');
        var parsedData = savedData ? JSON.parse(savedData) : [];

        // 2. If LocalStorage is empty OR has 0 items, load Dummy Data
        if (parsedData.length > 0) {
            $scope.recipes = parsedData;
        } else {
            $scope.recipes = [
                {
                    id: 1,
                    title: 'Spaghetti Aglio e Olio',
                    ingredients: 'Spaghetti, Garlic, Olive Oil, Chili Flakes',
                    instructions: 'Boil pasta. Fry garlic in oil. Mix.',
                    image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=400&q=80'
                },
                {
                    id: 2,
                    title: 'Grilled Cheese Sandwich',
                    ingredients: 'Bread, Cheese, Butter',
                    instructions: 'Butter bread. Add cheese. Grill until golden.',
                    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80'
                }
            ];
            $scope.saveToLocalStorage(); // Save dummy data immediately
        }
    };

    $scope.saveRecipe = function() {
        if ($scope.currentRecipe.id) {
            var index = $scope.recipes.findIndex(r => r.id === $scope.currentRecipe.id);
            if (index !== -1) $scope.recipes[index] = angular.copy($scope.currentRecipe);
        } else {
            $scope.currentRecipe.id = Date.now();
            if(!$scope.currentRecipe.image) {
                $scope.currentRecipe.image = 'https://via.placeholder.com/400x300?text=No+Image';
            }
            $scope.recipes.push(angular.copy($scope.currentRecipe));
        }
        $scope.saveToLocalStorage();
        $scope.cancelForm();
    };

    $scope.editRecipe = function(recipe) {
        $scope.currentRecipe = angular.copy(recipe);
        $scope.formTitle = 'Edit Recipe';
        $scope.viewMode = 'form';
    };

    $scope.deleteRecipe = function(id) {
        if(confirm("Delete this recipe?")) {
            $scope.recipes = $scope.recipes.filter(r => r.id !== id);
            $scope.saveToLocalStorage();
        }
    };

    $scope.showAddForm = function() {
        $scope.currentRecipe = angular.copy(emptyRecipe);
        if(document.getElementById('recipeImage')) document.getElementById('recipeImage').value = null;
        $scope.formTitle = 'Add New Recipe';
        $scope.viewMode = 'form';
    };

    $scope.cancelForm = function() {
        $scope.viewMode = 'list';
        $scope.currentRecipe = angular.copy(emptyRecipe);
    };

    $scope.saveToLocalStorage = function() {
        localStorage.setItem('recipe_data_v2', JSON.stringify($scope.recipes));
    };

    // Load app
    $scope.init();
});