import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #2c1810 0%, #4a2c24 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 148,
            height: 148,
            borderRadius: "50%",
            border: "2px solid rgba(217,165,102,0.55)",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              background: "rgba(217,165,102,0.75)",
              transform: "rotate(45deg)",
              marginBottom: 10,
            }}
          />
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 78,
              fontWeight: 700,
              color: "#d9a566",
              lineHeight: 1,
            }}
          >
            S
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
