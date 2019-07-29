import Octokit from '@octokit/rest'
// @ts-ignore package.json has no typings
import pkg from '../package'

/**
 * Reads the file passed and created a repository based off of its definitions.
 *
 * @param token The GitHub personal access token.
 * @param file The parsed YAML file.
 * @returns {Promise<void>}
 */
export async function scaffoldRepository (token: string, file: GhacFile) {
  const octokit = new Octokit({
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
    let name = ''
    let isOrg = false
    if (file.hasOwnProperty('org')) {
      name = file.org
      isOrg = true
    }
    await _createRepo(file, octokit, name, isOrg)
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
async function _createRepo (file: GhacFile, octokit: Octokit, userOrgName: string, isOrg: boolean) {
  // Build the request object
  let repo: Repository
  if (isOrg) {
    repo = {
      name: file.name,
      auto_init: true,
      org: file.org
    }
  } else {
    repo = {
      name: file.name,
      auto_init: true,
      org: ''
    }
  }

  // Add fields to repo object if in GHaC file
  if (file.description) { repo.description = file.description }
  if (file.homepage) { repo.homepage = file.homepage }
  if (file.private) { repo.private = file.private }
  if (file.has_issues) { repo.has_issues = file.has_issues }
  if (file.has_projects) { repo.has_projects = file.has_projects }
  if (file.has_wiki) { repo.has_wiki = file.has_wiki }
  if (file.gitignore_template) { repo.gitignore_template = file.gitignore_template }
  if (file.license_template) { repo.license_template = file.license_template }
  if (file.allow_squash_merge) { repo.allow_squash_merge = file.allow_squash_merge }
  if (file.allow_merge_commit) { repo.allow_merge_commit = file.allow_merge_commit }
  if (file.allow_rebase_merge) { repo.allow_rebase_merge = file.allow_rebase_merge }

  // Send the request
  let createdRepo
  if (isOrg) {
    // Set org name
    repo.org = file.org

    // Create the org repo
    createdRepo = await octokit.repos.createInOrg(repo)

    // Configure team collaborators
    if (file.team_collaborators) {
      for (const team of file.team_collaborators) {
        const teamId = await _getTeamIdFromName(octokit, team.name, file.org)
        await octokit.teams.addOrUpdateRepo({
          team_id: teamId,
          owner: userOrgName,
          repo: createdRepo.data.name,
          permission: team.permission
        })
      }
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
    await octokit.repos.enableVulnerabilityAlerts({
      owner: userOrgName,
      repo: createdRepo.data.name
    })
  }
  if (file.user_collaborators) {
    for (const user of file.user_collaborators) {
      await octokit.repos.addCollaborator({
        owner: userOrgName,
        repo: createdRepo.data.name,
        username: user.name,
        permission: user.permission
      })
    }
  }
  if (file.deploy_keys) {
    for (const key of file.deploy_keys) {
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
    }
  }

  // Create projects
  if (file.projects) {
    for (const project of file.projects) {
      const params = {
        owner: userOrgName,
        repo: createdRepo.data.name,
        name: project.name,
        body: ''
      }

      if (project.hasOwnProperty('body')) { params.body = project.body }

      const createdProject = await octokit.projects.createForRepo(params)

      // Collaborators
      if (project.collaborators) {
        for (const collaborator of project.collaborators) {
          await octokit.projects.addCollaborator({
            project_id: createdProject.data.id,
            username: collaborator
          })
        }
      }

      // Columns
      if (project.columns) {
        for (const column of project.columns) {
          const createdColumn = await octokit.projects.createColumn({
            project_id: createdProject.data.id,
            name: column.name
          })

          // Cards
          if (column.cards) {
            for (const note of column.cards) {
              await octokit.projects.createCard({
                column_id: createdColumn.data.id,
                note: note
              })
            }
          }
        }
      }
    }
  }

  // Create branches
  if (file.branches) {
    const master = await octokit.git.getRef({
      owner: userOrgName,
      repo: createdRepo.data.name,
      ref: 'heads/master'
    })
    for (const branch of file.branches) {
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
      if (branch.protection) {
        if (branch.protection.required_status_checks) {
          const contexts: string[] = []
          if (branch.protection.required_status_checks.contexts) {
            branch.protection.required_status_checks.contexts.forEach((context) => {
              contexts.push(context)
            })
            statusCheck = {
              strict: branch.protection.required_status_checks.strict,
              contexts: contexts
            }
          }
        }

        // Prepare pull request reviews
        let requiredPrReviews: RequiredPullRequestReviews = {}
        if (branch.protection.required_pull_request_reviews) {
          let dismissalRestrictions: DismissalRestrictions = {}
          if (branch.protection.required_pull_request_reviews.dismissal_restrictions) {
            const users: string[] = []
            const teams: string[] = []
            if (branch.protection.required_pull_request_reviews.dismissal_restrictions.users) {
              branch.protection.required_pull_request_reviews.dismissal_restrictions.users.forEach((user) => {
                users.push(user)
              })
            }
            if (branch.protection.required_pull_request_reviews.dismissal_restrictions.teams) {
              branch.protection.required_pull_request_reviews.dismissal_restrictions.teams.forEach((team) => {
                teams.push(team)
              })
            }
            dismissalRestrictions.users = users
            dismissalRestrictions.teams = teams
            requiredPrReviews.dismissal_restrictions = dismissalRestrictions
          }
          if (branch.protection.required_pull_request_reviews.hasOwnProperty('dismiss_stale_reviews')) { requiredPrReviews.dismiss_stale_reviews = branch.protection.required_pull_request_reviews.dismiss_stale_reviews }
          if (branch.protection.required_pull_request_reviews.hasOwnProperty('require_code_owner_reviews')) { requiredPrReviews.require_code_owner_reviews = branch.protection.required_pull_request_reviews.require_code_owner_reviews }
          if (branch.protection.required_pull_request_reviews.hasOwnProperty('required_approving_review_count')) { requiredPrReviews.required_approving_review_count = branch.protection.required_pull_request_reviews.required_approving_review_count }
        }

        // Prepare restrictions
        let restrictions: BranchRestrictions = {}
        if (branch.protection.restrictions) {
          const users: string[] = []
          if (branch.protection.restrictions.users) {
            branch.protection.restrictions.users.forEach((user) => {
              users.push(user)
            })
          }
          restrictions.users = users
          const teams: string[] = []
          if (branch.protection.restrictions.teams) {
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
      }
    }
  }

  // Configure pages
  if (file.pages && file.pages.enabled === true) {
    let source = {}
    if (file.pages.branch && file.pages.path) {
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
async function _getTeamIdFromName (octokit: Octokit, teamName: string, orgName: string) {
  const { data: team } = await octokit.teams.getByName({
    org: orgName,
    team_slug: teamName
  })
  return team.id
}
