const { execSync } = require('child_process');

/* global describe, it */

describe('Run build from CLI', () => {
  it('should build for all export without errors', () => {
    execSync('npx heta build --log-level=error --log-mode=never cases/0-hello-world', { stdio: 'inherit' });
  });
});