# Covin-Express
A networking site built on nodejs and express where users can share there convid expeiance.

Checkout the Website [Here](https://agile-sea-39604.herokuapp.com/)

Try with admin credentials
username:admin
password:admin

Compare using Normal account
username:lorem
password:lorem

## Features
- Users can Create an account and log into their accounts
- Share their covid experiance directly from newsfeed page
- Update/ delete post
- Like/Unlike a post
- Filter post according to Location
- See People who have liked a certain post
- Comment on a post
- Update/Delete Comment
- Admin can delete any post or comment but cannot edit any
- Add a Profile Photo and other details such as DOB and AboutMe
- Profile Page consist of Posts of that user and user details such as Profile Picture, Name, Username, Age, AboutMe   
- Search Other Users
- Follow/Unfollow a user
- See Followers and Followings of Users
- Posts shows time and location when it was created
- Update Password
- Delete Account

## Database Schemas
MongoDB with mongoose has been used in the project as Databases.
There are two models
- User Schema
- Post Schema

### UserSchema
```javascript
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    isAdmin: Boolean,
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    about: {
        type: String,
        default: "Hello"
    },
    dob: Date,
    avatar: String,
    cloudinary_id: String,
    followers: {
        type: Array,
        default: [],
    },
    followings: {
        type: Array,
        default: [],
    },
    location: String,
}, {
    timestamps: true
});
```
Here avatar stors the image URL stored in # Cloundinary.
Followers and Following respectively Stores the array of UserId of the user following and being followed.


### PostSchema
```javascript
const PostSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    desc: {
        type: String,
        max: 500,
    },
    img: String,
    likes: {
        type: Array,
        default: [],
    },
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    comments: {
        type: Array,
        default: [],
    },
    location : String,
    userPicture: String,
}, {
    timestamps: true
});
```
Post Schema stores information regarding Post as well as the user.
TimeStamps (which are automatically created) help to display time when it was posted.

# Routes

## Home Routes ("/")
### Get Routes

- Home Page `("/")` : Consist of two links drecting towards Login And Register

- Register `("/register")` : Renders `register.ejs` which consist of a Form with various Field Input and a submit button with POST Method

- Login `("/login")` : Consist of a Form with username and password input and a submit button with POST Method

- Newsfeed`("/newsfeed")` : Renders `newsfeed.ejs` after making a find query in post collection in mongoDB and passes the array obtained with post details as a second parameter in render method. It also consist Create post from which makes a post request at `("/post/create")`


### Post routes

- Register `("/register")`
>Passport Local Stratergy is used to Manage Authentication More on it ahead!
A new user is created using the key value pairs in req.body obtainedfrom the form.




- Login `("/login")` : Authenticate an existing user by `passport.authenticate()` using [local strategy](http://www.passportjs.org/packages/passport-local/)


- Logout `(/logout)` : Logsout user using the logout function provided by passport


## User Routers `(/user)`
### Get Routes

- User Profile `("/user/profile/{username}")` : `{username}` is the username of the user whose profile is requested

- Update User Form `("/user/update/{user_id}")` : Renders `update.ejs` (a from to update details) which makes post request to `("/user/update/{_id}")` where is the userid parameter which is recieved by `req.params._id`.

- Get Followers `("/user/followers/{user_id}")` : Get List of Followers of a user

- Get Followings `("/user/followings/{user_id}")` : Get list of people following a user

- Search User `("/user/search/{fName}")` : Search User by first name.

### Post routes
- Follow a User `("/follow/{user_id}")` : Toogle Follow/Unfollow of a user

- Update User (POST) `("/user/update/{user_id}")` : Receives ID as a parameter and Update the database by the `findByIdAndUpdate()` method in Mongo DB.

- Update Password `("/user/updatepassword/{user_id}")` : Updates the password by first Verifying the user credentials (Entering password again and verifying them) and then generating a salt and hash from the new password and storing it in database. 

### Delete route
- Delete Password `("/user/deleteaccount/{user_id}")` : Deletes the user Account


## Post Routes  `("/post")`
### Get Routes

- Update Post Form `("/post/update/{post_id}")` : Renders a form to Update post

### Post route

- create post `("/post/create")` : Makes a post request to add a post

- Update Post `("/post/update/{post_id}")` : Makes a post request to Update a post


### Delete route

- Delete Post `("/post/delete/{post_id}")`


## Like Post Routes  `("/like")`
### Get Routes

- Liked Users `("/like/{post_id}")` : Shows the list of users who have liked the post 

- Like/Unlike post `("/like/{post_id}")` : Toggle Like/Unlike


## Comment Routes  `("/comment")`
### Get Routes

- Update Comment Form `("/comment/update/{post_id}/{comment_id}")` : Renders an Update form

### Post routes

- Comment on post `("/comment/add/{comment_id}")` : Makes a post request to add a post

- Update comment `("/comment/update/{post_id}/{comment_id}")` : Makes a post request to update a post

### Delete route

- Delete comment `("/comment/delete/{post_id}/{comment_id}")` : Deletes a post


# Important Points


## Username format
- Username is a unique field which means it cannot have duplicates. This was done as the profile page consist of username in the route so it has to be unique otherwise there would be a conflict in getting a user profilepage as there would be two entries matching and mongoDB would return the first user that it finds. If register form is submitted with the same username it would retuen an error saying that username already exist.
- Username can only contain some characters which include 
    - Lowercase Letters (a-z)
    - Numbers (0-9)
    - Dots (.)
    - Underscores (_)
    
 If characters outside this set are used a page with an error saying "username format is invalid would be returned".

## Generation of Salt and Hash
A salt is generated using crypto library already present in nodejs. A Hash is generated using pbkdf2 function and passing `password`, `salt`, `10000`(iterations), `64`(no. of Characters) and `"sha521"`(a hashing function) as parameters.
This salt and hash is stored in user database as passwords

> More About [sha512](https://medium.com/@zaid960928/cryptography-explaining-sha-512-ad896365a0c1)
> More about [pbkdf2](https://www.geeksforgeeks.org/node-js-crypto-pbkdf2-method/)

## Verify Password
Salt, hash, and password are passes as parameters in `verifypassword()`. A hash is generated using password and salt ans is mathced with the hash already present in adtebase if they are same user is authenticated.


## Getting a User Profile
We can get a user profile by the route `/user/profile/{username}`. where `username` is the username of user. To get only the posts of one user first a search query is made in user collection using the `model.findOne()` method by the parameter of username to get the user. Then another query is made in posts collection by `model.find()` method by passing the parameter as `{userId : user._id}` which gives an array of posts by that user. This is all done in a try catch block.
```javascript
try {
        let authenticated = false;  //initially user will be unauthenticated 
        const user = await User.findOne({
            username: req.params.username
        });
        if (req.user._id.toString() === user._id.toString()) {  //this condition would Authenticate the user
            authenticated = true;   
        }
        const posts = await Post.find({
            userId: user._id
        });
        res.render("user-profile", {  //passing variables to ejs 
            posts: posts,
            user: user,
            currentUser: req.user,
            authenticated: authenticated,
        });
    } catch (error) {
        console.log("an error occured",error);
    }
```

## Admin Privellages
If a user is an admin he can edit and delete his put but if someone posts or comments vulgur content, an admin can **delete** the post or comment directly. This made by statement where user can be authenticated (Logged in) or can be an admin
```javascript
if (post.userId.toString() === req.user._id.toString() || req.user.isAdmin) {
            await Post.findByIdAndDelete(post._id);
            console.log("post Deleted");
            res.redirect("/newsfeed");
        }
```
Try with admin credentials
username:admin
password:admin

Compare using Normal account
username:lorem
password:lorem


> By default, a normal account is created

Here if the userId stored in the post to be deleted is equal to the logged in user he/she is authenticated and can delete a post also there is an or condition that if the current user (logged in user) is an admin he can delete the post.


## Updating Profile Photo, D.O.B and about

Profile photo, D.O.B and about is not a required field when we register an account these can be later updated through the edit option present in profile page. 
Here photos are stored in cloudinary and the link to the stored photo is saved in user profile. By default an avater is already saved with other details so that something can appear on the profile. The profile photo can be updated and would be refleted on all future posts.
The D.O.B is initially empty but can be later upadated and would then show the age of user by calculation through timestamp from `new Date()` in javascript
```ejs
<%if(user.dob){%>
        <%const dob = new Date(user.dob); const today= new Date();%>

        <h6>Age: <%=Math.floor((today-dob)/(1000*60*60*24*365))%> years</h6>
        <%}%>
```


## Like a post
If we click on like button a post request would be made at `/like/{post_id}` where `post_id` is the id of that post. A query would first find a post with that id then it would add id of the user to the likes array in the post.
```javascript
    try {
        const post = await Post.findById(req.params.id);  //req.params.id => post_id recieved 
        if (!post.likes.includes(req.user._id)) {  //checking if the post was already liked
            console.log("Was not Liked");
            await post.updateOne({              
                $push: {                                // adding user_id to likes array
                    likes: req.user._id
                }
            });

        } else {
            console.log("Was Liked");
            await post.updateOne({
                $pull: {
                    likes: req.user._id                 // removing user_id to likes array
                }
            });
        }
        res.redirect("/newsfeed");
    } catch (error) {
        console.log("Error Occured while liking or disliking", error);;
    }
```

## CRUD Operations on a comment
Post schema consist of a field named comments with a type of array. Comments are stored here in the form an object with many key value pairs storing comment details.
A comment can be added by making a post request at `/comment/add/{id}` where `{id}` is the post id.
A comment object looks like this
```javascript
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
```
To Update a comment the old post has to be remove dand a new post has to be added
To remove a comment user `$pull` instead of `$push`.

## Search/Filter Queries
There are two search/Filter options
- Search User
This query will search all the User and will give a list of users having the Exact First name.

- Filter By Location
Both the schemas store location in them. When a post is created the current location of user is stored in a postand will appear in the posts. One can filter by these value by searching the exact location (mostly country). 

## Follow/Unfollow a user
This option appear on the user profile page. If the user is in its own profile page then instead of Follow / Unfollow option Edit option will be availble which can update user details. By clicking on the follow unfollow button the user who clicked is addedd as a follower in the other user and the other user will appear in his followings. Basically userid is added/removed in both followers and followings array.




## Jai WebD!
