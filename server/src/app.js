const express = require("express");
const cors = require("cors");
const path = require("path");

const chatRoutes = require("./routes/chatRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API ROUTES
app.use("/api/chat", chatRoutes);
app.use("/api/resume", resumeRoutes);

// SERVE FRONTEND BUILD FILES
app.use(
  express.static(
    path.join(__dirname, "../../client/dist")
  )
);

// REACT ROUTES
app.use((req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "../../client/dist/index.html"
    )
  );
});

module.exports = app;