
import { useCallback, useState } from "react";
import { useToggle } from "../helpers/useToggle";
import { Button } from "../ui/Form/Button";
import { Field, Option, Select } from "../ui/Form/Field";
import { Modal } from "../ui/Modal";
import { Routes } from "./Config/Routes";
import { Ingredients } from "./Ingredients/Ingredients";
import { useIngredients } from "./Ingredients/ingredientsHook";
import { Navbar } from "./Navigation/Navbar";
import { Recipes } from "./Recipes/Recipes";
import { useRecipes } from "./Recipes/recipesHook";

export function Site({user}) {
    const [modalOpen, toggleModalOpening] = useToggle(false);

    const [current, setCurrent] = useState(Routes.INGREDIENTS);
    const handleClick = useCallback((newCurrent) => {
      setCurrent(newCurrent);
    }, []);
  
    const ingredientsManager = useIngredients();
    const recipesManager = useRecipes();
  
    const body = current === Routes.INGREDIENTS ? <Ingredients manager={ingredientsManager} />: <Recipes manager={recipesManager} ingredients={ingredientsManager.ingredients} />;
  
    return (
      <div className="App">
        <Navbar routes={[Routes.RECIPES, Routes.INGREDIENTS]} current={current} onClick={handleClick} toggleModalOpening={toggleModalOpening} modalOpen={modalOpen} user={user} />
        <div className="container">
          <main className="main">
            { body }
          </main>
        </div>
        { modalOpen && 
          <Modal toggleOpening={toggleModalOpening}>
            <CreateRecipeCard toggleOpening={toggleModalOpening} onCreate={recipesManager.createRecipe} ingredients={ingredientsManager.ingredients} />
          </Modal>
        }
      </div>
    );
}


function CreateRecipeCard({toggleOpening, onCreate, ingredients}) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    const [state, setState] = useState({
      title: '',
      description: '',
      iq: []
    });
    
    const handleChange = function (e) {
      setState(state => ({
        ...state, 
        [e.target.name]: e.target.value
      }));
    };

    const handleDeleteIq = function (data) {
      setState(state => ({
        ...state, 
        iq: state.iq.filter(iq => iq !== data)
      }))
    }

    const handleAddIQ = function (data) {
      const existingIQ = state.iq.find(iq => iq.ingredientId === data.ingredientId);
      if(existingIQ) {
        setState(state => ({
          ...state, 
          iq: state.iq.map(iq => {
            if(iq.ingredientId === data.ingredientId) {
              iq.quantity = parseInt(iq.quantity) + parseInt(data.quantity);
              return iq;
            }
            return iq;
          })
        }));
      } else {
        setState(state => ({
          ...state, 
          iq: [...state.iq, data]
        }));
      }
    }

    const handleSubmit = async function (e) {
      e.preventDefault();
      setLoading(true);
      try {
        await onCreate(state);
        toggleOpening();
      } catch(e) {
        setErrors(e.errors);
        setLoading(false);
      }
    }

    return <div className="recipe-create-card">
          <h1>Ajouter une recette</h1>
        <form onSubmit={handleSubmit}>
          <Field name="title" onChange={handleChange} error={errors?.title}>Titre</Field> 
          <Field name="description" onChange={handleChange} error={errors?.description}>Description</Field> 
          {state.iq.map(iq => <IQ key={iq.ingredientId} ingredients={ingredients} quantity={iq.quantity} iq={iq} onDelete={handleDeleteIq} />)}
          <AddIQ ingredients={ingredients} onSubmit={handleAddIQ} />
          <Button loading={loading} className="btn btn-success" onClick={handleSubmit}>Ajouter</Button>
        </form>
    </div>
    
    
}

function AddIQ({ingredients, onSubmit}) {
    const [errors, setErrors] = useState(null);
    const [state, setState] = useState({
      currentIngredient: ingredients[0],
      quantity: ''
    });
    const handleSubmit = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if(state.quantity <= 0) {
        setErrors({
          quantity: 'La quantité doit être supérieure à zéro'
        });
        return;
      } else {
        setErrors(null);
      }
      onSubmit({
        ingredientId: state.currentIngredient.id,
        quantity: state.quantity
      });
      setState({
        currentIngredient: ingredients[0],
        quantity: ''
      });
    };
    const handleIngredientChange = function (e) {
      e.preventDefault();
      setState(state => ({
        ...state,
        currentIngredient: ingredients.find(i => i.id === parseInt(e.target.value))
      }));
    };
    const handleQuantityChange = function (e) {
      e.preventDefault();
      setState(state => ({
        ...state,
        quantity: e.target.value
      }));
    };

    return <div className="form-line">
          <Select name="ingredient" onChange={handleIngredientChange} value={state.currentIngredient.id}>
            { ingredients.map(ingredient => <Option key={ingredient.id} value={ingredient.id}>{ingredient.title}</Option>) }
          </Select>
          <Field name="quantity" type="number" onChange={handleQuantityChange} error={errors?.quantity} value={state.quantity} />
          { state.currentIngredient.unit }
          <Button type="submit" className="btn btn-primary" onClick={handleSubmit}>Valider</Button>
      </div>
    
}

function IQ({ingredients, quantity, iq, onDelete}) {
    const handleDelete = function () {
        onDelete(iq);
    }
    const ingredient = ingredients.find(i => i.id === iq.ingredientId);
    return <li>
              { ingredient.title } { quantity } { ingredient.unit }
              <button className="btn btn-danger" onClick={handleDelete}>Supprimer</button>
          </li>
}

