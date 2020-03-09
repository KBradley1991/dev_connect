const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");
const auth = require("./middleware/auth");

//connect Database
connectDB();

//init middleware
app.use(express.json({ extended: false }));

//Define ROutes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/post", require("./routes/api/post"));

//testing API connection
app.get("/", (req, res) => {
  res.send("Server is running");
});

//Api listing to port
app.listen(PORT, () => {
  console.log("app is running on port ", PORT);
});
