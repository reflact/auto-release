# auto-release action

This action creates an release with various options.
The schema will be v[major].[minor].[patch]

## Inputs

### `autogen_tag`

**Required** (Input: String) Set the change of the release. Accepted values: major, minor, patch, none. Each option exept 'none' will increase the version number at the given position. If the number reach 10 in patch and minor the number will be set to 0 and minor or major will be increased (example: v1.0.10 -> v1.1.0). 'none' will skip the autogeneration of a new version so that a individual version number can bei set.

### `github_token`

**Required** (Input: String) The generated github token at runtime of the action. Use ${{ secrets.GITHUB_TOKEN }}.

### `tag_name`

(Input: String) Individual tag of a release. Can be a new or existend tag and is used in combination with other options.

### `release_title`

(Input: String) Set the release title. Will be overwritten by option `generate_release_notes`.

### `release_body`

(Input: String) Set the release body. Will be overwritten by option `generate_release_notes`.

### `draft`

(Input: Boolean) Set the generated release to draft.

### `prerelease`

(Input: Boolean) Set the generated release to prerelease.

### `commit`

(Input: String) Individual commit message on creating a release

### `delete_existed_release`

(Input: Boolean) Indicates if the given release in tag_name should be deleted and recreated.

### `generate_release_notes`

(Input: Boolean) If the release notes shall be auto generated.


## Outputs

### `release_id`

(Output: String) The newly created release with schema v[major].[minor].[patch].

### `url`

(Output: String) URL to the newly created release.

### `upload_url`

(Output: String) Upload URL for assets to the newly created release.

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
      delete_existed_release:
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
          delete_existed_release: ${{ github.event.inputs.delete_existed_release }}
          generate_release_notes: ${{ github.event.inputs.generate_release_notes }}
```
