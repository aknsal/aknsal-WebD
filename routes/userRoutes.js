const router = require("express").Router();
const passport = require("passport");
const genPassword = require("../utils/passwordUtils").genPassword;
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

const connection = require("../config/database");
const User = connection.models.User;
const Post = connection.models.Post;
const isAuth = require("../middleware/authMiddleware").isAuth;


//------------------ GET Profile Page -----------------

router.get("/profile/:username", isAuth, async (req, res, next) => {

    try {
        let authenticated = false;
        const user = await User.findOne({
            username: req.params.username
        });
        if (req.user._id.toString() === user._id.toString()) {
            authenticated = true;
        }
        const posts = await Post.find({
            userId: user._id
        });
        res.render("user-profile", {
            posts: posts,
            user: user,
            currentUser: req.user,
            authenticated: authenticated,
        });
    } catch (error) {
        console.log("an error occured", error);
    }

});


//--------------GET Update User Page--------------


router.get("/update/:id", isAuth, async (req, res, next) => {

    try {
        const user = await User.findOne({
            _id: req.params.id
        });
        console.log("User to be updated", user);
        if (req.user._id.toString() === user._id.toString()) {
            console.log("Match Obtained");
            authenticated = true;

            res.render("update", {
                user: user,
                authenticated: authenticated
            });
        } else {
            console.log("match Not Obtained");
        }
    } catch (error) {
        console.log(error);
    }

});

//-------------GET User search result------------------

router.get("/search/:name", isAuth, async (req, res, next) => {

    try {
        const foundUsers = await User.find({
            fName: req.params.name
        });
        res.render("showUsers", {
            foundUsers: foundUsers,
            currentUser: req.user,
        });
    } catch (error) {
        console.log("an error occured", error);
    }

});


// --------------- Get followers --------------------

router.get("/followers/:id", isAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const userFollwerIds = user.followers;
        const foundUsers = await User.find({
            _id: {
                $in: [...userFollwerIds]
            }
        });
        res.render("showUsers", {
            foundUsers: foundUsers,
            currentUser: req.user
        });
    } catch (error) {
        console.log("Error Occurred", error);
    }
});

// --------------- Get followings --------------------

router.get("/followings/:id", isAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const userFollwingIds = user.followings;
        const foundUsers = await User.find({
            _id: {
                $in: [...userFollwingIds]
            }
        });
        res.render("showUsers", {
            foundUsers: foundUsers,
            currentUser: req.user
        });
    } catch (error) {
        console.log("Error Occurred", error);
    }
});

// ---------------- Get Change Password page-----------

router.get("/updatepassword", (req, res, next) => {

    res.render("updatePassword", {
        currentUser: req.user
    });
});

//------------Search Users-------------

router.post("/search", (req, res, next) => {
    const searchURL = "/user/search/" + req.body.name;
    res.redirect(searchURL);
});


//-------------------Follow a User---------------

router.post("/follow/:id", isAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id)
        if (!user.followers.includes(req.user._id)) {
            console.log("Was not followed");
            await user.updateOne({
                $push: {
                    followers: currentUser._id
                }
            });
            await currentUser.updateOne({
                $push: {
                    followings: user._id
                }
            });



        } else {
            console.log("Was Liked");
            await user.updateOne({
                $pull: {
                    followers: currentUser._id
                }
            });
            await currentUser.updateOne({
                $pull: {
                    followings: user._id
                }
            });
        }
        const userURL = "/user/profile/" + user.username;
        res.redirect(userURL);
    } catch (error) {
        console.log("Error Occured while following or unfollowing", error);;
    }
});



//---------------------Update User----------------

router.post("/update/:id", isAuth, upload.single("image"), async (req, res, next) => {

    console.log("Request for update", req.body);
    if (req.user._id.toString() === req.params.id.toString()) {

        try {
            console.log("Match Obtained");

            const foundUser = await User.findById(req.user._id);
            // Delete image from cloudinary
            if (foundUser.cloudinary_id) {
                await cloudinary.uploader.destroy(foundUser.cloudinary_id);
            }
            let result;
            let avatar = foundUser.avatar;
            let cloudinaryId = foundUser.cloudinary_id;
            if (req.file) {
                result = await cloudinary.uploader.upload(req.file.path);
                avatar = result.secure_url;
                cloudinaryId = result.public_id;
            }

            const data = {
                username: req.body.userame || req.user.username,
                fName: req.body.fName || foundUser.fName,
                lName: req.body.lName || foundUser.lName,
                email: req.body.email || foundUser.email,
                about: req.body.about || foundUser.about,
                dob: req.body.dob || foundUser.dob,
                avatar: avatar,
                cloudinary_id: cloudinaryId,
            }

            const user = await User.findByIdAndUpdate(req.user._id, data);


            const userURL = "/user/profile" + user.username;
            res.redirect(userURL)
        } catch (error) {
            console.log("Error Occured", error);
        }

    } else {
        console.log("match Not Obtained");
    }


});



//-----------------Update Password-----------------


router.post(
    "/updatepassword/:id",
    passport.authenticate("local", {
        failureRedirect: "/login-failure"
    }), async (req, res, next) => {

        try {
            const saltHash = genPassword(req.body.newPassword);

            const salt = saltHash.salt;
            const hash = saltHash.hash;

            console.log("salt", req.user.salt);
            console.log("hash", req.user.hash);
            console.log("salt1", salt);
            console.log("hash1", hash);

            await User.findByIdAndUpdate(req.params.id, {
                salt: salt,
                hash: hash
            })

            req.logout();
            res.redirect("/login");


        } catch (error) {
            console.log("Error Occured", error);
        }
    }
);


//--------------Delete Account------------------


router.post("/deleteaccount/:id", isAuth, async (req, res, next) => {

    try {
        const user = await User.findById(req.params.id);
        console.log("account found", user);
        if (user._id.toString() === req.user._id.toString() || req.user.isAdmin) {
            await User.findByIdAndDelete(user._id);
            console.log("Account Deleted");
            res.redirect("/login");
        }
    } catch (error) {
        console.log("Error Occured While Deleting Account", error);
    }

});

module.exports = router;