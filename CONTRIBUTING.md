# Contributing

Welcome, and thanks for showing an interest in contributing 💜

This module is an `npm` [workspace]. You will need:

- Node latest LTS
- `npm`

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command            | Action                                                                          |
| ------------------ | ------------------------------------------------------------------------------- |
| `npm install`      | Installs dependencies across the workspace                                      |
| `npm test`         | Runs unit tests across the workspace                                            |
| `npm run lint`     | Does a check with [ESLint](./.eslintrc) across the workspace                    |
| `npm run types`    | Generates type definitions from JSDoc and does a typecheck across the workspace |

To only run the command for an individual package, either:

- Run the command from the package folder
- Append ` --workspace=<package name>` to the command

## 🚚 Continuous deployment

This repo [uses conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) to automate releases with [Semantic Release][semantic-release].

Some example commits and their release type:

| Commit message                                                                                         | Release type                                                                                                                          |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `fix: update a non-development dependency`                                                             | Patch. Bugfix release, updates for runtime dependencies.                                                                              |
| `feat: added a new option Foo`                                                                         | Minor. New feature release.                                                                                                           |
| `refactor: removed a deprecated option Bar`<br><br>`BREAKING CHANGE: The Bar option has been removed.` | Major. Breaking release, like removing an option.<br /> (Note that the `BREAKING CHANGE: ` token must be in the footer of the commit) |

[workspace]: https://docs.npmjs.com/cli/using-npm/workspaces
[semantic-release]: https://semantic-release.gitbook.io/semantic-release/

### Working with next releases

When making larger changes that needs thorough testing or modules widely used, you can create a `next` release. Here is how:
1. Create a branch `next` if one does not exist
2. Make changes (or push whatever changes you have on a different branch onto `next`)
3. When you are done, commit your changes with semantic-release in mind
4. The workflows will run and publish a new version on the format: `major.minor.patch-next.<next version>
Where `next version` is incremented each time you push a feat, fix or patch to the branch.

### GitHub Actions
GitHub Actions workflows:

- [Build and test pull requests](./.github/workflows/test.yml)
- [Build and release changes on `main`](./.github/workflows/release.yml)

You'll find the workflow logs and results in the Actions tab.
