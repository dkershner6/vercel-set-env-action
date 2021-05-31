import axios, { AxiosInstance } from "axios";
import { info } from "@actions/core";

type VercelEnvVariableType = "encrypted" | "plain";

const VALID_TYPES = ["encrypted", "plain"];

// eslint-disable-next-line no-shadow
enum VercelEnvVariableTarget {
  Production = "production",
  Preview = "preview",
  Development = "development",
}

const VALID_TARGETS: VercelEnvVariableTarget[] = [
  VercelEnvVariableTarget.Production,
  VercelEnvVariableTarget.Preview,
  VercelEnvVariableTarget.Development,
];

interface VercelEnvVariable {
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

export default class VercelEnvVariabler {
  private envVariableKeys = new Array<string>();
  private vercelClient: AxiosInstance;

  private vercelProjectId: string | undefined;
  private existingEnvVariables: Record<
    VercelEnvVariableTarget,
    Record<string, VercelEnvVariable>
  > = { production: {}, preview: {}, development: {} };

  constructor(
    private token: string,
    private projectName: string,
    envVariableKeysAsString: string,
    private teamId: string | undefined
  ) {
    const envVariableKeys = envVariableKeysAsString?.split(",");

    if (envVariableKeys?.length > 0) {
      this.envVariableKeys = envVariableKeys;
    }

    if (!this.token || !this.projectName || this.envVariableKeys.length === 0) {
      throw new Error("Missing required input(s).");
    }

    this.vercelClient = axios.create({
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      baseURL: "https://api.vercel.com/v1",
      params: {
        teamId: this.teamId,
      },
    });
  }

  public async populateExistingEnvVariables(): Promise<void> {
    const projectResponse = await this.vercelClient.get<{
      env: VercelEnvVariable[];
      id: string;
    }>(`/projects/${this.projectName}`);

    this.vercelProjectId = projectResponse?.data?.id;
    if (!this.vercelProjectId) {
      throw new Error(`Project ${this.projectName} not found`);
    }

    const env = projectResponse?.data?.env;
    if (env) {
      info(`Found ${env.length} existing env variables`);

      for (const existingEnvVariable of env) {
        for (const existingTarget of existingEnvVariable.target) {
          const preExistingVariablesForTarget =
            this.existingEnvVariables[existingTarget] ?? {};
          this.existingEnvVariables[existingTarget] = {
            ...preExistingVariablesForTarget,
            [existingEnvVariable.key]: existingEnvVariable,
          };
        }
      }
    }
  }

  public async processEnvVariables(): Promise<void> {
    for (const envVariableKey of this.envVariableKeys) {
      await this.processEnvVariable(envVariableKey);
    }
  }

  private async processEnvVariable(envVariableKey: string) {
    const { value, targets, type } = this.parseAndValidateEnvVariable(
      envVariableKey
    );

    const existingVariables = targets.reduce((result, target) => {
      const existingVariable = this.existingEnvVariables?.[target]?.[
        envVariableKey
      ];

      if (existingVariable) {
        result[target] = existingVariable;
      }

      return result;
    }, {} as Record<VercelEnvVariableTarget, VercelEnvVariable>);

    const existingTargets = Object.keys(existingVariables);
    if (existingTargets.length === 0) {
      info(`No existing variable found for ${envVariableKey}, creating.`);
      await this.createEnvVariable({
        key: envVariableKey,
        value,
        targets,
        type,
      });
    } else if (existingTargets.length !== targets.length) {
      const newTargets = targets.filter(
        (target) => !existingTargets.includes(target)
      );
      info(
        `Existing variable found for ${envVariableKey}, but with ${newTargets.join(
          ","
        )} as new targets.`
      );
      await this.createEnvVariable({
        key: envVariableKey,
        value,
        targets: newTargets,
        type,
      });
      if (type === "plain") {
        this.processPossibleEnvVariableUpdate({
          value,
          existingVariables,
        });
      }
    } else if (type === "plain") {
      info(
        `Existing variable found for ${envVariableKey}, comparing plain values.`
      );
      this.processPossibleEnvVariableUpdate({
        value,
        existingVariables,
      });
    } else {
      info(
        `Existing variable found for ${envVariableKey}, since it is encrypted, assuming it is equal.`
      );
    }
  }

  private parseAndValidateEnvVariable(
    envVariableKey: string
  ): {
    value: string;
    targets: VercelEnvVariableTarget[];
    type: VercelEnvVariableType;
  } {
    const value = process.env[envVariableKey];

    const targetString = process.env[`TARGET_${envVariableKey}`];
    const type = process.env[`TYPE_${envVariableKey}`] as VercelEnvVariableType;

    if (!value) {
      throw new Error(
        `Variable ${envVariableKey} is missing env variable: ${envVariableKey}`
      );
    }
    if (!targetString) {
      throw new Error(
        `Variable ${envVariableKey} is missing env variable: ${`TARGET_${envVariableKey}`}`
      );
    }
    if (!type) {
      throw new Error(
        `Variable ${envVariableKey} is missing env variable: ${`TYPE_${envVariableKey}`}`
      );
    }
    if (!VALID_TYPES.includes(type)) {
      throw new Error(
        `No valid type found for ${envVariableKey}, type given: ${type}, valid targets: ${VALID_TYPES.join(
          ","
        )}`
      );
    }

    const targets = targetString
      .split(",")
      .filter((target) =>
        VALID_TARGETS.includes(target as VercelEnvVariableTarget)
      ) as VercelEnvVariableTarget[];

    if (targets.length === 0) {
      throw new Error(
        `No valid targets found for ${envVariableKey}, targets given: ${targetString}, valid targets: ${VALID_TARGETS.join(
          ","
        )}`
      );
    }

    return { value, targets, type };
  }

  private async createEnvVariable({
    type,
    key,
    value,
    targets,
  }: {
    key: string;
    value: string;
    targets: VercelEnvVariableTarget[];
    type: VercelEnvVariableType;
  }) {
    const createResponse = await this.vercelClient.post(
      `/projects/${this.projectName}/env`,
      { type, key, value, target: targets }
    );

    if (!createResponse?.data) {
      info(
        `Variable ${key} with targets ${targets.join(",")} created successfully`
      );
    }
  }

  private async processPossibleEnvVariableUpdate({
    value,
    existingVariables,
  }: {
    value: string;
    existingVariables: Record<VercelEnvVariableTarget, VercelEnvVariable>;
  }) {
    const existingVariable = Object.values(existingVariables)[0]; // They are all actually the same
    if (existingVariable.type === "plain" && existingVariable.value !== value) {
      info(
        `Value for env variable ${existingVariable.key} has found to have changed, updating value`
      );
      await this.vercelClient.patch(
        `/projects/${this.projectName}/env/${existingVariable.id}`,
        { value }
      );
    } else {
      info(`No change found for ${existingVariable.key}, skipping...`);
    }
  }
}
