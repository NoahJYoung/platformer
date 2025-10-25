import { useEffect, useState } from "react";
import type { Player } from "../../../actors/player/player";
import { PlayerSnapshot } from "../../../utils/player-snapshot";

interface InventorySpriteProps {
  player: Player;
}

export const InventorySprite = ({ player }: InventorySpriteProps) => {
  const [snapshotUrl, setSnapshotUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const generateSnapshot = async () => {
      setIsLoading(true);
      try {
        const url = await PlayerSnapshot.createSnapshot(player);
        if (mounted) {
          setSnapshotUrl(url);
        }
      } catch (error) {
        console.error("Failed to generate snapshot:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    generateSnapshot();

    return () => {
      mounted = false;
    };
  }, [player, player.equipmentManager]); // Regenerate when equipment changes

  return (
    <div
      style={{
        width: "64px",
        height: "108px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "4px",
      }}
    >
      {isLoading ? (
        <div style={{ color: "#666", fontSize: "12px" }}>Loading...</div>
      ) : snapshotUrl ? (
        <img
          src={snapshotUrl}
          alt="Character"
          style={{
            imageRendering: "pixelated",
            maxWidth: "96px",
            maxHeight: "108px",
          }}
        />
      ) : (
        <div style={{ color: "#666", fontSize: "12px" }}>No preview</div>
      )}
    </div>
  );
};
