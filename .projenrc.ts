import { Node20GitHubActionTypescriptProject } from "dkershner6-projen-github-actions";

import { RunsUsing } from "projen-github-action-typescript";
import { Nvmrc } from "projen-nvm";

const MAJOR_VERSION = 3;

const project = new Node20GitHubActionTypescriptProject({
    majorVersion: MAJOR_VERSION,
    defaultReleaseBranch: "main",

    devDeps: [
        "dkershner6-projen-github-actions",
        "jest-mock",
        "projen-github-action-typescript",
        "projen-nvm",
    ],
    name: "reaction-action",
    description:
        "A GitHub Action that ensures certain environment variables are set in Vercel",

    actionMetadata: {
        name: "Vercel Set Environment Variables",
        description:
            "A GitHub Action that ensures certain environment variables are set in Vercel",
        inputs: {
            token: {
                required: true,
                description: "Vercel API Token",
            },
            teamId: {
                required: false,
                description:
                    "Vercel API Team ID - used to target a Team or Organization, default is personal",
            },
            projectName: {
                required: true,
                description: "The name of the project in Vercel",
            },
            envVariableKeys: {
                required: true,
                description:
                    "A comma delimited list of environment variable keys. This must be accompanied by a matching env variable and ones prefixed with TARGET_ and TYPE_. These match target and type in Vercel.",
            },
        },
        runs: {
            using: RunsUsing.NODE_20,
            main: "dist/index.js",
        },
        branding: {
            icon: "anchor",
            color: "gray-dark",
        },
    },

    deps: ["axios"],

    autoApproveOptions: {
        allowedUsernames: ["dkershner6"],
    },

    sampleCode: false,
    docgen: true,
});

new Nvmrc(project);

project.synth();
