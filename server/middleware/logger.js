const color = (status) => {
  if (status >= 500) return '\x1b[31m';
  if (status >= 400) return '\x1b[31m';
  if (status >= 300) return '\x1b[33m';
  return '\x1b[32m';
};

export const logger = (req, res, next) => {
  if (req.path === '/health') return next();

  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const diffMs = Number(process.hrtime.bigint() - start) / 1e6;
    const c = color(res.statusCode);
    const reset = '\x1b[0m';
    // eslint-disable-next-line no-console
    console.log(`${c}${req.method} | ${req.originalUrl} | ${res.statusCode} | ${diffMs.toFixed(1)}ms${reset}`);
  });
  next();
};
