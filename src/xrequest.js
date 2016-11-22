'use strict';

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
          return response[key]();
        } else {
          return response[key]().then(result => { throw result; });
        }
      });
      return resolver();
    };
  }
}
