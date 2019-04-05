const { HetaModule, ModuleSystem } = require('../../src/module-system');
const path = require('path');

let ms = new ModuleSystem();

let filepath = path.join(__dirname, './normal-a.heta');
ms.addModuleDeep(filepath, 'heta');

console.log(ms.integrate());
