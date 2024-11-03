export const config = { runtime: 'edge' };

import * as utils from '../assets/utils.js';

export default (req: Request): Response => {
  const { responseType } = utils.initialize(req, [0, 1]);
  try {
    return utils.send404(responseType);
  } catch (e) {
    return utils.send500(responseType, e);
  }
};
