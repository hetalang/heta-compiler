const _ = require('lodash');

class Unit extends Array {
  static fromQ(obj = []){
    let res = new Unit;
    res.multiplier = 1;

    obj.forEach((x) => {
      if (!x.kind) throw new TypeError('kind property must be set.');
      _.defaults(x, { multiplier: 1, exponent: 1 });
      res.push(x);
    });

    return res;
  }

  toQ(){
    return this.map((component) => {
      return component;
    });
  }

  rebase(transformator){
    let newUnit = new Unit();
    newUnit.multiplier = this.multiplier;
    this.forEach((parseUnit) => {
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
    });

    return newUnit;
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
    res.multiplier = this.multiplier * unit.multiplier;

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
    res.multiplier = this.multiplier / unit.multiplier;
    return res;
  }
  
  /**
   * Normalize units.
   *
   * @return {Unit} Simplified version of units.
   */
  simplify() {
    let listOfKind = [];
    let newUnit = new this.constructor();
    newUnit.multiplier = this.multiplier;
    //consoconsole.log(newUnit.multiplier);
    //console.log(this.multiplier);

    this.forEach((item) => {
      let current = Object.assign({}, item);
      let posElement = listOfKind.indexOf(current.kind);

      if (posElement !== -1) { // already exist kind
        newUnit[posElement].exponent += current.exponent;
        // newUnit[posElement].multiplier *= (current.multiplier/newUnit[posElement].multiplier) ** (current.exponent / newUnit[posElement].exponent);
      } else {
        newUnit.push({
          kind: current.kind,
          multiplier: 1,
          exponent: current.exponent
        });
        listOfKind.push(current.kind);
      }
      newUnit.multiplier *= current.multiplier ** current.exponent;
    });

    let filtered = newUnit.filter((x) => x.exponent!==0);
    filtered.multiplier = newUnit.multiplier;

    return filtered;
  }
  
  /**
   * Creates Unit object from string.
   *
   * @param {String} unitString - string of format 'mM^2*L/mg/h2'
   * @return {Unit} A Unit object.
   */
  static parse(unitString){
    let unit = new Unit;
    unit.multiplier = 1;

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
   * @return {string} of type 'mM2_L\__mg\__h2'
   */
  toHash(){
    return this.concat([]) // clone array to exclude mutation
      .sort((x1, x2) => x1.kind > x2.kind ? -1 : 1)
      .map((item, i) => {
        let operator = (item.exponent<0)
          ? '__'
          : (i>0) ? '_' : ''; // no operator for first element

        let expAbs = Math.abs(item.exponent); // absolute value
        let exponent = (expAbs!==1)
          ? String(expAbs).replace('.', '_')
          : '';

        return operator + item.kind + exponent;
      })
      .join('');
  }
  /**
   * Serialize Unit object to string.
   *
   * @return {string} of format: 'mM2*L/mg/h2'
   */
  toString(){
    return this
      .map((item, i) => {
        let operator = (item.exponent<0)
          ? ( (i>0) ? '/' : '1/' ) // 1 for 1/L
          : ( (i>0) ? '*' : '' ); // no operator for first element

        let expAbs = Math.abs(item.exponent); // absolute value
        let exponent = (expAbs!==1)
          ? '^' + expAbs
          : '';

        return operator + item.kind + exponent;
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
        let operator = (item.exponent<0)
          ? ( (i>0) ? ' / ' : '1 / ' ) // 1 for 1/L
          : ( (i>0) ? '&#183;' : '' ); // no operator for first element

        let expAbs = Math.abs(item.exponent); // absolute value
        let exponent = (expAbs!==1)
          ? '<sup>' + expAbs + '</sup>'
          : '';

        return operator + item.kind + exponent;
      })
      .join('');
  }

  /* XXX: not checked */
  toXmlUnitDefinition(transformator, options){
    // set default options
    let _options = Object.assign({nameStyle: 'string', simplify: false}, options);
    let units = _options.simplify
      ? this.toRebaseUnits(transformator).simplify()
      : this.toRebaseUnits(transformator);

    let listOfUnits = units
      .map((item) => {
        return `\n    <unit kind="${item.kind}" exponent="${item.exponent}" scale="${item.scale}" multiplier="${item.multiplier}"/>`;
      })
      .join('');

    let nameAttr; // name attribute
    switch (_options.nameStyle) {
    case 'TeX':
      nameAttr = ` name="${this.toTex()}"`
      break;
    case 'HTML':
      nameAttr = ` name="${this.toHTML()}"`
      break;
    case 'string':
      nameAttr = ` name="${this.toString()}"`
      break;
    default:
      throw new Error(_options.nameStyle + ' is unsupported value for "options.nameStyle". Use one of values: TeX, HTML, string.');
    }

    return `<unitDefinition id="${this.toHash()}"${nameAttr}>\n  <listOfUnits>`
      + listOfUnits
      + `\n  </listOfUnits>\n</unitDefinition>`;
  }
  
}

module.exports = {
  Unit
};
