const express = require('express'),
  router = express.Router(),
  authentiocationHandler = require('../handlers/authenticationHandler');
router.post('/', authentiocationHandler.authenticate);
router.get('/status', authentiocationHandler.isAuthenticated);
router.get('/', authentiocationHandler.setCookieToBrowser);

module.exports = router;
