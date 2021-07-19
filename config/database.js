const mongoose = require("mongoose");

require("dotenv").config();

const connectionURL = process.env.MONGODB_STRING;

const connection = mongoose.createConnection(connectionURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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


const User = connection.model("User", UserSchema);

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
  location: String,
  userPicture: String,
}, {
  timestamps: true
});

const Post = connection.model("Post", PostSchema);

// Expose the connection
module.exports = connection;