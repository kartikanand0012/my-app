import { checkpoints } from "../mocks/checkpoint-validator";

export async function fetchCheckpoints() {
  return new Promise<typeof checkpoints>((resolve) =>
    setTimeout(() => resolve(checkpoints), 500)
  );
} 