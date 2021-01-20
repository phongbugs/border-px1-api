const express = require('express'),
  router = express.Router(),
  deploymentHandler = require('../handlers/deploymentHandler');
router.post('/upload-file-to-express', deploymentHandler.uploadFileToExpress);
router.post('/upload-file-to-iis', deploymentHandler.uploadFileToIIS);
router.get('/date-modified-files', deploymentHandler.fetchDateModifiedFiles);
module.exports = router;
