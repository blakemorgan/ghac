#!/usr/bin/env node

const inquirer = require('inquirer')

inquirer.prompt([
  {
    type: 'password',
    name: 'token',
    mask: '*',
    message: 'What is one of your GitHub personal access tokens? ',
    suffix: '(GHaC does not store your token.)'
  }
]).then(async (answers) => {
  const filename = process.argv[process.argv.length - 1]
  const token = answers.token
  console.log(filename + ' ' + token)
})
