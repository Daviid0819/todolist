const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use(require("./routes/user"));
app.use(require("./routes/list"));

mongoose.connect(process.env.DB_URL, () => {
    console.log("Database connected");
});

app.listen(process.env.PORT, () => {
    console.log("Server is running on port: "+process.env.PORT);
})