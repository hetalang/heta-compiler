const { Namespace } = require('../namespace');
const { uniqBy, differenceBy } = require('../utils');

Namespace.prototype.getSummaryImage = function() {
  let fullComponentIds = [...this.keys()];
  let fullConstIds = this.selectByInstanceOf('Const').map((x) => x.id);
  let fullRecordIds = this.selectByInstanceOf('Record') // remove processes from here
    .filter((x) => !x.instanceOf('Process'))
    .map((x) => x.id); 
  let fullSwitchers = this.selectByInstanceOf('_Switcher');
  // for Record assignments
  let usedIds1 = this.selectByInstanceOf('Record').reduce((acc, x) => {
    // start_
    let startSymbols = x.assignments.start_?.dependOn();
    startSymbols && (acc = acc.concat(startSymbols));
    // ode_
    let odeSymbols = x.assignments.ode_?.dependOn();
    odeSymbols && (acc = acc.concat(odeSymbols));
    // switchers
    fullSwitchers.forEach((sw) => {
      let contextSymbols_i = x.assignments[sw.id]?.dependOn();
      contextSymbols_i && (acc = acc.concat(contextSymbols_i));
    });
    // context
    Object.keys(x.assignments).filter((context) => {
      if (context !== 'ode_' && context !== 'start_') {
        acc.push(context);
      }
    });

    return acc;
  }, []);
  // for Switcher trigger
  let usedIds2 = fullSwitchers.reduce((acc, x) => {
    let triggerSymbols = x.trigger?.dependOn();
    triggerSymbols && (acc = acc.concat(triggerSymbols));

    return acc;
  }, []);
  // for Species compartment
  let usedIds3 = this.selectByInstanceOf('Species').map((x) => {
    return x.compartment;
  });
  // for Process actors
  let usedIds4 = this.selectByInstanceOf('Process').reduce((acc, x) => {
    let actorSymbols = x.actors?.map((x) => x.target);
    actorSymbols && (acc = acc.concat(actorSymbols));

    return acc;
  }, []);
  // for TimeSwitcher start, period, stop
  let usedIds5 = this.selectByInstanceOf('TimeSwitcher').reduce((acc, x) => {
    x.start && acc.push(x.start);
    x.period && acc.push(x.period);
    x.stop && acc.push(x.stop);

    return acc;
  }, []);
  // for Reaction compartment
  let usedIds6 = this.selectByInstanceOf('Reaction').filter((x) => !!x.compartment).map((x) => {
    return x.compartment;
  });

  let usedIds = uniqBy([].concat(usedIds1, usedIds2, usedIds3, usedIds4, usedIds5, usedIds6));

  let orphanSwitchers = fullSwitchers.filter((sw) => {
    let recordWithContext = this.selectByInstanceOf('Record').find((x) => {
      return !!x.assignments[sw.id];
    });

    return !recordWithContext; // true if orphan
  }).map((x) => x.id);

  return {
    ns: this,
    orphanConsts: differenceBy(fullConstIds, usedIds),
    orphanRecords: differenceBy(fullRecordIds, usedIds),
    orphanSwitchers: orphanSwitchers,
    lostComponents: differenceBy(usedIds, fullComponentIds)
  };
};
