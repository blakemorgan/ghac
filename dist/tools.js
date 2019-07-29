"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rest_1 = __importDefault(require("@octokit/rest"));
// @ts-ignore package.json has no typings
var package_1 = __importDefault(require("../package"));
/**
 * Reads the file passed and created a repository based off of its definitions.
 *
 * @param token The GitHub personal access token.
 * @param file The parsed YAML file.
 * @returns {Promise<void>}
 */
function scaffoldRepository(token, file) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, name_1, isOrg, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    octokit = new rest_1.default({
                        auth: token,
                        userAgent: "GHaC v" + package_1.default.version,
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
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    name_1 = '';
                    isOrg = false;
                    if (file.hasOwnProperty('org')) {
                        name_1 = file.org;
                        isOrg = true;
                    }
                    return [4 /*yield*/, _createRepo(file, octokit, name_1, isOrg)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log(e_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.scaffoldRepository = scaffoldRepository;
/**
 * Sends requests to the GitHub API to create the repo
 *
 * @param file The GHaC file
 * @param octokit The object to interface with the API
 * @param userOrgName
 * @param isOrg
 * @returns {Promise<void>}
 */
function _createRepo(file, octokit, userOrgName, isOrg) {
    return __awaiter(this, void 0, void 0, function () {
        var repo, createdRepo, _i, _a, team, teamId, _b, _c, user, _d, _e, key, _f, _g, project, params, createdProject, _h, _j, collaborator, _k, _l, column, createdColumn, _m, _o, note, master, _loop_1, _p, _q, branch, source;
        return __generator(this, function (_r) {
            switch (_r.label) {
                case 0:
                    if (isOrg) {
                        repo = {
                            name: file.name,
                            auto_init: true,
                            org: file.org
                        };
                    }
                    else {
                        repo = {
                            name: file.name,
                            auto_init: true,
                            org: ''
                        };
                    }
                    // Add fields to repo object if in GHaC file
                    if (file.description) {
                        repo.description = file.description;
                    }
                    if (file.homepage) {
                        repo.homepage = file.homepage;
                    }
                    if (file.private) {
                        repo.private = file.private;
                    }
                    if (file.has_issues) {
                        repo.has_issues = file.has_issues;
                    }
                    if (file.has_projects) {
                        repo.has_projects = file.has_projects;
                    }
                    if (file.has_wiki) {
                        repo.has_wiki = file.has_wiki;
                    }
                    if (file.gitignore_template) {
                        repo.gitignore_template = file.gitignore_template;
                    }
                    if (file.license_template) {
                        repo.license_template = file.license_template;
                    }
                    if (file.allow_squash_merge) {
                        repo.allow_squash_merge = file.allow_squash_merge;
                    }
                    if (file.allow_merge_commit) {
                        repo.allow_merge_commit = file.allow_merge_commit;
                    }
                    if (file.allow_rebase_merge) {
                        repo.allow_rebase_merge = file.allow_rebase_merge;
                    }
                    if (!isOrg) return [3 /*break*/, 7];
                    // Set org name
                    repo.org = file.org;
                    return [4 /*yield*/, octokit.repos.createInOrg(repo)
                        // Configure team collaborators
                    ];
                case 1:
                    // Create the org repo
                    createdRepo = _r.sent();
                    if (!file.team_collaborators) return [3 /*break*/, 6];
                    _i = 0, _a = file.team_collaborators;
                    _r.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    team = _a[_i];
                    return [4 /*yield*/, _getTeamIdFromName(octokit, team.name, file.org)];
                case 3:
                    teamId = _r.sent();
                    return [4 /*yield*/, octokit.teams.addOrUpdateRepo({
                            team_id: teamId,
                            owner: userOrgName,
                            repo: createdRepo.data.name,
                            permission: team.permission
                        })];
                case 4:
                    _r.sent();
                    _r.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, octokit.repos.createForAuthenticatedUser(repo)];
                case 8:
                    createdRepo = _r.sent();
                    _r.label = 9;
                case 9:
                    if (!file.hasOwnProperty('topics')) return [3 /*break*/, 11];
                    return [4 /*yield*/, octokit.repos.replaceTopics({
                            owner: userOrgName,
                            repo: createdRepo.data.name,
                            names: file.topics
                        })];
                case 10:
                    _r.sent();
                    _r.label = 11;
                case 11:
                    if (!(file.hasOwnProperty('auto_security_fixes') && file.auto_security_fixes === true)) return [3 /*break*/, 13];
                    return [4 /*yield*/, octokit.repos.enableAutomatedSecurityFixes({
                            owner: userOrgName,
                            repo: createdRepo.data.name
                        })];
                case 12:
                    _r.sent();
                    _r.label = 13;
                case 13:
                    if (!(file.hasOwnProperty('vulnerability_alerts') && file.vulnerability_alerts === true)) return [3 /*break*/, 15];
                    return [4 /*yield*/, octokit.repos.enableVulnerabilityAlerts({
                            owner: userOrgName,
                            repo: createdRepo.data.name
                        })];
                case 14:
                    _r.sent();
                    _r.label = 15;
                case 15:
                    if (!file.user_collaborators) return [3 /*break*/, 19];
                    _b = 0, _c = file.user_collaborators;
                    _r.label = 16;
                case 16:
                    if (!(_b < _c.length)) return [3 /*break*/, 19];
                    user = _c[_b];
                    return [4 /*yield*/, octokit.repos.addCollaborator({
                            owner: userOrgName,
                            repo: createdRepo.data.name,
                            username: user.name,
                            permission: user.permission
                        })];
                case 17:
                    _r.sent();
                    _r.label = 18;
                case 18:
                    _b++;
                    return [3 /*break*/, 16];
                case 19:
                    if (!file.deploy_keys) return [3 /*break*/, 25];
                    _d = 0, _e = file.deploy_keys;
                    _r.label = 20;
                case 20:
                    if (!(_d < _e.length)) return [3 /*break*/, 25];
                    key = _e[_d];
                    if (!key.title) return [3 /*break*/, 22];
                    return [4 /*yield*/, octokit.repos.addDeployKey({
                            owner: userOrgName,
                            repo: createdRepo.data.name,
                            key: key.key,
                            read_only: key.read_only,
                            title: key.title
                        })];
                case 21:
                    _r.sent();
                    return [3 /*break*/, 24];
                case 22: return [4 /*yield*/, octokit.repos.addDeployKey({
                        owner: userOrgName,
                        repo: createdRepo.data.name,
                        key: key.key,
                        read_only: key.read_only
                    })];
                case 23:
                    _r.sent();
                    _r.label = 24;
                case 24:
                    _d++;
                    return [3 /*break*/, 20];
                case 25:
                    if (!file.projects) return [3 /*break*/, 39];
                    _f = 0, _g = file.projects;
                    _r.label = 26;
                case 26:
                    if (!(_f < _g.length)) return [3 /*break*/, 39];
                    project = _g[_f];
                    params = {
                        owner: userOrgName,
                        repo: createdRepo.data.name,
                        name: project.name,
                        body: ''
                    };
                    if (project.hasOwnProperty('body')) {
                        params.body = project.body;
                    }
                    return [4 /*yield*/, octokit.projects.createForRepo(params)
                        // Collaborators
                    ];
                case 27:
                    createdProject = _r.sent();
                    if (!project.collaborators) return [3 /*break*/, 31];
                    _h = 0, _j = project.collaborators;
                    _r.label = 28;
                case 28:
                    if (!(_h < _j.length)) return [3 /*break*/, 31];
                    collaborator = _j[_h];
                    return [4 /*yield*/, octokit.projects.addCollaborator({
                            project_id: createdProject.data.id,
                            username: collaborator
                        })];
                case 29:
                    _r.sent();
                    _r.label = 30;
                case 30:
                    _h++;
                    return [3 /*break*/, 28];
                case 31:
                    if (!project.columns) return [3 /*break*/, 38];
                    _k = 0, _l = project.columns;
                    _r.label = 32;
                case 32:
                    if (!(_k < _l.length)) return [3 /*break*/, 38];
                    column = _l[_k];
                    return [4 /*yield*/, octokit.projects.createColumn({
                            project_id: createdProject.data.id,
                            name: column.name
                        })
                        // Cards
                    ];
                case 33:
                    createdColumn = _r.sent();
                    if (!column.cards) return [3 /*break*/, 37];
                    _m = 0, _o = column.cards;
                    _r.label = 34;
                case 34:
                    if (!(_m < _o.length)) return [3 /*break*/, 37];
                    note = _o[_m];
                    return [4 /*yield*/, octokit.projects.createCard({
                            column_id: createdColumn.data.id,
                            note: note
                        })];
                case 35:
                    _r.sent();
                    _r.label = 36;
                case 36:
                    _m++;
                    return [3 /*break*/, 34];
                case 37:
                    _k++;
                    return [3 /*break*/, 32];
                case 38:
                    _f++;
                    return [3 /*break*/, 26];
                case 39:
                    if (!file.branches) return [3 /*break*/, 44];
                    return [4 /*yield*/, octokit.git.getRef({
                            owner: userOrgName,
                            repo: createdRepo.data.name,
                            ref: 'heads/master'
                        })];
                case 40:
                    master = _r.sent();
                    _loop_1 = function (branch) {
                        var statusCheck, contexts_1, requiredPrReviews, dismissalRestrictions, users_1, teams_1, restrictions, users_2, teams_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(branch.name !== 'master')) return [3 /*break*/, 2];
                                    return [4 /*yield*/, octokit.git.createRef({
                                            owner: userOrgName,
                                            repo: createdRepo.data.name,
                                            ref: "refs/heads/" + branch.name,
                                            sha: master.data.object.sha
                                        })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    statusCheck = null;
                                    if (!branch.protection) return [3 /*break*/, 4];
                                    if (branch.protection.required_status_checks) {
                                        contexts_1 = [];
                                        if (branch.protection.required_status_checks.contexts) {
                                            branch.protection.required_status_checks.contexts.forEach(function (context) {
                                                contexts_1.push(context);
                                            });
                                            statusCheck = {
                                                strict: branch.protection.required_status_checks.strict,
                                                contexts: contexts_1
                                            };
                                        }
                                    }
                                    requiredPrReviews = {};
                                    if (branch.protection.required_pull_request_reviews) {
                                        dismissalRestrictions = {};
                                        if (branch.protection.required_pull_request_reviews.dismissal_restrictions) {
                                            users_1 = [];
                                            teams_1 = [];
                                            if (branch.protection.required_pull_request_reviews.dismissal_restrictions.users) {
                                                branch.protection.required_pull_request_reviews.dismissal_restrictions.users.forEach(function (user) {
                                                    users_1.push(user);
                                                });
                                            }
                                            if (branch.protection.required_pull_request_reviews.dismissal_restrictions.teams) {
                                                branch.protection.required_pull_request_reviews.dismissal_restrictions.teams.forEach(function (team) {
                                                    teams_1.push(team);
                                                });
                                            }
                                            dismissalRestrictions.users = users_1;
                                            dismissalRestrictions.teams = teams_1;
                                            requiredPrReviews.dismissal_restrictions = dismissalRestrictions;
                                        }
                                        if (branch.protection.required_pull_request_reviews.hasOwnProperty('dismiss_stale_reviews')) {
                                            requiredPrReviews.dismiss_stale_reviews = branch.protection.required_pull_request_reviews.dismiss_stale_reviews;
                                        }
                                        if (branch.protection.required_pull_request_reviews.hasOwnProperty('require_code_owner_reviews')) {
                                            requiredPrReviews.require_code_owner_reviews = branch.protection.required_pull_request_reviews.require_code_owner_reviews;
                                        }
                                        if (branch.protection.required_pull_request_reviews.hasOwnProperty('required_approving_review_count')) {
                                            requiredPrReviews.required_approving_review_count = branch.protection.required_pull_request_reviews.required_approving_review_count;
                                        }
                                    }
                                    restrictions = {};
                                    if (branch.protection.restrictions) {
                                        users_2 = [];
                                        if (branch.protection.restrictions.users) {
                                            branch.protection.restrictions.users.forEach(function (user) {
                                                users_2.push(user);
                                            });
                                        }
                                        restrictions.users = users_2;
                                        teams_2 = [];
                                        if (branch.protection.restrictions.teams) {
                                            branch.protection.restrictions.teams.forEach(function (team) {
                                                teams_2.push(team);
                                            });
                                        }
                                        restrictions.teams = teams_2;
                                    }
                                    return [4 /*yield*/, octokit.repos.updateBranchProtection({
                                            owner: userOrgName,
                                            repo: createdRepo.data.name,
                                            branch: branch.name,
                                            required_status_checks: statusCheck,
                                            enforce_admins: branch.protection.enforce_admins,
                                            required_pull_request_reviews: requiredPrReviews,
                                            restrictions: restrictions
                                        })];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _p = 0, _q = file.branches;
                    _r.label = 41;
                case 41:
                    if (!(_p < _q.length)) return [3 /*break*/, 44];
                    branch = _q[_p];
                    return [5 /*yield**/, _loop_1(branch)];
                case 42:
                    _r.sent();
                    _r.label = 43;
                case 43:
                    _p++;
                    return [3 /*break*/, 41];
                case 44:
                    if (!(file.pages && file.pages.enabled === true)) return [3 /*break*/, 46];
                    source = {};
                    if (file.pages.branch && file.pages.path) {
                        source = {
                            branch: file.pages.branch,
                            path: file.pages.path
                        };
                    }
                    return [4 /*yield*/, octokit.repos.enablePagesSite({
                            owner: userOrgName,
                            repo: createdRepo.data.name,
                            source: source
                        })];
                case 45:
                    _r.sent();
                    _r.label = 46;
                case 46: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the team name from the team ID.
 *
 * @param octokit
 * @param teamName
 * @param orgName
 * @returns {Promise<number>}
 */
function _getTeamIdFromName(octokit, teamName, orgName) {
    return __awaiter(this, void 0, void 0, function () {
        var team;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.teams.getByName({
                        org: orgName,
                        team_slug: teamName
                    })];
                case 1:
                    team = (_a.sent()).data;
                    return [2 /*return*/, team.id];
            }
        });
    });
}
//# sourceMappingURL=tools.js.map