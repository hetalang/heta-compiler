const fs = require('fs');
const _Module = require('./_module');
const { xml2js } = require('xml-js');
const { FileSystemError, ModuleError } = require('../heta-error');
const _ = require('lodash');

_Module.prototype.setSBMLModule = function(){
  //checking file exists
  if(!fs.existsSync(this.filename)) throw new FileSystemError(`No such file: ${this.filename}`);
  
  let fileContent = fs.readFileSync(this.filename, 'utf8');
  this.parsed = _SBMLParse(this.filename, fileContent);
  return this;
};

function _SBMLParse(filename, fileContent){
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

    let q = compartmentToQ(x);
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
    let q = speciesToQ(x, zeroSpatialDimensions);
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
    let q = parameterToQ(x);
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
    throw new ModuleError('"algebraicRule" from SBML module is not supported.');
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
      case 'a':
        let href = _.get(x, 'attributes.href');
        let title = _.get(x, 'attributes.title');
        return '[' + _toMarkdown(x.elements) + '](' + href + ')';
        break;
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

function _toMathExpr(element, useParentheses = false){
  let first = _.get(element, 'elements.0');
  if (element.name === 'math') {
    return _toMathExpr(element.elements[0]);
  } else if(element.name === 'apply' && (first.name === 'gt' || first.name === 'geq' || first.name === 'eq')) {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${one}-${two}`;
  } else if(element.name === 'apply' && (first.name === 'lt' || first.name === 'leq' || first.name === 'neq')) {
    let one = _toMathExpr(element.elements[1], true);
    let two = _toMathExpr(element.elements[2], true);
    return `${two}-${one}`;
  } else if(element.name === 'apply' && first.name === 'and') {
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(', ');
    return `min(${args})`;
  } else if(element.name === 'apply' && first.name === 'or') {
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(', ');
    return `max(${args})`;
  } else if(element.name === 'apply' && first.name === 'xor' && element.elements.length === 3) {
    let one = _toMathExpr(element.elements[1]);
    let two = _toMathExpr(element.elements[2]);
    return `max(min(${one}, -(${two})), min(-(${one}), ${two}))`;
  } else if(element.name === 'apply' && first.name === 'not') {
    let one = _toMathExpr(element.elements[1]);
    return `- (${one})`;
  } else if(element.name === 'apply' && first.name === 'times') {
    return _.drop(element.elements) // without first element
      .map((x) => _toMathExpr(x, true)).join(' * ');
  } else if(element.name === 'apply' && first.name === 'divide') {
    return _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(' / ');
  } else if(element.name === 'apply' && first.name === 'minus') {
    let expr = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(' - ');
    return useParentheses ? `(${expr})` : expr;
  } else if(element.name === 'apply' && first.name === 'plus') {
    let expr = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(' + ');
    return useParentheses ? `(${expr})` : expr;
  } else if(element.name === 'apply' && first.name === 'power') {
    let expr = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true)).join(', ');
    return `pow(${expr})`;
  } else if(element.name === 'apply' && first.name === 'ceiling') {
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x, true));
    return `ceil(${args[0]})`;
  } else if(element.name === 'apply' && first.name === 'root') {
    let degree = element.elements
      .find(y => y.name === 'degree');
    let args = _.drop(element.elements)
      .filter((x) => x.name !== 'degree')
      .map((x) => _toMathExpr(x, true));
    if (degree) {
      let n_element = _.get(degree, 'elements.0');
      let n = _toMathExpr(n_element);
      return `nthRoot(${args[0]}, ${n})`;
    } else {
      return `sqrt(${args[0]})`;
    }
  } else if(element.name === 'apply' && first.name === 'ln') {
    let expr = _.drop(element.elements)
      .map((x) => _toMathExpr(x));
    return `ln(${expr[0]})`;
  } else if(element.name === 'apply' && first.name === 'log') {
    let logbase = element.elements
      .find(y => y.name === 'logbase');
    let expr = _.drop(element.elements)
      .filter((x) => x.name !== 'logbase')
      .map((x) => _toMathExpr(x));
    if (logbase === undefined) {
      return `log10(${expr[0]})`;
    } else if (_.get(logbase, 'elements.0.elements.0.text') === '2') {
      return `log2(${expr[0]})`;
    } else {
      let base = _toMathExpr(logbase.elements[0]);
      return `log(${expr[0]}, ${base})`;
    }
  } else if (element.name === 'piecewise' && element.elements.length === 2) {
    let arg1 = _toMathExpr(_.get(element, 'elements.0.elements.0'));
    let arg2 = _toMathExpr(_.get(element, 'elements.1.elements.0'));
    let condName = _.get(first, 'elements.1.elements.0.name');
    let condElements = _.get(first, 'elements.1.elements');
    let condArgs = _.drop(condElements)
      .map((x) => _toMathExpr(x));
    if (condName === 'lt') {
      let cond = `${condArgs[1]} - ${condArgs[0]}`;
      return `ifg0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'gt') {
      let cond = `${condArgs[0]} - ${condArgs[1]}`;
      return `ifg0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'leq') {
      let cond = `${condArgs[1]} - ${condArgs[0]}`;
      return `ifge0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'geq') {
      let cond = `${condArgs[0]} - ${condArgs[1]}`;
      return `ifge0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'eq') {
      let cond = `${condArgs[0]} - ${condArgs[1]}`;
      return `ife0(${cond}, ${arg1}, ${arg2})`;
    } else if (condName === 'neq') {
      let cond = `${condArgs[0]} - ${condArgs[1]}`;
      return `ife0(${cond}, ${arg2}, ${arg1})`;
    } else {
      throw new Error('Error in translation MathML piecewise');
    }
  } else if (element.name === 'piecewise') {
    throw new Error('one piece is supported in MathML peicewise.');
  } else if (element.name === 'apply' && (first.name === 'ci' || first.name === 'csymbol')) { // some user defined functions
    let funcName = _toMathExpr(first); // _.get(first, 'elements.0.text');
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x)).join(', ');
    return `${funcName}(${args})`;
  } else if (element.name === 'apply') { // all other internal mathml functions
    let args = _.drop(element.elements)
      .map((x) => _toMathExpr(x)).join(', ');
    return `${first.name}(${args})`;
  } else if (element.name === 'ci') {
    return _.get(element, 'elements.0.text');
  } else if (element.name === 'csymbol' && _.get(element, 'attributes.definitionURL') === 'http://www.sbml.org/sbml/symbols/time') {
    return 't';
  } else if (element.name === 'csymbol' && _.get(element, 'attributes.definitionURL') === 'http://www.sbml.org/sbml/symbols/delay') {
    return 'delay';
  } else if (element.name === 'csymbol') {
    return _.get(element, 'elements.0.text');
  } else if (element.name === 'cn' && _.get(element, 'attributes.type') === 'rational' && _.get(element, 'elements.1.name') === 'sep') { // rational numbers: 1/1000
    let numerator = _.get(element, 'elements.0.text');
    let denominator = _.get(element, 'elements.2.text');
    let sign = (numerator >= 0 && denominator > 0) || (numerator <= 0 && denominator < 0)
      ? ''
      : '-';
    return `(${sign}${Math.abs(numerator)}/${Math.abs(denominator)})`;
  } else if (element.name === 'cn' && _.get(element, 'attributes.type') === 'e-notation' && _.get(element, 'elements.1.name') === 'sep') { // rational numbers: 1.1*10^-3
    let mantissa = _.get(element, 'elements.0.text').trim();
    let power = _.get(element, 'elements.2.text').trim();
    return `(${mantissa}e${power})`;
  } else if (element.name === 'cn' && _.get(element, 'elements.0.text') < 0) { // negative number requires (-2)
    return `(${_.get(element, 'elements.0.text')})`;
  } else if (element.name === 'cn') { // regular positive numbers
    return _.get(element, 'elements.0.text');
  } else if (element.name === 'true') {
    return '1';
  } else if (element.name === 'false') {
    return '-1';
  } else if (element.name === 'exponentiale') {
    return 'e';
  } else if (element.name === 'pi') {
    return 'pi';
  } else if (element.name === 'infinity') {
    return 'Infinity';
  } else if (element.name === 'notanumber') {
    return 'NaN';
  } else {
    //console.log(element)
    throw new Error('Cannot parse MathML:' + element);
  }
}

function compartmentToQ(x){
  let q = baseToQ(x);

  q.class = 'Compartment';
  q.boundary = _.get(x, 'attributes.constant') !== 'false';
  let num = _.get(x, 'attributes.size');
  if (num !== undefined) {
    _.set(q, 'assignments.start_', SBMLValueToNumber(num));
  }

  // compartmentType
  let compartmentType = _.get(x, 'attributes.compartmentType');
  if (compartmentType !== undefined) _.set(q, 'tags.0', compartmentType);

  return q;
}

function speciesToQ(x, zeroSpatialDimensions = []){
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

function parameterToQ(x){
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