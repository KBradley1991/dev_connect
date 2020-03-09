const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/Users");
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");

//@route POST api/users
//@desc Register user route
//@access public
router.post(
  "/",
  [
    check("name", "name is required")
      .not()
      .isEmpty(),
    check("email", "please include an Email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //deconstruct user object
    const { name, email, password } = req.body;
    try {
      //check if the user exsist
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ message: "User Already Exsist" }] });
      }
      //create the avatar using gravitar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      //create the user instance
      user = new User({
        name,
        email,
        password,
        avatar
      });
      //hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //save user to DB
      await user.save();
      res.status(200).json({ message: "User registered sucesfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: "Server Error" });
    }
    console.log(req.body);
  }
);

module.exports = router;
