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
      return function(record){
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

        let argUnit = this.args
          .map((node) => node.calcUnit(record));

        let argUnitDimensionless = argUnit
          .map((node) => node.equal(new Unit(), true));

        // check arguments
        let isUndefined = argUnit
          .some((unit) => typeof unit === 'undefined');
        if (isUndefined) return undefined; // brake

        // return based on operators
        if (this.fn === 'multiply') {
          let res = argUnit[0];
          argUnit.forEach((unit, i) => {
            if (i > 0) res = res.multiply(unit);
          });
          return res;
        } else if (this.fn === 'divide') {
          let res = argUnit[0];
          argUnit.forEach((unit, i) => {
            if (i > 0) res = res.divide(unit);
          });
          return res;
        } else if (this.fn === 'add' || this.fn === 'subtract') {
          let firstUnit = argUnit[0];
          argUnit.forEach((unit, i) => {
            if (i > 0) {
              let isEqual = firstUnit.equal(unit, true);
              if (!isEqual) {
                let unitsExpr = argUnit.map((x) => x.toString()).join(' vs ');
                logger.warn(`Units inconsistency for "${record.index}" inside expression part "${this.toString()}" : "${unitsExpr}"`);
              }
            }
          });
          return argUnit[0];
        } else if (this.fn === 'pow') {
          let unitExpr = argUnit[0].toString() + '^' + argUnit[1].toString();
          if (!argUnitDimensionless[0] || !argUnitDimensionless[1]) {
            logger.warn(`Units inconsistency for "${record.index}", power can be dimentionless "${this.toString()}" : "${unitExpr}"`);
          }
          return argUnit[0];
        } else {
          throw new Error(`No method calcUnit() for the operator : "${this.fn}"`);
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
        if (typeof this.nameObj === 'undefined') // XXX: maybe logger.warn is better solution
          throw new Error(`No reference for id ${this.name} in expression.`);
        if (typeof this.nameObj.unitsParsed === 'undefined') {
          logger.warn(`Cannot check units for "${record.index}" math expression because no units found for "${this.name}"`);
          return undefined;
        } else {
          return this.nameObj.unitsParsed;
        }
      };
    }
  },
];