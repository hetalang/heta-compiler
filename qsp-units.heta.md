# `qsp-units.heta`

The `qsp-units.heta` file provides a pre-defined set of units tailored for QSP (Quantitative Systems Pharmacology) models.

## Overview

- **Purpose:** This file contains a curated collection of commonly used units designed to simplify and standardize unit definitions in QSP models.
- **Location:** It is part of the QSP model template and is automatically included during project initialization.
- **Integration:** This file is referenced in the `index.heta` file to ensure the defined units are readily available in your project.

## Base Units and Units definitions in Heta Specification

Heta specification defines a set of **core units** that serve as the foundation for creating and using units in models. These include fundamental units for quantities like time, mass, and volume. For a detailed list of these core units, refer to the [Heta Core Units](/specifications/units?id=core-units) documentation.

Heta allows users to define their own units using the [`#defineUnit`](/specifications/actions?id=defineunit) action. The `qsp-units.heta` file leverages this capability to provide an extended set of units while maintaining compatibility with the core units.

## Included Units

The `qsp-units.heta` file includes a wide range of pre-defined units, such as:

- **Moles and Concentrations:** Units like femtomoles (`fmole`), micromoles (`umole`), and molar concentrations (`nM`, `mM`, `M`).
- **Volumes:** Units such as femtoliters (`fL`), microliters (`uL`), and liters (`L`).
- **Time:** Units ranging from femtoseconds (`fs`) to weeks (`week`).
- **Mass:** Units such as nanograms (`ng`), micrograms (`ug`), and kilograms (`kg`).
- **Specialized Units:** Units for catalysis (`kat`), cells (`cell`, `kcell`), and energy (`cal`, `kcal`).
- **Dimensionless Units:** Includes dimensionless (`UL`) and percentage (`percent`).

For a complete list of units, refer to the content of the `qsp-units.heta` file.

## Best Practices

1. **Use as a Baseline:** The pre-defined units cover most use cases in QSP modeling. Leverage these units to maintain consistency and accuracy across your models.
2. **Extending Units:** If additional units are needed:
   - Define them in a separate file.
   - Or include them directly in the `index.heta` file for better organization.
3. **Avoid Modifications:** To keep the default setup intact, refrain from altering the `qsp-units.heta` file directly.

## Content

```heta
fmole #defineUnit {
    units: [ { kind: mole, multiplier: 1e-15 } ]
};
pmole #defineUnit {
    units: [ { kind: mole, multiplier: 1e-12 } ]
};
nmole #defineUnit {
    units: [ { kind: mole, multiplier: 1e-9 } ]
};
umole #defineUnit {
    units: [ { kind: mole, multiplier: 1e-6 } ]
};
mmole #defineUnit {
    units: [ { kind: mole, multiplier: 1e-3 } ]
};
fM #defineUnit {
    units: [ { kind: mole, multiplier: 1e-15 }, { kind: litre, exponent: -1} ]
};

pM #defineUnit {
    units: [ { kind: mole, multiplier: 1e-12 }, { kind: litre, exponent: -1} ]
};
nM #defineUnit {
    units: [ { kind: mole, multiplier: 1e-9 }, { kind: litre, exponent: -1} ]
};
uM #defineUnit {
    units: [ { kind: mole, multiplier: 1e-6 }, { kind: litre, exponent: -1} ]
};
mM #defineUnit {
    units: [ { kind: mole, multiplier: 1e-3 }, { kind: litre, exponent: -1} ]
};
M #defineUnit {
    units: [ { kind: mole }, { kind: litre, exponent: -1} ]
};
kM #defineUnit {
    units: [ { kind: mole, multiplier: 1e3 }, { kind: litre, exponent: -1 } ]
};

fL #defineUnit {
    units: [ { kind: litre, multiplier: 1e-15 } ]
};
pL #defineUnit {
    units: [ { kind: litre, multiplier: 1e-12 } ]
};
nL #defineUnit {
    units: [ { kind: litre, multiplier: 1e-9 } ]
};
uL #defineUnit {
    units: [ { kind: litre, multiplier: 1e-6 } ]
};
mL #defineUnit {
    units: [ { kind: litre, multiplier: 1e-3 } ]
};
dL #defineUnit {
    units: [ { kind: litre, multiplier: 1e-1 } ]
};
L #defineUnit {
    units: [ { kind: litre } ]
};

fs #defineUnit {
    units: [ { kind: second, multiplier: 1e-15 } ]
};
ps #defineUnit {
    units: [ { kind: second, multiplier: 1e-12 } ]
};
ns #defineUnit {
    units: [ { kind: second, multiplier: 1e-9 } ]
};
us #defineUnit {
    units: [ { kind: second, multiplier: 1e-6 } ]
};
ms #defineUnit {
    units: [ { kind: second, multiplier: 1e-3 } ]
};
s #defineUnit {
    units: [ { kind: second } ]
};
h #defineUnit {
    units: [ { kind: hour, multiplier: 1 } ]
};
week #defineUnit {
    units: [ { kind: day, multiplier: 7 } ]
};

fg #defineUnit {
    units: [ { kind: kilogram, multiplier: 1e-18 } ]
};
pg #defineUnit {
    units: [ { kind: kilogram, multiplier: 1e-15 } ]
};
ng #defineUnit {
    units: [ { kind: kilogram, multiplier: 1e-12 } ]
};
ug #defineUnit {
    units: [ { kind: kilogram, multiplier: 1e-9 } ]
};
mg #defineUnit {
    units: [ { kind: kilogram, multiplier: 1e-6 } ]
};
g #defineUnit {
    units: [ { kind: kilogram, multiplier: 1e-3 } ]
};
kg #defineUnit {
    units: [ { kind: kilogram } ]
};

kat #defineUnit {
    units: [ { kind: katal } ]
};

cell #defineUnit {
    units: [ { kind: item } ]
};
kcell #defineUnit {
    units: [ { kind: item, multiplier: 1e3 } ]
};

cal #defineUnit {
    units: [ { kind: joule, multiplier: 4.1868 } ]
};
kcal #defineUnit {
    units: [ { kind: joule, multiplier: 4.1868e3 } ]
};

fm #defineUnit {
    units: [ { kind: metre, multiplier: 1e-15 } ]
};
pm #defineUnit {
    units: [ { kind: metre, multiplier: 1e-12 } ]
};
nm #defineUnit {
    units: [ { kind: metre, multiplier: 1e-9 } ]
};
um #defineUnit {
    units: [ { kind: metre, multiplier: 1e-6 } ]
};
mm #defineUnit {
    units: [ { kind: metre, multiplier: 1e-3 } ]
};
cm #defineUnit {
    units: [ { kind: metre, multiplier: 1e-2 } ]
};
m #defineUnit {
    units: [ { kind: metre } ]
};

UL #defineUnit {
    units: [ { kind: dimensionless } ]
};
percent #defineUnit {
    units: [ { kind: dimensionless, multiplier: 1e-2 } ]
};
```