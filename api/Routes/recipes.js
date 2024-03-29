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
        const user = new mongoose.Types.ObjectId(req.user)
        //pull owner's user id from token
        recipe.owner = user
        //parses arrays
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
         else {
             recipe.image = {url:"uploads\\3aa453485ddbbbbb3be4bc83d11ba3cb",key:"3aa453485ddbbbbb3be4bc83d11ba3cb"};
         }

        const newRecipe = await Recipe.create(recipe)
        await User.findByIdAndUpdate(user,{$addToSet:{recipes:newRecipe._id}})
        await GroceryList.findOneAndUpdate({owner:user}, {$addToSet: {groceries:{recipe: newRecipe._id}}})
        
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
        } else if(oldRecipe.image.key !== "3aa453485ddbbbbb3be4bc83d11ba3cb") {
            deleteFile(oldRecipe.image.key)
            updates.image = {url:req.file.path,key:req.file.filename}
        } else {
            updates.image = {url:req.file.path,key:req.file.filename}
        }

        const updatedRecipe = await Recipe.findOneAndUpdate({_id:recipeId,owner:userId},updates,{new:true}).lean()

        //replace image url and key values in each recipe with input buffer of image
        if(updatedRecipe.image){
            const recipeImage = await getFile(updatedRecipe.image.key)
            res.status(201).json({...updatedRecipe, image:recipeImage})
        } else {
            const recipeImage = await getFile("3aa453485ddbbbbb3be4bc83d11ba3cb")
            es.status(201).json({...updatedRecipe, image:recipeImage})
        }
        
        
    } catch (e) {
        console.log(e.message)
        res.status(401).json({message:"error while updating recipe"})
    }
    
})


router.delete('/:recipeId', async (req,res) => {
    try {
        const recipeId = new mongoose.Types.ObjectId(req.params.recipeId)
        const userId = new mongoose.Types.ObjectId(req.user)

        await User.findByIdAndUpdate(userId,{$pull: {recipes:recipeId}}).exec()
        await RecipeList.updateMany({owner:userId,recipes:{$in: recipeId}},{$pull:{recipes:recipeId}})
        await GroceryList.findOneAndUpdate({owner:userId},{$pull: {recipes:{recipe:recipeId}}},{ safe: true, multi:true })

        const recipe = await Recipe.findOneAndDelete({_id:recipeId,owner:userId}).exec()

        if(recipe.image && recipe.image.key !== "3aa453485ddbbbbb3be4bc83d11ba3cb"){
            const recipeImage = await deleteFile(recipe.image.url)
            if(!recipeImage){
                res.status(400).json({message:"error while deleting image"})
            } else {
               res.status(201).json({message:"deleted"}) 
            }
        } else {
            if(recipe != null){
                res.status(201).json({message:"deleted"})
            } else {
                res.status(204).json({message:"No matching recipe found"})
            }
        }
        

    } catch (e) {
        console.log(e.message)
        res.status(401).json({message:"error while updating recipe"})
    }
})

module.exports = router