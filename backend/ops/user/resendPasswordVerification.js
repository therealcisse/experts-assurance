import { formatError } from '../utils';

export default async function resendVerificationEmail(request, response) {
  const { email } = request.params;

  if (!request.user) {
    response.error(new Error('A user is required.'));
    return;
  }

  request.user.set({ email });
  try {
    await request.user.save(null, { useMasterKey: true, sessionToken: request.user.sessionToken });
    response.success({});
  } catch (e) {
    response.error(formatError(e));
  }
};

