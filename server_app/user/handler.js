const express = require("express");
const bodyParser = require("body-parser");
const userService = require("./service");
const userValitor = require("./validator");

const router = express.Router();
router.use(bodyParser.json());

const userLogin = async(req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const sessionId = req.sessionID;

    const validation = userValitor.validateLoginParams({username, password});

    if(!validation.valid) {
      return res.status(422).send(validation.message);
    }
      
    const user = await userService.login({username, password});
  
    if (user == null) {
      return res.status(404).send("User not found");
    }
  
    return res.status(200).json({...user, "sessionId": sessionId});
  } catch (error) {
    console.error(error);
    return res.status(500).send("There's an error while treating your login request");
  }
}

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
      return res.status(409).send("Usuário já existente!")
    }
    return res.status(500).send("Ocorreu um erro no tratamento do seu request!");
  }
}

const userRecovery = async(req, res) => {
  try {
    console.log("opa");
    const email = req.body.email;
    console.log(email);
  
    const createdUser = await userService.recovery(email);

    return res.status(200).json(createdUser);
  } catch (error) {
    console.error(error);
    if(error.code == 'USER_DO_NOT_EXISTS') {
      return res.status(409).send("Usuário não existente!")
    }
    return res.status(500).send("Ocorreu um erro no tratamento do seu request!");
  }
}

module.exports = router
  .post("/create", userCreate)
  .post("/login", userLogin)
  .post("/recovery", userRecovery);