const { Namespace } = require('../namespace');
const { Expression, math } = require('../core/expression');
const TopoSort = require('@insysbio/topo-sort');
const HetaLevelError = require('../heta-level-error');

// XXX: Still not sure if Expression clone() is required here
// Currently I do not use clone().

/*
    Function converting concrete Namespace to DynMS format.
    Chosen solution:
    - initial values for `states` can be either numbers or expressions depending on constants only.
    - when converting init expressions for `states` we substitute: 
        - other states by init expressions
        - rules by their expressions
        - constants stay as they are
    - we create a new states with _amt_ suffix
    - we do not create new constants
*/
Namespace.prototype.makeDynMSModel = function(exprFormat = 'math-json', expRenderer = (expr) => expr.toMathJSON()) {
    //let { logger } = this.container;

    // generate constants list
    let constants = this.selectByClassName('Const')
        .map((x) => {
            return { id: x.id, value: x.num, title: x.title };
        });

    // generate states list: not only dynamic, but also static
    let states = this.selectByInstanceOf('Record')
        .filter((x) => !x.isRule)
        .map((x) => {
            let isConcentration = x.instanceOf('Species') && !x.isAmount;
            let initialAssignment = x.assignments['start_'];
            let num = initialAssignment.num; // use getter from Expression
            let isStatic = !x.isDynamic ? true : undefined;
            let title = x.title;

            if (isConcentration) {
                var stateId = x.id + '_amt_';
                var expr = initialAssignment.multiply(x.compartment);
            } else {
                stateId = x.id;
                expr = initialAssignment;
            }
            
            if (typeof num === 'number' && !isConcentration) {
                return { id: stateId, initial: num, static: isStatic, title: title };
            } else {
                let substitutedExpr = _substitute_and_simplify(expr, this);

                return { id: stateId, initial: {expr: expRenderer(substitutedExpr), format: exprFormat}, static: isStatic, title: title };
            }
        });

    // generate assignments list
    let unsortedAssignments = this.selectByInstanceOf('Record')
        .filter((x) => x.isRule || (x.instanceOf('Species') && !x.isAmount))
        .map((x) => {
            if (x.isRule) {
                let rawExpr = x.assignments['ode_'];
                var expr = rawExpr.substituteByDefinitions();
            } else {
                expr = Expression.fromString(`${x.id}_amt_ / ${x.compartment}`);
            }

            return [x.id, expr, x.title];
        });
    // add TimeScale as regular rule
    this.selectByInstanceOf('TimeScale')
        .filter((ts) => ts.id !== 't')
        .forEach((ts) => {
            let expr = Expression.fromString(`${ts.slope} * t + ${ts.intercept}`);
            unsortedAssignments.push([ts.id, expr, ts.title]);
            //console.log([ts.id, expr, ts.title])
        });
    let sortedAssignments = _sort_expressions_by_dependency(unsortedAssignments);
    let assignments = sortedAssignments.map(([id, expr, title]) => {
        return { id: id, rhs: { expr: expRenderer(expr), format: exprFormat }, title: title };
    });

    let derivatives = this.selectByInstanceOf('Record')
        .filter((x) => x.isDynamic)
        .map((x) => {
            let isConcentration = x.instanceOf('Species') && !x.isAmount;
            let stateId = isConcentration ? x.id + '_amt_' : x.id;
            let algebraic = x.ss;

            // stoichiometry
            let exprString = x.backReferences.map((ref, i) => {
                if (ref.stoichiometry < 0 && ref.stoichiometry === -1) {
                    return `- ${ref.process}`;
                } else if (ref.stoichiometry < 0) {
                    return `${ref.stoichiometry} * ${ref.process}`;
                } else if (ref.stoichiometry > 0 && ref.stoichiometry === 1) {
                    return `+ ${ref.process}`;
                } else if (ref.stoichiometry > 0) {
                    return `+ ${ref.stoichiometry} * ${ref.process}`;
                }
            }).join('');
            let expr = Expression.fromString(exprString);

            return { state: stateId, rhs: { expr: expRenderer(expr), format: exprFormat }, algebraic: algebraic };
        });

    // all events in single list
    let events = [];

    // actions handler
    let actionHandler = (record, switcherId) => {
        let isConcentration = record.instanceOf('Species') && !record.isAmount; 
        
        let action = {};
        action.rhs = {};
        let scopedAssignment = record.getAssignment(switcherId);
        if (isConcentration) {
            action.state = record.id + '_amt_';
            var expr = scopedAssignment.multiply(record.compartment);
        } else {
            action.state = record.id;
            expr = scopedAssignment;
        }
        action.rhs.expr = expRenderer(expr.substituteByDefinitions());
        action.rhs.format = exprFormat;

        return action;
    };

    // implementing time events (switchers)
    this.selectByInstanceOf('TimeSwitcher')
        .forEach((switcher) => {
            let event = {};
            event.id = switcher.id;
            event.trigger = {};
            event.trigger.type = 'time';
            if (typeof switcher.start === 'string') {
                event.trigger.start = {"expr": switcher.start, "format": exprFormat};
            } else if (switcher.startObj?.num !== undefined) {
                event.trigger.start = switcher.startObj?.num;
            }
            if (typeof switcher.period === 'string') {
                event.trigger.period = {"expr": switcher.period, "format": exprFormat}; 
            } else {
                event.trigger.period = switcher.periodObj?.num;
            }
            if (typeof switcher.stop === 'string') {
                event.trigger.stop = {"expr": switcher.stop, "format": exprFormat}; 
            } else {
                event.trigger.stop = switcher.stopObj?.num;
            }
            // TODO: currently Heta does not support priority
            event.priority = switcher.priority || 0;

            event.actions = this.selectRecordsByContext(switcher.id)
                .filter((record) => !record.isRule)
                .map((record) => actionHandler(record, switcher.id));
            event.active = switcher.active;
            event.title = switcher.title;

            events.push(event);
        });

    // implementing continuous events (switchers)
    this.selectByInstanceOf('CSwitcher')
        .forEach((switcher) => {
            let event = {};
            event.id = switcher.id;
            let triggerRhs = switcher.trigger.substituteByDefinitions();
            event.trigger = {
                type: 'crossing',
                rhs: {expr: expRenderer(triggerRhs), format: exprFormat},
                // direction: 'up', // down
                detection: 'root', // step
                atStart: switcher.atStart
            };
            event.priority = switcher.priority || 0;
            event.actions = this.selectRecordsByContext(switcher.id)
                .filter((record) => !record.isRule)
                .map((record) => actionHandler(record, switcher.id));
            event.active = switcher.active;
            event.title = switcher.title;

            events.push(event);
        });
    this.selectByInstanceOf('DSwitcher')
        .forEach((switcher) => {
            let event = {};
            event.id = switcher.id;
            let triggerRhs = switcher.trigger.substituteByDefinitions();
            event.trigger = {
                type: 'conditional',
                rhs: {expr: expRenderer(triggerRhs), format: exprFormat},
                //kind: 'conditional',
                // direction: 'up',
                detection: 'step',
                atStart: switcher.atStart
            };
            event.priority = switcher.priority || 0;
            event.actions = this.selectRecordsByContext(switcher.id)
                .filter((record) => !record.isRule)
                .map((record) => actionHandler(record, switcher.id));
            event.active = switcher.active;
            event.title = switcher.title;

            events.push(event);
        });
    this.selectByInstanceOf('StopSwitcher')
        .forEach((switcher) => {
            let event = {};
            event.id = switcher.id;
            let triggerRhs = switcher.trigger.substituteByDefinitions();
            event.trigger = {
                type: 'conditional',
                rhs: {expr: expRenderer(triggerRhs), format: exprFormat},
                detection: 'step',
                atStart: true
            };
            event.priority = switcher.priority || 0;
            event.actions = [];
            event.active = switcher.active;
            event.stopSimulation = true;
            event.title = switcher.title;

            events.push(event);
        });

    let observables = this.selectByInstanceOf('Record')
        .filter((x) => x.output)
        .map((x) => {
            return { symbol: x.id };
        });
    
    return {
        id: this.spaceName,
        constants,
        states,
        assignments,
        derivatives,
        events,
        observables
    };
};

// TODO: add simplification maybe
/*
  Function for calculation of initial values for "states" depending on "constants" only.
  1. Find all dependency paths from constants to states
  2. Check for cycles in the dependency graph
  3. Substitute user defined functions
  4. Substitute constants into states and simplify expressions
  5. Return Expression object
*/
function _substitute_and_simplify(expr, namespace) {
    let noUserDefinedFunc = expr.substituteByDefinitions();
    let substitutedNode = _substitute(noUserDefinedFunc.exprParsed, namespace);

    return new Expression(substitutedNode);
}

// takes node return node
function _substitute(topNode, namespace) {
    return topNode.transform((node, path, parent) => {
        if (node.isSymbolNode && path !== 'fn') {
            let componentObj = namespace.get(node.name);
            if (componentObj.instanceOf('Record')) {
                if (!componentObj.isRule) {
                    let initialAssignment = componentObj.assignments['start_'];
                    let num = initialAssignment.num;
                    if (typeof num === 'number') { // for numbers
                        return new math.ConstantNode(num);
                    } else { // for expressions
                        return _substitute(initialAssignment.substituteByDefinitions().exprParsed, namespace);
                    }
                } else {
                    let odeAssignment = componentObj.assignments['ode_'];
                    return _substitute(odeAssignment.substituteByDefinitions().exprParsed, namespace);
                }
            }
        }

        // for the rest just return without changes
        return node;
    });
}

// exprs is an array of pairs [String, Expression]
function _sort_expressions_by_dependency(exprs = []) {
    let graph = new TopoSort();

    exprs.forEach(([id, expr]) => {
        graph.add(id, expr.dependOn());
    });

    // This check is for cycles in the graph
    // Actualy is is already checked in checkCircRecord, but just in case
    // Maybe later we will use only one check here or in checkCircRecord, not both
    try {
        var sortedGraph = graph.sort().reverse(); // independent should be at the beginning
    } catch(err) { // catch cycling
        let infoLine = err.circular
            .map((id) => `  ${id} ~ ${exprs.find(([exprId]) => exprId === id)[1].toString()};`)
            .join('\n');
        let error = new HetaLevelError(`Circular dependency in expressions: \n` + infoLine);
        error.circular = err.circular;
        throw error;
    }

    let sorter = (a, b) => {
        return sortedGraph.indexOf(a[0]) - sortedGraph.indexOf(b[0]);
    };
    
    return exprs.sort(sorter);
}
