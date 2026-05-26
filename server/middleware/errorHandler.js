export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export const errorHandler = (error, req, res, _next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  let status = Number(error.statusCode || error.status || 500);
  if (error.type === 'entity.parse.failed' || /parsing the body/i.test(error.message || '')) {
    status = 400;
    error.message =
      'Upload could not be read. Refresh the page and try again. If this persists, restart the API server.';
  }
  if (error.name === 'ValidationError') status = 400;
  if (error.name === 'AuthError') status = 401;
  if (error.name === 'NotFoundError') status = 404;

  const payload = { error: error.message || 'Internal server error' };
  if (isDev) payload.stack = error.stack;

  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  res.status(status).json(payload);
};
