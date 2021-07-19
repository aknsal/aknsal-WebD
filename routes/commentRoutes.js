const router = require("express").Router();
const connection = require("../config/database");
const Post = connection.models.Post;
const isAuth = require("../middleware/authMiddleware").isAuth;


//------------Get Update Comment Page------------


router.get("/update/:postId/:commentId", isAuth, async (req, res, next) => {

    try {
        const post = await Post.findById(req.params.postId);
        const commentObject = post.comments.find(comment => comment.id == req.params.commentId);
        res.render("updateComment", {
            comment: commentObject,
            post: post
        })
    } catch (error) {

    }

});


//------------------Comment on Post---------------

router.post("/add/:id", isAuth, async (req, res, next) => {



    try {
        const randomId = Math.random().toString();
        const post = await Post.findById(req.params.id);
        const commentData = {
            id: randomId,
            postId: post._id,
            userId: req.user._id,
            comment: req.body.comment,
            userPicture: req.user.avatar,
            fName: req.user.fName,
            lName: req.user.lName,
        };

        await post.updateOne({
            $push: {
                comments: commentData
            }
        })
        console.log("Post has been updated");
        res.redirect("/newsfeed")

    } catch (error) {
        console.log("Error occured While posting a comment", error);
    }


});

//------------------------Update Comment----------------

router.post("/update/:postId/:commentId", async (req, res, next) => {



    try {
        const post = await Post.findById(req.params.postId);
        const randomId = Math.random().toString();
        const commentData = {
            id: randomId,
            postId: req.params.postId,
            userId: req.user._id,
            comment: req.body.comment,
            userPicture: req.user.avatar,
            fName: req.user.fName,
            lName: req.user.lName,
        }

        await post.updateOne({
            $pull: {
                comments: {
                    id: req.params.commentId
                }
            }
        })

        await post.updateOne({
            $push: {
                comments: commentData
            }
        })
        console.log("Comment Updated");
        res.redirect("/newsfeed")

    } catch (error) {
        console.log("Error occured While posting a comment", error);
    }


});

//-----------------------------DELETE METHODS-------------------------------------------


//------------------Delete Comment--------------

router.post("/delete/:postId/:commentId", isAuth, async (req, res, next) => {



    try {

        const post = await Post.findById(req.params.postId);

        await post.updateOne({
            $pull: {
                comments: {
                    id: req.params.commentId
                }
            }
        })

        console.log("Comment Deleted");
        res.redirect("/newsfeed")

    } catch (error) {
        console.log("Error occured While posting a comment", error);
    }


});


module.exports = router;