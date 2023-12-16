const { Namespace } = require('../namespace');
require('./expression'); // to use method toJuliaString()
const { uniqBy } = require('../utils');

Namespace.prototype.getJuliaImage = function() {
  // constants
  let constants = this
    .selectByInstanceOf('Const');
  // ODE variables
  let dynamicRecords = this
    .selectByInstanceOf('Record')
    .filter((x) => x.isDynamic);
  // currently we output all records
  let extendedRuleRecords = this
    .sortExpressionsByContext('ode_', true)
    .filter((x) => x.isExtendedRule);
  let staticRecords = this
    .selectByInstanceOf('Record')
    .filter((x) => !x.isDynamic && !x.isRule);
  // RHS of ODE
  let rhs = dynamicRecords.map((record) => {
    return record.backReferences.map((ref, i) => {
      if (ref.stoichiometry === -1) {
        var st = '-';
      } else if (ref.stoichiometry < 0) {
        st = ref.stoichiometry + '*';
      } else if (ref.stoichiometry === 1) {
        st = i === 0 ? '' : '+';
      } else { // ref.stoichiometry >= 0
        st = i === 0 ? ref.stoichiometry + '*' : '+' + ref.stoichiometry + '*';
      }
      
      // XXX this is wrong solution because it results in problem d(comp1*S1)/dt = r1*comp1
      let isCompartmentRequired = ref._process_.className === 'Process' 
        && record.instanceOf('Species') 
        && !record.isAmount;
      if (isCompartmentRequired) {
        return st + ref.process + '*' + record.compartment;
      } else {
        return st + ref.process;
      }
    }).join('');
  });

  // initialize at start records
  let initRecordsRaw = this
    .sortExpressionsByContext('start_')
    .filter((x) => x.instanceOf('Record') && (x.assignments['start_'] !== undefined || x.isRule));
  /* shorter version of rules, but not sure it's effective
  let initDeps = [].concat(
    dynamicRecords.map(x => x.id),
    staticRecords.map(x => x.id)
  );
  let initRecords = _minimalRuleList(initRecordsRaw, initDeps);
  */
  let initRecords = initRecordsRaw;

  // select only rules to calculate ode
  // TODO: maybe it is betted to calculate only active Processes
  let odeDeps = this
    .selectByInstanceOf('Process')
    .map((x) => x.id);
  let odeRules = _minimalRuleList(extendedRuleRecords, odeDeps);

  // other switchers
  let events = this
    .selectByInstanceOf('_Switcher')
    .map((switcher) => {
      let affect = this.toArray()
        .filter((x) => {
          return x.instanceOf('Record') 
            && x.assignments !== undefined 
            && x.assignments[switcher.id] !== undefined;
        });

      // find all unique dependencies inside assignments
      let affectDeps = [];
      affect.forEach((x) => {
        let dep = x.dependOn(switcher.id, true);
        affectDeps.push(...dep);
      });
      
      // select rules required for affect
      let affectRules = _minimalRuleList(extendedRuleRecords, uniqBy(affectDeps));

      // find all unique dependencies inside trigger
      let triggerDeps = switcher.trigger ? switcher.trigger.dependOn() : [];
      // select rules required for switcher
      let triggerRules = _minimalRuleList(extendedRuleRecords, uniqBy(triggerDeps));

      return {
        switcher,
        triggerRules,
        affect,
        affectRules
      };
    });

  let pTranslatorObject = {};
  constants.forEach((constant, i) => {
    pTranslatorObject[constant.id] = `__constants__[${i+1}]`;
  });
    
  return {
    namespace: this,
    constants,
    dynamicRecords,
    staticRecords,
    rhs,
    initRecords,
    extendedRuleRecords,
    odeRules,
    events,
    pTranslator: pTranslatorObject,
  };
};

// select sub-array from rulesList which describes deps
function _minimalRuleList(rulesList, deps = []){
  // calculate number of rules to include
  let rulesListIds = rulesList.map((x) => x.id);
  let rulesListNum = deps.map((x) => rulesListIds.indexOf(x));
  let rulesMaxIndex = Math.max(...rulesListNum);

  // select rules required
  return rulesList.slice(0, rulesMaxIndex + 1);
}