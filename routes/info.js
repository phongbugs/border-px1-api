const express = require('express'),
  router = express.Router(),
  infoHandler = require('../handlers/infoHandler');
router.post('/backendId/:serverIp', infoHandler.fetchBackendId);
router.get('/domain/:siteName', infoHandler.fetchDomains);
router.get('/', (_, res) => res.send("info root page"));
module.exports = router;
