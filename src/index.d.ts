interface GhacFile {
  name: string
  org: string
  description?: string
  homepage?: string
  private?: boolean
  has_issues?: boolean
  has_projects?: boolean
  has_wiki?: boolean
  gitignore_template?: string
  license_template?: string
  allow_squash_merge?: boolean
  allow_rebase_merge?: boolean
  allow_merge_commit?: boolean
  topics: string[]
  auto_security_fixes?: boolean
  vulnerability_alerts?: boolean
  user_collaborators?: Collaborator[]
  team_collaborators?: Collaborator[]
  deploy_keys?: DeployKey[]
  projects?: Project[]
  branches?: Branch[]
  pages?: PagesOptions
}

interface Repository {
  name: string
  auto_init: boolean
  org: string
  description?: string
  homepage?: string
  private?: boolean
  has_issues?: boolean
  has_projects?: boolean
  has_wiki?: boolean
  gitignore_template?: string
  license_template?: string
  allow_squash_merge?: boolean
  allow_rebase_merge?: boolean
  allow_merge_commit?: boolean
  topics?: string[]
  auto_security_fixes?: boolean
  vulnerability_alerts?: boolean
  user_collaborators?: Collaborator[]
  team_collaborators?: Collaborator[]
  deploy_keys?: DeployKey[]
  projects?: Project[]
  branches?: Branch[]
  pages?: PagesOptions
}

interface Collaborator {
  name: string
  permission: 'pull' | 'push' | 'admin'
}

interface DeployKey {
  title: string
  key: string
  read_only: boolean
}

interface Project {
  name: string
  body: string
  collaborators?: string[]
  columns?: Column[]
}

interface Column {
  name: string
  cards?: string[]
}

interface Branch {
  name: string
  protection?: BranchProtection
}

interface BranchProtection {
  required_status_checks?: RequiredStatusChecks
  enforce_admins: boolean
  required_pull_request_reviews?: RequiredPullRequestReviews
  restrictions: BranchRestrictions
}

interface RequiredStatusChecks {
  strict: boolean
  contexts?: string[]
}

interface RequiredPullRequestReviews {
  dismissal_restrictions?: DismissalRestrictions
  dismiss_stale_reviews?: boolean
  require_code_owner_reviews?: boolean
  required_approving_review_count?: number
}

interface DismissalRestrictions {
  users?: string[]
  teams?: string[]
}

interface BranchRestrictions {
  users?: string[]
  teams?: string[]
}

interface PagesOptions {
  enabled?: boolean
  branch?: string
  path?: string
}
