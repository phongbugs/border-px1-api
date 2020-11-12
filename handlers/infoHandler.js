const log = console.log,
  crawler = require('../crawler'),
  fetchBackendId = async (req, res) => {
    try {
      log(req.params.serverId);
      let serverId = req.params.serverId,
        cookie = req.body.cookie;
      log('serverId: %s', serverId);
      if (cookie) {
        let result = await crawler.fetchBackendId(serverId, [cookie]);
        if (result.success)
          res.send({
            success: true,
            backendId: result.backendId,
          });
        else res.send({ success: false, message: result.message });
      } else res.send({ success: false, message: 'Cookie do not exits' });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  };

module.exports = { fetchBackendId };
