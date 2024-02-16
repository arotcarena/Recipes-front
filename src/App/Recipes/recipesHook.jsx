import { useCallback, useReducer } from "react";
import { apiFetch } from "../../helpers/api";


const recipesReducer = function (state, action) {
    switch(action.type) {
        case 'LOADING':
            return {
                ...state,
                loading: true
            };
        case 'FETCH_RECIPES':
            return {
                ...state,
                recipes: action.payload,
                loading: false
            };
        case 'FETCH_RECIPE':
            return {
                ...state, 
                recipes: state.recipes.map(r => {
                    if(action.payload.id === r.id) {
                        return action.payload;
                    }
                    return r;
                })
            };
        case 'UPDATE_RECIPE':
            return {
                ...state,
                recipes: state.recipes.map(recipe => {
                    if(recipe === action.target) {
                        return action.payload;
                    }
                    return recipe;
                })
            };
        case 'DELETE_RECIPE':
            return {
                ...state, 
                recipes: state.recipes.filter(recipe => recipe !== action.payload)
            };
        case 'CREATE_RECIPE':
            return {
                ...state, 
                recipes: [action.payload, ...state.recipes]
            };
        default:
            throw new Error('ACTION INCONNUE : dans recipesHook -> recipesReducer');
    }
}



export function useRecipes() {
    const [state, dispatch] = useReducer(recipesReducer, {
        recipes: null,
        loading: false
    });

    return {
        recipes: state.recipes,
        loading: state.loading,
        fetchRecipes: async function () {
            if(state.loading || state.recipes) {
                return;
            }
            dispatch({type: 'LOADING'});
            const recipes = await apiFetch('/recipes');
            dispatch({type: 'FETCH_RECIPES', payload: recipes});
        },
        fetchRecipe: useCallback(async function (recipe) {
            if(recipe.description) {
                return;
            }
            recipe = await apiFetch('/recipes/'+recipe.id);
            dispatch({type: 'FETCH_RECIPE', payload: recipe});
        }, []),
        createRecipe: useCallback(async function (data) {
            const recipe = await apiFetch('/recipes', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            dispatch({type: 'CREATE_RECIPE', payload: recipe});
        }, []),
        deleteRecipe: useCallback(async function (recipe) {
            await apiFetch('/recipes/delete/'+recipe.id, {
                method: 'POST'
            });
            dispatch({type: 'DELETE_RECIPE', payload: recipe});
        }, []),
        updateRecipe: useCallback(async function (recipe, data) {
            const updatedRecipe = await apiFetch('/recipes/update/'+recipe.id, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            dispatch({type: 'UPDATE_RECIPE', payload: updatedRecipe, target: recipe});
        }, []),
        deleteIngredientQuantity: useCallback(async function (recipe, ingredientQuantity) {
            const updatedRecipe = await apiFetch('/recipes/ingredientQuantity/delete/'+ingredientQuantity.id, {
                method: 'POST'
            });
            dispatch({type: 'UPDATE_RECIPE', payload: updatedRecipe, target: recipe});
        }, []),
        addIngredientQuantity: useCallback(async function (recipe, ingredientId, quantity) {
            const updatedRecipe = await apiFetch('/recipes/'+recipe.id+'/addIngredientQuantity', {
                method: 'POST',
                body: JSON.stringify({ingredientId: ingredientId, quantity: quantity})
            });
            dispatch({type: 'UPDATE_RECIPE', payload: updatedRecipe, target: recipe});
        }, []),
        updateIngredientQuantity: useCallback(async function (recipe, ingredientQuantity, quantity) {
            const updatedRecipe = await apiFetch('/recipes/updateIngredientQuantity/'+ingredientQuantity.id, {
                method: 'POST',
                body: JSON.stringify({quantity: quantity})
            });
            dispatch({type: 'UPDATE_RECIPE', payload: updatedRecipe, target: recipe});
        }, [])
    }
}