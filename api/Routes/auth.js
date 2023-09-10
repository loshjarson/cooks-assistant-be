const router = require("express").Router()
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

const User = require("../../data/user");
const GroceryList = require("../../data/groceryList");

const makeToken = (user) => {
    const payload = {
        subject: user._id,
        username: user.username,
    }

    const options = {
        expiresIn: "1d",
    }
    
    return jwt.sign(payload, process.env.ACCESS_SECRET, options);
}

router.post("/register", async (req,res) => {
    try {
        const {username, password} = req.body;
        const hash = bcrypt.hashSync(password)

        const existingUser = await User.findOne({username:username})

        if(existingUser) {
            res.status(403).json({message:"Username Taken"})
        } else {
           const user = await User.create({username:username,password:hash})
        
            const token = makeToken(user);

            await GroceryList.create({groceries:[],owner:user._id})
            

            res.status(201).json({
                message: `Welcome, ${user.username}`,
                token,
                id: user._id
            }) 
        }

        
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.post("/login", async (req,res) => {
    const {username, password} = req.body;

    const user = await User.findOne({username})
    
    if(user && bcrypt.compareSync(password,user.password)) {
        const token = makeToken(user);
        res.status(200).json({
            message: `${user.username} is back!`,
            token,
            userID: user.id
        });
    } else {
        res.status(401).json({ message: "Please check credentials" });
    }
})

router.post("/authenticate", async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(403).json({message:"Token is invalid"});
    } else {
      jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
        if (err) {
          res.status(403).json({message:"Token is invalid"});
        } else {
          res.status(200).json("User authenticated")
        }
      });
    }
})

module.exports = router