'use strict';
{
  const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
  function extendResponse(res) {
    if (typeof Symbol !== void 0 && res && typeof res === 'object') {
      res[Symbol.for('response')] = res;
    }
    return res;
  }
  window.XRequest = new class {
    constructor() {
      METHODS.forEach(method => this[method] = this.request.call(this, method));
    }
    set(key, value) { 
      this.headers[key] = value; 
      return this;
    }
    send(value) { 
      this.body = value; 
      return this;
    }
    request(method) {
      return (path, options = {}) => {
        this.headers = {};
        this.body = {};
        if (options.query) {
          path += '?' + Object.keys(options.query).map(key => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(options.query[key])}`;
          }).join('&');
        }
        this.resolver = () => {
          options = Object.assign({}, options);
          options.headers = options.headers || {};
          Object.assign(options.headers, this.headers);
          if (Object.keys(this.body).length) options.body = this.body;
          options.method = method.toUpperCase();
          return fetch(path, options).then(response => {
            const type = response.headers.get('content-type');
            let key;
            switch(true) {
              case /\bjson\b/.test(type):
                key = 'json';
                break;
              case /\btext\b/.test(type):
                key = 'text';
                break;
              default:
                key = 'blob';
            }
            const { status } = response;
            response = response[key]().then(extendResponse);
            return /^[1-3]/.test(status)
              ? response
              : response.then(raw => {
                throw new Error(raw);
              });
          });
        };
        return this;
      };
    }
    end() { return this.resolver(); }
  }
}

