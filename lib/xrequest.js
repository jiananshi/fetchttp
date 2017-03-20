'use strict';
{
  const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
  let cache = {};
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
    cache(path, options = {}, resolver) {
      return () => {
        const key = JSON.stringify([ path, options ]);
        const { expires } = options;
        if (Reflect.has(cache, key)) return cache[key];
        const result = resolver();
        if (expires && !isNaN(expires)) {
          cache[key] = result;
          setTimeout(() => delete cache[key], expires);
        }
        return result;
      };
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
        const resolver = () => {
          options = Object.assign({}, options);
          options.headers = options.headers || {};
          Object.assign(options.headers, this.headers);
          if (Object.keys(this.body).length) options.body = this.body;
          options.method = method.toUpperCase();
          return fetch(path, options).then(response => {
            const type = response.headers.get('content-type');
            let key;
            switch (true) {
              case /\bjson\b/.test(type):
                key = 'json';
                break;
              case /\btext\b/.test(type):
                key = 'text';
                break;
              default:
                key = 'blob';
            }
            return response[key]().then(res => {
              if (typeof Symbol !== void 0 && typeof res === 'object') res[Symbol.for('response')] = response;
              if (/^[1-3]/.test(response.status)) {
                return res;
              } else {
                throw res;
              }
            });
          });
        };
        this.resolver = this.cache(path, options, resolver);
        return this;
      };
    }
    end() { return this.resolver(); }
  }
}

