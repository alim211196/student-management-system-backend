require("dotenv").config();
const express = require("express");
const router = new express.Router();
const Post = require("../models/post");
const PostUser = require("../models/PostUser");
//post api

//add post api
router.post("/posts", async (req, res) => {
  const post = new Post(req.body);
  try {
    await post.save();
    res.status(201).send("Post added successfully");
  } catch (err) {
    if (err.code === 11000) {
      // This error code indicates a duplicate key (email or phone)
      res.status(400).send("Email or phone already exists.");
    } else {
      // Handle other errors
      console.error(err);
      res.status(500).send("Internal server error.");
    }
  }
});

//get all posts
router.get("/posts", async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 });
    res.status(200).send(post);
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get post by id
router.get("/posts/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Post.findById(_id);
    if (!result) {
      return res.status(404).send("Post not found.");
    } else {
      res.status(200).send(result);
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//update post
router.patch("/posts/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Post.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    if (!result) {
      return res.status(404).send("Post not found.");
    } else {
      res.status(200).send("Post updated successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//delete post
router.delete("/posts/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Post.findByIdAndDelete(_id);
    if (!result) {
      return res.status(404).send("Post not found.");
    } else {
      res.status(200).send("Post deleted Successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//add user api
router.post("/posts/user-register", async (req, res) => {
  const user = new PostUser(req.body);
  try {
    await user.save();
    const userId = user?._id;
    res.status(201).send(userId);
  } catch (err) {
    if (err.code === 11000) {
      // This error code indicates a duplicate key (email or phone)
      res.status(400).send("Email or phone already exists.");
    } else {
      // Handle other errors
      console.error(err);
      res.status(500).send("Internal server error.");
    }
  }
});

//create login api
router.post("/posts/user-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await PostUser.findOne({ email: email });
    if (user.password === password) {
      const userId = user?._id;
      res.status(201).send(userId);
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get user by id
router.get("/posts/get-user/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await PostUser.findById(_id);
    if (!result) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send(result);
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
