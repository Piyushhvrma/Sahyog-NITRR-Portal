const sendSuccess = (res, statusCode = 200, message = "Success", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const sendError = (
  res,
  statusCode = 500,
  message = "Internal server error.",
  errors = null
) => {
  const payload = {
    success: false,
    message,
  };

  if (errors) payload.errors = errors;

  return res.status(statusCode).json(payload);
};

const sendPaginated = (
  res,
  {
    message = "Data fetched successfully.",
    dataKey,
    data,
    page,
    limit,
    total,
    extra = {},
  }
) => {
  return res.status(200).json({
    success: true,
    message,
    [dataKey]: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
    ...extra,
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};