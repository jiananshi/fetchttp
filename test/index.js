const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

describe('XRequest', () => {
  describe('should use proper method', () => {
    METHODS.forEach(method => {
      FCeptor[method](/test\/method/, ({ request }) => {
        it(`should send ${method} request`, done => {
          request.url.should.endWith('/test/method');
          request.method.toLowerCase().should.equal(method);
          done();
        });
        return false;
      });
      XRequest[method]('/test/method').end();
    });
  });

  describe('should send body', () => {
    ['post', 'put', 'patch'].forEach(method => {
      FCeptor[method](/test\/body/, ({ request }) => {
        it(`${method} should send body`, done => {
          request.text().then(body => {
            body.should.equal('test');
            done();
          });
        });
        return false;
      });
      XRequest[method]('/test/body').send('test').end();
    });
  });

  describe('should set header', () => {
    METHODS.forEach(method => {
      FCeptor[method](/test\/header/, ({ request }) => {
        it(`${method} request header should be set`, done => {
          request.headers.get('x-request').should.equal('0813');
          done();
        });
        return false;
      });
      XRequest[method]('/test/header').set('x-request', '0813').end();
    });
  });
});

