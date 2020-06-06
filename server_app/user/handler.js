const express = require("express");
const bodyParser = require("body-parser");
const userService = require("./service");

const router = express.Router();
router.use(bodyParser.json());

const userLogin = async(req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const sessionId = req.sessionID;
    
    if(username == "") {
      res.status(422).send("Missig username");
    }
  
    if(password == "") {
      res.status(422).send("Missig password")
    }
  
    const userSession = await userService.login({username, password, sessionId});
  
    if (userSession == null) {
      return res.status(404).send("User not found");
    }
  
    res.status(200).json(userSession);
  } catch (error) {
    console.error(error);
    res.status(500).send("There's an erro while to treat your request, try again later");
  }
}

const userCreate = async(req, res) => {
  res.status(201).json({});
}

module.exports = router
  .post("/login", userLogin);