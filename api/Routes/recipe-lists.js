const router = require('express').Router()
const { RolesAnywhere } = require('aws-sdk')
const RecipeList = require('../../data/recipeList')

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        const recipeLists = await RecipeList.find({owner:userId}).exec()
        res.set('Content-Type', 'application/json');
        res.json({recipeLists});
            
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

router.post('/update', async (req, res) => {
    try {
        const {user,body} = req
        const recipeList = await RecipeList.findById(body._id).exec()
        if(user.subject === recipeList.owner){
            const updatedList = await RecipeList.findByIdAndUpdate(body._id,body).exec()
            res.status(201).json({updatedList})
        } else {
            res.status(500).json({message:"Not Authorized"})
        }
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

router.post('/', async (req,res) => {
    try {
        const recipeList = await RecipeList.create({...req.body, owner:req.user.subject});
        res.status(201).json({recipeList})
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})