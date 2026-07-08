import * as utils from '../assets/utils.js';

export default {
  fetch(req: Request): Response {
    const session = utils.initialize(req, { acceptedResponseTypes: [0, 1] });

    try {
      return utils.send404(session);
    } catch (e) {
      return utils.send500(session, e);
    }
  },
};
