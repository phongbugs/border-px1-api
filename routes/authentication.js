const express = require('express'),
  router = express.Router(),
  authentiocationHandler = require('../handlers/authenticationHandler');
router.post('/', authentiocationHandler.authenticate);
router.get('/status/:domainType', authentiocationHandler.isAuthenticated);
router.get('/:domainType', authentiocationHandler.setCookieToBrowser);

module.exports = router;
