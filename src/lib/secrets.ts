// private environment secrets for backend

const requiredEnvs: string[] = [
  "NEXTAUTH_SECRET",
  "PROVIDER_CLIENT_ID",
  "PROVIDER_CLIENT_SECRET",
  "PROVIDER_ISSUER",
];
const missingEnvs = requiredEnvs.filter((name) => !process.env[name]);
if (missingEnvs.length !== 0) {
  throw new Error(
    `Required environment secrets are not provided: ${missingEnvs.join(
      ", "
    )}. Please check README file.`
  );
}

export const logLevel = process.env.LOG_LEVEL || "info";
export const providerClientId = process.env.PROVIDER_CLIENT_ID!;
export const providerClientSecret = process.env.PROVIDER_CLIENT_SECRET!;
export const providerIssuer = process.env.PROVIDER_ISSUER!;

// Optional environment secrets
export const apiGatewayUrl = process.env.API_GATEWAY_URL!
export const projectId = process.env.PROJECT_ID!
export const tokenEndpoint = process.env.TOKEN_ENDPOINT!
export const keyId = process.env.KEY_ID!
export const privateKey = process.env.PRIVATE_KEY!
export const publicKey = process.env.PUBLIC_KEY!
export const passphrase = process.env.PASSPHRASE!
export const tokenId = process.env.TOKEN_ID!

