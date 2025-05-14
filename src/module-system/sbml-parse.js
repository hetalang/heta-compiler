const _toMathExpr = require('./to-math-expr');
const { xml2js } = require('xml-js');
const { encodeXML } = require('entities');
const { Unit } = require('../core/unit');
const legalUnits = require('../legal-sbml-units');
const HetaLevelError = require('../heta-level-error');

/**
 * Transforms text content of SBML file to Q-array.
 * 
 * @param {string} fileContent SBML file content.
 * @returns {array} Parsed content in Q-array format.
 */
function SBMLParse(fileText, options = {}) {
  let fileTextNoAnnotation = fileText.replace(/<annotation>([\s\S]*?)<\/annotation>/g, (match, p1) => {
    let res =  encodeXML(p1)
      .replace(/[\t\r\n]+/g, '');
    return `<annotation>${res}</annotation>`;
  });
  let JSBML = xml2js(fileTextNoAnnotation, { compact: false });
  
 //let JSBML = xml2js(fileText, { compact: false });

  return jsbmlToQArr(JSBML, options);
}

/*
  Converst of JSON image of SBML to Heta array
*/
function jsbmlToQArr(JSBML, options = {}) {
  let qArr = [];
  let eventCounter = 0; // reset event counter

  let sbml = JSBML.elements // <file>
    .find((x) => x.name === 'sbml'); // <sbml>

  let model = sbml.elements
    .find((x) => x.name === 'model'); // <model>

  // preliminary analyses listOfInitialAssignments to get variables to init in the beginning
  // it is applied for parameters which are @Records, not @Const
  let initialAssignmentsSymbols = model.elements
    .filter((x) => x.name === 'listOfInitialAssignments')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'initialAssignment')
    .map((x) => x.attributes?.symbol);

  // unit definition
  let unitDict = {};
  model.elements
    .filter((x) => x.name === 'listOfUnitDefinitions')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'unitDefinition')
    .forEach((x) => {
      unitDict[x.attributes.id] = unitDefinitionToUnits(x);
    });

  // get time units
  let timeUnits = model.attributes?.timeUnits;
  if (typeof timeUnits !== 'undefined') {
    let q = { action: 'update', id: 't' };
    let legalUnitIndex = legalUnits.indexOf(timeUnits);
    if (legalUnitIndex !== -1) { // if id in legal unit list
      q.units = Unit.fromQ([{ kind: timeUnits }]);
    } else if (unitDict[timeUnits] !== undefined) { // if id in unitDefinitions
      q.units = unitDict[timeUnits]; //.simplify(); 
    } else {
      q.units = Unit.fromQ([{ kind: timeUnits }]);
    }
    qArr.push(q); // add only if units presented
  }

  // function definitions
  model.elements
    .filter((x) => x.name === 'listOfFunctionDefinitions')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'functionDefinition')
    .forEach((x) => {
      let q = functionDefinitionToQ(x);
      qArr.push(q);
    });

  // species types, for IRT
  model.elements
    .filter((x) => x.name ==='listOfSpeciesTypes')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'speciesType')
    .forEach((x) => {
      let q = speciesTypeToQ(x);
      qArr.push(q);
    });

  // compartments
  let zeroSpatialDimensions = [];
  model.elements
    .filter((x) => x.name === 'listOfCompartments')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'compartment')
    .forEach((x) => {
      // collect compartments with zero dimention
      let isZero = x.attributes?.spatialDimensions === '0';
      if (isZero) {
        zeroSpatialDimensions.push(x.attributes?.id);
        // set zero initial size
        x.attributes = Object.assign({}, x.attributes, {size: '0'});
      }

      let q = compartmentToQ(x, unitDict);
      qArr.push(q);
    });

  // species
  model.elements
    .filter((x) => x.name === 'listOfSpecies')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'species')
    .forEach((x) => {
      let q = speciesToQ(x, zeroSpatialDimensions, qArr, unitDict);
      qArr.push(q);
    });

  // reactions
  model.elements
    .filter((x) => x.name === 'listOfReactions')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'reaction')
    .forEach((x) => {
      let qArr_add = reactionToQ(x);
      qArr = qArr.concat(qArr_add);
    });

  // parameters
  model.elements
    .filter((x) => x.name === 'listOfParameters')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'parameter')
    .forEach((x) => {
      let forceRecord = initialAssignmentsSymbols.indexOf(x.attributes?.id) >= 0;
      let q = parameterToQ(x, unitDict, forceRecord);
      qArr.push(q);
    });

  // initialAssignments
  model.elements
    .filter((x) => x.name === 'listOfInitialAssignments')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'initialAssignment')
    .forEach((x) => {
      let q = initialAssignmentToQ(x);
      qArr.push(q);
    });

  // assignmentRules
  model.elements
    .filter((x) => x.name === 'listOfRules')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'assignmentRule')
    .forEach((x) => {
      let q = assignmentRuleToQ(x);
      qArr.push(q);
    });

  // algebraicRules
  let algebraicRules = model.elements
    .filter((x) => x.name === 'listOfRules')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'algebraicRule');
  if (algebraicRules.length !== 0) {
    throw new HetaLevelError('"algebraicRule" from SBML module is not supported.');
  }

  // rateRules
  model.elements
    .filter((x) => x.name === 'listOfRules')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'rateRule')
    .forEach((x) => {
      let qArr_add = rateRuleToQ(x);
      qArr = qArr.concat(qArr_add);
    });

  // events
  model.elements
    .filter((x) => x.name === 'listOfEvents')
    .map((x) => x.elements)
    .flat(1)
    .filter((x) => x.name === 'event')
    .forEach((x) => {
      let qs = eventToQ(x, eventCounter++, options);
      qArr = qArr.concat(qs);
    });

  return qArr;
}

/*
  transform SBML-like unit definition to Heta-like unit array
*/
function unitDefinitionToUnits(x){
  let units = x.elements
    .filter((x) => x.name === 'listOfUnits')[0]
    .elements
    .map((element) => {
      let { kind, multiplier, scale, exponent } = element.attributes;
      return {
        kind: kind,
        multiplier: (multiplier || 1) * 10**(scale || 0),
        exponent: parseInt(exponent) || 1
      };
    });

  return Unit.fromQ(units);
}


/*
  transform SBML-like function definition to Heta-like unit array
*/
function functionDefinitionToQ(x) {

  let q = {
    action: 'defineFunction',
    id: x.attributes.id
  };

  let mathElement = x.elements?.find((y) => y.name === 'math');
  let lambdaElement = mathElement?.elements?.find((y) => y.name === 'lambda');

  if (!mathElement || !lambdaElement ) {
    throw new HetaLevelError(`Heta does not support empty <math> or <lambda> "${q.id}" elements in FunctionDefinition,`);
  }

  // get argument ids
  q.arguments = lambdaElement.elements
    ?.filter((y) => y.name === 'bvar')
    .map((y) => y.elements && y.elements.find((z) => z.name === 'ci'))
    .map((y) => y.elements && y.elements.find((z) => z.type === 'text'))
    .map((y) => y.text.trim());

  // get expression
  let notBvarElement = lambdaElement.elements
    ?.find((y) => y.name !== 'bvar');
  q.math = _toMathExpr(notBvarElement);


  return q;
}

/*
  Converts common properties to Heta Object
*/
function baseToQ(x){
  let q = {
    id: x.attributes?.id,
    title: x.attributes?.name,
    aux: {}
  };
  // set metaid
  let metaid = x.attributes?.metaid;
  if (metaid !== undefined) q.aux.metaid = metaid;
  // set sboTerm
  let sboTerm = x.attributes?.sboTerm;
  if (sboTerm !== undefined) q.aux.sboTerm = sboTerm;
  // take only first notes
  let notes = x.elements?.find((y) => y.name === 'notes');
  if (notes) q.notes = _toMarkdown(notes.elements);
  // annotation
  //annotation && (q.aux.annotation = _toAux(annotation.elements));
  let annotation = x.elements?.find((y) => y.name === 'annotation');
  let annotationContent = annotation?.elements?.map((x) => x.text).join('');
  !!annotationContent && (q.xmlAnnotation = annotationContent);

  return q;
}

function _toMarkdown(elements = []){
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
        let href = x.attributes?.href;
        let title = x.attributes?.title;
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
  q.boundary = x.attributes?.constant !== 'false';
  let num = x.attributes?.size;
  
  if (num !== undefined) {
    q.assignments = { start_: SBMLValueToNumber(num) };
  }
  // units
  let unitId = x.attributes?.units;
  if (typeof unitId !== 'undefined') {
    let legalUnitIndex = legalUnits.indexOf(unitId); //
    if (legalUnitIndex !== -1) { // if id in legal unit list
      q.units = Unit.fromQ([{ kind: unitId }]);
    } else if (unitDict[unitId] !== undefined){
      q.units = unitDict[unitId].simplify('dimensionless');
    } else {
      q.units = Unit.fromQ([{ kind: unitId }]);
      // the alternative solution is to throw undeclared units
      //throw new HetaLevelError(`No unitDeclaration "${unitId}" used for compartment "${q.id}"`);
    }
  }

  // compartmentType
  let compartmentType = x.attributes?.compartmentType;
  if (compartmentType !== undefined) {
    q.tags = [compartmentType];
  }

  return q;
}

function speciesToQ(x, zeroSpatialDimensions = [], qArr = [], unitDict = {}){
  let q = baseToQ(x);

  q.class = 'Species';
  q.boundary = x.attributes?.constant === 'true' 
    || x.attributes?.boundaryCondition === 'true';
  q.compartment = x.attributes?.compartment;
  q.isAmount = x.attributes?.hasOnlySubstanceUnits === 'true'
    || zeroSpatialDimensions.indexOf(q.compartment) >= 0;
  let concentration = x.attributes?.initialConcentration;
  let amount = x.attributes?.initialAmount;
  if (concentration !== undefined && !q.isAmount) {
    q.assignments = { start_: SBMLValueToNumber(concentration) };
  } else if (concentration !== undefined && q.isAmount) {
    q.assignments = { start_: SBMLValueToNumber(concentration) + '*' + q.compartment };
  } else if (amount !== undefined && !q.isAmount) {
    q.assignments = { start_: SBMLValueToNumber(amount) + '/' + q.compartment };
  } else if (amount !== undefined && q.isAmount) {
    q.assignments = { start_: SBMLValueToNumber(amount) };
  }
  // speciesType
  let speciesType = x.attributes?.speciesType;
  if (speciesType !== undefined) q.tags = [speciesType];

  // units
  let substanceUnitId = x.attributes?.substanceUnits;
  if (typeof substanceUnitId !== 'undefined') {
    // find compartment units
    let compartmentComponent = qArr.find((component) => component.id === q.compartment);
    if (!compartmentComponent)
      throw new HetaLevelError(`Compartment "${q.compartment}" for "${q.id}" is not found in SBML`);
    let compartmentUnits = compartmentComponent.units;

    // set species units
    let legalUnitIndex = legalUnits.indexOf(substanceUnitId);
    if (legalUnitIndex !== -1) { // if id in legal unit list
      let amountUnits = Unit.fromQ([{ kind: substanceUnitId }]);
      if (q.isAmount) {
        q.units = amountUnits;
      } else if (compartmentUnits !== undefined) {
        q.units = amountUnits
          .divide(compartmentUnits)
          .simplify();
      }
    } else if (unitDict[substanceUnitId] !== undefined) {
      let amountUnits = unitDict[substanceUnitId];
      // set amount or concentration units
      if (q.isAmount) {
        q.units = amountUnits
          .simplify();
      } else if (compartmentUnits !== undefined) {
        q.units = amountUnits
          .divide(compartmentUnits)
          .simplify();
      }
    } else {
      let amountUnits = Unit.fromQ([{ kind: substanceUnitId }]);
      if (q.isAmount) {
        q.units = amountUnits;
      } else if (compartmentUnits !== undefined) {
        q.units = amountUnits
          .divide(compartmentUnits)
          .simplify();
      }
      // alternative solution is to throw error for undeclared "substance"
      // throw new HetaLevelError(`No unitDeclaration "${substanceUnitId}" used for species "${q.id}"`);
    }
  }

  return q;
}

function reactionToQ(x){
  let qArr = [];
  let localConstTranslate = [];
  let q = baseToQ(x);

  q.class = 'Reaction';

  let kineticLaw = x.elements?.find((y) => y.name === 'kineticLaw');
  
  // local parameters
  let listOfParameters = kineticLaw?.elements?.find((y) => y.name === 'listOfParameters' || y.name === 'listOfLocalParameters');
  if (listOfParameters) {
    let parameters = listOfParameters.elements
      .filter((y) => y.name = 'parameter');
    parameters.forEach((y) => {
      let id = y.attributes?.id;
      let newId = id + '__' + q.id + '_local';
      // set translator
      localConstTranslate.push({id, newId});
      // add component
      qArr.push({
        class: 'Const',
        id: newId,
        num: Number.parseFloat(y.attributes?.value)
      });
    });
  }
  // math
  let math = kineticLaw?.elements?.find((y) => y.name === 'math');
  if (math) {
    let expr = _toMathExpr(math);
    localConstTranslate.forEach((y) => {
      let regexp = new RegExp(`\\b${y.id}\\b`, 'g');
      expr = expr.replace(regexp, y.newId);
    });
    q.assignments = { ode_: expr };
  }

  // check if reversible
  q.reversible = x.attributes?.reversible !== 'false' ;
  
  // check if fast
  let fast = x.attributes?.fast === 'true' ;
  // q.aux.fast = fast;
  if (fast) {
    throw new HetaLevelError(`"fast" reactions "${q.id}" is not supported in SBML module.`);
  }

  // products
  let products = x.elements?.find((y) => y.name === 'listOfProducts');
  if (products?.elements) {
    var actors0 = products.elements
      .filter((y) => y.name === 'speciesReference')
      .map((y) => {
        // check stoichiometry as an expression
        let stoichiometryExpr = (y.elements || [])
          .filter((z) => z.name === 'stoichiometryMath');
        if (stoichiometryExpr.length > 0)
          throw new HetaLevelError('"stoichiometryMath" from SBML module is not supported.');

        // get constant stoichiometry
        let stoichiometry = y.attributes?.stoichiometry || '1';
        return {
          target: y.attributes?.species,
          stoichiometry: Number.parseFloat(stoichiometry)
        };
      });
  } else {
    actors0 = [];
  }

  // reactants
  let reactants = x.elements?.find((y) => y.name === 'listOfReactants');
  if (reactants?.elements) {
    var actors1 = reactants.elements
      .filter((y) => y.name === 'speciesReference')
      .map((y) => {
        // check stoichiometry as an expression
        let stoichiometryExpr = (y.elements || [])
          .filter((z) => z.name === 'stoichiometryMath');
        if (stoichiometryExpr.length > 0)
          throw new HetaLevelError('"stoichiometryMath" from SBML module is not supported.');

        // get constant stoichiometry
        let stoichiometry = y.attributes?.stoichiometry || '1';
        return {
          target: y.attributes?.species,
          stoichiometry: (-1) * Number.parseFloat(stoichiometry)
        };
      });
  } else {
    actors1 = [];
  }

  // modifiers
  let modifiers1 = (x.elements?.find((y) => y.name === 'listOfModifiers')?.elements || [])
    .filter((y) => y.name === 'modifierSpeciesReference')
    .map((y) => {
      return { target: y.attributes?.species };
    });

  q.actors = actors0.concat(actors1);
  q.modifiers = modifiers1;

  // add reaction q
  qArr.push(q);
  return qArr;
}

function parameterToQ(x, unitDict = {}, forceRecord = false){
  let q = baseToQ(x);

  let isConstant = x.attributes?.constant === 'true';
  let num = x.attributes?.value;
  if (isConstant && !forceRecord) {
    q.class = 'Const';
    if (num !== undefined) {
      q.num = SBMLValueToNumber(num);
    }
  } else if (isConstant) {
    q.class = 'Record';
    if (num !== undefined) {
      q.assignments = { start_: SBMLValueToNumber(num) };
    }
    q.boundary = true;
  } else {
    q.class = 'Record';
    if (num !== undefined) {
      q.assignments = { start_: SBMLValueToNumber(num) };
    }
  }

  // units
  let unitId = x.attributes?.units;
  if (typeof unitId !== 'undefined') {
    let legalUnitIndex = legalUnits.indexOf(unitId); //
    if (legalUnitIndex !== -1) { // if id in legal unit list
      q.units = Unit.fromQ([{ kind: unitId }]);
    } else if (unitDict[unitId] !== undefined) { // if id in unitDefinitions
      // I removed simplify here to support pretty units in IRT
      q.units = unitDict[unitId]; //.simplify(); 
    } else {
      q.units = Unit.fromQ([{ kind: unitId }]);
      // alternative solution is to throw undeclared "unit"
      //throw new HetaLevelError(`No unitDeclaration "${unitId}" as required for parameter "${q.id}"`);
    }
  }

  return q;
}

function initialAssignmentToQ(x){
  let q = {
    id: x.attributes?.symbol,
  };

  let math = x.elements?.find((y) => y.name === 'math');
  if (math !== undefined) {
    q.assignments = {start_: _toMathExpr(math)};
  }

  return q;
}

function assignmentRuleToQ(x){
  let q = {
    id: x.attributes?.variable
  };

  let math = x.elements?.find((y) => y.name === 'math');
  if (math !== undefined) {
    q.assignments = { ode_: _toMathExpr(math) };
  }

  return q;
}

function rateRuleToQ(x){
  let q0 = baseToQ(x);

  let target = x.attributes?.variable;
  q0.id = target + '_proc';
  q0.class = 'Process';
  q0.actors = [{
    stoichiometry: 1,
    target: target
  }];

  let math = x.elements?.find((y) => y.name === 'math');
  if (math !== undefined) {
    q0.assignments = { ode_: _toMathExpr(math) };
  }

  // remove boundary for Species, because Heta does not change boundary species, but SBML does.
  let q1 = { id: target, boundary: false };

  return [q0, q1];
}

function eventToQ(x, eventCounter, options = {}){
  let qArr = [];

  let switcher = baseToQ(x);
  // TODO: in future convert to `CSwitcher` trigger if options.useCSwitcher === true`
  switcher.class = 'DSwitcher';
  if (switcher.id === undefined) switcher.id = 'evt' + eventCounter;
  qArr.push(switcher);

  // useValuesFromTriggerTime
  let useValuesFromTriggerTime = x.attributes?.useValuesFromTriggerTime !== 'false';

  // trigger
  let trigger = x.elements?.find((y) => y.name === 'trigger');
  let triggerMath = trigger?.elements?.find((y) => y.name === 'math');
  if (triggerMath) {
    let booleanTrigger = _toMathExpr(triggerMath);

    // TODO: in future convert to `CSwitcher` trigger if options.useCSwitcher === true`
    switcher.trigger = booleanTrigger;
  }

  // check if delay is presented, should we include it to Heta standard?
  let delay = x.elements?.find((y) => y.name === 'delay');
  // currently not used
  /*
  let delayMath = delay
    && delay.elements
    && delay.elements.find((y) => y.name === 'math');
  if (delayMath) {
    let delayExpr = _toMathExpr(delayMath);
    //console.log(delayExpr);

  }
  */
  if (delay !== undefined) {
    throw new HetaLevelError('"delay" in event is not supported in SBML module'); 
  }
  // assignments
  let assignments = x.elements?.find((y) => y.name === 'listOfEventAssignments');
  if (assignments?.elements !== undefined) {
    assignments.elements
      .filter((y) => y.name === 'eventAssignment')
      .forEach((y) => {
        let assign = {
          id: y.attributes?.variable,
          assignments: {}
        };

        let math = y.elements?.find((z) => z.name === 'math');
        if (math !== undefined) {
          assign.assignments[switcher.id] = _toMathExpr(math);
        }
        qArr.push(assign);
      });
  }

  return qArr;
}

function SBMLValueToNumber(value) {
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
