import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "ANTILIX - Premium Web3 Gaming Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation
export default async function Image() {
  // Font
  const interSemiBold = fetch(
    new URL(
      "https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap",
      import.meta.url
    )
  ).then((res) => res.arrayBuffer());

  const fontData = await interSemiBold;

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(to bottom, #111111, #1a1a1a)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          {/* Diamond logo */}
          <div
            style={{
              width: 120,
              height: 120,
              background: "#D4AF37",
              transform: "rotate(45deg)",
              marginRight: 40,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                background: "#ffffff",
                border: "1px solid #D4AF37",
                top: 20,
                left: 20,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <div style={{ fontSize: 80, fontWeight: "bold", color: "#D4AF37" }}>
              ANTI
            </div>
            <div style={{ fontSize: 80, fontWeight: "bold" }}>LIX</div>
          </div>
        </div>
        <div style={{ fontSize: 40, color: "#aaaaaa", marginTop: 20 }}>
          Premium Web3 Gaming Platform
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported size metadata
      // when generating the image
      ...size,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
