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

const inquirer = require('inquirer')
const yaml = require('js-yaml')
const fs = require('fs')
const Octokit = require('@octokit/rest')
const pkg = require('../package')
const _ = require('lodash/core')

console.log(
  'GitHub as Code  Copyright (C) 2019  Blake Morgan\n' +
  'This program comes with ABSOLUTELY NO WARRANTY; for details type `show w\'.\n' +
  'This is free software, and you are welcome to redistribute it\n' +
  'under certain conditions; type `show c\' for details.\n'
)

module.exports = inquirer.prompt([
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
    throw e
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
      'luke-cage',
      'mister-fantastic',
      'dorian'
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
    await createRepo(file, octokit, name, isOrg)
  } catch (e) {
    console.log(e.message)
  }
}

/**
 * Sends requests to the GitHub API to create the repo
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
  if (file.hasOwnProperty('description')) { repo.description = file.description }
  if (file.hasOwnProperty('homepage')) { repo.homepage = file.homepage }
  if (file.hasOwnProperty('private')) { repo.private = file.private === true }
  if (file.hasOwnProperty('has_issues')) { repo.has_issues = file.has_issues === true }
  if (file.hasOwnProperty('has_projects')) { repo.has_projects = file.has_projects === true }
  if (file.hasOwnProperty('has_wiki')) { repo.has_wiki = file.has_wiki === true }
  if (file.hasOwnProperty('gitignore_template')) { repo.gitignore_template = file.gitignore_template }
  if (file.hasOwnProperty('license_template')) { repo.license_template = file.license_template }
  if (file.hasOwnProperty('allow_squash_merge')) { repo.allow_squash_merge = file.allow_squash_merge === true }
  if (file.hasOwnProperty('allow_merge_commit')) { repo.allow_merge_commit = file.allow_merge_commit === true }
  if (file.hasOwnProperty('allow_rebase_merge')) { repo.allow_rebase_merge = file.allow_rebase_merge === true }

  // Send the request
  let createdRepo
  if (isOrg) {
    // Set org name
    repo.org = file.org

    // Create the org repo
    createdRepo = await octokit.repos.createInOrg(repo)

    // Configure team collaborators
    if (file.hasOwnProperty('team_collaborators') && !_.isEmpty(file.team_collaborators)) {
      file.team_collaborators.forEach(async (team) => {
        let teamId = await getTeamIdFromName(octokit, team.name, file.org)
        await octokit.teams.addOrUpdateRepo({
          team_id: teamId,
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
  if (file.hasOwnProperty('topics')) {
    await octokit.repos.replaceTopics({
      owner: userOrgName,
      repo: createdRepo.data.name,
      names: file.topics
    })
  }
  if (file.hasOwnProperty('auto_security_fixes') && file.auto_security_fixes === true) {
    await octokit.repos.enableAutomatedSecurityFixes({
      owner: userOrgName,
      repo: createdRepo.data.name
    })
  }
  if (file.hasOwnProperty('vulnerability_alerts') && file.vulnerability_alerts === true) {
    await octokit.repos.enableVulnerabilityAlerts({ owner: userOrgName, repo: createdRepo.data.name })
  }
  if (file.hasOwnProperty('user_collaborators') && !!_.isEmpty(file.user_collaborators)) {
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

  // Create projects
  if (file.hasOwnProperty('projects')) {
    file.projects.forEach(async (project) => {
      let params = {
        owner: userOrgName,
        repo: createdRepo.data.name,
        name: project.name
      }

      if (project.hasOwnProperty('body')) { params.body = project.body }

      let createdProject = await octokit.projects.createForRepo(params)

      // Collaborators
      if (project.hasOwnProperty('collaborators')) {
        project.collaborators.forEach(async (collaborator) => {
          await octokit.projects.addCollaborator({
            project_id: createdProject.data.id,
            username: collaborator
          })
        })
      }

      // Columns
      if (project.hasOwnProperty('columns')) {
        project.columns.forEach(async (column) => {
          let createdColumn = await octokit.projects.createColumn({
            project_id: createdProject.data.id,
            name: column.name
          })

          // Cards
          if (column.hasOwnProperty('cards')) {
            column.cards.forEach(async (note) => {
              await octokit.projects.createCard({
                column_id: createdColumn.data.id,
                note: note
              })
            })
          }
        })
      }
    })
  }

  // Create branches
  if (file.hasOwnProperty('branches')) {
    const master = await octokit.git.getRef({
      owner: userOrgName,
      repo: createdRepo.data.name,
      ref: 'heads/master'
    })
    file.branches.forEach(async (branch) => {
      if (branch.name !== 'master') {
        await octokit.git.createRef({
          owner: userOrgName,
          repo: createdRepo.data.name,
          ref: `refs/heads/${branch.name}`,
          sha: master.data.object.sha
        })
      }

      // Prepare status checks
      let statusCheck = null
      if (branch.protection.hasOwnProperty('required_status_checks')) {
        let contexts = []
        branch.protection.required_status_checks.contexts.forEach((context) => {
          contexts.push(context)
        })
        statusCheck = {
          strict: branch.protection.required_status_checks.strict,
          contexts: contexts
        }
      }

      // Prepare pull request reviews
      let requiredPrReviews = null
      if (branch.protection.hasOwnProperty('required_pull_request_reviews')) {
        requiredPrReviews = {}
        let dismissalRestrictions = null
        if (branch.protection.required_pull_request_reviews.hasOwnProperty('dismissal_restrictions')) {
          dismissalRestrictions = {}
          if (branch.protection.required_pull_request_reviews.dismissal_restrictions.hasOwnProperty('users')) {
            let users = []
            branch.protection.required_pull_request_reviews.dismissal_restrictions.users.forEach((user) => {
              users.push(user)
            })

            let teams = []
            branch.protection.required_pull_request_reviews.dismissal_restrictions.teams.forEach((team) => {
              teams.push(team)
            })
            dismissalRestrictions.users = users
            dismissalRestrictions.teams = teams
          }
          requiredPrReviews.dismissal_restrictions = dismissalRestrictions
        }
        if (branch.protection.required_pull_request_reviews.hasOwnProperty('dismiss_stale_reviews')) { requiredPrReviews.dismiss_stale_reviews = branch.protection.required_pull_request_reviews.dismiss_stale_reviews }
        if (branch.protection.required_pull_request_reviews.hasOwnProperty('require_code_owner_reviews')) { requiredPrReviews.require_code_owner_reviews = branch.protection.required_pull_request_reviews.require_code_owner_reviews }
        if (branch.protection.required_pull_request_reviews.hasOwnProperty('required_approving_review_count')) { requiredPrReviews.required_approving_review_count = branch.protection.required_pull_request_reviews.required_approving_review_count }
      }
      // Prepare restrictions
      let restrictions = null
      if (branch.protection.hasOwnProperty('restrictions')) {
        restrictions = {}
        let users = []
        if (branch.protection.restrictions.hasOwnProperty('users')) {
          branch.protection.restrictions.users.forEach((user) => {
            users.push(user)
          })
        }
        restrictions.users = users
        let teams = []
        if (branch.protection.restrictions.hasOwnProperty('teams')) {
          branch.protection.restrictions.teams.forEach((team) => {
            teams.push(team)
          })
        }
        restrictions.teams = teams
      }

      await octokit.repos.updateBranchProtection({
        owner: userOrgName,
        repo: createdRepo.data.name,
        branch: branch.name,
        required_status_checks: statusCheck,
        enforce_admins: branch.protection.enforce_admins,
        required_pull_request_reviews: requiredPrReviews,
        restrictions: restrictions
      })
    })
  }

  // Configure pages
  if (file.hasOwnProperty('pages') && file.pages.enabled === true) {
    let source = null
    if (file.pages.hasOwnProperty('branch') && file.pages.hasOwnProperty('path')) {
      source = {
        branch: file.pages.branch,
        path: file.pages.path
      }
    }

    await octokit.repos.enablePagesSite({
      owner: userOrgName,
      repo: createdRepo.data.name,
      source: source
    })
  }
}

/**
 * Get the team name from the team ID.
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
