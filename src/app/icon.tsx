import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Diamond shape with CSS */}
        <div
          style={{
            width: "24px",
            height: "24px",
            background: "#D4AF37",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported size metadata
      // when generating the image
      ...size,
    }
  );
}
