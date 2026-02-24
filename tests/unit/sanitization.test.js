const { sanitizeInput } = require('../../src/middlewares/sanitization');

describe('Sanitization Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };
    res = {};
    next = jest.fn();
  });

  it('should remove script tags from body', () => {
    req.body = {
      name: '<script>alert("xss")</script>John',
      email: 'test@example.com',
    };

    sanitizeInput(req, res, next);

    expect(req.body.name).toBe('John');
    expect(req.body.email).toBe('test@example.com');
    expect(next).toHaveBeenCalled();
  });

  it('should remove javascript: protocol', () => {
    req.body = {
      url: 'javascript:alert(1)',
    };

    sanitizeInput(req, res, next);

    expect(req.body.url).toBe('alert(1)');
  });

  it('should remove event handlers', () => {
    req.body = {
      html: '<div onclick="alert(1)">Click</div>',
    };

    sanitizeInput(req, res, next);

    expect(req.body.html).not.toContain('onclick');
  });

  it('should sanitize nested objects', () => {
    req.body = {
      user: {
        name: '<script>xss</script>Test',
        profile: {
          bio: 'javascript:void(0)',
        },
      },
    };

    sanitizeInput(req, res, next);

    expect(req.body.user.name).toBe('Test');
    expect(req.body.user.profile.bio).toBe('void(0)');
  });

  it('should sanitize arrays', () => {
    req.body = {
      items: ['<script>xss</script>Item1', 'Item2'],
    };

    sanitizeInput(req, res, next);

    expect(req.body.items[0]).toBe('Item1');
    expect(req.body.items[1]).toBe('Item2');
  });

  it('should trim whitespace', () => {
    req.body = {
      name: '  John Doe  ',
    };

    sanitizeInput(req, res, next);

    expect(req.body.name).toBe('John Doe');
  });

  it('should not modify non-string values', () => {
    req.body = {
      age: 25,
      active: true,
      data: null,
    };

    sanitizeInput(req, res, next);

    expect(req.body.age).toBe(25);
    expect(req.body.active).toBe(true);
    expect(req.body.data).toBe(null);
  });
});
