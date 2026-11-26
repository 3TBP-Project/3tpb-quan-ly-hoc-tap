const toPublicError = (error, fallbackMessage, context) => {
  const statusCode = Number.isInteger(error?.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode < 500
    ? error.statusCode
    : 500;

  if (statusCode === 500) {
    console.error(context, error);
    return { statusCode, message: fallbackMessage };
  }

  return {
    statusCode,
    message: error.message || fallbackMessage
  };
};

module.exports = { toPublicError };
