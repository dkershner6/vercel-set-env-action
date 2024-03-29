# Vercel Set Env Action

This GitHub Action sets Environment Variables inside Vercel based on inputs.

## Usage

All keys in `envVariableKeys` must be matched by all 3: The key, and the key prefixed with `TARGET_` and `TYPE_`.

```yaml
jobs:
  set-env-vars:
    runs-on: ubuntu-latest
    steps:
      - name: Set Env Vars on Vercel Project
        uses: dkershner6/vercel-set-env-action@v3
        with:
          token: ${{ secrets.VERCEL_API_TOKEN }}
          teamId: ${{ secrets.VERCEL_TEAM_ID }} # optional, without will use personal
          projectName: vercel-env-setter # project name in Vercel
          envVariableKeys: ENV_VAR1,ENV_VAR2,ENV_VAR3
        env:
          ENV_VAR1: myEnvVar1
          TARGET_ENV_VAR1: production # comma delimited, one of [production, preview, development]
          TYPE_ENV_VAR1: encrypted # one of [plain, encrypted]
          ENV_VAR2: envVar2Value
          TARGET_ENV_VAR2: preview,development
          TYPE_ENV_VAR2: plain
          ENV_VAR3: envVar3Value
          TARGET_ENV_VAR3: preview
          TYPE_ENV_VAR3: plain
          GIT_BRANCH_ENV_VAR3: feature/foo
```

## Contributing

All contributions are welcome, please open an issue or pull request.

To use this repository:
1. `npm i -g pnpm` (if don't have pnpm installed)
2. `pnpm i`
3. `npx projen` (this will ensure everything is setup correctly, and you can run this command at any time)
4. Good to make your changes!
5. You can run `npx projen build` at any time to build the project.