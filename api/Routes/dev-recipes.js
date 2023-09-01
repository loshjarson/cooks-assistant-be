const router = require('express').Router()
const multer = require('multer')
const Recipe = require("../../data/recipe")
const fs = require('fs')
const mongoose = require('mongoose')
const User = require('../../data/user')
const GroceryList = require('../../data/groceryList')
const RecipeList = require('../../data/recipeList')

//transform image into array buffer
const getFile = (filePath) => {
    const inputBuffer = fs.readFileSync(filePath);
    return inputBuffer
}

//remove image from local files
const deleteFile = (filePath) => {
    try{
        fs.unlinkSync(filePath);
        return true
    }
    catch(e){
        console.log(e)
        return false
    }

}

const uploadImage = multer({dest:"uploads/"})

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        let recipeIds = await User.findById(userId).select({_id:0,recipes:1})
        let response = []
        // const recipes = await Recipe.find({owner:userId}).lean()
        //replace image url and key values in each recipe with input buffer of image
        await Promise.all(recipeIds.recipes.map(async (recipeId,i)=> {
                const recipe = await Recipe.findById(recipeId).lean()
                recipe.image = await getFile(recipe.image.url)
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
        recipe.owner = req.user

        //parses arrays
        recipe.ingredients = JSON.parse(req.body.ingredients)
        recipe.instructions = JSON.parse(req.body.instructions)
        recipe.tags = JSON.parse(req.body.tags)
        
        //set recipe image field to local image props
        if (req.file) {
            recipe.image = {url:req.file.path,key:req.file.filename};
        } else {
            recipe.image = {url:"uploads\\48fbad0d3d3fcfaab90663eee7f477e2",key:"48fbad0d3d3fcfaab90663eee7f477e2"};
        }

        const newRecipe = await Recipe.create(recipe)
        await User.findByIdAndUpdate(req.user,{$addToSet:{recipes:newRecipe._id}})
        await GroceryList.findOneAndUpdate({owner:req.user}, {$addToSet: {recipe:newRecipe._id}})

        //set image field to local file props
        if(newRecipe.image){
            const recipeImage = await getFile(newRecipe.image.url)
            
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
                const recipeImage = getFile(updatedRecipe.image.url)
                updatedRecipe.image = recipeImage
            }
            res.status(201).json(updatedRecipe)  
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
        console.log("working")

        await User.findByIdAndUpdate(userId,{$pull: {recipes:recipeId}}).exec()
        await RecipeList.updateMany({owner:userId,recipes:{$in: recipeId}},{$pull:{recipes:recipeId}})
        await GroceryList.findOneAndUpdate({owner:userId},{$pull: {recipes:{recipe:recipeId}}})

        const recipe = await Recipe.findOneAndDelete({_id:recipeId,owner:userId}).exec()

        if(recipe.image && recipe.image.key !== "48fbad0d3d3fcfaab90663eee7f477e2"){
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
        res.status(401)
    }
})

module.exports = router