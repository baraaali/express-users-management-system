const express = require("express");
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")
const auth = require("../middleware/auth");
const sendEmail = require("../utils/email");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const router = express.Router();

//create Account
router.post("/signup",
// Here checks if there is an empty field
[
    check("username", "Please Enter a Valid Username").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({min: 6})
],
    async(req,res)=>{
        /*  Here it extracts the request validation errors, and then
        checks whether there is an error in the request and returns it in an array */
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {username ,email ,password} = req.body;
        
        try {
            // Here check if the user already has an account 
            let user = await User.findOne({email});
            if (user) {
                return res.status(400).json({msg: 'User Already Exists'});
            }
            // the user does not have an account, he can create one
            // When the user creates an account, it is saved to the mongoDb database
            user = new User({
                username, email, password
            });
            // Hash Passwords with bcrypt
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password ,salt);
            await user.save();

            //Create Token
            let token = await new Token({
                _userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
                }).save();
            //Verify Email
            const message = `${process.env.BASE_URL}/user/verify/${user.id}/${token.token}`;
            await sendEmail(user.email, "Verify Email", message);

            res.status.json({ success:true ,msg: "An Email sent to your account please verify"});
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

// Verify Account
router.get("/verify/:id/:token", async (req, res) => {
    try {
        // Here check if the user already create an account 
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(400).send("Invalid link");
    
        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link");
    
        await User.updateOne({ _id: user._id, isVerified: true });
        await Token.findByIdAndRemove(token._id);
    
        res.status(200).json({ success : true , msg: "Email Verified Successfully"});
    } catch (error) {
        res.status(400).send("An error occurred");
    }
});


//login to account
router.post('/login',
// Here checks if there is an empty field
[
    check('email','Please enter a valid email').isEmail(),
    check('password','Please enter a valid password').isLength({min:6})
],
    async(req, res)=>{
        /*  Here it extracts the request validation errors, and then
        checks whether there is an error in the request and returns it in an array */
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email ,password} = req.body;
        
        try {
            // Here check if the user already has an account 
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({msg: 'User Not Exist'});
            }
            // Here check if the user already verify his account 
            if(user.isValid === false){
                return res.status(400).json({msg: 'Account not verified, Please check your email '});
            }
            
            // Here compare between password in database and password it passed from user
            const isMatch = await bcrypt.compare(password ,user.password);
            if (!isMatch) {
                return res.status(400).json({msg: 'Incorrect Password !'})
            }

            const  payload = {
                user:{
                    id : user.id
                }
            };
            // Create Token of user with jsonwebtoken , and returns it to user
            jwt.sign(payload,"randomString", {expiresIn: 3600},
                (err, token)=>{
                if(err) throw err;
                res.status(200).json({token,user});
                }
            );
        } catch (err) {
            console.error(err);
            res.status(500).json({msg: "Server Error" });
            }
    }
);

// show my account
// This route will return your user if you pass the token in the header
router.get("/me", auth, async (req, res) => {
    try {
      // request.user is getting fetched from Middleware after token authentication
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (e) {
        res.send({ msg: "Error in Fetching user" });
    }
});

//Update Account
router.post("/update/:username", async (req,res)=>{
    try {
        const filter = {username: req.params.username}
        const {username ,email ,password} = req.body;
        // Find a user and update their account
        const updateAccount = await User.findOneAndUpdate(filter,{username,email,password}, { new: true });
                 // Hash Passwords with bcrypt
                const salt = await bcrypt.genSalt(10);
                updateAccount.password = await bcrypt.hash(password ,salt);
                await updateAccount.save();
            res.status(200).json({msg: "Account Updated successfully"});

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Unsuccessfully Update");
    }
})



module.exports = router;