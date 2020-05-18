const _toMathExpr = require('./to-math-expr');
const _ = require('lodash');
const { xml2js } = require('xml-js');
const { Unit } = require('../core/unit');

/*
  Transforms text content of SBML file to Q Array
*/
function SBMLParse(
  filename, // not used here, but can be used for messages
  fileContent
){
  let JSBML = xml2js(fileContent, { compact: false });
  
  return jsbmlToQArr(JSBML);
}

/*
  Converst of JSON image of SBML to Heta array
*/
function jsbmlToQArr(JSBML){
  let qArr = [];
  eventCounter = 0; // reset event counter

  let sbml = JSBML.elements // <file>
    .find((x) => x.name === 'sbml'); // <sbml>

  let model = sbml.elements
    .find((x) => x.name === 'model'); // <model>

  // unit definition
  let unitDict = _.chain(model.elements)
    .filter(['name', 'listOfUnitDefinitions'])
    .map('elements')
    .flatten()
    .filter(['name', 'unitDefinition'])
    .map((x) => {
      let units = unitDefinitionToUnits(x);

      return [x.attributes.id, units];
    })
    .fromPairs()
    .value();

  // species types, for IRT
  let speciesTypes = _.chain(model.elements)
    .filter(['name', 'listOfSpeciesTypes'])
    .map('elements')
    .flatten()
    .filter(['name', 'speciesType'])
    .value();
  speciesTypes.forEach((x) => {
    let q = speciesTypeToQ(x);
    qArr.push(q);
  });

  // compartments
  let zeroSpatialDimensions = [];
  let compartments = _.chain(model.elements)
    .filter(['name', 'listOfCompartments'])
    .map('elements')
    .flatten()
    .filter(['name', 'compartment'])
    .value();
  compartments.forEach((x) => {
    // collect compartments with zero dimention
    let isZero = _.get(x, 'attributes.spatialDimensions') === '0';
    if (isZero) {
      zeroSpatialDimensions.push(_.get(x, 'attributes.id'));
      // set zero initial size
      _.set(x, 'attributes.size', '0'); 
    }

    let q = compartmentToQ(x, unitDict);
    qArr.push(q);
  });

  // species
  let species = _.chain(model.elements)
    .filter(['name', 'listOfSpecies'])
    .map('elements')
    .flatten()
    .filter(['name', 'species'])
    .value();
  species.forEach((x) => {
    let q = speciesToQ(x, zeroSpatialDimensions, qArr, unitDict);
    qArr.push(q);
  });

  // reactions
  let reactions = _.chain(model.elements)
    .filter(['name', 'listOfReactions'])
    .map('elements')
    .flatten()
    .filter(['name', 'reaction'])
    .value();
  reactions.forEach((x) => {
    let qArr_add = reactionToQ(x);
    qArr = qArr.concat(qArr_add);
  });

  // parameters
  let parameters = _.chain(model.elements)
    .filter(['name', 'listOfParameters'])
    .map('elements')
    .flatten()
    .filter(['name', 'parameter'])
    .value();
  parameters.forEach((x) => {
    let q = parameterToQ(x, unitDict);
    qArr.push(q);
  });

  // initialAssignments
  let initialAssignments = _.chain(model.elements)
    .filter(['name', 'listOfInitialAssignments'])
    .map('elements')
    .flatten()
    .filter(['name', 'initialAssignment'])
    .value();
  initialAssignments.forEach((x) => {
    let q = initialAssignmentToQ(x);
    qArr.push(q);
  });

  // assignmentRules
  let assignmentRules = _.chain(model.elements)
    .filter(['name', 'listOfRules'])
    .map('elements')
    .flatten()
    .filter(['name', 'assignmentRule'])
    .value();
  assignmentRules.forEach((x) => {
    let q = assignmentRuleToQ(x);
    qArr.push(q);
  });

  // algebraicRules
  let algebraicRules = _.chain(model.elements)
    .filter(['name', 'listOfRules'])
    .map('elements')
    .flatten()
    .filter(['name', 'algebraicRule'])
    .value();
  if (algebraicRules.length !== 0) {
    throw new Error('"algebraicRule" from SBML module is not supported.');
  }

  // rateRules
  let rateRules = _.chain(model.elements)
    .filter(['name', 'listOfRules'])
    .map('elements')
    .flatten()
    .filter(['name', 'rateRule'])
    .value();
  rateRules.forEach((x) => {
    let qArr_add = rateRuleToQ(x);
    qArr = qArr.concat(qArr_add);
  });

  // events
  let events = _.chain(model.elements)
    .filter(['name', 'listOfEvents'])
    .map('elements')
    .flatten()
    .filter(['name', 'event'])
    .value();
  events.forEach((x) => {
    let qs = eventToQ(x);
    qArr = qArr.concat(qs);
  });

  return qArr;
}

/*
  transform SBML-like unit definition to Heta-like unit array
*/
function unitDefinitionToUnits(x){
  let units = _.chain(x)
    .get('elements')
    .filter(['name', 'listOfUnits'])
    .get('0.elements')
    .map((element) => {
      let { kind, multiplier, scale, exponent } = element.attributes;
      return {
        kind: kind,
        multiplier: (multiplier || 1) * 10**(scale || 0),
        exponent: parseInt(exponent) || 1
      };
    })
    .value();

  return Unit.fromQ(units);
}

/*
  Converts common properties to Heta Object
*/
function baseToQ(x){
  let q = {
    id: _.get(x, 'attributes.id'),
    title: _.get(x, 'attributes.name')
  };
  // set metaid
  let metaid = _.get(x, 'attributes.metaid');
  if (metaid !== undefined) _.set(q, 'aux.metaid', metaid);
  // set sboTerm
  let sboTerm = _.get(x, 'attributes.sboTerm');
  if (sboTerm !== undefined) _.set(q, 'aux.sboTerm', sboTerm);
  // take only first notes
  let notes = x.elements
    && x.elements.find((y) => y.name === 'notes');
  if (notes) q.notes = _toMarkdown(notes.elements);
  // annotation
  let annotation = x.elements
    && x.elements.find((y) => y.name === 'annotation');
  if (annotation) _.set(q, 'aux.annotation', _toAux(annotation.elements));

  return q;
}

function _toMarkdown(elements){
  let text = elements.map((x) => {
    if (x.type === 'text') {
      return x.text.replace(/\r*\n/g, '');
    } else {
      switch (x.name) {
      case 'body':
      case 'div':
      case 'p':
        return _toMarkdown(x.elements) + '\n\n';
        break;
      case 'b':
      case 'strong':
        return '**' + _toMarkdown(x.elements) + '**';
        break;
      case 'i':
        return '_' +_toMarkdown(x.elements) + '_';
        break;
      case 'ul': {
        let list = x.elements.map((y) => '  * ' +_toMarkdown(y.elements))
          .join('\n');
        return list;
        break;
      }
      case 'ol': {
        let list = x.elements.map((y) => '  1. ' +_toMarkdown(y.elements))
          .join('\n');
        return list;
        break;
      }
      case 'a': {
        let href = _.get(x, 'attributes.href');
        let title = _.get(x, 'attributes.title');
        return '[' + _toMarkdown(x.elements) + '](' + href + ')';
        break;
      }
      case 'h1':
        return '# ' + _toMarkdown(x.elements) + '\n\n';
        break;
      case 'h2':
        return '## ' + _toMarkdown(x.elements) + '\n\n';
        break;
      case 'h3':
        return '### ' + _toMarkdown(x.elements) + '\n\n';
        break;
      case 'h4':
        return '#### ' + _toMarkdown(x.elements) + '\n\n';
        break;
      case 'h5':
        return '##### ' + _toMarkdown(x.elements) + '\n\n';
        break;
      case 'h6':
        return '###### ' + _toMarkdown(x.elements) + '\n\n';
        break;
      default:
        return _toMarkdown(x.elements);
      }
    }
  }).join('');

  return text;
}

// TODO: use the same result as in SBMLViewer
function _toAux(elements){
  return elements;
}

function speciesTypeToQ(x){
  let q = baseToQ(x);
  q.class = 'Component';
  
  return q;
}

function compartmentToQ(x, unitDict = {}){
  let q = baseToQ(x);

  q.class = 'Compartment';
  q.boundary = _.get(x, 'attributes.constant') !== 'false';
  let num = _.get(x, 'attributes.size');
  if (num !== undefined) {
    _.set(q, 'assignments.start_', SBMLValueToNumber(num));
  }
  // units
  let unitDefinitionId = _.get(x, 'attributes.units');
  if (typeof unitDefinitionId !== 'undefined') {
    if (_.has(unitDict, unitDefinitionId)){
      q.units = _.get(unitDict, unitDefinitionId).simplify();
    } else {
      throw new Error(`No unitDeclaration "${unitDefinitionId}" used for compartment "${q.id}"`);
    }
  }

  // compartmentType
  let compartmentType = _.get(x, 'attributes.compartmentType');
  if (compartmentType !== undefined) _.set(q, 'tags.0', compartmentType);

  return q;
}

function speciesToQ(x, zeroSpatialDimensions = [], qArr = [], unitDict = {}){
  let q = baseToQ(x);

  q.class = 'Species';
  q.boundary = _.get(x, 'attributes.constant') === 'true' 
    || _.get(x, 'attributes.boundaryCondition') === 'true';
  q.compartment = _.get(x, 'attributes.compartment');
  q.isAmount = _.get(x, 'attributes.hasOnlySubstanceUnits') === 'true'
    || zeroSpatialDimensions.indexOf(q.compartment) >= 0;
  let concentration = _.get(x, 'attributes.initialConcentration');
  let amount = _.get(x, 'attributes.initialAmount');
  if (concentration !== undefined && !q.isAmount) {
    _.set(q, 'assignments.start_', SBMLValueToNumber(concentration));
  } else if (concentration !== undefined && q.isAmount) {
    _.set(q, 'assignments.start_', SBMLValueToNumber(concentration) + '*' + q.compartment);
  } else if (amount !== undefined && !q.isAmount) {
    _.set(q, 'assignments.start_', SBMLValueToNumber(amount) + '/' + q.compartment);
  } else if (amount !== undefined && q.isAmount) {
    _.set(q, 'assignments.start_', SBMLValueToNumber(amount));
  }
  // speciesType
  let speciesType = _.get(x, 'attributes.speciesType');
  if (speciesType !== undefined) _.set(q, 'tags.0', speciesType);

  // units
  let substanceUnitDefinitionId = _.get(x, 'attributes.substanceUnits');
  if (typeof substanceUnitDefinitionId !== 'undefined') {
    if (_.has(unitDict, substanceUnitDefinitionId)){
      let amountUnits = _.get(unitDict, substanceUnitDefinitionId);
      // find compartment units
      let compartmentComponent = qArr.find((component) => component.id === q.compartment);
      if (!compartmentComponent)
        throw new Error(`Compartment "${q.compartment}" for "${q.id}" is not found in SBML`);
      // set amount or concentration units
      if (q.isAmount){
        q.units = amountUnits.simplify();
      } else if (compartmentComponent.units){
        q.units = amountUnits
          .divide(compartmentComponent.units)
          .simplify();
      }
    } else {
      throw new Error(`No unitDeclaration "${substanceUnitDefinitionId}" used for species "${q.id}"`);
    }
  }

  return q;
}

function reactionToQ(x){
  let qArr = [];
  let localConstTranslate = [];
  let q = baseToQ(x);

  q.class = 'Reaction';

  let kineticLaw = x.elements
    && x.elements.find((y) => y.name === 'kineticLaw');
  
  // local parameters
  let listOfParameters = kineticLaw 
    && kineticLaw.elements
    && kineticLaw.elements.find((y) => y.name === 'listOfParameters');
  if (listOfParameters) {
    let parameters = listOfParameters.elements
      .filter((y) => y.name = 'parameter');
    parameters.forEach((y) => {
      let id = _.get(y, 'attributes.id');
      let newId = id + '__' + q.id + '_local';
      // set translator
      localConstTranslate.push({id, newId});
      // add component
      qArr.push({
        class: 'Const',
        id: newId,
        num: Number.parseFloat(_.get(y, 'attributes.value'))
      });
    });
  }
  // math
  let math = kineticLaw 
    && kineticLaw.elements
    && kineticLaw.elements.find((y) => y.name === 'math');
  if (math) {
    let expr = _toMathExpr(math);
    localConstTranslate.forEach((y) => {
      let regexp = new RegExp(`\\b${y.id}\\b`, 'g');
      expr = expr.replace(regexp, y.newId);
    });
    _.set(q, 'assignments.ode_', expr);
  }

  let reversible = _.get(x, 'attributes.reversible') !== 'false' ;
  _.set(q, 'aux.reversible', reversible);
  let fast = _.get(x, 'attributes.fast') === 'true' ;
  _.set(q, 'aux.fast', fast);

  // products
  let products = x.elements
    && x.elements.find((y) => y.name === 'listOfProducts');
  if (_.has(products, 'elements')) {
    var actors0 = products.elements
      .filter((y) => y.name === 'speciesReference')
      .map((y) => {
        let stoichiometry = _.get(y, 'attributes.stoichiometry', '1');
        return {
          target: _.get(y, 'attributes.species'),
          stoichiometry: Number.parseFloat(stoichiometry)
        };
      });
  } else {
    actors0 = [];
  }

  // reactants
  let reactants = x.elements
    && x.elements.find((y) => y.name === 'listOfReactants');
  if (_.has(reactants, 'elements')) {
    var actors1 = reactants.elements
      .filter((y) => y.name === 'speciesReference')
      .map((y) => {
        let stoichiometry = _.get(y, 'attributes.stoichiometry', '1');
        return {
          target: _.get(y, 'attributes.species'),
          stoichiometry: (-1) * Number.parseFloat(stoichiometry)
        };
      });
  } else {
    actors1 = [];
  }

  // modifiers
  let modifiers = x.elements
    && x.elements.find((y) => y.name === 'listOfModifiers');
  if (_.has(modifiers, 'elements')) {
    var modifiers1 = modifiers.elements
      .filter((y) => y.name === 'modifierSpeciesReference')
      .map((y) => {
        return { target: _.get(y, 'attributes.species') };
      });
  } else {
    modifiers1 = [];
  }

  q.actors = actors0.concat(actors1);
  q.modifiers = modifiers1;

  // add reaction q
  qArr.push(q);
  return qArr;
}

function parameterToQ(x, unitDict = {}){
  let q = baseToQ(x);

  let isConstant = _.get(x, 'attributes.constant') === 'true';
  let num = _.get(x, 'attributes.value');
  if (isConstant) {
    q.class = 'Const';
    if (num !== undefined) {
      q.num = SBMLValueToNumber(num);
    }
  } else {
    q.class = 'Record';
    if (num !== undefined) {
      _.set(q, 'assignments.start_', SBMLValueToNumber(num));
    }
  }

  // units
  let unitDefinitionId = _.get(x, 'attributes.units');
  if (typeof unitDefinitionId !== 'undefined') {
    if (_.has(unitDict, unitDefinitionId)){
      q.units = _.get(unitDict, unitDefinitionId).simplify();
    } else {
      throw new Error(`No unitDeclaration "${unitDefinitionId}" as required for parameter "${q.id}"`);
    }
  }

  return q;
}

function initialAssignmentToQ(x){
  let q = {
    id: _.get(x, 'attributes.symbol'),
  };

  let math = x.elements
    && x.elements.find((y) => y.name === 'math');
  if (math) _.set(q, 'assignments.start_', _toMathExpr(math));

  return q;
}

function assignmentRuleToQ(x){
  let q = {
    id: _.get(x, 'attributes.variable'),
  };

  let math = x.elements
    && x.elements.find((y) => y.name === 'math');
  if (math) _.set(q, 'assignments.ode_', _toMathExpr(math));

  return q;
}

function rateRuleToQ(x){
  let q0 = baseToQ(x);

  let target = _.get(x, 'attributes.variable');
  q0.id = target + '_proc';
  q0.class = 'Process';
  q0.actors = [{
    stoichiometry: 1,
    target: target
  }];

  let math = x.elements
    && x.elements.find((y) => y.name === 'math');
  if (math) _.set(q0, 'assignments.ode_', _toMathExpr(math));

  // remove boundary for Species
  let q1 = { id: target, boundary: false };

  return [q0, q1];
}

let eventCounter = 0;
function eventToQ(x){
  let qArr = [];

  let switcher = baseToQ(x);
  switcher.class = 'CondSwitcher';
  if (switcher.id === undefined) switcher.id = 'evt' + eventCounter++;
  qArr.push(switcher);

  // useValuesFromTriggerTime
  let useValuesFromTriggerTime = _.get(x, 'attributes.useValuesFromTriggerTime') !== 'false';
  //console.log(useValuesFromTriggerTime);

  // condition
  let trigger = x.elements
    && x.elements.find((y) => y.name === 'trigger');
  let triggerMath = trigger
    && trigger.elements
    && trigger.elements.find((y) => y.name === 'math');
  if (triggerMath) {
    let condId = switcher.id + '_cond';
    qArr.push({
      id: condId,
      class: 'Record',
      assignments: {ode_: _toMathExpr(triggerMath)}
    });
    switcher.condition = condId;
  }

  // delay : not used
  let delay = x.elements
    && x.elements.find((y) => y.name === 'delay');
  let delayMath = delay
    && delay.elements
    && delay.elements.find((y) => y.name === 'math');
  if (delayMath) {
    let delayExpr = _toMathExpr(delayMath);
    //console.log(delayExpr);
  }

  // assignments
  let assignments = x.elements 
    && x.elements.find((y) => y.name === 'listOfEventAssignments');
  if (_.has(assignments, 'elements')) {
    assignments.elements
      .filter((y) => y.name === 'eventAssignment')
      .forEach((y) => {
        let assign = {
          id: _.get(y, 'attributes.variable')
        };

        let math = y.elements
          && y.elements.find((z) => z.name === 'math');
        if (math) _.set(assign, 'assignments.' + switcher.id, _toMathExpr(math));
        qArr.push(assign);
      });
  }

  return qArr;
}

function SBMLValueToNumber(value){
  if (value.replace(/ /g, '') === 'INF') {
    return Infinity;
  } else if (value.replace(/ /g, '') === '-INF') {
    return -Infinity;
  } else if (value.replace(/ /g, '') === 'NaN') {
    return NaN;
  } else {
    return Number.parseFloat(value);
  }
}

module.exports = { SBMLParse };