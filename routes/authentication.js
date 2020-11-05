const express = require('express'),
  router = express.Router(),
  authentiocationHandler = require('../handlers/authenticationHandler');
router.post('/', authentiocationHandler.authenticate);
router.get('/', (_, res) => res.send({}));

module.exports = router;
