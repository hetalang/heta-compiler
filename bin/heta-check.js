const { checkVersion } = require('./check-version');
const program = require('commander');

program
  .description('Check if the latest version is installed.')
  .usage('')
  .parse(process.argv);

checkVersion((err) => {
    if (err) throw err;
})
