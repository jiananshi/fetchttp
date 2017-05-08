'use strict';

/* global define */
(() => {
  const umd = (name, component) => {
    switch (true) {
      case typeof module === 'object' && !!module.exports:
        module.exports = component;
        break;
      case typeof define === 'function' && !!define.amd:
        define(name, () => component);
        break;
      default:
        window[name] = component;
    }
  };

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

  class RequiredParamsError extends Error {
    constructor(message) {
      super(message);
      this.name = 'REQUIRED_PARAMS';
    }
  }

  class Req {
    constructor(url, options) {
      this.options = options || {};
      this.options.headers = this.options.headers || {};
      this.resolver = () => {
        if (options.query) {
          const hasQueryString = /\?/.test(url);
          url += (hasQueryString ? '&' : '?') + Object.keys(options.query).map(key => {
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
      return this;
    }
    send(data) {
      if (data == null) throw new RequiredParamsError('can not send undefined/null data'); // eslint-disable-line eqeqeq
      this.options.body = data;
      return this;
    }
    set(key, value) {
      if (typeof key !== 'string') throw new InvalidParamsError(`header expected to be string but get ${typeof key }`);
      if (typeof value !== 'string') throw new InvalidParamsError(`header value expected to be string but get ${typeof value}`);
      this.options.headers[key] = value;
      return this;
    }
    end() { return this.resolver(); }
  }

  class Main {
    constructor({ baseUrl, options }) {
      this.defaults = { baseUrl, options };
      ['get', 'delete'].forEach(method => {
        this[method] = (...args) => this.request(method, ...args);
      });
      ['post', 'put', 'patch'].forEach(method => {
        this[method] = (url, data, options = {}) => {
          if (data !== null) options.body = data; // eslint-disable-line eqeqeq
          return this.request(method, url, options);
        };
      });
    }
    create(options = {}) { return new Main(options); }
    request(method, url, _options = {}) {
      let { baseUrl, options } = this.defaults;
      if (baseUrl) {
        const hasQueryString = baseUrl.match(/(.*)?\?(.*)/);
        url = hasQueryString ? RegExp.$1 + url + '?' + RegExp.$2 : baseUrl + url;
      }
      if (_options) options = Object.assign({}, options, _options);
      if (typeof method !== 'string') throw new InvalidParamsError(`method expected to be string but get ${typeof method}`);
      method = method.toUpperCase().trim();
      if (!HTTP_METHODS.has(method)) throw new InvalidParamsError(`method: ${method} is not supported`);
      if (typeof url !== 'string') throw new InvalidParamsError(`url expected to be string but get ${typeof url}`);
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

  umd('req', new Main({}));
})();

