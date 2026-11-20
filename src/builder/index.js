const path = require('path');
const declarationSchema = require('./declaration-schema');
const { ajv } = require('../ajv');
const Container = require('../container');
const { Logger } = require('../logger');
const HetaLevelError = require('../heta-level-error');
const ModuleSystem = require('../module-system');
const semver = require('semver');
const { version } = require('../../package');
const linterChecks = require('../linter');
const { validateLinterConfig } = require('../linter/validate-config');

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
 * @param {Logger} logger Shared logger. If omitted, creates an internal logger
 *    storing events at `info` and above in `container.defaultLogs`, without console
 *    output. Supplied loggers also receive this diagnostic storage; events logged
 *    before construction are not replayed.
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
    logger = new Logger()
  ) {
    // create container with logging available during initialization
    this.container = new Container(logger);
    this.container._builder = this; // back reference to parent builder
    this.logger = logger;

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
        const errorPath = x.instancePath || x.dataPath || '/';
        logger.error(
          `${x.message} (${errorPath})`,
          {diagnosticCode: declarationDiagnosticCode(x), path: errorPath, keyword: x.keyword, params: x.params}
        );
      });
      return; // BRAKE
    }
    
    // wrong version throws, if no version stated than skip
    if (!!declaration.builderVersion) {
      let rangeOK = semver.validRange(declaration.builderVersion, { includePrerelease: true });
      if (!rangeOK) {
        logger.error(
          `Version "builderVersion" stated in declaration file has wrong format: "${declaration.builderVersion}".`,
          {diagnosticCode: 'INVALID_COMPILER_VERSION_REQUIREMENT', range: declaration.builderVersion}
        );

        return; // BRAKE
      }

      let versionOK = semver.satisfies(version, declaration.builderVersion, { includePrerelease: true });
      if (!versionOK) {
        logger.error(
          `Version "${declaration.builderVersion}" stated in declaration file is not supported by the heta-compiler "${version}".`, 
          {diagnosticCode: 'INCOMPATIBLE_COMPILER_VERSION', range: declaration.builderVersion, version: version}
        );

        return; // BRAKE
      }
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
    declaration.export.forEach((exportItem, i) => {
      // check the filepath
      if (!!exportItem.filepath && path.isAbsolute(exportItem.filepath)) {
        logger.error(
          `Export item property "filepath" must be relative, got ${JSON.stringify(exportItem)}.`, 
          {diagnosticCode: 'ABSOLUTE_EXPORT_PATH', filepath: exportItem.filepath, itemIndex: i}
        );
      }

      // convert format to lower case to make it case insensitive
      let exportFormat = exportItem.format.toLowerCase();
      // check if format is supported
      let ExportClass = this.exportClasses.hasOwnProperty(exportFormat) 
        && this.exportClasses[exportFormat];
      if (ExportClass) {
        this.exportArray.push(new ExportClass(exportItem));
      } else {
        logger.error(
          `Export format "${exportItem.format}" is not supported.`,
          {diagnosticCode: 'UNKNOWN_EXPORT_FORMAT', format: exportItem.format, itemIndex: i, path: 'format'}
        );
      }
    });

    return; // BRAKE
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
    // Early STOP
    if (this.logger.hasErrors) return this;

    // 1. Parsing
    let ms = new ModuleSystem(this.logger, this.fileReadHandler);
    if (path.isAbsolute(this.importModule.source)) {
      
      this.logger.error(
        `Import module source must be relative, got "${this.importModule.source}".`, 
        {diagnosticCode: 'ABSOLUTE_MODULE_PATH', source: this.importModule.source, target: 'PLATFORM'}
      );
      
      return this; // BRAKE
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

    // Middle STOP
    if (this.logger.hasErrors) {
      this.logger.warn('Units checking and export were skipped because of errors in compilation.');
      return this;
    }

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

    //return this;
  }

  lint(lintConfig) {
    const errors = validateLinterConfig(lintConfig);
    if (errors.length > 0) {
      errors.forEach(({message, ...details}) => {
        this.logger.error(`Invalid linter configuration: ${message}.`,
          {checkId: 'linter-config-valid', ...details});
      });
      return this;
    }

    Object.entries(linterChecks).forEach(([id, check]) => {
      if (Object.hasOwn(lintConfig.automaticChecks, id) && lintConfig.automaticChecks[id].severity !== 'ignore') {
        check(this, lintConfig.automaticChecks[id]);
      }
    });
    
    return this;
  }
}

function declarationDiagnosticCode(error) {
  if (error.keyword === 'errorMessage' && error.params?.errors?.length) {
    return declarationDiagnosticCode(error.params.errors[0]);
  }
  switch (error.keyword) {
  case 'required': return 'PLATFORM_DECLARATION_MISSING_PROPERTY';
  case 'type': return 'PLATFORM_DECLARATION_INVALID_PROPERTY_TYPE';
  case 'additionalProperties':
  case 'not': return 'PLATFORM_DECLARATION_UNKNOWN_PROPERTY';
  default: return 'PLATFORM_DECLARATION_INVALID_VALUE';
  }
}

function _makeAndSave(exportItem, pathPrefix) {
  let { logger, fileWriteHandler } = exportItem._builder;
  let absPath = path.join(pathPrefix, exportItem.filepath);
  logger.info(`Exporting to "${absPath}" of format "${exportItem.format}"...`);

  try {
    var outputs = exportItem.make();
  } catch (error) {
    if (!(error instanceof HetaLevelError)) throw error;
    logger.error(
      error.message, 
      {...error.opt, format: exportItem.format}
    );
    return;
  }

  outputs.forEach((out) => {
    let filePath = [absPath, out.pathSuffix].join('');
    try {
      fileWriteHandler(filePath, out.content);
    } catch (error) {
      logger.error(`Heta compiler cannot export to file: "${error.path}": ${error.message}`, {});
    }
  });
}

module.exports = {
  Builder
};
