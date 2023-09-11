
require("dotenv").config();
const express = require("express");
const router = new express.Router();
const UserInfo = require("../models/userInfo");

//------userInfo-------------Expo app-------------//

//add user api
router.post("/user-info", async (req, res) => {
  const userInfo = new UserInfo(req.body);
  try {
    await userInfo.save();
    res.status(201).send("User added successfully");
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

//get all users
router.get("/user-info", async (req, res) => {
  try {
    const userInfo = await UserInfo.find().sort({ date: -1 });
    res.status(200).send(userInfo);
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get user by id
router.get("/user-info/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const userInfo = await UserInfo.findById(_id);
    if (!userInfo) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send(userInfo);
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//update post
router.patch("/user-info/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const userInfo = await UserInfo.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    if (!userInfo) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send("User updated successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//delete post
router.delete("/user-info/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const userInfo = await UserInfo.findByIdAndDelete(_id);
    if (!userInfo) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send("User deleted Successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
