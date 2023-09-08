const mongoose = require('mongoose')

const groceryListSchema = new mongoose.Schema({
    groceries:[{recipe:{type: mongoose.Schema.Types.ObjectId, ref:'Recipes'},quantity:{type:Number, default:0}}],
    owner: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
})

module.exports = mongoose.model('GroceryList', groceryListSchema)