const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
const { check, validationResult } = require("express-validator");

//@route get api/profile/
//@desc get user profile details
//@access private
router.get("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      res.status(400).json({
        msg: "No profile found for this user"
      });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error"
    });
  }
});

//@route post api/profile/
//@desc create or update profile
//@access private
router.post(
  "/",
  auth,
  [
    check("status", "status is required")
      .not()
      .isEmpty(),
    check("bio", "bio is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    }
    //get profile data from request body
    const {
      company,
      website,
      location,
      bio,
      status,
      githubUsername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedIn
    } = req.body;
    console.log(req.body);
    //build user profile object
    const profileUser = {};
    profileUser.user = req.user.id;
    if (company) profileUser.company = company;
    if (website) profileUser.website = website;
    if (location) profileUser.location = location;
    if (bio) profileUser.bio = bio;
    if (status) profileUser.status = status;
    if (githubUsername) profileUser.githubUsername = githubUsername;
    if (skills)
      profileUser.skills = skills.split(",").map(skill => skill.trim());
    //set profile socila details
    profileUser.social = {};
    if (youtube) profileUser.social.youtube = youtube;
    if (facebook) profileUser.social.facebook = facebook;
    if (twitter) profileUser.social.twitter = twitter;
    if (instagram) profileUser.social.instagram = instagram;
    if (linkedIn) profileUser.social.linkedIn = linkedIn;
    try {
      //check if profile exsist and updates profile
      console.log(req.user.id);
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        console.log();
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileUser },
          { new: true }
        );
        return res.status(200).json(profile);
      }
      //create new profile
      profile = new Profile(profileUser);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err);
      res.status(400).json({ msg: "Unable to create / update profile" });
    }
  }
);
module.exports = router;

//expermental
class ProfileCreator {
  constructor(id, body) {
    const {
      company,
      website,
      location,
      bio,
      status,
      githubUsername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedIn
    } = body;
    this.user = id;
    if (company) this.company = company;
    if (website) this.website = website;
    if (location) this.location = location;
    if (bio) this.bio = bio;
    if (status) this.status = status;
    if (githubUsername) this.githubUsername = githubUsername;
    if (skills) this.skills = skills.split(",").map(skill => skill.trim());
    if (youtube) this.youtube = youtube;
    if (facebook) this.facebook = facebook;
    if (twitter) this.twitter = twitter;
    if (instagram) this.instagram = instagram;
    if (linkedIn) this.linkedIn = linkedIn;
  }
}
