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
        uses: dkershner6/vercel-set-env-action@v1
        with:
          token: ${{ secrets.VERCEL_API_TOKEN }}
          teamId: ${{ secrets.VERCEL_TEAM_ID }} # optional, without will use personal
          projectName: vercel-env-setter # project name in Vercel
          envVariableKeys: ENV_VAR1,ENV_VAR2
        env:
          ENV_VAR1: myEnvVar1
          TARGET_ENV_VAR1: production # comma delimited, one of [production, preview, development]
          TYPE_ENV_VAR1: encrypted # one of [plain, encrypted]
          ENV_VAR2: envVar2Value
          TARGET_ENV_VAR2: preview,development
          TYPE_ENV_VAR2: plain
```
