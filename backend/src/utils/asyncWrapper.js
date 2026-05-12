/**
 * Eliminates boiler-plate try-catch blocks in controller actions.
 * Forwards any synchronous or asynchronous error directly to the next() handler.
 * 
 * @param {Function} fn - Express middleware or controller action
 * @returns {Function} - Express route handler
 */
export const asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
