const { Process, _Effector, Actor } = require('./process');
const { UnitTerm } = require('./unit-term');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    reversible: {oneOf: [
      { enum: [true, false, 1, 0], default: true },
      { type: 'null' }
    ]},
    modifiers: {oneOf: [
      {
        type: 'array',
        items: {
          oneOf: [
            { '$ref': '#/definitions/Effector' },
            { '$ref': '#/definitions/ID' }
          ]
        }
      },
      { type: 'null' }
    ]}
  },
  errorMessage: {
    properties: {
      modifiers:  'is not an array of ids or modifiers.'
    }
  },
  definitions: {
    Effector: {
      description: 'Abstract class for modifiers and actors',
      type: 'object',
      required: ['target'],
      properties: {
        target: { '$ref': '#/definitions/ID' }
      }
    },
    Actor: {
      allOf: [
        { '$ref': '#/definitions/Effector' },
        {
          type: 'object',
          properties: {
            stoichiometry: { type: 'number' }
          }
        }
      ],
      example: { target: 'x1', stoichiometry: -1 }
    },
    ID: {
      description: 'First character is letter, others are letter, digit or lodash.',
      type: 'string',
      minLength: 1,
      pattern: '^[_a-zA-Z][_a-zA-Z0-9]*$',
      example: 'x_12_'
    }
  }
};

/*
  Reaction class

  reaction1 @Reaction {
    modifiers: [M!, M2]
  };
  reaction2 @Reaction {
    modifiers: [{target: M1}, {target: M2}]
  };
*/
class Reaction extends Process {
  constructor(isCore = false){
    super(isCore);
    this.modifiers = [];
  }
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = Reaction.isValid(q, logger);

    if (valid) {
      if (q.modifiers === null) {
        this.modifiers = [];
      } else if (q.modifiers !== undefined) {
        this.modifiers = q.modifiers.map((mod) => {
          if (typeof mod==='string') {
            return new Modifier({target: mod});
          } else {
            return new Modifier(mod);
          }
        });
      }
      
      if (q.compartment === null) {
        delete this.compartment;
      } else if (q.compartment !== undefined) {
        this.compartment = q.compartment;
      }
    }
    
    return this;
  }
  get className() {
    return 'Reaction';
  }
  clone(){
    let clonedComponent = super.clone();

    if (this.modifiers.length > 0) {
      clonedComponent.modifiers = this.modifiers.map((modifier) => modifier.clone());
    }

    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.modifiers.length > 0) {
      res.modifiers = options.simplifyModifiers
        ? this.modifiers.map((modifier) => modifier.target )
        : this.modifiers.map((modifier) => { return { target: modifier.target }; });
    }

    if (this.compartment !== undefined) res.compartment = this.compartment;

    return res;
  }
  get legalTerms(){
    return [
      new UnitTerm([{kind: 'amount'}, {kind: 'time', exponent: -1}]),
      new UnitTerm([{kind: 'mass'}, {kind: 'time', exponent: -1}])
    ];
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

Reaction._requirements = {
  actors: { 
    required: false, 
    isArray: true, path: 'target', 
    isReference: true, targetClass: 'Species', setTarget: true 
  },
  modifiers: {
    required: false, 
    isArray: true, path: 'target', 
    isReference: true, targetClass: 'Species', setTarget: true 
  },
  compartment: {
    required: false,
    isArray: false,
    isReference: true, targetClass: 'Compartment', setTarget: true 
  }
};

class Modifier extends _Effector {
}

class Reactant extends Actor {
}

module.exports = {
  Reaction,
  Modifier,
  Reactant
};
