// Temporarily commented out due to Frame SDK version conflicts
// import {
//   FrameNotificationDetails,
//   type SendNotificationRequest,
//   sendNotificationResponseSchema,
// } from "@farcaster/frame-sdk";

// Fallback types to maintain compatibility
type FrameNotificationDetails = {
  url: string;
  token: string;
} | null;

type SendNotificationRequest = {
  notificationId: string;
  title: string;
  body: string;
  targetUrl: string;
  tokens: string[];
};
import { getUserNotificationDetails } from "@/lib/notification";

const appUrl = process.env.NEXT_PUBLIC_URL || "";

type SendFrameNotificationResult =
  | {
      state: "error";
      error: unknown;
    }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

export async function sendFrameNotification({
  fid,
  title,
  body,
  notificationDetails,
}: {
  fid: number;
  title: string;
  body: string;
  notificationDetails?: FrameNotificationDetails | null;
}): Promise<SendFrameNotificationResult> {
  if (!notificationDetails) {
    notificationDetails = await getUserNotificationDetails(fid);
  }
  if (!notificationDetails) {
    return { state: "no_token" };
  }

  const response = await fetch(notificationDetails.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId: crypto.randomUUID(),
      title,
      body,
      targetUrl: appUrl,
      tokens: [notificationDetails.token],
    } satisfies SendNotificationRequest),
  });

  const responseJson = await response.json();

  if (response.status === 200) {
    // Simplified response handling without schema validation
    // TODO: Restore proper validation when Frame SDK version conflicts are resolved
    if (responseJson?.result?.rateLimitedTokens?.length) {
      return { state: "rate_limit" };
    }

    return { state: "success" };
  }

  return { state: "error", error: responseJson };
}
