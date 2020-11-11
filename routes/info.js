const express = require('express'),
  router = express.Router(),
  infoHandler = require('../handlers/infoHandler');
router.post('/backendId/:serverId', infoHandler.fetchBackendId);
router.get('/', (_, res) => res.send({"dsdsds": "sdsdsdsd"}));
module.exports = router;
