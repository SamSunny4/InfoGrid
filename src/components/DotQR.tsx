"use client";

import { useMemo } from "react";
import QRCode from "qrcode";

interface DotQRProps {
  value: string;
  size?: number;
  dotColor?: string;
  bgColor?: string;
  className?: string;
}

/**
 * Renders a QR code as circular dots in SVG.
 * Each module (dark cell) becomes a filled circle, giving a modern dotted look.
 */
export default function DotQR({
  value,
  size = 90,
  dotColor = "#000000",
  bgColor = "#ffffff",
  className = "",
}: DotQRProps) {
  const cells = useMemo<boolean[][] | null>(() => {
    try {
      const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
      const modules = qr.modules;
      const grid: boolean[][] = [];
      for (let r = 0; r < modules.size; r++) {
        const row: boolean[] = [];
        for (let c = 0; c < modules.size; c++) {
          row.push(modules.data[r * modules.size + c] === 1);
        }
        grid.push(row);
      }
      return grid;
    } catch {
      return null;
    }
  }, [value]);

  if (!cells) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, background: bgColor, flexShrink: 0 }}
      />
    );
  }

  const count = cells.length;
  const cellSize = size / count;
  const r = cellSize * 0.42; // dot radius — slightly smaller than half-cell for spacing

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0, background: bgColor }}
    >
      {cells.map((row, ri) =>
        row.map((dark, ci) =>
          dark ? (
            <circle
              key={`${ri}-${ci}`}
              cx={(ci + 0.5) * cellSize}
              cy={(ri + 0.5) * cellSize}
              r={r}
              fill={dotColor}
            />
          ) : null
        )
      )}
    </svg>
  );
}
