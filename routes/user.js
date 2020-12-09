const express = require('express'),
  router = express.Router(),
  userHandler = require('../handlers/userHandler');
router.post('/login', userHandler.login);
router.get('/login/status', userHandler.getLoginStatus);
router.get('/login', userHandler.setCookieToBrowser);

module.exports = router;
