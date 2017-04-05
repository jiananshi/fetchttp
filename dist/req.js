'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (exports) {
  var HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

  var InvalidParamsError = function (_Error) {
    _inherits(InvalidParamsError, _Error);

    function InvalidParamsError(message) {
      _classCallCheck(this, InvalidParamsError);

      var _this = _possibleConstructorReturn(this, (InvalidParamsError.__proto__ || Object.getPrototypeOf(InvalidParamsError)).call(this, message));

      _this.name = 'INVALID_PARAMS';
      return _this;
    }

    return InvalidParamsError;
  }(Error);

  var RequriedParamsError = function (_Error2) {
    _inherits(RequriedParamsError, _Error2);

    function RequriedParamsError(message) {
      _classCallCheck(this, RequriedParamsError);

      var _this2 = _possibleConstructorReturn(this, (RequriedParamsError.__proto__ || Object.getPrototypeOf(RequriedParamsError)).call(this, message));

      _this2.name = 'REQUIRED_PARAMS';
      return _this2;
    }

    return RequriedParamsError;
  }(Error);

  var Req = function () {
    function Req(url, options) {
      _classCallCheck(this, Req);

      this.headers = options.headers || {};
      this.body = options.body || {};
      this.resolver = function () {
        if (options.query) {
          url += '?' + Object.keys(options.query).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(options.query[key]);
          }).join('&');
          delete options.query;
        }
        return fetch(url, options).then(function (response) {
          var type = response.headers.get('content-type');
          var key = void 0;
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
          return response[key]().then(function (res) {
            if ((typeof Symbol === 'undefined' ? 'undefined' : _typeof(Symbol)) !== void 0 && (typeof res === 'undefined' ? 'undefined' : _typeof(res)) === 'object') res[Symbol.for('response')] = response;
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

    _createClass(Req, [{
      key: 'send',
      value: function send(data) {
        if (data == null) throw new RequiredParamseError('can not send undefined/null data'); // eslint-disable-line eqeqeq
        this.body = data;
        return this;
      }
    }, {
      key: 'set',
      value: function set(key, value) {
        if (typeof key !== 'string') throw new InvalidParams('header expected to be string but get ' + (typeof key === 'undefined' ? 'undefined' : _typeof(key)));
        if (typeof value !== 'string') throw new InvalidParams('header value expected to be string but get ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)));
        this.headers[key] = value;
        return this;
      }
    }, {
      key: 'end',
      value: function end() {
        return this.resolver();
      }
    }]);

    return Req;
  }();

  var Main = function () {
    function Main(_ref) {
      var _this3 = this;

      var baseUrl = _ref.baseUrl,
          headers = _ref.headers;

      _classCallCheck(this, Main);

      this.defaults = { baseUrl: baseUrl, headers: headers };
      ['get', 'delete'].forEach(function (method) {
        _this3[method] = function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return _this3.request.apply(_this3, [method].concat(args));
        };
      });
      ['post', 'put', 'patch'].forEach(function (method) {
        _this3[method] = function (url, data) {
          var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          if (data !== null) options.body = data; // eslint-disable-line eqeqeq
          return _this3.request(method, url, options);
        };
      });
    }

    _createClass(Main, [{
      key: 'create',
      value: function create() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return new Main(options);
      }
    }, {
      key: 'request',
      value: function request(method, url) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var _defaults = this.defaults,
            baseUrl = _defaults.baseUrl,
            headers = _defaults.headers;

        if (baseUrl) url = baseUrl + url;
        if (headers) options.headers = headers;
        if (typeof method !== 'string') throw new InvalidParams('method expected to be string but get ' + (typeof method === 'undefined' ? 'undefined' : _typeof(method)));
        method = method.toUpperCase().trim();
        if (!HTTP_METHODS.has(method)) throw new InvalidParams('method: ' + method + ' is not supported');
        if (typeof url !== 'string') throw new InvalidParams('url expected to be string but get ' + (typeof url === 'undefined' ? 'undefined' : _typeof(url)));
        return new Req(url, Object.assign(Object.create(null), options, { method: method }));
      }
    }]);

    return Main;
  }();

  HTTP_METHODS.forEach(function (method) {
    method = method.toLowerCase();
    Main[method] = function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return Main.request.apply(Main, [method].concat(args));
    };
  });

  exports.req = new Main({});
})(typeof window === 'undefined' ? global : window);
