'use strict';
{
  function extendResponse(raw) {
    if (typeof Symbol !== void 0 && raw && typeof raw === 'object') {
      raw[Symbol.for('response')] = response;
    }
    return raw;
  }

  window.XRequest = class {
    constructor(basePath = '', commonHeaders = {}) {
      Object.defineProperty(this, 'basePath', { value: basePath });
      Object.defineProperty(this, 'commonHeaders', { value: commonHeaders });

      return this.request.call(this);
    }

    extendOptions(options) {
      if (!options.headers) options.headers = {};
      if (this.commonHeaders) Object.assign(options.headers, this.commonHeaders);
      return options;
    }

    request() {
      return (path, options = {}) => {
        if (options.query) {
          path += '?' + Object.keys(options.query).map(key => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(options.query[key])}`;
          }).join('&');
        }
        const resolver = () => fetch(path, this.extendOptions(options)).then(response => {
          let type = response.headers.get('content-type');
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
          if (/^[1-3]/.test(response.status)) {
            return response[key]().then(extendResponse);
          } else {
            return response[key]().then(extendResponse).then(raw => {
              throw new Error(raw)
            });
          }
        });
        return resolver();
      };
    }
  }
}
