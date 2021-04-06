const express = require('express'),
  router = express.Router(),
  userHandler = require('../handlers/userHandler');
router.post('/login', userHandler.login);
router.get('/login', userHandler.setCookieToBrowser);
router.get('/login/status', userHandler.getLoginStatus);
module.exports = router;
