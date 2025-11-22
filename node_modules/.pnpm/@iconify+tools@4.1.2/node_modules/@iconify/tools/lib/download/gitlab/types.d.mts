/**
 * API options
 */
interface GitLabAPIOptions {
    uri?: string;
    token: string;
    project: string;
    branch: string;
}
/**
 * Default base URI for GitLab API
 */
declare const defaultGitLabBaseURI = "https://gitlab.com/api/v4/projects";

export { type GitLabAPIOptions, defaultGitLabBaseURI };
