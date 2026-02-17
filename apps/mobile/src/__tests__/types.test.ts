import type {
  MemeTemplate,
  CompositionProps,
  Project,
  RenderJob,
  Asset,
  CelebrityHead,
  PresetId,
} from "../types";

describe("Type contracts", () => {
  it("MemeTemplate has all required fields", () => {
    const template: MemeTemplate = {
      id: "zohran-classic",
      name: "Zohran Classic",
      description: "The OG politician greeting card energy",
      thumbnail: "zohran-thumb.jpg",
      duration: 10,
      fps: 30,
      width: 1080,
      height: 1920,
      layers: {
        background: {
          type: "video",
          source: "mountain-road.mp4",
          animation: "slow-zoom",
        },
        hueOverlay: {
          enabled: true,
          defaultColor: "#FFD700",
          allowedColors: ["#FFD700", "#FF69B4", "#00C853", "#2196F3"],
          opacity: 0.3,
          animation: "pulse",
        },
        decorativeElements: [
          {
            type: "lottie",
            source: "rose-heart.json",
            position: { x: 50, y: 30 },
            scale: 1.2,
            enterAtFrame: 0,
            animation: "loop",
          },
        ],
        headSlot: {
          position: { x: 50, y: 45 },
          scale: 0.4,
          enterAtFrame: 15,
          animation: "zoom-pulse",
          animationConfig: { pulseSpeed: 0.8 },
          flowerReveal: { enabled: true, type: "rose" },
        },
        textSlots: [
          {
            id: "main",
            defaultText: "Eid Mubarak!",
            editable: true,
            position: { x: 50, y: 75 },
            style: {
              fontFamily: "psychedelic",
              fontSize: 64,
              color: "#FFFFFF",
              stroke: "#000000",
            },
            animation: "rise-up",
            enterAtFrame: 45,
          },
        ],
      },
      audio: { defaultTrack: "nasheed-1", volume: 0.8 },
      configurableSlots: [
        "hueColor",
        "headImage",
        "textContent",
        "fontStyle",
      ],
    };
    expect(template.id).toBe("zohran-classic");
    expect(template.layers.headSlot.animation).toBe("zoom-pulse");
    expect(template.width).toBe(1080);
    expect(template.height).toBe(1920);
  });

  it("CompositionProps represents a fully configured card", () => {
    const props: CompositionProps = {
      width: 1080,
      height: 1920,
      fps: 30,
      durationInFrames: 300,
      background: { type: "video", source: "bg.mp4", animation: "slow-zoom" },
      hue: {
        enabled: true,
        color: "#FFD700",
        opacity: 0.3,
        animation: "pulse",
      },
      head: {
        imageUrl: "https://s3.example.com/head.png",
        position: { x: 50, y: 45 },
        scale: 0.4,
        enterAtFrame: 15,
        animation: "zoom-pulse",
      },
      decorativeElements: [],
      textSlots: [
        {
          id: "main",
          text: "Eid Mubarak!",
          position: { x: 50, y: 75 },
          fontFamily: "psychedelic",
          fontSize: 64,
          color: "#FFFFFF",
          animation: "rise-up",
          enterAtFrame: 45,
        },
      ],
      audio: { trackUrl: "nasheed.mp3", volume: 0.8 },
    };
    expect(props.durationInFrames).toBe(300);
    expect(props.head.animation).toBe("zoom-pulse");
  });

  it("RenderJob tracks render progress", () => {
    const job: RenderJob = {
      id: "render-123",
      projectId: "proj-456",
      status: "rendering",
      progress: 45,
    };
    expect(job.status).toBe("rendering");
    expect(job.progress).toBe(45);
    expect(job.outputUrl).toBeUndefined();
  });

  it("PresetId covers all presets", () => {
    const presets: PresetId[] = [
      "zohran-classic",
      "trucker-art",
      "celebrity-greeting",
      "six-head-spiral",
      "custom",
    ];
    expect(presets).toHaveLength(5);
  });
});
