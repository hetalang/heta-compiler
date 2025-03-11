/*
 Entry file for webpack
*/

/*
Use this in webpack config
module: {
        loaders: [
            {
                test: /\.(njk|nunjucks)$/,
                loader: 'nunjucks-loader',
                options: {
                    config: __dirname + '/node_modules/heta-compiler/src/nunjucks-env',
                    //quiet: true
                }
            }
        ]
    }
*/
const { Builder } = require('./builder');
const Container = require('./container');
const coreItems = require('./container/core-items');
const ModuleSystem = require('./module-system');
const { Transport, StringTransport } = require('./logger');
const HetaLevelError = require('./heta-level-error');

// set nunjucks environment
global.compiledTemplates = {
  'heta-code.heta.njk': require('./templates/heta-code.heta.njk'),
  'dbsolve-model.slv.njk': require('./templates/dbsolve-model.slv.njk'),
  'dot.dot.njk': require('./templates/dot.dot.njk'),
  'summary.md.njk': require('./templates/summary.md.njk'),
  'julia-model.jl.njk': require('./templates/julia-model.jl.njk'),
  'julia-run.jl.njk': require('./templates/julia-run.jl.njk'),
  'matlab-model.m.njk': require('./templates/matlab-model.m.njk'),
  'matlab-param.m.njk': require('./templates/matlab-param.m.njk'),
  'matlab-run.m.njk': require('./templates/matlab-run.m.njk'),
  'mrgsolve-model.cpp.njk': require('./templates/mrgsolve-model.cpp.njk'),
  'mrgsolve-run.r.njk': require('./templates/mrgsolve-run.r.njk'),
  'output.m.njk': require('./templates/output.m.njk'),
  'sbmlL2V1.xml.njk': require('./templates/sbmlL2V1.xml.njk'),
  'sbmlL2V3.xml.njk': require('./templates/sbmlL2V3.xml.njk'),
  'sbmlL2V4.xml.njk': require('./templates/sbmlL2V4.xml.njk'),
  'sbmlL2V5.xml.njk': require('./templates/sbmlL2V5.xml.njk'),
  'sbmlL3V1.xml.njk': require('./templates/sbmlL3V1.xml.njk'),
  'sbmlL3V2.xml.njk': require('./templates/sbmlL3V2.xml.njk'),
  'simbio-tern__.m.njk': require('./templates/simbio-tern__.m.njk'),
  'simbio.m.njk': require('./templates/simbio.m.njk'),
  'slv-blocks-template.slv.njk': require('./templates/slv-blocks-template.slv.njk'),
  'slv-template.slv.njk': require('./templates/slv-template.slv.njk'),
  'mt-model.jl.njk': require('./templates/mt-model.jl.njk'),
};

Builder._exportClasses = {
  DBSolve: require('./dbsolve-export'),
  YAML: require('./yaml-export'),
  JSON: require('./json-export'),
  HetaCode: require('./heta-code-export'),
  SBML: require('./sbml-export'),
  SLV: require('./slv-export'),
  Mrgsolve: require('./mrgsolve-export'),
  Simbio: require('./simbio-export'),
  Table: require('./table-export'),
  XLSX: require('./xlsx-export'),
  AnotherXLSX: require('./another-xlsx-export'),
  Matlab: require('./matlab-export'),
  Julia: require('./julia-export'),
  Dot: require('./dot-export'),
  Summary: require('./summary-export'),
  MT: require('./mt-export'),
};

module.exports = {
  Builder,
  Container,
  coreItems,
  //nunjucksEnv,
  ModuleSystem,
  Transport,
  StringTransport,
  HetaLevelError
};
