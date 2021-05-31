import { AxiosInstance, AxiosResponse } from "axios";

export type VercelEnvVariableType = "encrypted" | "plain";

// eslint-disable-next-line no-shadow
export enum VercelEnvVariableTarget {
    Production = "production",
    Preview = "preview",
    Development = "development",
}

export interface VercelEnvVariable {
    type: VercelEnvVariableType;
    value: string;
    target: VercelEnvVariableTarget[];
    configurationId?: string;
    id: string;
    key: string;
    createdAt: number;
    updatedAt: number;
    createdBy: string;
    updatedBy: string;
}

export const listEnvVariables = async (
    vercelClient: AxiosInstance,
    projectName: string
): Promise<
    AxiosResponse<{
        envs: VercelEnvVariable[];
    }>
> => {
    return await vercelClient.get<{
        envs: VercelEnvVariable[];
    }>(`/v8/projects/${projectName}/env`, {
        params: {
            decrypt: "true",
        },
    });
};

export const postEnvVariable = async (
    vercelClient: AxiosInstance,
    projectName: string,
    envVariable: Partial<VercelEnvVariable>
): Promise<AxiosResponse<{ env: VercelEnvVariable }>> => {
    return await vercelClient.post(`/projects/${projectName}/env`, envVariable);
};

export const patchEnvVariable = async (
    vercelClient: AxiosInstance,
    projectName: string,
    envVariableId: string,
    envVariable: Partial<VercelEnvVariable>
): Promise<AxiosResponse<{ env: VercelEnvVariable }>> => {
    return await vercelClient.patch(
        `/projects/${projectName}/env/${envVariableId}`,
        envVariable
    );
};
