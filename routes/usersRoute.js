var express = require('express');
var router = express.Router();
var {usersignup, viewalluser, loginuser, forgotPassword, resetpassword, }=require("../controller/userController")

router.post("/signup",usersignup)
router.post("/login",loginuser)
router.post("/forgetpassword",forgotPassword)
router.post("/reset_password",resetpassword)
router.get("/getalluser",viewalluser)


module.exports = router;
