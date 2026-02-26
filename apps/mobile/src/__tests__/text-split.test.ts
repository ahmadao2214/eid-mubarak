import { splitGreeting } from "@/lib/text-split";

describe("splitGreeting", () => {
  test('splitGreeting("Eid Mubarak") returns ["EID", "MUBARAK"]', () => {
    expect(splitGreeting("Eid Mubarak")).toEqual(["EID", "MUBARAK"]);
  });

  test('splitGreeting("Eid ul-Fitr Mubarak") returns ["EID UL-FITR", "MUBARAK"]', () => {
    expect(splitGreeting("Eid ul-Fitr Mubarak")).toEqual([
      "EID UL-FITR",
      "MUBARAK",
    ]);
  });

  test('splitGreeting("Happy Eid") returns ["HAPPY", "EID"]', () => {
    expect(splitGreeting("Happy Eid")).toEqual(["HAPPY", "EID"]);
  });

  test('splitGreeting("Eid") returns ["EID"] (single word)', () => {
    expect(splitGreeting("Eid")).toEqual(["EID"]);
  });

  test('splitGreeting("") returns [""] (empty)', () => {
    expect(splitGreeting("")).toEqual([""]);
  });
});
