const express = require('express');
const bodyParser = require('body-parser');
const connection =require('./db/connection');
const user = require('./routes/user'); 
const app = express();


// setup middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/user", user);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

