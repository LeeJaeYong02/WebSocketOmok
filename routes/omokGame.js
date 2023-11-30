var express = require('express');
var router = express.Router();

/* GET home page. */
router.get(['/', '/lobby'], function(req, res, next) {
  res.render('lobby');
});

router.get('/game/:roomId', function(req, res, next) {
  res.render('game', { roomId: req.params.roomId });
});

router.get('/test', function(req, res, next) {
  res.render('test');
});

module.exports = router;
