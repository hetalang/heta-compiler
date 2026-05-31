const nunjucks = require('nunjucks');
const nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(__dirname), { autoescape: false });
require('./nunjucks-env')(nunjucksEnv);

// XXX: maybe this list should be created externally in ./templates/list.json and imported here
// This file could be used also in `npm run precompile` to know which templates to precompile.
const templates = {
  'heta-code.heta.njk': nunjucksEnv.getTemplate('heta-code.heta.njk'),
  'dbsolve-model.slv.njk': nunjucksEnv.getTemplate('dbsolve-model.slv.njk'),
  'dot.dot.njk': nunjucksEnv.getTemplate('dot.dot.njk'),
  'summary.md.njk': nunjucksEnv.getTemplate('summary.md.njk'),
  'julia-model.jl.njk': nunjucksEnv.getTemplate('julia-model.jl.njk'),
  'julia-run.jl.njk': nunjucksEnv.getTemplate('julia-run.jl.njk'),
  'matlab-model.m.njk': nunjucksEnv.getTemplate('matlab-model.m.njk'),
  'matlab-param.m.njk': nunjucksEnv.getTemplate('matlab-param.m.njk'),
  'matlab-run.m.njk': nunjucksEnv.getTemplate('matlab-run.m.njk'),
  'mrgsolve-model.cpp.njk': nunjucksEnv.getTemplate('mrgsolve-model.cpp.njk'),
  'mrgsolve-run.r.njk': nunjucksEnv.getTemplate('mrgsolve-run.r.njk'),
  'output.m.njk': nunjucksEnv.getTemplate('output.m.njk'),
  'sbmlL2V1.xml.njk': nunjucksEnv.getTemplate('sbmlL2V1.xml.njk'),
  'sbmlL2V3.xml.njk': nunjucksEnv.getTemplate('sbmlL2V3.xml.njk'),
  'sbmlL2V4.xml.njk': nunjucksEnv.getTemplate('sbmlL2V4.xml.njk'),
  'sbmlL2V5.xml.njk': nunjucksEnv.getTemplate('sbmlL2V5.xml.njk'),
  'sbmlL3V1.xml.njk': nunjucksEnv.getTemplate('sbmlL3V1.xml.njk'),
  'sbmlL3V2.xml.njk': nunjucksEnv.getTemplate('sbmlL3V2.xml.njk'),
  'simbio-tern__.m.njk': nunjucksEnv.getTemplate('simbio-tern__.m.njk'),
  'simbio.m.njk': nunjucksEnv.getTemplate('simbio.m.njk'),
  'slv-blocks-template.slv.njk': nunjucksEnv.getTemplate('slv-blocks-template.slv.njk'),
  'slv-template.slv.njk': nunjucksEnv.getTemplate('slv-template.slv.njk'),
  'mt-model.jl.njk': nunjucksEnv.getTemplate('mt-model.jl.njk'),
};

module.exports = { templates };