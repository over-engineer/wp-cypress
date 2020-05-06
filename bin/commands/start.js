const fs = require('fs');
const shell = require('shelljs');

const retryCommand = require('../utils/retryCommand');
const createConfig = require('../modules/createConfig');
const { exec, cli } = require('../utils/exec');
const run = require('../utils/run');

const start = async (userConfig, packageDir, logFile) => {
  const configFile = fs.createWriteStream(`${packageDir}/config.json`);
  configFile.write(JSON.stringify(createConfig(userConfig, packageDir)));

  shell.cd(packageDir);

  await run(
    async () => exec(
      'docker-compose down --volumes && docker-compose build && docker-compose up -d',
      logFile,
    ),
    'Creating test container',
    'Test container created',
    logFile,
  );

  await run(
    async () => retryCommand(() => cli('mysqladmin ping -h"db"', logFile), 2000, 30),
    'Waiting for database connection',
    'Database connected',
    logFile,
  );
};

module.exports = start;