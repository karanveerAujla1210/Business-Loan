const { logger, requestLogger } = require('../../src/utils/logger');

describe('Logger Utility', () => {
  describe('logger', () => {
    it('should have required methods', () => {
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should log info messages', () => {
      const spy = jest.spyOn(logger, 'info');
      logger.info('Test message');
      expect(spy).toHaveBeenCalledWith('Test message');
      spy.mockRestore();
    });

    it('should log error messages with metadata', () => {
      const spy = jest.spyOn(logger, 'error');
      const error = new Error('Test error');
      logger.error('Error occurred', { error });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('requestLogger', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        method: 'GET',
        originalUrl: '/api/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
        user: { id: 1 },
      };
      res = {
        statusCode: 200,
        on: jest.fn(),
      };
      next = jest.fn();
    });

    it('should call next middleware', () => {
      requestLogger(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should register finish event listener', () => {
      requestLogger(req, res, next);
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should log request details on finish', () => {
      const spy = jest.spyOn(logger, 'info');
      
      requestLogger(req, res, next);
      
      const finishCallback = res.on.mock.calls[0][1];
      finishCallback();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
