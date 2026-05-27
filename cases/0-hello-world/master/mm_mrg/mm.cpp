$PROB
# Model: `mm`
  - Title: mm
  - Notes: Generated automatically from platform with Heta compiler
  - Source: Heta compiler

# Demo
```{r,echo=TRUE}
  ev(amt=10) %>% mrgsim %>% plot
```

$SET end=120, delta=0.1, hmax=0.01, hmin=0.0, rtol=1e-3, atol=1e-6

$PARAM @annotated
// constants
Vmax : 0.1 : -
Km : 2.5 : -
// events active

$INIT @annotated
// dynamic states
S_amt_ : 0 : substrate
P_amt_ : 0 : product

$PREAMBLE
// static states
double default_comp = 0.0; // Default compartment
// triggers

$MAIN
// dynamic states initializations
S_amt__0 = 10.0 * 1.0;
P_amt__0 = 0.0 * 1.0;
if (NEWIND <= 1) {
// static states initializations
default_comp = 1;
// time events
}

$ODE
// assignments
double P = P_amt_ / default_comp; // product
double S = S_amt_ / default_comp; // substrate
double r1 = Vmax * S / (Km + S) * default_comp; // Michaelis-Menten reaction
// triggers
// derivatives
dxdt_S_amt_ = -r1;
dxdt_P_amt_ = r1;

$CAPTURE @annotated
S : -
P : -

