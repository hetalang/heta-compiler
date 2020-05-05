(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["blocks-template.slv.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("template.slv.njk", true, "blocks-template.slv.njk", false, function(t_3,t_2) {
if(t_3) { cb(t_3); return; }
parentTemplate = t_2
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\r\n=========================== if/else in RHS ======================\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("ifelseStatics"))(env, context, frame, runtime, function(t_5,t_4) {
if(t_5) { cb(t_5); return; }
output += t_4;
output += "\r\n============================ output ======================\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("outputVars"))(env, context, frame, runtime, function(t_7,t_6) {
if(t_7) { cb(t_7); return; }
output += t_6;
output += "\r\n================================ Events ============================\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("events"))(env, context, frame, runtime, function(t_9,t_8) {
if(t_9) { cb(t_9); return; }
output += t_8;
output += "\r\n=============================== All reactions ======================\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("reactionNames"))(env, context, frame, runtime, function(t_11,t_10) {
if(t_11) { cb(t_11); return; }
output += t_10;
output += "\r\n=============================== All compounds========================\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("compoundNames"))(env, context, frame, runtime, function(t_13,t_12) {
if(t_13) { cb(t_13); return; }
output += t_12;
output += "\r\n=============================== Stoichiometric Matrix  ============\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("sm"))(env, context, frame, runtime, function(t_15,t_14) {
if(t_15) { cb(t_15); return; }
output += t_14;
output += "\r\n=============================== Comments =========================\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("comments"))(env, context, frame, runtime, function(t_17,t_16) {
if(t_17) { cb(t_17); return; }
output += t_16;
output += "\r\n=============================== IV ================================\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("iv"))(env, context, frame, runtime, function(t_19,t_18) {
if(t_19) { cb(t_19); return; }
output += t_18;
output += "\r\n=============================== RHS ================================\r\n";
var macro_t_20 = runtime.makeMacro(
[], 
["backReferences"], 
function (kwargs) {
var callerFrame = frame;
frame = new runtime.Frame();
kwargs = kwargs || {};
if (Object.prototype.hasOwnProperty.call(kwargs, "caller")) {
frame.set("caller", kwargs.caller); }
frame.set("backReferences", Object.prototype.hasOwnProperty.call(kwargs, "backReferences") ? kwargs["backReferences"] : []);var t_21 = "";frame = frame.push();
var t_24 = env.getFilter("exclude2").call(context, runtime.contextOrFrameLookup(context, frame, "backReferences"),"stoichiometry",runtime.contextOrFrameLookup(context, frame, "undefined"));
if(t_24) {t_24 = runtime.fromIterator(t_24);
var t_23 = t_24.length;
for(var t_22=0; t_22 < t_24.length; t_22++) {
var t_25 = t_24[t_22];
frame.set("br", t_25);
frame.set("loop.index", t_22 + 1);
frame.set("loop.index0", t_22);
frame.set("loop.revindex", t_23 - t_22);
frame.set("loop.revindex0", t_23 - t_22 - 1);
frame.set("loop.first", t_22 === 0);
frame.set("loop.last", t_22 === t_23 - 1);
frame.set("loop.length", t_23);
if(runtime.memberLookup((t_25),"stoichiometry") > 0 && !runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"first")) {
t_21 += "+";
;
}
t_21 += runtime.suppressValue(runtime.memberLookup((t_25),"stoichiometry") + "*", env.opts.autoescape);
t_21 += runtime.suppressValue(runtime.memberLookup((t_25),"process"), env.opts.autoescape);
t_21 += runtime.suppressValue((runtime.memberLookup((runtime.memberLookup((t_25),"_process_")),"isAmount") !== false?"":"*" + runtime.memberLookup((runtime.memberLookup((t_25),"_process_")),"compartment")), env.opts.autoescape);
;
}
}
frame = frame.pop();
;
frame = callerFrame;
return new runtime.SafeString(t_21);
});
context.addExport("diff");
context.setVariable("diff", macro_t_20);
output += "\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("rhs"))(env, context, frame, runtime, function(t_27,t_26) {
if(t_27) { cb(t_27); return; }
output += t_26;
output += "\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})})})})})})})})})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_ifelseStatics(env, context, frame, runtime, cb) {
var lineno = 2;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
frame = frame.push();
var t_30 = runtime.contextOrFrameLookup(context, frame, "ifelseStatics");
if(t_30) {t_30 = runtime.fromIterator(t_30);
var t_29 = t_30.length;
for(var t_28=0; t_28 < t_30.length; t_28++) {
var t_31 = t_30[t_28];
frame.set("set", t_31);
frame.set("loop.index", t_28 + 1);
frame.set("loop.index0", t_28);
frame.set("loop.revindex", t_29 - t_28);
frame.set("loop.revindex0", t_29 - t_28 - 1);
frame.set("loop.first", t_28 === 0);
frame.set("loop.last", t_28 === t_29 - 1);
frame.set("loop.length", t_29);
output += "\r\nif(";
output += runtime.suppressValue(runtime.memberLookup((t_31),"condition"), env.opts.autoescape);
output += "){ ";
frame = frame.push();
var t_34 = runtime.memberLookup((t_31),"ifPart");
if(t_34) {t_34 = runtime.fromIterator(t_34);
var t_33 = t_34.length;
for(var t_32=0; t_32 < t_34.length; t_32++) {
var t_35 = t_34[t_32];
frame.set("rule", t_35);
frame.set("loop.index", t_32 + 1);
frame.set("loop.index0", t_32);
frame.set("loop.revindex", t_33 - t_32);
frame.set("loop.revindex0", t_33 - t_32 - 1);
frame.set("loop.first", t_32 === 0);
frame.set("loop.last", t_32 === t_33 - 1);
frame.set("loop.length", t_33);
output += "\r\n  ";
output += runtime.suppressValue(runtime.memberLookup((t_35),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_35),"rhs"), env.opts.autoescape);
output += ";";
;
}
}
frame = frame.pop();
output += "\r\n}else{}\r\n";
;
}
}
frame = frame.pop();
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_outputVars(env, context, frame, runtime, cb) {
var lineno = 8;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
frame = frame.push();
var t_38 = (lineno = 8, colno = 72, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"population")),"selectByClassName"), "_model_[\"population\"][\"selectByClassName\"]", context, ["Species"]));
if(t_38) {t_38 = runtime.fromIterator(t_38);
var t_37 = t_38.length;
for(var t_36=0; t_36 < t_38.length; t_36++) {
var t_39 = t_38[t_36];
frame.set("out", t_39);
frame.set("loop.index", t_36 + 1);
frame.set("loop.index0", t_36);
frame.set("loop.revindex", t_37 - t_36);
frame.set("loop.revindex0", t_37 - t_36 - 1);
frame.set("loop.first", t_36 === 0);
frame.set("loop.last", t_36 === t_37 - 1);
frame.set("loop.length", t_37);
output += runtime.suppressValue(runtime.memberLookup((t_39),"id"), env.opts.autoescape);
output += "  ";
;
}
}
frame = frame.pop();
output += "t  ";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_events(env, context, frame, runtime, cb) {
var lineno = 10;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"events")),"length"), env.opts.autoescape);
frame = frame.push();
var t_42 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"events");
if(t_42) {t_42 = runtime.fromIterator(t_42);
var t_41 = t_42.length;
for(var t_40=0; t_40 < t_42.length; t_40++) {
var t_43 = t_42[t_40];
frame.set("event", t_43);
frame.set("loop.index", t_40 + 1);
frame.set("loop.index0", t_40);
frame.set("loop.revindex", t_41 - t_40);
frame.set("loop.revindex0", t_41 - t_40 - 1);
frame.set("loop.first", t_40 === 0);
frame.set("loop.last", t_40 === t_41 - 1);
frame.set("loop.length", t_41);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_43),"target"), env.opts.autoescape);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_43),"multiply"), env.opts.autoescape);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_43),"add"), env.opts.autoescape);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_43),"start"), env.opts.autoescape);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_43),"period"), env.opts.autoescape);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_43),"on"), env.opts.autoescape);
;
}
}
frame = frame.pop();
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_reactionNames(env, context, frame, runtime, cb) {
var lineno = 18;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
frame = frame.push();
var t_46 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"processes");
if(t_46) {t_46 = runtime.fromIterator(t_46);
var t_45 = t_46.length;
for(var t_44=0; t_44 < t_46.length; t_44++) {
var t_47 = t_46[t_44];
frame.set("reaction", t_47);
frame.set("loop.index", t_44 + 1);
frame.set("loop.index0", t_44);
frame.set("loop.revindex", t_45 - t_44);
frame.set("loop.revindex0", t_45 - t_44 - 1);
frame.set("loop.first", t_44 === 0);
frame.set("loop.last", t_44 === t_45 - 1);
frame.set("loop.length", t_45);
output += "#";
output += runtime.suppressValue(runtime.memberLookup((t_47),"id"), env.opts.autoescape);
output += "\r\n";
;
}
}
frame = frame.pop();
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_compoundNames(env, context, frame, runtime, cb) {
var lineno = 21;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
frame = frame.push();
var t_50 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_50) {t_50 = runtime.fromIterator(t_50);
var t_49 = t_50.length;
for(var t_48=0; t_48 < t_50.length; t_48++) {
var t_51 = t_50[t_48];
frame.set("compound", t_51);
frame.set("loop.index", t_48 + 1);
frame.set("loop.index0", t_48);
frame.set("loop.revindex", t_49 - t_48);
frame.set("loop.revindex0", t_49 - t_48 - 1);
frame.set("loop.first", t_48 === 0);
frame.set("loop.last", t_48 === t_49 - 1);
frame.set("loop.length", t_49);
output += "#";
output += runtime.suppressValue(runtime.memberLookup((t_51),"id"), env.opts.autoescape);
output += "\r\n";
;
}
}
frame = frame.pop();
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_sm(env, context, frame, runtime, cb) {
var lineno = 24;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
frame = frame.push();
var t_54 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"matrix");
if(t_54) {t_54 = runtime.fromIterator(t_54);
var t_53 = t_54.length;
for(var t_52=0; t_52 < t_54.length; t_52++) {
var t_55 = t_54[t_52];
frame.set("line", t_55);
frame.set("loop.index", t_52 + 1);
frame.set("loop.index0", t_52);
frame.set("loop.revindex", t_53 - t_52);
frame.set("loop.revindex0", t_53 - t_52 - 1);
frame.set("loop.first", t_52 === 0);
frame.set("loop.last", t_52 === t_53 - 1);
frame.set("loop.length", t_53);
output += runtime.suppressValue(runtime.memberLookup((t_55),0) + 1, env.opts.autoescape);
output += " ";
output += runtime.suppressValue(runtime.memberLookup((t_55),1) + 1, env.opts.autoescape);
output += " ";
output += runtime.suppressValue(runtime.memberLookup((t_55),2), env.opts.autoescape);
output += "\r\n";
;
}
}
frame = frame.pop();
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_comments(env, context, frame, runtime, cb) {
var lineno = 27;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
output += "\r\n//! Annotation of model variables\r\n\r\n//! Literature cited\r\n\r\n//! Description of experimental data presented in .DAT files\r\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_iv(env, context, frame, runtime, cb) {
var lineno = 35;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
output += "\r\n";
var t_56;
t_56 = (lineno = 36, colno = 55, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"population")),"selectByClassName"), "_model_[\"population\"][\"selectByClassName\"]", context, ["Const"]));
frame.set("constants", t_56, true);
if(frame.topLevel) {
context.setVariable("constants", t_56);
}
if(frame.topLevel) {
context.addExport("constants", t_56);
}
output += "\r\n//! Constants, count: ";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "constants")), env.opts.autoescape);
frame = frame.push();
var t_59 = runtime.contextOrFrameLookup(context, frame, "constants");
if(t_59) {t_59 = runtime.fromIterator(t_59);
var t_58 = t_59.length;
for(var t_57=0; t_57 < t_59.length; t_57++) {
var t_60 = t_59[t_57];
frame.set("con", t_60);
frame.set("loop.index", t_57 + 1);
frame.set("loop.index0", t_57);
frame.set("loop.revindex", t_58 - t_57);
frame.set("loop.revindex0", t_58 - t_57 - 1);
frame.set("loop.first", t_57 === 0);
frame.set("loop.last", t_57 === t_58 - 1);
frame.set("loop.length", t_58);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_60),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_60),"num"), env.opts.autoescape);
output += "; // @";
output += runtime.suppressValue(runtime.memberLookup((t_60),"className"), env.opts.autoescape);
output += " ";
output += runtime.suppressValue((runtime.memberLookup((t_60),"title")?"'" + runtime.memberLookup((t_60),"title") + "'":""), env.opts.autoescape);
output += " {units: ";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((t_60),"units"),"?"), env.opts.autoescape);
output += "};";
;
}
}
if (!t_58) {
output += "// nothing here\r\n";
}
frame = frame.pop();
output += "\r\n";
var t_61;
t_61 = env.getFilter("exclude2").call(context, (lineno = 42, colno = 46, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"population")),"toArray"), "_model_[\"population\"][\"toArray\"]", context, [])),"assignments.start_.num",runtime.contextOrFrameLookup(context, frame, "undefined"));
frame.set("ivElements", t_61, true);
if(frame.topLevel) {
context.setVariable("ivElements", t_61);
}
if(frame.topLevel) {
context.addExport("ivElements", t_61);
}
output += "\r\n//! Initialization at start, count: ";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "ivElements")) + 1, env.opts.autoescape);
frame = frame.push();
var t_64 = runtime.contextOrFrameLookup(context, frame, "ivElements");
if(t_64) {t_64 = runtime.fromIterator(t_64);
var t_63 = t_64.length;
for(var t_62=0; t_62 < t_64.length; t_62++) {
var t_65 = t_64[t_62];
frame.set("number", t_65);
frame.set("loop.index", t_62 + 1);
frame.set("loop.index0", t_62);
frame.set("loop.revindex", t_63 - t_62);
frame.set("loop.revindex0", t_63 - t_62 - 1);
frame.set("loop.first", t_62 === 0);
frame.set("loop.last", t_62 === t_63 - 1);
frame.set("loop.length", t_63);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_65),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_65),"assignments")),"start_")),"num"), env.opts.autoescape);
output += "; // @";
output += runtime.suppressValue(runtime.memberLookup((t_65),"className"), env.opts.autoescape);
output += " ";
output += runtime.suppressValue((runtime.memberLookup((t_65),"title")?"'" + runtime.memberLookup((t_65),"title") + "'":""), env.opts.autoescape);
output += " {units: ";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((t_65),"units"),"?"), env.opts.autoescape);
output += "}";
;
}
}
if (!t_63) {
output += "// nothing here\r\n";
}
frame = frame.pop();
output += "\r\ndefault_compartment_ = 1; // {units: UL} This is fake compartment to support compounds without compartment.\r\n";
var t_66;
t_66 = (lineno = 49, colno = 55, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"population")),"selectByClassName"), "_model_[\"population\"][\"selectByClassName\"]", context, ["TimeSwitcher"]));
frame.set("switchers", t_66, true);
if(frame.topLevel) {
context.setVariable("switchers", t_66);
}
if(frame.topLevel) {
context.addExport("switchers", t_66);
}
output += "\r\n";
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "switchers")) > 0) {
output += "\r\n//! Switchers for time events, count ";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "switchers")), env.opts.autoescape);
output += "\r\n";
frame = frame.push();
var t_69 = runtime.contextOrFrameLookup(context, frame, "switchers");
if(t_69) {t_69 = runtime.fromIterator(t_69);
var t_68 = t_69.length;
for(var t_67=0; t_67 < t_69.length; t_67++) {
var t_70 = t_69[t_67];
frame.set("switcher", t_70);
frame.set("loop.index", t_67 + 1);
frame.set("loop.index0", t_67);
frame.set("loop.revindex", t_68 - t_67);
frame.set("loop.revindex0", t_68 - t_67 - 1);
frame.set("loop.first", t_67 === 0);
frame.set("loop.last", t_67 === t_68 - 1);
frame.set("loop.length", t_68);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += "_ = 1; // @TimeSwitcher {  }\r\n";
;
}
}
frame = frame.pop();
output += "\r\n";
;
}
output += "\r\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_rhs(env, context, frame, runtime, cb) {
var lineno = 63;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
output += "\r\n//! Pools\r\n// Pools are never generated by Heta compiler\r\n";
var t_71;
t_71 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"rhs");
frame.set("rhsElements", t_71, true);
if(frame.topLevel) {
context.setVariable("rhsElements", t_71);
}
if(frame.topLevel) {
context.addExport("rhsElements", t_71);
}
output += "\r\n//! Initialization at ode, count: ";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "rhsElements")), env.opts.autoescape);
output += "\r\n";
frame = frame.push();
var t_74 = runtime.contextOrFrameLookup(context, frame, "rhsElements");
if(t_74) {t_74 = runtime.fromIterator(t_74);
var t_73 = t_74.length;
for(var t_72=0; t_72 < t_74.length; t_72++) {
var t_75 = t_74[t_72];
frame.set("rule", t_75);
frame.set("loop.index", t_72 + 1);
frame.set("loop.index0", t_72);
frame.set("loop.revindex", t_73 - t_72);
frame.set("loop.revindex0", t_73 - t_72 - 1);
frame.set("loop.first", t_72 === 0);
frame.set("loop.last", t_72 === t_73 - 1);
frame.set("loop.length", t_73);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_75),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 69, colno = 52, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_75),"assignments")),"ode_")),"toSLVString"), "rule[\"assignments\"][\"ode_\"][\"toSLVString\"]", context, [runtime.contextOrFrameLookup(context, frame, "powTransform")])), env.opts.autoescape);
output += "; // @";
output += runtime.suppressValue(runtime.memberLookup((t_75),"className"), env.opts.autoescape);
output += " ";
output += runtime.suppressValue((runtime.memberLookup((t_75),"title")?"'" + runtime.memberLookup((t_75),"title") + "'":""), env.opts.autoescape);
output += " {units: ";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((t_75),"units"),"?"), env.opts.autoescape);
output += "}\r\n";
;
}
}
if (!t_73) {
output += "// nothing here\r\n";
}
frame = frame.pop();
output += "\r\n//! Differential equations, count: ";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
output += "\r\n";
frame = frame.push();
var t_78 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_78) {t_78 = runtime.fromIterator(t_78);
var t_77 = t_78.length;
for(var t_76=0; t_76 < t_78.length; t_76++) {
var t_79 = t_78[t_76];
frame.set("dynamic", t_79);
frame.set("loop.index", t_76 + 1);
frame.set("loop.index0", t_76);
frame.set("loop.revindex", t_77 - t_76);
frame.set("loop.revindex0", t_77 - t_76 - 1);
frame.set("loop.first", t_76 === 0);
frame.set("loop.last", t_76 === t_77 - 1);
frame.set("loop.length", t_77);
output += "\r\n//!! ";
output += runtime.suppressValue(runtime.memberLookup((t_79),"id"), env.opts.autoescape);
output += "  @";
output += runtime.suppressValue(runtime.memberLookup((t_79),"className"), env.opts.autoescape);
output += " ";
output += runtime.suppressValue((runtime.memberLookup((t_79),"title")?"'" + runtime.memberLookup((t_79),"title") + "'":""), env.opts.autoescape);
output += " {units: ";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((t_79),"units"),"?"), env.opts.autoescape);
output += "}\r\n";
if(runtime.memberLookup((t_79),"className") !== "Species" || runtime.memberLookup((t_79),"isAmount")) {
output += "\r\nF[";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"index"), env.opts.autoescape);
output += "] = ";
output += runtime.suppressValue((lineno = 76, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "diff"), "diff", context, [runtime.memberLookup((t_79),"backReferences")])), env.opts.autoescape);
output += ";\r\n";
;
}
else {
output += "\r\nF[";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"index"), env.opts.autoescape);
output += "] = ( ";
output += runtime.suppressValue((lineno = 78, colno = 31, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "diff"), "diff", context, [runtime.memberLookup((t_79),"backReferences")])), env.opts.autoescape);
output += " ) / ";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((t_79),"compartment"),"default_compartment_"), env.opts.autoescape);
output += ";\r\n";
;
}
output += "\r\n";
;
}
}
frame = frame.pop();
output += "\r\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_ifelseStatics: b_ifelseStatics,
b_outputVars: b_outputVars,
b_events: b_events,
b_reactionNames: b_reactionNames,
b_compoundNames: b_compoundNames,
b_sm: b_sm,
b_comments: b_comments,
b_iv: b_iv,
b_rhs: b_rhs,
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["fun.m"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "classdef fun\r\n% collection of static methods\r\n% representing additional functions for qsp-mp\r\n    methods (Static)\r\n        function out = ifg0(x, y1, y2)\r\n            if x > 0\r\n                out = y1;\r\n            else\r\n                out = y2;\r\n            end\r\n        end\r\n        function out = ifge0(x, y1, y2)\r\n            if x >= 0\r\n                out = y1;\r\n            else\r\n                out = y2;\r\n            end\r\n        end\r\n        function out = ife0(x, y1, y2)\r\n            if x == 0\r\n                out = y1;\r\n            else\r\n                out = y2;\r\n            end\r\n        end\r\n    end\r\nend\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["init.m.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
var macro_t_1 = runtime.makeMacro(
["component"], 
[], 
function (l_component, kwargs) {
var callerFrame = frame;
frame = new runtime.Frame();
kwargs = kwargs || {};
if (Object.prototype.hasOwnProperty.call(kwargs, "caller")) {
frame.set("caller", kwargs.caller); }
frame.set("component", l_component);
var t_2 = "";if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "translator")),"symbolName")),runtime.memberLookup((l_component),"id"))) {
t_2 += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "translator")),"symbolName")),runtime.memberLookup((l_component),"id")), env.opts.autoescape);
;
}
else {
t_2 += runtime.suppressValue(runtime.memberLookup((l_component),"id"), env.opts.autoescape);
;
}
;
frame = callerFrame;
return new runtime.SafeString(t_2);
});
context.addExport("idOrSynonim");
context.setVariable("idOrSynonim", macro_t_1);
output += "%%%% This code was generated by ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "builderName"), env.opts.autoescape);
output += "\r\n% ";
output += runtime.suppressValue((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title")?runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title") + ".":""), env.opts.autoescape);
output += "\r\n\r\nfunction y = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"id"), env.opts.autoescape);
output += "_Init(p)\r\n\r\ny = zeros(";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "dynamicRecords")), env.opts.autoescape);
output += ", 1);\r\n\r\n%%% Initialization of dynamic records";
frame = frame.push();
var t_5 = runtime.contextOrFrameLookup(context, frame, "initRecords");
if(t_5) {t_5 = runtime.fromIterator(t_5);
var t_4 = t_5.length;
for(var t_3=0; t_3 < t_5.length; t_3++) {
var t_6 = t_5[t_3];
frame.set("record", t_6);
frame.set("loop.index", t_3 + 1);
frame.set("loop.index0", t_3);
frame.set("loop.revindex", t_4 - t_3);
frame.set("loop.revindex0", t_4 - t_3 - 1);
frame.set("loop.first", t_3 === 0);
frame.set("loop.last", t_3 === t_4 - 1);
frame.set("loop.length", t_4);
output += "\r\n";
if((lineno = 17, colno = 23, runtime.callWrap(runtime.memberLookup((t_6),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && !runtime.memberLookup((t_6),"isAmount") && !runtime.memberLookup((t_6),"isRule")) {
output += runtime.suppressValue((lineno = 18, colno = 14, runtime.callWrap(macro_t_1, "idOrSynonim", context, [t_6])), env.opts.autoescape);
output += " = (";
output += runtime.suppressValue((lineno = 18, colno = 99, runtime.callWrap(runtime.memberLookup(((lineno = 18, colno = 72, runtime.callWrap(runtime.memberLookup(((lineno = 18, colno = 52, runtime.callWrap(runtime.memberLookup((t_6),"getAssignment"), "record[\"getAssignment\"]", context, ["start_"]))),"translate"), "the return value of (record[\"getAssignment\"])[\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "translator")]))),"toMatlabString"), "the return value of (the return value of (record[\"getAssignment\"])[\"translate\"])[\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += ") * ";
output += runtime.suppressValue((lineno = 18, colno = 122, runtime.callWrap(macro_t_1, "idOrSynonim", context, [runtime.memberLookup((t_6),"compartmentObj")])), env.opts.autoescape);
output += "; % ";
output += runtime.suppressValue(runtime.memberLookup((t_6),"id"), env.opts.autoescape);
output += ", ";
output += runtime.suppressValue(runtime.memberLookup((t_6),"title"), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((t_6),"units"), env.opts.autoescape);
output += ")";
;
}
else {
output += runtime.suppressValue((lineno = 20, colno = 14, runtime.callWrap(macro_t_1, "idOrSynonim", context, [t_6])), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 20, colno = 98, runtime.callWrap(runtime.memberLookup(((lineno = 20, colno = 71, runtime.callWrap(runtime.memberLookup(((lineno = 20, colno = 51, runtime.callWrap(runtime.memberLookup((t_6),"getAssignment"), "record[\"getAssignment\"]", context, ["start_"]))),"translate"), "the return value of (record[\"getAssignment\"])[\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "translator")]))),"toMatlabString"), "the return value of (the return value of (record[\"getAssignment\"])[\"translate\"])[\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += "; % ";
output += runtime.suppressValue(runtime.memberLookup((t_6),"id"), env.opts.autoescape);
output += ", ";
output += runtime.suppressValue(runtime.memberLookup((t_6),"title"), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((t_6),"units"), env.opts.autoescape);
output += ")";
;
}
;
}
}
frame = frame.pop();
output += "\r\n\r\nend\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["model.cpp.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "$PROB\r\n# Model: `";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += "`\r\n  - Title: ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.opts.autoescape);
output += "\r\n  - Notes: ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "notes"), env.opts.autoescape);
output += "\r\n  - Source: Generated automatically from platform with Heta compiler\r\n\r\n# Demo\r\n```{r,echo=TRUE}\r\n  ev(amt=10) %>% mrgsim %>% plot\r\n```\r\n\r\n$SET end=";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "method")),"timeRange")),1),120), env.opts.autoescape);
output += ", delta=";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "method")),"dt"),0.1), env.opts.autoescape);
output += ", hmax=";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "method")),"dtmax"),0.01), env.opts.autoescape);
output += ", hmin=";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "method")),"dtmin"),0), env.opts.autoescape);
output += ", rtol=";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "method")),"reltol"),"1e-3"), env.opts.autoescape);
output += ", atol=";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "method")),"abstol"),"1e-6"), env.opts.autoescape);
output += "\r\n\r\n$PARAM @annotated";
frame = frame.push();
var t_3 = (lineno = 14, colno = 56, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"population")),"selectByClassName"), "_model_[\"population\"][\"selectByClassName\"]", context, ["Const"]));
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("constant", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\r\n// @";
output += runtime.suppressValue(runtime.memberLookup((t_4),"className"), env.opts.autoescape);
output += " '";
output += runtime.suppressValue(runtime.memberLookup((t_4),"title"), env.opts.autoescape);
output += "'\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_4),"id"), env.opts.autoescape);
output += " : ";
output += runtime.suppressValue(runtime.memberLookup((t_4),"num"), env.opts.autoescape);
output += " : ";
if(runtime.memberLookup((t_4),"units")) {
output += "(";
output += runtime.suppressValue(runtime.memberLookup((t_4),"units"), env.opts.autoescape);
output += ")";
;
}
;
}
}
frame = frame.pop();
output += "\r\n\r\n$CMT @annotated";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"dynamics");
if(t_7) {t_7 = runtime.fromIterator(t_7);
var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("record", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\r\n// @";
output += runtime.suppressValue(runtime.memberLookup((t_8),"className"), env.opts.autoescape);
output += " '";
output += runtime.suppressValue(runtime.memberLookup((t_8),"title"), env.opts.autoescape);
output += "'\r\n";
if(runtime.memberLookup((t_8),"className") == "Species" && !runtime.memberLookup((t_8),"isAmount")) {
output += runtime.suppressValue(runtime.memberLookup((t_8),"id"), env.opts.autoescape);
output += "_amt_ : as amount";
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((t_8),"id"), env.opts.autoescape);
output += " : amount";
;
}
;
}
}
frame = frame.pop();
output += "\r\n\r\n$GLOBAL";
frame = frame.push();
var t_11 = env.getFilter("exclude2").call(context, env.getFilter("filter2").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"dynamics"),"className","Species"),"isAmount",true);
if(t_11) {t_11 = runtime.fromIterator(t_11);
var t_10 = t_11.length;
for(var t_9=0; t_9 < t_11.length; t_9++) {
var t_12 = t_11[t_9];
frame.set("variable", t_12);
frame.set("loop.index", t_9 + 1);
frame.set("loop.index0", t_9);
frame.set("loop.revindex", t_10 - t_9);
frame.set("loop.revindex0", t_10 - t_9 - 1);
frame.set("loop.first", t_9 === 0);
frame.set("loop.last", t_9 === t_10 - 1);
frame.set("loop.length", t_10);
output += "\r\n#define ";
output += runtime.suppressValue(runtime.memberLookup((t_12),"id"), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((t_12),"id"), env.opts.autoescape);
output += "_amt_ / ";
output += runtime.suppressValue(runtime.memberLookup((t_12),"compartment"), env.opts.autoescape);
output += ")";
;
}
}
frame = frame.pop();
output += "\r\n\r\n$PREAMBLE";
frame = frame.push();
var t_15 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"start_");
if(t_15) {t_15 = runtime.fromIterator(t_15);
var t_14 = t_15.length;
for(var t_13=0; t_13 < t_15.length; t_13++) {
var t_16 = t_15[t_13];
frame.set("record", t_16);
frame.set("loop.index", t_13 + 1);
frame.set("loop.index0", t_13);
frame.set("loop.revindex", t_14 - t_13);
frame.set("loop.revindex0", t_14 - t_13 - 1);
frame.set("loop.first", t_13 === 0);
frame.set("loop.last", t_13 === t_14 - 1);
frame.set("loop.length", t_14);
output += "\r\n";
output += runtime.suppressValue((runtime.memberLookup((t_16),"isDynamic")?"//":""), env.opts.autoescape);
output += "double ";
output += runtime.suppressValue(runtime.memberLookup((t_16),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 36, colno = 93, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_16),"assignments")),"start_")),"toCString"), "record[\"assignments\"][\"start_\"][\"toCString\"]", context, [])), env.opts.autoescape);
output += ";";
;
}
}
frame = frame.pop();
output += "\r\n\r\n$MAIN";
frame = frame.push();
var t_19 = env.getFilter("filter2").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"start_"),"isDynamic",true);
if(t_19) {t_19 = runtime.fromIterator(t_19);
var t_18 = t_19.length;
for(var t_17=0; t_17 < t_19.length; t_17++) {
var t_20 = t_19[t_17];
frame.set("variable", t_20);
frame.set("loop.index", t_17 + 1);
frame.set("loop.index0", t_17);
frame.set("loop.revindex", t_18 - t_17);
frame.set("loop.revindex0", t_18 - t_17 - 1);
frame.set("loop.first", t_17 === 0);
frame.set("loop.last", t_17 === t_18 - 1);
frame.set("loop.length", t_18);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_20),"id"), env.opts.autoescape);
output += runtime.suppressValue(((runtime.memberLookup((t_20),"className") === "Species" && !runtime.memberLookup((t_20),"isAmount"))?"_amt_":""), env.opts.autoescape);
output += "_0 = (";
output += runtime.suppressValue((lineno = 41, colno = 139, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_20),"assignments")),"start_")),"toCString"), "variable[\"assignments\"][\"start_\"][\"toCString\"]", context, [])), env.opts.autoescape);
output += ")";
if(runtime.memberLookup((t_20),"className") === "Species" && !runtime.memberLookup((t_20),"isAmount")) {
output += " * ";
output += runtime.suppressValue(runtime.memberLookup((t_20),"compartment"), env.opts.autoescape);
;
}
output += ";";
;
}
}
frame = frame.pop();
output += "\r\n\r\n$ODE";
frame = frame.push();
var t_23 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"ode_");
if(t_23) {t_23 = runtime.fromIterator(t_23);
var t_22 = t_23.length;
for(var t_21=0; t_21 < t_23.length; t_21++) {
var t_24 = t_23[t_21];
frame.set("record", t_24);
frame.set("loop.index", t_21 + 1);
frame.set("loop.index0", t_21);
frame.set("loop.revindex", t_22 - t_21);
frame.set("loop.revindex0", t_22 - t_21 - 1);
frame.set("loop.first", t_21 === 0);
frame.set("loop.last", t_21 === t_22 - 1);
frame.set("loop.length", t_22);
output += "\r\n// @";
output += runtime.suppressValue(runtime.memberLookup((t_24),"className"), env.opts.autoescape);
output += " '";
output += runtime.suppressValue(runtime.memberLookup((t_24),"title"), env.opts.autoescape);
output += "'\r\n";
output += runtime.suppressValue((!runtime.memberLookup((runtime.memberLookup((t_24),"assignments")),"start_")?"double ":""), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((t_24),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 47, colno = 103, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_24),"assignments")),"ode_")),"toCString"), "record[\"assignments\"][\"ode_\"][\"toCString\"]", context, [])), env.opts.autoescape);
output += ";";
;
}
}
frame = frame.pop();
output += "\r\n";
frame = frame.push();
var t_27 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"dynamics");
if(t_27) {t_27 = runtime.fromIterator(t_27);
var t_26 = t_27.length;
for(var t_25=0; t_25 < t_27.length; t_25++) {
var t_28 = t_27[t_25];
frame.set("variable", t_28);
frame.set("loop.index", t_25 + 1);
frame.set("loop.index0", t_25);
frame.set("loop.revindex", t_26 - t_25);
frame.set("loop.revindex0", t_26 - t_25 - 1);
frame.set("loop.first", t_25 === 0);
frame.set("loop.last", t_25 === t_26 - 1);
frame.set("loop.length", t_26);
output += "\r\ndxdt_";
output += runtime.suppressValue(runtime.memberLookup((t_28),"id"), env.opts.autoescape);
output += runtime.suppressValue((runtime.memberLookup((t_28),"className") === "Species" && !runtime.memberLookup((t_28),"isAmount")?"_amt_":""), env.opts.autoescape);
output += " =";
frame = frame.push();
var t_31 = env.getFilter("exclude2").call(context, runtime.memberLookup((t_28),"backReferences"),"stoichiometry",runtime.contextOrFrameLookup(context, frame, "undefined"));
if(t_31) {t_31 = runtime.fromIterator(t_31);
var t_30 = t_31.length;
for(var t_29=0; t_29 < t_31.length; t_29++) {
var t_32 = t_31[t_29];
frame.set("item", t_32);
frame.set("loop.index", t_29 + 1);
frame.set("loop.index0", t_29);
frame.set("loop.revindex", t_30 - t_29);
frame.set("loop.revindex0", t_30 - t_29 - 1);
frame.set("loop.first", t_29 === 0);
frame.set("loop.last", t_29 === t_30 - 1);
frame.set("loop.length", t_30);
output += " ";
output += runtime.suppressValue((!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"first")?"+ ":""), env.opts.autoescape);
output += "(";
output += runtime.suppressValue(runtime.memberLookup((t_32),"stoichiometry"), env.opts.autoescape);
output += ")*";
output += runtime.suppressValue(runtime.memberLookup((t_32),"process"), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += ";";
;
}
}
frame = frame.pop();
output += "\r\n\r\n$CAPTURE @annotated";
frame = frame.push();
var t_35 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"output");
if(t_35) {t_35 = runtime.fromIterator(t_35);
var t_34 = t_35.length;
for(var t_33=0; t_33 < t_35.length; t_33++) {
var t_36 = t_35[t_33];
frame.set("record", t_36);
frame.set("loop.index", t_33 + 1);
frame.set("loop.index0", t_33);
frame.set("loop.revindex", t_34 - t_33);
frame.set("loop.revindex0", t_34 - t_33 - 1);
frame.set("loop.first", t_33 === 0);
frame.set("loop.last", t_33 === t_34 - 1);
frame.set("loop.length", t_34);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_36),"id"), env.opts.autoescape);
output += " : ";
output += runtime.suppressValue(runtime.memberLookup((t_36),"title"), env.opts.autoescape);
output += " ";
if(runtime.memberLookup((t_36),"units")) {
output += "(";
output += runtime.suppressValue(runtime.memberLookup((t_36),"units"), env.opts.autoescape);
output += ")";
;
}
;
}
}
frame = frame.pop();
output += "\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["model.jl.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
var macro_t_1 = runtime.makeMacro(
["component"], 
[], 
function (l_component, kwargs) {
var callerFrame = frame;
frame = new runtime.Frame();
kwargs = kwargs || {};
if (Object.prototype.hasOwnProperty.call(kwargs, "caller")) {
frame.set("caller", kwargs.caller); }
frame.set("component", l_component);
var t_2 = "";if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "yTranslator")),"symbolName")),runtime.memberLookup((l_component),"id"))) {
t_2 += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "yTranslator")),"symbolName")),runtime.memberLookup((l_component),"id")), env.opts.autoescape);
;
}
else {
t_2 += runtime.suppressValue(runtime.memberLookup((l_component),"id"), env.opts.autoescape);
;
}
;
frame = callerFrame;
return new runtime.SafeString(t_2);
});
context.addExport("idOrSynonim");
context.setVariable("idOrSynonim", macro_t_1);
output += "#= \r\n    This code was generated by ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "builderName"), env.opts.autoescape);
output += "\r\n    ";
output += runtime.suppressValue((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title")?runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title") + ".":""), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"notes"), env.opts.autoescape);
output += "\r\n=#\r\n\r\nmodule ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"id"), env.opts.autoescape);
output += "\r\nusing SimSolver\r\n\r\n### create default constants\r\nconstants_ = NamedTuple{(\r\n  ";
frame = frame.push();
var t_5 = runtime.contextOrFrameLookup(context, frame, "constants");
if(t_5) {t_5 = runtime.fromIterator(t_5);
var t_4 = t_5.length;
for(var t_3=0; t_3 < t_5.length; t_3++) {
var t_6 = t_5[t_3];
frame.set("con", t_6);
frame.set("loop.index", t_3 + 1);
frame.set("loop.index0", t_3);
frame.set("loop.revindex", t_4 - t_3);
frame.set("loop.revindex0", t_4 - t_3 - 1);
frame.set("loop.first", t_3 === 0);
frame.set("loop.last", t_3 === t_4 - 1);
frame.set("loop.length", t_4);
output += ":";
output += runtime.suppressValue(runtime.memberLookup((t_6),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += "\r\n)}(Float64[\r\n  ";
frame = frame.push();
var t_9 = runtime.contextOrFrameLookup(context, frame, "constants");
if(t_9) {t_9 = runtime.fromIterator(t_9);
var t_8 = t_9.length;
for(var t_7=0; t_7 < t_9.length; t_7++) {
var t_10 = t_9[t_7];
frame.set("con", t_10);
frame.set("loop.index", t_7 + 1);
frame.set("loop.index0", t_7);
frame.set("loop.revindex", t_8 - t_7);
frame.set("loop.revindex0", t_8 - t_7 - 1);
frame.set("loop.first", t_7 === 0);
frame.set("loop.last", t_7 === t_8 - 1);
frame.set("loop.length", t_8);
output += runtime.suppressValue(runtime.memberLookup((t_10),"num"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += "\r\n])\r\n\r\n### initialization of ODE variables and Records\r\nfunction start_(cons)\r\n    #(";
frame = frame.push();
var t_13 = runtime.contextOrFrameLookup(context, frame, "constants");
if(t_13) {t_13 = runtime.fromIterator(t_13);
var t_12 = t_13.length;
for(var t_11=0; t_11 < t_13.length; t_11++) {
var t_14 = t_13[t_11];
frame.set("con", t_14);
frame.set("loop.index", t_11 + 1);
frame.set("loop.index0", t_11);
frame.set("loop.revindex", t_12 - t_11);
frame.set("loop.revindex0", t_12 - t_11 - 1);
frame.set("loop.first", t_11 === 0);
frame.set("loop.last", t_11 === t_12 - 1);
frame.set("loop.length", t_12);
output += runtime.suppressValue(runtime.memberLookup((t_14),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += ") = cons\r\n\r\n    # Heta initialize\r\n    t = 0.0 # initial time\r\n    ";
frame = frame.push();
var t_17 = runtime.contextOrFrameLookup(context, frame, "initRecords");
if(t_17) {t_17 = runtime.fromIterator(t_17);
var t_16 = t_17.length;
for(var t_15=0; t_15 < t_17.length; t_15++) {
var t_18 = t_17[t_15];
frame.set("record", t_18);
frame.set("loop.index", t_15 + 1);
frame.set("loop.index0", t_15);
frame.set("loop.revindex", t_16 - t_15);
frame.set("loop.revindex0", t_16 - t_15 - 1);
frame.set("loop.first", t_15 === 0);
frame.set("loop.last", t_15 === t_16 - 1);
frame.set("loop.length", t_16);
if(env.getTest("defined").call(context, (lineno = 44, colno = 30, runtime.callWrap(runtime.memberLookup((t_18),"getAssignment"), "record[\"getAssignment\"]", context, ["start_"]))) === true) {
output += runtime.suppressValue(runtime.memberLookup((t_18),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 45, colno = 92, runtime.callWrap(runtime.memberLookup(((lineno = 45, colno = 65, runtime.callWrap(runtime.memberLookup(((lineno = 45, colno = 45, runtime.callWrap(runtime.memberLookup((t_18),"getAssignment"), "record[\"getAssignment\"]", context, ["start_"]))),"translate"), "the return value of (record[\"getAssignment\"])[\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toJuliaString"), "the return value of (the return value of (record[\"getAssignment\"])[\"translate\"])[\"toJuliaString\"]", context, [])), env.opts.autoescape);
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((t_18),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 47, colno = 90, runtime.callWrap(runtime.memberLookup(((lineno = 47, colno = 63, runtime.callWrap(runtime.memberLookup(((lineno = 47, colno = 45, runtime.callWrap(runtime.memberLookup((t_18),"getAssignment"), "record[\"getAssignment\"]", context, ["ode_"]))),"translate"), "the return value of (record[\"getAssignment\"])[\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toJuliaString"), "the return value of (the return value of (record[\"getAssignment\"])[\"translate\"])[\"toJuliaString\"]", context, [])), env.opts.autoescape);
;
}
output += "\r\n    ";
;
}
}
frame = frame.pop();
output += "\r\n    # save results\r\n\r\n    return (";
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "dynamicRecords")) > 0) {
output += "\r\n        [";
frame = frame.push();
var t_21 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_21) {t_21 = runtime.fromIterator(t_21);
var t_20 = t_21.length;
for(var t_19=0; t_19 < t_21.length; t_19++) {
var t_22 = t_21[t_19];
frame.set("record", t_22);
frame.set("loop.index", t_19 + 1);
frame.set("loop.index0", t_19);
frame.set("loop.revindex", t_20 - t_19);
frame.set("loop.revindex0", t_20 - t_19 - 1);
frame.set("loop.first", t_19 === 0);
frame.set("loop.last", t_19 === t_20 - 1);
frame.set("loop.length", t_20);
if((lineno = 56, colno = 32, runtime.callWrap(runtime.memberLookup((t_22),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && !runtime.memberLookup((t_22),"isAmount") && !runtime.memberLookup((t_22),"isRule")) {
output += "\r\n            ";
output += runtime.suppressValue(runtime.memberLookup((t_22),"id"), env.opts.autoescape);
output += " * ";
output += runtime.suppressValue(runtime.memberLookup((t_22),"compartment"), env.opts.autoescape);
output += ",";
;
}
else {
output += "\r\n            ";
output += runtime.suppressValue(runtime.memberLookup((t_22),"id"), env.opts.autoescape);
output += ",";
;
}
;
}
}
frame = frame.pop();
output += "\r\n        ],\r\n        ";
;
}
else {
output += "\r\n        [ 0.0 ], # init for fake variable";
;
}
output += "\r\n        [";
frame = frame.push();
var t_25 = runtime.contextOrFrameLookup(context, frame, "staticRecords");
if(t_25) {t_25 = runtime.fromIterator(t_25);
var t_24 = t_25.length;
for(var t_23=0; t_23 < t_25.length; t_23++) {
var t_26 = t_25[t_23];
frame.set("record", t_26);
frame.set("loop.index", t_23 + 1);
frame.set("loop.index0", t_23);
frame.set("loop.revindex", t_24 - t_23);
frame.set("loop.revindex0", t_24 - t_23 - 1);
frame.set("loop.first", t_23 === 0);
frame.set("loop.last", t_23 === t_24 - 1);
frame.set("loop.length", t_24);
output += "\r\n            ";
output += runtime.suppressValue(runtime.memberLookup((t_26),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += "\r\n        ]\r\n    )\r\nend\r\n\r\n### calculate RHS of ODE\r\nfunction ode_(du, u, p, t)\r\n    cons = p.constants\r\n    (";
frame = frame.push();
var t_29 = runtime.contextOrFrameLookup(context, frame, "staticRecords");
if(t_29) {t_29 = runtime.fromIterator(t_29);
var t_28 = t_29.length;
for(var t_27=0; t_27 < t_29.length; t_27++) {
var t_30 = t_29[t_27];
frame.set("record", t_30);
frame.set("loop.index", t_27 + 1);
frame.set("loop.index0", t_27);
frame.set("loop.revindex", t_28 - t_27);
frame.set("loop.revindex0", t_28 - t_27 - 1);
frame.set("loop.first", t_27 === 0);
frame.set("loop.last", t_27 === t_28 - 1);
frame.set("loop.length", t_28);
output += runtime.suppressValue(runtime.memberLookup((t_30),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += ") = p.static\r\n    (";
frame = frame.push();
var t_33 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_33) {t_33 = runtime.fromIterator(t_33);
var t_32 = t_33.length;
for(var t_31=0; t_31 < t_33.length; t_31++) {
var t_34 = t_33[t_31];
frame.set("record", t_34);
frame.set("loop.index", t_31 + 1);
frame.set("loop.index0", t_31);
frame.set("loop.revindex", t_32 - t_31);
frame.set("loop.revindex0", t_32 - t_31 - 1);
frame.set("loop.first", t_31 === 0);
frame.set("loop.last", t_31 === t_32 - 1);
frame.set("loop.length", t_32);
output += runtime.suppressValue(runtime.memberLookup((t_34),"id"), env.opts.autoescape);
output += "_,";
;
}
}
frame = frame.pop();
output += ") = u ";
output += "\r\n\r\n    # Heta rules\r\n    ";
frame = frame.push();
var t_37 = runtime.contextOrFrameLookup(context, frame, "ruleRecords");
if(t_37) {t_37 = runtime.fromIterator(t_37);
var t_36 = t_37.length;
for(var t_35=0; t_35 < t_37.length; t_35++) {
var t_38 = t_37[t_35];
frame.set("record", t_38);
frame.set("loop.index", t_35 + 1);
frame.set("loop.index0", t_35);
frame.set("loop.revindex", t_36 - t_35);
frame.set("loop.revindex0", t_36 - t_35 - 1);
frame.set("loop.first", t_35 === 0);
frame.set("loop.last", t_35 === t_36 - 1);
frame.set("loop.length", t_36);
if(runtime.memberLookup((t_38),"isRule")) {
output += runtime.suppressValue(runtime.memberLookup((t_38),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 87, colno = 85, runtime.callWrap(runtime.memberLookup(((lineno = 87, colno = 58, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_38),"assignments")),"ode_")),"translate"), "record[\"assignments\"][\"ode_\"][\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toJuliaString"), "the return value of (record[\"assignments\"][\"ode_\"][\"translate\"])[\"toJuliaString\"]", context, [])), env.opts.autoescape);
output += "\r\n    ";
;
}
else {
if((lineno = 88, colno = 29, runtime.callWrap(runtime.memberLookup((t_38),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && runtime.memberLookup((t_38),"isDynamic") && !runtime.memberLookup((t_38),"isAmount")) {
output += runtime.suppressValue(runtime.memberLookup((t_38),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_38),"id"), env.opts.autoescape);
output += "_ / ";
output += runtime.suppressValue(runtime.memberLookup((t_38),"compartment"), env.opts.autoescape);
output += "\r\n    ";
;
}
else {
if(runtime.memberLookup((t_38),"isDynamic")) {
output += runtime.suppressValue(runtime.memberLookup((t_38),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_38),"id"), env.opts.autoescape);
output += "_\r\n    ";
;
}
;
}
;
}
;
}
}
frame = frame.pop();
output += "\r\n    #p.static .= [";
frame = frame.push();
var t_41 = runtime.contextOrFrameLookup(context, frame, "staticRecords");
if(t_41) {t_41 = runtime.fromIterator(t_41);
var t_40 = t_41.length;
for(var t_39=0; t_39 < t_41.length; t_39++) {
var t_42 = t_41[t_39];
frame.set("record", t_42);
frame.set("loop.index", t_39 + 1);
frame.set("loop.index0", t_39);
frame.set("loop.revindex", t_40 - t_39);
frame.set("loop.revindex0", t_40 - t_39 - 1);
frame.set("loop.first", t_39 === 0);
frame.set("loop.last", t_39 === t_40 - 1);
frame.set("loop.length", t_40);
output += runtime.suppressValue(runtime.memberLookup((t_42),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += "]";
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "dynamicRecords")) > 0) {
output += "\r\n    du .= [";
frame = frame.push();
var t_45 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_45) {t_45 = runtime.fromIterator(t_45);
var t_44 = t_45.length;
for(var t_43=0; t_43 < t_45.length; t_43++) {
var t_46 = t_45[t_43];
frame.set("record", t_46);
frame.set("loop.index", t_43 + 1);
frame.set("loop.index0", t_43);
frame.set("loop.revindex", t_44 - t_43);
frame.set("loop.revindex0", t_44 - t_43 - 1);
frame.set("loop.first", t_43 === 0);
frame.set("loop.last", t_43 === t_44 - 1);
frame.set("loop.length", t_44);
output += "\r\n      ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "rhs")),runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"index0")), env.opts.autoescape);
output += ",  # d";
output += runtime.suppressValue(runtime.memberLookup((t_46),"id"), env.opts.autoescape);
output += "_/dt";
;
}
}
frame = frame.pop();
output += "\r\n    ]";
;
}
else {
output += "\r\n    du .= [ 1.0 ] # RHS for fake variable";
;
}
output += "\r\nend\r\n\r\n### output function\r\nfunction make_saving_(outputIds::Vector{Symbol})\r\n    function saving_(u, t, integrator)\r\n        cons = integrator.p.constants\r\n        (";
frame = frame.push();
var t_49 = runtime.contextOrFrameLookup(context, frame, "staticRecords");
if(t_49) {t_49 = runtime.fromIterator(t_49);
var t_48 = t_49.length;
for(var t_47=0; t_47 < t_49.length; t_47++) {
var t_50 = t_49[t_47];
frame.set("record", t_50);
frame.set("loop.index", t_47 + 1);
frame.set("loop.index0", t_47);
frame.set("loop.revindex", t_48 - t_47);
frame.set("loop.revindex0", t_48 - t_47 - 1);
frame.set("loop.first", t_47 === 0);
frame.set("loop.last", t_47 === t_48 - 1);
frame.set("loop.length", t_48);
output += runtime.suppressValue(runtime.memberLookup((t_50),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += ") = integrator.p.static\r\n        (";
frame = frame.push();
var t_53 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_53) {t_53 = runtime.fromIterator(t_53);
var t_52 = t_53.length;
for(var t_51=0; t_51 < t_53.length; t_51++) {
var t_54 = t_53[t_51];
frame.set("record", t_54);
frame.set("loop.index", t_51 + 1);
frame.set("loop.index0", t_51);
frame.set("loop.revindex", t_52 - t_51);
frame.set("loop.revindex0", t_52 - t_51 - 1);
frame.set("loop.first", t_51 === 0);
frame.set("loop.last", t_51 === t_52 - 1);
frame.set("loop.length", t_52);
output += runtime.suppressValue(runtime.memberLookup((t_54),"id"), env.opts.autoescape);
output += "_,";
;
}
}
frame = frame.pop();
output += ") = u";
output += "\r\n\r\n        # Heta rules\r\n        ";
frame = frame.push();
var t_57 = runtime.contextOrFrameLookup(context, frame, "ruleRecords");
if(t_57) {t_57 = runtime.fromIterator(t_57);
var t_56 = t_57.length;
for(var t_55=0; t_55 < t_57.length; t_55++) {
var t_58 = t_57[t_55];
frame.set("record", t_58);
frame.set("loop.index", t_55 + 1);
frame.set("loop.index0", t_55);
frame.set("loop.revindex", t_56 - t_55);
frame.set("loop.revindex0", t_56 - t_55 - 1);
frame.set("loop.first", t_55 === 0);
frame.set("loop.last", t_55 === t_56 - 1);
frame.set("loop.length", t_56);
if(runtime.memberLookup((t_58),"isRule")) {
output += runtime.suppressValue(runtime.memberLookup((t_58),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 121, colno = 89, runtime.callWrap(runtime.memberLookup(((lineno = 121, colno = 62, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_58),"assignments")),"ode_")),"translate"), "record[\"assignments\"][\"ode_\"][\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toJuliaString"), "the return value of (record[\"assignments\"][\"ode_\"][\"translate\"])[\"toJuliaString\"]", context, [])), env.opts.autoescape);
output += "\r\n        ";
;
}
else {
if((lineno = 122, colno = 33, runtime.callWrap(runtime.memberLookup((t_58),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && runtime.memberLookup((t_58),"isDynamic") && !runtime.memberLookup((t_58),"isAmount")) {
output += runtime.suppressValue(runtime.memberLookup((t_58),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_58),"id"), env.opts.autoescape);
output += "_ / ";
output += runtime.suppressValue(runtime.memberLookup((t_58),"compartment"), env.opts.autoescape);
output += "\r\n        ";
;
}
else {
if(runtime.memberLookup((t_58),"isDynamic")) {
output += runtime.suppressValue(runtime.memberLookup((t_58),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_58),"id"), env.opts.autoescape);
output += "_\r\n        ";
;
}
;
}
;
}
;
}
}
frame = frame.pop();
output += "\r\n        # calculate amounts";
frame = frame.push();
var t_61 = runtime.contextOrFrameLookup(context, frame, "notDynamicRecords");
if(t_61) {t_61 = runtime.fromIterator(t_61);
var t_60 = t_61.length;
for(var t_59=0; t_59 < t_61.length; t_59++) {
var t_62 = t_61[t_59];
frame.set("record", t_62);
frame.set("loop.index", t_59 + 1);
frame.set("loop.index0", t_59);
frame.set("loop.revindex", t_60 - t_59);
frame.set("loop.revindex0", t_60 - t_59 - 1);
frame.set("loop.first", t_59 === 0);
frame.set("loop.last", t_59 === t_60 - 1);
frame.set("loop.length", t_60);
if((lineno = 130, colno = 32, runtime.callWrap(runtime.memberLookup((t_62),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && !runtime.memberLookup((t_62),"isAmount")) {
output += "\r\n        ";
output += runtime.suppressValue(runtime.memberLookup((t_62),"id"), env.opts.autoescape);
output += "_ = ";
output += runtime.suppressValue(runtime.memberLookup((t_62),"id"), env.opts.autoescape);
output += " * ";
output += runtime.suppressValue(runtime.memberLookup((t_62),"compartment"), env.opts.autoescape);
;
}
else {
output += "\r\n        ";
output += runtime.suppressValue(runtime.memberLookup((t_62),"id"), env.opts.autoescape);
output += "_ = ";
output += runtime.suppressValue(runtime.memberLookup((t_62),"id"), env.opts.autoescape);
;
}
;
}
}
frame = frame.pop();
output += "\r\n\r\n        d = Base.@locals\r\n        return [d[id] for id in outputIds]\r\n    end\r\nend\r\n\r\n### events\r\n";
frame = frame.push();
var t_65 = runtime.contextOrFrameLookup(context, frame, "events");
if(t_65) {t_65 = runtime.fromIterator(t_65);
var t_64 = t_65.length;
for(var t_63=0; t_63 < t_65.length; t_63++) {
var t_66 = t_65[t_63];
frame.set("event", t_66);
frame.set("loop.index", t_63 + 1);
frame.set("loop.index0", t_63);
frame.set("loop.revindex", t_64 - t_63);
frame.set("loop.revindex0", t_64 - t_63 - 1);
frame.set("loop.first", t_63 === 0);
frame.set("loop.last", t_63 === t_64 - 1);
frame.set("loop.length", t_64);
output += "function ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"id"), env.opts.autoescape);
output += "_condition_(u, t, integrator)\r\n    cons = integrator.p.constants\r\n    (";
frame = frame.push();
var t_69 = runtime.contextOrFrameLookup(context, frame, "staticRecords");
if(t_69) {t_69 = runtime.fromIterator(t_69);
var t_68 = t_69.length;
for(var t_67=0; t_67 < t_69.length; t_67++) {
var t_70 = t_69[t_67];
frame.set("record", t_70);
frame.set("loop.index", t_67 + 1);
frame.set("loop.index0", t_67);
frame.set("loop.revindex", t_68 - t_67);
frame.set("loop.revindex0", t_68 - t_67 - 1);
frame.set("loop.first", t_67 === 0);
frame.set("loop.last", t_67 === t_68 - 1);
frame.set("loop.length", t_68);
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += ") = integrator.p.static\r\n    (";
frame = frame.push();
var t_73 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_73) {t_73 = runtime.fromIterator(t_73);
var t_72 = t_73.length;
for(var t_71=0; t_71 < t_73.length; t_71++) {
var t_74 = t_73[t_71];
frame.set("record", t_74);
frame.set("loop.index", t_71 + 1);
frame.set("loop.index0", t_71);
frame.set("loop.revindex", t_72 - t_71);
frame.set("loop.revindex0", t_72 - t_71 - 1);
frame.set("loop.first", t_71 === 0);
frame.set("loop.last", t_71 === t_72 - 1);
frame.set("loop.length", t_72);
output += runtime.suppressValue(runtime.memberLookup((t_74),"id"), env.opts.autoescape);
output += "_,";
;
}
}
frame = frame.pop();
output += ") = u\r\n\r\n    # Heta rules\r\n    ";
frame = frame.push();
var t_77 = runtime.contextOrFrameLookup(context, frame, "ruleRecords");
if(t_77) {t_77 = runtime.fromIterator(t_77);
var t_76 = t_77.length;
for(var t_75=0; t_75 < t_77.length; t_75++) {
var t_78 = t_77[t_75];
frame.set("record", t_78);
frame.set("loop.index", t_75 + 1);
frame.set("loop.index0", t_75);
frame.set("loop.revindex", t_76 - t_75);
frame.set("loop.revindex0", t_76 - t_75 - 1);
frame.set("loop.first", t_75 === 0);
frame.set("loop.last", t_75 === t_76 - 1);
frame.set("loop.length", t_76);
if(runtime.memberLookup((t_78),"isRule")) {
output += runtime.suppressValue(runtime.memberLookup((t_78),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 156, colno = 85, runtime.callWrap(runtime.memberLookup(((lineno = 156, colno = 58, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_78),"assignments")),"ode_")),"translate"), "record[\"assignments\"][\"ode_\"][\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toJuliaString"), "the return value of (record[\"assignments\"][\"ode_\"][\"translate\"])[\"toJuliaString\"]", context, [])), env.opts.autoescape);
output += "\r\n    ";
;
}
else {
if((lineno = 157, colno = 29, runtime.callWrap(runtime.memberLookup((t_78),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && runtime.memberLookup((t_78),"isDynamic") && !runtime.memberLookup((t_78),"isAmount")) {
output += runtime.suppressValue(runtime.memberLookup((t_78),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_78),"id"), env.opts.autoescape);
output += "_ / ";
output += runtime.suppressValue(runtime.memberLookup((t_78),"compartment"), env.opts.autoescape);
output += "\r\n    ";
;
}
else {
if(runtime.memberLookup((t_78),"isDynamic")) {
output += runtime.suppressValue(runtime.memberLookup((t_78),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_78),"id"), env.opts.autoescape);
output += "_\r\n    ";
;
}
;
}
;
}
;
}
}
frame = frame.pop();
if((lineno = 164, colno = 36, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"instanceOf"), "event[\"switcher\"][\"instanceOf\"]", context, ["TimeSwitcher"]))) {
var t_79;
t_79 = (env.getTest("defined").call(context, runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"start")) === true?runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "pTranslator")),"symbolName")),runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"start")):runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"startObj")),"num"));
frame.set("ev_start", t_79, true);
if(frame.topLevel) {
context.setVariable("ev_start", t_79);
}
if(frame.topLevel) {
context.addExport("ev_start", t_79);
}
var t_80;
t_80 = (env.getTest("defined").call(context, runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"period")) === true?runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "pTranslator")),"symbolName")),runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"period")):runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"periodObj")),"num"));
frame.set("ev_period", t_80, true);
if(frame.topLevel) {
context.setVariable("ev_period", t_80);
}
if(frame.topLevel) {
context.addExport("ev_period", t_80);
}
var t_81;
t_81 = (env.getTest("defined").call(context, runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"repeatCountObj")),"num")) === true?(lineno = 168, colno = 58, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"getRepeatCount"), "event[\"switcher\"][\"getRepeatCount\"]", context, [])):"Inf");
frame.set("ev_repeatCount", t_81, true);
if(frame.topLevel) {
context.setVariable("ev_repeatCount", t_81);
}
if(frame.topLevel) {
context.addExport("ev_repeatCount", t_81);
}
output += "\r\n    function flag_(t)\r\n        flag_ = t - ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "ev_start"), env.opts.autoescape);
output += ";\r\n        \r\n        if flag_ <= 0. || ";
output += runtime.suppressValue((env.getTest("defined").call(context, runtime.contextOrFrameLookup(context, frame, "ev_period")) === true?runtime.contextOrFrameLookup(context, frame, "ev_period"):"0.0"), env.opts.autoescape);
output += " <= 0.0\r\n            res_ = flag_\r\n        elseif 0. < flag_ && flag_ < ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "ev_repeatCount"), env.opts.autoescape);
output += " * ";
output += runtime.suppressValue((env.getTest("defined").call(context, runtime.contextOrFrameLookup(context, frame, "ev_period")) === true?runtime.contextOrFrameLookup(context, frame, "ev_period"):"0.0"), env.opts.autoescape);
output += "\r\n            res_ = flag_ - floor(flag_/";
output += runtime.suppressValue((env.getTest("defined").call(context, runtime.contextOrFrameLookup(context, frame, "ev_period")) === true?runtime.contextOrFrameLookup(context, frame, "ev_period"):"0.0"), env.opts.autoescape);
output += " + 0.5) * ";
output += runtime.suppressValue((env.getTest("defined").call(context, runtime.contextOrFrameLookup(context, frame, "ev_period")) === true?runtime.contextOrFrameLookup(context, frame, "ev_period"):"0.0"), env.opts.autoescape);
output += "\r\n        else\r\n            res_ = flag_ - ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "ev_repeatCount"), env.opts.autoescape);
output += " * ";
output += runtime.suppressValue((env.getTest("defined").call(context, runtime.contextOrFrameLookup(context, frame, "ev_period")) === true?runtime.contextOrFrameLookup(context, frame, "ev_period"):"0.0"), env.opts.autoescape);
output += "\r\n        end\r\n        return res_\r\n    end\r\n\r\n    return flag_(t)";
;
}
else {
if((lineno = 183, colno = 38, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"instanceOf"), "event[\"switcher\"][\"instanceOf\"]", context, ["CondSwitcher"]))) {
output += "\r\n    return ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"condition"), env.opts.autoescape);
;
}
;
}
output += "\r\nend\r\n\r\nfunction ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"id"), env.opts.autoescape);
output += "_assignment_(integrator)\r\n    cons = integrator.p.constants\r\n    t = integrator.t\r\n    (";
frame = frame.push();
var t_84 = runtime.contextOrFrameLookup(context, frame, "staticRecords");
if(t_84) {t_84 = runtime.fromIterator(t_84);
var t_83 = t_84.length;
for(var t_82=0; t_82 < t_84.length; t_82++) {
var t_85 = t_84[t_82];
frame.set("record", t_85);
frame.set("loop.index", t_82 + 1);
frame.set("loop.index0", t_82);
frame.set("loop.revindex", t_83 - t_82);
frame.set("loop.revindex0", t_83 - t_82 - 1);
frame.set("loop.first", t_82 === 0);
frame.set("loop.last", t_82 === t_83 - 1);
frame.set("loop.length", t_83);
output += runtime.suppressValue(runtime.memberLookup((t_85),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += ") = integrator.p.static\r\n    (";
frame = frame.push();
var t_88 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_88) {t_88 = runtime.fromIterator(t_88);
var t_87 = t_88.length;
for(var t_86=0; t_86 < t_88.length; t_86++) {
var t_89 = t_88[t_86];
frame.set("record", t_89);
frame.set("loop.index", t_86 + 1);
frame.set("loop.index0", t_86);
frame.set("loop.revindex", t_87 - t_86);
frame.set("loop.revindex0", t_87 - t_86 - 1);
frame.set("loop.first", t_86 === 0);
frame.set("loop.last", t_86 === t_87 - 1);
frame.set("loop.length", t_87);
output += runtime.suppressValue(runtime.memberLookup((t_89),"id"), env.opts.autoescape);
output += "_,";
;
}
}
frame = frame.pop();
output += ") = integrator.u\r\n\r\n    # Heta rules\r\n    ";
frame = frame.push();
var t_92 = runtime.contextOrFrameLookup(context, frame, "ruleRecords");
if(t_92) {t_92 = runtime.fromIterator(t_92);
var t_91 = t_92.length;
for(var t_90=0; t_90 < t_92.length; t_90++) {
var t_93 = t_92[t_90];
frame.set("record", t_93);
frame.set("loop.index", t_90 + 1);
frame.set("loop.index0", t_90);
frame.set("loop.revindex", t_91 - t_90);
frame.set("loop.revindex0", t_91 - t_90 - 1);
frame.set("loop.first", t_90 === 0);
frame.set("loop.last", t_90 === t_91 - 1);
frame.set("loop.length", t_91);
if(runtime.memberLookup((t_93),"isRule")) {
output += runtime.suppressValue(runtime.memberLookup((t_93),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 201, colno = 85, runtime.callWrap(runtime.memberLookup(((lineno = 201, colno = 58, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_93),"assignments")),"ode_")),"translate"), "record[\"assignments\"][\"ode_\"][\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toJuliaString"), "the return value of (record[\"assignments\"][\"ode_\"][\"translate\"])[\"toJuliaString\"]", context, [])), env.opts.autoescape);
output += "\r\n    ";
;
}
else {
if((lineno = 202, colno = 29, runtime.callWrap(runtime.memberLookup((t_93),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && runtime.memberLookup((t_93),"isDynamic") && !runtime.memberLookup((t_93),"isAmount")) {
output += runtime.suppressValue(runtime.memberLookup((t_93),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_93),"id"), env.opts.autoescape);
output += "_ / ";
output += runtime.suppressValue(runtime.memberLookup((t_93),"compartment"), env.opts.autoescape);
output += "\r\n    ";
;
}
else {
if(runtime.memberLookup((t_93),"isDynamic")) {
output += runtime.suppressValue(runtime.memberLookup((t_93),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((t_93),"id"), env.opts.autoescape);
output += "_\r\n    ";
;
}
;
}
;
}
;
}
}
frame = frame.pop();
output += "\r\n    # recalculated values\r\n    (";
frame = frame.push();
var t_96 = runtime.memberLookup((t_66),"affect");
if(t_96) {t_96 = runtime.fromIterator(t_96);
var t_95 = t_96.length;
for(var t_94=0; t_94 < t_96.length; t_94++) {
var t_97 = t_96[t_94];
frame.set("assignment", t_97);
frame.set("loop.index", t_94 + 1);
frame.set("loop.index0", t_94);
frame.set("loop.revindex", t_95 - t_94);
frame.set("loop.revindex0", t_95 - t_94 - 1);
frame.set("loop.first", t_94 === 0);
frame.set("loop.last", t_94 === t_95 - 1);
frame.set("loop.length", t_95);
output += runtime.suppressValue(runtime.memberLookup((t_97),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += ") = (";
frame = frame.push();
var t_100 = runtime.memberLookup((t_66),"affect");
if(t_100) {t_100 = runtime.fromIterator(t_100);
var t_99 = t_100.length;
for(var t_98=0; t_98 < t_100.length; t_98++) {
var t_101 = t_100[t_98];
frame.set("assignment", t_101);
frame.set("loop.index", t_98 + 1);
frame.set("loop.index0", t_98);
frame.set("loop.revindex", t_99 - t_98);
frame.set("loop.revindex0", t_99 - t_98 - 1);
frame.set("loop.first", t_98 === 0);
frame.set("loop.last", t_98 === t_99 - 1);
frame.set("loop.length", t_99);
output += runtime.suppressValue((lineno = 212, colno = 87, runtime.callWrap(runtime.memberLookup(((lineno = 212, colno = 60, runtime.callWrap(runtime.memberLookup(((lineno = 212, colno = 31, runtime.callWrap(runtime.memberLookup((t_101),"getAssignment"), "assignment[\"getAssignment\"]", context, [runtime.memberLookup((runtime.memberLookup((t_66),"switcher")),"id")]))),"translate"), "the return value of (assignment[\"getAssignment\"])[\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toJuliaString"), "the return value of (the return value of (assignment[\"getAssignment\"])[\"translate\"])[\"toJuliaString\"]", context, [])), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += ")\r\n    \r\n    # save results\r\n\r\n    integrator.u .= [";
frame = frame.push();
var t_104 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_104) {t_104 = runtime.fromIterator(t_104);
var t_103 = t_104.length;
for(var t_102=0; t_102 < t_104.length; t_102++) {
var t_105 = t_104[t_102];
frame.set("record", t_105);
frame.set("loop.index", t_102 + 1);
frame.set("loop.index0", t_102);
frame.set("loop.revindex", t_103 - t_102);
frame.set("loop.revindex0", t_103 - t_102 - 1);
frame.set("loop.first", t_102 === 0);
frame.set("loop.last", t_102 === t_103 - 1);
frame.set("loop.length", t_103);
if((lineno = 218, colno = 28, runtime.callWrap(runtime.memberLookup((t_105),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && !runtime.memberLookup((t_105),"isAmount") && !runtime.memberLookup((t_105),"isRule")) {
output += "\r\n        ";
output += runtime.suppressValue(runtime.memberLookup((t_105),"id"), env.opts.autoescape);
output += " * ";
output += runtime.suppressValue(runtime.memberLookup((t_105),"compartment"), env.opts.autoescape);
output += ",";
;
}
else {
output += "\r\n        ";
output += runtime.suppressValue(runtime.memberLookup((t_105),"id"), env.opts.autoescape);
output += ",";
;
}
;
}
}
frame = frame.pop();
output += "\r\n    ]\r\n    \r\n    integrator.p.static .= [";
frame = frame.push();
var t_108 = runtime.contextOrFrameLookup(context, frame, "staticRecords");
if(t_108) {t_108 = runtime.fromIterator(t_108);
var t_107 = t_108.length;
for(var t_106=0; t_106 < t_108.length; t_106++) {
var t_109 = t_108[t_106];
frame.set("record", t_109);
frame.set("loop.index", t_106 + 1);
frame.set("loop.index0", t_106);
frame.set("loop.revindex", t_107 - t_106);
frame.set("loop.revindex0", t_107 - t_106 - 1);
frame.set("loop.first", t_106 === 0);
frame.set("loop.last", t_106 === t_107 - 1);
frame.set("loop.length", t_107);
output += runtime.suppressValue(runtime.memberLookup((t_109),"id"), env.opts.autoescape);
output += ",";
;
}
}
frame = frame.pop();
output += "]\r\nend\r\n";
;
}
}
frame = frame.pop();
output += "\r\n\r\n### OUTPUT ###\r\n\r\n";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "namespace")),"spaceName"), env.opts.autoescape);
output += " = Model(\r\n  start_,\r\n  ode_,\r\n  [";
frame = frame.push();
var t_112 = runtime.contextOrFrameLookup(context, frame, "events");
if(t_112) {t_112 = runtime.fromIterator(t_112);
var t_111 = t_112.length;
for(var t_110=0; t_110 < t_112.length; t_110++) {
var t_113 = t_112[t_110];
frame.set("event", t_113);
frame.set("loop.index", t_110 + 1);
frame.set("loop.index0", t_110);
frame.set("loop.revindex", t_111 - t_110);
frame.set("loop.revindex0", t_111 - t_110 - 1);
frame.set("loop.first", t_110 === 0);
frame.set("loop.last", t_110 === t_111 - 1);
frame.set("loop.length", t_111);
output += "(";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_113),"switcher")),"id"), env.opts.autoescape);
output += "_condition_, ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_113),"switcher")),"id"), env.opts.autoescape);
output += "_assignment_), ";
;
}
}
frame = frame.pop();
output += "],\r\n  make_saving_,\r\n  constants_\r\n)\r\n\r\nmodels = (\r\n    ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "namespace")),"spaceName"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "namespace")),"spaceName"), env.opts.autoescape);
output += "\r\n)\r\ntasks = ()\r\n\r\nexport models, tasks\r\n\r\nend\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["model.m.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
var macro_t_1 = runtime.makeMacro(
["component"], 
[], 
function (l_component, kwargs) {
var callerFrame = frame;
frame = new runtime.Frame();
kwargs = kwargs || {};
if (Object.prototype.hasOwnProperty.call(kwargs, "caller")) {
frame.set("caller", kwargs.caller); }
frame.set("component", l_component);
var t_2 = "";if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "yTranslator")),"symbolName")),runtime.memberLookup((l_component),"id"))) {
t_2 += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "yTranslator")),"symbolName")),runtime.memberLookup((l_component),"id")), env.opts.autoescape);
;
}
else {
t_2 += runtime.suppressValue(runtime.memberLookup((l_component),"id"), env.opts.autoescape);
;
}
;
frame = callerFrame;
return new runtime.SafeString(t_2);
});
context.addExport("idOrSynonim");
context.setVariable("idOrSynonim", macro_t_1);
output += "%%%% This code was generated by ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "builderName"), env.opts.autoescape);
output += "\r\n% ";
output += runtime.suppressValue((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title")?runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title") + ".":""), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"notes"), env.opts.autoescape);
output += "\r\n\r\nfunction [ode_func, out_func, y0_, events_] = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"id"), env.opts.autoescape);
output += "_Model(p)\r\n\r\n    ode_func = @ODEFunc;\r\n    out_func = @OutputFunc;\r\n    y0_ = InitFunc();\r\n\r\n    % shared variable\r\n    shared_values = zeros(1, ";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "outputRecords")), env.opts.autoescape);
output += ");\r\n    integrator = [];\r\n\r\n    %%% Initialization of dynamic records\r\n    function y__ = InitFunc()\r\n        integrator = []; % reset integrator";
frame = frame.push();
var t_5 = runtime.contextOrFrameLookup(context, frame, "initRecords");
if(t_5) {t_5 = runtime.fromIterator(t_5);
var t_4 = t_5.length;
for(var t_3=0; t_3 < t_5.length; t_3++) {
var t_6 = t_5[t_3];
frame.set("record", t_6);
frame.set("loop.index", t_3 + 1);
frame.set("loop.index0", t_3);
frame.set("loop.revindex", t_4 - t_3);
frame.set("loop.revindex0", t_4 - t_3 - 1);
frame.set("loop.first", t_3 === 0);
frame.set("loop.last", t_3 === t_4 - 1);
frame.set("loop.length", t_4);
output += "\r\n        ";
if(env.getTest("defined").call(context, (lineno = 30, colno = 34, runtime.callWrap(runtime.memberLookup((t_6),"getAssignment"), "record[\"getAssignment\"]", context, ["start_"]))) === true) {
output += runtime.suppressValue(runtime.memberLookup((t_6),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 31, colno = 97, runtime.callWrap(runtime.memberLookup(((lineno = 31, colno = 69, runtime.callWrap(runtime.memberLookup(((lineno = 31, colno = 49, runtime.callWrap(runtime.memberLookup((t_6),"getAssignment"), "record[\"getAssignment\"]", context, ["start_"]))),"translate"), "the return value of (record[\"getAssignment\"])[\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toMatlabString"), "the return value of (the return value of (record[\"getAssignment\"])[\"translate\"])[\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += "; % ";
output += runtime.suppressValue(runtime.memberLookup((t_6),"id"), env.opts.autoescape);
output += ", ";
output += runtime.suppressValue(runtime.memberLookup((t_6),"title"), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((t_6),"units"), env.opts.autoescape);
output += ")";
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((t_6),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 33, colno = 95, runtime.callWrap(runtime.memberLookup(((lineno = 33, colno = 67, runtime.callWrap(runtime.memberLookup(((lineno = 33, colno = 49, runtime.callWrap(runtime.memberLookup((t_6),"getAssignment"), "record[\"getAssignment\"]", context, ["ode_"]))),"translate"), "the return value of (record[\"getAssignment\"])[\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toMatlabString"), "the return value of (the return value of (record[\"getAssignment\"])[\"translate\"])[\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += "; % ";
output += runtime.suppressValue(runtime.memberLookup((t_6),"id"), env.opts.autoescape);
output += ", ";
output += runtime.suppressValue(runtime.memberLookup((t_6),"title"), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((t_6),"units"), env.opts.autoescape);
output += ")";
;
}
;
}
}
frame = frame.pop();
output += "\r\n\r\n        y__ = [";
frame = frame.push();
var t_9 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_9) {t_9 = runtime.fromIterator(t_9);
var t_8 = t_9.length;
for(var t_7=0; t_7 < t_9.length; t_7++) {
var t_10 = t_9[t_7];
frame.set("record", t_10);
frame.set("loop.index", t_7 + 1);
frame.set("loop.index0", t_7);
frame.set("loop.revindex", t_8 - t_7);
frame.set("loop.revindex0", t_8 - t_7 - 1);
frame.set("loop.first", t_7 === 0);
frame.set("loop.last", t_7 === t_8 - 1);
frame.set("loop.length", t_8);
if((lineno = 38, colno = 32, runtime.callWrap(runtime.memberLookup((t_10),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && !runtime.memberLookup((t_10),"isAmount") && !runtime.memberLookup((t_10),"isRule")) {
output += runtime.suppressValue(runtime.memberLookup((t_10),"id"), env.opts.autoescape);
output += " * ";
output += runtime.suppressValue(runtime.memberLookup((t_10),"compartment"), env.opts.autoescape);
output += runtime.suppressValue((!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"last")?"; ":""), env.opts.autoescape);
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((t_10),"id"), env.opts.autoescape);
output += runtime.suppressValue((!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"last")?"; ":""), env.opts.autoescape);
;
}
;
}
}
frame = frame.pop();
output += "];\r\n    end\r\n\r\n    function status = OutputFunc(t, y, flag)\r\n        switch flag\r\n            case 'done'\r\n                assignin('base', 'output', integrator);\r\n            case 'affect'\r\n                integrator(end, :) = shared_values;\r\n            otherwise\r\n                integrator = [integrator; shared_values];\r\n        end\r\n        status = 0;\r\n    end\r\n\r\n    function dydt = ODEFunc(t, y)\r\n\r\n        dydt = zeros(";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "dynamicRecords")), env.opts.autoescape);
output += ", 1);\r\n\r\n        %%% Dynamic records annotation";
frame = frame.push();
var t_13 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_13) {t_13 = runtime.fromIterator(t_13);
var t_12 = t_13.length;
for(var t_11=0; t_11 < t_13.length; t_11++) {
var t_14 = t_13[t_11];
frame.set("record", t_14);
frame.set("loop.index", t_11 + 1);
frame.set("loop.index0", t_11);
frame.set("loop.revindex", t_12 - t_11);
frame.set("loop.revindex0", t_12 - t_11 - 1);
frame.set("loop.first", t_11 === 0);
frame.set("loop.last", t_11 === t_12 - 1);
frame.set("loop.length", t_12);
output += "\r\n        %";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"index"), env.opts.autoescape);
output += " - ";
output += runtime.suppressValue(runtime.memberLookup((t_14),"id"), env.opts.autoescape);
output += ", ";
output += runtime.suppressValue(runtime.memberLookup((t_14),"title"), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((t_14),"units"), env.opts.autoescape);
output += ") ";
output += runtime.suppressValue(runtime.memberLookup((t_14),"notes"), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "\r\n\r\n        %%% Output records";
frame = frame.push();
var t_17 = runtime.contextOrFrameLookup(context, frame, "outputRecords");
if(t_17) {t_17 = runtime.fromIterator(t_17);
var t_16 = t_17.length;
for(var t_15=0; t_15 < t_17.length; t_15++) {
var t_18 = t_17[t_15];
frame.set("record", t_18);
frame.set("loop.index", t_15 + 1);
frame.set("loop.index0", t_15);
frame.set("loop.revindex", t_16 - t_15);
frame.set("loop.revindex0", t_16 - t_15 - 1);
frame.set("loop.first", t_15 === 0);
frame.set("loop.last", t_15 === t_16 - 1);
frame.set("loop.length", t_16);
output += "\r\n        % ";
output += runtime.suppressValue(runtime.memberLookup((t_18),"title"), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((t_18),"units"), env.opts.autoescape);
output += ") ";
output += runtime.suppressValue(runtime.memberLookup((t_18),"notes"), env.opts.autoescape);
output += "\r\n        ";
if(runtime.memberLookup((t_18),"isRule")) {
output += runtime.suppressValue(runtime.memberLookup((t_18),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 71, colno = 90, runtime.callWrap(runtime.memberLookup(((lineno = 71, colno = 62, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_18),"assignments")),"ode_")),"translate"), "record[\"assignments\"][\"ode_\"][\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toMatlabString"), "the return value of (record[\"assignments\"][\"ode_\"][\"translate\"])[\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += ";";
;
}
else {
if((lineno = 72, colno = 34, runtime.callWrap(runtime.memberLookup((t_18),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && !runtime.memberLookup((t_18),"isAmount")) {
output += runtime.suppressValue(runtime.memberLookup((t_18),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "yTranslator")),"symbolName")),runtime.memberLookup((t_18),"id")), env.opts.autoescape);
output += " / ";
output += runtime.suppressValue(runtime.memberLookup((t_18),"compartment"), env.opts.autoescape);
output += ";";
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((t_18),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "yTranslator")),"symbolName")),runtime.memberLookup((t_18),"id")), env.opts.autoescape);
output += ";";
;
}
;
}
;
}
}
frame = frame.pop();
output += "\r\n        shared_values = [";
frame = frame.push();
var t_21 = runtime.contextOrFrameLookup(context, frame, "outputRecords");
if(t_21) {t_21 = runtime.fromIterator(t_21);
var t_20 = t_21.length;
for(var t_19=0; t_19 < t_21.length; t_19++) {
var t_22 = t_21[t_19];
frame.set("record", t_22);
frame.set("loop.index", t_19 + 1);
frame.set("loop.index0", t_19);
frame.set("loop.revindex", t_20 - t_19);
frame.set("loop.revindex0", t_20 - t_19 - 1);
frame.set("loop.first", t_19 === 0);
frame.set("loop.last", t_19 === t_20 - 1);
frame.set("loop.length", t_20);
output += runtime.suppressValue(runtime.memberLookup((t_22),"id"), env.opts.autoescape);
output += runtime.suppressValue((!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"last")?", ":""), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "];\r\n\r\n        %%% Differential equations";
frame = frame.push();
var t_25 = runtime.contextOrFrameLookup(context, frame, "dynamicRecords");
if(t_25) {t_25 = runtime.fromIterator(t_25);
var t_24 = t_25.length;
for(var t_23=0; t_23 < t_25.length; t_23++) {
var t_26 = t_25[t_23];
frame.set("record", t_26);
frame.set("loop.index", t_23 + 1);
frame.set("loop.index0", t_23);
frame.set("loop.revindex", t_24 - t_23);
frame.set("loop.revindex0", t_24 - t_23 - 1);
frame.set("loop.first", t_23 === 0);
frame.set("loop.last", t_23 === t_24 - 1);
frame.set("loop.length", t_24);
output += "\r\n        dydt(";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"index"), env.opts.autoescape);
output += ") = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "rhs")),runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"index0")), env.opts.autoescape);
output += ";";
;
}
}
frame = frame.pop();
output += "\r\n    end\r\n\r\n    ";
frame = frame.push();
var t_29 = runtime.contextOrFrameLookup(context, frame, "events");
if(t_29) {t_29 = runtime.fromIterator(t_29);
var t_28 = t_29.length;
for(var t_27=0; t_27 < t_29.length; t_27++) {
var t_30 = t_29[t_27];
frame.set("event", t_30);
frame.set("loop.index", t_27 + 1);
frame.set("loop.index0", t_27);
frame.set("loop.revindex", t_28 - t_27);
frame.set("loop.revindex0", t_28 - t_27 - 1);
frame.set("loop.first", t_27 === 0);
frame.set("loop.last", t_27 === t_28 - 1);
frame.set("loop.length", t_28);
output += "function [res, isterminal, direction] = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"id"), env.opts.autoescape);
output += "_condition(t, y)\r\n        direction = 1; % [];\r\n        isterminal = 1;\r\n        \r\n        ev_start = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"startObj")),"num"), env.opts.autoescape);
output += ";\r\n        ev_period = ";
output += runtime.suppressValue((env.getTest("defined").call(context, runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"periodObj")),"num")) === true?runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"periodObj")),"num"):"[]"), env.opts.autoescape);
output += ";\r\n        ev_repeatCount = ";
output += runtime.suppressValue((lineno = 95, colno = 60, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"getRepeatCountInt"), "event[\"switcher\"][\"getRepeatCountInt\"]", context, [])), env.opts.autoescape);
output += ";\r\n        \r\n        flag = (t - ev_start)/ev_period;\r\n        \r\n        if flag <= 0.\r\n            res = flag;\r\n        elseif (0. < flag) && (flag < ev_repeatCount)\r\n            res = flag - floor(flag + 0.5);\r\n        else\r\n            res = flag - ev_repeatCount;\r\n        end\r\n    end\r\n    function y = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"id"), env.opts.autoescape);
output += "_affect(t, y)\r\n\r\n        %%% Records";
frame = frame.push();
var t_33 = runtime.contextOrFrameLookup(context, frame, "outputRecords");
if(t_33) {t_33 = runtime.fromIterator(t_33);
var t_32 = t_33.length;
for(var t_31=0; t_31 < t_33.length; t_31++) {
var t_34 = t_33[t_31];
frame.set("record", t_34);
frame.set("loop.index", t_31 + 1);
frame.set("loop.index0", t_31);
frame.set("loop.revindex", t_32 - t_31);
frame.set("loop.revindex0", t_32 - t_31 - 1);
frame.set("loop.first", t_31 === 0);
frame.set("loop.last", t_31 === t_32 - 1);
frame.set("loop.length", t_32);
output += "\r\n        % ";
output += runtime.suppressValue(runtime.memberLookup((t_34),"title"), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((t_34),"units"), env.opts.autoescape);
output += ") ";
output += runtime.suppressValue(runtime.memberLookup((t_34),"notes"), env.opts.autoescape);
output += "\r\n        ";
if(runtime.memberLookup((t_34),"isRule")) {
output += runtime.suppressValue(runtime.memberLookup((t_34),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 113, colno = 90, runtime.callWrap(runtime.memberLookup(((lineno = 113, colno = 62, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_34),"assignments")),"ode_")),"translate"), "record[\"assignments\"][\"ode_\"][\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toMatlabString"), "the return value of (record[\"assignments\"][\"ode_\"][\"translate\"])[\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += ";";
;
}
else {
if((lineno = 114, colno = 34, runtime.callWrap(runtime.memberLookup((t_34),"instanceOf"), "record[\"instanceOf\"]", context, ["Species"])) && !runtime.memberLookup((t_34),"isAmount")) {
output += runtime.suppressValue(runtime.memberLookup((t_34),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "yTranslator")),"symbolName")),runtime.memberLookup((t_34),"id")), env.opts.autoescape);
output += " / ";
output += runtime.suppressValue(runtime.memberLookup((t_34),"compartment"), env.opts.autoescape);
output += ";";
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((t_34),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "yTranslator")),"symbolName")),runtime.memberLookup((t_34),"id")), env.opts.autoescape);
output += ";";
;
}
;
}
;
}
}
frame = frame.pop();
output += "\r\n        \r\n        shared_values = [";
frame = frame.push();
var t_37 = runtime.contextOrFrameLookup(context, frame, "outputRecords");
if(t_37) {t_37 = runtime.fromIterator(t_37);
var t_36 = t_37.length;
for(var t_35=0; t_35 < t_37.length; t_35++) {
var t_38 = t_37[t_35];
frame.set("record", t_38);
frame.set("loop.index", t_35 + 1);
frame.set("loop.index0", t_35);
frame.set("loop.revindex", t_36 - t_35);
frame.set("loop.revindex0", t_36 - t_35 - 1);
frame.set("loop.first", t_35 === 0);
frame.set("loop.last", t_35 === t_36 - 1);
frame.set("loop.length", t_36);
output += runtime.suppressValue(runtime.memberLookup((t_38),"id"), env.opts.autoescape);
output += runtime.suppressValue((!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"last")?", ":""), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "];\r\n        OutputFunc(t, y, 'affect');\r\n\r\n        %%% recalculated values";
frame = frame.push();
var t_41 = runtime.memberLookup((t_30),"affect");
if(t_41) {t_41 = runtime.fromIterator(t_41);
var t_40 = t_41.length;
for(var t_39=0; t_39 < t_41.length; t_39++) {
var t_42 = t_41[t_39];
frame.set("assignment", t_42);
frame.set("loop.index", t_39 + 1);
frame.set("loop.index0", t_39);
frame.set("loop.revindex", t_40 - t_39);
frame.set("loop.revindex0", t_40 - t_39 - 1);
frame.set("loop.first", t_39 === 0);
frame.set("loop.last", t_39 === t_40 - 1);
frame.set("loop.length", t_40);
output += "\r\n        ";
if((lineno = 128, colno = 35, runtime.callWrap(runtime.memberLookup((t_42),"instanceOf"), "assignment[\"instanceOf\"]", context, ["Species"])) && !runtime.memberLookup((t_42),"isAmount") && !runtime.memberLookup((t_42),"isRule")) {
output += runtime.suppressValue((lineno = 129, colno = 22, runtime.callWrap(macro_t_1, "idOrSynonim", context, [t_42])), env.opts.autoescape);
output += " = (";
output += runtime.suppressValue((lineno = 129, colno = 125, runtime.callWrap(runtime.memberLookup(((lineno = 129, colno = 97, runtime.callWrap(runtime.memberLookup(((lineno = 129, colno = 68, runtime.callWrap(runtime.memberLookup((t_42),"getAssignment"), "assignment[\"getAssignment\"]", context, [runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"id")]))),"translate"), "the return value of (assignment[\"getAssignment\"])[\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toMatlabString"), "the return value of (the return value of (assignment[\"getAssignment\"])[\"translate\"])[\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += ") * ";
output += runtime.suppressValue(runtime.memberLookup((t_42),"compartment"), env.opts.autoescape);
output += ";";
;
}
else {
output += runtime.suppressValue((lineno = 131, colno = 22, runtime.callWrap(macro_t_1, "idOrSynonim", context, [t_42])), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 131, colno = 124, runtime.callWrap(runtime.memberLookup(((lineno = 131, colno = 96, runtime.callWrap(runtime.memberLookup(((lineno = 131, colno = 67, runtime.callWrap(runtime.memberLookup((t_42),"getAssignment"), "assignment[\"getAssignment\"]", context, [runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"id")]))),"translate"), "the return value of (assignment[\"getAssignment\"])[\"translate\"]", context, [runtime.contextOrFrameLookup(context, frame, "pTranslator")]))),"toMatlabString"), "the return value of (the return value of (assignment[\"getAssignment\"])[\"translate\"])[\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += ";";
;
}
;
}
}
frame = frame.pop();
output += "\r\n        \r\n    end\r\n    ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"id"), env.opts.autoescape);
output += "_ = { @";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"id"), env.opts.autoescape);
output += "_condition, @";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_30),"switcher")),"id"), env.opts.autoescape);
output += "_affect };";
;
}
}
frame = frame.pop();
output += "\r\n\r\n    events_ = [";
frame = frame.push();
var t_45 = runtime.contextOrFrameLookup(context, frame, "events");
if(t_45) {t_45 = runtime.fromIterator(t_45);
var t_44 = t_45.length;
for(var t_43=0; t_43 < t_45.length; t_43++) {
var t_46 = t_45[t_43];
frame.set("event", t_46);
frame.set("loop.index", t_43 + 1);
frame.set("loop.index0", t_43);
frame.set("loop.revindex", t_44 - t_43);
frame.set("loop.revindex0", t_44 - t_43 - 1);
frame.set("loop.first", t_43 === 0);
frame.set("loop.last", t_43 === t_44 - 1);
frame.set("loop.length", t_44);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_46),"switcher")),"id"), env.opts.autoescape);
output += "_";
output += runtime.suppressValue((!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"last")?", ":""), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "];\r\nend";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["output.m.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "%%%% This code was generated by ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "builderName"), env.opts.autoescape);
output += "\r\n% ";
output += runtime.suppressValue((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title")?runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title") + ".":""), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"notes"), env.opts.autoescape);
output += "\r\n\r\nfunction out = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"id"), env.opts.autoescape);
output += "_Output(t, y, flag)\r\n\r\nswitch (flag)\r\ncase 'init'\r\n   %statement;\r\ncase '[]'\r\n   out = y;\r\ncase 'done'\r\n   %statement for output;\r\nend\r\n\r\nend\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["param.m.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "%%%% This code was generated by ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "builderName"), env.opts.autoescape);
output += "\r\n% ";
output += runtime.suppressValue((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title")?runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"title") + ".":""), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"notes"), env.opts.autoescape);
output += "\r\n\r\nfunction p = ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"id"), env.opts.autoescape);
output += "_Param()\r\n\r\np = zeros(";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "constants")), env.opts.autoescape);
output += ", 1);\r\n%%% parameter annotation";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "constants");
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("con", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\r\np(";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"index"), env.opts.autoescape);
output += ") = ";
output += runtime.suppressValue(runtime.memberLookup((t_4),"num"), env.opts.autoescape);
output += "; % ";
output += runtime.suppressValue(runtime.memberLookup((t_4),"id"), env.opts.autoescape);
output += ", ";
output += runtime.suppressValue(runtime.memberLookup((t_4),"title"), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((t_4),"units"), env.opts.autoescape);
output += ") ";
output += runtime.suppressValue(runtime.memberLookup((t_4),"notes"), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "\r\n\r\nend\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["run.jl.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "push!(LOAD_PATH, \"../\")\r\nusing SimSolver\r\n# Heta export is organized as Julia file\r\n\r\n# This loads ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"id"), env.opts.autoescape);
output += " Module\r\ninclude(\"model.jl\")\r\nusing Main.";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "options")),"id"), env.opts.autoescape);
output += "\r\n\r\ntasks\r\nmodels\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["run.m.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "clear; clc; close all;\r\n\r\np_names = [";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "constants");
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("con", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\"";
output += runtime.suppressValue(runtime.memberLookup((t_4),"id"), env.opts.autoescape);
output += "\"";
output += runtime.suppressValue((!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"last")?", ":""), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "];\r\noutput_names = [";
frame = frame.push();
var t_7 = runtime.contextOrFrameLookup(context, frame, "outputRecords");
if(t_7) {t_7 = runtime.fromIterator(t_7);
var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("record", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\"";
output += runtime.suppressValue(runtime.memberLookup((t_8),"id"), env.opts.autoescape);
output += "\"";
output += runtime.suppressValue((!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"last")?", ":""), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "];\r\n\r\np = param();\r\n[ode_func, out_func, y0, events] = model(p);\r\n\r\n%%% default task\r\nt_span = [0 100]; % [0:1:100]\r\nopt = odeset('OutputFcn', out_func, 'Events', events{1}, 'MaxStep', 3); % odeset('Mass',M,'RelTol',1e-4,'AbsTol',[1e-6 1e-10 1e-6], 'Stats','on');\r\n\r\n% the next string generates \"output\" variable\r\n%[t, y, te, ye, ie] = ode15s(ode_func, t_span, y0, opt);\r\n\r\n% solution with events\r\nti = t_span(1);\r\nyi = y0;\r\ntout = [];\r\nyout = [];\r\nwhile ti < t_span(2)\r\n    [t, y, te, ye, ie] = ode15s(ode_func, [ti t_span(2)], yi, opt);\r\n    \r\n    ti = t(end);\r\n    yi = events{2}(ti, ye(end,:));\r\n    tout = vertcat(tout, t);\r\nend\r\n\r\nfigure\r\nhold on\r\nfor i = 1:length(output_names)\r\n    plot(tout, output(:, i), '-', 'Linewidth', 1)\r\nend\r\ntitle('Default plot','Fontsize', 14)\r\nxlabel('t', 'Fontsize', 14)\r\nylabel('records', 'Fontsize', 14)\r\nlegend(output_names)\r\nhold off\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["template.m.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "%{\r\n  This model was created by Heta compiler.\r\n  Additional functions and constants for compatibility see in \"fun.m\"\r\n  export from : ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += " @SimbioExport {...};\r\n  ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.opts.autoescape);
output += "\r\n  ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "notes"), env.opts.autoescape);
output += "\r\n%}\r\n\r\nsbioaddtolibrary(sbiounit('week', 'day', 7));\r\n\r\n";
var t_1;
t_1 = runtime.contextOrFrameLookup(context, frame, "_id") + "_model";
frame.set("model_id", t_1, true);
if(frame.topLevel) {
context.setVariable("model_id", t_1);
}
if(frame.topLevel) {
context.addExport("model_id", t_1);
}
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += " = sbiomodel('";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += "');\r\n\r\n% Useful parameters\r\naddparameter(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", 'timeOne', 1, 'ValueUnits', 'hour');\r\n\r\n";
var t_2;
t_2 = (lineno = 16, colno = 62, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Compartment"]));
frame.set("listOfCompartments", t_2, true);
if(frame.topLevel) {
context.setVariable("listOfCompartments", t_2);
}
if(frame.topLevel) {
context.addExport("listOfCompartments", t_2);
}
output += runtime.suppressValue((env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfCompartments")) > 0?"% Compartments":""), env.opts.autoescape);
frame = frame.push();
var t_5 = runtime.contextOrFrameLookup(context, frame, "listOfCompartments");
if(t_5) {t_5 = runtime.fromIterator(t_5);
var t_4 = t_5.length;
for(var t_3=0; t_3 < t_5.length; t_3++) {
var t_6 = t_5[t_3];
frame.set("record", t_6);
frame.set("loop.index", t_3 + 1);
frame.set("loop.index0", t_3);
frame.set("loop.revindex", t_4 - t_3);
frame.set("loop.revindex0", t_4 - t_3 - 1);
frame.set("loop.first", t_3 === 0);
frame.set("loop.last", t_3 === t_4 - 1);
frame.set("loop.length", t_4);
output += "\r\n";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".compartment.";
output += runtime.suppressValue(runtime.memberLookup((t_6),"id"), env.opts.autoescape);
output += " = addcompartment(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", '";
output += runtime.suppressValue(runtime.memberLookup((t_6),"id"), env.opts.autoescape);
output += "', 'ConstantCapacity', false";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_6),"assignments")),"start_")),"num") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += ", 'Capacity', ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_6),"assignments")),"start_")),"num"), env.opts.autoescape);
;
}
if(runtime.memberLookup((t_6),"units") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += ", 'CapacityUnits', '";
output += runtime.suppressValue((lineno = 22, colno = 78, runtime.callWrap(runtime.memberLookup((t_6),"unitsRebased"), "record[\"unitsRebased\"]", context, [runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"legalUnits"),true])), env.opts.autoescape);
output += "'";
;
}
output += ", 'Notes', '";
output += runtime.suppressValue(runtime.memberLookup((t_6),"notesHTML"), env.opts.autoescape);
output += "', 'Tag', '');";
;
}
}
frame = frame.pop();
output += "\r\n\r\n";
var t_7;
t_7 = (lineno = 26, colno = 57, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Species"]));
frame.set("listOfSpecies", t_7, true);
if(frame.topLevel) {
context.setVariable("listOfSpecies", t_7);
}
if(frame.topLevel) {
context.addExport("listOfSpecies", t_7);
}
output += runtime.suppressValue((env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfSpecies")) > 0?"% Species":""), env.opts.autoescape);
frame = frame.push();
var t_10 = runtime.contextOrFrameLookup(context, frame, "listOfSpecies");
if(t_10) {t_10 = runtime.fromIterator(t_10);
var t_9 = t_10.length;
for(var t_8=0; t_8 < t_10.length; t_8++) {
var t_11 = t_10[t_8];
frame.set("record", t_11);
frame.set("loop.index", t_8 + 1);
frame.set("loop.index0", t_8);
frame.set("loop.revindex", t_9 - t_8);
frame.set("loop.revindex0", t_9 - t_8 - 1);
frame.set("loop.first", t_8 === 0);
frame.set("loop.last", t_8 === t_9 - 1);
frame.set("loop.length", t_9);
output += "\r\n";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".species.";
output += runtime.suppressValue(runtime.memberLookup((t_11),"id"), env.opts.autoescape);
output += " = addspecies(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".compartment.";
output += runtime.suppressValue(runtime.memberLookup((t_11),"compartment"), env.opts.autoescape);
output += ", '";
output += runtime.suppressValue(runtime.memberLookup((t_11),"id"), env.opts.autoescape);
output += "', 'ConstantAmount', false";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_11),"assignments")),"start_")),"num") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += ", 'InitialAmount', ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_11),"assignments")),"start_")),"num"), env.opts.autoescape);
;
}
if(runtime.memberLookup((t_11),"units") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += ", 'InitialAmountUnits', '";
output += runtime.suppressValue((lineno = 32, colno = 84, runtime.callWrap(runtime.memberLookup((t_11),"unitsRebased"), "record[\"unitsRebased\"]", context, [runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"legalUnits"),true])), env.opts.autoescape);
output += "'";
;
}
output += ", 'BoundaryCondition', ";
output += runtime.suppressValue(runtime.memberLookup((t_11),"boundary") === true || runtime.memberLookup((t_11),"isRule") === true, env.opts.autoescape);
output += ", 'Notes', '";
output += runtime.suppressValue(runtime.memberLookup((t_11),"notesHTML"), env.opts.autoescape);
output += "', 'Tag', '');";
;
}
}
frame = frame.pop();
output += "\r\n\r\n";
var t_12;
t_12 = (lineno = 37, colno = 60, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Record"]));
frame.set("listOfParameters", t_12, true);
if(frame.topLevel) {
context.setVariable("listOfParameters", t_12);
}
if(frame.topLevel) {
context.addExport("listOfParameters", t_12);
}
var t_13;
t_13 = (lineno = 38, colno = 59, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Process"]));
frame.set("listOfProcesses", t_13, true);
if(frame.topLevel) {
context.setVariable("listOfProcesses", t_13);
}
if(frame.topLevel) {
context.addExport("listOfProcesses", t_13);
}
var t_14;
t_14 = (lineno = 39, colno = 59, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Const"]));
frame.set("listOfConstants", t_14, true);
if(frame.topLevel) {
context.setVariable("listOfConstants", t_14);
}
if(frame.topLevel) {
context.addExport("listOfConstants", t_14);
}
output += runtime.suppressValue((env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfParameters")) + env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfConstants")) + env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfProcesses")) > 0?"% Parameters":""), env.opts.autoescape);
frame = frame.push();
var t_17 = (lineno = 41, colno = 41, runtime.callWrap(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "listOfParameters")),"concat"), "listOfParameters[\"concat\"]", context, [runtime.contextOrFrameLookup(context, frame, "listOfProcesses")]));
if(t_17) {t_17 = runtime.fromIterator(t_17);
var t_16 = t_17.length;
for(var t_15=0; t_15 < t_17.length; t_15++) {
var t_18 = t_17[t_15];
frame.set("record", t_18);
frame.set("loop.index", t_15 + 1);
frame.set("loop.index0", t_15);
frame.set("loop.revindex", t_16 - t_15);
frame.set("loop.revindex0", t_16 - t_15 - 1);
frame.set("loop.first", t_15 === 0);
frame.set("loop.last", t_15 === t_16 - 1);
frame.set("loop.length", t_16);
output += "\r\n";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".parameter.";
output += runtime.suppressValue(runtime.memberLookup((t_18),"id"), env.opts.autoescape);
output += " = addparameter(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", '";
output += runtime.suppressValue(runtime.memberLookup((t_18),"id"), env.opts.autoescape);
output += "', 'ConstantValue', false";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_18),"assignments")),"start_")),"num") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += ", 'Value', ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_18),"assignments")),"start_")),"num"), env.opts.autoescape);
;
}
if(runtime.memberLookup((t_18),"units") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += ", 'ValueUnits', '";
output += runtime.suppressValue((lineno = 45, colno = 76, runtime.callWrap(runtime.memberLookup((t_18),"unitsRebased"), "record[\"unitsRebased\"]", context, [runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"legalUnits"),true])), env.opts.autoescape);
output += "'";
;
}
output += ", 'Notes', '";
output += runtime.suppressValue(runtime.memberLookup((t_18),"notesHTML"), env.opts.autoescape);
output += "', 'Tag', '');";
;
}
}
frame = frame.pop();
frame = frame.push();
var t_21 = runtime.contextOrFrameLookup(context, frame, "listOfConstants");
if(t_21) {t_21 = runtime.fromIterator(t_21);
var t_20 = t_21.length;
for(var t_19=0; t_19 < t_21.length; t_19++) {
var t_22 = t_21[t_19];
frame.set("con", t_22);
frame.set("loop.index", t_19 + 1);
frame.set("loop.index0", t_19);
frame.set("loop.revindex", t_20 - t_19);
frame.set("loop.revindex0", t_20 - t_19 - 1);
frame.set("loop.first", t_19 === 0);
frame.set("loop.last", t_19 === t_20 - 1);
frame.set("loop.length", t_20);
output += "\r\n";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".parameter.";
output += runtime.suppressValue(runtime.memberLookup((t_22),"id"), env.opts.autoescape);
output += " = addparameter(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", '";
output += runtime.suppressValue(runtime.memberLookup((t_22),"id"), env.opts.autoescape);
output += "', 'ConstantValue', true";
if(runtime.memberLookup((t_22),"num") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += ", 'Value', ";
output += runtime.suppressValue(runtime.memberLookup((t_22),"num"), env.opts.autoescape);
;
}
if(runtime.memberLookup((t_22),"units") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += ", 'ValueUnits', '";
output += runtime.suppressValue((lineno = 52, colno = 70, runtime.callWrap(runtime.memberLookup((t_22),"unitsRebased"), "con[\"unitsRebased\"]", context, [runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"legalUnits"),true])), env.opts.autoescape);
output += "'";
;
}
output += ", 'Notes', '";
output += runtime.suppressValue(runtime.memberLookup((t_22),"notesHTML"), env.opts.autoescape);
output += "', 'Tag', '');";
;
}
}
frame = frame.pop();
output += "\r\n\r\n";
var t_23;
t_23 = (lineno = 56, colno = 59, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Reaction"]));
frame.set("listOfReactions", t_23, true);
if(frame.topLevel) {
context.setVariable("listOfReactions", t_23);
}
if(frame.topLevel) {
context.addExport("listOfReactions", t_23);
}
output += runtime.suppressValue((env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfReactions")) > 0?"% Reactions":""), env.opts.autoescape);
frame = frame.push();
var t_26 = runtime.contextOrFrameLookup(context, frame, "listOfReactions");
if(t_26) {t_26 = runtime.fromIterator(t_26);
var t_25 = t_26.length;
for(var t_24=0; t_24 < t_26.length; t_24++) {
var t_27 = t_26[t_24];
frame.set("record", t_27);
frame.set("loop.index", t_24 + 1);
frame.set("loop.index0", t_24);
frame.set("loop.revindex", t_25 - t_24);
frame.set("loop.revindex0", t_25 - t_24 - 1);
frame.set("loop.first", t_24 === 0);
frame.set("loop.last", t_24 === t_25 - 1);
frame.set("loop.length", t_25);
output += "\r\n";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".reaction.";
output += runtime.suppressValue(runtime.memberLookup((t_27),"id"), env.opts.autoescape);
output += " = addreaction(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", 'null -> null', 'Name', '";
output += runtime.suppressValue(runtime.memberLookup((t_27),"id"), env.opts.autoescape);
output += "', 'Active', true, 'Reversible', ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_27),"aux")),"reversible") !== false, env.opts.autoescape);
if(runtime.memberLookup((runtime.memberLookup((t_27),"assignments")),"ode_")) {
output += ", 'ReactionRate', '";
output += runtime.suppressValue((lineno = 61, colno = 94, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_27),"assignments")),"ode_")),"toMatlabString"), "record[\"assignments\"][\"ode_\"][\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += "'";
;
}
output += ", 'Notes', '";
output += runtime.suppressValue(runtime.memberLookup((t_27),"notesHTML"), env.opts.autoescape);
output += "', 'Tag', '');";
var t_28;
t_28 = (lineno = 63, colno = 43, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((t_27),"actors")),"concat"), "record[\"actors\"][\"concat\"]", context, [runtime.memberLookup((t_27),"modifiers")]));
frame.set("fullActors", t_28, true);
if(frame.topLevel) {
context.setVariable("fullActors", t_28);
}
if(frame.topLevel) {
context.addExport("fullActors", t_28);
}
var t_29;
t_29 = env.getFilter("getReactants").call(context, runtime.contextOrFrameLookup(context, frame, "fullActors"));
frame.set("reactants", t_29, true);
if(frame.topLevel) {
context.setVariable("reactants", t_29);
}
if(frame.topLevel) {
context.addExport("reactants", t_29);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "reactants")) > 0) {
output += "\r\n  addreactant(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".reaction.";
output += runtime.suppressValue(runtime.memberLookup((t_27),"id"), env.opts.autoescape);
output += ", [";
frame = frame.push();
var t_32 = runtime.contextOrFrameLookup(context, frame, "reactants");
if(t_32) {t_32 = runtime.fromIterator(t_32);
var t_31 = t_32.length;
for(var t_30=0; t_30 < t_32.length; t_30++) {
var t_33 = t_32[t_30];
frame.set("actor", t_33);
frame.set("loop.index", t_30 + 1);
frame.set("loop.index0", t_30);
frame.set("loop.revindex", t_31 - t_30);
frame.set("loop.revindex0", t_31 - t_30 - 1);
frame.set("loop.first", t_30 === 0);
frame.set("loop.last", t_30 === t_31 - 1);
frame.set("loop.length", t_31);
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".species.";
output += runtime.suppressValue(runtime.memberLookup((t_33),"target"), env.opts.autoescape);
output += ", ";
;
}
}
frame = frame.pop();
output += "], [";
frame = frame.push();
var t_36 = runtime.contextOrFrameLookup(context, frame, "reactants");
if(t_36) {t_36 = runtime.fromIterator(t_36);
var t_35 = t_36.length;
for(var t_34=0; t_34 < t_36.length; t_34++) {
var t_37 = t_36[t_34];
frame.set("actor", t_37);
frame.set("loop.index", t_34 + 1);
frame.set("loop.index0", t_34);
frame.set("loop.revindex", t_35 - t_34);
frame.set("loop.revindex0", t_35 - t_34 - 1);
frame.set("loop.first", t_34 === 0);
frame.set("loop.last", t_34 === t_35 - 1);
frame.set("loop.length", t_35);
output += runtime.suppressValue((runtime.memberLookup((t_37),"stoichiometry") < 0?-runtime.memberLookup((t_37),"stoichiometry"):1), env.opts.autoescape);
output += ", ";
;
}
}
frame = frame.pop();
output += "]);";
;
}
var t_38;
t_38 = env.getFilter("getProducts").call(context, runtime.contextOrFrameLookup(context, frame, "fullActors"));
frame.set("products", t_38, true);
if(frame.topLevel) {
context.setVariable("products", t_38);
}
if(frame.topLevel) {
context.addExport("products", t_38);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "products")) > 0) {
output += "\r\n  addproduct(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".reaction.";
output += runtime.suppressValue(runtime.memberLookup((t_27),"id"), env.opts.autoescape);
output += ", [";
frame = frame.push();
var t_41 = runtime.contextOrFrameLookup(context, frame, "products");
if(t_41) {t_41 = runtime.fromIterator(t_41);
var t_40 = t_41.length;
for(var t_39=0; t_39 < t_41.length; t_39++) {
var t_42 = t_41[t_39];
frame.set("actor", t_42);
frame.set("loop.index", t_39 + 1);
frame.set("loop.index0", t_39);
frame.set("loop.revindex", t_40 - t_39);
frame.set("loop.revindex0", t_40 - t_39 - 1);
frame.set("loop.first", t_39 === 0);
frame.set("loop.last", t_39 === t_40 - 1);
frame.set("loop.length", t_40);
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".species.";
output += runtime.suppressValue(runtime.memberLookup((t_42),"target"), env.opts.autoescape);
output += ", ";
;
}
}
frame = frame.pop();
output += "], [";
frame = frame.push();
var t_45 = runtime.contextOrFrameLookup(context, frame, "products");
if(t_45) {t_45 = runtime.fromIterator(t_45);
var t_44 = t_45.length;
for(var t_43=0; t_43 < t_45.length; t_43++) {
var t_46 = t_45[t_43];
frame.set("actor", t_46);
frame.set("loop.index", t_43 + 1);
frame.set("loop.index0", t_43);
frame.set("loop.revindex", t_44 - t_43);
frame.set("loop.revindex0", t_44 - t_43 - 1);
frame.set("loop.first", t_43 === 0);
frame.set("loop.last", t_43 === t_44 - 1);
frame.set("loop.length", t_44);
output += runtime.suppressValue((runtime.memberLookup((t_46),"stoichiometry") > 0?runtime.memberLookup((t_46),"stoichiometry"):1), env.opts.autoescape);
output += ", ";
;
}
}
frame = frame.pop();
output += "]);";
;
}
;
}
}
frame = frame.pop();
output += "\r\n\r\n";
var t_47;
t_47 = env.getFilter("exclude2").call(context, (lineno = 82, colno = 70, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectRecordsByContext"), "image[\"population\"][\"selectRecordsByContext\"]", context, ["ode_"])),"className","Reaction");
frame.set("listOfAssignmentRules", t_47, true);
if(frame.topLevel) {
context.setVariable("listOfAssignmentRules", t_47);
}
if(frame.topLevel) {
context.addExport("listOfAssignmentRules", t_47);
}
var t_48;
t_48 = env.getFilter("exclude2").call(context, env.getFilter("exclude2").call(context, env.getFilter("exclude2").call(context, (lineno = 83, colno = 60, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Record"])),"boundary",true),"isRule",true),"backReferences.length",0);
frame.set("listOfRateRules", t_48, true);
if(frame.topLevel) {
context.setVariable("listOfRateRules", t_48);
}
if(frame.topLevel) {
context.addExport("listOfRateRules", t_48);
}
output += runtime.suppressValue((env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfAssignmentRules")) + env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfRateRules")) > 0?"% Rules":""), env.opts.autoescape);
output += "\r\n";
frame = frame.push();
var t_51 = runtime.contextOrFrameLookup(context, frame, "listOfAssignmentRules");
if(t_51) {t_51 = runtime.fromIterator(t_51);
var t_50 = t_51.length;
for(var t_49=0; t_49 < t_51.length; t_49++) {
var t_52 = t_51[t_49];
frame.set("record", t_52);
frame.set("loop.index", t_49 + 1);
frame.set("loop.index0", t_49);
frame.set("loop.revindex", t_50 - t_49);
frame.set("loop.revindex0", t_50 - t_49 - 1);
frame.set("loop.first", t_49 === 0);
frame.set("loop.last", t_49 === t_50 - 1);
frame.set("loop.length", t_50);
output += "addrule(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", '";
output += runtime.suppressValue(runtime.memberLookup((t_52),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 87, colno = 77, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_52),"assignments")),"ode_")),"toMatlabString"), "record[\"assignments\"][\"ode_\"][\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += "', 'repeatedAssignment');\r\n";
;
}
}
frame = frame.pop();
output += "\r\n";
frame = frame.push();
var t_55 = runtime.contextOrFrameLookup(context, frame, "listOfRateRules");
if(t_55) {t_55 = runtime.fromIterator(t_55);
var t_54 = t_55.length;
for(var t_53=0; t_53 < t_55.length; t_53++) {
var t_56 = t_55[t_53];
frame.set("record", t_56);
frame.set("loop.index", t_53 + 1);
frame.set("loop.index0", t_53);
frame.set("loop.revindex", t_54 - t_53);
frame.set("loop.revindex0", t_54 - t_53 - 1);
frame.set("loop.first", t_53 === 0);
frame.set("loop.last", t_53 === t_54 - 1);
frame.set("loop.length", t_54);
output += "addrule(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", '";
output += runtime.suppressValue(runtime.memberLookup((t_56),"id"), env.opts.autoescape);
output += " =";
frame = frame.push();
var t_59 = runtime.memberLookup((t_56),"backReferences");
if(t_59) {t_59 = runtime.fromIterator(t_59);
var t_58 = t_59.length;
for(var t_57=0; t_57 < t_59.length; t_57++) {
var t_60 = t_59[t_57];
frame.set("ref", t_60);
frame.set("loop.index", t_57 + 1);
frame.set("loop.index0", t_57);
frame.set("loop.revindex", t_58 - t_57);
frame.set("loop.revindex0", t_58 - t_57 - 1);
frame.set("loop.first", t_57 === 0);
frame.set("loop.last", t_57 === t_58 - 1);
frame.set("loop.length", t_58);
output += runtime.suppressValue((runtime.memberLookup((t_60),"stoichiometry") < 0 || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"first")?" " + runtime.memberLookup((t_60),"stoichiometry"):" + " + runtime.memberLookup((t_60),"stoichiometry")), env.opts.autoescape);
output += "*";
output += runtime.suppressValue(runtime.memberLookup((t_60),"process"), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "', 'rate');";
;
}
}
frame = frame.pop();
var t_61;
t_61 = env.getFilter("filter2").call(context, (lineno = 98, colno = 74, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectRecordsByContext"), "image[\"population\"][\"selectRecordsByContext\"]", context, ["start_"])),"assignments.start_.num",runtime.contextOrFrameLookup(context, frame, "undefined"));
frame.set("listOfInitialAssignments", t_61, true);
if(frame.topLevel) {
context.setVariable("listOfInitialAssignments", t_61);
}
if(frame.topLevel) {
context.addExport("listOfInitialAssignments", t_61);
}
output += runtime.suppressValue((env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfInitialAssignments")) > 0?"% InitialAssignments":""), env.opts.autoescape);
frame = frame.push();
var t_64 = runtime.contextOrFrameLookup(context, frame, "listOfInitialAssignments");
if(t_64) {t_64 = runtime.fromIterator(t_64);
var t_63 = t_64.length;
for(var t_62=0; t_62 < t_64.length; t_62++) {
var t_65 = t_64[t_62];
frame.set("record", t_65);
frame.set("loop.index", t_62 + 1);
frame.set("loop.index0", t_62);
frame.set("loop.revindex", t_63 - t_62);
frame.set("loop.revindex0", t_63 - t_62 - 1);
frame.set("loop.first", t_62 === 0);
frame.set("loop.last", t_62 === t_63 - 1);
frame.set("loop.length", t_63);
output += "\r\naddrule(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", '";
output += runtime.suppressValue(runtime.memberLookup((t_65),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 102, colno = 79, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_65),"assignments")),"start_")),"toMatlabString"), "record[\"assignments\"][\"start_\"][\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += "', 'initialAssignment');\r\n";
;
}
}
frame = frame.pop();
var t_66;
t_66 = (lineno = 105, colno = 61, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["TimeSwitcher"]));
frame.set("listOfTimeEvents", t_66, true);
if(frame.topLevel) {
context.setVariable("listOfTimeEvents", t_66);
}
if(frame.topLevel) {
context.addExport("listOfTimeEvents", t_66);
}
output += runtime.suppressValue((env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfTimeEvents")) > 0?"% Time Events":""), env.opts.autoescape);
output += "\r\n";
frame = frame.push();
var t_69 = runtime.contextOrFrameLookup(context, frame, "listOfTimeEvents");
if(t_69) {t_69 = runtime.fromIterator(t_69);
var t_68 = t_69.length;
for(var t_67=0; t_67 < t_69.length; t_67++) {
var t_70 = t_69[t_67];
frame.set("event", t_70);
frame.set("loop.index", t_67 + 1);
frame.set("loop.index0", t_67);
frame.set("loop.revindex", t_68 - t_67);
frame.set("loop.revindex0", t_68 - t_67 - 1);
frame.set("loop.first", t_67 === 0);
frame.set("loop.last", t_67 === t_68 - 1);
frame.set("loop.length", t_68);
frame = frame.push();
var t_73 = (lineno = 108, colno = 57, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectRecordsByContext"), "image[\"population\"][\"selectRecordsByContext\"]", context, [runtime.memberLookup((t_70),"id")]));
if(t_73) {t_73 = runtime.fromIterator(t_73);
var t_72 = t_73.length;
for(var t_71=0; t_71 < t_73.length; t_71++) {
var t_74 = t_73[t_71];
frame.set("record", t_74);
frame.set("loop.index", t_71 + 1);
frame.set("loop.index0", t_71);
frame.set("loop.revindex", t_72 - t_71);
frame.set("loop.revindex0", t_72 - t_71 - 1);
frame.set("loop.first", t_71 === 0);
frame.set("loop.last", t_71 === t_72 - 1);
frame.set("loop.length", t_72);
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".dose.";
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += ".";
output += runtime.suppressValue(runtime.memberLookup((t_74),"id"), env.opts.autoescape);
output += " = adddose(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", '";
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += "');\r\n    ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".dose.";
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += ".";
output += runtime.suppressValue(runtime.memberLookup((t_74),"id"), env.opts.autoescape);
output += ".TargetName = '";
output += runtime.suppressValue(runtime.memberLookup((t_74),"id"), env.opts.autoescape);
output += "';\r\n    ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".dose.";
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += ".";
output += runtime.suppressValue(runtime.memberLookup((t_74),"id"), env.opts.autoescape);
output += ".Amount = '";
output += runtime.suppressValue((lineno = 111, colno = 99, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_74),"assignments")),runtime.memberLookup((t_70),"id"))),"toMatlabString"), "record[\"assignments\"][\"event[\"id\"]\"][\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += "';\r\n    ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".dose.";
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += ".";
output += runtime.suppressValue(runtime.memberLookup((t_74),"id"), env.opts.autoescape);
output += ".Interval = ";
if(env.getTest("defined").call(context, runtime.memberLookup((t_70),"period")) === true) {
output += "'";
output += runtime.suppressValue(runtime.memberLookup((t_70),"period"), env.opts.autoescape);
output += "'";
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_70),"periodObj")),"num"), env.opts.autoescape);
;
}
output += ";\r\n    ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".dose.";
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += ".";
output += runtime.suppressValue(runtime.memberLookup((t_74),"id"), env.opts.autoescape);
output += ".RepeatCount = ";
if(env.getTest("defined").call(context, runtime.memberLookup((t_70),"repeatCount")) === true) {
output += "'";
output += runtime.suppressValue(runtime.memberLookup((t_70),"repeatCount"), env.opts.autoescape);
output += "'";
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_70),"repeatCountObj")),"num"), env.opts.autoescape);
;
}
output += ";\r\n    ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".dose.";
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += ".";
output += runtime.suppressValue(runtime.memberLookup((t_74),"id"), env.opts.autoescape);
output += ".StartTime = ";
if(env.getTest("defined").call(context, runtime.memberLookup((t_70),"start")) === true) {
output += "'";
output += runtime.suppressValue(runtime.memberLookup((t_70),"start"), env.opts.autoescape);
output += "'";
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_70),"startObj")),"num"), env.opts.autoescape);
;
}
output += ";\r\n    ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".dose.";
output += runtime.suppressValue(runtime.memberLookup((t_70),"id"), env.opts.autoescape);
output += ".";
output += runtime.suppressValue(runtime.memberLookup((t_74),"id"), env.opts.autoescape);
output += ".Active = true;\r\n";
;
}
}
frame = frame.pop();
;
}
}
frame = frame.pop();
output += "\r\n\r\n";
var t_75;
t_75 = (lineno = 119, colno = 60, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["CondSwitcher"]));
frame.set("listOfCondEvents", t_75, true);
if(frame.topLevel) {
context.setVariable("listOfCondEvents", t_75);
}
if(frame.topLevel) {
context.addExport("listOfCondEvents", t_75);
}
output += runtime.suppressValue((env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfCondEvents")) > 0?"% Events":""), env.opts.autoescape);
output += "\r\n";
frame = frame.push();
var t_78 = runtime.contextOrFrameLookup(context, frame, "listOfCondEvents");
if(t_78) {t_78 = runtime.fromIterator(t_78);
var t_77 = t_78.length;
for(var t_76=0; t_76 < t_78.length; t_76++) {
var t_79 = t_78[t_76];
frame.set("event", t_79);
frame.set("loop.index", t_76 + 1);
frame.set("loop.index0", t_76);
frame.set("loop.revindex", t_77 - t_76);
frame.set("loop.revindex0", t_77 - t_76 - 1);
frame.set("loop.first", t_76 === 0);
frame.set("loop.last", t_76 === t_77 - 1);
frame.set("loop.length", t_77);
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "_id"), env.opts.autoescape);
output += ".event.";
output += runtime.suppressValue(runtime.memberLookup((t_79),"id"), env.opts.autoescape);
output += " = addevent(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "model_id"), env.opts.autoescape);
output += ", '";
output += runtime.suppressValue(runtime.memberLookup((t_79),"condition"), env.opts.autoescape);
output += " >= 0', {";
frame = frame.push();
var t_82 = (lineno = 123, colno = 59, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectRecordsByContext"), "image[\"population\"][\"selectRecordsByContext\"]", context, [runtime.memberLookup((t_79),"id")]));
if(t_82) {t_82 = runtime.fromIterator(t_82);
var t_81 = t_82.length;
for(var t_80=0; t_80 < t_82.length; t_80++) {
var t_83 = t_82[t_80];
frame.set("record", t_83);
frame.set("loop.index", t_80 + 1);
frame.set("loop.index0", t_80);
frame.set("loop.revindex", t_81 - t_80);
frame.set("loop.revindex0", t_81 - t_80 - 1);
frame.set("loop.first", t_80 === 0);
frame.set("loop.last", t_80 === t_81 - 1);
frame.set("loop.length", t_81);
output += "'";
output += runtime.suppressValue(runtime.memberLookup((t_83),"id"), env.opts.autoescape);
output += " = ";
output += runtime.suppressValue((lineno = 124, colno = 68, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_83),"assignments")),runtime.memberLookup((t_79),"id"))),"toMatlabString"), "record[\"assignments\"][\"event[\"id\"]\"][\"toMatlabString\"]", context, [])), env.opts.autoescape);
output += "', ";
;
}
}
frame = frame.pop();
output += "}, 'Notes', '";
output += runtime.suppressValue(runtime.memberLookup((t_79),"notesHTML"), env.opts.autoescape);
output += "', 'Tag', '');\r\n";
;
}
}
frame = frame.pop();
output += "\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["template.slv.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
var t_1;
t_1 = (lineno = 0, colno = 59, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"population")),"selectByClassName"), "_model_[\"population\"][\"selectByClassName\"]", context, ["Compartment"]));
frame.set("compartments", t_1, true);
if(frame.topLevel) {
context.setVariable("compartments", t_1);
}
if(frame.topLevel) {
context.addExport("compartments", t_1);
}
output += "DBSolve Optimum (new parser) 1 Jul 2006\r\nSLV25.00*\r\nNumber of rows in matrix (Number of activities) #";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"processes")), env.opts.autoescape);
output += "\r\nNumber of cols in matrix (Number of compounds) #";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
output += "\r\nInitial System dimension #";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
output += "\r\nSelected Variable(Always TIME for ODE) #3\r\nMaximum Value of the Selected Variable #1.000000e+02\r\nMinimum Value of the Selected Variable #0.000000e+00\r\nInitial Step #";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "method")),"dt"),"1.000000e-03"), env.opts.autoescape);
output += "\r\nMethod Accuracy #";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "method")),"abstol"),"1.000000e-05"), env.opts.autoescape);
output += "\r\nMaximum Number of Method Steps #10000\r\n1st Variale for plotting   #t\r\n2nd Variable for plotting: #X[1]\r\n1st Value Maximum for plotting #1.000000e+02\r\n1st Value Minimum for plotting #0.000000e+00\r\n2nd Value Maximum for plotting #1.000000e+00\r\n2nd Value Minimum for plotting #0.000000e+00\r\nDistance between Plotting points #1.000000e+02\r\nStep for Numerical derivation #1.000000e-05\r\n(Internal) DbsolveStep WWW Demo #2122\r\nElementary Constant #1\r\nFileOutput #0\r\nTextOutput #1\r\nDrawOutput #1\r\nTransferLast #0\r\nStoichiometric Matrix\r\n#";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("sm"))(env, context, frame, runtime, function(t_3,t_2) {
if(t_3) { cb(t_3); return; }
output += t_2;
output += "0 0 0.0\r\n&\r\nElementary Constants\r\n#1.944853e+00  1.931480e+00  1.147163e+00  1.263037e+00\r\nInitial concentrations\r\n#1.657051e+00  1.926045e+00  1.153910e+00\r\nInitial Stiffness\r\n#0.000000e+00 0.000000e+00 0.000000e+00\r\nInitial Family Steps\r\n#1.000000e+00  1.000000e+00  1.000000e+00\r\nNumber of fitting parameters (Old Income Flux Constant Number)\r\n#53\r\nNumber of scan parameters\r\n#53\r\nABsolute Fitting\r\n#1\r\nVariables for FileOutput\r\n#";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("outputVars"))(env, context, frame, runtime, function(t_5,t_4) {
if(t_5) { cb(t_5); return; }
output += t_4;
output += " #####\r\nVariables for FileOutputOn\r\n# #####\r\n(Internal) Temporary Print Option\r\n#0\r\nLeastFitting\r\n#1\r\nOutput File Name\r\n#output.txt\r\nExperimental Data File Name\r\n#pw.dat\r\nRight Hand Sides &&\r\nInitial Values &&\r\nComments Or Selkov DB record\r\n#\r\n\r\n#\r\n\r\n#\r\n\r\n#dbs#\r\nThe Number of Active P[i] for fitting\r\n#2\r\nRelative step\r\n#1.000000e-01\r\nTolerance for fitting sens\r\n#1.000000e-03\r\nTolerance for fitting\r\n#1.000000e-05\r\nStep for fitting\r\n#1.000000e-03\r\nIndexes of P[i] for fitting\r\n#1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 0 0 0\r\nMinimum for fitting\r\n#0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00\r\nMaximum for fitting\r\n#1.000000e+02 1.000000e+02 1.000000e+02 1.000000e+02 1.000000e+02 1.000000e+02 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00\r\nStep for fitting\r\n#1.000000e-02 1.000000e-02 1.000000e-02 1.000000e-02 1.000000e-02 1.000000e-02 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00\r\nIsLog flag for fitting\r\n#0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\r\nUse Implicit Solving Method  Flag\r\n#0\r\nUse Experimental Data Flag\r\n#1\r\nThe Number of Active P[i] for scan\r\n#2\r\nMinimum for param scan\r\n#0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00\r\nMaximum for param scan\r\n#1.000000e+02 1.000000e+02 1.000000e+02 1.000000e+02 1.000000e+02 1.000000e+02 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00 0.000000e+00\r\nDivisions for param scan\r\n#0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\r\nIterations for param scan\r\n#0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\r\nPathway Name\r\n#Name_of_the_process\r\nChart file Name\r\n#tmp.bmp\r\nCompound index\r\n#0.000000e+00  0.000000e+00  0.000000e+00\r\nCompound Location\r\n#0.000000e+00  0.000000e+00  0.000000e+00\r\nEC code index\r\n#0.000000e+00  0.000000e+00\r\nEnzyme location\r\n#0.000000e+00  0.000000e+00\r\nCompound concentration\r\n#0.000000e+00  0.000000e+00  0.000000e+00\r\nEnzyme Concentrations\r\n#0.000000e+00  0.000000e+00\r\nIndexes of Mechanisms\r\n#0  0\r\nCleland Indexes 1->A 2->B 3->C -1->P -2->Q\r\n#0 0 0\r\nElementary constants";
frame = frame.push();
var t_8 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"processes");
if(t_8) {t_8 = runtime.fromIterator(t_8);
var t_7 = t_8.length;
for(var t_6=0; t_6 < t_8.length; t_6++) {
var t_9 = t_8[t_6];
frame.set("reaction", t_9);
frame.set("loop.index", t_6 + 1);
frame.set("loop.index0", t_6);
frame.set("loop.revindex", t_7 - t_6);
frame.set("loop.revindex0", t_7 - t_6 - 1);
frame.set("loop.first", t_6 === 0);
frame.set("loop.last", t_6 === t_7 - 1);
frame.set("loop.length", t_7);
output += "\r\n#0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00";
;
}
}
frame = frame.pop();
output += "\r\nKinetic constants";
frame = frame.push();
var t_12 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"processes");
if(t_12) {t_12 = runtime.fromIterator(t_12);
var t_11 = t_12.length;
for(var t_10=0; t_10 < t_12.length; t_10++) {
var t_13 = t_12[t_10];
frame.set("reaction", t_13);
frame.set("loop.index", t_10 + 1);
frame.set("loop.index0", t_10);
frame.set("loop.revindex", t_11 - t_10);
frame.set("loop.revindex0", t_11 - t_10 - 1);
frame.set("loop.first", t_10 === 0);
frame.set("loop.last", t_10 === t_11 - 1);
frame.set("loop.length", t_11);
output += "\r\n#0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00  0.000000e+00";
;
}
}
frame = frame.pop();
output += "\r\nX Concentration\r\n#0.000000e+00  0.000000e+00  0.000000e+00\r\nOrganism Indexes(only for Enzymes)\r\n#0 0\r\n>Tigr_Sequence_IDs\r\n";
frame = frame.push();
var t_16 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"processes");
if(t_16) {t_16 = runtime.fromIterator(t_16);
var t_15 = t_16.length;
for(var t_14=0; t_14 < t_16.length; t_14++) {
var t_17 = t_16[t_14];
frame.set("reaction", t_17);
frame.set("loop.index", t_14 + 1);
frame.set("loop.index0", t_14);
frame.set("loop.revindex", t_15 - t_14);
frame.set("loop.revindex0", t_15 - t_14 - 1);
frame.set("loop.first", t_14 === 0);
frame.set("loop.last", t_14 === t_15 - 1);
frame.set("loop.length", t_15);
output += "#\r\n";
;
}
}
frame = frame.pop();
output += ">E.coli_Ids\r\n";
frame = frame.push();
var t_20 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"processes");
if(t_20) {t_20 = runtime.fromIterator(t_20);
var t_19 = t_20.length;
for(var t_18=0; t_18 < t_20.length; t_18++) {
var t_21 = t_20[t_18];
frame.set("reaction", t_21);
frame.set("loop.index", t_18 + 1);
frame.set("loop.index0", t_18);
frame.set("loop.revindex", t_19 - t_18);
frame.set("loop.revindex0", t_19 - t_18 - 1);
frame.set("loop.first", t_18 === 0);
frame.set("loop.last", t_18 === t_19 - 1);
frame.set("loop.length", t_19);
output += "#\r\n";
;
}
}
frame = frame.pop();
output += ">Similarity_Comment_IDs\r\n#0 0\r\nFamilyOption\r\n#0\r\nFamilyTimes\r\n#1\r\nFamilyStep\r\n#1.000000e+00\r\nTitle for X Axes\r\n#0\r\nTitle for Y Axes\r\n#0\r\nUse ODE's Solver Flag for fitting\r\n#1\r\nUse Sensitivity coefficients\r\n#0\r\nType of the bifurcation curve\r\n#0\r\nIndices of Active bifurcation parameters\r\n#1 0\r\nMinimum for Active bifurcation parameters\r\n#0.000000e+00 0.000000e+00\r\nMaximum for Active bifurcation parameters\r\n#1.000000e+02 1.000000e+02\r\nInitial Steps for Active bifurcation parameters\r\n#1.000000e+00 0.000000e+00\r\nUse Linlbf Solver Flag for fitting\r\n#0\r\nRedraw Plot Window\r\n#0\r\nVariable for Family\r\n#k1\r\nSign for Family\r\n#+\r\nInitial  for Family\r\n#1.000000e+00\r\nImplicit Algebraic System Dimension\r\n#3\r\nImplicit Selected Variable\r\n#3\r\nImplicit Selected Variable Min\r\n#0.000000e+00\r\nImplicit Selected Variable Max\r\n#1.000000e+01\r\nImplicit Steps Number\r\n#10000\r\nImplicit Initial Step\r\n#1.000000\r\nImplicit Tolerance\r\n#1.000000e-03\r\nExplicit Selected Variable\r\n#5\r\nExplicit Selected Variable Min\r\n#-1.000000e+02\r\nExplicit Selected Variable Max\r\n#1.000000e+02\r\nExplicit Initial Step\r\n#1.000000\r\nBifurcation Algebraic System Dimension\r\n#0\r\nBifurcation Selected Variable\r\n#4\r\nBifurcation Selected Variable Min\r\n#-1.000000e+01\r\nBifurcation Selected Variable Max\r\n#1.000000e+01\r\nBifurcation Steps Number\r\n#1\r\nBifurcation Initial Step\r\n#0.100000\r\nBifurcation Tolerance\r\n#1.000000e-03\r\nODE 1st Variale for plotting  #t\r\nODE 2nd Variable for plotting #X[1]\r\nODE 1st Value Maximum for plotting #0.000000e+00\r\nODE 1st Value Minimum for plotting #0.000000e+00\r\nODE 2nd Value Maximum for plotting #0.000000e+00\r\nODE 2nd Value Minimum for plotting #0.000000e+00\r\nODE Title for X Axes\r\n#Time\r\nODE Title for Y Axes\r\n#X[1]\r\nBET 1st Variale for plotting  #k1\r\nBET 2nd Variable for plotting #X[1]\r\nBET 1st Value Maximum for plotting #0.000000e+00\r\nBET 1st Value Minimum for plotting #0.000000e+00\r\nBET 2nd Value Maximum for plotting #0.000000e+00\r\nBET 2nd Value Minimum for plotting #0.000000e+00\r\nBET Title for X Axes\r\n#k1\r\nBET Title for Y Axes\r\n#X[1]\r\nALG 1st Variale for plotting  #k1\r\nALG 2nd Variable for plotting #F[1]\r\nALG 1st Value Maximum for plotting #0.000000e+00\r\nALG 1st Value Minimum for plotting #0.000000e+00\r\nALG 2nd Value Maximum for plotting #0.000000e+00\r\nALG 2nd Value Minimum for plotting #0.000000e+00\r\nALG Title for X Axes\r\n#k1\r\nALG Title for Y Axes\r\n#F[1]\r\nBIF 1st Variale for plotting  #k1\r\nBIF 2nd Variable for plotting #k2\r\nBIF 1st Value Maximum for plotting #0.000000e+00\r\nBIF 1st Value Minimum for plotting #0.000000e+00\r\nBIF 2nd Value Maximum for plotting #0.000000e+00\r\nBIF 2nd Value Minimum for plotting #0.000000e+00\r\nBIF Title for X Axes\r\n#k1\r\nBIF Title for Y Axes\r\n#k2\r\nFIT 1st Variale for plotting  #fitterIteration\r\nFIT 2nd Variable for plotting #F[0]\r\nFIT 1st Value Maximum for plotting #0.000000e+00\r\nFIT 1st Value Minimum for plotting #0.000000e+00\r\nFIT 2nd Value Maximum for plotting #0.000000e+00\r\nFIT 2nd Value Minimum for plotting #0.000000e+00\r\nFIT Title for X Axes\r\n#fitterIteration\r\nFIT Title for Y Axes\r\n#F[0]\r\n>Reaction Names\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("reactionNames"))(env, context, frame, runtime, function(t_23,t_22) {
if(t_23) { cb(t_23); return; }
output += t_22;
output += ">Compound Names\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("compoundNames"))(env, context, frame, runtime, function(t_25,t_24) {
if(t_25) { cb(t_25); return; }
output += t_24;
output += ">Mechanism Rate Low expression -Kinetic or Elementary constants\r\n#0 0\r\n>Mechanism  Rate (Fast)\r\n#0 0\r\n>Parameters for Fitting\r\n#k1\r\n#k2\r\n#k3\r\n#k4\r\n#k5\r\n#k6\r\n#P[7]\r\n#P[8]\r\n#P[9]\r\n#P[10]\r\n#P[11]\r\n#P[12]\r\n#P[13]\r\n#P[14]\r\n#P[15]\r\n#P[16]\r\n#P[17]\r\n#P[18]\r\n#P[19]\r\n#P[20]\r\n#P[21]\r\n#P[22]\r\n#P[23]\r\n#P[24]\r\n#P[25]\r\n#P[26]\r\n#P[27]\r\n#P[28]\r\n#P[29]\r\n#P[30]\r\n#P[31]\r\n#P[32]\r\n#P[33]\r\n#P[34]\r\n#P[35]\r\n#P[36]\r\n#P[37]\r\n#P[38]\r\n#P[39]\r\n#P[40]\r\n#P[41]\r\n#P[42]\r\n#P[43]\r\n#P[44]\r\n#P[45]\r\n#P[46]\r\n#P[47]\r\n#P[48]\r\n#P[49]\r\n#P[50]\r\n#P[1]\r\n#P[2]\r\n#P[3]\r\n>Parameters for Scan\r\n#k1\r\n#k2\r\n#k3\r\n#k4\r\n#k5\r\n#k6\r\n#P[7]\r\n#P[8]\r\n#P[9]\r\n#P[10]\r\n#P[11]\r\n#P[12]\r\n#P[13]\r\n#P[14]\r\n#P[15]\r\n#P[16]\r\n#P[17]\r\n#P[18]\r\n#P[19]\r\n#P[20]\r\n#P[21]\r\n#P[22]\r\n#P[23]\r\n#P[24]\r\n#P[25]\r\n#P[26]\r\n#P[27]\r\n#P[28]\r\n#P[29]\r\n#P[30]\r\n#P[31]\r\n#P[32]\r\n#P[33]\r\n#P[34]\r\n#P[35]\r\n#P[36]\r\n#P[37]\r\n#P[38]\r\n#P[39]\r\n#P[40]\r\n#P[41]\r\n#P[42]\r\n#P[43]\r\n#P[44]\r\n#P[45]\r\n#P[46]\r\n#P[47]\r\n#P[48]\r\n#P[49]\r\n#P[50]\r\n#P[1]\r\n#P[2]\r\n#P[3]\r\n>Parameters for Bifurcation\r\n#k4\r\n#P[5]\r\n#P[6]\r\n#P[7]\r\n#P[8]\r\n#P[9]\r\n#P[10]\r\n#P[11]\r\n#P[12]\r\n#P[13]\r\n#P[14]\r\n#P[15]\r\n#P[16]\r\n#P[17]\r\n#P[18]\r\n#P[19]\r\n#P[20]\r\n#P[21]\r\n#P[22]\r\n#P[23]\r\n#P[24]\r\n#P[25]\r\n#P[26]\r\n#P[27]\r\n#P[28]\r\n#P[29]\r\n#P[30]\r\n#P[31]\r\n#P[32]\r\n#P[33]\r\n#P[34]\r\n#P[35]\r\n#P[36]\r\n#P[37]\r\n#P[38]\r\n#P[39]\r\n#P[40]\r\n#P[41]\r\n#P[42]\r\n#P[43]\r\n#P[44]\r\n#P[45]\r\n#P[46]\r\n#P[47]\r\n#P[48]\r\n#P[49]\r\n#P[50]\r\n#P[50]\r\n#P[50]\r\n#P[50]\r\n#P[50]\r\n#P[50]\r\n#P[50]\r\n>Parameters for Implicit\r\n#k1\r\n#X[10]\r\n#X[11]\r\n#X[12]\r\n#X[13]\r\n#X[14]\r\n#X[15]\r\n#X[16]\r\n#X[17]\r\n#X[18]\r\n#X[19]\r\n#X[20]\r\n#X[21]\r\n#X[22]\r\n#X[23]\r\n#X[24]\r\n#X[25]\r\n#X[26]\r\n#X[27]\r\n#X[28]\r\n#X[29]\r\n#X[30]\r\n#X[31]\r\n#X[32]\r\n#X[33]\r\n#X[34]\r\n#X[35]\r\n#X[36]\r\n#X[37]\r\n#X[38]\r\n#X[39]\r\n#X[40]\r\n#X[41]\r\n#X[42]\r\n#X[43]\r\n#X[44]\r\n#X[45]\r\n#X[46]\r\n#X[47]\r\n#X[48]\r\n#X[49]\r\n#X[50]\r\n#X[3]\r\n#X[2]\r\n#X[6]\r\n#X[4]\r\n#X[5]\r\n#X[6]\r\n#X[7]\r\n#X[8]\r\n#X[9]\r\n#X[10]\r\n#X[11]\r\n>Parameters for Explicit\r\n#k1\r\n#X[11]\r\n#X[12]\r\n#X[13]\r\n#X[14]\r\n#X[15]\r\n#X[16]\r\n#X[17]\r\n#X[18]\r\n#X[19]\r\n#X[20]\r\n#X[21]\r\n#X[22]\r\n#X[23]\r\n#X[24]\r\n#X[25]\r\n#X[26]\r\n#X[27]\r\n#X[28]\r\n#X[29]\r\n#X[30]\r\n#X[31]\r\n#X[32]\r\n#X[33]\r\n#X[34]\r\n#X[35]\r\n#X[36]\r\n#X[37]\r\n#X[38]\r\n#X[39]\r\n#X[40]\r\n#X[41]\r\n#X[42]\r\n#X[43]\r\n#X[44]\r\n#X[45]\r\n#X[46]\r\n#X[47]\r\n#X[48]\r\n#X[49]\r\n#X[50]\r\n#X[50]\r\n#X[50]\r\n#X[50]\r\n#X[50]\r\n#X[50]\r\n#X[47]\r\n#X[48]\r\n#X[49]\r\n#X[50]\r\n#X[51]\r\n#X[52]\r\n#X[53]\r\nZ axis ODE#\r\nZ axis BET#\r\nZ axis ALG#\r\nZ axis BIF#\r\nZ axis FIT#\r\n>Parameters for Sensitivity\r\n#P[1]\r\n#P[2]\r\n#P[3]\r\n#P[4]\r\n#P[5]\r\n#P[6]\r\n#P[7]\r\n#P[8]\r\n#P[9]\r\n#P[10]\r\n#P[11]\r\n#P[12]\r\n#P[13]\r\n#P[14]\r\n#P[15]\r\n#P[16]\r\n#P[17]\r\n#P[18]\r\n#P[19]\r\n#P[20]\r\n#P[21]\r\n#P[22]\r\n#P[23]\r\n#P[24]\r\n#P[25]\r\n#P[26]\r\n#P[27]\r\n#P[28]\r\n#P[29]\r\n#P[30]\r\n#P[31]\r\n#P[32]\r\n#P[33]\r\n#P[34]\r\n#P[35]\r\n#P[36]\r\n#P[37]\r\n#P[38]\r\n#P[39]\r\n#P[40]\r\n#P[41]\r\n#P[42]\r\n#P[43]\r\n#P[44]\r\n#P[45]\r\n#P[46]\r\n#P[47]\r\n#P[48]\r\n#P[49]\r\n#P[50]\r\n#P[51]\r\n#P[52]\r\n#P[53]\r\n>Compound Selkov Names\r\n";
frame = frame.push();
var t_28 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_28) {t_28 = runtime.fromIterator(t_28);
var t_27 = t_28.length;
for(var t_26=0; t_26 < t_28.length; t_26++) {
var t_29 = t_28[t_26];
frame.set("compound", t_29);
frame.set("loop.index", t_26 + 1);
frame.set("loop.index0", t_26);
frame.set("loop.revindex", t_27 - t_26);
frame.set("loop.revindex0", t_27 - t_26 - 1);
frame.set("loop.first", t_26 === 0);
frame.set("loop.last", t_26 === t_27 - 1);
frame.set("loop.length", t_27);
output += "#\r\n";
;
}
}
frame = frame.pop();
output += ">Selkov Location\r\n";
frame = frame.push();
var t_32 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_32) {t_32 = runtime.fromIterator(t_32);
var t_31 = t_32.length;
for(var t_30=0; t_30 < t_32.length; t_30++) {
var t_33 = t_32[t_30];
frame.set("compound", t_33);
frame.set("loop.index", t_30 + 1);
frame.set("loop.index0", t_30);
frame.set("loop.revindex", t_31 - t_30);
frame.set("loop.revindex0", t_31 - t_30 - 1);
frame.set("loop.first", t_30 === 0);
frame.set("loop.last", t_30 === t_31 - 1);
frame.set("loop.length", t_31);
output += "#\r\n";
;
}
}
frame = frame.pop();
output += ">Selkov ReactionName\r\n";
frame = frame.push();
var t_36 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"processes");
if(t_36) {t_36 = runtime.fromIterator(t_36);
var t_35 = t_36.length;
for(var t_34=0; t_34 < t_36.length; t_34++) {
var t_37 = t_36[t_34];
frame.set("reaction", t_37);
frame.set("loop.index", t_34 + 1);
frame.set("loop.index0", t_34);
frame.set("loop.revindex", t_35 - t_34);
frame.set("loop.revindex0", t_35 - t_34 - 1);
frame.set("loop.first", t_34 === 0);
frame.set("loop.last", t_34 === t_35 - 1);
frame.set("loop.length", t_35);
output += "#\r\n";
;
}
}
frame = frame.pop();
output += "Metabolic Regulation ReactionName\r\n#0 0\r\nMetabolic Regulation CompoundName\r\nMetabolicRegulation\r\n#0 0 0\r\nOperon Name Operon\r\n#0 0\r\nGene Name Operon\r\nOperon Structure\r\n#0 0 0\r\nGeneticNetwork InteractionName\r\n#0 0\r\nGeneticNetwork GeneProductName\r\nGenetic Network\r\n#0 0 0\r\nInteraction ProcessName\r\n#0 0\r\nInteraction GeneProductName\r\nInteractionNetwork\r\n#0 0 0\r\n<Interaction Regulation ProcessName\r\n#0 0\r\n<Interaction Regulation GeneProductName\r\n<InteractionRegulation\r\n#0 0 0\r\n<PATH->ReverseReactionID\r\n#0 0\r\n<PATH->ExternalFluxID\r\n#0 0\r\n<PATH->Type\r\n#0 0 0\r\n<PON->Type\r\n#\r\n<PIN->Type\r\n#\r\n<Metabolic model Dimension\r\n#";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"processes")), env.opts.autoescape);
output += " ";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
output += "\r\n<Total Cellular Model Dimension\r\n#0 0\r\n<Total Cellular Process Names\r\n<Total Entity Names\r\n<Index Link to metabolic\r\n#\r\n<Index Link to genetic\r\n#\r\n<Index Link to protein\r\n#\r\n<Total Network Matrix\r\n#0 0 0\r\n<Total Regulation Network\r\n#0 0 0\r\n<E Index Total\r\n#\r\n<P Index Total\r\n#\r\n<E Index Metabolic\r\n#0 0 0\r\n<P Index Metabolic\r\n#0 0\r\n<E Index Genetic\r\n#\r\n<P Index Genetic\r\n#\r\n<E Index Protein\r\n#\r\n<P Index Protein\r\n#\r\n<M Reaction Laws\r\n";
frame = frame.push();
var t_40 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_40) {t_40 = runtime.fromIterator(t_40);
var t_39 = t_40.length;
for(var t_38=0; t_38 < t_40.length; t_38++) {
var t_41 = t_40[t_38];
frame.set("compound", t_41);
frame.set("loop.index", t_38 + 1);
frame.set("loop.index0", t_38);
frame.set("loop.revindex", t_39 - t_38);
frame.set("loop.revindex0", t_39 - t_38 - 1);
frame.set("loop.first", t_38 === 0);
frame.set("loop.last", t_38 === t_39 - 1);
frame.set("loop.length", t_39);
output += "#\r\n\r\n";
;
}
}
frame = frame.pop();
output += "<P Use User's mechanisms\r\n#0 0\r\n\r\n<POOLS 0\r\n#\r\n\r\n#\r\n\r\n<POOLS 1\r\n#\r\n\r\n#\r\n\r\n<POOLS 2\r\n#\r\n\r\n#\r\n\r\n<POOLS 3\r\n#\r\n\r\n#\r\n\r\n<RHS 0\r\n#\r\n\r\n#\r\n\r\n<RHS 1\r\n#\r\n/*\r\n  This code is automatically generated by Heta compiler\r\n*/\r\n// ifelse not implemented\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("rhs"))(env, context, frame, runtime, function(t_43,t_42) {
if(t_43) { cb(t_43); return; }
output += t_42;
output += "\r\n#\r\n\r\n<RHS 2\r\n#\r\n//! Pools\r\n\r\n#\r\n\r\n<RHS 3\r\n#\r\n\r\n#\r\n\r\n<INI 0\r\n#\r\n\r\n#\r\n\r\n<INI 1\r\n#\r\n/*\r\n  This code is automatically generated by Heta compiler\r\n*/\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("iv"))(env, context, frame, runtime, function(t_45,t_44) {
if(t_45) { cb(t_45); return; }
output += t_44;
output += "\r\n#\r\n\r\n<INI 2\r\n#\r\n\r\n#\r\n\r\n<INI 3\r\n#\r\n\r\n#\r\n\r\n<POOLS 4\r\n#\r\n\r\n#\r\n\r\n<POOLS 5\r\n#\r\n\r\n#\r\n\r\n<POOLS 6\r\n#\r\n\r\n#\r\n\r\n<POOLS 7\r\n#\r\n\r\n#\r\n\r\n<RHS 4\r\n#\r\n\r\n#\r\n\r\n<RHS 5\r\n#\r\n\r\n#\r\n\r\n<RHS 6\r\n#\r\n\r\n#\r\n\r\n<RHS 7\r\n#\r\n\r\n#\r\n\r\n<INI 4\r\n#\r\n\r\n#\r\n\r\n<INI 5\r\n#\r\n\r\n#\r\n\r\n<INI 6\r\n#\r\n\r\n#\r\n\r\n<INI 7\r\n#\r\n\r\n#\r\n\r\nUseUsersPools[1]\r\n#0\r\nUseUsersPools[2]\r\n#0\r\nUseUsersPools[3]\r\n#0\r\nUseUsersPools[4]\r\n#0\r\n\r\n<NetworkID\r\n#0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\r\n<ProcessID\r\n#0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\r\n<RateLawID\r\n#0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\r\n<ParameterID\r\n#0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\r\n\r\nPATH->UserLaws\r\n<P Use User's mechanisms\r\n#0 0\r\n\r\nTCN->UserLaws\r\n<P Use User's mechanisms\r\n#\r\n\r\nPON->UserLaws\r\n<P Use User's mechanisms\r\n#\r\n\r\nPIN->UserLaws\r\n<P Use User's mechanisms\r\n#\r\nFBA internal fluxes constraints\r\n";
frame = frame.push();
var t_48 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"processes");
if(t_48) {t_48 = runtime.fromIterator(t_48);
var t_47 = t_48.length;
for(var t_46=0; t_46 < t_48.length; t_46++) {
var t_49 = t_48[t_46];
frame.set("reaction", t_49);
frame.set("loop.index", t_46 + 1);
frame.set("loop.index0", t_46);
frame.set("loop.revindex", t_47 - t_46);
frame.set("loop.revindex0", t_47 - t_46 - 1);
frame.set("loop.first", t_46 === 0);
frame.set("loop.last", t_46 === t_47 - 1);
frame.set("loop.length", t_47);
output += "#0 0.000000e+00  0 0.000000e+00  0 0.000000e+00\r\n";
;
}
}
frame = frame.pop();
output += "External metabolites\r\n#0  0  0\r\nExchange fluxes direction\r\n#0  0  0\r\nExchange fluxes constraints";
frame = frame.push();
var t_52 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_52) {t_52 = runtime.fromIterator(t_52);
var t_51 = t_52.length;
for(var t_50=0; t_50 < t_52.length; t_50++) {
var t_53 = t_52[t_50];
frame.set("compound", t_53);
frame.set("loop.index", t_50 + 1);
frame.set("loop.index0", t_50);
frame.set("loop.revindex", t_51 - t_50);
frame.set("loop.revindex0", t_51 - t_50 - 1);
frame.set("loop.first", t_50 === 0);
frame.set("loop.last", t_50 === t_51 - 1);
frame.set("loop.length", t_51);
output += "\r\n#0 0.000000e+00  0 0.000000e+00  0 0.000000e+00";
;
}
}
frame = frame.pop();
output += "\r\nMetabolites biomass composition\r\n#0  0  0\r\nMetabolites maintenance energy requirements composition\r\n#0  0  0\r\nUse biomass flux\r\n#0\r\nBiomass constraint\r\n#0 0  0 0  0 0\r\nUse maintenance flux\r\n#0\r\nMaintenance energy requirements constraint\r\n#0 0  0 0  0 0\r\nBiomass objective function contribution\r\n#0\r\nMaintenance energy requirements objective function contribution\r\n#0\r\nInternal fluxes objective function contribution\r\n#0  0\r\nExchange fluxes objective function contribution\r\n#0  0  0\r\nMaximize objective function\r\n#0\r\n\r\n<COMMENTS 0\r\n#\r\n\r\n#dbs#\r\n\r\n<COMMENTS 1\r\n#\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("comments"))(env, context, frame, runtime, function(t_55,t_54) {
if(t_55) { cb(t_55); return; }
output += t_54;
output += "\r\n#dbs#\r\n\r\n<COMMENTS 2\r\n#\r\n\r\n#dbs#\r\n\r\n<COMMENTS 3\r\n#\r\n\r\n#dbs#\r\n\r\n<COMMENTS 4\r\n#\r\n\r\n#dbs#\r\n\r\n<COMMENTS 5\r\n#\r\n\r\n#dbs#\r\n\r\n<COMMENTS 6\r\n#\r\n\r\n#dbs#\r\n\r\n<COMMENTS 7\r\n#\r\n\r\n#dbs#\r\n0\r\n0\r\n0\r\n0\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "compartments")), env.opts.autoescape);
frame = frame.push();
var t_58 = runtime.contextOrFrameLookup(context, frame, "compartments");
if(t_58) {t_58 = runtime.fromIterator(t_58);
var t_57 = t_58.length;
for(var t_56=0; t_56 < t_58.length; t_56++) {
var t_59 = t_58[t_56];
frame.set("compartment", t_59);
frame.set("loop.index", t_56 + 1);
frame.set("loop.index0", t_56);
frame.set("loop.revindex", t_57 - t_56);
frame.set("loop.revindex0", t_57 - t_56 - 1);
frame.set("loop.first", t_56 === 0);
frame.set("loop.last", t_56 === t_57 - 1);
frame.set("loop.length", t_57);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_59),"id"), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "\r\n0\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "compartments")), env.opts.autoescape);
frame = frame.push();
var t_62 = runtime.contextOrFrameLookup(context, frame, "compartments");
if(t_62) {t_62 = runtime.fromIterator(t_62);
var t_61 = t_62.length;
for(var t_60=0; t_60 < t_62.length; t_60++) {
var t_63 = t_62[t_60];
frame.set("compartment", t_63);
frame.set("loop.index", t_60 + 1);
frame.set("loop.index0", t_60);
frame.set("loop.revindex", t_61 - t_60);
frame.set("loop.revindex0", t_61 - t_60 - 1);
frame.set("loop.first", t_60 === 0);
frame.set("loop.last", t_60 === t_61 - 1);
frame.set("loop.length", t_61);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"index0"), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "compartments")), env.opts.autoescape);
frame = frame.push();
var t_66 = runtime.contextOrFrameLookup(context, frame, "compartments");
if(t_66) {t_66 = runtime.fromIterator(t_66);
var t_65 = t_66.length;
for(var t_64=0; t_64 < t_66.length; t_64++) {
var t_67 = t_66[t_64];
frame.set("compartment", t_67);
frame.set("loop.index", t_64 + 1);
frame.set("loop.index0", t_64);
frame.set("loop.revindex", t_65 - t_64);
frame.set("loop.revindex0", t_65 - t_64 - 1);
frame.set("loop.first", t_64 === 0);
frame.set("loop.last", t_64 === t_65 - 1);
frame.set("loop.length", t_65);
output += "\r\n";
;
}
}
frame = frame.pop();
output += "\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "compartments")), env.opts.autoescape);
frame = frame.push();
var t_70 = runtime.contextOrFrameLookup(context, frame, "compartments");
if(t_70) {t_70 = runtime.fromIterator(t_70);
var t_69 = t_70.length;
for(var t_68=0; t_68 < t_70.length; t_68++) {
var t_71 = t_70[t_68];
frame.set("compartment", t_71);
frame.set("loop.index", t_68 + 1);
frame.set("loop.index0", t_68);
frame.set("loop.revindex", t_69 - t_68);
frame.set("loop.revindex0", t_69 - t_68 - 1);
frame.set("loop.first", t_68 === 0);
frame.set("loop.last", t_68 === t_69 - 1);
frame.set("loop.length", t_69);
output += "\r\nfalse";
;
}
}
frame = frame.pop();
output += "\r\n0\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "compartments")), env.opts.autoescape);
frame = frame.push();
var t_74 = runtime.contextOrFrameLookup(context, frame, "compartments");
if(t_74) {t_74 = runtime.fromIterator(t_74);
var t_73 = t_74.length;
for(var t_72=0; t_72 < t_74.length; t_72++) {
var t_75 = t_74[t_72];
frame.set("compartment", t_75);
frame.set("loop.index", t_72 + 1);
frame.set("loop.index0", t_72);
frame.set("loop.revindex", t_73 - t_72);
frame.set("loop.revindex0", t_73 - t_72 - 1);
frame.set("loop.first", t_72 === 0);
frame.set("loop.last", t_72 === t_73 - 1);
frame.set("loop.length", t_73);
output += "\r\n1.00";
;
}
}
frame = frame.pop();
output += "\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "compartments")), env.opts.autoescape);
frame = frame.push();
var t_78 = runtime.contextOrFrameLookup(context, frame, "compartments");
if(t_78) {t_78 = runtime.fromIterator(t_78);
var t_77 = t_78.length;
for(var t_76=0; t_76 < t_78.length; t_76++) {
var t_79 = t_78[t_76];
frame.set("compartment", t_79);
frame.set("loop.index", t_76 + 1);
frame.set("loop.index0", t_76);
frame.set("loop.revindex", t_77 - t_76);
frame.set("loop.revindex0", t_77 - t_76 - 1);
frame.set("loop.first", t_76 === 0);
frame.set("loop.last", t_76 === t_77 - 1);
frame.set("loop.length", t_77);
output += "\r\n3";
;
}
}
frame = frame.pop();
output += "\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
frame = frame.push();
var t_82 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_82) {t_82 = runtime.fromIterator(t_82);
var t_81 = t_82.length;
for(var t_80=0; t_80 < t_82.length; t_80++) {
var t_83 = t_82[t_80];
frame.set("compound", t_83);
frame.set("loop.index", t_80 + 1);
frame.set("loop.index0", t_80);
frame.set("loop.revindex", t_81 - t_80);
frame.set("loop.revindex0", t_81 - t_80 - 1);
frame.set("loop.first", t_80 === 0);
frame.set("loop.last", t_80 === t_81 - 1);
frame.set("loop.length", t_81);
output += "\r\n";
output += runtime.suppressValue(runtime.memberLookup((t_83),"id"), env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "\r\n0\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
frame = frame.push();
var t_86 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_86) {t_86 = runtime.fromIterator(t_86);
var t_85 = t_86.length;
for(var t_84=0; t_84 < t_86.length; t_84++) {
var t_87 = t_86[t_84];
frame.set("compound", t_87);
frame.set("loop.index", t_84 + 1);
frame.set("loop.index0", t_84);
frame.set("loop.revindex", t_85 - t_84);
frame.set("loop.revindex0", t_85 - t_84 - 1);
frame.set("loop.first", t_84 === 0);
frame.set("loop.last", t_84 === t_85 - 1);
frame.set("loop.length", t_85);
output += "\r\n";
if(runtime.memberLookup((t_87),"className") !== "Species" || runtime.memberLookup((t_87),"isAmount")) {
output += "default_compartment_";
;
}
else {
output += runtime.suppressValue(runtime.memberLookup((t_87),"compartment"), env.opts.autoescape);
;
}
;
}
}
frame = frame.pop();
output += "\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
frame = frame.push();
var t_90 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_90) {t_90 = runtime.fromIterator(t_90);
var t_89 = t_90.length;
for(var t_88=0; t_88 < t_90.length; t_88++) {
var t_91 = t_90[t_88];
frame.set("compound", t_91);
frame.set("loop.index", t_88 + 1);
frame.set("loop.index0", t_88);
frame.set("loop.revindex", t_89 - t_88);
frame.set("loop.revindex0", t_89 - t_88 - 1);
frame.set("loop.first", t_88 === 0);
frame.set("loop.last", t_88 === t_89 - 1);
frame.set("loop.length", t_89);
output += "\r\n0.0";
;
}
}
frame = frame.pop();
output += "\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
frame = frame.push();
var t_94 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_94) {t_94 = runtime.fromIterator(t_94);
var t_93 = t_94.length;
for(var t_92=0; t_92 < t_94.length; t_92++) {
var t_95 = t_94[t_92];
frame.set("compound", t_95);
frame.set("loop.index", t_92 + 1);
frame.set("loop.index0", t_92);
frame.set("loop.revindex", t_93 - t_92);
frame.set("loop.revindex0", t_93 - t_92 - 1);
frame.set("loop.first", t_92 === 0);
frame.set("loop.last", t_92 === t_93 - 1);
frame.set("loop.length", t_93);
output += "\r\n0.000000";
;
}
}
frame = frame.pop();
output += "\r\n0\r\n0\r\n0\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
frame = frame.push();
var t_98 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_98) {t_98 = runtime.fromIterator(t_98);
var t_97 = t_98.length;
for(var t_96=0; t_96 < t_98.length; t_96++) {
var t_99 = t_98[t_96];
frame.set("compound", t_99);
frame.set("loop.index", t_96 + 1);
frame.set("loop.index0", t_96);
frame.set("loop.revindex", t_97 - t_96);
frame.set("loop.revindex0", t_97 - t_96 - 1);
frame.set("loop.first", t_96 === 0);
frame.set("loop.last", t_96 === t_97 - 1);
frame.set("loop.length", t_97);
output += "\r\nfalse";
;
}
}
frame = frame.pop();
output += "\r\n0\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
frame = frame.push();
var t_102 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_102) {t_102 = runtime.fromIterator(t_102);
var t_101 = t_102.length;
for(var t_100=0; t_100 < t_102.length; t_100++) {
var t_103 = t_102[t_100];
frame.set("compound", t_103);
frame.set("loop.index", t_100 + 1);
frame.set("loop.index0", t_100);
frame.set("loop.revindex", t_101 - t_100);
frame.set("loop.revindex0", t_101 - t_100 - 1);
frame.set("loop.first", t_100 === 0);
frame.set("loop.last", t_100 === t_101 - 1);
frame.set("loop.length", t_101);
output += "\r\nfalse";
;
}
}
frame = frame.pop();
output += "\r\n";
output += runtime.suppressValue(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables")), env.opts.autoescape);
frame = frame.push();
var t_106 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "_model_")),"variables");
if(t_106) {t_106 = runtime.fromIterator(t_106);
var t_105 = t_106.length;
for(var t_104=0; t_104 < t_106.length; t_104++) {
var t_107 = t_106[t_104];
frame.set("compound", t_107);
frame.set("loop.index", t_104 + 1);
frame.set("loop.index0", t_104);
frame.set("loop.revindex", t_105 - t_104);
frame.set("loop.revindex0", t_105 - t_104 - 1);
frame.set("loop.first", t_104 === 0);
frame.set("loop.last", t_104 === t_105 - 1);
frame.set("loop.length", t_105);
output += "\r\nfalse";
;
}
}
frame = frame.pop();
output += "\r\n0\r\n0\r\n0\r\n0\r\n0\r\n0\r\n0\r\n0\r\n0\r\n2\r\nr1\r\nr1\r\n1 0\r\n0\r\nr2\r\nr2\r\n1 0\r\n0\r\n0\r\n2\r\nmm\r\nmole\r\n1000\r\n15\r\nk1\r\n1.000000\r\n0.000000\r\n15\r\n1000\r\nk1\r\n1.000000\r\n0\r\n0\r\n1.000000e-06\r\n0\r\n0\r\n5\r\nk1\r\n0.001000\r\nk1\r\n0.001000\r\n0\r\n100\r\n0\r\n100\r\n2.000000\r\n-1\r\n-1\r\n0\r\n0\r\n1000\r\n1\r\n1.000000\r\n0.500000\r\n0\r\n0\r\n1\r\n0.000010\r\n1000000\r\n";
output += runtime.suppressValue((runtime.contextOrFrameLookup(context, frame, "eventsOff")?0:1), env.opts.autoescape);
output += "\r\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("events"))(env, context, frame, runtime, function(t_109,t_108) {
if(t_109) { cb(t_109); return; }
output += t_108;
output += "\r\n<listModelData>\r\n   <item>\r\n      <name></name>\r\n      <organizm></organizm>\r\n      <modeltype>0</modeltype>\r\n      <expdata></expdata>\r\n   </item>\r\n</listModelData>\r\n<listUnits size=\"1\">\r\n</listUnits>\r\n<listComp size=\"1\">\r\n   <item>\r\n      <name>Default_mc</name>\r\n      <comment></comment>\r\n      <unit></unit>\r\n      <outside></outside>\r\n      <spdim>3</spdim>\r\n      <sizes>1</sizes>\r\n      <const>0</const>\r\n      <rrule></rrule>\r\n      <cdown></cdown>\r\n   </item>\r\n</listComp>\r\n<listSpecies size=\"0\">\r\n</listSpecies>\r\n<listRepository size=\"1\" default=\"List1\">\r\n   <item>\r\n      <name>List1</name>\r\n      <comment></comment>\r\n      <listParameters size=\"0\">\r\n      </listParameters>\r\n   </item>\r\n</listRepository>\r\n<listRules size=\"0\">\r\n</listRules>\r\n<listReactions size=\"0\">\r\n</listReactions>\r\n<listcontent size=\"0\">\r\n</listcontent>\r\n22jun2007\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})})})})})})})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_sm(env, context, frame, runtime, cb) {
var lineno = 27;
var colno = 4;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_outputVars(env, context, frame, runtime, cb) {
var lineno = 44;
var colno = 4;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_reactionNames(env, context, frame, runtime, cb) {
var lineno = 254;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_compoundNames(env, context, frame, runtime, cb) {
var lineno = 255;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_rhs(env, context, frame, runtime, cb) {
var lineno = 698;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_iv(env, context, frame, runtime, cb) {
var lineno = 722;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_comments(env, context, frame, runtime, cb) {
var lineno = 866;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_events(env, context, frame, runtime, cb) {
var lineno = 995;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_sm: b_sm,
b_outputVars: b_outputVars,
b_reactionNames: b_reactionNames,
b_compoundNames: b_compoundNames,
b_rhs: b_rhs,
b_iv: b_iv,
b_comments: b_comments,
b_events: b_events,
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["template.xml.njk"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\r\n<sbml xmlns=\"http://www.sbml.org/sbml/level2/version4\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\" level=\"2\" version=\"4\">\r\n  <model id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "namespace")),"spaceName"), env.opts.autoescape);
output += "\" metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "namespace")),"spaceName"), env.opts.autoescape);
output += "\" >\r\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"notes")) {
output += "<notes><html xmlns=\"http://www.w3.org/1999/xhtml\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"notesHTML"), env.opts.autoescape);
output += "</html></notes>";
;
}
var t_1;
t_1 = (lineno = 5, colno = 65, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Compartment"]));
frame.set("listOfCompartments", t_1, true);
if(frame.topLevel) {
context.setVariable("listOfCompartments", t_1);
}
if(frame.topLevel) {
context.addExport("listOfCompartments", t_1);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfCompartments")) > 0) {
output += "\r\n    <listOfCompartments>";
frame = frame.push();
var t_4 = runtime.contextOrFrameLookup(context, frame, "listOfCompartments");
if(t_4) {t_4 = runtime.fromIterator(t_4);
var t_3 = t_4.length;
for(var t_2=0; t_2 < t_4.length; t_2++) {
var t_5 = t_4[t_2];
frame.set("record", t_5);
frame.set("loop.index", t_2 + 1);
frame.set("loop.index0", t_2);
frame.set("loop.revindex", t_3 - t_2);
frame.set("loop.revindex0", t_3 - t_2 - 1);
frame.set("loop.first", t_2 === 0);
frame.set("loop.last", t_2 === t_3 - 1);
frame.set("loop.length", t_3);
output += "\r\n      <compartment\r\n        id=\"";
output += runtime.suppressValue(runtime.memberLookup((t_5),"id"), env.opts.autoescape);
output += "\"\r\n        ";
if(runtime.memberLookup((t_5),"title")) {
output += "name=\"";
output += runtime.suppressValue(runtime.memberLookup((t_5),"title"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        constant=\"false\"\r\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_5),"assignments")),"start_")),"num") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += "size=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_5),"assignments")),"start_")),"num"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        ";
if(runtime.memberLookup((t_5),"units") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += "units=\"";
output += runtime.suppressValue((lineno = 14, colno = 68, runtime.callWrap(runtime.memberLookup((t_5),"unitsHash"), "record[\"unitsHash\"]", context, [])), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_5),"index"), env.opts.autoescape);
output += "\"\r\n        >\r\n        ";
if(runtime.memberLookup((t_5),"notes")) {
output += "<notes><html xmlns=\"http://www.w3.org/1999/xhtml\">";
output += runtime.suppressValue(runtime.memberLookup((t_5),"notesHTML"), env.opts.autoescape);
output += "</html></notes>";
;
}
output += "\r\n      </compartment>";
;
}
}
frame = frame.pop();
output += "\r\n    </listOfCompartments>\r\n  ";
;
}
var t_6;
t_6 = (lineno = 23, colno = 60, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Species"]));
frame.set("listOfSpecies", t_6, true);
if(frame.topLevel) {
context.setVariable("listOfSpecies", t_6);
}
if(frame.topLevel) {
context.addExport("listOfSpecies", t_6);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfSpecies")) > 0) {
output += "\r\n    <listOfSpecies>";
frame = frame.push();
var t_9 = runtime.contextOrFrameLookup(context, frame, "listOfSpecies");
if(t_9) {t_9 = runtime.fromIterator(t_9);
var t_8 = t_9.length;
for(var t_7=0; t_7 < t_9.length; t_7++) {
var t_10 = t_9[t_7];
frame.set("record", t_10);
frame.set("loop.index", t_7 + 1);
frame.set("loop.index0", t_7);
frame.set("loop.revindex", t_8 - t_7);
frame.set("loop.revindex0", t_8 - t_7 - 1);
frame.set("loop.first", t_7 === 0);
frame.set("loop.last", t_7 === t_8 - 1);
frame.set("loop.length", t_8);
output += "\r\n      <species\r\n        id=\"";
output += runtime.suppressValue(runtime.memberLookup((t_10),"id"), env.opts.autoescape);
output += "\"\r\n        ";
if(runtime.memberLookup((t_10),"title")) {
output += "name=\"";
output += runtime.suppressValue(runtime.memberLookup((t_10),"title"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        compartment=\"";
output += runtime.suppressValue(runtime.memberLookup((t_10),"compartment"), env.opts.autoescape);
output += "\"\r\n        constant=\"false\"\r\n        boundaryCondition=\"";
output += runtime.suppressValue(runtime.memberLookup((t_10),"boundary") === true || runtime.memberLookup((t_10),"isRule") === true, env.opts.autoescape);
output += "\"\r\n        hasOnlySubstanceUnits=\"";
output += runtime.suppressValue(runtime.memberLookup((t_10),"isAmount") === true, env.opts.autoescape);
output += "\"\r\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_10),"assignments")),"start_")),"num") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
if(runtime.memberLookup((t_10),"isAmount") === true) {
output += "initialAmount";
;
}
else {
output += "initialConcentration";
;
}
output += "=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_10),"assignments")),"start_")),"num"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        ";
if(runtime.memberLookup((t_10),"units") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += "substanceUnits=\"";
output += runtime.suppressValue((lineno = 38, colno = 76, runtime.callWrap(runtime.memberLookup((t_10),"unitsHash"), "record[\"unitsHash\"]", context, [true])), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_10),"index"), env.opts.autoescape);
output += "\"\r\n        >\r\n        ";
if(runtime.memberLookup((t_10),"notes")) {
output += "<notes><html xmlns=\"http://www.w3.org/1999/xhtml\">";
output += runtime.suppressValue(runtime.memberLookup((t_10),"notesHTML"), env.opts.autoescape);
output += "</html></notes>";
;
}
output += "\r\n      </species>";
;
}
}
frame = frame.pop();
output += "\r\n    </listOfSpecies>\r\n  ";
;
}
var t_11;
t_11 = (lineno = 47, colno = 63, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Record"]));
frame.set("listOfParameters", t_11, true);
if(frame.topLevel) {
context.setVariable("listOfParameters", t_11);
}
if(frame.topLevel) {
context.addExport("listOfParameters", t_11);
}
var t_12;
t_12 = (lineno = 48, colno = 62, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Process"]));
frame.set("listOfProcesses", t_12, true);
if(frame.topLevel) {
context.setVariable("listOfProcesses", t_12);
}
if(frame.topLevel) {
context.addExport("listOfProcesses", t_12);
}
var t_13;
t_13 = (lineno = 49, colno = 62, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Const"]));
frame.set("listOfConstants", t_13, true);
if(frame.topLevel) {
context.setVariable("listOfConstants", t_13);
}
if(frame.topLevel) {
context.addExport("listOfConstants", t_13);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfParameters")) + env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfConstants")) + env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfProcesses")) > 0) {
output += "\r\n    <listOfParameters>";
frame = frame.push();
var t_16 = (lineno = 52, colno = 45, runtime.callWrap(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "listOfParameters")),"concat"), "listOfParameters[\"concat\"]", context, [runtime.contextOrFrameLookup(context, frame, "listOfProcesses")]));
if(t_16) {t_16 = runtime.fromIterator(t_16);
var t_15 = t_16.length;
for(var t_14=0; t_14 < t_16.length; t_14++) {
var t_17 = t_16[t_14];
frame.set("record", t_17);
frame.set("loop.index", t_14 + 1);
frame.set("loop.index0", t_14);
frame.set("loop.revindex", t_15 - t_14);
frame.set("loop.revindex0", t_15 - t_14 - 1);
frame.set("loop.first", t_14 === 0);
frame.set("loop.last", t_14 === t_15 - 1);
frame.set("loop.length", t_15);
output += "\r\n      <parameter\r\n        id=\"";
output += runtime.suppressValue(runtime.memberLookup((t_17),"id"), env.opts.autoescape);
output += "\"\r\n        ";
if(runtime.memberLookup((t_17),"title")) {
output += "name=\"";
output += runtime.suppressValue(runtime.memberLookup((t_17),"title"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        constant=\"false\"\r\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_17),"assignments")),"start_")),"num") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += "value=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_17),"assignments")),"start_")),"num"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        ";
if(runtime.memberLookup((t_17),"units") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += "units=\"";
output += runtime.suppressValue((lineno = 58, colno = 67, runtime.callWrap(runtime.memberLookup((t_17),"unitsHash"), "record[\"unitsHash\"]", context, [])), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_17),"index"), env.opts.autoescape);
output += "\"\r\n        >\r\n        ";
if(runtime.memberLookup((t_17),"notes")) {
output += "<notes><html xmlns=\"http://www.w3.org/1999/xhtml\">";
output += runtime.suppressValue(runtime.memberLookup((t_17),"notesHTML"), env.opts.autoescape);
output += "</html></notes>";
;
}
output += "\r\n      </parameter>";
;
}
}
frame = frame.pop();
frame = frame.push();
var t_20 = runtime.contextOrFrameLookup(context, frame, "listOfConstants");
if(t_20) {t_20 = runtime.fromIterator(t_20);
var t_19 = t_20.length;
for(var t_18=0; t_18 < t_20.length; t_18++) {
var t_21 = t_20[t_18];
frame.set("con", t_21);
frame.set("loop.index", t_18 + 1);
frame.set("loop.index0", t_18);
frame.set("loop.revindex", t_19 - t_18);
frame.set("loop.revindex0", t_19 - t_18 - 1);
frame.set("loop.first", t_18 === 0);
frame.set("loop.last", t_18 === t_19 - 1);
frame.set("loop.length", t_19);
output += "\r\n      <parameter\r\n        id=\"";
output += runtime.suppressValue(runtime.memberLookup((t_21),"id"), env.opts.autoescape);
output += "\"\r\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "record")),"title")) {
output += "name=\"";
output += runtime.suppressValue(runtime.memberLookup((t_21),"title"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        constant=\"true\"\r\n        ";
if(runtime.memberLookup((t_21),"num") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += "value=\"";
output += runtime.suppressValue(runtime.memberLookup((t_21),"num"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        ";
if(runtime.memberLookup((t_21),"units") !== runtime.contextOrFrameLookup(context, frame, "undefined")) {
output += "units=\"";
output += runtime.suppressValue((lineno = 70, colno = 61, runtime.callWrap(runtime.memberLookup((t_21),"unitsHash"), "con[\"unitsHash\"]", context, [])), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_21),"index"), env.opts.autoescape);
output += "\"\r\n        >\r\n        ";
if(runtime.memberLookup((t_21),"notes")) {
output += "<notes><html xmlns=\"http://www.w3.org/1999/xhtml\">";
output += runtime.suppressValue(runtime.memberLookup((t_21),"notesHTML"), env.opts.autoescape);
output += "</html></notes>";
;
}
output += "\r\n      </parameter>";
;
}
}
frame = frame.pop();
output += "\r\n  </listOfParameters>\r\n  ";
;
}
var t_22;
t_22 = (lineno = 79, colno = 62, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Reaction"]));
frame.set("listOfReactions", t_22, true);
if(frame.topLevel) {
context.setVariable("listOfReactions", t_22);
}
if(frame.topLevel) {
context.addExport("listOfReactions", t_22);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfReactions")) > 0) {
output += "\r\n    <listOfReactions>";
frame = frame.push();
var t_25 = runtime.contextOrFrameLookup(context, frame, "listOfReactions");
if(t_25) {t_25 = runtime.fromIterator(t_25);
var t_24 = t_25.length;
for(var t_23=0; t_23 < t_25.length; t_23++) {
var t_26 = t_25[t_23];
frame.set("record", t_26);
frame.set("loop.index", t_23 + 1);
frame.set("loop.index0", t_23);
frame.set("loop.revindex", t_24 - t_23);
frame.set("loop.revindex0", t_24 - t_23 - 1);
frame.set("loop.first", t_23 === 0);
frame.set("loop.last", t_23 === t_24 - 1);
frame.set("loop.length", t_24);
output += "\r\n      <reaction\r\n        id=\"";
output += runtime.suppressValue(runtime.memberLookup((t_26),"id"), env.opts.autoescape);
output += "\"\r\n        ";
if(runtime.memberLookup((t_26),"title")) {
output += "name=\"";
output += runtime.suppressValue(runtime.memberLookup((t_26),"title"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        reversible=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_26),"aux")),"reversible") !== false, env.opts.autoescape);
output += "\"\r\n        fast=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_26),"aux")),"fast") === "true", env.opts.autoescape);
output += "\"\r\n        metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_26),"index"), env.opts.autoescape);
output += "\"\r\n        >\r\n        ";
if(runtime.memberLookup((t_26),"notes")) {
output += "<notes><html xmlns=\"http://www.w3.org/1999/xhtml\">";
output += runtime.suppressValue(runtime.memberLookup((t_26),"notesHTML"), env.opts.autoescape);
output += "</html></notes>";
;
}
output += "\r\n        <listOfReactants>\r\n          ";
frame = frame.push();
var t_29 = runtime.memberLookup((t_26),"actors");
if(t_29) {t_29 = runtime.fromIterator(t_29);
var t_28 = t_29.length;
for(var t_27=0; t_27 < t_29.length; t_27++) {
var t_30 = t_29[t_27];
frame.set("actor", t_30);
frame.set("loop.index", t_27 + 1);
frame.set("loop.index0", t_27);
frame.set("loop.revindex", t_28 - t_27);
frame.set("loop.revindex0", t_28 - t_27 - 1);
frame.set("loop.first", t_27 === 0);
frame.set("loop.last", t_27 === t_28 - 1);
frame.set("loop.length", t_28);
if(runtime.memberLookup((t_30),"stoichiometry") < 0) {
output += "<speciesReference species=\"";
output += runtime.suppressValue(runtime.memberLookup((t_30),"target"), env.opts.autoescape);
output += "\" stoichiometry=\"";
output += runtime.suppressValue(-runtime.memberLookup((t_30),"stoichiometry"), env.opts.autoescape);
output += "\"/>";
;
}
output += "\r\n          ";
;
}
}
frame = frame.pop();
output += "</listOfReactants>\r\n        <listOfProducts>\r\n          ";
frame = frame.push();
var t_33 = runtime.memberLookup((t_26),"actors");
if(t_33) {t_33 = runtime.fromIterator(t_33);
var t_32 = t_33.length;
for(var t_31=0; t_31 < t_33.length; t_31++) {
var t_34 = t_33[t_31];
frame.set("actor", t_34);
frame.set("loop.index", t_31 + 1);
frame.set("loop.index0", t_31);
frame.set("loop.revindex", t_32 - t_31);
frame.set("loop.revindex0", t_32 - t_31 - 1);
frame.set("loop.first", t_31 === 0);
frame.set("loop.last", t_31 === t_32 - 1);
frame.set("loop.length", t_32);
if(runtime.memberLookup((t_34),"stoichiometry") > 0) {
output += "<speciesReference species=\"";
output += runtime.suppressValue(runtime.memberLookup((t_34),"target"), env.opts.autoescape);
output += "\" stoichiometry=\"";
output += runtime.suppressValue(runtime.memberLookup((t_34),"stoichiometry"), env.opts.autoescape);
output += "\"/>";
;
}
output += "\r\n          ";
;
}
}
frame = frame.pop();
output += "</listOfProducts>\r\n        <listOfModifiers>\r\n          ";
frame = frame.push();
var t_37 = runtime.memberLookup((t_26),"modifiers");
if(t_37) {t_37 = runtime.fromIterator(t_37);
var t_36 = t_37.length;
for(var t_35=0; t_35 < t_37.length; t_35++) {
var t_38 = t_37[t_35];
frame.set("modifier", t_38);
frame.set("loop.index", t_35 + 1);
frame.set("loop.index0", t_35);
frame.set("loop.revindex", t_36 - t_35);
frame.set("loop.revindex0", t_36 - t_35 - 1);
frame.set("loop.first", t_35 === 0);
frame.set("loop.last", t_35 === t_36 - 1);
frame.set("loop.length", t_36);
output += "<modifierSpeciesReference species=\"";
output += runtime.suppressValue(runtime.memberLookup((t_38),"target"), env.opts.autoescape);
output += "\"/>\r\n          ";
;
}
}
frame = frame.pop();
output += "</listOfModifiers>\r\n        <kineticLaw>\r\n          ";
if(runtime.memberLookup((runtime.memberLookup((t_26),"assignments")),"ode_")) {
output += runtime.suppressValue((lineno = 107, colno = 77, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_26),"assignments")),"ode_")),"toCMathML"), "record[\"assignments\"][\"ode_\"][\"toCMathML\"]", context, [])), env.opts.autoescape);
;
}
output += "\r\n        </kineticLaw>\r\n      </reaction>";
;
}
}
frame = frame.pop();
output += "\r\n  </listOfReactions>\r\n  ";
;
}
var t_39;
t_39 = env.getFilter("exclude2").call(context, env.getFilter("exclude2").call(context, (lineno = 114, colno = 58, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"toArray"), "image[\"population\"][\"toArray\"]", context, [])),"assignments.ode_",runtime.contextOrFrameLookup(context, frame, "undefined")),"className","Reaction");
frame.set("listOfAssignmentRules", t_39, true);
if(frame.topLevel) {
context.setVariable("listOfAssignmentRules", t_39);
}
if(frame.topLevel) {
context.addExport("listOfAssignmentRules", t_39);
}
var t_40;
t_40 = env.getFilter("exclude2").call(context, env.getFilter("exclude2").call(context, env.getFilter("exclude2").call(context, (lineno = 115, colno = 62, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["Record"])),"boundary",true),"isRule",true),"backReferences.length",0);
frame.set("listOfRateRules", t_40, true);
if(frame.topLevel) {
context.setVariable("listOfRateRules", t_40);
}
if(frame.topLevel) {
context.addExport("listOfRateRules", t_40);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfAssignmentRules")) + env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfRateRules")) > 0) {
output += "\r\n  <listOfRules>";
frame = frame.push();
var t_43 = runtime.contextOrFrameLookup(context, frame, "listOfAssignmentRules");
if(t_43) {t_43 = runtime.fromIterator(t_43);
var t_42 = t_43.length;
for(var t_41=0; t_41 < t_43.length; t_41++) {
var t_44 = t_43[t_41];
frame.set("record", t_44);
frame.set("loop.index", t_41 + 1);
frame.set("loop.index0", t_41);
frame.set("loop.revindex", t_42 - t_41);
frame.set("loop.revindex0", t_42 - t_41 - 1);
frame.set("loop.first", t_41 === 0);
frame.set("loop.last", t_41 === t_42 - 1);
frame.set("loop.length", t_42);
output += "\r\n    <assignmentRule\r\n      variable=\"";
output += runtime.suppressValue(runtime.memberLookup((t_44),"id"), env.opts.autoescape);
output += "\"\r\n      ";
if(runtime.memberLookup((t_44),"title")) {
output += "name=\"";
output += runtime.suppressValue(runtime.memberLookup((t_44),"title"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n      metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_44),"index"), env.opts.autoescape);
output += "::ode_\"\r\n      >\r\n      ";
output += runtime.suppressValue((lineno = 124, colno = 41, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_44),"assignments")),"ode_")),"toCMathML"), "record[\"assignments\"][\"ode_\"][\"toCMathML\"]", context, [])), env.opts.autoescape);
output += "\r\n    </assignmentRule>";
;
}
}
frame = frame.pop();
frame = frame.push();
var t_47 = runtime.contextOrFrameLookup(context, frame, "listOfRateRules");
if(t_47) {t_47 = runtime.fromIterator(t_47);
var t_46 = t_47.length;
for(var t_45=0; t_45 < t_47.length; t_45++) {
var t_48 = t_47[t_45];
frame.set("record", t_48);
frame.set("loop.index", t_45 + 1);
frame.set("loop.index0", t_45);
frame.set("loop.revindex", t_46 - t_45);
frame.set("loop.revindex0", t_46 - t_45 - 1);
frame.set("loop.first", t_45 === 0);
frame.set("loop.last", t_45 === t_46 - 1);
frame.set("loop.length", t_46);
output += "\r\n    <rateRule\r\n      variable=\"";
output += runtime.suppressValue(runtime.memberLookup((t_48),"id"), env.opts.autoescape);
output += "\"\r\n      ";
if(runtime.memberLookup((t_48),"title")) {
output += "name=\"";
output += runtime.suppressValue(runtime.memberLookup((t_48),"title"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n      metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_48),"index"), env.opts.autoescape);
output += "::ode_\"\r\n      >\r\n      <math xmlns=\"http://www.w3.org/1998/Math/MathML\">\r\n        <apply>\r\n          <plus/>\r\n          ";
frame = frame.push();
var t_51 = runtime.memberLookup((t_48),"backReferences");
if(t_51) {t_51 = runtime.fromIterator(t_51);
var t_50 = t_51.length;
for(var t_49=0; t_49 < t_51.length; t_49++) {
var t_52 = t_51[t_49];
frame.set("ref", t_52);
frame.set("loop.index", t_49 + 1);
frame.set("loop.index0", t_49);
frame.set("loop.revindex", t_50 - t_49);
frame.set("loop.revindex0", t_50 - t_49 - 1);
frame.set("loop.first", t_49 === 0);
frame.set("loop.last", t_49 === t_50 - 1);
frame.set("loop.length", t_50);
output += "\r\n          <apply>\r\n            <times/>\r\n            <cn>";
output += runtime.suppressValue(runtime.memberLookup((t_52),"stoichiometry"), env.opts.autoescape);
output += "</cn>\r\n            <ci>";
output += runtime.suppressValue(runtime.memberLookup((t_52),"process"), env.opts.autoescape);
output += "</ci>\r\n          </apply>\r\n          ";
;
}
}
frame = frame.pop();
output += "\r\n        </apply>\r\n      </math>\r\n    </rateRule>\r\n  ";
;
}
}
frame = frame.pop();
output += "\r\n  \r\n  </listOfRules>\r\n  ";
;
}
var t_53;
t_53 = env.getFilter("filter2").call(context, env.getFilter("exclude2").call(context, (lineno = 152, colno = 61, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"toArray"), "image[\"population\"][\"toArray\"]", context, [])),"assignments.start_",runtime.contextOrFrameLookup(context, frame, "undefined")),"assignments.start_.num",runtime.contextOrFrameLookup(context, frame, "undefined"));
frame.set("listOfInitialAssignments", t_53, true);
if(frame.topLevel) {
context.setVariable("listOfInitialAssignments", t_53);
}
if(frame.topLevel) {
context.addExport("listOfInitialAssignments", t_53);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfInitialAssignments")) > 0) {
output += "\r\n    <listOfInitialAssignments>";
frame = frame.push();
var t_56 = runtime.contextOrFrameLookup(context, frame, "listOfInitialAssignments");
if(t_56) {t_56 = runtime.fromIterator(t_56);
var t_55 = t_56.length;
for(var t_54=0; t_54 < t_56.length; t_54++) {
var t_57 = t_56[t_54];
frame.set("record", t_57);
frame.set("loop.index", t_54 + 1);
frame.set("loop.index0", t_54);
frame.set("loop.revindex", t_55 - t_54);
frame.set("loop.revindex0", t_55 - t_54 - 1);
frame.set("loop.first", t_54 === 0);
frame.set("loop.last", t_54 === t_55 - 1);
frame.set("loop.length", t_55);
output += "\r\n      <initialAssignment\r\n        symbol=\"";
output += runtime.suppressValue(runtime.memberLookup((t_57),"id"), env.opts.autoescape);
output += "\"\r\n        metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_57),"index"), env.opts.autoescape);
output += "::start_\"\r\n        ";
if(runtime.memberLookup((t_57),"title")) {
output += "name=\"";
output += runtime.suppressValue(runtime.memberLookup((t_57),"title"), env.opts.autoescape);
output += "\"";
;
}
output += "\r\n        >\r\n        ";
output += runtime.suppressValue((lineno = 161, colno = 45, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_57),"assignments")),"start_")),"toCMathML"), "record[\"assignments\"][\"start_\"][\"toCMathML\"]", context, [])), env.opts.autoescape);
output += "\r\n      </initialAssignment>";
;
}
}
frame = frame.pop();
output += "\r\n    </listOfInitialAssignments>\r\n  ";
;
}
var t_58;
t_58 = (lineno = 167, colno = 63, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["TimeSwitcher"]));
frame.set("listOfTimeEvents", t_58, true);
if(frame.topLevel) {
context.setVariable("listOfTimeEvents", t_58);
}
if(frame.topLevel) {
context.addExport("listOfTimeEvents", t_58);
}
var t_59;
t_59 = (lineno = 168, colno = 63, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectByClassName"), "image[\"population\"][\"selectByClassName\"]", context, ["CondSwitcher"]));
frame.set("listOfCondEvents", t_59, true);
if(frame.topLevel) {
context.setVariable("listOfCondEvents", t_59);
}
if(frame.topLevel) {
context.addExport("listOfCondEvents", t_59);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfTimeEvents")) + env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfCondEvents")) > 0) {
output += "\r\n    <listOfEvents>";
frame = frame.push();
var t_62 = runtime.contextOrFrameLookup(context, frame, "listOfTimeEvents");
if(t_62) {t_62 = runtime.fromIterator(t_62);
var t_61 = t_62.length;
for(var t_60=0; t_60 < t_62.length; t_60++) {
var t_63 = t_62[t_60];
frame.set("event", t_63);
frame.set("loop.index", t_60 + 1);
frame.set("loop.index0", t_60);
frame.set("loop.revindex", t_61 - t_60);
frame.set("loop.revindex0", t_61 - t_60 - 1);
frame.set("loop.first", t_60 === 0);
frame.set("loop.last", t_60 === t_61 - 1);
frame.set("loop.length", t_61);
output += "\r\n      <event\r\n        id=\"";
output += runtime.suppressValue(runtime.memberLookup((t_63),"id"), env.opts.autoescape);
output += "\" metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_63),"index"), env.opts.autoescape);
output += "\"\r\n        >\r\n        <trigger>\r\n          <math xmlns=\"http://www.w3.org/1998/Math/MathML\">\r\n            <apply>\r\n              <geq/>\r\n              <ci>t</ci>\r\n              ";
if(env.getTest("defined").call(context, runtime.memberLookup((t_63),"start")) === true) {
output += "<ci>";
output += runtime.suppressValue(runtime.memberLookup((t_63),"start"), env.opts.autoescape);
output += "</ci>";
;
}
else {
output += "<cn>";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_63),"startObj")),"num"), env.opts.autoescape);
output += "</cn>";
;
}
output += "\r\n            </apply>\r\n          </math>\r\n        </trigger>\r\n        <listOfEventAssignments>\r\n          ";
frame = frame.push();
var t_66 = (lineno = 186, colno = 66, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectRecordsByContext"), "image[\"population\"][\"selectRecordsByContext\"]", context, [runtime.memberLookup((t_63),"id")]));
if(t_66) {t_66 = runtime.fromIterator(t_66);
var t_65 = t_66.length;
for(var t_64=0; t_64 < t_66.length; t_64++) {
var t_67 = t_66[t_64];
frame.set("record", t_67);
frame.set("loop.index", t_64 + 1);
frame.set("loop.index0", t_64);
frame.set("loop.revindex", t_65 - t_64);
frame.set("loop.revindex0", t_65 - t_64 - 1);
frame.set("loop.first", t_64 === 0);
frame.set("loop.last", t_64 === t_65 - 1);
frame.set("loop.length", t_65);
output += "\r\n          <eventAssignment\r\n            variable=\"";
output += runtime.suppressValue(runtime.memberLookup((t_67),"id"), env.opts.autoescape);
output += "\"\r\n            metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_67),"index"), env.opts.autoescape);
output += "::";
output += runtime.suppressValue(runtime.memberLookup((t_63),"id"), env.opts.autoescape);
output += "\">\r\n            ";
output += runtime.suppressValue((lineno = 190, colno = 53, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_67),"assignments")),runtime.memberLookup((t_63),"id"))),"toCMathML"), "record[\"assignments\"][\"event[\"id\"]\"][\"toCMathML\"]", context, [])), env.opts.autoescape);
output += "\r\n          </eventAssignment>\r\n          ";
;
}
}
frame = frame.pop();
output += "\r\n        </listOfEventAssignments>\r\n      </event>";
;
}
}
frame = frame.pop();
frame = frame.push();
var t_70 = runtime.contextOrFrameLookup(context, frame, "listOfCondEvents");
if(t_70) {t_70 = runtime.fromIterator(t_70);
var t_69 = t_70.length;
for(var t_68=0; t_68 < t_70.length; t_68++) {
var t_71 = t_70[t_68];
frame.set("event", t_71);
frame.set("loop.index", t_68 + 1);
frame.set("loop.index0", t_68);
frame.set("loop.revindex", t_69 - t_68);
frame.set("loop.revindex0", t_69 - t_68 - 1);
frame.set("loop.first", t_68 === 0);
frame.set("loop.last", t_68 === t_69 - 1);
frame.set("loop.length", t_69);
output += "\r\n      <event\r\n        id=\"";
output += runtime.suppressValue(runtime.memberLookup((t_71),"id"), env.opts.autoescape);
output += "\" metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_71),"index"), env.opts.autoescape);
output += "\"\r\n        >\r\n        <trigger>\r\n          <math xmlns=\"http://www.w3.org/1998/Math/MathML\">\r\n            <apply>\r\n              <geq/>\r\n              <ci>";
output += runtime.suppressValue(runtime.memberLookup((t_71),"condition"), env.opts.autoescape);
output += "</ci>\r\n              <cn>0</cn>\r\n            </apply>\r\n          </math>\r\n        </trigger>\r\n        <listOfEventAssignments>\r\n          ";
frame = frame.push();
var t_74 = (lineno = 210, colno = 66, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"population")),"selectRecordsByContext"), "image[\"population\"][\"selectRecordsByContext\"]", context, [runtime.memberLookup((t_71),"id")]));
if(t_74) {t_74 = runtime.fromIterator(t_74);
var t_73 = t_74.length;
for(var t_72=0; t_72 < t_74.length; t_72++) {
var t_75 = t_74[t_72];
frame.set("record", t_75);
frame.set("loop.index", t_72 + 1);
frame.set("loop.index0", t_72);
frame.set("loop.revindex", t_73 - t_72);
frame.set("loop.revindex0", t_73 - t_72 - 1);
frame.set("loop.first", t_72 === 0);
frame.set("loop.last", t_72 === t_73 - 1);
frame.set("loop.length", t_73);
output += "\r\n          <eventAssignment\r\n            variable=\"";
output += runtime.suppressValue(runtime.memberLookup((t_75),"id"), env.opts.autoescape);
output += "\"\r\n            metaid=\"";
output += runtime.suppressValue(runtime.memberLookup((t_75),"index"), env.opts.autoescape);
output += "::";
output += runtime.suppressValue(runtime.memberLookup((t_71),"id"), env.opts.autoescape);
output += "\">\r\n            ";
output += runtime.suppressValue((lineno = 214, colno = 53, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_75),"assignments")),runtime.memberLookup((t_71),"id"))),"toCMathML"), "record[\"assignments\"][\"event[\"id\"]\"][\"toCMathML\"]", context, [])), env.opts.autoescape);
output += "\r\n          </eventAssignment>\r\n          ";
;
}
}
frame = frame.pop();
output += "\r\n        </listOfEventAssignments>\r\n      </event>";
;
}
}
frame = frame.pop();
output += "\r\n    </listOfEvents>\r\n  ";
;
}
var t_76;
t_76 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"listOfUnitDefinitions");
frame.set("listOfUnitDefinitions", t_76, true);
if(frame.topLevel) {
context.setVariable("listOfUnitDefinitions", t_76);
}
if(frame.topLevel) {
context.addExport("listOfUnitDefinitions", t_76);
}
if(env.getFilter("length").call(context, runtime.contextOrFrameLookup(context, frame, "listOfUnitDefinitions")) > 0) {
output += "\r\n    <listOfUnitDefinitions>";
frame = frame.push();
var t_79 = runtime.contextOrFrameLookup(context, frame, "listOfUnitDefinitions");
if(t_79) {t_79 = runtime.fromIterator(t_79);
var t_78 = t_79.length;
for(var t_77=0; t_77 < t_79.length; t_77++) {
var t_80 = t_79[t_77];
frame.set("unitDefinition", t_80);
frame.set("loop.index", t_77 + 1);
frame.set("loop.index0", t_77);
frame.set("loop.revindex", t_78 - t_77);
frame.set("loop.revindex0", t_78 - t_77 - 1);
frame.set("loop.first", t_77 === 0);
frame.set("loop.last", t_77 === t_78 - 1);
frame.set("loop.length", t_78);
output += "\r\n      ";
output += runtime.suppressValue(t_80, env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "\r\n  </listOfUnitDefinitions>\r\n  ";
;
}
output += "\r\n  \r\n  </model>\r\n</sbml>\r\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

