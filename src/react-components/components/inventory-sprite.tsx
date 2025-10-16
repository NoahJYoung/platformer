import type { Player } from "../../actors/player/player";

interface InventorySpriteProps {
  player: Player;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const InventorySprite = ({ canvasRef }: InventorySpriteProps) => {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "2rem",
        width: "72px",
        height: "72px",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: "pixelated",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
