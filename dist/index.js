import * as core from '@actions/core';
import * as github from '@actions/github';
try {
    const commit = core.getInput('commit') || github.context.sha;
    const tag = core.getInput('autogen_tag', { required: true });
    const tag_name = core.getInput('tag_name');
    let releaseName = core.getInput('release_title') || tag;
    let releaseBody = core.getInput('release_body');
    const generateReleaseNotes = core.getBooleanInput('generate_release_notes');
    const draft = core.getBooleanInput('draft');
    const prerelease = core.getBooleanInput('prerelease');
    const secret = core.getInput('github_token');
    const delete_and_replace_release = core.getBooleanInput('delete_existed_release');
    const token = github.getOctokit(secret);
    let release_exist = false;
    let new_tag_name = '';
    let current_release = '';
    if (tag === 'major' || tag === 'minor' || tag === 'patch') {
        await token.rest.repos.getLatestRelease({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo
        }).then((latest_release) => {
            current_release = latest_release.data.tag_name;
            const latest_tag_without_v = current_release.slice(1);
            const latest_tag_split = latest_tag_without_v.split('.');
            let major = parseInt(latest_tag_split[0]);
            let minor = parseInt(latest_tag_split[1]);
            let patch = parseInt(latest_tag_split[2]);
            if (tag === 'major') {
                major++;
                minor = 0;
                patch = 0;
            }
            else if (tag === 'minor') {
                if (minor === 10) {
                    major++;
                    minor = 0;
                    patch = 0;
                }
                else {
                    minor++;
                    patch = 0;
                }
            }
            else if (tag === 'patch') {
                if (patch === 10) {
                    minor++;
                    patch = 0;
                }
                else {
                    patch++;
                }
            }
            new_tag_name = `${major}.${minor}.${patch}`;
            core.info(`New tag_name: ${new_tag_name}`);
        }, (error) => {
            core.info('No latest release found' + error);
            new_tag_name = 'v1.0.0';
        });
    }
    else {
        core.error('Invalid tag_name' + tag);
        throw new Error('Invalid tag_name' + tag);
    }
    if (new_tag_name === '') {
        await token.rest.repos.listReleases({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo
        }).then(async (release_list) => {
            for (let release of release_list.data) {
                if (release.tag_name === tag) {
                    if (delete_and_replace_release) {
                        await token.rest.repos.deleteRelease({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            release_id: release.id
                        });
                        core.info(`Release ${tag} deleted`);
                    }
                    else {
                        core.info(`Release ${tag} already existed`);
                        core.setOutput('release_id', release.id.toString());
                        core.setOutput('url', release.html_url);
                        core.setOutput('upload_url', release.upload_url);
                        release_exist = true;
                    }
                }
            }
        }, (error) => {
            core.info('No releases found' + error);
            new_tag_name = 'v1.0.0';
        });
    }
    if (generateReleaseNotes) {
        await token.rest.repos.generateReleaseNotes({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag_name: tag_name === '' ? new_tag_name : tag_name,
            previous_tag_name: current_release !== '' ? current_release : undefined
        }).then((release_notes) => {
            releaseName = release_notes.data.name;
            releaseBody = release_notes.data.body;
        }, (error) => {
            core.info('No release notes found' + error);
        });
    }
    if (!release_exist) {
        await token.rest.repos.createRelease({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag_name: tag_name === '' ? new_tag_name : tag_name,
            target_commitish: commit,
            name: releaseName,
            body: releaseBody,
            draft,
            prerelease
        }).then((release) => {
            core.setOutput('release_id', release.data.id.toString());
            core.setOutput('url', release.data.html_url);
            core.setOutput('upload_url', release.data.upload_url);
        }, (error) => {
            core.error('Failed to create release' + error);
            throw new Error('Failed to create release' + error);
        });
    }
}
catch (error) {
    core.setFailed(error.message);
}
//# sourceMappingURL=index.js.map