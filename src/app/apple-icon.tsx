import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 180,
  height: 180,
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
          borderRadius: "22px", // Slight rounded corners for Apple icons
        }}
      >
        {/* Diamond shape with CSS */}
        <div
          style={{
            width: "120px",
            height: "120px",
            background: "#D4AF37",
            transform: "rotate(45deg)",
            position: "relative",
          }}
        >
          {/* Inner diamond for design detail */}
          <div
            style={{
              position: "absolute",
              width: "80px",
              height: "80px",
              background: "#ffffff",
              border: "1px solid #D4AF37",
              top: "20px",
              left: "20px",
            }}
          />
        </div>
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
