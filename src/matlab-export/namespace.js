const { Namespace } = require('../namespace');
const pkg = require('../../package');

Namespace.prototype.getMatlabImage = function() {
  let builderName = pkg.name + ' of v' + pkg.version;
  
  // constants
  let constants = this
    .selectByInstanceOf('Const');
  // ODE variables
  let dynamicRecords = this.toArray()
    .filter((x) => x.instanceOf('Record') && !x.isRule);
  // initialize at start records
  let initRecords = this
    .sortExpressionsByContext('start_')
    .filter((x) => {
      return x.instanceOf('Record') 
        && (x.assignments?.start_ !== undefined || x.isRule);
    });
  // currently we output all records
  let sharedRecords = this
    .sortExpressionsByContext('ode_', true)
    .filter((x) => x.instanceOf('Record'));
  // RHS of ODE
  let rhs = dynamicRecords
    .map((record) => {
      if (!record.isDynamic) {
        return 0;
      } else { 
        return record.backReferences.map((ref, i) => {
          if (ref.stoichiometry === -1) {
            var st = '-';
          } else if (ref.stoichiometry < 0) {
            st = ref.stoichiometry + '*';
          } else if (ref.stoichiometry === 1){
            st = i === 0 ? '' : '+';
          } else { // ref.stoichiometry >= 0
            st = i === 0 ? ref.stoichiometry + '*' : '+' + ref.stoichiometry + '*';
          }
  
          return st + ref.process;
        }).join(' ');
      }
    });

  // create events from switchers
  let events = this
    .selectByInstanceOf('_Switcher')
    .map((switcher) => {
      let affect = switcher.namespace.toArray()
        .filter((x) => {
          return x.instanceOf('Record')
            && x.assignments !== undefined
            && x.assignments[switcher.id] !== undefined;
        });
      
      return {
        switcher,
        affect
      };
    });

  let yTranslator = {};
  dynamicRecords.forEach((x, i) => {
    yTranslator[x.id] = `y(${i+1})`;
  });
  
  let pTranslator = {};
  constants.forEach((x, i) => {
    pTranslator[x.id] = `p(${i+1})`;
  });
  // add from events
  let const_len = constants.length;
  events.forEach((x, i) => {
    pTranslator[x.switcher.id + '_'] = `p(${const_len + i + 1})`;
  });

  let functionDefArray = [...this.container.functionDefStorage.values()]
    .filter((functionDef) => !functionDef.isCore);

  return { 
    builderName,
    namespace: this, // set externally in Container
    constants,
    dynamicRecords,
    rhs,
    initRecords,
    sharedRecords,
    yTranslator,
    pTranslator,
    translator: Object.assign({}, yTranslator, pTranslator),
    events,
    functionDefArray
  };
};