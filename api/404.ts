export const config = { runtime: 'edge' };

import utils from '../assets/utilities';

export default (req: Request): Response => {
  const { accept } = utils.initialize(req);
  try {
    return utils.send404(accept);
  } catch (e) {
    return utils.send500(accept, e);
  }
};
