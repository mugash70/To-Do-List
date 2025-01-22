const cors = require("cors");
var express = require("express")
const flash = require("express-flash");
const bodyParser = require("body-parser");
//get the routes
const Routes = require("./routes");
//envs 
require("dotenv").config();
const app =express();
//allow cross origins
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/", Routes);

// Middleware for handling errors
app.use((err, req, res, next) => {
res.status(err.status || 500).json({
        error: {
            message: err.message || "Internal Server Error",
        },
    });
});


app.use(flash());
//server listener
app.listen(process.env.PORT, () => {console.log(`Server running on port ${process.env.PORT}`);});