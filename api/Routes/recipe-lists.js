const router = require('express').Router()
const RecipeList = require("../../data/recipeList")
const mongoose = require('mongoose')

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        const recipeLists = await RecipeList.find({owner:new  mongoose.Types.ObjectId(userId)}).lean()

        res.status(200).json(recipeLists)

    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.post('/', async (req,res) => {
    try {
        const userId = req.user
        const newList = req.body
        let savedList;
        
        //check if recipe is included in request before creating list
        if (newList.recipes){
            newList.recipes = JSON.parse(newList.recipes)
            savedList = await RecipeList.create({name: newList.name,recipes:newList.recipes, owner:new  mongoose.Types.ObjectId(userId)})
        } else {
            savedList = await RecipeList.create({name: newList.name,recipes:[], owner:new  mongoose.Types.ObjectId(userId)})
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
        console.log(updates)
        updates.recipes = JSON.parse(req.body.recipes)

        const updatedList = await RecipeList.findByIdAndUpdate(listId, updates,{new:true})

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