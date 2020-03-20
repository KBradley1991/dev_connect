const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
const { check, validationResult } = require("express-validator");
const config = require("config");
const Axios = require("axios");

//@route GET api/profile/me
//@desc get user profile details
//@access private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({
        msg: "No profile found for this user"
      });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error here"
    });
  }
});

//@route POST api/profile/
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
      return res.status(400).json({ error: errors.array() });
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

//@route GET api/profile/
//@desc get profiles
//@access public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//@route GET api/profile/user/:user_id
//@desc get profile by user id
//@access public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile)
      return res.status(400).json({ msg: "No user found for this user id" });

    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "No user found for this user id" });
    res.status(500).json({ error: "Server error" });
  }
});

//@route DELETE api/profile
//@desc get profile & user by user id
//@access private
router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.status(200).json({ msg: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//@route PUT api/profile/experience
//@desc add user work expeirance to profile
//@access private
router.put(
  "/experience",
  auth,
  [
    check("title", "title is required")
      .not()
      .isEmpty(),
    check("company", "company is required")
      .not()
      .isEmpty(),
    check("from", "from date is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }
    //get work experience data from request body
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;
    //create the work experience object to submit for mongoo
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };
    //submit work experience to mongo
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err);
      res.status(400).json({ msg: "Error saving the experience" });
    }
  }
);

//@route DELETE api/profile/experience/:experience_id
//@desc delete experience based on experience ID
//@access private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get the index to remove
    const getExpIndexId = profile.experience
      .map(exp => exp.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(getExpIndexId, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "No work experience Id found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

//@route PUT api/profile/education
//@desc add user education to profile
//@access private
router.put(
  "/education",
  auth,
  [
    check("school", "school is required")
      .not()
      .isEmpty(),
    check("degree", "degree is required")
      .not()
      .isEmpty(),
    check("fieldofstudy", "field of study is required")
      .not()
      .isEmpty(),
    check("from", "from date is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }
    //get work experience data from request body
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;
    //create the work experience object to submit for mongoo
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };
    //submit work experience to mongo
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err);
      res.status(400).json({ msg: "Error saving the education" });
    }
  }
);

//@route DELETE api/profile/education/:education_id
//@desc delete experience based on experience ID
//@access private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get the index to remove
    const getEduIndexId = profile.education
      .map(edu => edu.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(getEduIndexId, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId") {
      res.status(400).json({ msg: "No education Id found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

//@route Get api/profile/github/:username
//@desc get users github repos
//@access public
router.get("/github/:username", async (req, res) => {
  try {
    const response = await Axios.get(
      `https://api.github.com/users/${req.params.username}/repos`,
      {
        headers: {
          // "User-Agent": "KBradley1991",
          Authorization: {
            user: config.get("github_Client_ID"),
            password: config.get("github_Client_Secret")
          }
          /*
          Authorization: `${config.get("github_Client_ID")}:${config.get(
            "github_Client_Secret"
          )}`
          */
        },
        params: {
          sort: "created",
          per_page: "2"
        }
      }
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "No github username found" });
  }
});

module.exports = router;
//expermental
//class to create profile object never used anyware
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
