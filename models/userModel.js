const mongoose = require('mongoose');

// create User collection in mongoDB database
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
          },
          email: {
            type: String,
            required: true
          },
          password: {
            type: String,
            required: true
          },
          isVerified: { 
            type: Boolean, 
            default: false
          },
    },
    {timestamps: true}
);


const User = mongoose.model("user", userSchema);
module.exports = User ;
