const express = require('express'),
  router = express.Router(),
  infoHandler = require('../handlers/infoHandler'),
  authMiddleware = require('../middlewares/authMiddleware');
router.post('/backendId/:domainType/:serverIp', infoHandler.fetchBackendId);
router.get('/domain/:domainType/:siteName', infoHandler.fetchDomains);
router.get('/valid-domain/:client/:domainType/:whitelabelName', infoHandler.getValidDomain);
router.post('/valid-domain/:client/:domainType', infoHandler.updateValidDomains);
router.get('/server/:domainType/:siteName', infoHandler.fetchServers);
router.get('/folder', authMiddleware, infoHandler.fetchFolderPath);
router.get('/mobile/', authMiddleware, infoHandler.fetchMobileJson);
router.get('/server/', infoHandler.getServerInfo);
router.get('/temppage/', authMiddleware, infoHandler.fetchTempPage);
router.get('/', (_, res) => res.send('info root page'));
module.exports = router;
