export const ENV_2_VARIABLE_ID = "XhHeMKBSPqa42soM";
export const ENV_3_VARIABLE_ID = "XhHeMKBSPqa42soN";

export const mockEnvVariablesResponse = [
    {
        type: "encrypted",
        value: "ENV_1_VALUE",
        target: ["production", "preview", "development"],
        configurationId: null,
        id: "XhHeMKBSPqa42soL",
        key: "ENV_1",
        createdAt: 1622428636135,
        updatedAt: 1622428636135,
        createdBy: "1234",
        updatedBy: null,
    },
    {
        type: "plain",
        value: "ENV_2_VALUE",
        target: ["production"],
        configurationId: null,
        id: ENV_2_VARIABLE_ID,
        key: "ENV_2",
        createdAt: 1622428636135,
        updatedAt: 1622428636135,
        createdBy: "1234",
        updatedBy: null,
    },
    {
        type: "encrypted",
        value: "ENV_3_VALUE",
        target: ["production"],
        configurationId: null,
        id: ENV_3_VARIABLE_ID,
        key: "ENV_3",
        createdAt: 1622428636135,
        updatedAt: 1622428636135,
        createdBy: "1234",
        updatedBy: null,
    },
];
