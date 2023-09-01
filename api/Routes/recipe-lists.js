const router = require('express').Router()
const Recipe = require('../../data/recipe')
const RecipeList = require("../../data/recipeList")
const mongoose = require('mongoose')
const User = require('../../data/user')

router.get('/:userId', async (req,res) => {
    try {
        const userId = new  mongoose.Types.ObjectId(req.params.userId)
        const recipeLists = await RecipeList.find({owner:userId}).lean()

        res.status(200).json(recipeLists)

    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.post('/', async (req,res) => {
    try {
        const userId = new  mongoose.Types.ObjectId(req.user)
        const newList = req.body
        let savedList;
        
        //check if recipe is included in request before creating list
        if (newList.recipes){
            newList.recipes = JSON.parse(newList.recipes)
            savedList = await RecipeList.create({name: newList.name,recipes:newList.recipes, owner:userId})
        } else {
            savedList = await RecipeList.create({name: newList.name,recipes:[], owner:userId})
        }

        res.status(201).json(savedList)

    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.put('/:recipeListId', async (req, res)=> {
    try {
        const listId = req.params.recipeListId
        const updates = req.body
        let updatedList;
        console.log(updates)
        if(updates.recipeToAdd){
            updatedList = await RecipeList.findByIdAndUpdate(listId, {$addToSet:{recipes:updates.recipeToAdd}},{new:true})
            await User.findByIdAndUpdate(req.user,{$addToSet:{recipes:updates.recipeToAdd}})
            updatedList = await Recipe.findById(updates.recipeToAdd)
        } else if (updates.recipeToDelete){
            updatedList = await RecipeList.findByIdAndUpdate(listId, {$pull:{recipes:updates.recipeToDelete}},{new:true})
        } else if (updates.name){
            updatedList = await RecipeList.findByIdAndUpdate(listId, {name:updates.name},{new:true})
        }

        if(updatedList !== null){
            res.status(201).json(updatedList)
        } else {
            res.status(204)
        }
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.delete("/:recipeListId", async (req, res) => {
    try {
        const listId = req.params.recipeListId
        const deletedList = await RecipeList.findByIdAndDelete(listId).lean()

        if(deletedList != null){
            res.status(201).json(deletedList)
        } else {
            res.status(204).json({message:"No matching recipe found"})
        }  
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

module.exports = router