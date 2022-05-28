'use strict';
import * as utils from '../assets/utils.js';
export default (req, res) => {
  const startTime = Date.now();
  try {
    if (utils.getAccept(req) === 1) {
      res.status(404).send(utils.render404(startTime));
    } else {
      res.status(404).json({code: -404});
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(utils.render500(startTime));
  }
};
