import { callVolumeData, callDurationData, callOutcomeData, callStats } from "../mocks/calls-analytics";

export async function fetchCallVolumeData() {
  return new Promise<typeof callVolumeData>((resolve) =>
    setTimeout(() => resolve(callVolumeData), 500)
  );
}

export async function fetchCallDurationData() {
  return new Promise<typeof callDurationData>((resolve) =>
    setTimeout(() => resolve(callDurationData), 500)
  );
}

export async function fetchCallOutcomeData() {
  return new Promise<typeof callOutcomeData>((resolve) =>
    setTimeout(() => resolve(callOutcomeData), 500)
  );
}

export async function fetchCallStats() {
  return new Promise<typeof callStats>((resolve) =>
    setTimeout(() => resolve(callStats), 500)
  );
} 