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
| `topic` | Array\<String\> | No | None | Topics of the repository.
| `auto_security_fixes` | Boolean | No | `false` | Option to enable automatic security features in the repo.
| `vulnerability_alerts` | Boolean | No | `false` | Option to enable vulnerability alerts for the repo.
