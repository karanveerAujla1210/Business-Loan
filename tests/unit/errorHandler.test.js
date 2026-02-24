const { AppError, errorHandler, catchAsync } = require('../../src/middlewares/errorHandler');

describe('ErrorHandler Middleware', () => {
  describe('AppError', () => {
    it('should create operational error with correct properties', () => {
      const error = new AppError('Test error', 404);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
      expect(error.status).toBe('fail');
    });

    it('should set status to error for 5xx codes', () => {
      const error = new AppError('Server error', 500);
      
      expect(error.status).toBe('error');
    });
  });

  describe('errorHandler', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        originalUrl: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        user: { id: 1 },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should handle operational errors in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new AppError('Not found', 404);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: 'Not found',
        api_version: '1.0',
      });
    });

    it('should hide non-operational errors in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Programming error');
      error.statusCode = 500;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: 'Something went wrong. Please try again later.',
        api_version: '1.0',
      });
    });
  });

  describe('catchAsync', () => {
    it('should catch async errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = catchAsync(asyncFn);
      const next = jest.fn();

      await wrappedFn({}, {}, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call function with req, res, next', async () => {
      const asyncFn = jest.fn().mockResolvedValue();
      const wrappedFn = catchAsync(asyncFn);
      const req = {};
      const res = {};
      const next = jest.fn();

      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    });
  });
});
