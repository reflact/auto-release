# auto-release action

This action creates a release with various options.
The schema will be v[major].[minor].[patch]

Features:
- Create a release according the given input of major, minor or patch
- Create a release according a individual input (schema: vX.X.X)
- If no release is published jet, it will create the first release with tag v1.0.0
- Delete a release and recreate it with new assets.
- Generate release notes (title and body) for a new release (will add contributions at the end)

## Inputs

### `autogen_tag`

**Required** (Input: String) Set the new version tag. Accepted values: major, minor, patch, none. Each option except 'none' will increase the version number at the given position. If the number reaches 10 in patch or minor the number will be set to 0 and minor or major will be increased (example: v1.0.10 -> v1.1.0). 'none' will skip the autogeneration of a new version so that a individual version number can bei set.

### `github_token`

**Required** (Input: String) The generated github token at runtime of the action. Use ${{ secrets.GITHUB_TOKEN }}.

### `tag_name`

(Input: String) Individual tag of a release. Can be a new or existend tag and can be used in combination with other options.

### `release_title`

(Input: String) Set the release title. Will be overwritten by option `generate_release_notes`.

### `release_body`

(Input: String) Set the release body. Will be overwritten by option `generate_release_notes`.

### `draft`

(Input: Boolean) Set the generated release as draft.

### `prerelease`

(Input: Boolean) Set the generated release as prerelease.

### `commit`

(Input: String) Individual commit message on creating a release

### `delete_existing_release`

(Input: Boolean) Indicates if the given release in tag_name should be deleted and recreated.

### `generate_release_notes`

(Input: Boolean) Auto-generate release notes.


## Outputs

### `release_tag`

(Output: String) The new release tag with schema v[major].[minor].[patch].

### `url`

(Output: String) URL to the new release tag.

### `upload_url`

(Output: String) Upload URL for assets to the new release tag.

## Example usage

```yaml
name: Workflow-to-create-a-release

on:
  workflow_dispatch:
    inputs:
      tag:
        description: 'Tag to release'
        required: true
        default: 'none'
        type: choice
        options:
          - 'none'
          - 'patch'
          - 'minor'
          - 'major'
      tag_name:
        description: 'Tag name'
        type: string
      release_title:
        description: 'Release title'
        type: string
      release_body:
        description: 'Release body'
        type: string
      commit:
        description: 'Commit for the release'
        type: string
      draft:
        description: 'Create a draft release'
        type: boolean
        default: false
      prerelease:
        description: 'Create a prerelease'
        type: boolean
        default: false
      delete_existing_release:
        description: 'Delete release'
        type: boolean
        default: false
      generate_release_notes:
        description: 'Generate release notes'
        type: boolean
        default: false

  release:
    needs: load_repo
    runs-on: ubuntu-latest
    steps:
      - uses: reflact/auto-release@v1
        with:
          autogen_tag: ${{ github.event.inputs.tag }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          tag_name: ${{ github.event.inputs.tag_name }}
          release_title: ${{ github.event.inputs.release_title }}
          release_body: ${{ github.event.inputs.release_body }}
          draft: ${{ github.event.inputs.draft }}
          prerelease: ${{ github.event.inputs.prerelease }}
          commit: ${{ github.event.inputs.commit }}
          delete_existing_release: ${{ github.event.inputs.delete_existing_release }}
          generate_release_notes: ${{ github.event.inputs.generate_release_notes }}
```
