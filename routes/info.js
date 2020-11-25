const express = require('express'),
  router = express.Router(),
  infoHandler = require('../handlers/infoHandler');
router.post('/backendId/:serverId', infoHandler.fetchBackendId);
router.get('/domains/:siteName', infoHandler.fetchDomains);
router.get('/', (_, res) => res.send("info root page"));
module.exports = router;
