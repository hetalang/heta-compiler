const path = require('path');
const declarationSchema = require('./declaration-schema');
const { ajv } = require('../ajv');
const Container = require('../container');
const HetaLevelError = require('../heta-level-error');
const ModuleSystem = require('../module-system');
const semver = require('semver');
const { version } = require('../../package');

/**
 * Compiles a Heta platform from a declaration object.
 *
 * `Builder` owns the main {@link Container}, reads modules through the supplied
 * file handler, validates the platform declaration, and writes export outputs.
 * It is also the main class used by the Heta compiler CLI.
 * 
 * @class Builder
 *
 * @param {object} declaration Platform declaration object. See the
 * [platform file format]{@link https://hetalang.github.io/heta-compiler/platform-file}.
 * @param {Function} fileReadHandler Reads module content by filename and returns text.
 * @param {Function} fileWriteHandler Writes exported content by filename.
 * @param {Transport[]} transportArray Logger transports attached to the builder logger.
 *
 * @property {Container} container Main platform storage.
 * @property {Logger} logger Logger shared with `container.logger`.
 * @property {string} _distDirname Directory where export files are written, from `declaration.options.distDir`.
 * @property {string} _metaDirname Directory where debug meta files are written, from `declaration.options.metaDir`.
 * @property {object<string,Function>} exportClasses Export constructors bound to this builder.
 * @property {object[]} exportArray Export instances created from the declaration.
 */
class Builder {
  constructor(
    declaration = {},
    fileReadHandler = (fn) => { throw new Error('File read is not set for Builder'); }, // must return text
    fileWriteHandler = (fn, text) => { throw new Error('File write is not set for Builder'); }, // must return undefined
    transportArray = [], // Builder-level Transport
  ) {

    // create container
    this.container = new Container();
    this.container._builder = this; // back reference to parent builder

    // set logger and transports
    let logger = this.logger = this.container.logger;
    transportArray.forEach((...args) => logger.addTransport(...args));

    // file handlers
    this.fileReadHandler = fileReadHandler;
    this.fileWriteHandler = fileWriteHandler;

    // load templates
    this.templates = Builder._templates;

    // check based on schema, use default values from schema
    let validate = ajv.compile(declarationSchema);
    let valid = validate(declaration);
    if (!valid) {
      // convert validation errors to heta errors
      validate.errors.forEach((x) => {
        logger.error(`${x.message} (${x.dataPath})`, {type: 'BuilderError', params: x.params});
      });
      throw new HetaLevelError('Wrong structure of platform file.');
    }
    
    // === wrong version throws, if no version stated than skip ===
    let satisfiesVersion = declaration.builderVersion
      ? semver.satisfies(version, declaration.builderVersion)
      : true;
    if (!satisfiesVersion) {
      let msg = `Version "${declaration.builderVersion}" stated in declaration file is not supported by the heta-compiler ${version}.`;
      logger.error(msg, {type: 'BuilderError'});

      throw new HetaLevelError('Version incompatibility.');
    }

    // assign from declaration
    Object.assign(this, declaration);

    // set directories
    this._distDirname = declaration.options.distDir;
    this._metaDirname = declaration.options.metaDir;

    logger.info(`Heta compiler v${version} is initialized for the platform "${this.id}"`);
    
    // create "export" classes bound to this container
    Object.entries(Builder._exportClasses).forEach(([key, _Class]) => {
      this.exportClasses[key] = class extends _Class {};
      this.exportClasses[key].prototype._builder = this;
    });
    
    this.exportArray = [];
    // create "export" instances
    declaration.export.forEach((exportItem) => {
      // check the filepath
      if (!!exportItem.filepath && path.isAbsolute(exportItem.filepath)) {
        logger.error(`Export item property "filepath" must be relative, got ${JSON.stringify(exportItem)}.`, {type: 'BuilderError'});
      }

      // convert format to lower case to make it case insensitive
      let exportFormat = exportItem.format.toLowerCase();
      // check if format is supported
      let ExportClass = this.exportClasses.hasOwnProperty(exportFormat) 
        && this.exportClasses[exportFormat];
      if (ExportClass) {
        this.exportArray.push(new ExportClass(exportItem));
      } else {
        logger.error(`Export format "${exportItem.format}" is not supported.`, {type: 'BuilderError'});
      }
    });
  }

  static _exportClasses = {}; // storing abstract Export classes
  static _templates = {}; // storing template registry for text exporters
  exportClasses = {}; // storing Export classes bound to builder

  /**
   * Runs the full build pipeline.
   * 
   * The pipeline reads and integrates modules, optionally writes debug meta
   * files, loads the resulting Q-array, binds references, checks circular
   * dependencies, checks units and terms, and writes configured exports.
   * 
   * @returns {Builder} This builder.
   */
  run() {
    // 1. Parsing
    let ms = new ModuleSystem(this.logger, this.fileReadHandler);
    if (path.isAbsolute(this.importModule.source)) {
      this.logger.error(`Import module source must be relative, got "${this.importModule.source}".`, {type: 'BuilderError'});
      throw new HetaLevelError('Import module source must be relative.');
    }
    ms.addModuleDeep(this.importModule.source, this.importModule.type, this.importModule);

    // 2. Modules integration
    if (this.options.debug) {
      Object.getOwnPropertyNames(ms.moduleCollection).forEach((sourcePath) => { // relative path, i.e. src/index.heta
        let fullPath = path.join(this._metaDirname, sourcePath + '.json');
        let str = JSON.stringify(ms.moduleCollection[sourcePath], null, 2);
        this.fileWriteHandler(fullPath, str);
        this.logger.info(`Meta file was saved to ${fullPath}`);
      });
    }
    let qArr = ms.integrate();

    if (qArr.length > 0) {
      // 3. Translation
      this.container.loadMany(qArr, false);

      // 3.5 Get platform hash
      // creates temporal canonical representation and make hash
      let canonicalFull = this.container.makeCanonicalFull();
      this.logger.info(`Platform hash: ${canonicalFull[0].hashSum}`);

      // 4. Binding
      this.logger.info('Setting references in elements, total length ' + this.container.length);
      this.container.knitMany();

      // 5. Circular start_ and ode_
      this.logger.info('Checking for circular references in Records.');
      this.container.checkCircRecord();

      // 6. check circ UnitDef & FunctionDef
      this.container.checkCircUnitDef();
      this.container.checkCircFunctionDef();
    } else {
      this.logger.warn('Empty platform. No elements were loaded.');
    }

    // === STOP if errors ===
    if (!this.logger.hasErrors) {
      // 7. Units checking
      if (this.options.unitsCheck) {
        this.logger.info('Checking unit\'s consistency.');
        this.container.checkUnits();
      } else {
        this.logger.warn('Units checking skipped. To turn it on set "unitsCheck: true" in declaration.');
      }

      // 8. Terms checking
      this.logger.info('Checking unit\'s terms.');
      this.container.checkTerms();

      // 9. Exports
      this.exportMany();
    } else {
      this.logger.warn('Units checking and export were skipped because of errors in compilation.');
    }

    return this;
  }

  /**
   * Writes all exports configured in the platform declaration.
   * 
   * @returns {void}
   */
  exportMany() {
    this.logger.info(`Start exporting to files, total: ${this.exportArray.length}.`);

    this.exportArray.forEach((exportItem) => _makeAndSave(exportItem, this._distDirname));
  }
}

function _makeAndSave(exportItem, pathPrefix) {
  let { logger, fileWriteHandler } = exportItem._builder;
  let absPath = path.join(pathPrefix, exportItem.filepath);
  let msg = `Exporting to "${absPath}" of format "${exportItem.format}"...`;
  logger.info(msg);

  exportItem.make().forEach((out) => {
    let filePath = [absPath, out.pathSuffix].join('');
    try {
      fileWriteHandler(filePath, out.content);
    } catch (err) {
      let msg =`Heta compiler cannot export to file: "${err.path}": ${err.message}`;
      logger.error(msg, {type: 'ExportError'});
    }
  });
}

module.exports = {
  Builder
};
