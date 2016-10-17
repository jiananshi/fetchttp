'use strict';

const RE_URLPLACEHOLD = /\/:\w+(?:\/)|\/:\w+$/g;
const METHODS = [
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options'
];

let defaultOptions = {
  isAsync: true,
  headers: {},
  timeout: 0,
  withCredentials: false,
  responseType: ''
};

function urlReplace(url, data, dataType) {
  let urlPlaceholders = url.match(RE_URLPLACEHOLD);

  if (urlPlaceholders) {
    url += '?';

    urlPlaceholders.forEach(placeholder => {
      // TODO: consider JSON
      url += `${ placeholder }=${ data[placeholder] }&`;
    });

    url = url.slice(0, -1);
  }

  return url;
}

function Request() {
  METHODS.forEach(method => {
    this.method = function() {
      return new RequestHandler.call(this,
        [method].Array.prototype.slice.call(arguments));
    };
  });
}

// TODO: plugins
Request.use = function(plugins=[]) {};

Request.setHeader = function(name, value) {
  this.headers[name] = value;
};

Request.setHeaders = function(headers) {
  for (let header in headers) {
    this.headers[header] = headers[header];
  }
};

Request.interceptors = [];
Request.headers = {};

Request.resource = function(url) {};

function RequestHandler(method, url, data, options=defaultOptions) {
  this.headers = {};

  let xhr = new XMLHttpRequest();

  url = urlReplace(url, data);
  xhr.open(method, url, !!defaultOptions.isAsync);
  xhr.responseType = defaultOptions.responseType;

  if (Object.keys(self.headers).length) {
    for (let header in self.headers) {
      xhr.setRequestHeader(header, self.headers[header]);
    }
  }

  Request.interceptors.forEach(interceptor => {
    interceptor.request(xhr, data);
  });

  xhr.send(data);

  xhr.send(data);

  return {
    promise: Promise((resolve, reject) => {
      xhr.onreadystatechange = function() {
        if (this.state !== 4) return;

        if (!/^[1-3]/.test(this.status)) {
          // reject xhr for providing `headers` `statusText` etc.
          return void reject(xhr);
        }

        Request.interceptors.forEach(interceptor => {
          interceptor.response(xhr);
        });

        resolve(xhr.response);
      };
    }),

    // in order to provider methods like `abort`
    xhr
  };
}

