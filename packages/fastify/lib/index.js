var jwt = require('jsonwebtoken');
var UnauthorizedError = require('./errors/UnauthorizedError');
var unless = require('express-unless');
var async = require('async');
var set = require('lodash.set');

var DEFAULT_REVOKED_FUNCTION = function (_, __, cb) { return cb(null, false); };

/**
 * 判断是不是Function
 * @param {*} object 
 */
function isFunction(object) {
  return Object.prototype.toString.call(object) === '[object Function]';
}

// ？？ 把秘钥包裹为function
function wrapStaticSecretInCallback(secret) {
  return function (_, __, cb) {
    return cb(null, secret);
  };
}

/**
 * options.secret 秘钥
 * options.isRevoked 是否撤销的token
 * options.credentialsRequired 需要证书
 */
module.exports = function (options) {
  // 判断options是否存在，以及options里面有没有传入秘钥，没有抛异常
  if (!options || !options.secret) throw new Error('secret should be set');

  // secretCallback == 秘钥
  var secretCallback = options.secret;

  // 判断是不是function，不是包裹了
  if (!isFunction(secretCallback)) {
    secretCallback = wrapStaticSecretInCallback(secretCallback);
  }

  // options.isRevoked 是否撤销的token
  var isRevokedCallback = options.isRevoked || DEFAULT_REVOKED_FUNCTION;

  // 请求内容
  var _requestProperty = options.userProperty || options.requestProperty || 'user';
  // 返回内容
  var _resultProperty = options.resultProperty;
  // 如果用户设置了credentialsRequired没设置就默认为true需要证书
  var credentialsRequired = typeof options.credentialsRequired === 'undefined' ? true : options.credentialsRequired;

  // 中间件
  var middleware = function (req, res, next) {
    var token;

    // 判断请求的方法和请求头里
    if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
      // 有没有authorization的header
      var hasAuthInAccessControl = !!~req.headers['access-control-request-headers']
        .split(',').map(function (header) {
          return header.trim();
        }).indexOf('authorization');

      if (hasAuthInAccessControl) {
        return next();
      }
    }
    // 判断options里有没有getToken，而且必须是函数
    if (options.getToken && typeof options.getToken === 'function') {
      try {
        // 从请求中获取token
        token = options.getToken(req);
      } catch (e) {
        return next(e);
      } 
      // 判断请求中有没有请求头并且请求头中有没有authorization的
    } else if (req.headers && req.headers.authorization) {
      // parts = 将请求根据空格分割为一个数组，因为正常请求应该是Bearer token
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0];
        var credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          // 获取到token
          token = credentials;
        } else {
          if (credentialsRequired) {
            return next(new UnauthorizedError('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' }));
          } else {
            return next();
          }
        }
      } else {
        return next(new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' }));
      }
    }

    if (!token) {
      if (credentialsRequired) {
        return next(new UnauthorizedError('credentials_required', { message: 'No authorization token was found' }));
      } else {
        return next();
      }
    }

    var dtoken;
    
    try {
      dtoken = jwt.decode(token, { complete: true }) || {};
    } catch (err) {
      return next(new UnauthorizedError('invalid_token', err));
    }

    async.waterfall([
      function getSecret(callback) {
        var arity = secretCallback.length;
        if (arity == 4) {
          secretCallback(req, dtoken.header, dtoken.payload, callback);
        } else { // arity == 3
          secretCallback(req, dtoken.payload, callback);
        }
      },
      function verifyToken(secret, callback) {
        jwt.verify(token, secret, options, function (err, decoded) {
          if (err) {
            callback(new UnauthorizedError('invalid_token', err));
          } else {
            callback(null, decoded);
          }
        });
      },
      function checkRevoked(decoded, callback) {
        isRevokedCallback(req, dtoken.payload, function (err, revoked) {
          if (err) {
            callback(err);
          }
          else if (revoked) {
            callback(new UnauthorizedError('revoked_token', { message: 'The token has been revoked.' }));
          } else {
            callback(null, decoded);
          }
        });
      }

    ], function (err, result) {
      if (err) { return next(err); }
      if (_resultProperty) {
        set(res, _resultProperty, result);
      } else {
        set(req, _requestProperty, result);
      }
      next();
    });
  };

  middleware.unless = unless;
  middleware.UnauthorizedError = UnauthorizedError;

  return middleware;
};

module.exports.UnauthorizedError = UnauthorizedError;
