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
  try {
    const username = req.body.username;
    const mail = req.body.email;
    const password = req.body.password;

    if(username == "") {
      res.status(422).send("Missig username");
    }
  
    if(mail == "") {
      res.status(422).send("Missig mail")
    }

    if(password == "") {
      res.status(422).send("Missig password")
    }
  
    const createdUser = await userService.create({username, mail, password});

    res.status(200).json(createdUser);
    
  } catch (error) {
    console.error(error);
    if(error.code == 'USER_ERROR_ALREADY_EXISTS') {
      res.status(409).send("User alredy exists")
    }
    res.status(500).send("There's an error while treating your request, try again later");
  }
}

module.exports = router
  .post("/create", userCreate)
  .post("/login", userLogin);