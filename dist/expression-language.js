(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var isInArray = function isInArray(array, value) {
  var i, len;

  for (i = 0, len = array.length; i !== len; ++i) {
    if (array[i] === value) {
      return true;
    }
  }

  return false;
};

var mapValues = function mapValues(mapper) {
  return function (obj) {
    var result = {};
    Object.keys(mapper).forEach(function (key) {
      result[key] = mapper(obj[key]);
    });
  };
};

var convertKeys = function convertKeys(converter) {
  return function (obj) {
    var newKeys = Object.keys(obj).map(function (key) {
      return obj.hasOwnProperty(key) ? [key, converter(key)] : null;
    }).filter(function (val) {
      return val != null;
    });
    newKeys.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          oldKey = _ref2[0],
          newKey = _ref2[1];

      if (oldKey !== newKey) {
        obj[newKey] = obj[oldKey];
        delete obj[oldKey];
      }
    });
    return obj;
  };
};

var thunkEvaluator = function thunkEvaluator(val) {
  return evaluate(val);
};

var objEvaluator = mapValues(thunkEvaluator);

var evaluate = function evaluate(thunkExpression) {
  if (typeof thunkExpression === 'function' && thunkExpression.length === 0) {
    return evaluate(thunkExpression());
  } else if (Array.isArray(thunkExpression)) {
    return thunkExpression.map(thunkEvaluator);
  } else if (_typeof(thunkExpression) === 'object') {
    return objEvaluator(thunkExpression);
  } else {
    return thunkExpression;
  }
};

var thunk = function thunk(delegate) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return function () {
    return delegate.apply(void 0, args);
  };
};

var ExpressionParser =
/*#__PURE__*/
function () {
  function ExpressionParser(options) {
    var _this = this;

    _classCallCheck(this, ExpressionParser);

    var defaults = {
      AMBIGUOUS: {
        '-': 'NEG'
      },
      PREFIX_OPS: {
        'NEG': function NEG(expr) {
          return -expr();
        }
      },
      INFIX_OPS: {
        '+': function _(a, b) {
          return a() + b();
        },
        '-': function _(a, b) {
          return a() - b();
        },
        '*': function _(a, b) {
          return a() * b();
        },
        '/': function _(a, b) {
          return a() / b();
        }
      },
      ESCAPE_CHAR: '\\',
      LITERAL_OPEN: '"',
      LITERAL_CLOSE: '"',
      GROUP_OPEN: '(',
      GROUP_CLOSE: ')',
      SYMBOLS: ['"', '(', ')'],
      PRECEDENCE: [['*', '/'], ['+', '-']],
      isCaseInsensitive: false
    };
    this.options = options || defaults;
    this.surroundingOpen = {};
    this.surroundingClose = {};

    if (this.options.SURROUNDING) {
      Object.keys(this.options.SURROUNDING).forEach(function (key) {
        var item = _this.options.SURROUNDING[key];
        var open = item.OPEN;
        var close = item.CLOSE;

        if (_this.options.isCaseInsensitive) {
          key = key.toUpperCase();
          open = open.toUpperCase();
          close = close.toUpperCase();
        }

        _this.surroundingOpen[open] = true;
        _this.surroundingClose[close] = {
          OPEN: open,
          ALIAS: key
        };
      });
    }

    if (this.options.isCaseInsensitive) {
      // convert all terms to uppercase
      var upperCaser = function upperCaser(key) {
        return key.toUpperCase();
      };

      var upperCaseKeys = convertKeys(upperCaser);
      var upperCaseVals = mapValues(upperCaser);
      upperCaseKeys(this.options.INFIX_OPS);
      upperCaseKeys(this.options.PREFIX_OPS);
      upperCaseKeys(this.options.AMBIGUOUS);
      upperCaseVals(this.options.AMBIGUOUS);
      this.options.PRECEDENCE = this.options.PRECEDENCE.map(function (arr) {
        return arr.map(function (val) {
          return val.toUpperCase();
        });
      });
    }

    if (this.options.LITERAL_OPEN) {
      this.LIT_CLOSE_REGEX = new RegExp("".concat(this.options.LITERAL_OPEN, "$"));
    }

    if (this.options.LITERAL_CLOSE) {
      this.LIT_OPEN_REGEX = new RegExp("^".concat(this.options.LITERAL_CLOSE));
    }

    this.symbols = {};
    this.options.SYMBOLS.forEach(function (symbol) {
      _this.symbols[symbol] = symbol;
    });
  }

  _createClass(ExpressionParser, [{
    key: "resolveCase",
    value: function resolveCase(key) {
      return this.options.isCaseInsensitive ? key.toUpperCase() : key;
    }
  }, {
    key: "resolveAmbiguity",
    value: function resolveAmbiguity(token) {
      return this.options.AMBIGUOUS[this.resolveCase(token)];
    }
  }, {
    key: "isSymbol",
    value: function isSymbol(_char) {
      return this.symbols[_char] === _char;
    }
  }, {
    key: "getPrefixOp",
    value: function getPrefixOp(op) {
      return this.options.PREFIX_OPS[this.resolveCase(op)];
    }
  }, {
    key: "getInfixOp",
    value: function getInfixOp(op) {
      return this.options.INFIX_OPS[this.resolveCase(op)];
    }
  }, {
    key: "getPrecedence",
    value: function getPrecedence(op) {
      var i, len, casedOp;
      casedOp = this.resolveCase(op);

      for (i = 0, len = this.options.PRECEDENCE.length; i !== len; ++i) {
        if (isInArray(this.options.PRECEDENCE[i], casedOp)) {
          return i;
        }
      }

      return i;
    }
  }, {
    key: "tokenize",
    value: function tokenize(expression) {
      var _this2 = this;

      var token = '';
      var EOF = 0;
      var tokens = [];
      var state = {
        startedWithSep: true,
        scanningLiteral: false,
        scanningSymbols: false,
        escaping: false
      };

      var endWord = function endWord(endedWithSep) {
        if (token !== '') {
          var disambiguated = _this2.resolveAmbiguity(token);

          if (disambiguated && state.startedWithSep && !endedWithSep) {
            // ambiguous operator is nestled with the RHS
            // treat it as a prefix operator
            tokens.push(disambiguated);
          } else {
            // TODO: break apart joined surroundingOpen/Close
            tokens.push(token);
          }

          ;
          token = '';
          state.startedWithSep = false;
        }
      };

      var chars = expression.split('');
      var currChar;
      var i, len;

      for (i = 0, len = chars.length; i <= len; ++i) {
        if (i === len) {
          currChar = EOF;
        } else {
          currChar = chars[i];
        }

        if (currChar === this.options.ESCAPE_CHAR && !state.escaping) {
          state.escaping = true;
          continue;
        } else {
          state.escaping = false;
        }

        if (currChar === this.options.LITERAL_OPEN && !state.scanningLiteral) {
          state.scanningLiteral = true;
          endWord(false);
        } else if (currChar === this.options.LITERAL_CLOSE) {
          state.scanningLiteral = false;
          tokens.push(this.options.LITERAL_OPEN + token + this.options.LITERAL_CLOSE);
          token = '';
        } else if (currChar === EOF) {
          endWord(true);
        } else if (state.scanningLiteral) {
          token += currChar;
        } else if (currChar === this.options.SEPARATOR) {
          endWord(true);
          state.startedWithSep = true;
        } else if (currChar === this.options.GROUP_OPEN || currChar === this.options.GROUP_CLOSE) {
          endWord(currChar === this.options.GROUP_CLOSE);
          state.startedWithSep = currChar === this.options.GROUP_OPEN;
          tokens.push(currChar);
        } else if (this.isSymbol(currChar) && !state.scanningSymbols || !this.isSymbol(currChar) && state.scanningSymbols) {
          endWord(false);
          token += currChar;
          state.scanningSymbols = !state.scanningSymbols;
        } else {
          token += currChar;
        }
      }

      return tokens;
    }
  }, {
    key: "tokensToRpn",
    value: function tokensToRpn(tokens) {
      var token;
      var i, len;
      var isInfix, isPrefix, surroundingToken, lastInStack, tokenPrecedence;
      var output = [];
      var stack = [];
      var grouping = [];

      for (i = 0, len = tokens.length; i !== len; ++i) {
        token = tokens[i];
        isInfix = typeof this.getInfixOp(token) !== 'undefined';
        isPrefix = typeof this.getPrefixOp(token) !== 'undefined';

        if (isInfix || isPrefix) {
          tokenPrecedence = this.getPrecedence(token);
          lastInStack = stack[stack.length - 1];

          while (lastInStack && (!!this.getPrefixOp(lastInStack) && this.getPrecedence(lastInStack) < tokenPrecedence || !!this.getInfixOp(lastInStack) && this.getPrecedence(lastInStack) <= tokenPrecedence)) {
            output.push(stack.pop());
            lastInStack = stack[stack.length - 1];
          }

          stack.push(token);
        } else if (this.surroundingOpen[token]) {
          stack.push(token);
          grouping.push(token);
        } else if (this.surroundingClose[token]) {
          surroundingToken = this.surroundingClose[token];

          if (grouping.pop() !== surroundingToken.OPEN) {
            throw new Error("Mismatched Grouping (unexpected closing \"".concat(token, "\")"));
          }

          token = stack.pop();

          while (token !== surroundingToken.OPEN && typeof token !== 'undefined') {
            output.push(token);
            token = stack.pop();
          }

          if (typeof token === 'undefined') {
            throw new Error("Mismatched Grouping");
          }

          stack.push(surroundingToken.ALIAS);
        } else if (token === this.options.GROUP_OPEN) {
          stack.push(token);
          grouping.push(token);
        } else if (token === this.options.GROUP_CLOSE) {
          if (grouping.pop() !== this.options.GROUP_OPEN) {
            throw new Error("Mismatched Grouping (unexpected closing \"".concat(token, "\")"));
          }

          token = stack.pop();

          while (token !== this.options.GROUP_OPEN && typeof token !== 'undefined') {
            output.push(token);
            token = stack.pop();
          }

          if (typeof token === 'undefined') {
            throw new Error("Mismatched Grouping");
          }
        } else {
          output.push(token);
        }
      }

      for (i = 0, len = stack.length; i !== len; ++i) {
        token = stack.pop();
        surroundingToken = this.surroundingClose[token];

        if (surroundingToken && grouping.pop() !== surroundingToken.OPEN) {
          throw new Error("Mismatched Grouping (unexpected closing \"".concat(token, "\")"));
        } else if (token === this.options.GROUP_CLOSE && grouping.pop() !== this.options.GROUP_OPEN) {
          throw new Error("Mismatched Grouping (unexpected closing \"".concat(token, "\")"));
        }

        output.push(token);
      }

      if (grouping.length !== 0) {
        throw new Error("Mismatched Grouping (unexpected \"".concat(grouping.pop(), "\")"));
      }

      return output;
    }
  }, {
    key: "evaluateRpn",
    value: function evaluateRpn(stack, infixer, prefixer, terminator) {
      var lhs, rhs;
      var token = stack.pop();

      if (typeof token === 'undefined') {
        throw new Error("Parse Error: unexpected EOF");
      }

      var infixDelegate = this.getInfixOp(token);
      var prefixDelegate = this.getPrefixOp(token);
      var isInfix = infixDelegate && stack.length > 1;
      var isPrefix = prefixDelegate && stack.length > 0;

      if (isInfix || isPrefix) {
        rhs = this.evaluateRpn(stack, infixer, prefixer, terminator);
      }

      if (isInfix) {
        lhs = this.evaluateRpn(stack, infixer, prefixer, terminator);
        return infixer(token, lhs, rhs);
      } else if (isPrefix) {
        return prefixer(token, rhs);
      } else {
        return terminator(token);
      }
    }
  }, {
    key: "rpnToExpression",
    value: function rpnToExpression(stack) {
      var _this3 = this;

      var infixExpr = function infixExpr(term, lhs, rhs) {
        return _this3.options.GROUP_OPEN + lhs + _this3.options.SEPARATOR + term + _this3.options.SEPARATOR + rhs + _this3.options.GROUP_CLOSE;
      };

      var prefixExpr = function prefixExpr(term, rhs) {
        return (_this3.isSymbol(term) ? term : term + _this3.options.SEPARATOR) + _this3.options.GROUP_OPEN + rhs + _this3.options.GROUP_CLOSE;
      };

      var termExpr = function termExpr(term) {
        return term;
      };

      return this.evaluateRpn(stack, infixExpr, prefixExpr, termExpr);
    }
  }, {
    key: "rpnToTokens",
    value: function rpnToTokens(stack) {
      var _this4 = this;

      var infixExpr = function infixExpr(term, lhs, rhs) {
        return [_this4.options.GROUP_OPEN].concat(lhs).concat([term]).concat(rhs).concat([_this4.options.GROUP_CLOSE]);
      };

      var prefixExpr = function prefixExpr(term, rhs) {
        return [term, _this4.options.GROUP_OPEN].concat(rhs).concat([_this4.options.GROUP_CLOSE]);
      };

      var termExpr = function termExpr(term) {
        return [term];
      };

      return this.evaluateRpn(stack, infixExpr, prefixExpr, termExpr);
    }
  }, {
    key: "rpnToThunk",
    value: function rpnToThunk(stack) {
      var _this5 = this;

      var infixExpr = function infixExpr(term, lhs, rhs) {
        return thunk(_this5.getInfixOp(term), lhs, rhs);
      };

      var prefixExpr = function prefixExpr(term, rhs) {
        return thunk(_this5.getPrefixOp(term), rhs);
      };

      var termExpr = function termExpr(term) {
        if (_this5.options.LITERAL_OPEN && term.startsWith(_this5.options.LITERAL_OPEN)) {
          // Literal string
          return function () {
            return term.replace(_this5.LIT_OPEN_REGEX, '').replace(_this5.LIT_CLOSE_REGEX, '');
          };
        } else {
          return thunk(_this5.options.termDelegate, term);
        }
      };

      return this.evaluateRpn(stack, infixExpr, prefixExpr, termExpr);
    }
  }, {
    key: "rpnToValue",
    value: function rpnToValue(stack) {
      return evaluate(this.rpnToThunk(stack));
    }
  }, {
    key: "thunkToValue",
    value: function thunkToValue(thunk) {
      return evaluate(thunk);
    }
  }, {
    key: "expressionToRpn",
    value: function expressionToRpn(expression) {
      return this.tokensToRpn(this.tokenize(expression));
    }
  }, {
    key: "expressionToThunk",
    value: function expressionToThunk(expression) {
      return this.rpnToThunk(this.expressionToRpn(expression));
    }
  }, {
    key: "expressionToValue",
    value: function expressionToValue(expression) {
      return this.rpnToValue(this.expressionToRpn(expression));
    }
  }, {
    key: "tokensToValue",
    value: function tokensToValue(tokens) {
      return this.rpnToValue(this.tokensToRpn(tokens));
    }
  }, {
    key: "tokensToThunk",
    value: function tokensToThunk(tokens) {
      return this.rpnToThunk(this.tokensToRpn(tokens));
    }
  }]);

  return ExpressionParser;
}();

var _default = ExpressionParser;
exports["default"] = _default;

},{}],2:[function(require,module,exports){
"use strict";

var _ExpressionParser = _interopRequireDefault(require("./ExpressionParser"));

var _language = _interopRequireDefault(require("./language"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

window.initExpressions = function (evalTerm) {
  var funcs = {};

  var termDelegate = function termDelegate(term) {
    if (funcs[term.toUpperCase()]) {
      // Return a string reference to the function
      return term;
    } else {
      return evalTerm(term);
    }
  };

  var defn = (0, _language["default"])(termDelegate, {});
  funcs = defn.PREFIX_OPS;
  return new _ExpressionParser["default"](defn);
};

},{"./ExpressionParser":1,"./language":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var unpackArgs = function unpackArgs(f) {
  return function (expr) {
    var args = expr();

    if (!args.isArgumentArray && f.length <= 1) {
      return f(function () {
        return args;
      });
    } else if (args.length === f.length || f.length === 0) {
      return f.apply(null, args);
    } else {
      throw new Error("Incorrect number of arguments.");
    }
  };
};

var language = function language(_termDelegate, prefix) {
  var prefixOps, infixOps;

  var call = function call(name) {
    var upperName = name.toUpperCase();

    if (prefixOps.hasOwnProperty(upperName)) {
      return function (expr) {
        return prefixOps[upperName](function () {
          return expr;
        });
      };
    } else if (infixOps.hasOwnProperty(upperName)) {
      return function (expr) {
        var _expr = _slicedToArray(expr, 2),
            arg1 = _expr[0],
            arg2 = _expr[1];

        return infixOps[upperName](function () {
          return arg1;
        }, function () {
          return arg2;
        });
      };
    } else {
      throw new Error("Unknown function: ".concat(name));
    }
  };

  infixOps = {
    '+': function _(a, b) {
      return a() + b();
    },
    '-': function _(a, b) {
      return a() - b();
    },
    '*': function _(a, b) {
      return a() * b();
    },
    '/': function _(a, b) {
      return a() / b();
    },
    ',': function _(a, b) {
      var aVal = a();
      var aArr = aVal.isArgumentArray ? aVal : [function () {
        return aVal;
      }];
      var args = aArr.concat([b]);
      args.isArgumentArray = true;
      return args;
    },
    'MOD': function MOD(a, b) {
      return a() % b();
    },
    '%': function _(a, b) {
      return a() % b();
    },
    '=': function _(a, b) {
      return a() === b();
    },
    '!=': function _(a, b) {
      return a() !== b();
    },
    '<>': function _(a, b) {
      return a() !== b();
    },
    '>': function _(a, b) {
      return a() > b();
    },
    '<': function _(a, b) {
      return a() < b();
    },
    '>=': function _(a, b) {
      return a() >= b();
    },
    '<=': function _(a, b) {
      return a() <= b();
    },
    'AND': function AND(a, b) {
      return a() && b();
    },
    'OR': function OR(a, b) {
      return a() || b();
    },
    '^': function _(a, b) {
      return Math.pow(a(), b());
    }
  };
  prefixOps = Object.assign({
    'NEG': function NEG(arg) {
      return -arg();
    },
    'ISPRIME': function ISPRIME(arg) {
      var val = arg();

      for (var i = 2, s = Math.sqrt(val); i <= s; i++) {
        if (val % i === 0) return false;
      }

      return val !== 1;
    },
    'GCD': function GCD(arg1, arg2) {
      var a = arg1();
      var b = arg2();
      a = Math.abs(a);
      b = Math.abs(b);

      if (b > a) {
        var temp = a;
        a = b;
        b = temp;
      }

      while (true) {
        if (b === 0) return a;
        a %= b;
        if (a === 0) return b;
        b %= a;
      }
    },
    'NOT': function NOT(arg) {
      return !arg();
    },
    '!': function _(arg) {
      return !arg();
    },
    'ABS': function ABS(arg) {
      return Math.abs(arg());
    },
    'ACOS': function ACOS(arg) {
      return Math.acos(arg());
    },
    'ACOSH': function ACOSH(arg) {
      return Math.acosh(arg());
    },
    'ASIN': function ASIN(arg) {
      return Math.asin(arg());
    },
    'ASINH': function ASINH(arg) {
      return Math.asinh(arg());
    },
    'ATAN': function ATAN(arg) {
      return Math.atan(arg());
    },
    'ATAN2': function ATAN2(arg1, arg2) {
      return Math.atan2(arg1(), arg2());
    },
    'ATANH': function ATANH(arg) {
      return Math.atanh(arg());
    },
    'CUBEROOT': function CUBEROOT(arg) {
      return Math.cbrt(arg());
    },
    'CEIL': function CEIL(arg) {
      return Math.ceil(arg());
    },
    'COS': function COS(arg) {
      return Math.cos(arg());
    },
    'COSH': function COSH(arg) {
      return Math.cos(arg());
    },
    'EXP': function EXP(arg) {
      return Math.exp(arg());
    },
    'FLOOR': function FLOOR(arg) {
      return Math.floor(arg());
    },
    'LN': function LN(arg) {
      return Math.log(arg());
    },
    'LOG': function LOG(arg) {
      return Math.log10(arg());
    },
    'LOG2': function LOG2(arg) {
      return Math.log2(arg());
    },
    'SIN': function SIN(arg) {
      return Math.sin(arg());
    },
    'SINH': function SINH(arg) {
      return Math.sinh(arg());
    },
    'SQRT': function SQRT(arg) {
      return Math.sqrt(arg());
    },
    'TAN': function TAN(arg) {
      return Math.tan(arg());
    },
    'TANH': function TANH(arg) {
      return Math.tanh(arg());
    },
    'ROUND': function ROUND(arg) {
      return Math.round(arg());
    },
    'SIGN': function SIGN(arg) {
      return Math.sign(arg());
    },
    'TRUNC': function TRUNC(arg) {
      return Math.trunc(arg());
    },
    'IF': function IF(arg1, arg2, arg3) {
      var condition = arg1;
      var thenStatement = arg2;
      var elseStatement = arg3;

      if (condition()) {
        return thenStatement();
      } else if (elseStatement) {
        return elseStatement();
      } else {
        return null;
      }
    },
    'AVERAGE': function AVERAGE(arg) {
      var arr = arg();
      var sum = arr.reduce(function (prev, curr) {
        return prev + curr;
      }, 0);
      return sum / arr.length;
    },
    'SUM': function SUM(arg) {
      return arg().reduce(function (prev, curr) {
        return prev + curr;
      }, 0);
    },
    'CHAR': function CHAR(arg) {
      return String.fromCharCode(arg());
    },
    'CODE': function CODE(arg) {
      return arg().charCodeAt(0);
    },
    'DEC2BIN': function DEC2BIN(arg) {
      return arg().toString(2);
    },
    'DEC2HEX': function DEC2HEX(arg) {
      return arg().toString(16);
    },
    'DEGREES': function DEGREES(arg) {
      return arg() * 180 / Math.PI;
    },
    'RADIANS': function RADIANS(arg) {
      return arg() * Math.PI / 180;
    },
    'MIN': function MIN(arg) {
      var arr = arg();
      return arr.reduce(function (prev, curr) {
        return Math.min(prev, curr());
      }, Number.POSITIVE_INFINITY);
    },
    'MAX': function MAX(arg) {
      return arg().reduce(function (prev, curr) {
        return Math.max(prev, curr());
      }, Number.NEGATIVE_INFINITY);
    },
    'SORT': function SORT(arg) {
      var arr = arg().slice();
      arr.sort();
      return arr;
    },
    'REVERSE': function REVERSE(arg) {
      var arr = arg().slice();
      arr.reverse();
      return arr;
    },
    'INDEX': function INDEX(arg1, arg2) {
      return arg2()[arg1()];
    },
    'LENGTH': function LENGTH(arg) {
      return arg().length;
    },
    'JOIN': function JOIN(arg1, arg2) {
      return arg2().join(arg1());
    },
    'STRING': function STRING(arg) {
      return arg().join('');
    },
    'SPLIT': function SPLIT(arg1, arg2) {
      return arg2().split(arg1());
    },
    'CHARARRAY': function CHARARRAY(arg) {
      var str = arg();
      return str.split('');
    },
    'ARRAY': function ARRAY(arg) {
      var val = arg();
      return val.isArgumentArray ? val.slice() : [val];
    },
    'ISNAN': function ISNAN(arg) {
      return isNaN(arg());
    },
    'MAP': function MAP(arg1, arg2) {
      var name = arg1();
      var array = arg2();
      return array.map(function (val) {
        return call(name)(val);
      });
    },
    'REDUCE': function REDUCE(arg1, arg2, arg3) {
      var name = arg1();
      var start = arg2();
      var array = arg3();
      return array.reduce(function (prev, curr) {
        return call(name)([prev, curr()]);
      }, start);
    },
    'RANGE': function RANGE(arg1, arg2) {
      var start = arg1();
      var limit = arg2();
      var result = [];

      for (var i = start; i < limit; i++) {
        result.push(i);
      }

      ;
      return result;
    },
    'UPPER': function UPPER(arg) {
      return arg().toUpperCase();
    },
    'LOWER': function LOWER(arg) {
      return arg().toLowerCase();
    }
  }, prefix); // Ensure arguments are unpacked accordingly
  // Except for the ARRAY constructor

  Object.keys(prefixOps).forEach(function (key) {
    if (key !== 'ARRAY') {
      prefixOps[key] = unpackArgs(prefixOps[key]);
    }
  });
  return {
    INFIX_OPS: infixOps,
    PREFIX_OPS: prefixOps,
    PRECEDENCE: [Object.keys(prefixOps), ['^'], ['*', '/', '%', 'MOD'], ['+', '-'], ['<', '>', '<=', '>='], ['=', '!=', '<>'], ['AND', 'OR'], [',']],
    LITERAL_OPEN: '"',
    LITERAL_CLOSE: '"',
    GROUP_OPEN: '(',
    GROUP_CLOSE: ')',
    SEPARATOR: ' ',
    SYMBOLS: ['^', '*', '/', '%', '+', '-', '<', '>', '=', '!', ',', '"', '(', ')', '[', ']'],
    AMBIGUOUS: {
      '-': 'NEG'
    },
    SURROUNDING: {
      'ARRAY': {
        OPEN: '[',
        CLOSE: ']'
      }
    },
    termDelegate: function termDelegate(term) {
      var numVal = parseFloat(term);

      if (Number.isNaN(numVal)) {
        switch (term) {
          case 'E':
            return Math.E;

          case 'LN2':
            return Math.LN2;

          case 'LN10':
            return Math.LN10;

          case 'LOG2E':
            return Math.LOG2E;

          case 'LOG10E':
            return Math.LOG10E;

          case 'PI':
            return Math.PI;

          case 'SQRTHALF':
            return Math.SQRT1_2;

          case 'SQRT2':
            return Math.SQRT2;

          case 'FALSE':
            return false;

          case 'TRUE':
            return true;

          case 'EMPTY':
            return [];

          default:
            return _termDelegate(term);
        }
      } else {
        return numVal;
      }
    },
    isCaseInsensitive: true,
    descriptions: [{
      op: '+',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Number'],
      text: 'Performs addition: a + b'
    }, {
      op: '-',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Number'],
      text: 'Performs subtraction: a - b'
    }, {
      op: '/',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Number'],
      text: 'Performs division: a / b'
    }, {
      op: ',',
      fix: 'infix',
      sig: ['a', 'b', 'Arguments'],
      text: 'Returns an array of arguments with b appended to a. If a is not an argument array, it is automatically appended to an empty array.'
    }, {
      op: 'MOD',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Number'],
      text: 'Performs modulo operation: a MOD b. (equivalent to %)'
    }, {
      op: '%',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Number'],
      text: 'Performs modulo operation: a % b. (equivalent to MOD)'
    }, {
      op: '=',
      fix: 'infix',
      sig: ['a', 'b', 'Boolean'],
      text: 'Returns TRUE if a = b. Otherwise returns FALSE.'
    }, {
      op: '!=',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Number'],
      text: 'Returns FALSE if a = b. Otherwise returns TRUE. (equivalent to <>)'
    }, {
      op: '<>',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Number'],
      text: 'Returns FALSE if a = b. Otherwise returns TRUE. (equivalent to !=)'
    }, {
      op: '>',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Boolen'],
      text: 'Performs greater-than operation: a > b'
    }, {
      op: '<',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Boolen'],
      text: 'Performs less-than operation: a < b'
    }, {
      op: '>=',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Boolen'],
      text: 'Performs greater-than-or-equal operation: a >= b'
    }, {
      op: '<=',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Boolen'],
      text: 'Performs less-than-or-equal operation: a <= b'
    }, {
      op: 'AND',
      fix: 'infix',
      sig: ['a: Boolean', 'b: Boolean', 'Boolen'],
      text: 'Performs logical AND: a AND b.'
    }, {
      op: 'OR',
      fix: 'infix',
      sig: ['a: Boolean', 'b: Boolean', 'Boolen'],
      text: 'Performs logical OR: a OR b.'
    }, {
      op: '^',
      fix: 'infix',
      sig: ['a: Number', 'b: Number', 'Number'],
      text: 'Performs exponentiation (a to the power of b): a ^ b'
    }, {
      op: 'NEG',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Performs negation of the value: NEG(value). (equivalent to -value)'
    }, {
      op: '-',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Performs negation of the value: -value. Note: no space can be present before "value". (equivalent to NEG(value))'
    }, {
      op: 'ISPRIME',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns TRUE if value is prime, FALSE otherwise.'
    }, {
      op: 'GCD',
      fix: 'prefix',
      sig: ['a: Number', 'b: Number', 'Number'],
      text: 'Returns the greatest common divisor of a and b.'
    }, {
      op: 'NOT',
      fix: 'prefix',
      sig: ['value: Boolean', 'Boolean'],
      text: 'Performs logical NOT of the value: NOT(value). (equivalent to !value)'
    }, {
      op: '!',
      fix: 'prefix',
      sig: ['value: Boolean', 'Boolean'],
      text: 'Performs logical NOT of the value: !value. (equivalent to NOT(value))'
    }, {
      op: 'ABS',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the absolute value of the number: ABS(value).'
    }, {
      op: 'ACOS',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the arc cosine (inverse cosine) of the number: ACOS(value).'
    }, {
      op: 'ACOSH',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the inverse hyperbolic cosine of the number: ACOSH(value).'
    }, {
      op: 'ASIN',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the arcsine of the number: ASIN(value).'
    }, {
      op: 'ASINH',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the inverse hyperbolic sine of the number: ASINH(value).'
    }, {
      op: 'ATAN',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the arctangent of the number: ATAN(value).'
    }, {
      op: 'ATAN2',
      fix: 'prefix',
      sig: ['y: Number', 'x: Number', 'Number'],
      text: 'Returns the angle (radians) from the X-axis to a point, given a cartesian y-coordinate and x-coordinate: ATAN2(y, x).'
    }, {
      op: 'ATANH',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the inverse hyperbolic tangent of the number: ATANH(value).'
    }, {
      op: 'CUBEROOT',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns an approximation of the cubed root of the number: CUBEROOT(value).'
    }, {
      op: 'COS',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the cosine of the number: COS(value).'
    }, {
      op: 'COSH',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the hyperbolic cosine of the number: COSH(value).'
    }, {
      op: 'EXP',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the natural logarithm (e) raised to this value: EXP(value).'
    }, {
      op: 'LN',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the natural logarithm (base e) of the number: LN(value).'
    }, {
      op: 'LOG',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the base 10 logarithm of the number: LOG(value).'
    }, {
      op: 'LOG2',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the base 2 logarithm of the number: LOG2(value).'
    }, {
      op: 'SIN',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the sine of the number: SIN(value).'
    }, {
      op: 'SINH',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the hyperbolic sine of the number: SINH(value).'
    }, {
      op: 'SQRT',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the square root of the number: SQRT(value).'
    }, {
      op: 'TAN',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the tangent of the number: TAN(value).'
    }, {
      op: 'TANH',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the hyperbolic tangent of the number: TANH(value).'
    }, {
      op: 'DEGREES',
      fix: 'prefix',
      sig: ['radians: Number', 'Number'],
      text: 'Performs a conversion of radians to degrees: DEGREES(radians).'
    }, {
      op: 'RADIANS',
      fix: 'prefix',
      sig: ['degrees: Number', 'Number'],
      text: 'Performs a conversion of radians to degrees: RADIANS(degrees).'
    }, {
      op: 'CEIL',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the smallest integer greater-than or equal-to the number: CEIL(value).'
    }, {
      op: 'FLOOR',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the greatest integer less-than or equal-to the number: CEIL(value).'
    }, {
      op: 'ROUND',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the value rounded to the nearest integer: ROUND(value).'
    }, {
      op: 'TRUNC',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the integral part of the number, truncating any fractional digits: TRUNC(value).'
    }, {
      op: 'SIGN',
      fix: 'prefix',
      sig: ['value: Number', 'Number'],
      text: 'Returns the sign of the value, indicating whether the number is positive (1) or negative (-1): SIGN(value).'
    }, {
      op: 'ISNAN',
      fix: 'prefix',
      sig: ['value', 'Boolean'],
      text: 'Returns TRUE if a value is not a number (e.g. the result of an invalid mathematical operation), otherwise returns FALSE: ISNAN(value).'
    }, {
      op: 'IF',
      fix: 'prefix',
      sig: ['condition: Boolean', 'then', 'else', 'result'],
      text: 'Tests the condition and returns the "then" value if the condition is TRUE, otherwise returns the "else" value: IF(condition, then, else).'
    }, {
      op: 'AVERAGE',
      fix: 'prefix',
      sig: ['values: Array of Numbers', 'Number'],
      text: 'Returns the average (mean) of an array of numbers. AVERAGE(array).'
    }, {
      op: 'SUM',
      fix: 'prefix',
      sig: ['values: Array of Numbers', 'Number'],
      text: 'Returns the sum of an array of numbers. SUM(array).'
    }, {
      op: 'MIN',
      fix: 'prefix',
      sig: ['values: Array of Numbers', 'Number'],
      text: 'Returns the minimum value in an array of numbers. MIN(array).'
    }, {
      op: 'MAX',
      fix: 'prefix',
      sig: ['values: Array of Numbers', 'Number'],
      text: 'Returns the maximum value in an array of numbers. MAX(array).'
    }, {
      op: 'CHAR',
      fix: 'prefix',
      sig: ['code: Integer', 'String'],
      text: 'Returns a single-character string with a unicode character representing the value of the given code. CHAR(code)'
    }, {
      op: 'CODE',
      fix: 'prefix',
      sig: ['string: String', 'Integer'],
      text: 'Returns the unicode value of the first character of a string: CODE(string)'
    }, {
      op: 'UPPER',
      fix: 'prefix',
      sig: ['string: String', 'String'],
      text: 'Converts a string to uppercase: UPPER(string).'
    }, {
      op: 'LOWER',
      fix: 'prefix',
      sig: ['string: String', 'String'],
      text: 'Converts a string to lowercase: LOWER(string).'
    }, {
      op: 'DEC2BIN',
      fix: 'prefix',
      sig: ['decimal: Integer', 'binary: String'],
      text: 'Returns a string of "1" and "0" characters representing the binary representation of the decimal value. DEC2BIN(decimal)'
    }, {
      op: 'DEC2HEX',
      fix: 'prefix',
      sig: ['decimal: Integer', 'binary: String'],
      text: 'Returns a string of characters representing the hexadecimal representation of the decimal value. DEC2HEX(decimal)'
    }, {
      op: 'SORT',
      fix: 'prefix',
      sig: ['array: Array', 'Array'],
      text: 'Returns a sorted array: SORT(array).'
    }, {
      op: 'REVERSE',
      fix: 'prefix',
      sig: ['array: Array', 'Array'],
      text: 'Returns a reversed array: REVERSE(array).'
    }, {
      op: 'INDEX',
      fix: 'prefix',
      sig: ['array: Array', 'Array'],
      text: 'Returns a reversed array: REVERSE(array).'
    }, {
      op: 'LENGTH',
      fix: 'prefix',
      sig: ['array: Array', 'Integer'],
      text: 'Returns the length of an array: LENGTH(array).'
    }, {
      op: 'JOIN',
      fix: 'prefix',
      sig: ['array: Array', 'separator: String', 'String'],
      text: 'Joins each array element into a string, using a separator: JOIN(array, separator).'
    }, {
      op: 'SPLIT',
      fix: 'prefix',
      sig: ['string: String', 'separator: String', 'Array'],
      text: 'Splits a string into an array of characters, using a separator: SPLIT(string, separator).'
    }, {
      op: 'STRING',
      fix: 'prefix',
      sig: ['array: Array', 'String'],
      text: 'Converts an array into a string: STRING(array).'
    }, {
      op: 'CHARARRAY',
      fix: 'prefix',
      sig: ['string: String', 'Array'],
      text: 'Converts a string into an array of characters: CHARARRAY(string)'
    }, {
      op: 'ARRAY',
      fix: 'prefix',
      sig: ['arguments...', 'Array'],
      text: 'Converts argments into an array: ARRAY(a, b, c, ...).'
    }, {
      op: 'MAP',
      fix: 'prefix',
      sig: ['mapper: Reference', 'array: Array', 'Array'],
      text: 'Performs a mapper function on each element of the array: MAP(mapper, array).'
    }, {
      op: 'REDUCE',
      fix: 'prefix',
      sig: ['reducer: Reference', 'start', 'array: Array', 'Array'],
      text: 'Performs a reducer function on each pair of array elements, using "start" as its starting value: REDUCE(reducer, array).'
    }, {
      op: 'RANGE',
      fix: 'prefix',
      sig: ['start: Integer', 'limit: Integer', 'Array'],
      text: 'Creates an array of integers, incrementing from start (included) to the limit (excluded): RANGE(start, limit)'
    }, {
      op: '[...]',
      fix: 'surround',
      sig: ['arguments...', 'Array'],
      text: 'Converts arguments into an array: [a, b, c, ...].'
    }]
  };
};

var _default = language;
exports["default"] = _default;

},{}]},{},[2]);
