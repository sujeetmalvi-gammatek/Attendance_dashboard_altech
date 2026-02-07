// ====================== SUCCESS RESPONSES ======================

// 200 - OK
async function success(res, message, items = {}) {
  await sendResponse(res, 200, true, message, "", items);
}

// 201 - CREATED
async function created(res, message, items = {}) {
  await sendResponse(res, 201, true, message, "", items);
}

// ====================== ERROR RESPONSES ======================

// 400 - BAD REQUEST
async function badRequest(res, message, errorDetails = {}) {
  await sendResponse(res, 400, false, message, errorDetails, {});
}

// 401 - UNAUTHORIZED
async function unauthorized(res, message) {
  await sendResponse(res, 401, false, message, "", {});
}

// 404 - NOT FOUND
async function notFound(res, message, data = {}) {
  const responseData = Array.isArray(data) ? data : {};
  await sendResponse(res, 404, false, message, "", responseData);
}

// 500 - UNKNOWN ERROR
async function unknownError(res, error) {
  console.log("SERVER ERROR:", error);

  const errMessage =
    error?.message ||
    "Something went wrong, please try again later";

  await sendResponse(res, 500, false, errMessage, "ServerError", {});
}

// ================= VALIDATION (MANUAL) ==================
async function validationError(res, fieldErrors = {}) {
  await sendResponse(
    res,
    400,
    false,
    "Validation Failed",
    "ValidationError",
    fieldErrors
  );
}

// =============== DUPLICATE CHECK FOR SQL ===============
function sqlDuplicateKey(error) {
  if (!error || !error.message) return null;

  if (error.message.includes("duplicate") || error.message.includes("UNIQUE")) {
    return "Duplicate value not allowed";
  }

  return null;
}

// ===================== SEND RESPONSE ========================
async function sendResponse(res, statusCode, status, message, error, items) {
  const jsonResponse = {
    status,
    subCode: statusCode,
    message,
    error,
    items,
  };

  res.status(statusCode).json(jsonResponse);
}

// ===================== PARSE JWT ============================
function parseJwt(data) {
  try {
    let token = data.slice(7);
    const decode = Buffer.from(token.split(".")[1], "base64");
    const toString = decode.toString();
    return JSON.parse(toString);
  } catch (e) {
    return null;
  }
}

// ===================== EXPORTS =============================
module.exports = {
  success,
  created,
  badRequest,
  notFound,
  unauthorized,
  unknownError,
  validationError,
  sqlDuplicateKey,
//   parseJwt,
};
