export const config = { runtime: 'edge' };

import utils from '../assets/utilities.js';

export default (req: Request): Response => {
  const { responseType } = utils.initialize(req, [0, 1]);
  try {
    return utils.send404(responseType);
  } catch (e) {
    return utils.send500(responseType, <Error>e);
  }
};
