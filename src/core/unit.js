const { floor, log10 } = Math;
const { UnitTerm } = require('./unit-term');
const prefixes = {
  '1.00000000e-2':       'centi',
  '1.00000000e-1':       'deci',
  '1.00000000e+1':       'deka',
  '1.00000000e-15':      'femto',
  '1.00000000e+9':       'giga',
  '1.00000000e+2':       'hecto',
  '1.00000000e+3':       'kilo',
  '1.00000000e+6':       'mega',
  '1.00000000e-6':       'micro',
  '1.00000000e-3':       'milli',
  '1.00000000e-9':       'nano',
  '1.00000000e-12':      'pico',
  '1.00000000e+12':      'tera'
};

class Unit extends Array {
  static fromQ(obj = []){
    let res = new Unit;

    obj.forEach((x) => {
      if (typeof x.kind !== 'string')
        throw new TypeError('kind property must be string.');
      //res.push(Object.assign({multiplier: 1, exponent: 1}, x)); // to copy all properties from x
      res.push({
        kind: x.kind,
        multiplier: x.multiplier !== undefined ? x.multiplier : 1,
        exponent: x.exponent !== undefined ? x.exponent : 1
      });
    });

    return res;
  }
  toQ(options = {}){
    return this.map((x) => {
      return {
        kind: x.kind,
        multiplier: x.multiplier,
        exponent: x.exponent
      };
    });
  }
  clone(){
    let clonedUnit = new Unit();
    this.forEach((u) => clonedUnit.push({
      kind: u.kind,
      multiplier: u.multiplier,
      exponent: u.exponent
    }));

    return clonedUnit;
  }
  // transform any proper complex units to the another unit structure which includes only units from the list
  // only for bound units !
  // rebased units are not bound
  rebase(legalUnits = []){
    let unit = new Unit();

    this.forEach((x) => {
      if (legalUnits.indexOf(x.kind) !== -1) { // is legal? just push without refs!
        unit.push({
          kind: x.kind,
          multiplier: x.multiplier,
          exponent: x.exponent
        });
      } else {
        if (typeof x.kindObj === 'undefined') {
          throw new TypeError(`Cannot rebase the unbound unit: "${x.kind}"`);
        }
        let unitDefRebased = x.kindObj // is not legal? analyze refs and concat!
          .unitsParsed
          .rebase(legalUnits)
          .map((y) => {
            // combine deep units with the current: 
            // unit = (mult_x*u2)^exp_x = (mult_x * (mult_y*u3)^exp_y)^exp_x
            return {
              kind: y.kind,
              exponent: y.exponent * x.exponent,
              multiplier: y.multiplier * x.multiplier**(1/y.exponent)
            };
          });
        unit = unit.concat(unitDefRebased);
      }
    });

    return unit;
  }
  // primitive units are units without internal "units" property
  // only for bound units !
  rebaseToPrimitive(){
    let unit = new Unit();

    this.forEach((x) => {
      if (typeof x.kindObj === 'undefined') {
        throw new TypeError(`Cannot rebase the unbound unit: "${x.kind}"`);
      }
      let parsed = x.kindObj.unitsParsed;
      if (typeof parsed === 'undefined') { // is primitive? just push without refs!
        unit.push({kind: x.kind, exponent: x.exponent, multiplier: x.multiplier});
      } else {
        parsed // is not primitive? analyze refs and push!
          .rebaseToPrimitive()
          .forEach((y) => {
            // combine deep units with the current: 
            // unit = (mult_x*u2)^exp_x = (mult_x * (mult_y*u3)^exp_y)^exp_x
            unit.push({
              kind: y.kind,
              exponent: y.exponent * x.exponent,
              multiplier: y.multiplier * x.multiplier**(1/y.exponent)
            });
          });
      }
    });

    return unit;
  }
  /**
   * Multiply two units.
   *
   * @param {Unit} unit - the second unit
   *
   * @returns {Unit} result of multiplying
   */
  multiply(unit) {
    let res = this.concat(unit);

    return res;
  }

  /**
   * Divide two units.
   *
   * @param {Unit} unit - the second unit
   *
   * @returns {Unit} Result of division.
   */
  divide(unit) {
    let newUnit = unit.map((item) => {
      let current = Object.assign({}, item); // clone
      current.exponent *= -1;
      return current;
    });

    let res = this.concat(newUnit);
    return res;
  }
  power(n = 1){
    if (typeof n !== 'number') throw new TypeError('n in power must be a Number, got' + n);

    return this.map((item) => {
      return Object.assign({}, item, {exponent: item.exponent * n});
    });
  }
  root(n = 1) {
    if (typeof n !== 'number') throw new TypeError('n in power must be a Number, got' + n);

    return this.map((item) => {
      return Object.assign({}, item, {exponent: item.exponent / n});
    });
  }
  /**
   * Simplify unit expression if it is possible. // only for bound units !
   *
   * @dimensionlessKind {String} What to set if we want to simplify litre/litre
   * 
   * @return {Unit} Simplified version of units. 
   * If if exponent == 0, create dimensionless element to store multiplier
   * if dimensionless element is trivial remove it
   */
  simplify(dimensionlessKind = 'dimensionless') {
    // analyze only dimensionless
    // multiplier integrating all dimensionless multipliers
    let commonLogMultiplier = this
      .filter((x) => x.kind === dimensionlessKind)
      .reduce((acc, x) => acc + x.exponent * log10(x.multiplier), 0);

    // group by kind, combine elements inside kind
    // then transform to regular array
    let groupObj = this
      .filter((x) => x.kind !== dimensionlessKind)
      .reduce((accumulator, value) => {
        !accumulator[value.kind] && (accumulator[value.kind] = []);
        accumulator[value.kind].push(value); 
        return accumulator;
      }, {});
    let group = Object.entries(groupObj)
      .map(([key, x]) => {
        let exponent = x.reduce((acc, y) => acc + y.exponent, 0);
        if (exponent === 0) { // add to multiplier
          commonLogMultiplier += x.reduce((acc, y) => acc + y.exponent * log10(y.multiplier), 0);
          var res = undefined;
        } else {
          let tmp = x.reduce((acc, y) => acc + y.exponent * log10(y.multiplier), 0);
          let multiplier = 10 ** (tmp / exponent);
          res = {
            kind: key,
            exponent: exponent,
            multiplier: multiplier
          };
          // if there is reference to UnitDef, than copy it
          if (x[0].kindObj) res.kindObj = x[0].kindObj;
        }

        return res;
      })
      .filter((x) => typeof x !== 'undefined');

    // push dimensionless if multiplier !== 1
    if (commonLogMultiplier !== 0) group.push({
      kind: dimensionlessKind,
      exponent: 1,
      multiplier: 10 ** commonLogMultiplier
    });
      
    return (new Unit()).concat(group);
  }
  equal(unit, rebase = false) {
    if (!(unit instanceof Unit)) {
      throw new TypeError('You must use Unit to check equality, got ' + unit);
    }
    let left = !rebase ? this : this.rebaseToPrimitive();
    let right = !rebase ? unit : unit.rebaseToPrimitive();
    let res = left.divide(right).simplify();
    
    return res.length === 0;
  }
  
  /**
   * Creates Unit object from string.
   *
   * @param {String} unitString - string of format 'mM^2*L/mg/h2' or (1e-2 mg)^3/L
   * @return {Unit} A Unit object.
   */
  static parse(unitString) {
    let unit = new Unit();

    // create string from number
    unitString += '';

    let items = unitString // split to parts
      .replace(/\s*/g, '') // remove blanks
      .match(/.[^*/]*/g);

    if (items === null)
      throw new SyntaxError(`Wrong syntax of unit: "${unitString}"`);

    items.forEach((item) => {
      // long item may reult in unsafe behavior, too long
      if (item.length > 100) {
        throw new SyntaxError(`Unit item is too long: "${item}"`);
      }

      // checking "/xxx^12.23" or "1" or "/1"
      let shortFormat = /^(\/|\*)?[_A-Za-z1][_A-Za-z0-9]*\^?(\d+(\.?\d*)?)?$/;
      // checking "/(1e-2xxx)^12.23"
      let longFormat = /^(\/|\*)?\((\d+(\.\d*)?)?([eE][+-]?\d+)?([_A-Za-z][_A-Za-z0-9]*)?\)\^?(\d+(\.?\d*)?)?$/;
      
      if (!shortFormat.test(item) && !longFormat.test(item)) 
        throw new SyntaxError(`Wrong syntax of unit's item: "${unitString}"`);

      let matcher = /^([/*]?)[(]?(\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)?([_A-Za-z][_A-Za-z0-9]*)?[)]?\^?(\d+(?:\.?\d*)?)?$/;
      let mmm = item.match(matcher);

      let kind = mmm[3] === undefined ? 'dimensionless' : mmm[3];
      let pow = mmm[4] === undefined ? 1 : mmm[4];
      let exponent = mmm[1] === '/' // searching constructions "1/L", "/L"
        ? (-1) * pow
        : 1 * pow;
      let multiplier = mmm[2] === undefined ? 1 : parseFloat(mmm[2]);

      if (!(kind === 'dimensionless' && multiplier === 1)) { // skip dimensionless without multiplier
        unit.push({
          kind: kind,
          exponent: exponent,
          multiplier: multiplier
        });
      }
    });

    return unit;
  }

  /**
   * Serialize unit-object to identifier.
   *
   * @return {string} of type '\_mM2_L\__mg\__h2'
   */
  toHash(){
    if (this.length === 0) {
      return '_dimensionless';
    } else {
      return this.concat([]) // clone array to exclude mutation
        .sort((x1, x2) => x1.kind > x2.kind ? -1 : 1) // sort by kind id
        .map((item) => {
          let operator = item.exponent < 0
            ? '__' // means "/"
            : '_'; // means "*"

          if (item.multiplier === 1 || typeof item.multiplier === 'undefined') {
            var multiplier = '';
          } else {
            // transforms 1.23e-5 => 123n5
            multiplier = item.multiplier
              .toExponential()
              .replace(/\./, '')
              .replace(/e-/, 'n')
              .replace(/e\+/, 'p');
          }

          let expAbs = Math.abs(item.exponent); // absolute value
          let exponent = (expAbs!==1)
            ? String(expAbs).replace('.', '_')
            : '';

          return operator + multiplier + item.kind + exponent;
        })
        .join('');
    }
  }
  /**
   * Serialize Unit object to string.
   *
   * @return {string} of format: 'mM2*L/mg/h2'
   */
  toString(usePrefix = false){

    // set an element not to be empty
    let normalizedUnit = this.length === 0 
      ? [{kind: 'dimensionless', multiplier: 1, exponent: 1}] // not a Unit actually
      : this;

    return normalizedUnit
      .map((item, i) => {
        if (!usePrefix) { // without prefix
          // currently all outputs normalized to dimensionless
          /*if (item.kind === 'dimensionless' && item.multiplier === 1) {
            kindUpd = '1';
          } else if (item.kind === 'dimensionless') {
            kindUpd = '(' + item.multiplier.toExponential() + ' )'; // TODO: remove space if kind is empty
          } else */if (item.multiplier === 1) { 
            var kindUpd = item.kind;
          } else {
            kindUpd = '(' + item.multiplier.toExponential() + ' ' + item.kind + ')';
          }
        } else { // with prefix
          if (item.multiplier === 1) {
            kindUpd = item.kind;
          } else {
            let exponential = item.multiplier.toExponential(8); // round to 8 digits
            let pref = prefixes[exponential];
            if (pref === undefined) 
              throw new Error('No prefix found for multiplier ' + exponential + ' in ' + this);
            kindUpd = pref + item.kind;
          }
        }

        let operator = item.exponent < 0
          ? ( (i>0) ? '/' : '1/' ) // 1 for 1/L
          : ( (i>0) ? '*' : '' ); // no operator for first element

        let expAbs = Math.abs(item.exponent); // absolute value
        let exponent = (expAbs!==1)
          ? '^' + expAbs
          : '';

        return operator + kindUpd + exponent;
      })
      .join('');
  }
  
  /**
   * Serialize unit-object to Tex format.
   *
   * @return {string} with TeX '\frac{mM^{2} \cdot L}{mg \cdot h^{2}}'
   */
  toTex(){
    if (this.length === 0) {
      return '1';
    } else {
      let numerator = this
        .filter((item) => item.exponent > 0)
        .map((item) => {
          let expAbs = Math.abs(item.exponent); // absolute value
          let kindString = item.kind.replace('_', '\\_');

          if (item.kind === 'dimensionless' && (item.multiplier === 1 || item.multiplier === undefined)) {
            var multKind = '1';
          } else if (item.kind === 'dimensionless') {
            multKind = `(${item.multiplier.toExponential()})`;
          } else if (item.multiplier === 1 || item.multiplier === undefined) {
            multKind = kindString;
          } else {
            multKind = `(${item.multiplier.toExponential()} ${kindString})`;
          }
          let exponent = (expAbs !== 1)
            ? '^{' + expAbs + '}'
            : '';
          return multKind + exponent;
        })
        .join(' \\cdot ');

      let denominator = this
        .filter((item) => item.exponent < 0)
        .map((item) => {
          let expAbs = Math.abs(item.exponent); // absolute value
          let kindString = item.kind.replace('_', '\\_');

          if (item.kind === 'dimensionless' && (item.multiplier === 1 || item.multiplier === undefined)) {
            var multKind = '1';
          } else if (item.kind === 'dimensionless') {
            multKind = `(${item.multiplier.toExponential()})`;
          } else if (item.multiplier === 1 || item.multiplier === undefined) {
            multKind = kindString;
          } else {
            multKind = `(${item.multiplier.toExponential()} ${kindString})`;
          }
          let exponent = (expAbs!==1)
            ? '^{' + expAbs + '}'
            : '';
          return multKind + exponent;
        })
        .join(' \\cdot ');

      if (denominator !== '' && numerator !== '') { // \frac{num}{den}
        return '\\frac{' + numerator + '}{' + denominator + '}';
      } else if (denominator === '' && numerator !== '') { // num
        return numerator;
      } else if (denominator!=='' && numerator==='') { // \frac{1}{den}
        return '\\frac{1}{' + denominator + '}';
      } else {
        return '1'; // dimensionless
      }
    }
  }
  
  /**
   * Serialize Unit object to HTML code.
   *
   * @return {string} of format: 'mM<sup>2</sup> * L / mg / h<sup>2</sup>'
   */
  toHTML(){
    if (this.length === 0) {
      return '1';
    } else {
      return this
        .map((item, i) => {
          let operator = item.exponent < 0
            ? ( i > 0 ? '/' : '1/' ) // 1 for 1/L
            : ( i > 0 ? '&times;' : '' ); // no operator for first element

          if (item.kind === 'dimensionless' && (item.multiplier === 1 || item.multiplier === undefined)) {
            var multKind = '1';
          } else if (item.kind === 'dimensionless') {
            multKind = `(${item.multiplier.toExponential()})`;
          } else if (item.multiplier === 1 || item.multiplier === undefined) {
            multKind = item.kind;
          } else {
            multKind = `(${item.multiplier.toExponential()} ${item.kind})`;
          }

          let expAbs = Math.abs(item.exponent); // absolute value
          let exponent = expAbs !== 1
            ? '<sup>' + expAbs + '</sup>'
            : '';

          return operator + multKind + exponent;
        })
        .join('');
    }

  }

  // &nbsp; => &#160; &times; => &#215; &minus; => &#8722;
  toHTML2(spaceSymbol = '&#160;', timesSymbol = '&#215;', minusSymbol = '&#8722;'){
    if (this.length === 0) return '<div class="unit-mult" style="display:inline-block">1</div>';

    let numBase = this
      .filter((u) => u.exponent > 0)
      .map((u) => unitComponentToHTML(u, spaceSymbol, minusSymbol))
      .join(timesSymbol);
    let denomBase = this
      .filter((u) => u.exponent < 0)
      .map((u) => unitComponentToHTML({
        kind: u.kind,
        multiplier: u.multiplier,
        exponent: (-1)*u.exponent
      }, spaceSymbol, minusSymbol))
      .join(timesSymbol);
    let num = numBase === ''
      ? '<div class="unit-mult" style="display:inline-block">1</div>'
      : `<div class="unit-mult" style="display:inline-block">${numBase}</div>`;
    
    if (denomBase === '') {
      return num;
    } else {
      let denom = `<div class="unit-mult" style="display:inline-block">${denomBase}</div>`;
      return `<div class="unit-ratio" style="display:inline-block;text-align:center">${num}<hr/>${denom}</div>`;
    }
  }

  toXmlUnitDefinition(legalUnits = [], options){
    // set default options
    let _options = Object.assign({nameStyle: 'string', simplify: true}, options);
    var units = _options.simplify
      ? this.rebase(legalUnits).simplify()
      : this.rebase(legalUnits);

    // create string content of listOfUnits
    // if empty, set dimentionless
    if (units.length > 0) {
      var listOfUnits = units
        .map((x) => {
          let scale = floor(log10(x.multiplier));
          let multiplier = x.multiplier / 10 ** scale;
          return `\n    <unit kind="${x.kind || 'dimensionless'}" exponent="${x.exponent}" scale="${scale}" multiplier="${_round(multiplier, 8)}"/>`;
        })
        .join('');
    } else {
      listOfUnits = '\n    <unit kind="dimensionless" exponent="1" scale="0" multiplier="1"/>';
    }

    switch (_options.nameStyle) {
    case 'TeX':
      var nameAttr = ` name="${this.toTex()}"`; // name attribute
      break;
    case 'HTML':
      nameAttr = ` name="${this.toHTML()}"`;
      break;
    case 'string':
      nameAttr = ` name="${this.toString()}"`;
      break;
    default:
      throw new Error(_options.nameStyle + ' is unsupported value for "options.nameStyle". Use one of values: TeX, HTML, string.');
    }

    return `<unitDefinition id="${this.toHash()}"${nameAttr}>\n  <listOfUnits>`
      + listOfUnits
      + '\n  </listOfUnits>\n</unitDefinition>';
  }
  // only for bound units !
  // calculate term for unit based on "kindObj" and "exponent"
  toTerm(){
    let res = new UnitTerm();

    // the alternative is the throw new Error
    for (let x of this) {
      if (typeof x.kindObj === 'undefined') return; // break
      if (typeof x.kindObj.terms !== 'undefined') {
        var term_i = x.kindObj.terms; // get directly
      } else if (typeof x.kindObj.unitsParsed !== 'undefined') {
        term_i = x.kindObj.unitsParsed.toTerm(); // recursion
        if (!term_i) return; // break
      } else {
        throw new Error('Neither "terms" nor "units" in Unit.prototype.toTerm()');
      }
      res = res.concat(term_i.power(x.exponent));
    }

    return res;
  }
}

function unitComponentToHTML(item, spaceSymbol = '&#160;'){ //, minusSymbol = '&#8722;'
  
  if (item.kind === 'dimensionless' && (item.multiplier === 1 || item.multiplier === undefined)) {
    var multKind = '1';
  } else if (item.kind === 'dimensionless') {
    multKind = `(${item.multiplier.toExponential()})`;
  } else if (item.multiplier === 1 || item.multiplier === undefined) {
    multKind = item.kind;
  } else {
    multKind = `(${item.multiplier.toExponential()}${spaceSymbol}${item.kind})`;
  }
  let full = item.exponent === 1
    ? multKind
    : `${multKind}<sup>${item.exponent}</sup>`;

  return full;
}

/*
  Auxilary function to round to some digits
*/
function _round(x, digits = 0){
  return +x.toPrecision(digits);
}

module.exports = {
  Unit
};
