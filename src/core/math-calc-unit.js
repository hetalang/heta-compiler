/*
This module calculates units based on expressions
Records of the expressions must be bound before running this method
*/
const { Unit } = require('./unit');

/*
  _this : Node
  record : Record
*/
function _calcUnit(_this, record){
  const logger = record.namespace.container.logger;

  if (_this.type === 'ParenthesisNode') {
    return _calcUnit(_this.content, record);
  } else if (_this.type === 'ConstantNode') {
    return new Unit(); // dimensionless
  } else if (_this.type === 'OperatorNode') {
    // calculate units of child nodes
    let argUnit = _this.args
      .map((node) => _calcUnit(node, record));

    // check child nodes
    let isUndefined = argUnit
      .some((unit) => typeof unit === 'undefined');
    if (isUndefined) return undefined; // BRAKE

    // mark dimensionless children
    let argUnitDimensionless = argUnit
      .map((node) => node.equal(new Unit(), true));

    // return based on operators
    if (_this.fn === 'multiply') { // "*"
      return argUnit.slice(1).reduce(
        (accumulator, unit) => accumulator.multiply(unit),
        argUnit[0]
      );
    } else if (_this.fn === 'divide') { // "/"
      return argUnit.slice(1).reduce(
        (accumulator, unit) => accumulator.divide(unit),
        argUnit[0]
      );
    } else if (_this.fn === 'add' || _this.fn === 'subtract') { // "+" "-"
      let firstUnit = argUnit[0];
      argUnit.slice(1).forEach((unit) => {
        let isEqual = firstUnit.equal(unit, true);
        if (!isEqual) {
          let unitsExpr = argUnit.map((x) => x.toString()).join(' vs ');
          logger.warn(`Units inconsistency for "${record.index}" here "${_this.toString()}" : "${unitsExpr}"`);
        }
      });
      return argUnit[0];
    } else if (_this.fn === 'larger' || _this.fn === 'smaller' || _this.fn === 'largerEq' || _this.fn === 'smallerEq' || _this.fn === 'unequal' || _this.fn === 'equal') { // ">" "<" ">=" "<=" "!="
      let isEqual = argUnit[0].equal(argUnit[1], true);
      if (!isEqual) {
        let unitsExpr = argUnit.map((x) => x.toString()).join(' vs ');
        logger.warn(`Units inconsistency for "${record.index}" for comparison here "${_this.toString()}" : "${unitsExpr}"`);
      }
      return new Unit();
    } else if (_this.fn === 'and' || _this.fn === 'or' || _this.fn === 'xor' || _this.fn === 'not') {
      let someNotUL = argUnitDimensionless.some((x) => !x);
      if (someNotUL) {
        logger.warn(`Units inconsistency for "${record.index}" for logical operators here"${_this.toString()}", some of them is not dimensionless : "${argUnit}"`);
      }
      return new Unit();
    } else if (_this.fn === 'pow') {
      if (_this.args[1].type === 'ConstantNode') { // pow(x, 3)
        let n = _this.args[1].value;
        return argUnit[0].power(n);
      } else { // pow(x, y)
        if (!argUnitDimensionless[0] || !argUnitDimensionless[1]) {
          let unitExpr = argUnit[0].toString() + '^' + argUnit[1].toString();
          logger.warn(`Units inconsistency for "${record.index}": power arguments must be dimensionless or second argument should be a number: "${_this.toString()}" : "${unitExpr}"`);
        }

        return argUnit[0];
      }
    } else if (_this.fn === 'unaryMinus') {
      return argUnit[0];
    } else {
      throw new Error(`No method _calcUnit() for the operator : "${_this.fn}"`);
    }
  } else if (_this.type === 'FunctionNode') {
    // calculate units of child nodes
    let argUnit = _this.args
      .map((node) => _calcUnit(node, record));

    // check child nodes
    let isUndefined = argUnit
      .some((unit) => typeof unit === 'undefined');
    if (isUndefined) return undefined; // BRAKE

    // mark dimensionless children
    let argUnitDimensionless = argUnit
      .map((node) => node.equal(new Unit(), true));

    // return based on operators 
    if (_this.fn.name === 'abs' || _this.fn.name === 'ceil' || _this.fn.name === 'floor') { // one argument, result units as in argument
      return argUnit[0];
    } else if (_this.fn.name === 'add' || _this.fn.name === 'subtract' || _this.fn.name === 'max' || _this.fn.name === 'min') { // many arguments with equal units, result as first argument
      let firstUnit = argUnit[0];
      argUnit.slice(1).forEach((unit) => {
        let isEqual = firstUnit.equal(unit, true);
        if (!isEqual) {
          let unitsExpr = argUnit.map((x) => x.toString()).join(' vs ');
          logger.warn(`Units inconsistency for "${record.index}" here "${_this.toString()}" : "${unitsExpr}"`);
        }
      });
      return argUnit[0];
    } else if (_this.fn.name === 'multiply') { // multiply()
      return argUnit.slice(1).reduce(
        (accumulator, unit) => accumulator.multiply(unit),
        argUnit[0]
      );
    } else if (_this.fn.name === 'divide') { // divide()
      return argUnit.slice(1).reduce(
        (accumulator, unit) => accumulator.divide(unit),
        argUnit[0]
      );
    } else if (_this.fn.name === 'square') { // square()
      return argUnit[0].power(2);
    } else if (_this.fn.name === 'cube') { // cube()
      return argUnit[0].power(3);
    } else if (_this.fn.name === 'sqrt') { // sqrt()
      return argUnit[0].power(0.5);
    } else if (_this.fn.name === 'pow') { // pow()
      if (_this.args[1].type === 'ConstantNode') { // pow(x, 2)
        let n = _this.args[1].value;
        return argUnit[0].power(n);
      } else { // pow(x, y)
        if (!argUnitDimensionless[0] || !argUnitDimensionless[1]) {
          let unitExpr = argUnit[0].toString() + '^' + argUnit[1].toString();
          logger.warn(`Units inconsistency for "${record.index}": pow() arguments must be dimensionless or second argument should be a number: "${_this.toString()}" : "${unitExpr}"`);
        }

        return argUnit[0];
      }
    } else if (_this.fn.name === 'nthRoot' && _this.args.length === 1) { // nthRoot()
      return argUnit[0].power(0.5);
    } else if (_this.fn.name === 'nthRoot') {
      if (_this.args[1].type === 'ConstantNode') { // nthRoot(x, 3)
        let n = _this.args[1].value;
        return argUnit[0].power(1/n);
      } else { // nthRoot(x, y)
        if (!argUnitDimensionless[0] || !argUnitDimensionless[1]) {
          let unitExpr = argUnit[0].toString() + '^' + argUnit[1].toString();
          logger.warn(`Units inconsistency for "${record.index}": nthRoot() arguments must be dimensionless or second argument should be a number: "${_this.toString()}" : "${unitExpr}"`);
        }

        return argUnit[0];
      }
    } else if (_this.fn.name === 'log' || _this.fn.name === 'ln' || _this.fn.name === 'log10' || _this.fn.name === 'log2' ) {
      if (_this.args.length > 1 && !argUnitDimensionless[1]) {
        let unitExpr = `log(${argUnit[0].toString()}, ${argUnit[1].toString()})`;
        logger.warn(`Units inconsistency for "${record.index}": second arguments of log() must be dimensionless "${_this.toString()}" => "${unitExpr}"`);
      }
      return new Unit();
    } else if (_this.fn.name === 'sign') { // sign()
      return new Unit();
    } else if (_this.fn.name === 'ifgt' || _this.fn.name === 'ifge' || _this.fn.name === 'iflt' || _this.fn.name === 'ifle' || _this.fn.name === 'ifeq') {
      let isEqual0 = argUnit[0].equal(argUnit[1], true);
      if (!isEqual0) {
        let unitsExpr = `${argUnit[0].toString()} vs ${argUnit[1].toString()}`;
        logger.warn(`Units inconsistency in ifgt-like finction for "${record.index}" here "${_this.toString()}" : "${unitsExpr}"`);
      }
      let isEqual = argUnit[2].equal(argUnit[3], true);
      if (!isEqual) {
        let unitsExpr = `${argUnit[2].toString()} vs ${argUnit[3].toString()}`;
        logger.warn(`Units inconsistency in ifgt-like finction for "${record.index}" here "${_this.toString()}" : "${unitsExpr}"`);
      }
      return argUnit[2];
    } else { // first argument must be dimensionless, result is dimensionless: exp, factorial
      if (!argUnitDimensionless[0]) {
        logger.warn(`Units inconsistency for "${record.index}": the argument must be dimensionless here "${_this.toString()}", got "${argUnit[0]}"`);
      }
      return new Unit();
    }
  } else if (_this.type === 'SymbolNode') {
    if (_this.name === 'e' || _this.name === 'pi')
      return new Unit(); // dimensionless
    if (!_this.nameObj || typeof _this.nameObj.unitsParsed === 'undefined') {
      logger.warn(`Cannot check units consistency for "${record.index}" because no units found for "${_this.name}"`);
      return undefined; // BRAKE
    } else {
      return _this.nameObj.unitsParsed;
    }
  } else if (_this.type === 'ConditionalNode') {
    // check units of condition
    _calcUnit(_this.condition, record); // expect to be dimensionless

    // check units of arguments
    let trueUnit = _calcUnit(_this.trueExpr, record);
    let falseUnit = _calcUnit(_this.falseExpr, record);
    if (typeof trueUnit === 'undefined' || typeof falseUnit === 'undefined')
      return undefined; // BRAKE
    
    let isEqual = trueUnit.equal(falseUnit, true);
    if (!isEqual) {
      let unitsExpr = `${trueUnit.toString()} vs ${falseUnit.toString()}`;
      logger.warn(`Units inconsistency in ternary operator for "${record.index}" here "${_this.toString()}" : "${unitsExpr}"`);
    }
    return trueUnit;
  } else {
    throw new Error(`No method _calcUnit() for the node type : "${_this.type}"`);
  }
}

module.exports = _calcUnit;
