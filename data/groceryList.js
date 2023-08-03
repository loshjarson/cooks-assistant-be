const mongoose = require('mongoose')

const groceryListSchema = new mongoose.Schema({
    groceries: [{
        name: String,
        amount: Number,
        unit: String
    }],
    owner: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
})

module.exports = mongoose.model('GroceryList', groceryListSchema)