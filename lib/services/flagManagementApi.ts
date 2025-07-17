import { flagList } from "../mocks/flag-management";

export async function fetchFlagList() {
  return new Promise<typeof flagList>((resolve) =>
    setTimeout(() => resolve(flagList), 500)
  );
} 