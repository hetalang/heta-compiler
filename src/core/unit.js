const _ = require('lodash');
const { floor, log10 } = Math;
const prefixes = {
  '1e-2':       'centi',
  '1e-1':       'deci',
  '1e+1':       'deka',
  '1e-15':      'femto',
  '1e+9':       'giga',
  '1e+2':       'hecto',
  '1e+3':       'kilo',
  '1e+6':       'mega',
  '1e-6':       'micro',
  '1e-3':       'milli',
  '1e-9':       'nano',
  '1e-12':      'pico',
  '1e+12':      'tera'
};

class Unit extends Array {
  static fromQ(obj = []){
    let res = new Unit;

    obj.forEach((x) => {
      if (typeof x.kind !== 'string') throw new TypeError('kind property must be string.');
      _.defaults(x, { multiplier: 1, exponent: 1 });
      res.push(x);
    });

    return res;
  }
  toQ(options = {}){
    return this.map((x) => _.pick(x, ['kind', 'multiplier', 'exponent']));
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
  // old version of rebase, not used
  rebase0(transformator){
    if(!transformator)
      throw new TypeError('Transformator should be set for rebase.');
    let newUnit = new Unit();
    
    this.forEach((parseUnit) => {
      if (transformator[parseUnit.kind] === undefined ){ // use the same if is not found in transformator
        newUnit.push(_.cloneDeep(parseUnit));
      } else {
        transformator[parseUnit.kind].forEach((simpleUnit) => {
          let simpleUnit_defaults = {
            kind: simpleUnit.kind,
            multiplier: simpleUnit.multiplier!==undefined ? simpleUnit.multiplier : 1,
            exponent: simpleUnit.exponent!==undefined ? simpleUnit.exponent : 1,
          };
          newUnit.push({
            kind: simpleUnit_defaults.kind,
            multiplier: simpleUnit_defaults.multiplier * Math.pow(parseUnit.multiplier, 1/simpleUnit_defaults.exponent),
            exponent: simpleUnit_defaults.exponent * parseUnit.exponent
          });
        });
      }
    });
    return newUnit;
  }
  rebase(legalUnits = []){
    let unit = new Unit();

    if (this.length === 0)
      throw new TypeError('Cannot use rebase for empty Unit');

    this.forEach((x) => {
      if (legalUnits.indexOf(x.kind) !== -1) { // any legal
        let clearedUnit =_.pick(x, ['kind', 'exponent', 'multiplier']);
        unit.push(clearedUnit);
      } else {
        let unitDefRebased = x.kindObj
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
  
  /**
   * Normalize units.
   *
   * @return {Unit} Simplified version of units.
   */
  simplify() {
    // group by kind, combine elements inside kind
    // then transform to regular array
    // if exponent == 0, create dimentionless element to store multiplier
    // if dimentionless element is trivial remove it
    let group = _.chain(this)
      .groupBy((x) => x.kind)
      .map((x, key) => {
        let exponent = _.sumBy(x, (y) => y.exponent);
        if (exponent===0) {
          let tmp = _.sumBy(x, (y) => y.exponent * log10(y.multiplier));
          let multiplier = 10 ** (tmp);
          var res = {
            kind: '',
            exponent: 1,
            multiplier: multiplier
          };
        } else {
          let tmp = _.sumBy(x, (y) => y.exponent * log10(y.multiplier));
          let multiplier = 10 ** (tmp / exponent);
          res = {
            kind: key,
            exponent: exponent,
            multiplier: multiplier
          };
          // if there is reference to unitDef, than copy it
          if (x[0].kindObj) res.kindObj = x[0].kindObj;
        }

        return res;
      })
      .toPairs()
      .map(1)
      //.flatten()
      .filter((x) => !(x.kind==='' && x.multiplier===1))
      .value();

    return Unit.fromQ(group);
  }
  
  /**
   * Creates Unit object from string.
   *
   * @param {String} unitString - string of format 'mM^2*L/mg/h2'
   * @return {Unit} A Unit object.
   */
  static parse(unitString){
    let unit = new Unit;

    let items = unitString // split to parts
      .replace(/\s*/g, '') // remove blanks
      .match(/(^1\/|\/|\*)?[^*/]+/g);

    if(items===null)
      throw new SyntaxError(`Wrong syntax of unit: "${unitString}"`);

    items.forEach((item) => {
      if(!/^(1\/|\/|\*)?[A-Za-z]+\^?(\d+(\.?\d*)?)?$/.test(item)) // checking "/xxx^12.23"
        throw new SyntaxError(`Wrong syntax of unit: "${unitString}"`);

      let kind = item.match(/[A-Za-z]+/)[0];
      let pow = item.match(/[\d.]+$/) && item.match(/[\d.]+$/)[0];
      let exponent0 = (/(^|\*)[a-zA-Z]+/.test(item)) // searching constructions "1/L", "/L"
        ? 1
        : -1;
      let exponent = exponent0 * (pow || 1);

      unit.push({
        kind: kind,
        exponent: exponent,
        multiplier: 1
      });
    });

    return unit;
  }

  /**
   * Serialize unit-object to identificator.
   *
   * @return {string} of type '\_mM2_L\__mg\__h2'
   */
  toHash(){
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
  /**
   * Serialize Unit object to string.
   *
   * @return {string} of format: 'mM2*L/mg/h2'
   */
  toString(usePrefix = false){
    return this
      .filter((x) => x.kind!=='') // remove unitless
      .map((item, i) => {
        if(item.multiplier===1){
          var kindUpd = item.kind;
        } else if (usePrefix) {
          let exponential = item.multiplier.toExponential();
          let pref = _.get(prefixes, exponential);
          if (pref === undefined) 
            throw new Error('No prefix found for multiplier ' + exponential + ' in ' + this);

          kindUpd = pref + item.kind;
        } else {
          kindUpd = '(' + item.multiplier.toExponential() + ' ' + item.kind + ')';
        }

        let operator = (item.exponent<0)
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
    let res = '';
    let numerator = this
      .filter((item) => item.exponent > 0)
      .map((item) => {
        let expAbs = Math.abs(item.exponent); // absolute value
        let exponent = (expAbs!==1)
          ? '^{' + expAbs + '}'
          : '';
        return item.kind + exponent;
      })
      .join(' \\cdot ');

    let denominator = this
      .filter((item) => item.exponent < 0)
      .map((item) => {
        let expAbs = Math.abs(item.exponent); // absolute value
        let exponent = (expAbs!==1)
          ? '^{' + expAbs + '}'
          : '';
        return item.kind + exponent;
      })
      .join(' \\cdot ');

    if(denominator!=='' && numerator!==''){ // \frac{num}{den}
      return '\\frac{' + numerator + '}{' + denominator + '}';
    }else if(denominator==='' && numerator!==''){ // num
      return numerator;
    }else if(denominator!=='' && numerator===''){ // \frac{1}{den}
      return '\\frac{1}{' + denominator + '}';
    }else{
      return ''; // unitless
    }
  }
  
  /**
   * Serialize Unit object to HTML code.
   *
   * @return {string} of format: 'mM<sup>2</sup> * L / mg / h<sup>2</sup>'
   */
  toHTML(){
    return this
      .map((item, i) => {
        let operator = item.exponent < 0
          ? ( i > 0 ? '/' : '1/' ) // 1 for 1/L
          : ( i > 0 ? '&times;' : '' ); // no operator for first element

        let expAbs = Math.abs(item.exponent); // absolute value
        let exponent = expAbs !== 1
          ? '<sup>' + expAbs + '</sup>'
          : '';

        return operator + item.kind + exponent;
      })
      .join('');
  }

  toHTML2(spaceSymbol = ' ', timesSymbol = '&times;'){
    let numBase = this
      .filter((u) => u.exponent > 0)
      .map((u) => unitComponentToHTML(u, spaceSymbol))
      .join(timesSymbol);
    let denomBase = this
      .filter((u) => u.exponent < 0)
      .map((u) => unitComponentToHTML({
        kind: u.kind,
        multiplier: u.multiplier,
        exponent: (-1)*u.exponent
      }, spaceSymbol))
      .join(timesSymbol);
    let num = numBase === ''
      ? '<div>1</div>'
      : `<div>${numBase}</div>`;
    
    if (denomBase === '') {
      return num;
    } else {
      let denom = `<div>${denomBase}</div>`;
      return `<div class="unit-ratio" style="display:inline-block;text-align:center">${num}<hr/>${denom}</div>`;
    }
  }

  toXmlUnitDefinition(legalUnits = [], options){
    // set default options
    let _options = Object.assign({nameStyle: 'string', simplify: true}, options);
    let units = _options.simplify
      ? this.rebase(legalUnits).simplify()
      : this.rebase(legalUnits);

    let listOfUnits = units
      .map((x) => {
        let scale = floor(log10(x.multiplier));
        let multiplier = x.multiplier / 10 ** scale;
        return `\n    <unit kind="${x.kind}" exponent="${x.exponent}" scale="${scale}" multiplier="${multiplier}"/>`;
      })
      .join('');

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
      + `\n  </listOfUnits>\n</unitDefinition>`;
  }

}

function unitComponentToHTML(u, spaceSymbol = ' '){
  let base = u.multiplier === 1
    ? u.kind
    : `(${u.multiplier.toExponential()}${spaceSymbol}${u.kind})`;
  let full = u.exponent === 1
    ? base
    : `${base}<sup>${u.exponent}</sup>`;

  return full;
}

module.exports = {
  Unit
};
