const router = require("express").Router()
const GroceryList = require("../../data/groceryList")

router.get("/", async (req, res) => {
    try{
        const userId = req.user
        const list = await GroceryList.findOne({owner:userId}) 
        if(list !== null){
            res.status(200).json({list})
        } else {
            res.status(204)
        }
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.put("/", async (req,res) => {
    try{
        const userId = req.user
        req.body.groceries = JSON.parse(req.body.groceries)
        const updatedList = await GroceryList.findOneAndUpdate({owner:userId},req.body)

        if(updated !== null){
            res.status(201).json({updatedList})
        } else {
            res.status(204)
        }
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

module.exports = router