#!/usr/bin/env node

/*
 * This software creates a GitHub repository from a YAML file.
 * Copyright (C) 2019  Blake Morgan
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import inquirer from 'inquirer'
import yaml from 'js-yaml'
import fs from 'fs'
import { scaffoldRepository } from './tools'

console.log(
  'GitHub as Code  Copyright (C) 2019  Blake Morgan\n' +
  'This program comes with ABSOLUTELY NO WARRANTY; for details type `show w\'.\n' +
  'This is free software, and you are welcome to redistribute it\n' +
  'under certain conditions; type `show c\' for details.\n'
)

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

  try {
    const file = yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
    await scaffoldRepository(token, file)
  } catch (e) {
    console.log(e)
  }
  console.log('Repository created successfully.')
}).catch(e => console.log(e.message))
