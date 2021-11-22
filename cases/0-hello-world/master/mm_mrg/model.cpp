$PROB
# Model: `mm`
  - Title: mm
  - Notes: Generated automatically from platform with Heta compiler
  - Source: Heta compiler

# Demo
```{r,echo=TRUE}
  ev(amt=10) %>% mrgsim %>% plot
```

$SET end=120, delta=0.1, hmax=0.01, hmin=0, rtol=1e-3, atol=1e-6

$PARAM @annotated
// @Const 
Vmax : 0.1 : (uM/minute)
// @Const 
Km : 2.5 : (uM)

$CMT @annotated
// @Species 'substrate'
S_amt_ : as amount
// @Species 'product'
P_amt_ : as amount

$GLOBAL
#define S (S_amt_ / default_comp)
#define P (P_amt_ / default_comp)

$PREAMBLE
//double P = 0.0;
//double S = 10.0;
double default_comp = 1.0;

$MAIN
P_amt__0 = (0.0) * default_comp;
S_amt__0 = (10.0) * default_comp;



$ODE
// @Reaction 'Michaelis-Menten reaction'
double r1 = Vmax * S / (Km + S) * default_comp;

dxdt_S_amt_ = (-1)*r1;
dxdt_P_amt_ = (1)*r1;

$CAPTURE @annotated
S : substrate (uM)
P : product (uM)
