import utils from '../assets/utils.js';

export default (req, res) => {
  const { startTime, accept } = utils.initialize(req, res);
  try {
    utils.send404(accept, res, startTime);
  } catch (e) {
    utils.send500(accept, res, startTime, e);
  }
};
