require("express-async-errors");
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const morgan  = require("morgan");
const muter = require("multer");
const path = require("path")
const _pinx = require("./Logics/pinsClass");
var req = require("request");
var https = require("http");
var axios = require("axios");
var Nexmo = require("nexmo");
var app = express();
var jwt = require("jsonwebtoken")
const winston = require("winston");
const asyncMiddleWare = require("./middleware/error.middleware");
//var auth = require("./auth");

var connect = mongoose.connect("mongodb://localhost:27017/pins");
var ConnectionObject={}
connect.then((res)=>{
    ConnectionObject.status = res;

}).catch((er)=>{
    ConnectionObject.error = er;
})
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
var obj;

var modelPins = new mongoose.Schema({
    DateCreated:Date,
    pins:{
        type:String,
        validate:{
            validator:function(v){
                var ind = [1,9,5]
                var _first = ''+v;
                var first = _first[0];
                return _first.length > 0 && !(ind.includes(first))
            },
            msg:"Error please treat"
        }
    
    },
    isUsed:Boolean
})

var pins  = mongoose.model("pins", modelPins);

function createPin(_pins, len=0){
    return new Promise((resolve, reject)=>{
        if(len ==0){
            reject("Pin minimum length is 3")
        }
        else {
            var result = pins.create({
                isUsed:false,
                DateCreated:new Date(),
                pins:_pins
            })

            result.then((res)=>{
                resolve(res)
            }).catch((er)=>{
                reject(er)
            })
        }
    })
}

 winston.add(winston.transports.File);
        //winston.log({})


app.get("/token/:user/:pass", asyncMiddleWare(async(req, res)=>{
    if((req.params.user != null || req.params.user != '') && (req.params.pass != null || req.params.pass != '')){
        //winston.log()
       throw new Error("testing winston...")
        var _now = new Date();
        var token = {
            "user":req.params.user,
            "pass":req.params.pass,
            "expire":_now.setMinutes(_now.getMinutes() + 10)
        }


        var _token = jwt.sign(token, "olatunde");

        res.setHeader("x-auth-token", _token);

        res.status(200).send(_token)

    }
    else {
        res.status(400).send("authentication paramters missing...")
    }
}))

/*
app.use((req, res, next)=>{
    const token = req.header("x-auth-token");
    if(typeof(token) !== "undefined" || token != null){
        var ijk = jwt.verify(token, "olatunde");
        
        req.user = ijk;
        next();

    }
    else {
        res.status(400).send("token missing.....")
    }
})
*/

app.get("/allpins", (req, res)=>{
    if(req.headers["x-auth-token"] != null){
        var token = req.headers["x-auth-token"]
       var obj = jwt.verify(token, "olatunde");
       var _time =obj.expire
       var _expr = new Date(_time)
       var _now = new Date()
       console.log(obj)
console.log(_expr)
console.log(_now)
       if(_now < _time){
            
            pins.find((er, ress)=>{
                 if(!er){
                    res.setHeader("Content-Type", "application/json");
                    res.status(400).send({responseCode:""+00, message:"success", responseData:ress})
                }
                else {
                    res.setHeader("Content-Type", "application/json");
                    res.status(400).send({responseCode:99, message:er})
                }
            })
       }
       else {
            res.setHeader("Content-Type", "application/json");
            res.status(400).send({responseCode:99, message:"token expired"})
       }
      
    }
    else {
        res.setHeader("Content-Type", "application/json");
        res.status(400).send({responseCode:99, message:"token missed..."})
    }
})
app.post("/decode",(req, res)=>{
    if(req.headers["x-auth-token"] != null){
        var ijk = jwt.verify(req.headers["x-auth-token"], "olatunde");
        res.setHeader("Content-Type", "application/json");
        res.status(200).send({token:ijk})
    }
    else {
        res.status(400).send("token is missing...")
    }
})
app.get("/pin/:size",  asyncMiddleWare(async(req, res)=>{
    if(req.params.size != null || req.params.size != '') {
        var rnd = new _pinx(req.params.size);
            res.setHeader("Content-Type", "application/json")
            var obj ={
                pin:rnd.generateIdUpdate(req.params.size),
                token:req.user
            }
        res.status(200).send(obj);
    }
    else {
        res.status(400).send("please supply length")
    }


}))

app.get("/", asyncMiddleWare(async(req, res)=>{
    var message = ``;
    if(ConnectionObject.status != null || typeof(ConnectionObject.status) !== "undefined"){
        message = `Connectied....${ConnectionObject.status}`
    }
    else {
        message = `Connection Failed....`
    }
    
    //console.log(ConnectionObject.status)
    var ki;

    axios.default.get("http://localhost:4900/pin/12").then((ress)=>{
        console.log(ress.data);
        ki = ress.data;
        res.render("index", {"message":message, pins:ress.data.pin})
    }).catch((err)=>{

    })
    
    
}))

app.post("/",asyncMiddleWare(async(req, res)=>{
    //console.log(req.body)
    var ki = "";
    axios.default.get("http://localhost:4900/pin/12").then((response)=>{
        ki=response.data;
    })
    console.log(ki)

    if(req.body.dbName != ''){
        createPin(req.body.dbName, 20).then((er)=>{
            res.render("index", {message:`${req.body.dbName} created...`, pins:ki})
        }).catch((er)=>{
            res.render("index", {message:er, pins:ki})
        })
    }
    else {
        res.render("index", {message:"generate pin to continue...", pins:ki})
    }
}))


app.post("/nexmo", (req, res)=>{
    const NEXMO_API_KEY = "52adceea"
    const NEXMO_API_SECRET = "QCfMWqmCtCAZ7jKt"
    const from ="+12016902202";
    const to  ="+2347064265908"
    var text = req.body.message;
    var ns = new Nexmo({
            apiKey: NEXMO_API_KEY,
            apiSecret: NEXMO_API_SECRET
    })
    ns.message.sendSms(from, to, text, (err, responseData) => {
        
        if (err) {
            console.log(err);
            res.status(200).send(err)
        } else {
            if(responseData.messages[0]['status'] === "0") {
                res.status(200).send("Message sent successfully")
                console.log("Message sent successfully.");
            } else {
                res.send(`Message failed with error: ${responseData.messages[0]['error-text']}`)
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    })

})

app.use((er, req, res, next)=>{
    console.log(er)

    res.status(400).send(er)

})

app.listen(4900, ()=>console.log("started...."))




