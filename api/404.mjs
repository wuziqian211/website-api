'use strict';
import * as utils from '../assets/utils.mjs';
export default (req, res) => {
  const startTime = Date.now();
  try {
    const accept = req.headers.accept || '*/*';
    if (accept.indexOf('html') !== -1 || req.headers['sec-fetch-dest'] === 'document') {
      res.status(404).send(utils.render404(startTime));
    } else {
      res.status(404).json({code: -404});
    }
  } catch {
    res.status(500).send(utils.render500(startTime));
  }
};
