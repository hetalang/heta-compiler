#= 
    This code was generated by heta-compiler *
    
=#

__platform__ = (function()

### create default constants
mm_constants_num_ = NamedTuple{(
  :Vmax,:Km,
)}(Float64[
  0.1,2.5,
])

### create default observables
mm_records_output_ = NamedTuple{(
  :default_comp,:S,:P,:r1,
)}(Bool[
  false,true,true,false,
])

### create default events
mm_events_active_ = NamedTuple{(
  
)}(Bool[
  
])

### initialization of ODE variables and Records
function mm_init_func_(__cons__)
    #(Vmax,Km,) = __cons__

    # Heta initialize
    t = 0.0 # initial time
    P = 0.0
    S = 10.0
    default_comp = 1.0
    r1 = __cons__[1] * S / (__cons__[2] + S) * default_comp
    
    # save results

    return (
        Float64[
            S * default_comp,
            P * default_comp,
        ],
        Float64[
            default_comp,
        ]
    )
end

### calculate RHS of ODE
function mm_ode_func_(__du__, __u__, __p__, t)
    __cons__ = __p__.constants
    (default_comp,) = __p__.static
    (S_,P_,) = __u__ 

    # Heta rules
    P = P_ / default_comp
    S = S_ / default_comp
    r1 = __cons__[1] * S / (__cons__[2] + S) * default_comp
    
    #__p__.static .= [default_comp,]
    __du__ .= [
      -r1,  # dS_/dt
      r1,  # dP_/dt
    ]
end

### output function
function mm_saving_generator_(__outputIds__::Vector{Symbol})
    # XXX: currently force amounts: s1_, s2_ are not supported
    __actual_indexes__ = indexin(__outputIds__, [:default_comp,:S,:P,:r1,])
    # check nothing in __actual_indexes__
    __wrongIndexes__ = findall(x -> x===nothing, __actual_indexes__)
    if length(__wrongIndexes__) > 0
      __wrongIds__ = __outputIds__[__wrongIndexes__]
      throw("Wrong identifiers: $(__wrongIds__)")
    end

    function saving_(__u__, t, __integrator__)
        __cons__ = __integrator__.p.constants
        (default_comp,) = __integrator__.p.static
        (S_,P_,) = __u__

        # Heta rules
        P = P_ / default_comp
        S = S_ / default_comp
        r1 = __cons__[1] * S / (__cons__[2] + S) * default_comp
        
        # force amount

        return [default_comp,S,P,r1,][__actual_indexes__]
    end
end

### TIME EVENTS ###

### D EVENTS ###

### STOP EVENTS ###

### event assignments


### MODELS ###

mm_model_ = (
  mm_init_func_,
  mm_ode_func_,
  NamedTuple{(
  )}([
  ]),
  NamedTuple{(
  )}([
  ]),
  NamedTuple{(
  )}([
  ]),
  mm_saving_generator_,
  mm_constants_num_,
  mm_events_active_,
  mm_records_output_
)

### OUTPUT ###

return (
  (
    mm = mm_model_,
  ),
  (),
  "*"
)

end
)()