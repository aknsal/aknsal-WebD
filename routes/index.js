const router = require("express").Router();
const passport = require("passport");
const genPassword = require("../utils/passwordUtils").genPassword;

const isAuth = require("../middleware/authMiddleware").isAuth;
const connection = require("../config/database");
const User = connection.models.User;
const Post = connection.models.Post;

// ---------------------------GET METHODS--------------------------------

//---------- Get Homepage---------------------
router.get("/", (req, res, next) => {
  res.render("index");
});

//----------Get Login Page---------------
router.get("/login", (req, res, next) => {
  res.render("login");
});

//----------Get Register Page-------------
router.get("/register", (req, res, next) => {
  res.render("register");
});

//-------------Login Failure-----------

router.get("/login-failure", (req, res, next) => {
  res.send('<p>Wrong Username or password</p><a href="/login"> Try Again</a>');
});

//-----------NewsFeed Page---------------

router.get("/newsfeed", isAuth, async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.render("newsfeed", {
      posts: posts,
      user: req.user,
      currentUser: req.user,
    });
  } catch (error) {}
});

// ----------------------- POST METHODS ---------------------------------

//---------Login User---------------------------------

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "/newsfeed",
  })
);

function isUserNameValid(username) {
  const res = /^[a-z0-9_\.]+$/.exec(username);
  const valid = !!res;
  return valid;
}

// -------------Register account -----------------

router.post("/register", async (req, res, next) => {
  if (!isUserNameValid(req.body.username)) {
    res.send(
      ' <h4>Username format is not valid.</h4> <h6> Usernames can only have - </h6> <p> Lowercase Letters (a-z), Numbers (0-9), Dots (.), Underscores (_) <h5> <a href="/register">Try again</a> with a different username</h5>'
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    res.send(
      ' <h4>Passwords do not match</h4> <h5> <a href="/register">Try again</a> </h5>'
    );
  }

  try {
    const saltHash = genPassword(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
      username: req.body.username,
      hash: hash,
      salt: salt,
      isAdmin: true,
      fName: req.body.fName,
      lName: req.body.lName,
      email: req.body.email,
      dob: req.body.dob,
      location: req.body.location,
      avatar:
        "https://res.cloudinary.com/dm7azk7jr/image/upload/v1626459235/oceqllreeschdwal1uyg.jpg",
    });

    // Save user
    await newUser.save();
    res.redirect("login");
  } catch (err) {
    console.log("Error occured while registering", err);
    res.send(
      '<h4>Username Already Exist. <a href="/register">Try again</a> with a different username</h4>'
    );
  }
});

//-----------Logout User----------

router.post("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
