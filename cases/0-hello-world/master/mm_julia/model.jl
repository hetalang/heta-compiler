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
### create static ids
mm_statics_id_ = (
    :default_comp,
)

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

### vector of non-steady-state
mm_dynamic_nonss_ = NamedTuple{(
  :S,:P,
)}(Bool[
  true,true,
])

### initialization of ODE variables and Records
function mm_init_func_!(__u0__, __p0__, __constants__)
    # Heta initialize
    t = 0.0 # initial time
    P = 0e+0
    S = 1e+1
    default_comp = 1e+0
    r1 = __constants__[1] * S / (__constants__[2] + S) * default_comp
    
    # save results
    __u0__ .= (
        S * default_comp,
        P * default_comp,
    )

    __p0__ .= (
        default_comp,
    )

    return nothing
end

### calculate RHS of ODE
function mm_ode_func_(__du__, __u__, __p__, t)
    (default_comp,) = __p__.x[1]
    __constants__ = __p__.x[2]
    (S_,P_,) = __u__ 

    # Heta rules
    P = P_ / default_comp
    S = S_ / default_comp
    r1 = __constants__[1] * S / (__constants__[2] + S) * default_comp
    
    #__p__.x[1] .= [default_comp,]
    __du__ .= [
      -r1,  # dS_/dt
      r1,  # dP_/dt
    ]
end

### output function
# XXX: currently force amounts: s1_, s2_ are not supported
function mm_saving_generator_(__outputIds__::Vector{Symbol})
    __wrongIds__ = setdiff(__outputIds__, [:default_comp,:S,:P,:r1,])
    !isempty(__wrongIds__) && throw("The following observables have not been found in the model's Records: $(__wrongIds__)")

    __out_expr__ = Expr(:block)
    [push!(__out_expr__.args, :(__out__[$i] = $obs)) for (i,obs) in enumerate(__outputIds__)]

    @eval function(__out__, __u__, t, __integrator__)
        (default_comp,) = __integrator__.p.x[1]
        __constants__ = __integrator__.p.x[2]
        (S_,P_,) = __u__

        # Heta rules
        P = P_ / default_comp
        S = S_ / default_comp
        r1 = __constants__[1] * S / (__constants__[2] + S) * default_comp
        
        # force amount

        $(__out_expr__)
        return nothing
    end
end

### TIME EVENTS ###

### D EVENTS ###

### C EVENTS ###

### STOP EVENTS ###

### event assignments


### MODELS ###

mm_model_ = (
  mm_init_func_!,
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
  NamedTuple{(
  )}([
  ]),
  mm_saving_generator_,
  mm_constants_num_,
  mm_statics_id_,
  mm_events_active_,
  mm_records_output_,
  mm_dynamic_nonss_
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