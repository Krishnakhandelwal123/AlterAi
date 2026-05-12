import { AuthError } from '../middleware/errorHandler.js';

export const parseVerifyTokenBody = (body) => {
  const accessToken = body?.access_token;

  if (typeof accessToken !== 'string' || !accessToken.trim()) {
    throw new AuthError('No token provided');
  }

  return { accessToken: accessToken.trim() };
};
