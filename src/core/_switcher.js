const { Component } = require('./component');
const { Expression } = require('./expression');
const { Unit } = require('./unit');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
    active: {oneOf: [
      {
        description: 'if false the event will not run.',
        enum: [true, false, 1, 0]
      },
      { type: 'null' }
    ]},
    priority: {oneOf: [
      { type: 'number' },
      { type: 'string', minLength: 1 },
      { type: 'null' }
    ]}
  }
};

/*
  _Switcher abstract class

  _switcher @_Switcher {
    active: true
  };
*/
class _Switcher extends Component {
  constructor(isCore = false){
    super(isCore);
    this.active = true;
  }
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = _Switcher.isValid(q, logger);

    if (valid) {
      if (q.active === null) {
        delete this.active;
      } else if (q.active !== undefined) {
        this.active = !!q.active;
      }

      if (q.priority === null) {
        delete this.priority;
      } else if (q.priority !== undefined) {
        try {
          this.priority = Expression.fromString(q.priority);
        } catch (err) {
          logger && logger.error(
            `${this.index} ${err.message} "${q.priority}"`,
            {type: 'ValidationError', space: this.space}
          );
        }
      }
    }

    return this;
  }
  get className() {
    return '_Switcher';
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.active !== 'undefined') {
      clonedComponent.active = this.active;
    } else {
      delete clonedComponent.active;
    }

    if (typeof this.priority !== 'undefined') {
      clonedComponent.priority = this.priority.clone();
    }

    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.active === false) {
      res.active = false;
    } else if (this.active === undefined) {
      res.active = null;
    }
    if (this.priority !== undefined) {
      res.priority = this.priority.toString();
    }

    return res;
  }
  updateReferences(q = {}) {
    super.updateReferences(q);
    this.priority?.updateReferences(q);
  }
  bind(namespace) {
    super.bind(namespace);
    if (!this.priority) return;

    let {logger, functionDefStorage} = this._container;
    this.priority.dependOnNodes().forEach((node) => {
      let target = namespace.get(node.name);

      if (!target) {
        logger.error(
          `Component "${node.name}" is not found in space "${this.space}" as expected in priority of switcher "${this.index}"\n\t${this.priority.toString()};`,
          {type: 'BindingError', space: this.space}
        );
        this.errored = true;
      } else if (!target.instanceOf('_Size')) {
        logger.error(
          `Component "${node.name}" is not a Const/Record/TimeScale class as expected in priority expression: ${this.priority.toString()};`,
          {type: 'BindingError', space: this.space}
        );
        this.errored = true;
      } else {
        node.nameObj = target;
      }
    });

    this.priority.functionList().forEach((functionNode) => {
      let target = functionDefStorage.get(functionNode.fn.name);
      if (!target) {
        logger.error(
          `FunctionDef "${functionNode.fn.name}" is not found as expected in priority of switcher "${this.index}".`,
          {type: 'BindingError'}
        );
      } else {
        functionNode.fnObj = target;
      }
      if (target?.arguments && functionNode.args.length < target.arguments.length) {
        logger.error(
          `Switcher "${this.id}": Not enough arguments inside function ${functionNode}, required ${target.arguments.length}`,
          {type: 'BindingError'}
        );
      }
    });

    if (this.priority.hasBooleanResult()) {
      logger.error(
        `Priority of switcher "${this.index}" should be a numeric expression.`,
        {type: 'ValidationError', space: this.space}
      );
      this.errored = true;
    }
  }
  checkUnits() {
    let logger = this._container?.logger;
    if (!this.priority) return;

    let priorityUnit = this.priority.calcUnit(this);
    if (priorityUnit === undefined) {
      logger.warn(`Cannot calculate priority units in "${this.index}".`);
    } else if (!priorityUnit.equal(new Unit(), true)) {
      logger.warn(`Units inconsistency for priority of "${this.index}": priority must be dimensionless, got "${priorityUnit}".`);
    }
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

_Switcher._requirements = {
  active: {
    required: true
  }
};

module.exports = {
  _Switcher
};
