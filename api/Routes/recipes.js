const router = require('express').Router()
const multer = require('multer')
const Recipe = require("../../data/recipe")
const {uploadFile, getFile, deleteFile} = require('../s3')
const fs = require('fs')
const mongoose = require('mongoose')

const uploadImage = multer({dest:"uploads/"})

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        const recipes = await Recipe.find({owner:userId}).lean()
        //replace image url and key values in each recipe with input buffer of image
        recipes.map(async (recipe)=> {
            if(recipe.image.key){
                const recipeImage = await getFile(recipes[recipe].image.key)
                const updatedObj = {...recipe, image:recipeImage}
                return updatedObj
            } else return recipe
        })
            res.set('Content-Type', 'application/json');
            res.status(200).json(recipes);
            
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
        
        //sets recipe image field to aws file props
        if(newRecipe.image){
            const recipeImage = await getFile(newRecipe.image.key)
            newRecipe.image = recipeImage
        }
        res.status(201).json(newRecipe);

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
        
        const oldRecipe = await Recipe.findOne({_id:req.params.recipeId,owner:req.user})
        if(!req.file){
            delete updates["image"]
        } else if(oldRecipe.image.key !== "48fbad0d3d3fcfaab90663eee7f477e2") {
            deleteFile(oldRecipe.image.url)
            updates.image = {url:req.file.path,key:req.file.filename}
        } else {
            updates.image = {url:req.file.path,key:req.file.filename}
        }

        const updatedRecipe = await Recipe.findOneAndUpdate({_id:new mongoose.Types.ObjectId(req.params.recipeId),owner:new mongoose.Types.ObjectId(req.user)},updates,{new:true})

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
        const recipeId = req.params.recipeId

        //delete recipe from database
        const recipe = await Recipe.findOneAndDelete({_id:new mongoose.Types.ObjectId(recipeId),owner:new mongoose.Types.ObjectId(req.user)}).lean()
        if(recipe === null){
            res.status(204).json({message:"No matching recipe found"})
        } 

        //delete image file from aws bucket
        if(recipe.image.key /*&& recipe.image.key !== "48fbad0d3d3fcfaab90663eee7f477e2"*/){
            const recipeImage = await deleteFile(recipe.image.key)
            if(typeof recipeImage !== 'string'){
                res.status(400).json({message:"error while deleting image"})
            }
        }
        res.status(201).json(recipe)
    } catch (e) {  
        console.log(e.message)
        res.status(401)
    }
})

module.exports = router