const router = require("express").Router();
const connection = require("../config/database");
const Post = connection.models.Post;
const isAuth = require("../middleware/authMiddleware").isAuth;


//-------------------- Get Update Post Page----------------

router.get("/update/:id", isAuth, async (req, res, next) => {

    try {
        const post = await Post.findOne({
            _id: req.params.id
        });
        console.log("Post to be updated", post);
        if (req.user._id.toString() === post.userId.toString()) {
            console.log("Match Obtained");
            authenticated = true;

            res.render("updatePost", {
                post: post,
                authenticated: authenticated
            });
        } else {
            console.log("match Not Obtained");
        }
    } catch (error) {}

});


//---------- Filter Location------

router.get("/location/:location", isAuth, async (req, res, next) => {

    try {
        const posts = await Post.find({
            location: req.params.location
        });
        console.log(posts);
        res.render("newsfeed", {
            posts: posts,
            user: req.user,
            currentUser: req.user,
        });
    } catch (error) {
        console.log(error);
    }

});

//---------Create Post--------------

router.post("/create", isAuth, (req, res, next) => {
    const newPost = new Post({
        userId: req.user._id,
        desc: req.body.desc,
        fName: req.user.fName,
        lName: req.user.lName,
        userPicture: req.user.avatar,
        username: req.user.username,
        location: req.user.location,
    });

    // Save Post
    newPost
        .save()
        .then((post) => {
            console.log(post);
        })
        .catch((err) => {
            console.log(err);
        });

    res.redirect("/newsfeed");
});




// --------------Filter Location-------

router.post("/location", isAuth, (req, res, next) => {
    const postURL = "/post/location/" + req.body.location
    res.redirect(postURL);
});



// -------------------Update Post----------------------

router.post("/update/:id", isAuth, async (req, res, next) => {

    try {
        const post = await Post.findById(req.params.id);
        if (req.user._id.toString() === post.userId.toString()) {
            const postData = {
                desc: req.body.desc,
                fName: req.user.fName,
                lName: req.user.lName,
                userPicture: req.user.avatar,
                username: req.user.username,
            }
            await Post.findByIdAndUpdate(post._id, postData);
            console.log("Post Updated");
            res.redirect("/newsfeed")
        } else {
            res.send(
                '<h1>You are not the writer of this post</h1><p><a href="/newsfeed">Homepage</a></p>'
            );
        }
    } catch (error) {
        console.log("Error Occured", error);
    }
})

//-------------Delete Post-------------------

router.post("/delete/:id", isAuth, async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        console.log("post found", post);
        if (post.userId.toString() === req.user._id.toString() || req.user.isAdmin) {
            await Post.findByIdAndDelete(post._id);
            console.log("post Deleted");
            res.redirect("/newsfeed");
        }
    } catch (error) {
        console.log("Error Occured While Deleting post", error);
    }
});


module.exports = router;