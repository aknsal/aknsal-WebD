require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const routes = require("./routes/index");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const likePostRoutes = require("./routes/likePostRoutes");
const commentRoutes = require("./routes/commentRoutes");
const connection = require("./config/database");
var methodOverride = require("method-override");
const MongoStore = require("connect-mongo");

// Need to require the entire Passport config module so app.js knows about it
require("./config/passport");

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
app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
