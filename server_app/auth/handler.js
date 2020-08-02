const express = require("express");
const bodyParser = require("body-parser");
const authService = require("./service");
const userValitor = require("../user/validator");
const router = express.Router();
router.use(bodyParser.json());

const login = async(req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const sessionId = req.sessionID;

    const validation = userValitor.validateLoginParams({username, password});

    if(!validation.valid) {
      return res.status(422).send(validation.message);
    }
      
    const user = await authService.login({username, password});
  
    if (user == null) {
      return res.status(404).send("User not found");
    }
  
    return res.status(200).json({...user, "sessionId": sessionId});
  } catch (error) {
    console.error(error);
    return res.status(500).send("There's an error while treating your login request");
  }
}

module.exports = router
  .post("/login", login);