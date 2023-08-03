const router = require('express').Router()
const multer = require('multer')
const Recipe = require("../../data/recipe")
const {uploadFile, getFile, deleteFile} = require('../s3')
const fs = require('fs')



router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        const recipes = await Recipe.find({owner:userId}).exec()
        for(const recipe in recipes){
            if(recipes[recipe].image.key){
                const recipeImage = await getFile(recipes[recipe].image.key)
                const updatedObj = {...recipes[recipe], image:recipeImage}
                recipes[recipe] = updatedObj
            }
            
        }
            res.set('Content-Type', 'application/json');
            res.json({recipes});
            
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

router.delete('/:recipeId', async (req,res) => {
    try {
        const {recipeId} = req.params

        const recipe = await Recipe.findByIdAndDelete(recipeId).exec()

        if(recipe.image.key && recipe.image.key !== "48fbad0d3d3fcfaab90663eee7f477e2"){
            const recipeImage = await deleteFile(recipe.image.key)
            if(typeof recipeImage !== 'string'){
                res.status(400).json({message:"error while deleting image"})
            }
        }
        if(recipe != null){
            res.status(201).json({message:"Recipe deleted",recipe})
        } else {
            res.status(400).json({message:"No matching recipe found"})
        }     
    } catch (e) {  
        console.log(e.message)
        res.status(401)
    }
})

const uploadImage = multer({dest:"uploads/"})

router.post('/:userId', uploadImage.single("image"), async (req,res) => {
    try {
        req.body.owner = req.params.userId
        req.body.ingredients = JSON.parse(req.body.ingredients)
        req.body.instructions = JSON.parse(req.body.instructions)
        req.body.tags = JSON.parse(req.body.tags)
        const recipe = new Recipe(req.body)

        
        if (req.file) {
            const uploadResult = await uploadFile(req.file)
            recipe.image = {url:uploadResult.Location,key:uploadResult.key};
            fs.rm(req.file.path,()=>{
                console.log("succesfully deleted image from local server")
            })
        }
        let savedRecipe = await recipe.save(recipe)
        if(recipe.image){
            const recipeImage = await getFile(savedRecipe.image.key)
            savedRecipe = {...savedRecipe, image:recipeImage}
        }

        res.json({ recipe: savedRecipe });

    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.post('/:recipeId/image', uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    const recipeId = req.params.recipeId;
    const imageId = req.file.id;

    Recipe.findByIdAndUpdate(
        recipeId,
        { image: imageId },
        { new: true },
        (err, recipe) => {
            if (err) {
                console.error('Error updating recipe:', err);
                return res.status(500).json({ message: 'Failed to update recipe' });
            }
            res.json({ recipe });
        }
    );
})




router.put('/:recipeId', uploadImage.single('image'), async (req,res) => {
    try {
        req.body.ingredients = JSON.parse(req.body.ingredients)
        req.body.instructions = JSON.parse(req.body.instructions)
        req.body.tags = JSON.parse(req.body.tags)
        const update = req.body;
        if(req.file){
            update.image = req.file.id
        }
        const recipe = await Recipe.findByIdAndUpdate(req.params.recipeId,update,{new:true})
        res.status(201).json({message:"Recipe updated successfully ", recipe})
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
    
})



module.exports = router