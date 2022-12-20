const mongoose = require("mongoose");


// create Token collection in mongoDB database
const tokenSchema = new mongoose.Schema(
    {
        _userId: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user' 
        },
        token: { 
        type: String,
        required: true 
        },
        
    }
);


const Token = mongoose.model("token", tokenSchema);
module.exports = Token;