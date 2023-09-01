const router = require("express").Router()
const GroceryList = require("../../data/groceryList")
const mongoose = require("mongoose")

router.get("/", async (req, res) => {
    try{
        const userId = new mongoose.Types.ObjectId(req.user)
        const list = await GroceryList.findOne({owner:userId}).lean() 
        console.log(list.groceries)
        if(list){
            console.log("sending")
            res.status(200).json(list)
        } else {
            res.status(204).json({message:"error finding grocery list"})
        }
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.put("/update", async (req,res) => {
    try{
        const userId = new mongoose.Types.ObjectId(req.user)
        const updates = req.body;
        updates.recipes = JSON.parse(req.body.recipes)
        await Promise.all(updates.recipes.forEach(async recipe => {
            recipe.recipe = new mongoose.Types.ObjectId(recipe.recipe)
            await GroceryList.findOneAndUpdate({owner:userId, "groceries.recipe":recipe.recipe}, {$set: {"groceries.$.quantity":recipe.quantity}}, {new:true})
        }))
        const updatedList = await GroceryList.findOne({owner:userId}).lean()
        console.log(updatedList)
        if(updatedList){
            res.status(201).json(updatedList)
        } else {
            res.status(204).json({message:"error finding grocery list"})
        }
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})


module.exports = router