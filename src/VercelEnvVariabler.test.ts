import { mocked } from "ts-jest/dist/utils/testing";
import VercelEnvVariabler, { VALID_TARGETS } from "./VercelEnvVariabler";
import { listEnvVariables, patchEnvVariable, postEnvVariable } from "./vercel";
import { AxiosResponse } from "axios";
import {
    ENV_2_VARIABLE_ID,
    ENV_3_VARIABLE_ID,
    mockEnvVariablesResponse,
} from "./envVariableFixtures";

jest.mock("./vercel.ts", () => {
    const actualModule = jest.requireActual("./vercel.ts");
    return {
        ...jest.genMockFromModule<typeof actualModule>("./vercel.ts"),
        VercelEnvVariableTarget: actualModule.VercelEnvVariableTarget,
    };
});

describe("VercelEnvVariabler", () => {
    const newEnv2Value = "NEW_ENV_2_VALUE";
    const newEnv3Value = "NEW_ENV_3_VALUE";
    const newEnv4Value = "NEW_ENV_4_VALUE";
    const newEnv5Value = "NEW_ENV_5_VALUE";
    beforeAll(() => {
        process.env.ENV_1 = "ENV_1_VALUE";
        process.env.TARGET_ENV_1 = "production,preview,development";
        process.env.TYPE_ENV_1 = "encrypted";

        process.env.ENV_2 = newEnv2Value;
        process.env.TARGET_ENV_2 = "production,preview,development";
        process.env.TYPE_ENV_2 = "encrypted";

        process.env.ENV_3 = newEnv3Value;
        process.env.TARGET_ENV_3 = "production";
        process.env.TYPE_ENV_3 = "encrypted";

        process.env.ENV_4 = newEnv4Value;
        process.env.TARGET_ENV_4 = "production,preview,development";
        process.env.TYPE_ENV_4 = "plain";

        process.env.ENV_5 = newEnv5Value;
        process.env.TARGET_ENV_5 = "preview";
        process.env.TYPE_ENV_5 = "plain";
        process.env.GIT_BRANCH_ENV_5 = "feature/foo";

        mocked(listEnvVariables).mockResolvedValue({
            data: { envs: mockEnvVariablesResponse },
        } as AxiosResponse);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const testToken = "1234";
    const testProjectName = "test-vercel-project";
    const testAllEnvKeys = "ENV_1,ENV_2,ENV_3,ENV_4";
    const testTeamId = "team_1234";

    it("Should build an instance of the class", () => {
        const variabler = new VercelEnvVariabler(
            testToken,
            testProjectName,
            testAllEnvKeys,
            testTeamId
        );

        expect(variabler).toBeInstanceOf(VercelEnvVariabler);
    });

    it("Should call for env variables", async () => {
        const variabler = new VercelEnvVariabler(
            testToken,
            testProjectName,
            testAllEnvKeys,
            testTeamId
        );

        await variabler.populateExistingEnvVariables();

        expect(mocked(listEnvVariables)).toHaveBeenCalledTimes(1);
        expect(mocked(listEnvVariables)).toHaveBeenCalledWith(
            expect.anything(),
            testProjectName
        );
    });

    it("Should determine no changes for ENV_1", async () => {
        const variabler = new VercelEnvVariabler(
            testToken,
            testProjectName,
            "ENV_1",
            testTeamId
        );

        await variabler.populateExistingEnvVariables();
        await variabler.processEnvVariables();

        expect(mocked(postEnvVariable)).not.toHaveBeenCalled();
        expect(mocked(patchEnvVariable)).not.toHaveBeenCalled();
    });

    it("Should change everything for ENV_2", async () => {
        const variabler = new VercelEnvVariabler(
            testToken,
            testProjectName,
            "ENV_2",
            testTeamId
        );

        await variabler.populateExistingEnvVariables();
        await variabler.processEnvVariables();

        expect(mocked(postEnvVariable)).not.toHaveBeenCalled();
        expect(mocked(patchEnvVariable)).toHaveBeenCalledWith(
            expect.anything(),
            testProjectName,
            ENV_2_VARIABLE_ID,
            expect.objectContaining({
                value: newEnv2Value,
                target: VALID_TARGETS,
                type: "encrypted",
            })
        );
    });

    it("Should only change value for ENV_3", async () => {
        const variabler = new VercelEnvVariabler(
            testToken,
            testProjectName,
            "ENV_3",
            testTeamId
        );

        await variabler.populateExistingEnvVariables();
        await variabler.processEnvVariables();

        expect(mocked(postEnvVariable)).not.toHaveBeenCalled();
        expect(mocked(patchEnvVariable)).toHaveBeenCalledWith(
            expect.anything(),
            testProjectName,
            ENV_3_VARIABLE_ID,
            expect.objectContaining({
                value: newEnv3Value,
                target: ["production"],
                type: "encrypted",
            })
        );
    });

    it("Should create ENV_4", async () => {
        const variabler = new VercelEnvVariabler(
            testToken,
            testProjectName,
            "ENV_4",
            testTeamId
        );

        await variabler.populateExistingEnvVariables();
        await variabler.processEnvVariables();

        expect(mocked(postEnvVariable)).toHaveBeenCalledWith(
            expect.anything(),
            testProjectName,
            expect.objectContaining({
                value: newEnv4Value,
                target: VALID_TARGETS,
                type: "plain",
            })
        );
        expect(mocked(patchEnvVariable)).not.toHaveBeenCalled();
    });

    it("Should create ENV_5", async () => {
        const variabler = new VercelEnvVariabler(
            testToken,
            testProjectName,
            "ENV_5",
            testTeamId
        );

        await variabler.populateExistingEnvVariables();
        await variabler.processEnvVariables();

        expect(mocked(postEnvVariable)).toHaveBeenCalledWith(
            expect.anything(),
            testProjectName,
            expect.objectContaining({
                value: newEnv5Value,
                target: ["preview"],
                type: "plain",
                gitBranch: "feature/foo",
            })
        );
        expect(mocked(patchEnvVariable)).not.toHaveBeenCalled();
    });

    it("Should make all the changes needed when all env variables present", async () => {
        const variabler = new VercelEnvVariabler(
            testToken,
            testProjectName,
            testAllEnvKeys,
            testTeamId
        );

        await variabler.populateExistingEnvVariables();
        await variabler.processEnvVariables();

        expect(mocked(postEnvVariable)).toHaveBeenCalledTimes(1);
        expect(mocked(patchEnvVariable)).toHaveBeenCalledTimes(2);
    });
});
