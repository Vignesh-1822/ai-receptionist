function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Make sure it is set in your .env.local file.`
    );
  }
  return value;
}

export const env = {
  retellApiKey: requireEnv("NEXT_PUBLIC_RETELL_API_KEY"),
  retellAgentId: requireEnv("NEXT_PUBLIC_RETELL_AGENT_ID"),
  apiUrl: requireEnv("NEXT_PUBLIC_API_URL"),
} as const;
