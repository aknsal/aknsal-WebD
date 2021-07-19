const router = require("express").Router();
const connection = require("../config/database");
const User = connection.models.User;
const Post = connection.models.Post;
const isAuth = require("../middleware/authMiddleware").isAuth;

// ---------------GET Liked Users--------------------

router.get("/:id", isAuth, async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        const likedUsers = post.likes;
        console.log("liked Users", likedUsers);
        const foundUsers = await User.find({
            _id: {
                $in: [...likedUsers]
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

//-------------Like Post Toggle---------------

router.post("/:id", async (req, res, next) => {
    try {
        console.log("inside put method");
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.user._id)) {
            console.log("Was not Liked");
            await post.updateOne({
                $push: {
                    likes: req.user._id
                }
            });

        } else {
            console.log("Was Liked");
            await post.updateOne({
                $pull: {
                    likes: req.user._id
                }
            });
        }
        res.redirect("/newsfeed");
    } catch (error) {
        console.log("Error Occured while liking or disliking", error);;
    }
});

module.exports = router;