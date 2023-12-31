import { getInput, setFailed, info } from "@actions/core";
import VercelEnvVariabler from "./VercelEnvVariabler";

async function run(): Promise<void> {
    try {
        const token: string = getInput("token", { required: true });
        const projectName: string = getInput("projectName", { required: true });
        const envVariableKeys: string = getInput("envVariableKeys", {
            required: true,
        });

        const teamId: string = getInput("teamId");

        const envVariabler = new VercelEnvVariabler(
            token,
            projectName,
            envVariableKeys,
            teamId,
        );

        await envVariabler.populateExistingEnvVariables();
        await envVariabler.processEnvVariables();
        info("Vercel env variables completed successfully");
    } catch (error) {
        setFailed((error as Error)?.message);
    }
}

void run();
