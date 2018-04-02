var router = require('express').Router();

var serverData = require('../serverData');

// GET data
router.get('/', function(req, res, next) {
    res.json(serverData.appData);
});

module.exports = router;
