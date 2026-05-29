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
          background:
            "radial-gradient(circle at 50% 38%, rgba(59,130,246,0.35), transparent 60%), #000",
          borderRadius: 40,
        }}
      >
        <svg
          width={110}
          height={110}
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.4 5L9 17.4h5.3l-1.1 9.6 9.4-12.4h-5.3l1.1-9.6z"
            fill="#3B82F6"
            stroke="#60A5FA"
            strokeWidth={0.6}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
