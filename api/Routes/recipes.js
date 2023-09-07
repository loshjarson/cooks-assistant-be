const router = require('express').Router()
const multer = require('multer')
const Recipe = require("../../data/recipe")
const {uploadFile, getFile, deleteFile} = require('../s3')
const fs = require('fs')
const mongoose = require('mongoose')
const User = require('../../data/user')
const GroceryList = require('../../data/groceryList')
const RecipeList = require('../../data/recipeList')

const uploadImage = multer({dest:"uploads/"})

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        let recipeIds = await User.findById(userId).select({_id:0,recipes:1})
        let response = []
        //replace image url and key values in each recipe with input buffer of image
        await Promise.all(recipeIds.recipes.map(async (recipeId,i)=> {
                const recipe = await Recipe.findById(recipeId).lean()
                recipe.image = await getFile(recipe.image.key)
                response.push(recipe)
        }))
            res.set('Content-Type', 'application/json');
            res.status(200).json(response);
    } catch (e) {
        console.log(e)
        res.status(500).json({message:"Error getting recipes"})
    }
})


router.post('/', uploadImage.single("image"), async (req,res) => {
    try {
        const recipe = req.body
        //pull owner's user id from token
        recipe.owner = req.user
        //parses arrays
        console.log(recipe)
        recipe.ingredients = JSON.parse(req.body.ingredients)
        recipe.instructions = JSON.parse(req.body.instructions)
        recipe.tags = JSON.parse(req.body.tags)
        
        //set recipe image field to aws file props after uploading
        if (req.file) {
            const uploadResult = await uploadFile(req.file)
            recipe.image = {url:uploadResult.Location,key:uploadResult.key};
            fs.rm(req.file.path,()=>{
                console.log("succesfully deleted image from local server")
            })
        } 
        
        /* Figure out how to set default image using aws file
         else {
             recipe.image = {url:"uploads\\48fbad0d3d3fcfaab90663eee7f477e2",key:"48fbad0d3d3fcfaab90663eee7f477e2"};
         }
        */

        const newRecipe = await Recipe.create(recipe)
        await User.findByIdAndUpdate(req.user,{$addToSet:{recipes:newRecipe._id}})
        await GroceryList.findOneAndUpdate({owner:req.user}, {$addToSet: {recipe:newRecipe._id}})
        
        //sets recipe image field to aws file props
        if(newRecipe.image){
            const recipeImage = await getFile(newRecipe.image.key)
            
            res.status(201).json({...newRecipe._doc,image:recipeImage});
        } else {
           res.status(201).json(newRecipe); 
        }
        

    } catch (e) {
        console.log(e.message)
        res.status(204).json({message:"Error creating recipe"})
    }
})

router.put('/:recipeId', uploadImage.single('image'), async (req,res) => {
    try {
        const updates = req.body;
        updates.ingredients = JSON.parse(updates.ingredients)
        updates.instructions = JSON.parse(updates.instructions)
        updates.tags = JSON.parse(updates.tags)
        const recipeId = new mongoose.Types.ObjectId(req.params.recipeId)
        const userId = new mongoose.Types.ObjectId(req.user)
        
        const oldRecipe = await Recipe.findOne({_id:recipeId,owner:userId})
        if(oldRecipe === null){
            res.status(400).json({message:"Recipe either does not exist or you are not the owner"})
        }
        if(!req.file){
            delete updates["image"]
        } else if(oldRecipe.image.key !== "48fbad0d3d3fcfaab90663eee7f477e2") {
            deleteFile(oldRecipe.image.key)
            updates.image = {url:req.file.path,key:req.file.filename}
        } else {
            updates.image = {url:req.file.path,key:req.file.filename}
        }

        const updatedRecipe = await Recipe.findOneAndUpdate({_id:recipeId,owner:userId},updates,{new:true})

        //replace image url and key values in each recipe with input buffer of image
        if(updatedRecipe.image){
            const recipeImage = await getFile(updatedRecipe.image.key)
            updatedRecipe.image = recipeImage
        }
        res.status(201).json(updatedRecipe)
        
    } catch (e) {
        console.log(e.message)
        res.status(401).json({message:"error while updating recipe"})
    }
    
})


router.delete('/:recipeId', async (req,res) => {
    try {
        const updates = req.body;
        updates.ingredients = JSON.parse(updates.ingredients)
        updates.instructions = JSON.parse(updates.instructions)
        updates.tags = JSON.parse(updates.tags)
        const recipeId = new mongoose.Types.ObjectId(req.params.recipeId)
        const userId = new mongoose.Types.ObjectId(req.user)

        const oldRecipe = await Recipe.findOne({_id:recipeId,owner:userId})
        if(oldRecipe === null){
            res.status(400).json({message:"Recipe either does not exist or you are not the owner"})
        } else if(!req.file){
            delete updates["image"]
        } else if(oldRecipe.image.key !== "48fbad0d3d3fcfaab90663eee7f477e2") {
            deleteFile(oldRecipe.image.url)
            updates.image = {url:req.file.path,key:req.file.filename}
        } else {
            updates.image = {url:req.file.path,key:req.file.filename}
        }
        if(oldRecipe !== null) {
          const updatedRecipe = await Recipe.findOneAndUpdate({_id:recipeId},updates,{new:true}).lean()
            //replace image url and key values in each recipe with input buffer of image
            if(updatedRecipe.image){
                const recipeImage = getFile(updatedRecipe.image.key)
                updatedRecipe.image = recipeImage
            }
            res.status(201).json(updatedRecipe)  
        }
        

    } catch (e) {
        console.log(e.message)
        res.status(401).json({message:"error while updating recipe"})
    }
})

module.exports = router