require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const authRoute = require("./router/auth");
const clientRoute = require("./router/client");
const projectManagerRoute = require("./router/projectManager");
const { default: mongoose } = require("mongoose");
const cors = require("cors");

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("database connected");
  })
  .catch((error) => {
    console.log(error);
  });
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoute);
app.use("/api/client", clientRoute);
app.use("/api/project-manager", projectManagerRoute);

app.listen(port, () => {
  console.log(`server running on localhost:${port}`);
});
