const { Namespace } = require('../namespace');
const { Expression, math } = require('../core/expression');
const TopoSort = require('@insysbio/topo-sort');
const HetaLevelError = require('../heta-level-error');

require('./namespace');
/*
    Function converting concrete Namespace to DynMS format.
    Chosen solution:
    - initial values for `states` can be either numbers or expressions depending on parameters only.
    - when converting init expressions for `states` we substitute: 
        - other states by init expressions
        - rules by their expressions
        - parameters stay as they are
    - we create a new states with _amt_ suffix
    - we do not create new parameters
*/
Namespace.prototype.getDynMSModel = function() {
    let { logger } = this.container;

    // generate parameters list
    let parameters = this.selectByClassName('Const')
        .map((x) => {
            return { id: x.id, value: x.num };
        });

    // generate states list: not only dynamic, but also static
    let states = this.selectByInstanceOf('Record')
        .filter((x) => !x.isRule)
        .map((x) => {
            let isConcentration = x.instanceOf('Species') && !x.isAmount;
            let initialAssignment = x.assignments['start_'];
            let num = initialAssignment.num; // use getter from Expression
            let static = !x.isDynamic ? true : undefined;

            if (isConcentration) {
                var stateId = x.id + '_amt_';
                var expr = initialAssignment.clone().multiply(x.compartment);
            } else {
                stateId = x.id;
                expr = initialAssignment.clone();
            }
            
            if (typeof num === 'number' && !isConcentration) {
                return { id: stateId, value: num, static: static };
            } else {
                let substitutedExpr = _substitute_functions(expr, this.container);
                let simpleExpr = _substitute_and_simplify(substitutedExpr, this);

                return { id: stateId, value: {expr: simpleExpr.toString(), format: 'heta'}, static: static };
            }
        });

    // generate assignments list
    let unsortedAssignments = this.selectByInstanceOf('Record')
        .filter((x) => x.isRule || (x.instanceOf('Species') && !x.isAmount))
        .map((x) => {
            if (x.isRule) {
                let rawExpr = x.assignments['ode_'].clone();
                var expr = _substitute_functions(rawExpr, this.container);
            } else {
                expr = Expression.fromString(`${x.id}_amt_ / ${x.compartment}`);
            }

            return [x.id, expr];
        });
    let sortedAssignments = _sort_expressions_by_dependency(unsortedAssignments);
    let assignments = sortedAssignments.map(([id, expr]) => {
        return { variable: id, rhs: { expr: expr.toString(), format: 'heta' } };
    });

    let derivatives = this.selectByInstanceOf('Record')
        .filter((x) => x.isDynamic)
        .map((x) => {
            let isConcentration = x.instanceOf('Species') && !x.isAmount;
            let stateId = isConcentration ? x.id + '_amt_' : x.id;

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

            return { variable: stateId, rhs: { expr: expr.toString(), format: 'heta' } };
        });
    
    return {
        id: this.spaceName,
        parameters,
        states,
        assignments,
        derivatives,
        events: [],
        observables: []
    };
};

// XXX: just a placeholder for now
/*
  Function for calculation of initial values for "states" depending on "parameters" only.
  1. Find all dependency paths from parameters to states
  2. Check for cycles in the dependency graph
  3. Substitute parameters into states and simplify expressions
  4. Return Expression object
*/
function _substitute_and_simplify(expr, namespace) {
    let node = _substitute(expr.exprParsed, namespace);

    return new Expression(node);
}

// takes node return node
function _substitute(topNode, namespace) {
    return topNode.transform((node, path, parent) => {
        if (node.isSymbolNode) {
            let componentObj = namespace.get(node.name);
            if (componentObj.instanceOf('Record')) {
                if (!componentObj.isRule) {
                    let initialAssignment = componentObj.assignments['start_'];
                    let num = initialAssignment.num;
                    if (typeof num === 'number') { // for numbers
                        return new math.ConstantNode(num);
                    } else { // for expressions
                        return _substitute(initialAssignment.exprParsed, namespace);
                    }
                } else {
                    let odeAssignment = componentObj.assignments['ode_'];
                    return _substitute(odeAssignment.exprParsed, namespace);
                }
            }
        }
        // for the rest
        return node;
    });
}

// XXX: just a placeholder for now
/*
  Function for substitution of function definitions
*/
function _substitute_functions(expr, container) {
    return expr;
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
