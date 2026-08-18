import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "7px",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#d9a566",
            transform: "translateY(-1px)",
          }}
        >
          S
        </span>
      </div>
    ),
    { ...size }
  );
}
