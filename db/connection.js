const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set("strictQuery", true);

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// connection to mongoDB Atlas
const connection = mongoose
    .connect(process.env.MONGODB_URI , connectionParams)
    .then(() => {
    console.log("Connected to database");
    })
    .catch((err) => {
    console.log("Error connecting to the database", err);
    });

module.exports = connection;