const router = require('express').Router()
const multer = require('multer')
const Recipe = require("../../data/recipe")
const {uploadFile, getFile} = require('../s3')
const fs = require('fs')

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        const recipes = await Recipe.find({owner:userId}).exec()
            // .exec((err, recipes) => {
            //     if (err) {
            //       console.error('Error retrieving recipes:', err);
            //       return res.status(500).json({ message: 'Failed to retrieve recipes' });
            //     }
          
                
            // });
            res.json({recipes})
    } catch (e) {
        console.log(e.message)
        res.status(500)
    }
})

const uploadImage = multer({dest:"uploads/"})

router.post('/:userId', uploadImage.single("image"), async (req,res) => {
    try {
        req.body.owner = req.params.userId
        req.body.ingredients = JSON.parse(req.body.ingredients)
        req.body.instructions = JSON.parse(req.body.instructions)
        const recipe = new Recipe(req.body)
        console.log(req.file)
        const uploadResult = await uploadFile(req.file)
        if (req.file) {
            recipe.image = {url:uploadResult.Location,key:uploadResult.key};
        }
        const savedRecipe = await recipe.save(recipe)
        console.log(savedRecipe)
        fs.rm(req.file.path)
        // if (err) {
        //     console.error('Error saving recipe:', err);
        //     return res.status(500).json({ message: 'Failed to save recipe' });
        // }
    
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

router.patch('/:recipeId', uploadImage.single('image'), async (req,res) => {
    try {
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

router.delete('/:recipeId', (req,res) => {

})



module.exports = router