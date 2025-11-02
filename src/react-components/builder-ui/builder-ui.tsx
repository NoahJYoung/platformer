import React, { useState, useEffect } from "react";
import type { BuildingManager } from "../../building-manager/building-manager";
import type {
  BuildingMaterial,
  BuildingTileCategory,
} from "../../building-manager/building-tile-types";
import {
  BUILDING_TILES,
  getTilesByMaterial,
} from "../../building-manager/building-tile-catalog";

const getTileIcon = (category: BuildingTileCategory): string => {
  switch (category) {
    case "foundation":
      return "🧱";
    case "floor":
      return "⬜";
    case "wall":
      return "🟫";
    case "roof":
      return "🔺";
    case "door":
      return "🚪";
    case "window":
      return "🪟";
    case "beam":
      return "|";
    case "corner":
      return "📐";
    default:
      return "📦";
  }
};

interface BuildingUIProps {
  buildingManager: BuildingManager | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BuildingUI: React.FC<BuildingUIProps> = ({
  buildingManager,
  isOpen,
  onClose,
}) => {
  const [selectedMaterial, setSelectedMaterial] =
    useState<BuildingMaterial>("wood");
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  const materials: BuildingMaterial[] = ["wood", "stone"];

  useEffect(() => {
    if (buildingManager && selectedTileId) {
      buildingManager.selectTile(selectedTileId);
    }
  }, [selectedTileId, buildingManager]);

  if (!isOpen || !buildingManager) return null;

  const tilesInCategory = getTilesByMaterial(selectedMaterial);

  const handleTileSelect = (tileId: string) => {
    setSelectedTileId(tileId);
    setIsRemoveMode(false);
  };

  const handleCategorySelect = (material: BuildingMaterial) => {
    setSelectedMaterial(material);
    // Auto-select first tile in category
    const tiles = getTilesByMaterial(material);
    if (tiles.length > 0) {
      setSelectedTileId(tiles[0].id);
    }
  };

  const toggleRemoveMode = () => {
    setIsRemoveMode(!isRemoveMode);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "rgba(0, 0, 0, 0.9)",
        borderTop: "2px solid #555",
        padding: "8px",
        zIndex: 1000,
        maxHeight: "15vh",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          color: "white",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px" }}>Build Mode</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={toggleRemoveMode}
            style={{
              padding: "6px 12px",
              background: isRemoveMode ? "#d32f2f" : "#555",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {isRemoveMode ? "🗑️ Remove" : "🔨 Build"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              background: "#555",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {materials.map((material) => (
          <button
            key={material}
            onClick={() => handleCategorySelect(material)}
            style={{
              padding: "8px 12px",
              background: selectedMaterial === material ? "#4caf50" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              textTransform: "capitalize",
              minWidth: "60px",
            }}
          >
            {material}
          </button>
        ))}
      </div>

      {/* Tile Selection Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
          gap: "6px",
          maxHeight: "200px",
          overflowY: "auto",
        }}
      >
        {tilesInCategory.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileSelect(tile.id)}
            style={{
              padding: "8px",
              background: selectedTileId === tile.id ? "#4caf50" : "#444",
              border:
                selectedTileId === tile.id
                  ? "2px solid #66bb6a"
                  : "1px solid #666",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              minHeight: "60px",
            }}
            title={tile.name}
          >
            {/* Tile Preview */}
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#222",
                border: "1px solid #666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              {getTileIcon(tile.category)}
            </div>

            {/* Tile Name */}
            <span
              style={{
                fontSize: "9px",
                color: "white",
                textAlign: "center",
                wordBreak: "break-word",
              }}
            >
              {tile.name.split(" ").slice(0, 2).join(" ")}
            </span>
          </button>
        ))}
      </div>

      {/* Info Text */}
      <div
        style={{
          marginTop: "8px",
          padding: "6px",
          background: "#222",
          borderRadius: "4px",
          fontSize: "11px",
          color: "#aaa",
          textAlign: "center",
        }}
      >
        {isRemoveMode
          ? "Tap tiles to remove them"
          : selectedTileId
          ? `Tap to place: ${BUILDING_TILES[selectedTileId]?.name}`
          : "Select a tile to place"}
      </div>
    </div>
  );
};
