const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }
    res.status(200).json({ message: "User registered sucesfully" });
    console.log(req.body);
  }
);

module.exports = router;
