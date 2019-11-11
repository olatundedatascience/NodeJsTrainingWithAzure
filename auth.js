var jwt = require("jsonwebtoken");
var key ="olatunde";
var express = require("express");
var app = express();


/*

function auth(req, res, next){
    const token = req.header("x-auth-token");
    if(typeof(token) !== "undefined" || token != null){
        var ijk = jwt.verify(token, "olatunde");
        
        req.user = ijk;
        next();

    }
    else {
        res.status(400).send("token missing.....")
    }
}

*/

//module.exports = auth;