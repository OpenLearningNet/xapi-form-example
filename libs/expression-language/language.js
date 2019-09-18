
const unpackArgs = (f) => (expr) => {
  const args = expr();
  if (!args.isArgumentArray && f.length <= 1) {
    return f(() => args);
  } else if (args.length === f.length || f.length === 0) {
    return f.apply(null, args);
  } else {
    throw new Error("Incorrect number of arguments.");
  }
};

const language = function(termDelegate, prefix) {
  let prefixOps, infixOps;

  const call = (name) => {
    const upperName = name.toUpperCase();
    if (prefixOps.hasOwnProperty(upperName)) {
      return (expr) => prefixOps[upperName](() => expr);
    } else if (infixOps.hasOwnProperty(upperName)) {
      return (expr) => {
        const [arg1, arg2] = expr;
        return infixOps[upperName](() => arg1, () => arg2);
      };
    } else {
      throw new Error(`Unknown function: ${name}`);
    }
  };

  infixOps = {
    '+': (a, b)   => a() + b(),
    '-': (a, b)   => a() - b(),
    '*': (a, b)   => a() * b(),
    '/': (a, b)   => a() / b(),
    ',': (a, b)   => {
      const aVal = a();
      const aArr = aVal.isArgumentArray ? aVal : [() => aVal];
      const args = aArr.concat([b]);
      args.isArgumentArray = true;
      return args;
    },
    'MOD': (a, b) => a() % b(),
    '%': (a, b)   => a() % b(),
    '=': (a, b)   => a() === b(),
    '!=': (a, b)  => a() !== b(),
    '<>': (a, b)  => a() !== b(),
    '>': (a, b)   => a() > b(),
    '<': (a, b)   => a() < b(),
    '>=': (a, b)  => a() >= b(),
    '<=': (a, b)  => a() <= b(),
    'AND': (a, b) => a() && b(),
    'OR': (a, b)  => a() || b(),
    '^': (a, b)   => Math.pow(a(), b()),
  };

  prefixOps = Object.assign({
    'NEG': (arg) => -arg(),
    'ISPRIME': (arg) => {
      const val = arg();
      for (let i = 2, s = Math.sqrt(val); i <= s; i++) {
        if (val % i === 0) return false;
      }
      return val !== 1;
    },
    'GCD': (arg1, arg2) => {
      let a = arg1();
      let b = arg2();
      a = Math.abs(a);
      b = Math.abs(b);
      if (b > a) {var temp = a; a = b; b = temp;}
      while (true) {
          if (b === 0) return a;
          a %= b;
          if (a === 0) return b;
          b %= a;
      }
    },
    'NOT': (arg)   => !arg(),
    '!':   (arg)   => !arg(),
    'ABS': (arg)   => Math.abs(arg()),
    'ACOS': (arg)  => Math.acos(arg()),
    'ACOSH': (arg) => Math.acosh(arg()),
    'ASIN': (arg)  => Math.asin(arg()),
    'ASINH': (arg) => Math.asinh(arg()),
    'ATAN': (arg)  => Math.atan(arg()),

    'ATAN2': (arg1, arg2) => Math.atan2(arg1(), arg2()),

    'ATANH': (arg)    => Math.atanh(arg()),
    'CUBEROOT': (arg) => Math.cbrt(arg()),
    'CEIL': (arg)     => Math.ceil(arg()),

    'COS': (arg)   => Math.cos(arg()),
    'COSH': (arg)  => Math.cos(arg()),
    'EXP': (arg)   => Math.exp(arg()),
    'FLOOR': (arg) => Math.floor(arg()),
    'LN': (arg)    => Math.log(arg()),
    'LOG': (arg)   => Math.log10(arg()),
    'LOG2': (arg)  => Math.log2(arg()),
    'SIN': (arg)   => Math.sin(arg()),
    'SINH': (arg)  => Math.sinh(arg()),
    'SQRT': (arg)  => Math.sqrt(arg()),
    'TAN': (arg)   => Math.tan(arg()),
    'TANH': (arg)  => Math.tanh(arg()),
    'ROUND': (arg) => Math.round(arg()),
    'SIGN': (arg)  => Math.sign(arg()),
    'TRUNC': (arg) => Math.trunc(arg()),

    'IF': (arg1, arg2, arg3) => {
      const condition = arg1;
      const thenStatement = arg2;
      const elseStatement = arg3;

      if (condition()) {
        return thenStatement();
      } else if (elseStatement) {
        return elseStatement();
      } else {
        return null;
      }
    },

    'AVERAGE': (arg) => {
      const arr = arg();
      const sum = arr.reduce((prev, curr) => (prev + curr), 0)
      return (sum/arr.length);
    },

    'SUM': (arg)  => arg().reduce((prev, curr) => (prev + curr), 0),
    'CHAR': (arg) => String.fromCharCode(arg()),
    'CODE': (arg) => arg().charCodeAt(0),

    'DEC2BIN': (arg) => arg().toString(2),
    'DEC2HEX': (arg) => arg().toString(16),
    'DEGREES': (arg) => (arg() * 180/Math.PI),
    'RADIANS': (arg) => (arg() * Math.PI/180),

    'MIN': (arg) => {
      const arr = arg();
      return arr.reduce(
        (prev, curr) => Math.min(prev, curr()),
        Number.POSITIVE_INFINITY
      );
    },
    'MAX': (arg) => arg().reduce(
      (prev, curr) => Math.max(prev, curr()),
      Number.NEGATIVE_INFINITY
    ),
    'SORT': (arg) => {
      const arr = arg().slice();
      arr.sort();
      return arr;
    },
    'REVERSE': (arg)  => {
      const arr = arg().slice();
      arr.reverse();
      return arr;
    },
    'INDEX': (arg1, arg2) => arg2()[arg1()],
    'LENGTH': (arg) => {
      return arg().length;
    },
    'JOIN': (arg1, arg2) => arg2().join(arg1()),
    'STRING': (arg) => arg().join(''),
    'SPLIT': (arg1, arg2) => arg2().split(arg1()),
    'CHARARRAY': (arg) => {
      const str = arg();
      return str.split('');
    },
    'ARRAY': (arg) => {
      const val = arg();
      return val.isArgumentArray ? val.slice() : [val];
    },
    'ISNAN': (arg) => isNaN(arg()),
    'MAP': (arg1, arg2) => {
      const name = arg1();
      const array = arg2();
      return array.map((val) => call(name)(val));
    },
    'REDUCE': (arg1, arg2, arg3) => {
      const name = arg1();
      const start = arg2();
      const array = arg3();
      return array.reduce((prev, curr) => call(name)([prev, curr()]), start);
    },
    'RANGE': (arg1, arg2) => {
      const start = arg1();
      const limit = arg2();
      const result = [];
      for (let i = start; i < limit; i++) {
        result.push(i);
      };
      return result;
    },
    'UPPER': (arg) => arg().toUpperCase(),
    'LOWER': (arg) => arg().toLowerCase()
  }, prefix);

  // Ensure arguments are unpacked accordingly
  // Except for the ARRAY constructor
  Object.keys(prefixOps).forEach(key => {
    if (key !== 'ARRAY') {
      prefixOps[key] = unpackArgs(prefixOps[key]);
    }
  });

  return {
    INFIX_OPS: infixOps,
    PREFIX_OPS: prefixOps,
    PRECEDENCE: [
      Object.keys(prefixOps),
      ['^'],
      ['*', '/', '%', 'MOD'],
      ['+', '-'],
      ['<', '>', '<=', '>='],
      ['=', '!=', '<>'],
      ['AND', 'OR'],
      [',']
    ],
    LITERAL_OPEN: '"',
    LITERAL_CLOSE: '"',
    GROUP_OPEN: '(',
    GROUP_CLOSE: ')',
    SEPARATOR: ' ',
    SYMBOLS: [
      '^', '*', '/', '%',
      '+', '-', '<', '>',
      '=', '!', ',', '"',
      '(', ')', '[', ']'
    ],
    AMBIGUOUS: {
      '-': 'NEG'
    },
    SURROUNDING: {
      'ARRAY': {
        OPEN: '[',
        CLOSE: ']'
      }
    },

    termDelegate: function(term) {
      const numVal = parseFloat(term);
      if (Number.isNaN(numVal)) {
        switch(term) {
          case 'E': return Math.E;
          case 'LN2': return Math.LN2;
          case 'LN10': return Math.LN10;
          case 'LOG2E': return Math.LOG2E;
          case 'LOG10E': return Math.LOG10E;
          case 'PI': return Math.PI;
          case 'SQRTHALF': return Math.SQRT1_2;
          case 'SQRT2': return Math.SQRT2;
          case 'FALSE': return false;
          case 'TRUE': return true;
          case 'EMPTY': return [];
          default: return termDelegate(term)
        }
      } else {
        return numVal;
      }
    },

    isCaseInsensitive: true,

    descriptions: [
      {
        op: '+',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Number'],
        text: 'Performs addition: a + b'
      },
      {
        op: '-',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Number'],
        text: 'Performs subtraction: a - b'
      },
      {
        op: '/',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Number'],
        text: 'Performs division: a / b'
      },
      {
        op: ',',
        fix: 'infix',
        sig: ['a', 'b', 'Arguments'],
        text: 'Returns an array of arguments with b appended to a. If a is not an argument array, it is automatically appended to an empty array.'
      },
      {
        op: 'MOD',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Number'],
        text: 'Performs modulo operation: a MOD b. (equivalent to %)'
      },
      {
        op: '%',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Number'],
        text: 'Performs modulo operation: a % b. (equivalent to MOD)'
      },
      {
        op: '=',
        fix: 'infix',
        sig: ['a', 'b', 'Boolean'],
        text: 'Returns TRUE if a = b. Otherwise returns FALSE.'
      },
      {
        op: '!=',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Number'],
        text: 'Returns FALSE if a = b. Otherwise returns TRUE. (equivalent to <>)'
      },
      {
        op: '<>',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Number'],
        text: 'Returns FALSE if a = b. Otherwise returns TRUE. (equivalent to !=)'
      },
      {
        op: '>',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Boolen'],
        text: 'Performs greater-than operation: a > b'
      },
      {
        op: '<',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Boolen'],
        text: 'Performs less-than operation: a < b'
      },
      {
        op: '>=',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Boolen'],
        text: 'Performs greater-than-or-equal operation: a >= b'
      },
      {
        op: '<=',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Boolen'],
        text: 'Performs less-than-or-equal operation: a <= b'
      },
      {
        op: 'AND',
        fix: 'infix',
        sig: ['a: Boolean', 'b: Boolean', 'Boolen'],
        text: 'Performs logical AND: a AND b.'
      },
      {
        op: 'OR',
        fix: 'infix',
        sig: ['a: Boolean', 'b: Boolean', 'Boolen'],
        text: 'Performs logical OR: a OR b.'
      },
      {
        op: '^',
        fix: 'infix',
        sig: ['a: Number', 'b: Number', 'Number'],
        text: 'Performs exponentiation (a to the power of b): a ^ b'
      },
      {
        op: 'NEG',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Performs negation of the value: NEG(value). (equivalent to -value)'
      },
      {
        op: '-',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Performs negation of the value: -value. Note: no space can be present before "value". (equivalent to NEG(value))'
      },
      {
        op: 'ISPRIME',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns TRUE if value is prime, FALSE otherwise.'
      },
      {
        op: 'GCD',
        fix: 'prefix',
        sig: ['a: Number', 'b: Number', 'Number'],
        text: 'Returns the greatest common divisor of a and b.'
      },
      {
        op: 'NOT',
        fix: 'prefix',
        sig: ['value: Boolean', 'Boolean'],
        text: 'Performs logical NOT of the value: NOT(value). (equivalent to !value)'
      },
      {
        op: '!',
        fix: 'prefix',
        sig: ['value: Boolean', 'Boolean'],
        text: 'Performs logical NOT of the value: !value. (equivalent to NOT(value))'
      },
      {
        op: 'ABS',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the absolute value of the number: ABS(value).'
      },
      {
        op: 'ACOS',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the arc cosine (inverse cosine) of the number: ACOS(value).'
      },
      {
        op: 'ACOSH',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the inverse hyperbolic cosine of the number: ACOSH(value).'
      },
      {
        op: 'ASIN',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the arcsine of the number: ASIN(value).'
      },
      {
        op: 'ASINH',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the inverse hyperbolic sine of the number: ASINH(value).'
      },
      {
        op: 'ATAN',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the arctangent of the number: ATAN(value).'
      },
      {
        op: 'ATAN2',
        fix: 'prefix',
        sig: ['y: Number', 'x: Number', 'Number'],
        text: 'Returns the angle (radians) from the X-axis to a point, given a cartesian y-coordinate and x-coordinate: ATAN2(y, x).'
      },
      {
        op: 'ATANH',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the inverse hyperbolic tangent of the number: ATANH(value).'
      },
      {
        op: 'CUBEROOT',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns an approximation of the cubed root of the number: CUBEROOT(value).'
      },
      {
        op: 'COS',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the cosine of the number: COS(value).'
      },
      {
        op: 'COSH',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the hyperbolic cosine of the number: COSH(value).'
      },
      {
        op: 'EXP',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the natural logarithm (e) raised to this value: EXP(value).'
      },
      {
        op: 'LN',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the natural logarithm (base e) of the number: LN(value).'
      },
      {
        op: 'LOG',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the base 10 logarithm of the number: LOG(value).'
      },
      {
        op: 'LOG2',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the base 2 logarithm of the number: LOG2(value).'
      },
      {
        op: 'SIN',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the sine of the number: SIN(value).'
      },
      {
        op: 'SINH',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the hyperbolic sine of the number: SINH(value).'
      },
      {
        op: 'SQRT',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the square root of the number: SQRT(value).'
      },
      {
        op: 'TAN',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the tangent of the number: TAN(value).'
      },
      {
        op: 'TANH',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the hyperbolic tangent of the number: TANH(value).'
      },
      {
        op: 'DEGREES',
        fix: 'prefix',
        sig: ['radians: Number', 'Number'],
        text: 'Performs a conversion of radians to degrees: DEGREES(radians).'
      },
      {
        op: 'RADIANS',
        fix: 'prefix',
        sig: ['degrees: Number', 'Number'],
        text: 'Performs a conversion of radians to degrees: RADIANS(degrees).'
      },
      {
        op: 'CEIL',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the smallest integer greater-than or equal-to the number: CEIL(value).'
      },
      {
        op: 'FLOOR',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the greatest integer less-than or equal-to the number: CEIL(value).'
      },
      {
        op: 'ROUND',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the value rounded to the nearest integer: ROUND(value).'
      },
      {
        op: 'TRUNC',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the integral part of the number, truncating any fractional digits: TRUNC(value).'
      },
      {
        op: 'SIGN',
        fix: 'prefix',
        sig: ['value: Number', 'Number'],
        text: 'Returns the sign of the value, indicating whether the number is positive (1) or negative (-1): SIGN(value).'
      },
      {
        op: 'ISNAN',
        fix: 'prefix',
        sig: ['value', 'Boolean'],
        text: 'Returns TRUE if a value is not a number (e.g. the result of an invalid mathematical operation), otherwise returns FALSE: ISNAN(value).'
      },
      {
        op: 'IF',
        fix: 'prefix',
        sig: ['condition: Boolean', 'then', 'else', 'result'],
        text: 'Tests the condition and returns the "then" value if the condition is TRUE, otherwise returns the "else" value: IF(condition, then, else).'
      },
      {
        op: 'AVERAGE',
        fix: 'prefix',
        sig: ['values: Array of Numbers', 'Number'],
        text: 'Returns the average (mean) of an array of numbers. AVERAGE(array).'
      },
      {
        op: 'SUM',
        fix: 'prefix',
        sig: ['values: Array of Numbers', 'Number'],
        text: 'Returns the sum of an array of numbers. SUM(array).'
      },
      {
        op: 'MIN',
        fix: 'prefix',
        sig: ['values: Array of Numbers', 'Number'],
        text: 'Returns the minimum value in an array of numbers. MIN(array).'
      },
      {
        op: 'MAX',
        fix: 'prefix',
        sig: ['values: Array of Numbers', 'Number'],
        text: 'Returns the maximum value in an array of numbers. MAX(array).'
      },
      {
        op: 'CHAR',
        fix: 'prefix',
        sig: ['code: Integer', 'String'],
        text: 'Returns a single-character string with a unicode character representing the value of the given code. CHAR(code)'
      },
      {
        op: 'CODE',
        fix: 'prefix',
        sig: ['string: String', 'Integer'],
        text: 'Returns the unicode value of the first character of a string: CODE(string)'
      },
      {
        op: 'UPPER',
        fix: 'prefix',
        sig: ['string: String', 'String'],
        text: 'Converts a string to uppercase: UPPER(string).'
      },
      {
        op: 'LOWER',
        fix: 'prefix',
        sig: ['string: String', 'String'],
        text: 'Converts a string to lowercase: LOWER(string).'
      },
      {
        op: 'DEC2BIN',
        fix: 'prefix',
        sig: ['decimal: Integer', 'binary: String'],
        text: 'Returns a string of "1" and "0" characters representing the binary representation of the decimal value. DEC2BIN(decimal)'
      },
      {
        op: 'DEC2HEX',
        fix: 'prefix',
        sig: ['decimal: Integer', 'binary: String'],
        text: 'Returns a string of characters representing the hexadecimal representation of the decimal value. DEC2HEX(decimal)'
      },
      {
        op: 'SORT',
        fix: 'prefix',
        sig: ['array: Array', 'Array'],
        text: 'Returns a sorted array: SORT(array).'
      },
      {
        op: 'REVERSE',
        fix: 'prefix',
        sig: ['array: Array', 'Array'],
        text: 'Returns a reversed array: REVERSE(array).'
      },
      {
        op: 'INDEX',
        fix: 'prefix',
        sig: ['array: Array', 'Array'],
        text: 'Returns a reversed array: REVERSE(array).'
      },
      {
        op: 'LENGTH',
        fix: 'prefix',
        sig: ['array: Array', 'Integer'],
        text: 'Returns the length of an array: LENGTH(array).'
      },
      {
        op: 'JOIN',
        fix: 'prefix',
        sig: ['array: Array', 'separator: String', 'String'],
        text: 'Joins each array element into a string, using a separator: JOIN(array, separator).'
      },
      {
        op: 'SPLIT',
        fix: 'prefix',
        sig: ['string: String', 'separator: String', 'Array'],
        text: 'Splits a string into an array of characters, using a separator: SPLIT(string, separator).'
      },
      {
        op: 'STRING',
        fix: 'prefix',
        sig: ['array: Array', 'String'],
        text: 'Converts an array into a string: STRING(array).'
      },
      {
        op: 'CHARARRAY',
        fix: 'prefix',
        sig: ['string: String', 'Array'],
        text: 'Converts a string into an array of characters: CHARARRAY(string)'
      },
      {
        op: 'ARRAY',
        fix: 'prefix',
        sig: ['arguments...', 'Array'],
        text: 'Converts argments into an array: ARRAY(a, b, c, ...).'
      },
      {
        op: 'MAP',
        fix: 'prefix',
        sig: ['mapper: Reference', 'array: Array', 'Array'],
        text: 'Performs a mapper function on each element of the array: MAP(mapper, array).'
      },
      {
        op: 'REDUCE',
        fix: 'prefix',
        sig: ['reducer: Reference', 'start', 'array: Array', 'Array'],
        text: 'Performs a reducer function on each pair of array elements, using "start" as its starting value: REDUCE(reducer, array).'
      },
      {
        op: 'RANGE',
        fix: 'prefix',
        sig: ['start: Integer', 'limit: Integer', 'Array'],
        text: 'Creates an array of integers, incrementing from start (included) to the limit (excluded): RANGE(start, limit)'
      },
      {
        op: '[...]',
        fix: 'surround',
        sig: ['arguments...', 'Array'],
        text: 'Converts arguments into an array: [a, b, c, ...].'
      }
    ]
  };
};

export default language;
