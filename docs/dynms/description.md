# DynMS description

## 0. Introduction

DynMS (Dynamic Model Specification) is a lightweight portable intermediate representation (IR) for dynamical simulation models.

The main goals of DynMS are:
- provide a solver-independent executable model representation;
- simplify backend generation and model conversion;
- support deterministic simulation semantics;
- simplify testing and validation across simulation platforms.

The shema for DynMS is available at: https://raw.githubusercontent.com/hetalang/heta-compiler/v0.12.0/src/dynms/dynms.schema.json

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

Top level required fields:
- `dynms`: DynMS version, currently must be `"0.2.0"`;
- `models`: non-empty array of model definitions.

The top level optional meta info can include:
- `$schema`: JSON Schema URL for validation;
- `generator.name`: name of the software that generated the document;
- `generator.version`: version of the software that generated the document;
- `created`: ISO 8601 timestamp of document creation;
- `platformId`: optional identifier for the target simulation platform;
- `platformVersion`: optional version of the target simulation platform;
- `platformNotes`: optional platform-specific notes;
- `license`: optional license information.

If `generator` is present, both `generator.name` and `generator.version` are required.

## 2. DynMS Model Structure

A DynMS document contains one or more models as an array.

```json
{
  "dynms": "0.2.0",
  "models": [
    {
      "id": "model1",
      "constants": [...],
      "dynamic": [...],
      "static": [...],
      "assignments": [...],
      "timeEvents": [...],
      "events": [...],
      "observables": [...]
    }
  ]
}
```

Each model object must include `id`, `constants`, `dynamic`, `static`, `assignments`, `timeEvents`, `events`, and `observables`. These component arrays may be empty unless additional semantic validation rules require otherwise.

---

## 3. Core Concepts

### 3.1 Constants

Constants are externally configurable scalar values, model inputs.

```json
{
  "id": "kabs",
  "value": 0.01
}
```

Constants are initialized by a number or an expression and do not change during simulation unless modified by backend-specific mechanisms.

---

### 3.2 States

States represent variables that store values during simulation. DynMS separates states into two collections: `dynamic` and `static`.

Dynamic states are integrated by the solver so the corresponding `derivative` must be defined in the same object.
Set optional `algebraic` to `true` when the derivative expression is an algebraic
equation for a steady-state variable rather than an ODE. This is a subset of a
DAE problem and requires backend support.

```json
{
  "id": "x1",
  "initial": 0,
  "derivative": {
    "expr": "-k * x1",
    "format": "heta"
  }
}
```

Static states are stored in `static` and can be modified by events only. Static states do not define derivatives.

```json
{
  "id": "volume",
  "initial": 5.0
}
```

Some backends may not support `static` states. It is the responsibility of the model converter to check backend capabilities and convert static states if necessary.

`initial` value can be a number or an expression. If it is an expression, it is evaluated at simulation start and may depend on `constants` and numeric literals only! It cannot depend on other states or assignments.

```json
{
  "id": "x1",
  "initial": {
    "expr": "kabs * 100",
    "format": "heta"
  }
}
```

---

### 3.3 Assignments

Assignments define algebraic expressions (rules) evaluated:
- during simulation (each step);
- before and after events if required by the backend.

```json
{
  "id": "rate",
  "rhs": {
    "expr": "k * x",
    "format": "heta"
  }
}
```

Assignments are not states and do not store values.

Assignments values are available globally during simulation and can be used in other expressions, like: dynamic state derivatives, events, or other assignments. But not in initial values of states.

DynMS require that assignments must be pre-ordered in a way that allows correct evaluation (no circular dependencies). It must be done at DynMS generation, not at runtime.

Assignments are evaluated before dynamic state derivatives.

---

### 3.4 Derivatives

Derivatives define ordinary differential equations for dynamic states. The derivative expression is stored in `dynamic[].derivative`.

```json
{
  "id": "x",
  "initial": 1,
  "derivative": {
    "expr": "-k * x",
    "format": "heta"
  }
}
```

Each dynamic state must have exactly one derivative. When `algebraic` is `true`,
the derivative expression defines an equation equal to zero instead of an ODE.
Top-level `derivatives` are not used in DynMS `0.2.0`.

```json
{
  "id": "x",
  "initial": 1,
  "derivative": {
    "expr": "-k1 * x + k2 * y",
    "format": "heta"
  },
  "algebraic": true
}
```

---

### 3.5 Events

Events modify model states during simulation.

Time-triggered events are stored in `timeEvents`. Events with `crossing` or `conditional` triggers are stored in `events`.

```json
{
  "id": "event1",
  "trigger": {
    "type": "time",
    "start": 0
  },
  "actions": [],
  "priority": 0,
  "active": true,
  "stopSimulation": false
}
```

- `id` is the event identifier;
- `trigger` defines event activation conditions;
- `actions` is an array of state modifications executed when the event is triggered;
- `priority` determines the execution order of events with the same trigger conditions;
- `active` indicates whether the event is currently active. Inactive events are ignored during simulation.
- `stopSimulation` indicates whether the simulation must stop after the event is triggered. The default value is `false`.

---

### 3.6 Observables

Observables define exported model outputs. 

> Currently the `observables` are just references to states or assignments, but in the future they may support new expressions, etc.

```json
{
  "symbol": "x"
}
```

Observables do not affect simulation.

---

## 4. Expressions

### 4.1 Expression Structure

Expressions are represented mathematical formulas used in `assignments`, dynamic state `derivative`, `events`, and state initialization.

```json
{
  "expr": "x + y",
  "format": "heta"
}
```

- `expr` is the expression represented as a string, number or array depending on the format;
- `format` specifies the expression format and syntax.

Supported formats:
- `heta`
- `c`
- `mrgsolve`
- `julia`
- `math-json`

### 4.2 MathJSON format

MathJSON is an open format for representing mathematical expressions in JSON. It is designed to be unambiguous and easily parsed by software.

It is the default and recommended expression format in DynMS, preferred for maximum interoperability and precision.

> In future versions of DynMS, support for other expression formats may be deprecated in favor of MathJSON.

See the original MathJSON standard here: https://cortexjs.io/math-json/

---

#### 4.2.1 DynMS MathJSON schema

DynMS uses its **own JSON Schema profile** of MathJSON, not the upstream library schema. The DynMS schema is available at:

https://raw.githubusercontent.com/hetalang/heta-compiler/v0.12.0/src/dynms/dynms.schema.json

The DynMS MathJSON profile follows the same conceptual model as the original standard but is independently maintained and may diverge over time to better serve simulation use cases.

---

#### 4.2.2 Permitted node forms

A MathJSON node (`mathJsonNode`) in DynMS may be any of the following:

| Form | Example | Description |
|---|---|---|
| JSON number | `1`, `3.14` | Numeric literal |
| JSON string | `"x"`, `"Pi"` | Symbol or named constant |
| Array | `["Add", "x", 1]` | Function application: `[operator, arg1, arg2, ...]` |
| `{"num": "..."}` | `{"num": "NaN"}` | Extended numeric literal (e.g. `NaN`, `+Infinity`, `-Infinity`) |
| `{"sym": "..."}` | `{"sym": "x"}` | Symbol object form |
| `{"str": "..."}` | `{"str": "hello"}` | String literal object |
| `{"fn": [...]}` | `{"fn": ["Add", "x", 1]}` | Function object form |

All node types can be used recursively: arguments of an array or `fn` node are themselves `mathJsonNode` values.

Examples of equivalent representations for $x + 1$:

```json
["Add", "x", 1]
```

```json
{"fn": ["Add", {"sym": "x"}, {"num": "1"}]}
```

Both are valid according to the DynMS schema.

---

#### 4.2.3 Canonical form

Although the DynMS schema accepts all node forms above, **heta-compiler always outputs expressions in canonical form**:

- functions and operators are represented as arrays: `["Add", ...]`, `["Multiply", ...]`
- plain numeric literals are JSON numbers: `1`, `3.14`
- symbols are plain JSON strings: `"x"`, `"Pi"`
- only extended numerics (`NaN`, `+Infinity`, `-Infinity`) use the `{"num": "..."}` object form

This means the canonical form avoids `{"sym": ...}`, `{"str": ...}`, and `{"fn": ...}` object forms entirely, except for special numeric values.

Canonical form example:

```json
{
  "expr": ["Add", "x", 1],
  "format": "math-json"
}
```

The canonical form is simpler to read and process. Consumers of DynMS files generated by heta-compiler can rely on it exclusively.

> Consumers that need to support externally authored DynMS files should accept all permitted forms per the schema.

---

#### 4.2.4 Special values

Extended numeric literals use `{"num": "..."}` for values that cannot be represented as JSON numbers:

| Value | Representation |
|---|---|
| Not a number | `{"num": "NaN"}` |
| Positive infinity | `{"num": "+Infinity"}` |
| Negative infinity | `{"num": "-Infinity"}` |

---

#### 4.2.5 Associative flattening

For associative operators (`Add`, `Multiply`, `And`, `Or`, `Xor`), heta-compiler flattens nested calls into a single array:

| Heta expression | MathJSON output |
|---|---|
| `a + b + c` | `["Add", "a", "b", "c"]` |
| `a * b * c` | `["Multiply", "a", "b", "c"]` |

This avoids unnecessary nesting such as `["Add", "a", ["Add", "b", "c"]]`.

---

#### 4.2.6 Supported MathJSON functions

DynMS supports the following MathJSON function and operator names. In array form, the first item must be one of these names.

Arithmetic:
- `Add`
- `Divide`
- `Multiply`
- `Negate`
- `Power`
- `Root`
- `Square`

Elementary functions:
- `Abs`
- `Ceil`
- `Exp`
- `Factorial`
- `Floor`
- `Lb`
- `Lg`
- `Ln`
- `Log`
- `Max`
- `Min`
- `Sign`
- `Sqrt`

Trigonometric functions:
- `Arccos`
- `Arccot`
- `Arccsc`
- `Arcsec`
- `Arcsin`
- `Arctan`
- `Cos`
- `Cot`
- `Csc`
- `Sec`
- `Sin`
- `Tan`

Comparison and logic:
- `And`
- `Equal`
- `Greater`
- `GreaterEqual`
- `Less`
- `LessEqual`
- `Not`
- `NotEqual`
- `Or`
- `Xor`

Conditional expressions:
- `If`
- `Which`

Named constants and boolean literals such as `Pi`, `ExponentialE`, `True`, and `False` are represented as symbols, not function calls.

---

## 5. Simulation Semantics

### 5.1 Initialization

Before simulation starts:

1. All `constants` are initialized with their specified values or with external inputs;
2. All `dynamic` and `static` states are initialized with their specified initial values or by expression depending on `constants`;
3. All expressions inside `trigger` fields like: `start`, `stop`, `period` are evaluated at this step.
4. The backend can update `active` field in any of `timeEvents` or `events` externally.

---

### 5.2 Zero events

Before running integration we should check if any events are active at simulation start.
- If `atStart` is `true` for the `conditional` or `crossing` trigger, and the trigger condition is satisfied at simulation start, the event is activated immediately.
- If `start` time trigger is corresponding to the simulation start time, the event is activated immediately.

It may require evaluating `assignments` before checking event conditions.

---

### 5.3 Runtime Evaluation Order

At each solver step:
1. assignments are evaluated;
2. dynamic state derivatives are evaluated;
3. events may be processed depending on backend semantics.

---

### 5.4 Static States

Static states:
- are not integrated by the solver;
- may still change through events;
- remain globally accessible during simulation.

---

### 5.5 Time Variable

Time variable `t` is available globally during simulation and can be used in any expression.

> In future versions of DynMS, maybe required to declare time variable explicitly or use special semantic in MathJSON expressions.

---

## 6. Events

DynMS `0.2.0` keeps time-triggered events in `timeEvents` and non-time events in `events`.

### 6.1 Time Triggers

Time triggers activate events at specified times.

```json
{
  "type": "time",
  "start": 12,
  "period": 24,
  "stop": 100
}
```

`start`, `period`, and `stop` can be numbers or expressions evaluated at simulation start.

```json
{
  "type": "time",
  "start": {"expr": "start1", "format": "heta"},
  "period": {"expr": "period1", "format": "heta"},
  "stop": {"expr": "stop1", "format": "heta"}
}
```

Interpretation notes:
- `start` is required.
- `period` is optional. If omitted, the trigger is treated as one-shot and activates only at `start`.
- `period` should be positive. For compatibility, `period <= 0` should be interpreted the same as omitted `period` (one-shot at `start`).
- `stop` is optional and is mainly used for periodic triggers. For `period > 0`, event times are: `start + k * period`, where `k = 0, 1, 2, ...`, while `time <= stop`.
- `stop` is inclusive: if `start + k * period == stop`, the event is activated at this final time.
- If `period` is omitted or less than or equal to `0`, `stop` does not add extra activations and can be ignored by backends.

---

### 6.2 Crossing Triggers

Crossing triggers activate when an expression crosses zero.

```json
{
  "type": "crossing",
  "rhs": {
    "expr": "x - 10",
    "format": "heta"
  },
  "atStart": true,
  "detection": "root"
}
```

Triggers activates in a direction from negative to positive values.

When `atStart` is `true`, non-negative trigger values are treated as active at simulation start.

When `detection` is `root`, the backend should use root-finding algorithms to determine the exact time of crossing. 

If `detection` is `step`, the backend should evaluate the trigger condition only at discrete simulation steps, which may lead to timing inaccuracies. This mode is deprecated but can be used for backends without root-finding support.

---

### 6.3 Conditional Triggers

Conditional triggers activate when a logical expression becomes `true`.

It is similar to crossing trigger but the condition is based on logical expressions instead of crossing zero.

```json
{
  "type": "conditional",
  "rhs": {
    "expr": "x > 10",
    "format": "heta"
  },
  "atStart": true,
  "detection": "step"
}
```

The `detection` field for conditional triggers can be `step` or `root` as well for compatibility. But `root` detection for conditional triggers is not clearly defined. Maybe in future versions of DynMS, `root` detection for conditional triggers will be deprecated.

---

### 6.6 Event Actions

Event actions are executed in an "all-at-once" manner, meaning that all state modifications defined in the event's `actions` are applied simultaneously at the time of event activation.

Before executing event actions, all expressions in the `rhs` of the actions are evaluated based on the state of the model at the moment of event activation. This ensures that the order of actions does not affect the final outcome, as all modifications are applied together after evaluation.

If `stopSimulation` is `true`, the simulation stops after the event is triggered and its actions are applied. This can be used to terminate simulation when unrealistic or out-of-range conditions are reached.

Example:

```json
{
  "state": "x",
  "rhs": {
    "expr": "x + 10",
    "format": "heta"
  }
}
```

Event execution semantics may vary slightly between backends.

---

## 7. Identifiers inside models

DynMS uses string identifiers for all model components (states, constants, assignments, events).

The identifier is a string starting with a letter (not an underscore), followed by letters, digits, or underscores. It must be unique within the model.

The first character must be a letter (a-z, A-Z) for compatibility with various programming languages.

---

## 8. Validation Rules

DynMS schema defines the structure and basic types of the document, but it does not enforce all the semantic rules required for a valid model.

DynMS implementations should validate:
- identifier uniqueness;
- valid references;
- dynamic state derivative consistency;
- trigger compatibility;
- expression validity.

For the specific converter or backend, additional validation rules may apply, such as:
- supporting an expression format;
- supporting specific trigger types;
- supporting specific event, like `root` detection for crossing triggers;
- supporting initial state expressions;
- supporting algebraic equations;
- etc.
