import { validateMeetings } from "@/lib/validate";
import type { Meeting } from "@/types/meeting";
import { launchReadinessReview } from "./launch-readiness-review";
import { northgateDiscoveryCall } from "./northgate-discovery-call";
import { onboardingResearchInterview } from "./onboarding-research-interview";
import { productStandup } from "./product-standup";

// Seed data only. There is no database; capture and recording, calendar
// sync, and CRM sync are intentionally out of scope, so these meetings stand
// in for what a real recorder would have produced.
export const meetings: Meeting[] = [
  productStandup,
  northgateDiscoveryCall,
  onboardingResearchInterview,
  launchReadinessReview,
];

validateMeetings(meetings);
