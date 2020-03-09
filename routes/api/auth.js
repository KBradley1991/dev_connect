const express = require("express");
const router = express.Router();
const config = require("config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const users = require("../../models/Users");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

//@route get api/auth
//@desc test route
//@access public
router.get("/", auth, async (req, res) => {
  try {
    console.log(req.user);
    const user = await users.findById(req.user.id).select("-password");
    res.status(400).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/",
  [
    check("email", "please include an Email").isEmail(),
    check("password", "Please enter a password").isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //deconstruct user object
    const { email, password } = req.body;
    try {
      //check if the user exsist
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ message: "Invalid credenitals" }] });
      }
      //check if password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ message: "Invalid credenitals" }] });
      }

      //create JWT webtoken and send token as response
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        config.get("jwt_secret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          return res.status(200).json({ token });
        }
      );
      //send sucessfull response
      //res.status(200).json({ message: "User registered sucesfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: "Server Error" });
    }
  }
);

module.exports = router;
