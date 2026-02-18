import { RN_FONT_MAP } from "@/lib/font-map";

describe("RN_FONT_MAP", () => {
  it("maps psychedelic to monospace", () => {
    expect(RN_FONT_MAP.psychedelic).toEqual({ fontFamily: "monospace" });
  });

  it("maps classic to serif", () => {
    expect(RN_FONT_MAP.classic).toEqual({ fontFamily: "serif" });
  });

  it("maps bollywood to serif italic", () => {
    expect(RN_FONT_MAP.bollywood).toEqual({
      fontFamily: "serif",
      fontStyle: "italic",
    });
  });

  it("maps clean to empty object (system default)", () => {
    expect(RN_FONT_MAP.clean).toEqual({});
  });

  it("maps trucker-art to monospace", () => {
    expect(RN_FONT_MAP["trucker-art"]).toEqual({ fontFamily: "monospace" });
  });
});
