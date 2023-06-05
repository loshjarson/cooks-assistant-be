const router = require("express").Router()
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

const User = require("../../data/user")

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

        const user = await User.create({username:username,password:hash})
        
        const token = makeToken(user);
        res.status(201).json({
            message: `Welcome, ${user.username}`,
            token,
            id: user._id
        })
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

module.exports = router