# Diagnostic code structure

This draft organizes diagnostic codes into sections and subsections. A code may appear in more than one subsection when it is relevant to different stages of compilation. An asterisk (\*) marks codes included in more than one subsection.

The `opt` fields list the maximum known context at creation or logging, including context added by handlers. Apart from `diagnosticCode`, fields may be absent or undefined, and not all fields necessarily occur in the same event.

## 1. Initial file reading

> Reserved for diagnostics related to reading the initial files. This section is currently empty.

## 2. Platform initialization

### Platform declaration structure and properties

- `PLATFORM_DECLARATION_INVALID_PROPERTY_TYPE` - A value in the platform declaration has a different type than required by the schema.
  - `opt`: `diagnosticCode`, `path`, `keyword`, `params`.
  - Files:
    - [src/builder/index.js](../src/builder/index.js)

- `PLATFORM_DECLARATION_INVALID_VALUE` - A platform declaration property has an invalid value.
  - `opt`: `diagnosticCode`, `path`, `keyword`, `params`.
  - Files:
    - [src/builder/index.js](../src/builder/index.js)

- `PLATFORM_DECLARATION_MISSING_PROPERTY` - A required platform declaration property is missing.
  - `opt`: `diagnosticCode`, `path`, `keyword`, `params`.
  - Files:
    - [src/builder/index.js](../src/builder/index.js)

- `PLATFORM_DECLARATION_UNKNOWN_PROPERTY` - A platform declaration contains an unknown property.
  - `opt`: `diagnosticCode`, `path`, `keyword`, `params`.
  - Files:
    - [src/builder/index.js](../src/builder/index.js)

### Compiler version requirements

- `INCOMPATIBLE_COMPILER_VERSION` - The running compiler version does not satisfy the platform requirement.
  - `opt`: `diagnosticCode`, `range`, `version`
  - Files:
    - [src/builder/index.js](../src/builder/index.js)

- `INVALID_COMPILER_VERSION_REQUIREMENT` - The platform compiler-version requirement is not a valid version range.
  - `opt`: `diagnosticCode`, `range`
  - Files:
    - [src/builder/index.js](../src/builder/index.js)


### Export configuration

- `ABSOLUTE_EXPORT_PATH` The export file path is absolute instead of relative.
  - `opt`: `diagnosticCode`, `filepath`, `itemIndex`
  - Files:
    - [src/builder/index.js](../src/builder/index.js)

- `EXPORT_NO_MATCHING_NAMESPACES` - No namespaces match the export selection.
  - `opt`: `diagnosticCode`, `format`, `filter`
  - Files:
    - [src/abstract-export/index.js](../src/abstract-export/index.js)

- `INVALID_EXPORT_CONFIGURATION` - One or more export configuration properties are invalid.
  - `opt`: `diagnosticCode`, `errors`, `action`, `path`, `format`.
  - Files:
    - [src/abstract-export/index.js](../src/abstract-export/index.js)
    - [src/container/actions.js](../src/container/actions.js)

- `UNKNOWN_EXPORT_FORMAT` - The requested export format is unknown.
  - `opt`: `diagnosticCode`, `format`, `itemIndex`, `action`, `path`.
  - Files:
    - [src/builder/index.js](../src/builder/index.js)
    - [src/container/actions.js](../src/container/actions.js)

- `SBML_UNSUPPORTED_VERSION` - The requested SBML export version is unsupported.
  - `opt`: `diagnosticCode`, `format`, `version`.
  - Files:
    - [src/sbml-export/index.js](../src/sbml-export/index.js)

## 3. Module loading and parsing

### Module paths and availability

- `INVALID_MODULE_SOURCE` - An include source is missing, empty, or not a string.
  - `opt`: `diagnosticCode`, `filename`, `source`.
  - Files:
    - [src/module-system/index.js](../src/module-system/index.js)

- `ABSOLUTE_MODULE_PATH` - An included module path is absolute instead of relative.
  - `opt`: `diagnosticCode`, `source`, `target`
  - Files:
    - [src/module-system/index.js](../src/module-system/index.js)
    - [src/builder/index.js](../src/builder/index.js)

- `UNAVAILABLE_MODULE` - A referenced module file is unavailable.
  - `opt`: `diagnosticCode`, `filename`, `systemCode`.
  - Files:
    - [src/module-system/index.js](../src/module-system/index.js)

### Module types and syntax

- `MODULE_PROCESSING_ERROR` - Module processing failed; the cause may be in the module or the application.
  - `opt`: `diagnosticCode`, `filename`, `stack`.
  - Files:
    - [src/module-system/index.js](../src/module-system/index.js)

- `MODULE_SYNTAX_ERROR` - A Heta, JSON, YAML, or SBML XML module has invalid syntax.
  - `opt`: `diagnosticCode`, `filename`, `coordinate` (JSON), `location` (Heta or YAML, when available).
  - Files:
    - [src/module-system/heta-module.js](../src/module-system/heta-module.js)
    - [src/module-system/json-module.js](../src/module-system/json-module.js)
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)
    - [src/module-system/yaml-module.js](../src/module-system/yaml-module.js)

- `UNSUPPORTED_MODULE_TYPE` - The requested module type is unsupported.
  - `opt`: `diagnosticCode`, `filename`, `type`.
  - Files:
    - [src/module-system/index.js](../src/module-system/index.js)

### Module includes and dependencies

- `CIRCULAR_MODULE_INCLUDES` - Module includes contain a circular dependency.
  - `opt`: `diagnosticCode`, `circular`
  - Files:
    - [src/module-system/index.js](../src/module-system/index.js)

### Table modules

- `TABLE_CONFLICTING_OPTIONS` - The same table sheet is included with conflicting reading options.
  - `opt`: `diagnosticCode`, `filename`, `sheet`, `previousOptions`, `options`.
  - Files:
    - [src/module-system/index.js](../src/module-system/index.js)

- `TABLE_INVALID_HEADER` - A table header is not a valid property path.
  - `opt`: `diagnosticCode`, `filename`, `header`, `part`, `sheet`.
  - Files:
    - [src/module-system/table-module.js](../src/module-system/table-module.js)

- `TABLE_INVALID_OMIT_ROWS_OPTION` - The table omitRows option is not a non-negative integer.
  - `opt`: `diagnosticCode`, `filename`, `path`, `value`.
  - Files:
    - [src/module-system/table-module.js](../src/module-system/table-module.js)

- `TABLE_INVALID_SHEET_OPTION` - The table sheet option is not a non-negative integer.
  - `opt`: `diagnosticCode`, `filename`, `path`, `value`.
  - Files:
    - [src/module-system/table-module.js](../src/module-system/table-module.js)

- `TABLE_INVALID_TRANSPOSE_OPTION` - The table transpose option is not a Boolean.
  - `opt`: `diagnosticCode`, `filename`, `path`, `value`.
  - Files:
    - [src/module-system/table-module.js](../src/module-system/table-module.js)

- `TABLE_MISSING_SHEET` - The requested table worksheet does not exist.
  - `opt`: `diagnosticCode`, `filename`, `sheet`.
  - Files:
    - [src/module-system/table-module.js](../src/module-system/table-module.js)

### SBML modules

- `INVALID_SBML_REFERENCE` - An SBML element contains an invalid reference.
  - `opt`: `diagnosticCode`, `id`, `reference`, `path`, `filename`.
  - Files:
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)

- `INVALID_SBML_DOCUMENT` - The SBML document is missing the expected ``<sbml>`` or ``<model>`` structure.
  - `opt`: `diagnosticCode`, `path`, `reason`, `filename`.
  - Files:
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)

- `INVALID_SBML_EXPRESSION` - An SBML MathML expression is invalid or cannot be represented.
  - `opt`: `diagnosticCode`, `element`, `reason`, `operator`, `requiredOperands`, `providedOperands`, `id`, `filename`.
  - Files:
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)
    - [src/module-system/to-math-expr.js](../src/module-system/to-math-expr.js)

- `INVALID_SBML_FUNCTION_DEFINITION` - An SBML function definition is missing a ``<math>`` or ``<lambda>`` element.
  - `opt`: `diagnosticCode`, `id`, `element`, `reason`, `filename`.
  - Files:
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)

- `SBML_RATE_RULE_CONCENTRATION_SEMANTICS` - Importing a concentration rate rule may change the simulation semantics.
  - `opt`: `diagnosticCode`, `compartment`, `target`.
  - Files:
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)

- `UNSUPPORTED_SBML_ALGEBRAIC_RULE` - An SBML algebraic rule is unsupported.
  - `opt`: `diagnosticCode`, `filename`, `element`, `count`.
  - Files:
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)

- `UNSUPPORTED_SBML_CSYMBOL` - An SBML MathML symbol is unsupported.
  - `opt`: `diagnosticCode`, `filename`, `element`, `definitionURL`.
  - Files:
    - [src/module-system/to-math-expr.js](../src/module-system/to-math-expr.js)

- `UNSUPPORTED_SBML_DELAY_SYMBOL` - The SBML delay symbol is unsupported.
  - `opt`: `diagnosticCode`, `filename`, `element`, `definitionURL`.
  - Files:
    - [src/module-system/to-math-expr.js](../src/module-system/to-math-expr.js)

- `UNSUPPORTED_SBML_EQUALITY_TRIGGER` - An equality or inequality comparison cannot be converted to a continuous event trigger.
  - `opt`: `diagnosticCode`, `filename`, `operator`.
  - Files:
    - [src/module-system/to-math-expr.js](../src/module-system/to-math-expr.js)

- `UNSUPPORTED_SBML_EVENT_DELAY` - An SBML event delay is unsupported.
  - `opt`: `diagnosticCode`, `filename`, `id`, `path`.
  - Files:
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)

- `UNSUPPORTED_SBML_FAST_REACTION` - An SBML fast reaction is unsupported.
  - `opt`: `diagnosticCode`, `filename`, `id`, `path`.
  - Files:
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)

- `UNSUPPORTED_SBML_NONFINITE_NUMBER` - A non-finite SBML MathML number is unsupported.
  - `opt`: `diagnosticCode`, `filename`, `element`.
  - Files:
    - [src/module-system/to-math-expr.js](../src/module-system/to-math-expr.js)

- `UNSUPPORTED_SBML_STOICHIOMETRY_MATH` - SBML stoichiometryMath is unsupported.
  - `opt`: `diagnosticCode`, `filename`, `id`, `species`, `path`.
  - Files:
    - [src/module-system/sbml-parse.js](../src/module-system/sbml-parse.js)

## 4. Actions and components

### Action types and properties

- `UNKNOWN_ACTION` - A platform action is unknown.
  - `opt`: `diagnosticCode`, `action`.
  - Files:
    - [src/container/main.js](../src/container/main.js)

- `PROPERTY_NOT_ALLOWED_IN_ACTION` - A property is not allowed for this action.
  - `opt`: `diagnosticCode`, `action`, `property`, `value`, `id`, `space`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `INVALID_IMPORT_SOURCE_ID` - A namespace import source identifier is invalid.
  - `opt`: `diagnosticCode`, `fromId`, `fromSpace`, `id`, `space`, `action`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `MISSING_IMPORT_SOURCE_ID` - A namespace import source identifier is missing.
  - `opt`: `diagnosticCode`, `fromId`, `fromSpace`, `id`, `space`, `action`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `INVALID_SOURCE_NAMESPACE` - A namespace import refers to an invalid source namespace.
  - `opt`: `diagnosticCode`, `action`, `id`, `fromId`, `space`, `fromSpace`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `MISSING_SOURCE_NAMESPACE` - A namespace import source is not specified.
  - `opt`: `diagnosticCode`, `action`, `id`, `fromId`, `space`, `fromSpace`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

### Applying actions

- `COMPONENT_REPLACED` - An existing component is replaced by another component.
  - `opt`: `diagnosticCode`, `id`, `space`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `DELETE_CORE_COMPONENT` - A read-only core component cannot be deleted.
  - `opt`: `diagnosticCode`, `space`, `id`
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `UPDATE_CORE_COMPONENT` - A read-only core component cannot be updated.
  - `opt`: `diagnosticCode`, `space`, `id`, `action`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `DEPRECATED_INLINE_EXPORT` - (deprecated) An inline export declaration uses a deprecated feature.
  - `opt`: `diagnosticCode`, `input`
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `INLINE_EXPORT_IGNORED` - (deprecated) An inline export is ignored because exports are configured in the platform declaration.
  - `opt`: `diagnosticCode`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `MISSING_EXPORT_FORMAT` - (deprecated) An inline export has no format.
  - `opt`: `diagnosticCode`, `action`, `path`, `format`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

### Component classes and identifiers

- `INVALID_CLASS` - A component class has an invalid type or an unknown name.
  - `opt`: `diagnosticCode`, `space`, `id`, `wrongClass`
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `MISSING_CLASS` - A required component class is missing.
  - `opt`: `diagnosticCode`, `space`, `id`, `action`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `INVALID_IDENTIFIER` - An identifier has an invalid format.
  - `opt`: `diagnosticCode`, `space`, `id`, `action`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `MISSING_IDENTIFIER` - A required identifier is missing.
  - `opt`: `diagnosticCode`, `id`, `space`, `action`, `path`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

- `RESERVED_IDENTIFIER` - A reserved word is used as an identifier.
  - `opt`: `diagnosticCode`, `space`, `id`, `action`, `path`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)

### Component properties and required values

- `INVALID_PROPERTY` - One or more element properties fail validation.
  - `opt`: `diagnosticCode`, `id`, `space`, `className`, `errors`.
  - Files:
    - [src/core/top.js](../src/core/top.js)

- `MISSING_REQUIRED_PROPERTY` - A required model element property is missing.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `className`.
  - Files:
    - [src/core/component.js](../src/core/component.js)

- `MISSING_INITIAL_VALUE` - A record has neither an initial assignment nor an ODE assignment.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`.
  - Files:
    - [src/core/record.js](../src/core/record.js)

- `SCALE_VALUE_OUT_OF_RANGE` - A constant value is incompatible with its scale.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `value`, `scale`.
  - Files:
    - [src/core/const.js](../src/core/const.js)

- `VALUE_OUT_OF_BOUNDS` - A constant value is outside its declared bounds.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `value`, `bound`, `limit`.
  - Files:
    - [src/core/const.js](../src/core/const.js)

### Expressions and function definitions

- `INVALID_EXPRESSION` - A Heta mathematical expression cannot be parsed or represented.
  - `opt`: `diagnosticCode`, `expression`, `condition`, `operator`, `nodeTypes`, `space`, `id`, `path`, `format`.
  - Files:
    - [src/core/expression.js](../src/core/expression.js)

- `EXPECTED_BOOLEAN_EXPRESSION` - A Boolean expression is required.
  - `opt`: `diagnosticCode`, `space`, `id`, `expression`, `path`
  - Files:
    - [src/core/d-switcher.js](../src/core/d-switcher.js)
    - [src/core/stop-switcher.js](../src/core/stop-switcher.js)

- `EXPECTED_NUMERIC_EXPRESSION` - A numeric expression is required.
  - `opt`: `diagnosticCode`, `space`, `id`, `expression`, `path`
  - Files:
    - [src/core/c-switcher.js](../src/core/c-switcher.js)
    - [src/core/function-def.js](../src/core/function-def.js)
    - [src/core/record.js](../src/core/record.js)

- `FUNCTION_ARGUMENT_COUNT` - A function call has fewer arguments than required.
  - `opt`: `diagnosticCode`, `id`, `space`, `path`, `functionId`, `providedArguments`, `requiredArguments`.
  - Files:
    - [src/core/c-switcher.js](../src/core/c-switcher.js)
    - [src/core/d-switcher.js](../src/core/d-switcher.js)
    - [src/core/expression.js](../src/core/expression.js)
    - [src/core/function-def.js](../src/core/function-def.js)
    - [src/core/record.js](../src/core/record.js)
    - [src/core/stop-switcher.js](../src/core/stop-switcher.js)

- `MISSING_FUNCTION_ARGUMENTS` - A user-defined function has no argument list.
  - `opt`: `diagnosticCode`, `id`, `path`.
  - Files:
    - [src/core/function-def.js](../src/core/function-def.js)

- `MISSING_FUNCTION_EXPRESSION` - A user-defined function has no mathematical expression.
  - `opt`: `diagnosticCode`, `id`, `path`.
  - Files:
    - [src/core/function-def.js](../src/core/function-def.js)

- `UNDECLARED_FUNCTION_VARIABLE` - A function expression refers to a variable outside its argument list.
  - `opt`: `diagnosticCode`, `id`, `path`, `expression`, `variables`.
  - Files:
    - [src/core/function-def.js](../src/core/function-def.js)

### Process definitions

- `INVALID_PROCESS_EXPRESSION` - A process actor expression cannot be parsed.
  - `opt`: `diagnosticCode`, `expression`, `space`, `id`, `path`.
  - Files:
    - [src/core/process.js](../src/core/process.js)

- `EMPTY_PROCESS_ACTORS` - A process has no actors.
  - `opt`: `diagnosticCode`, `space`, `id`
  - Files:
    - [src/core/process.js](../src/core/process.js)

### Unit definitions

- `CONFLICTING_UNIT_DEFINITION` - Unit definition must not include both: terms and units.
  - `opt`: `diagnosticCode`, `id`
  - Files:
    - [src/core/unit-def.js](../src/core/unit-def.js)

- `INVALID_UNIT_DEFINITION` - A unit factor has a missing or non-string kind.
  - `opt`: `diagnosticCode`, `id`, `path`, `itemIndex`, `space`, `unitItem`, `filename`.
  - Files:
    - [src/core/unit.js](../src/core/unit.js)

- `INVALID_UNIT_EXPRESSION` - A unit expression cannot be parsed or validated.
  - `opt`: `diagnosticCode`, `id`, `space`, `path`, `unitExpression`, `unitItem`, `itemIndex`, `reason`, `maxLength`.
  - Files:
    - [src/core/unit.js](../src/core/unit.js)

- `INVALID_UNIT_TERM` - A unit term item has a missing or unsupported kind.
  - `opt`: `diagnosticCode`, `id`, `space`, `path`, `termItem`, `itemIndex`, `allowedKinds`.
  - Files:
    - [src/core/unit-term.js](../src/core/unit-term.js)

- `MISSING_UNIT_DEFINITION` - A unit definition must include terms or units.
  - `opt`: `diagnosticCode`, `id`.
  - Files:
    - [src/core/unit-def.js](../src/core/unit-def.js)

### Scenario definitions

- `INVALID_TIME_SPAN` - The scenario start time is not less than its end time.
  - `opt`: `diagnosticCode`, `id`, `path`, `tspan`.
  - Files:
    - [src/core/scenario.js](../src/core/scenario.js)

## 5. Platform integrity and references

### Namespaces and references

- `MISSING_ASSIGNMENT_SWITCHER` - A record assignment refers to a Switcher that does not exist.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `switcher`.
  - Files:
    - [src/core/record.js](../src/core/record.js)

- `MISSING_NAMESPACE` - A referenced namespace does not exist.
  - `opt`: `diagnosticCode`, `space`, `fromSpace`, `id`, `action`, `path`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)
    - [src/core/scenario.js](../src/core/scenario.js)

- `MISSING_REFERENCE` - A referenced model element does not exist.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `reference`, `expression`, `action`, `fromSpace`.
  - Files:
    - [src/container/actions.js](../src/container/actions.js)
    - [src/core/c-switcher.js](../src/core/c-switcher.js)
    - [src/core/component.js](../src/core/component.js)
    - [src/core/d-switcher.js](../src/core/d-switcher.js)
    - [src/core/record.js](../src/core/record.js)
    - [src/core/scenario.js](../src/core/scenario.js)
    - [src/core/stop-switcher.js](../src/core/stop-switcher.js)

- `UNKNOWN_FUNCTION` - A referenced function is not defined.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `functionId`, `expression`.
  - Files:
    - [src/core/c-switcher.js](../src/core/c-switcher.js)
    - [src/core/d-switcher.js](../src/core/d-switcher.js)
    - [src/core/function-def.js](../src/core/function-def.js)
    - [src/core/record.js](../src/core/record.js)
    - [src/core/stop-switcher.js](../src/core/stop-switcher.js)

- `UNKNOWN_UNIT` - A referenced unit definition cannot be found.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `unit`.
  - Files:
    - [src/core/unit-def.js](../src/core/unit-def.js)
    - [src/core/_size.js](../src/core/_size.js)

- `WRONG_REFERENCE_TYPE` - A model reference points to an element of the wrong type.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `reference`, `expression`, `expectedClass`, `actualClass`.
  - Files:
    - [src/core/c-switcher.js](../src/core/c-switcher.js)
    - [src/core/component.js](../src/core/component.js)
    - [src/core/d-switcher.js](../src/core/d-switcher.js)
    - [src/core/record.js](../src/core/record.js)
    - [src/core/scenario.js](../src/core/scenario.js)
    - [src/core/stop-switcher.js](../src/core/stop-switcher.js)

### Circular dependencies

- `CIRCULAR_FUNCTION_DEFINITION` - Function definitions contain a circular dependency.
  - `opt`: `diagnosticCode`, `circular`
  - Files:
    - [src/container/main.js](../src/container/main.js)

- `CIRCULAR_RECORD_DEPENDENCY` - Record expressions contain a circular dependency.
  - `opt`: `diagnosticCode`, `circular`
  - Files:
    - [src/namespace.js](../src/namespace.js)
    - [src/dynms/namespace.js](../src/dynms/namespace.js)

- `CIRCULAR_UNIT_DEFINITION` - Unit definitions contain a circular dependency.
  - `opt`: `diagnosticCode`, `circular`
  - Files:
    - [src/container/main.js](../src/container/main.js)

### Unit consistency and terms

- `ODE_UNIT_MISMATCH` - An ODE and the processes affecting a species have incompatible units.
  - `opt`: `diagnosticCode`, `id`, `space`, `process`, `odeUnits`, `processUnits`.
  - Files:
    - [src/core/species.js](../src/core/species.js)

- `UNDEFINED_TIME_UNIT` - A time scale has no units.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`.
  - Files:
    - [src/core/time-scale.js](../src/core/time-scale.js)

- `MISSING_UNIT` - Units needed for a component or calculation are unavailable.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `reference`, `format`.
  - Files:
    - [src/core/const.js](../src/core/const.js)
    - [src/core/record.js](../src/core/record.js)
    - [src/core/species.js](../src/core/species.js)
    - [src/simbio-export/namespace.js](../src/simbio-export/namespace.js)

- `UNIT_CALCULATION_FAILED` - Units cannot be calculated for an expression.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `expression`, `reference`.
  - Files:
    - [src/core/math-calc-unit.js](../src/core/math-calc-unit.js)
    - [src/core/c-switcher.js](../src/core/c-switcher.js)
    - [src/core/d-switcher.js](../src/core/d-switcher.js)
    - [src/core/record.js](../src/core/record.js)
    - [src/core/stop-switcher.js](../src/core/stop-switcher.js)

- `UNIT_CONVERSION_UNAVAILABLE` - A unit cannot be converted to the requested units.
  - `opt`: `diagnosticCode`, `component`, `format`, `legalUnits`, `space`, `unit`, `unitExpression`.
  - Files:
    - [src/core/unit.js](../src/core/unit.js)

- `UNIT_DIMENSIONLESS_REQUIRED` - An expression argument must be dimensionless.
  - `opt`: `diagnosticCode`, `space`, `id`, `expression`, `argumentUnits`.
  - Files:
    - [src/core/math-calc-unit.js](../src/core/math-calc-unit.js)

- `UNIT_EXPONENT_MISMATCH` - Units used in exponentiation or a root are incompatible with the exponent.
  - `opt`: `diagnosticCode`, `space`, `id`, `expression`, `unitExpression`.
  - Files:
    - [src/core/math-calc-unit.js](../src/core/math-calc-unit.js)

- `UNIT_MISMATCH` - Expression or assignment units are inconsistent.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `expression`, `unitExpression`.
  - Files:
    - [src/core/math-calc-unit.js](../src/core/math-calc-unit.js)
    - [src/core/record.js](../src/core/record.js)

- `UNIT_PREFIX_UNAVAILABLE` - No suitable unit prefix can be selected.
  - `opt`: `diagnosticCode`, `format`, `multiplier`, `space`, `unit`, `unitExpression`.
  - Files:
    - [src/core/unit.js](../src/core/unit.js)

- `UNIT_TERM_MISMATCH` - An element's unit term is not allowed for its class.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `format`, `unitTerm`, `allowedTerms`.
  - Files:
    - [src/container/main.js](../src/container/main.js)
    - [src/simbio-export/namespace.js](../src/simbio-export/namespace.js)

- `UNIT_TERM_UNCOMPUTABLE` - An element's unit term cannot be calculated.
  - `opt`: `diagnosticCode`, `space`, `id`, `path`, `format`.
  - Files:
    - [src/container/main.js](../src/container/main.js)
    - [src/simbio-export/namespace.js](../src/simbio-export/namespace.js)

## 6. Export generation

### DBSolve/SLV specific

- `DBSOLVE_CEVENT_CONVERTED_TO_DEVENT` - An unsupported continuous event is converted to a discrete event during export.
  - `opt`: `diagnosticCode`, `space`, `id`, `format`
  - Files:
    - [src/dbsolve-export/namespace.js](../src/dbsolve-export/namespace.js)

- `DBSOLVE_UNSUPPORTED_CONDITION` - A condition is unsupported by the export format.
  - `opt`: `diagnosticCode`, `id`, `space`, `expression`, `path`, `format`.
  - Files:
    - [src/dbsolve-export/expression.js](../src/dbsolve-export/expression.js)
    - [src/dbsolve-export/namespace.js](../src/dbsolve-export/namespace.js)

- `DBSOLVE_UNSUPPORTED_FUNCTION` - An expression uses a piecewise function unsupported by the export format.
  - `opt`: `diagnosticCode`, `functionId`, `format`
  - Files:
    - [src/dbsolve-export/expression.js](../src/dbsolve-export/expression.js)

- `SLV_CONTINUOUS_EVENTS_IGNORED` - Continuous events cannot be exported to SLV and are ignored.
  - `opt`: `diagnosticCode`, `format`, `space`, `events`.
  - Files:
    - [src/slv-export/namespace.js](../src/slv-export/namespace.js)

- `SLV_DISCRETE_EVENTS_IGNORED` - Discrete events cannot be exported to SLV and are ignored.
  - `opt`: `diagnosticCode`, `format`, `space`, `events`.
  - Files:
    - [src/slv-export/namespace.js](../src/slv-export/namespace.js)

- `SLV_EVENT_ASSIGNMENT_IGNORED` - An event assignment cannot be represented in SLV and is ignored.
  - `opt`: `diagnosticCode`, `format`, `space`, `id`, `event`, `path`, `expression`.
  - Files:
    - [src/slv-export/namespace.js](../src/slv-export/namespace.js)

- `SLV_UNSUPPORTED_INITIAL_EXPRESSION` - SLV initial values cannot be nonnumeric expressions.
  - `opt`: `diagnosticCode`, `format`, `space`, `assignments`.
  - Files:
    - [src/slv-export/namespace.js](../src/slv-export/namespace.js)

### SimBiology/SBML specific

- `SBML_CEVENT_CONVERTED_TO_DEVENT` - An unsupported continuous event is converted to a discrete event during export.
  - `opt`: `diagnosticCode`, `space`, `ids`, `format`
  - Files:
    - [src/sbml-export/namespace.js](../src/sbml-export/namespace.js)
    - [src/simbio-export/namespace.js](../src/simbio-export/namespace.js)

- `SBML_TIME_EVENT_CONVERTED_TO_DEVENT` - An unsupported time event is converted to a discrete event during export.
  - `opt`: `diagnosticCode`, `space`, `ids`, `format`
  - Files:
    - [src/sbml-export/namespace.js](../src/sbml-export/namespace.js)
    - [src/simbio-export/namespace.js](../src/simbio-export/namespace.js)

- `SIMBIO_REACTION_UNIT_TERM_MISMATCH` - A Simbiology reaction has an incompatible calculated unit term.
  - `opt`: `diagnosticCode`, `space`, `id`, `format`, `unitTerm`.
  - Files:
    - [src/simbio-export/namespace.js](../src/simbio-export/namespace.js)

### mrgsolve specific

- `MRGSOLVE_UNSUPPORTED_FUNCTION` - An expression uses a piecewise function unsupported by the export format.
  - `opt`: `diagnosticCode`, `functionId`, `format`
  - Files:
    - [src/mrgsolve-export/expression.js](../src/mrgsolve-export/expression.js)

- `MRGSOLVE_EVENT_STABILITY_RISK` - Conditional or crossing events may lead to unstable mrgsolve results.
  - `opt`: `diagnosticCode`, `space`, `format`, `events`.
  - Files:
    - [src/mrgsolve-export/namespace.js](../src/mrgsolve-export/namespace.js)
