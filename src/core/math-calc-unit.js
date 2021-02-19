/*
This module calculates units based on expressions
Records of the expressions must be bound before running this method
they extends "mathjs" package
Should be loaded with math.import()
*/
const { Unit } = require('./unit');

module.exports = [
  {
    name: 'calcUnit',
    path: 'expression.node.Node.prototype',
    factory: function(/*type, config, load, typed*/) {
      return function(){
        throw new Error(`No method calcUnit() for the node type : "${this.type}"`);
      };
    }
  },
  {
    name: 'calcUnit',
    path: 'expression.node.ParenthesisNode.prototype',
    factory: function() {
      return function(record){
        return this.content.calcUnit(record);
      };
    }
  },
  {
    name: 'calcUnit',
    path: 'expression.node.ConstantNode.prototype',
    factory: function() {
      return function(){
        return new Unit(); // dimensionless
      };
    }
  },
  {
    name: 'calcUnit',
    path: 'expression.node.OperatorNode.prototype',
    factory: function() {
      return function(record){
        const logger = record.namespace.container.logger;

        // calculate units of child nodes
        let argUnit = this.args
          .map((node) => node.calcUnit(record));

        // check child nodes
        let isUndefined = argUnit
          .some((unit) => typeof unit === 'undefined');
        if (isUndefined) return undefined; // BRAKE

        // mark dimensionless children
        let argUnitDimensionless = argUnit
          .map((node) => node.equal(new Unit(), true));

        // return based on operators
        if (this.fn === 'multiply') { // "*"
          return argUnit.slice(1).reduce(
            (accumulator, unit) => accumulator.multiply(unit),
            argUnit[0]
          );
        } else if (this.fn === 'divide') { // "/"
          return argUnit.slice(1).reduce(
            (accumulator, unit) => accumulator.divide(unit),
            argUnit[0]
          );
        } else if (this.fn === 'add' || this.fn === 'subtract') { // "+" "-"
          let firstUnit = argUnit[0];
          argUnit.slice(1).forEach((unit) => {
            let isEqual = firstUnit.equal(unit, true);
            if (!isEqual) {
              let unitsExpr = argUnit.map((x) => x.toString()).join(' vs ');
              logger.warn(`Units inconsistency for "${record.index}" here "${this.toString()}" : "${unitsExpr}"`);
            }
          });
          return argUnit[0];
        } else if (this.fn === 'larger' || this.fn === 'smaller' || this.fn === 'largerEq' || this.fn === 'smallerEq' || this.fn === 'unequal') { // ">" "<" ">=" "<=" "!="
          let isEqual = argUnit[0].equal(argUnit[1], true);
          if (!isEqual) {
            let unitsExpr = argUnit.map((x) => x.toString()).join(' vs ');
            logger.warn(`Units inconsistency for "${record.index}" for comparison here "${this.toString()}" : "${unitsExpr}"`);
          }
          return new Unit();
        } else if (this.fn === 'and' || this.fn === 'or' || this.fn === 'xor' || this.fn === 'not') {
          return new Unit();
        } else if (this.fn === 'pow') {
          if (this.args[1].type === 'ConstantNode') { // pow(x, 3)
            let n = this.args[1].value;
            return argUnit[0].power(n);
          } else { // pow(x, y)
            if (!argUnitDimensionless[0] || !argUnitDimensionless[1]) {
              let unitExpr = argUnit[0].toString() + '^' + argUnit[1].toString();
              logger.warn(`Units inconsistency for "${record.index}": power arguments must be dimensionless or second argument should be a number: "${this.toString()}" : "${unitExpr}"`);
            }

            return argUnit[0];
          }
        } else {
          throw new Error(`No method calcUnit() for the operator : "${this.fn}"`);
        }
      };
    }
  },
  {
    name: 'calcUnit',
    path: 'expression.node.FunctionNode.prototype',
    factory: function(){
      return function(record){
        const logger = record.namespace.container.logger;

        // calculate units of child nodes
        let argUnit = this.args
          .map((node) => node.calcUnit(record));

        // check child nodes
        let isUndefined = argUnit
          .some((unit) => typeof unit === 'undefined');
        if (isUndefined) return undefined; // BRAKE

        // mark dimensionless children
        let argUnitDimensionless = argUnit
          .map((node) => node.equal(new Unit(), true));

        // return based on operators 
        if (this.fn.name === 'abs' || this.fn.name === 'ceil' || this.fn.name === 'floor') { // one argument, result units as in argument
          return argUnit[0];
        } else if (this.fn.name === 'add' || this.fn.name === 'subtract' || this.fn.name === 'max' || this.fn.name === 'min') { // many arguments with equal units, result as first argument
          let firstUnit = argUnit[0];
          argUnit.slice(1).forEach((unit) => {
            let isEqual = firstUnit.equal(unit, true);
            if (!isEqual) {
              let unitsExpr = argUnit.map((x) => x.toString()).join(' vs ');
              logger.warn(`Units inconsistency for "${record.index}" here "${this.toString()}" : "${unitsExpr}"`);
            }
          });
          return argUnit[0];
        } else if (this.fn.name === 'multiply') { // multiply()
          return argUnit.slice(1).reduce(
            (accumulator, unit) => accumulator.multiply(unit),
            argUnit[0]
          );
        } else if (this.fn.name === 'divide') { // divide()
          return argUnit.slice(1).reduce(
            (accumulator, unit) => accumulator.divide(unit),
            argUnit[0]
          );
        } else if (this.fn.name === 'square') { // square()
          return argUnit[0].power(2);
        } else if (this.fn.name === 'cube') { // cube()
          return argUnit[0].power(3);
        } else if (this.fn.name === 'sqrt') { // sqrt()
          return argUnit[0].power(0.5);
        } else if (this.fn.name === 'pow') { // pow()
          if (this.args[1].type === 'ConstantNode') { // pow(x, 2)
            let n = this.args[1].value;
            return argUnit[0].power(n);
          } else { // pow(x, y)
            if (!argUnitDimensionless[0] || !argUnitDimensionless[1]) {
              let unitExpr = argUnit[0].toString() + '^' + argUnit[1].toString();
              logger.warn(`Units inconsistency for "${record.index}": pow() arguments must be dimensionless or second argument should be a number: "${this.toString()}" : "${unitExpr}"`);
            }

            return argUnit[0];
          }
        } else if (this.fn.name === 'nthRoot' && this.args.length === 1) { // nthRoot()
          return argUnit[0].power(0.5);
        } else if (this.fn.name === 'nthRoot') {
          if (this.args[1].type === 'ConstantNode') { // nthRoot(x, 3)
            let n = this.args[1].value;
            return argUnit[0].power(1/n);
          } else { // nthRoot(x, y)
            if (!argUnitDimensionless[0] || !argUnitDimensionless[1]) {
              let unitExpr = argUnit[0].toString() + '^' + argUnit[1].toString();
              logger.warn(`Units inconsistency for "${record.index}": nthRoot() arguments must be dimensionless or second argument should be a number: "${this.toString()}" : "${unitExpr}"`);
            }

            return argUnit[0];
          }
        } else if (this.fn.name === 'log' || this.fn.name === 'ln' || this.fn.name === 'log10' || this.fn.name === 'log2' ) {
          if (this.args.length > 1 && !argUnitDimensionless[1]) {
            let unitExpr = `log(${argUnit[0].toString()}, ${argUnit[1].toString()})`;
            logger.warn(`Units inconsistency for "${record.index}": second arguments of log() must be dimensionless "${this.toString()}" => "${unitExpr}"`);
          }
          return new Unit();
        } else if (this.fn.name === 'sign') { // sign()
          return new Unit();
        } else if (this.fn.name === 'ifgt' || this.fn.name === 'ifge' || this.fn.name === 'iflt' || this.fn.name === 'ifle' || this.fn.name === 'ifeq') {
          let isEqual0 = argUnit[0].equal(argUnit[1], true);
          if (!isEqual0) {
            let unitsExpr = `${argUnit[0].toString()} vs ${argUnit[1].toString()}`;
            logger.warn(`Units inconsistency in ifgt-like finction for "${record.index}" here "${this.toString()}" : "${unitsExpr}"`);
          }
          let isEqual = argUnit[2].equal(argUnit[3], true);
          if (!isEqual) {
            let unitsExpr = `${argUnit[2].toString()} vs ${argUnit[3].toString()}`;
            logger.warn(`Units inconsistency in ifgt-like finction for "${record.index}" here "${this.toString()}" : "${unitsExpr}"`);
          }
          return argUnit[2];
        } else { // first argument must be dimentionless, result is dimentionless: exp, factorial
          if (!argUnitDimensionless[0]) {
            logger.warn(`Units inconsistency for "${record.index}": the argument must be dimensionless here "${this.toString()}", got "${argUnit[0]}"`);
          }
          return new Unit();
        }
      };
    }
  },
  {
    name: 'calcUnit',
    path: 'expression.node.SymbolNode.prototype', 
    factory: function() {
      return function(record){
        const logger = record.namespace.container.logger;
        if (this.name === 'e' || this.name === 'pi')
          return new Unit(); // dimensionless
        if (typeof this.nameObj === 'undefined') // XXX: maybe logger.warn is better solution
          throw new Error(`No reference to _Size for id ${this.name} inside the expression.`);
        if (typeof this.nameObj.unitsParsed === 'undefined') {
          logger.warn(`Cannot check units consistency for "${record.index}" because no units found for "${this.name}"`);
          return undefined; // BRAKE
        } else {
          return this.nameObj.unitsParsed;
        }
      };
    }
  },
  {
    name: 'calcUnit',
    path: 'expression.node.ConditionalNode.prototype',
    factory: function(){
      return function(record){
        const logger = record.namespace.container.logger;

        // check units of condition
        this.condition.calcUnit(record); // expect to be dimentionless

        // check units of arguments
        let trueUnit = this.trueExpr.calcUnit(record);
        let falseUnit = this.falseExpr.calcUnit(record);
        if (typeof trueUnit === 'undefined' || typeof falseUnit === 'undefined')
          return undefined; // BRAKE
        
        let isEqual = trueUnit.equal(falseUnit, true);
        if (!isEqual) {
          let unitsExpr = `${trueUnit.toString()} vs ${falseUnit.toString()}`;
          logger.warn(`Units inconsistency in ternary operator for "${record.index}" here "${this.toString()}" : "${unitsExpr}"`);
        }
        return trueUnit;
      };
    }
  }
];
