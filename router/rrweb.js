let express = require('express');
let router = express.Router();
let request = require('request');
let conf = require('../libs/conf')
let {logger} = require('../libs/logger')
module.exports = router;

router.get("/", function (req, res, next) {
    res.json({msg: "hello rr_web_server"})
})
