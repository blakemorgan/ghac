![GitHub](https://img.shields.io/github/license/blakemorgan/ghac.svg?style=flat)
![GitHub package.json version](https://img.shields.io/github/package-json/v/blakemorgan/ghac.svg)

# GitHub as Code

*ghac* is a script to automate the creation of GitHub repositories. It takes in a `ghac.yml` file and creates remote GitHub repositories based on the settings it contains.

## Compatibility

This project is compatible with v3 of the GitHub API (REST).

## Preview API's

This project uses some of GitHub's API's that are a preview.

## The ghac.yml file

The `ghac.yml` file contains all the properties to create your repository. The following tables list properties, their types, and default values.

### Basic Information

| Property | Type | Required | Default Value | Description
| -------- | ---- | -------- | ------------- | -----------
| `name` | String | Yes | None | Name of the repo.
| `org` | String | No | None | Description of the repo.
| `homepage` | String | No | None | Homepage for the project.
| `private` | Boolean | No | `false` | Flag the repo as private.
| `has_issues` | Boolean | No | `true` | Enable/disable the issues feature.
| `has_projects` | Boolean | No | `true` | Enable/disable the projects feature.
| `has_wiki` | Boolean | No | `true` | Enable/disable the wiki feature.
| `gitignore_template` | String | No | None | Template for a `.gitignore` file.
| `license_template` | String | No | None | Template for a `LICENSE` file.
| `allow_squash_merge` | Boolean | No | `true` | Option to allow admins to squash and merge PR's.
| `allow_merge_commit` | Boolean | No | `true` | Option to allow create of commit when a PR is merged.
| `allow_rebase_merge` | Boolean | No | `true` | Option to allow admins to rebase and merge PR's
| `topics` | Array\<String\> | No | None | Topics of the repository.
| `auto_security_fixes` | Boolean | No | `false` | Option to enable automatic security features in the repo.
| `vulnerability_alerts` | Boolean | No | `false` | Option to enable vulnerability alerts for the repo.

```yaml
name: # string, required
org: # string, optional
description: # string, optional
homepage: # string, optional
private: # boolean, optional, default false
has_isues: # boolean, optional, default true
has_projects: # boolean, optional, default true
has_wiki: # boolean, optional, default true
gitignore_template: # string, optional
license_template: # string, optional
allow_squash_merge: # boolean, optional, default true
allow_merge_commit: # boolean, optional, default true
allow_rebase_merge: # boolean, optional, default true
topics: # optional
  - # topic 1
  - # topic 2
  - # topic ...
auto_security_fixes: # boolean
vulnerability_alerts: # boolean
```

### Collaborators

| Property | Type | Required | Default | Description
| -------- | ---- | -------- | ------- | -----------
| `team_collaborators` | Array\<Object\> | No | None | Array of objects requiring the `name` and `permission` properties. Only works if part of an organization.
| `name` | String | Yes | None | Team name. Required property when using `team_collaborators`.
| `permission` | String | Yes | None | Team permissions. Required property when using `team_collaborators`. Possible values are `pull`, `push`, or `admin`.
| `user_collaborators` | Array | No | None | Array of objects requiring the `name` and `permission` properties.
| `name` | String | Yes | None | Team name. Required property when using `user_collaborators`.
| `permission` | String | Yes | None | User permissions. Required property when using `team_collaborators`. Possible values are `pull`, `push`, or `admin`.

```yaml
user_collaborators:
  - name: # user name, required with parent
    permission: # string, required with parent
team_collaborators:
  - name: # team name, required with parent
    permission: # string, required with parent
```

### Deploy Keys

| Property | Type | Required | Default | Description
| -------- | ---- | -------- | ------- | -----------
| `deploy_keys` | Array\<Object\> | No | None | Array of objects each requiring `key` property.
| `title` | String | No | None | Title of the key.
| `key` | String | Yes | None | The contents of the key.
| `read_only` | Boolean | Yes | `false` | If `true`, the key will only be able to read repository contents. Otherwise, the key will be able to read and write.

```yaml
deploy_keys:
  - title: # string
    key: # string
    read_only: # boolean
  - # ...
```

### Projects

| Property | Type | Required | Default | Description
| -------- | ---- | -------- | ------- | -----------
| `projects` | Array\<Object\> | No | None | Array of projects for the repo. Required the `name` field.
| `name` | String | Yes | None | Name of the project
| `body` | String | No | None | The description of the project
| `collaborators` | Array\<String\> | No | None | Array of user names.
| `columns` | Array\<Objects\> | No | None | Array of columns. Requires the `name` field.
| `name` | String | Yes | None | The name of the column.
| `cards` | Array\<note\> | No | None | The cards in each column. Contains an array of notes.
| `note` | String | No | None | Notes on each card.

```yaml
projects:
  - name: # string, required with parent
    body: # string
    collaborators:
      - # username 1
      - # username 2
      - # ...
    columns:
      - name: # string, required with parent
        cards:
          - note: # string 1
          - note: # string 2
          - note: # string ...
```

### Branches

| Property | Type | Required | Default | Description
| -------- | ---- | -------- | ------- | -----------
| `branches` | Array\<Object\> | No | None | Array of branches for the repo. Requires the `name` property.
| `name` | String | Yes | None | The name of the branch.
| `protection` | Object | No | None | Branch protection rules.
| `required_status_checks` | Object | No | None | Required status checks of the branch. Contains the `strict` and `context` properties.
| `strict` | Boolean | No | None | Requires branches to be up to date before merging.
| `context` | Array\<String\> | No | None | The list of status checks to require in order to merge into this branch
| `enforce_admins` | Boolean | No | None | Enforce rules for repo administrators.
| `required_pull_request_reviews` | Object | No | None | Require at least one approving review on a pull request, before merging. Contains `dismissal_restrictions`, `dismiss_stale_reviews`, `require_code_owner_reviews`, and `required_approving_review_count` properties.
| `dismissal_restrictions` | Object | No | None | Specify which users and teams can dismiss pull request reviews. Contains the `users` and `teams` properties.
| `users` | Array\<String\> | No | None | List of users who can dismiss PR's.
| `teams` | Array\<String\> | No | None | List of teams who can dismiss PR's (only for organizations).
| `dismiss_stale_reviews` | Boolean | No | None | Set to `true` if you want to automatically dismiss approving reviews when someone pushes a new commit.
| `require_code_owner_reviews` | Boolean | No | None | Block merging until a code owner reviews the PR.
| `required_approving_review_count` | Int | No | None | Number of required approving reviews
| `restrictions` | Object | No | None | Restrict who can push to this branch.
| `users` | Array\<String\> | No | None | Users who can push to the branch.
| `team` | Array\<String\> | No | None | Teams who can push to the branch.

```yaml
branches:
  - name: # string, required with parent
    protection:
      required_status_checks:
        strict: # boolean
        contexts:
          - # Check 1
          - # Check 2
          - # ...
      enforce_admins: # boolean
      required_pull_request_reviews:
        dismissal_restrictions:
          users:
            - # List of users
          teams:
            - # list of teams
        dismiss_stale_reviews: # boolean
        require_code_owner_reviews: # boolean
        required_approving_review_count: # int
      restrictions:
        users:
          - # List of users
        teams:
          - # List of teams
```

### Pages

| Property | Type | Required | Default | Description
| -------- | ---- | -------- | ------- | -----------
| `pages` | Object | No | None | Enable pages for your repo. Contains the `enabled`, `branch`, and `path` keys.
| `enabled` | Boolean | No | None | Set to `true` to enable pages.
| `branch` | String | No | None | The repository branch used to publish your site's source files. Can be either `master` or `gh-pages`.
| `path` | String | No | None | The repository directory that includes the source files for the Pages site. When branch is `master`, you can change path to `/docs`. When branch is `gh-pages`, you are unable to specify a path other than `/`.


```yaml
pages:
  enabled: # boolean
  branch: # branch name
  path: # path
```
