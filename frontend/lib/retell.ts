import { RetellWebClient } from "retell-client-js-sdk";

export const retellClient = new RetellWebClient();

export type OnCallStarted = () => void;
export type OnCallEnded = () => void;
export type OnAgentStartTalking = () => void;
export type OnAgentStopTalking = () => void;

// startCall:
// 1. Calls Retell API to create a web call and get a one-time access token
// 2. Passes that token to the SDK to open the audio connection
export async function startCall(agentId: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_RETELL_API_KEY!;

  const response = await fetch("https://api.retellai.com/v2/create-web-call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      agent_id: agentId,
      retell_llm_dynamic_variables: {
        current_date: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create web call: ${response.statusText}`);
  }

  const { access_token, call_id } = await response.json();
  await retellClient.startCall({ accessToken: access_token });
  return call_id as string;
}

export function endCall(): void {
  retellClient.stopCall();
}
