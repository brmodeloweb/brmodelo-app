const express = require("express");
const bodyParser = require("body-parser");
const userService = require("./service");
const userValitor = require("./validator");

const router = express.Router();
router.use(bodyParser.json());

const userCreate = async(req, res) => {
  try {
    const username = req.body.username;
    const mail = req.body.email;
    const password = req.body.password;

    const validation = userValitor.validateSignUpParams({username, mail, password});

    if(!validation.valid) {
      return res.status(422).send(validation.message);
    }
  
    const createdUser = await userService.create({username, mail, password});

    return res.status(200).json(createdUser);
  } catch (error) {
    console.error(error);
    if(error.code == 'USER_ERROR_ALREADY_EXISTS') {
      return res.status(409).send("User alredy exists")
    }
    return res.status(500).send("There's an error while treating your sign-up request");
  }
}

module.exports = router
  .post("/create", userCreate);