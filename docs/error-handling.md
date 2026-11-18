# Error handling recommendations

These recommendations are temporary. Existing code may not yet follow them everywhere.

1. **CLI errors** use `CLILevelError`. These include errors reading or parsing the platform declaration file. Do not assign a `diagnosticCode` to them.

2. **Model problems** are reported with `logger.error` or `logger.warn`. Choose the level according to the severity. A log entry may include a `diagnosticCode` in its `opt`, but the code is not mandatory for logs. When assigning a code, include useful context where possible, such as a component path or identifier, or the name of the file involved.

   ```js
   logger.error('Invalid expression', {diagnosticCode: 'INVALID_EXPRESSION'});
   ```

3. When the logger is unavailable or the current operation must be interrupted, use `HetaLevelError`. A `diagnosticCode` is required. The second argument is stored in `error.opt` along with any context. A handler may catch the exception and continue execution.

   ```js
   throw new HetaLevelError('Invalid expression', {
     diagnosticCode: 'INVALID_EXPRESSION',
     expression: 'x +'
   });
   ```

4. Catch `HetaLevelError` inside the application where possible and report it through `logger.error` or `logger.warn`, passing on its message and `opt`. The handler chooses the log level. If the exception reaches the CLI, it is reported as an error and execution stops.

5. **The boundary between CLI and model errors** is after the platform declaration has been read and parsed. Reading or parsing the declaration belongs to the CLI. Validating the loaded declaration and processing modules belong to `Builder`; an invalid declaration structure is reported as a `HetaLevelError` or a log entry.

6. **Internal application errors** use an appropriate standard or other exception type, excluding `HetaLevelError` and `CLILevelError`. Do not assign a model diagnostic code based only on an exception's type. As a temporary exception, `MODULE_PROCESSING_ERROR` can represent either a module problem or an internal application error.

Diagnostic codes also cover platform and export configuration problems, export processes, unavailable files, and unsupported or invalid formats. The codes and their descriptions are defined in `src/diagnostic-codes.json`.
