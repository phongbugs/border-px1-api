const express = require('express'),
  router = express.Router(),
  userHandler = require('../handlers/userHandler');
router.post('/login', userHandler.login);

module.exports = router;
