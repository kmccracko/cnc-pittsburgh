// @ts-nocheck
// import debug from 'debug';
import * as supportsColor from 'supports-color';
const sC = supportsColor.default;

// Used for direct color picking instead of sequential
const colorObj = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  doubleunderline: '\x1b[21m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  crossout: '\x1b[9m',
  gray: '\x1b[90m',
  black: '\x1b[30m',
  white: '\x1b[37m',

  fg: {
    green: '\x1b[31m',
    red: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  },

  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    gray: '\x1b[100m',
  },
};

// Define sequential colors for namespaces
let c;

// If advanced color is supported by terminal, use advanced
const supportsAdvanced = sC && (sC.stderr || sC).level > 2;
if (supportsAdvanced) {
  c = [
    20, 26, 38, 40, 42, 43, 45, 56, 62, 69, 74, 75, 76, 77, 78, 79, 80, 81, 93,
    99, 113, 128, 129, 134, 135, 148, 160, 161, 163, 165, 166, 167, 168, 169,
    171, 172, 173, 179, 184, 185, 196, 197, 199, 201, 202, 203, 204, 205, 207,
    208, 209, 214, 215, 221,
  ];
  // otherwise, use basic
} else {
  c = [2, 3, 4, 5, 6];
}

// track namespace approval
const namespaces = {};
// track namespace color assignments
const assignments = {};
// track position in colors array
let i = -1;

// check if value of DEBUG variable matches current namespace being created
// used to determine if these logs will be ignored or not
const matchNamespace = (namespace, env) => {
  // translate wildcards
  let search = env.replaceAll('*', '.*');

  const posList: string[] = [];
  const negList: string[] = [];

  // split out "shoulds" and "should nots"
  search.split(',').forEach((el: any) => {
    if (el[0] === '-') negList.push(el.slice(1));
    else posList.push(el);
  });

  // if should Not, return false
  if (negList.length) {
    const negReg = new RegExp(`^(${negList.join('|')})$`);
    if (negReg.test(namespace)) return false;
  }
  // if not satifying "should", return false
  if (posList.length) {
    const posReg = new RegExp(`^(${posList.join('|')})$`);
    if (!posReg.test(namespace)) return false;
  }

  return true;
};

// assign the "next" color to the namespace
const generateColor = () => {
  // create prefix and suffix constants
  const prefix = '\x1B[3' + (supportsAdvanced ? '8;5;' : '');
  const suffix = ';1m';

  // increment position or loop to start
  const colorCode = c[++i] || c[(i = 0)];
  const color = `${prefix}${colorCode}${suffix}`;

  return color;
};

/**
 * Create and return a debug function instance, used like console.log.
 * Instances each have a namespace and color accessible through closure.
 *
 * If namespace does not match DEBUG env value, return a function that does nothing.
 *
 * Usage:
 *
 * - import betterDebug from '[wherever]'
 * - const debug = betterDebug('namespaceName')
 * - debug('text to log to the terminal')
 *
 * @param {string} namespace The namespace string with which logs will be associated.
 * @param {string} env (optional) Use when an environment variable will not be accessible through 'process.env'. Currently intended for frontend.
 * @returns function
 */
const betterDebug = (namespace, env?) => {
  const emptyFunc = () => {};
  try {
    env = env || process.env.DEBUG;
  } catch {
    env = undefined;
  }

  // if debug not set in env or namespace is known to not match, return
  if (!env || namespaces[namespace] === false) return emptyFunc;

  // if we haven't seen this namespace, validate it
  if (namespaces[namespace] === undefined) {
    // if namespace doesn't match env variable, save as invalid and return
    if (!matchNamespace(namespace, env)) {
      namespaces[namespace] = false;
      return emptyFunc;
    }
    // if valid, save as validated
    namespaces[namespace] = true;
  }

  // if a color has already been assigned to this namespace, use it
  // otherwise, assign a new color to this namespace
  assignments[namespace] = assignments[namespace] || generateColor();

  // return a function that decorates a console log with time and namespace
  // color the namespace [color] and color the ">>" gray
  // result: 2:52:01 PM namespace:test >> hello, world!
  return (...args) => {
    console.log(
      `${new Date().toLocaleTimeString()} ${
        assignments[namespace]
      }${namespace} ${colorObj.gray}>>${colorObj.reset}`,
      ...args
    );
  };
};
export default betterDebug;
