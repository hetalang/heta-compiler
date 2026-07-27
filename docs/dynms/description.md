# DynMS description

## 0. Introduction

DynMS (Dynamic Model Specification) is a lightweight portable intermediate representation (IR) for dynamical simulation models.

The main goals of DynMS are:

- provide a solver-independent executable model representation;
- simplify backend generation and model conversion;
- support deterministic simulation semantics;
- simplify testing and validation across simulation platforms.

The schema for DynMS is available at: https://raw.githubusercontent.com/hetalang/heta-compiler/v0.12.1/src/dynms/dynms.schema.json

---

## 1. DynMS Document Structure

Minimal valid DynMS structure:

```json
{
  "dynms": "0.2.0",
  "models": [
    {
      "id": "model1",
      "constants": [],
      "dynamic": [],
      "static": [],
      "assignments": [],
      "timeEvents": [],
      "events": [],
      "observables": []
    }
  ]
}
```

Top-level required fields:

- `dynms`: DynMS version; currently must be `"0.2.0"`;
- `models`: non-empty array of model definitions.

The optional top-level metadata fields are `$schema`, `generator`, `created`, `platformId`, `platformVersion`, `platformNotes`, and `license`. If `generator` is present, it must contain both `name` and `version`.

---

## 2. DynMS Model Structure

A DynMS document contains one or more models. Each model must include `id`, `constants`, `dynamic`, `static`, `assignments`, `timeEvents`, `events`, and `observables`. These component arrays may be empty unless additional semantic validation rules require otherwise.

The following sections describe one model-object type at a time.

---

## 3. Model Objects

### 3.1 Constants

`constants` contains externally configurable scalar values, such as model inputs. A constant is initialized by a JSON number and does not change during simulation unless a backend-specific mechanism changes it.

```json
{
  "id": "kabs",
  "value": 0.01
}
```

---

### 3.2 Dynamic states

`dynamic` contains states integrated by the solver. Every dynamic state has an `id`, an `initial` value, and exactly one `derivative` expression.

```json
{
  "id": "x1",
  "initial": 0,
  "derivative": {
    "expr": ["Negate", ["Multiply", "k", "x1"]],
    "format": "math-json"
  }
}
```

The `derivative` defines the ordinary differential equation for the state. Set optional `algebraic` to `true` when this expression is an equation equal to zero for a steady-state variable rather than an ODE. This is a subset of a DAE problem and requires backend support.

```json
{
  "id": "x",
  "initial": 1,
  "derivative": {
    "expr": ["Add", ["Negate", ["Multiply", "k1", "x"]], ["Multiply", "k2", "y"]],
    "format": "math-json"
  },
  "algebraic": true
}
```

---

### 3.3 Static states

`static` contains states that are stored during simulation but are not integrated by the solver. They do not define derivatives and may be modified only by events.

```json
{
  "id": "volume",
  "initial": 5.0
}
```

Some backends may not support static states. The model converter is responsible for checking backend capabilities and converting them when necessary.

For both dynamic and static states, `initial` may be a number or an expression. An initial expression is evaluated at simulation start; it may depend only on constants and numeric literals, not on states or assignments.

```json
{
  "id": "x1",
  "initial": {
    "expr": ["Multiply", "kabs", 100],
    "format": "math-json"
  }
}
```

---

### 3.4 Assignments

`assignments` contains algebraic expressions (rules) evaluated during simulation, and before or after events when required by the backend. Assignments are not states and do not store values.

```json
{
  "id": "rate",
  "rhs": {
    "expr": ["Multiply", "k", "x"],
    "format": "math-json"
  }
}
```

Assignment values are globally available during simulation and may be used in derivatives, events, and other assignments, but not in state initial values. They must be pre-ordered by the DynMS generator to permit correct evaluation without circular dependencies. Assignments are evaluated before dynamic-state derivatives.

---

### 3.5 Time events

`timeEvents` contains events activated by a time trigger. Each object has an `id`, a `trigger`, and an `actions` array. Optional `priority`, `active`, and `stopSimulation` fields default to `0`, `true`, and `false`, respectively.

```json
{
  "id": "dose",
  "trigger": {
    "type": "time",
    "start": 12,
    "period": 24,
    "stop": 100
  },
  "actions": [
    {
      "state": "x",
      "rhs": {
        "expr": ["Add", "x", 10],
        "format": "math-json"
      }
    }
  ]
}
```

`start`, `period`, and `stop` may be numbers or expressions evaluated at simulation start. A time-trigger expression may reference constants only; it must not reference states, assignments, or the time variable `t`.

```json
{
  "type": "time",
  "start": {
    "expr": "start1",
    "format": "math-json"
  },
  "period": {
    "expr": "period1",
    "format": "math-json"
  },
  "stop": {
    "expr": "stop1",
    "format": "math-json"
  }
}
```

- `start` is required.
- `period` is optional. If omitted, the trigger is one-shot and activates only at `start`.
- A non-positive `period` is interpreted as omitted for compatibility.
- For `period > 0`, activation times are `start + k * period`, where `k = 0, 1, 2, ...`, while `time <= stop`.
- `stop` is inclusive. If an activation time equals `stop`, that activation occurs.
- For one-shot triggers, `stop` does not add activations and may be ignored by backends.

---

### 3.6 State events

`events` contains non-time events. Their triggers are either `crossing` or `conditional`; all other object fields have the same meaning as in `timeEvents`.

A crossing trigger activates when its `rhs` crosses zero in the negative-to-positive direction.

```json
{
  "id": "threshold",
  "trigger": {
    "type": "crossing",
    "rhs": {
      "expr": ["Add", "x", -10],
      "format": "math-json"
    },
    "atStart": true,
    "detection": "root"
  },
  "actions": []
}
```

When `atStart` is `true`, a non-negative crossing value is active at simulation start. With `detection: "root"`, the backend should use root finding to determine the crossing time. With `detection: "step"`, the condition is evaluated only at discrete simulation steps; this deprecated mode may be used by backends without root-finding support.

A conditional trigger activates when its logical `rhs` becomes `true`.

```json
{
  "id": "stopAtLimit",
  "trigger": {
    "type": "conditional",
    "rhs": {
      "expr": ["Greater", "x", 10],
      "format": "math-json"
    },
    "atStart": true,
    "detection": "step"
  },
  "actions": [],
  "stopSimulation": true
}
```

The `detection` field for conditional triggers may be `step` or `root` for compatibility, but root detection for logical expressions is not precisely defined and may be deprecated in a future DynMS version.

All event actions are applied all at once. The backend first evaluates every action `rhs` against the state at activation time, then applies all resulting state modifications simultaneously. If `stopSimulation` is `true`, the simulation stops after the actions are applied. Event execution details may vary slightly between backends.

---

### 3.7 Observables

`observables` contains exported model outputs. Currently each observable is a reference to a state or assignment.

```json
{
  "symbol": "x"
}
```

Observables do not affect simulation.

---

## 4. Expressions

### 4.1 Expression structure

Expressions are mathematical formulas. They may occur at the following JSON paths:

- `dynamic[].initial`: may reference constants only;
- `dynamic[].derivative`;
- `static[].initial`: may reference constants only;
- `assignments[].rhs`: dependencies must be ordered and non-circular;
- `timeEvents[].trigger.start`: may reference constants only;
- `timeEvents[].trigger.period`: may reference constants only;
- `timeEvents[].trigger.stop`: may reference constants only;
- `timeEvents[].actions[].rhs`;
- `events[].trigger.rhs`;
- `events[].actions[].rhs`;

The canonical DynMS representation is a MathJSON expression object:

```json
{
  "expr": ["Add", "x", "y"],
  "format": "math-json"
}
```

### 4.2 Canonical MathJSON form

MathJSON is the recommended DynMS expression format. See the [MathJSON standard](https://cortexjs.io/math-json/). heta-compiler always outputs its canonical form:

- functions and operators are arrays, such as `["Add", ...]` and `["Multiply", ...]`;
- numeric literals are JSON numbers;
- symbols are JSON strings;
- only extended numeric values use the `{"num": "..."}` form.

The schema also accepts non-canonical MathJSON node forms, including `sym`, `str`, and `fn` objects, for compatibility with externally authored documents. Producers should emit the canonical form, and consumers of files generated by heta-compiler may rely on it exclusively.

Extended numeric values that JSON cannot represent use a `num` object:

| Value | Canonical representation |
|---|---|
| Not a number | `{"num": "NaN"}` |
| Positive infinity | `{"num": "+Infinity"}` |
| Negative infinity | `{"num": "-Infinity"}` |

For associative operators (`Add`, `Multiply`, `And`, `Or`, and `Xor`), heta-compiler flattens nested calls. For example, `a + b + c` is represented as `["Add", "a", "b", "c"]`, rather than nested `Add` arrays.

The permitted MathJSON function and operator names are:

- arithmetic: `Add`, `Divide`, `Multiply`, `Negate`, `Power`, `Root`, `Square`;
- elementary functions: `Abs`, `Ceil`, `Exp`, `Factorial`, `Floor`, `Lb`, `Lg`, `Ln`, `Log`, `Max`, `Min`, `Sign`, `Sqrt`;
- trigonometric functions: `Arccos`, `Arccot`, `Arccsc`, `Arcsec`, `Arcsin`, `Arctan`, `Cos`, `Cot`, `Csc`, `Sec`, `Sin`, `Tan`;
- comparison and logic: `And`, `Equal`, `Greater`, `GreaterEqual`, `Less`, `LessEqual`, `Not`, `NotEqual`, `Or`, `Xor`;
- conditional expressions: `If`, `Which`.

Named constants and Boolean values, such as `Pi`, `ExponentialE`, `True`, and `False`, are represented as symbols rather than function calls.

### 4.3 Other expression formats

The schema also permits line-expression formats `heta`, `c`, `mrgsolve`, and `julia`. They exist for compatibility with particular tools and backends, but are not recommended. New DynMS documents should use canonical MathJSON with `"format": "math-json"`.

---

## 5. Simulation Semantics

### 5.1 Initialization

Before simulation starts:

1. All constants are initialized with their specified values or external inputs.
2. All dynamic and static states are initialized with their specified values or expressions depending on constants.
3. Expressions in time-trigger fields (`start`, `stop`, and `period`) are evaluated.
4. The backend may externally update `active` for any time event or state event.

### 5.2 Zero events

Before integration, active events at simulation start must be checked:

- If `atStart` is `true` for a crossing or conditional trigger and its condition is satisfied, the event activates immediately.
- If a time-event `start` equals the simulation start time, that event activates immediately.

This may require evaluating assignments before checking event conditions.

### 5.3 Runtime evaluation order

At each solver step:

1. assignments are evaluated;
2. dynamic-state derivatives are evaluated;
3. events may be processed, according to backend semantics.

### 5.4 Time variable

The time variable `t` is available globally during simulation. It may be used in derivatives, assignments, state-event triggers, and event actions; it must not be used in state initial values or time-trigger fields.

---

## 6. Identifiers inside models

DynMS uses string identifiers for all model components. An identifier must start with a letter and then contain only letters, digits, or underscores. It must be unique within a model.

---

## 7. Validation Rules

The DynMS schema validates the document structure and basic types. Implementations must also perform the semantic validation described below.

### 7.1 Schema compliance

A DynMS document must validate against `dynms.schema.json` for the declared DynMS version. This includes required fields, JSON value types, permitted expression formats, MathJSON node structure and function names, trigger shape, and event-action shape.

Schema validation does not validate relationships between objects in a model. The following rules provide that validation.

### 7.2 Identifier uniqueness

Identifiers must be unique within a model. The same `id` must not occur in more than one object in any of these collections:

- `constants`;
- `dynamic`;
- `static`;
- `assignments`;
- `timeEvents`;
- `events`.

In particular, time-event and state-event identifiers share the same identifier namespace with states, constants, and assignments. `observables` have no `id` field and are not part of this check.

### 7.3 Reference validity

Every reference must resolve within the same model and point to an object type allowed by its context.

- Symbols in expressions must resolve to a constant, state, assignment, or the special time symbol `t`, unless a more restrictive rule below applies.
- `timeEvents[].actions[].state` and `events[].actions[].state` must reference an existing dynamic or static state.
- `observables[].symbol` must reference an existing dynamic state, static state, or assignment. Constants and events cannot be observables in DynMS 0.2.0.

### 7.4 Dynamic states and derivatives

Each dynamic state must have exactly one `derivative` expression. It defines an ODE unless `algebraic` is `true`, in which case it defines an equation equal to zero for an algebraic state. A dynamic-state identifier cannot also identify a static state or any other object in the model.

### 7.5 State initialization

`dynamic[].initial` and `static[].initial` must be numbers or valid expressions that can be evaluated before simulation starts. An initial-value expression may reference constants only. It must not reference states, assignments, or the time symbol `t`.

### 7.6 Assignments

Assignments must have no circular dependencies. They must be ordered so that every assignment can be evaluated after the assignments on which it depends. This order is established when generating DynMS, rather than at simulation runtime.

### 7.7 Time events

Every object in `timeEvents` must use a trigger with `type: "time"`. The `start`, `period`, and `stop` values may be numbers or expressions evaluated at simulation start. An expression in any of these fields may reference constants only; it must not reference states, assignments, or `t`.

For periodic triggers, a computed `period` should be positive. A non-positive value retains the compatibility behavior defined in section 3.5 and is treated as a one-shot trigger.

### 7.8 State events and triggers

Every object in `events` must use a `crossing` or `conditional` trigger. Its `rhs` must be a valid expression. The `detection` value must be supported by the trigger type and the target backend. `root` detection for conditional triggers is allowed for compatibility, but its semantics are not precisely defined.

### 7.9 Event actions

Each event action must target an existing dynamic or static state, and its `rhs` must be a valid expression. A state must not occur more than once in the `actions` array of the same event; otherwise the all-at-once event semantics would be ambiguous.

### 7.10 Observables

Each `observables[].symbol` must reference an existing dynamic state, static state, or assignment. Observables are references only and do not define new expressions or affect simulation.

### 7.11 Expression validity

Each expression must be valid in its declared format and use only symbols permitted by its context. For MathJSON, this includes valid node forms and supported function names. Documents generated by heta-compiler use canonical MathJSON with `"format": "math-json"`.

Specific converters and backends may impose additional requirements, for example support for algebraic equations, a particular trigger-detection mode, or a particular expression format.
