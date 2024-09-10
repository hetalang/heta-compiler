function build(inputDict, settings) { // modules, exports
    let coreDirname = '/';
    /*
        constructor()
    */

    // create container and logger
    let c = new Container();
    
    /*
    c.logger.addTransport((level, msg, opt, levelNum) => { // temporal solution, all logs to console
        console.log(`{heta-compiler} [${level}]\t${msg}`);
    });
    */
    let minLogLevel = settings.options?.logLevel || 'info';
    let minLevelNum = levels.indexOf(minLogLevel);
    c.logger.addTransport((level, msg, opt, levelNum) => {
        let value = `\n[${level}]\t${msg}`;
        if (levelNum >= minLevelNum) {
            postMessage({action: 'console', value: value});
        }
    });

    // file paths
    let _coreDirname = path.resolve(coreDirname);
    let _distDirname = path.resolve(coreDirname, settings.options.distDir);
    let _metaDirname = path.resolve(coreDirname, settings.options.metaDir);
    let _logPath = path.resolve(coreDirname, settings.options.logPath);

    c.logger.info(`Heta builder of version ${hetaCompilerPackage.version} initialized in directory "${_coreDirname}"`);
    if (settings.id) c.logger.info(`Platform id: "${settings.id}"`);

    /*
        run()
    */
    let outputDict = {}; // {<filepath>: <Buffer>}
    c.logger.info(`Compilation of module "${settings.importModule.source}" of type "${settings.importModule.type}"...`);

    // 1. Parsing
    let ms = new ModuleSystem(c.logger, (filename) => {
        let arrayBuffer = inputDict[filename]; // Uint8Array
        if (!arrayBuffer) {
            throw new HetaLevelError(`Module ${filename} is not found.`);
        }
        let buffer = Buffer.from(arrayBuffer); // Buffer
        
        return buffer;
    });
    let sourceFilepath = path.resolve(_coreDirname, settings.importModule.source);
    let sourceType = settings.importModule.type;
    ms.addModuleDeep(sourceFilepath, sourceType, settings.importModule);

    // 2. Modules integration
    if (settings.options.debug) {
        Object.getOwnPropertyNames(ms.moduleCollection).forEach((name) => {
            let relPath = path.relative(_coreDirname, name + '.json');
            let absPath = path.join(_metaDirname, relPath);
            let str = JSON.stringify(ms.moduleCollection[name], null, 2);
            outputDict[absPath] = Buffer.from(str, 'utf-8');
            c.logger.info(`Meta file was saved to ${absPath}`);
        });
    }
    let qArr = ms.integrate();
    
    // 3. Translation
    c.loadMany(qArr, false);
    
    // 4. Binding
    c.logger.info('Setting references in elements, total length ' + c.length);
    c.knitMany();
    
    // 5. Circular start_ and ode_
    c.logger.info('Checking for circular references in Records.');
    c.checkCircRecord();
    
    // 6. check circ UnitDef
    c.checkCircUnitDef();

    
    // === STOP if errors ===
    if (!c.logger.hasErrors) {

        // 7. Units checking
        if (settings.options.unitsCheck) {
          c.logger.info('Checking unit\'s consistency.');
          c.checkUnits();
        } else {
          c.logger.warn('Units checking skipped. To turn it on set "unitsCheck: true" in declaration.');
        }

        // 8. Terms checking
        c.logger.info('Checking unit\'s terms.');
        c.checkTerms();

        // 9. Exports
        // save
        if (settings.options.skipExport) {
            c.logger.warn('Exporting skipped as stated in declaration.');
        } else if (settings.options.juliaOnly) {
            c.logger.warn('"Julia only" mode');
            //this.exportJuliaOnly(); 
            // create export without putting it to exportStorage
            let Julia = this.container.classes['Julia'];
            let exportItem = new Julia({
                format: 'Julia',
                filepath: '_julia'
            });

            _makeAndSave(exportItem, _distDirname, outputDict);
        } else {
            //this.exportMany();
            let exportElements = [...c.exportStorage].map((x) => x[1]);
            c.logger.info(`Start exporting to files, total: ${exportElements.length}.`);

            exportElements.forEach((exportItem) => _makeAndSave(exportItem, _distDirname, outputDict));
        }
      } else {
        c.logger.warn('Units checking and export were skipped because of errors in compilation.');
      }

    // 10. save logs if required
    let hetaErrors = c.hetaErrors();
    let createLog = settings.options.logMode === 'always' 
      || (settings.options.logMode === 'error' && hetaErrors.length > 0);
    if (createLog) {
      switch (settings.options.logFormat) {
      case 'json':
        var logs = JSON.stringify(c.defaultLogs, null, 2);
        break;
      default: 
        logs = c.defaultLogs
          .filter(x => x.levelNum >= minLevelNum)
          .map(x => `[${x.level}]\t${x.msg}`)
          .join('\n');  
      }

      //fs.outputFileSync(_logPath, logs);
      outputDict[_logPath] = Buffer.from(logs, 'utf-8'); // Buffer
      c.logger.info(`All logs was saved to file: "${_logPath}"`);
    }

    if (!c.logger.hasErrors) {
        postMessage({action: 'finished', dict: outputDict});
    } else {
        postMessage({action: 'stop', dict: outputDict});
    }
    
    return c;
}