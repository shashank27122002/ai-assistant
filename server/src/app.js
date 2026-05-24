const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/resume", resumeRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

module.exports = app;