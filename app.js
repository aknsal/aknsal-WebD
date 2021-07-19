require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const ejs = require("ejs");
var crypto = require("crypto");
const routes = require("./routes/index");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const likePostRoutes = require("./routes/likePostRoutes");
const commentRoutes = require("./routes/commentRoutes");
const connection = require("./config/database");
var methodOverride = require("method-override");

// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require("connect-mongo");

// Need to require the entire Passport config module so app.js knows about it
require("./config/passport");

// Set Up mongoose
const connectionURL = process.env.MONGODB_STRING;
mongoose
  .connect(connectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to Database"))
  .catch((err) => console.log(err));

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax

var app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(methodOverride());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

/**
 * -------------- SESSION SETUP ----------------
 */

app.use(
  session({
    secret: "story book",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_STRING,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
// TODO

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

app.use(passport.initialize());
app.use(passport.session());

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(routes);
app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/like", likePostRoutes);
app.use("/comment", commentRoutes);

// 404 Error
app.use((req, res) => {
  res.status(404).send("<h1>404 Error, the page doesn't exist</h1>");
});

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(process.env.PORT || 3000);
