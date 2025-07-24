/*
  auxiliary functions and objects
*/

// return array of elements by the selector
function uniqBy(array, selector = (x) => x) {
  let indexes = [];
  let output = [];
  array.forEach((x) => {
    let ind = selector(x);
    if (indexes.indexOf(ind) === -1) {
      indexes.push(ind);
      output.push(x);
    }
  });

  return output;
}

function intersection(array1, array2) {
  if (array1.length < array2.length) {
    var arrayA = array1; // shorter
    var arrayB = array2;
  } else {
    arrayA = array2;
    arrayB = array1;
  }

  let intersect = [];
  arrayA.forEach((value) => {
    if (arrayB.indexOf(value) !== -1 && intersect.indexOf(value) === -1) {
      intersect.push(value);
    }
  });

  return intersect;
}

function differenceBy(array1, array2, selector = (x) => x) {
  let result = [];
  array1.forEach((x) => {
    let selected1 = selector(x);
    if (array2.map(selector).indexOf(selected1) === -1) {
      result.push(x);
    }
  });

  return result;
}

function flatten(o){
  if (typeof o!== 'object')
    throw new TypeError('Object required.');
  
  let res = {};
  Object.entries(o).forEach(([key, value]) => {
    if(value instanceof Array) {
      res[key + '[]'] = value.map((x) => {
        if(typeof x === 'object'){
          return JSON.stringify(x);
        }else{
          return x;
        }
      }).join('; ');
    } else if (typeof value !== 'object') {
      res[key] = value;
    } else {
      let flat = flatten(value);
      Object.entries(flat)
        .forEach(([keyDeep, valueDeep]) => res[key + '.' + keyDeep] = valueDeep);
    }
  });

  return res;
}

// clone all own properties and arrays
function cloneDeep(o) {
  if (o instanceof Object) {
    var clone;
    if (o instanceof Array) {
      clone = o.map((key) => cloneDeep(key));
    } else {
      clone = {};
      Object.keys(o).forEach((key) => {
        clone[key] = cloneDeep(o[key]);
      });
    }
    
    return clone;
  } else {
    return o;
  }
}

// take path of type 'a[1].b' and return array of parts
// e.g. ['a', 1, 'b']
function _parsePath(path) {
  // check if path is valid
  if (typeof path !== 'string') {
    throw new TypeError(`Path must be a string, got ${typeof path}.`);
  }

  // parse string sequentially
  let pathArray = [];
  if (path === '') {
    return pathArray; // empty path
  }
  
  let parts1 = path.split('.');
  for (let part of parts1) {
    let regExpr = /^([a-zA-Z_][a-zA-Z0-9_]*)?(\[[0-9]+\])*$/;
    if (!regExpr.test(part)) {
      throw new TypeError(`Path "${part}" is not valid.`);
    }

    let parts2 = part.split('[');
    if (parts2[0] !== '') {
      pathArray.push(parts2[0]); // add property name
    }
    if (parts2.length > 1) {
      for (let i = 1; i < parts2.length; i++) {
        let subPart = parts2[i].replace(']', ''); // remove trailing ]
        if (subPart) {
          pathArray.push(Number(subPart)); // convert to number
        }
      }
    }
  }
  
  return pathArray;
}

// take path of type ['a', 1, 'b'] and return value or undefined
function _getByPathArray(pathArray = []) {
  let current = this;

  for (let part of pathArray) {
    current = current[part];
    if (current === undefined) {
      return undefined;
    }
  }
  return current;
}

// MUTABLE function
// take path of type 'a[1].b' and set value, add missing properties
function _setByPathArray(pathArray = [], value) {
  let current = this;

  for (let i = 0; i < pathArray.length; i++) {
    let part = pathArray[i];
    if (i === pathArray.length - 1) { // last part, set value
      current[part] = value;
    } else {
      if (typeof pathArray[i + 1] === 'number' && !Array.isArray(current[part])) {
        current[part] = []; // next is number, so it is an array
      } else if (typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {}; // next is string, so it is an object
      }
      current = current[part];
    }
  }
}

module.exports = {
  uniqBy,
  intersection,
  differenceBy,
  flatten,
  cloneDeep,
  _parsePath, // just to test
  _getByPathArray, // just to test
  _setByPathArray // just to test
};
