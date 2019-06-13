#!/usr/bin/env node

/*
 * GHaC software creates and configures a GitHub repository from a YAML file.
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

const inquirer = require('inquirer')
const yaml = require('js-yaml')
const fs = require('fs')
const Octokit = require('@octokit/rest')
const pkg = require('./package')

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
    let file = yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
    await scaffoldRepository(token, file)
  } catch (e) {
    console.log(e)
  }

  console.log('Repository created successfully.')
}).catch(e => console.log(e.message))

/**
 * Reads the file passed and created a repository based off of its definitions.
 *
 * @param token The GitHub personal access token.
 * @param file The parsed YAML file.
 * @returns {Promise<void>}
 */
async function scaffoldRepository (token, file) {
  const octokit = Octokit({
    auth: token,
    userAgent: `GHaC v${pkg.version}`,
    previews: [
      'mercy',
      'london',
      'hellcat',
      'intertia',
      'luke-cage'
    ],
    baseUrl: 'https://api.github.com'
  })

  try {
    let name
    let isOrg = false
    if (file.hasOwnProperty('org')) {
      name = file.org
      isOrg = true
    }
    await createRepo(file, octokit)
  } catch (e) {
    console.log(e.message)
  }
}

/**
 *
 * @param file The GHaC file
 * @param octokit The object to interface with the API
 * @param userOrgName
 * @param isOrg
 * @returns {Promise<void>}
 */
async function createRepo (file, octokit, userOrgName, isOrg) {
  // Build the request object
  let repo = {
    name: file.name,
    auto_init: true
  }

  // Add fields to repo object if in GHaC file
  if (file.hasOwnProperty('description'))
    repo.description = file.description
  if (file.hasOwnProperty('homepage'))
    repo.homepage = file.homepage
  if (file.hasOwnProperty('private'))
    repo.private = file.private === true
  if (file.hasOwnProperty('has_issues'))
    repo.has_issues = file.has_issues === true
  if (file.hasOwnProperty('has_projects'))
    repo.has_projects = file.has_projects === true
  if (file.hasOwnProperty('has_wiki'))
    repo.has_wiki = file.has_wiki === true
  if (file.hasOwnProperty('gitignore_template'))
    repo.gitignore_template = file.gitignore_template
  if (file.hasOwnProperty('license_template'))
    repo.license_template = file.license_template
  if (file.hasOwnProperty('allow_squash_merge'))
    repo.allow_squash_merge = file.allow_squash_merge === true
  if (file.hasOwnProperty('allow_merge_commit'))
    repo.allow_merge_commit = file.allow_merge_commit === true
  if (file.hasOwnProperty('allow_rebase_merge'))
    repo.allow_rebase_merge = file.allow_rebase_merge === true

  // Send the request
  let createdRepo
  if (isOrg) {
    // Set org name
    repo.org = file.org

    // Check is repo should be part of a team
    if (file.hasOwnProperty('team_name'))
      repo.team_id = await getTeamIdFromName(octokit, file.team_name, file.org)

    // Create the org repo
    createdRepo = await octokit.repos.createInOrg(repo)

    // Configure team collaborators
    if (file.hasOwnProperty('team_collaborators') && !file.team_collaborators.empty()) {
      file.team_collaborators.forEach(async (team) => {
        await octokit.teams.addOrUpdateRepo({
          team_id: repo.team_id,
          owner: userOrgName,
          repo: createdRepo.data.name,
          permission: team.permission
        })
      })
    }
  } else { // Not a repo in an organization
    createdRepo = await octokit.repos.createForAuthenticatedUser(repo)
  }

  // Configure the repo
  if (file.hasOwnProperty('topics'))
    await octokit.repos.replaceTopics({ owner: userOrgName, repo: createdRepo.data.name, names: file.topics })
  if (file.hasOwnProperty('auto_security_fixes') && file.auto_security_fixes === true)
    await octokit.repos.enableVulnerabilityAlerts({ owner: userOrgName, repo: createdRepo.data.name })
  if (file.hasOwnProperty('user_collaborators') && !file.user_collaborators.empty()) {
    file.user_collaborators.forEach(async (user) => {
      await octokit.repos.addCollaborator({
        owner: userOrgName,
        repo: createdRepo.data.name,
        username: user.name,
        permission: user.permission
      })
    })
  }
  if (file.hasOwnProperty('deploy_keys')) {
    file.deploy_keys.forEach(async (key) => {
      if (key.title) {
        await octokit.repos.addDeployKey({
          owner: userOrgName,
          repo: createdRepo.data.name,
          key: key.key,
          read_only: key.read_only,
          title: key.title
        })
      } else {
        await octokit.repos.addDeployKey({
          owner: userOrgName,
          repo: createdRepo.data.name,
          key: key.key,
          read_only: key.read_only
        })
      }
    })
  }
}

/**
 *
 * @param octokit
 * @param teamName
 * @param orgName
 * @returns {Promise<number>}
 */
async function getTeamIdFromName (octokit, teamName, orgName) {
  let { data: team } = await octokit.teams.getByName({
    org: orgName,
    team_slug: teamName
  })
  return team.id
}

