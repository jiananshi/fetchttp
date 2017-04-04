'use strict';

(exports => {
  const HTTP_METHODS = new Set([
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE'
  ]);

  class InvalidParamsError extends Error {
    constructor(message) {
      super(message);
      this.name = 'INVALID_PARAMS';
    }
  }

  class RequriedParamsError extends Error {
    constructor(message) {
      super(message);
      this.name = 'REQUIRED_PARAMS';
    }
  }

  class Req {
    constructor(url, options) {
      this.headers = options.headers || {};
      this.body = options.body || {};
      this.resolver = () => {
        if (options.query) {
          url += '?' + Object.keys(options.query).map(key => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(options.query[key])}`;
          }).join('&');
          delete options.query;
        }
        return fetch(url, options).then(response => {
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
    }
    send(data) {
      if (data == null) throw new RequiredParamseError('can not send undefined/null data'); // eslint-disable-line eqeqeq
      this.body = data;
      return this;
    }
    set(key, value) {
      if (typeof key !== 'string') throw new InvalidParams(`header expected to be string but get ${typeof(key)}`);
      if (typeof value !== 'string') throw new InvalidParams(`header value expected to be string but get ${typeof(value)}`);
      this.headers[key] = value;
      return this;
    }
    end() { return this.resolver(); }
  }

  class Main {
    constructor({ baseUrl, headers }) {
      this.defaults = { baseUrl, headers };
      ['get', 'delete'].forEach(method => {
        this[method] = (...args) => this.request(method, ...args);
      });
      ['post', 'put', 'patch'].forEach(method => {
        this[method] = (url, data, options = {}) => {
          if (data !== null) options.body = data; // eslint-disable-line eqeqeq
          return this.request(method, url, options);
        }
      });
    }
    create(options = {}) { return new this(options); }
    request(method, url, options = {}) {
      const { baseUrl, headers } = this.defaults;
      if (baseUrl) url = baseUrl + url;
      if (headers) options.headers = headers;
      if (typeof method !== 'string') throw new InvalidParams(`method expected to be string but get ${typeof(method)}`);
      method = method.toUpperCase().trim();
      if (!HTTP_METHODS.has(method)) throw new InvalidParams(`method: ${method} is not supported`);
      if (typeof url !== 'string') throw new InvalidParams(`url expected to be string but get ${typeof(url)}`);
      return new Req(url, Object.assign(
        Object.create(null),
        options,
        { method }
      ));
    }
  }

  HTTP_METHODS.forEach(method => {
    method = method.toLowerCase();
    Main[method] = (...args) => {
      return Main.request(method, ...args);
    };
  });

  exports.req = new Main({});
})(typeof window === 'undefined' ? global : window);

