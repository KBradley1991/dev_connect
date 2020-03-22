const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
const Post = require("../../models/Post");

//@route POST api/post
//@desc Create a post
//@access private
router.post(
  "/",
  auth,
  [
    check("text", "Text is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors) {
      return res.status(400).json({ msg: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();
      res.status(200).json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Error saving post" });
    }
  }
);

//@route GET api/post
//@desc Get all posts
//@access private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Unable to get posts" });
  }
});

//@route GET api/post/user/:user_id
//@desc Get posts by user id
//@access private
router.get("/user/:user_id", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.user_id }).sort({
      date: -1
    });
    if (posts.length === 0) {
      return res.status(400).json({ msg: "No posts found for this user id" });
    }
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "No posts found for this user id" });
    res.status(400).json({ msg: "Unable to get posts" });
  }
});

//@route GET api/post/:id
//@desc Get posts by post id
//@access private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No posts found for this id" });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "No posts found for this id" });
    res.status(400).json({ msg: "Unable to get posts" });
  }
});

//@route DELETE api/post/:id
//@desc Delete post by post id
//@access private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.user.id) {
      return res.status(400).json({ msg: "Not authorized" });
    }
    if (!post) {
      return res.status(404).json({ msg: "No posts found for this id" });
    }
    //const deletePost = await Post.findByIdAndDelete(req.params.id);
    post.remove();
    res.status(200).json({ msg: "Post removed" });
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "No posts found for this id" });
    res.status(400).json({ msg: "Unable to get posts" });
  }
});

//@route PUT api/posts/like/:id
//@desc like posts by post id
//@access private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "No posts found for this id" });
    }

    //create a array, to check if users already liked this post
    const chkUserId = post.likes.filter(
      like => like.user.toString() === req.user.id
    );
    if (chkUserId.length > 0) {
      return res.status(400).json({ msg: "User already liked this post" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "No posts found for this id" });
    res.status(500).json({ msg: "Unable to like post" });
  }
});

//@route PUT api/posts/unlike/:id
//@desc Unlike posts by post id
//@access private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "No posts found for this id" });
    }

    //create a array, to check if users already liked this post
    const chkUserId = post.likes.filter(
      like => like.user.toString() === req.user.id
    );
    if (chkUserId.length === 0) {
      return res.status(400).json({ msg: "User has not liked this post" });
    }
    const indexOfLike = post.likes.map(like => like.user).indexOf(req.user.id);
    post.likes.splice(indexOfLike, 1);
    await post.save();
    res.status(200).json({ msg: "Post unliked" });
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "No posts found for this id" });
    res.status(500).json({ msg: "Unable to like post" });
  }
});

//@route PUT api/posts/comments/:id
//@desc Add comments on post by post id
//@access private
router.put(
  "/comments/:id",
  auth,
  [
    check("text", "Please provide a text to comment")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const user = await User.findById(req.user.id).select("-password");

      if (!post) {
        return res.status(404).json({ msg: "No posts found for this id" });
      }
      //create new comment
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar
      };
      //add new comment
      post.comment.unshift(newComment);

      await post.save();
      res.status(200).json({ msg: post.comment });
    } catch (err) {
      console.error(err);
      if (err.kind == "ObjectId")
        return res.status(400).json({ msg: "No posts found for this id" });
      res.status(500).json({ msg: "Unable to comment on post" });
    }
  }
);

//@route DELETE api/posts/:post_id/:comment_id
//@desc Delete comments on post by post id & comment if
//@access private
router.delete("/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({ msg: "No posts found for this id" });
    }

    //check if comment exsist
    const checkCmtExsist = post.comment.find(
      comment => comment._id.toString() === req.params.comment_id
    );
    if (!checkCmtExsist) {
      return res
        .status(404)
        .json({ msg: "No comment found for this comment id" });
    }
    //check if user made comment
    if (checkCmtExsist.user.toString() !== req.user.id) {
      return res.status(400).json({ msg: "Not Authorized to delete comment" });
    }

    //delete comment
    const getIndexCmt = post.comment
      .map(comment => comment._id.toString())
      .indexOf(req.params.comment_id);

    post.comment.splice(getIndexCmt, 1);
    await post.save();
    res.status(200).json({ msg: post.comment });
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "No posts found for this id" });
    res.status(500).json({ msg: "Unable to delete comment on post" });
  }
});

module.exports = router;
