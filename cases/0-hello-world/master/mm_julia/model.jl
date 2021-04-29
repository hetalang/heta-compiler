#= 
    This code was generated by heta-compiler *
    
=#

function Platform()

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
function mm_init_func_(cons)
    #(Vmax,Km,) = cons

    # Heta initialize
    t = 0.0 # initial time
    P = 0.0
    S = 10.0
    default_comp = 1.0
    r1 = cons[1] * S / (cons[2] + S) * default_comp
    
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
function mm_ode_func_(du, u, p, t)
    cons = p.constants
    (default_comp,) = p.static
    (S_,P_,) = u 

    # Heta rules
    P = P_ / default_comp
    S = S_ / default_comp
    r1 = cons[1] * S / (cons[2] + S) * default_comp
    
    #p.static .= [default_comp,]
    du .= [
      -r1,  # dS_/dt
      r1,  # dP_/dt
    ]
end

### output function
function mm_saving_generator_(outputIds::Vector{Symbol})
    function saving_(u, t, integrator)
        cons = integrator.p.constants
        (default_comp,) = integrator.p.static
        (S_,P_,) = u

        # Heta rules
        P = P_ / default_comp
        S = S_ / default_comp
        r1 = cons[1] * S / (cons[2] + S) * default_comp
        
        # force amount

        d = Base.@locals
        return [d[id] for id in outputIds]
    end
end

### time events

### discrete events

### continuous events

### event assignments


### MODELS ###

mm_model_ = Model(
  mm_init_func_,
  mm_ode_func_,
  NamedTuple{(
  )}([
  ]),
  mm_saving_generator_;
  constants_num = mm_constants_num_,
  events_active = mm_events_active_,
  records_output = mm_records_output_
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
