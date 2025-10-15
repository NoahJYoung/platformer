import React from "react";
import type { Player } from "../actors/player/player";
import type { EquipmentItem, InventoryItem } from "../actors/character/types";
import { EquipmentPanel } from "./components/equipment-panel";
import { InventoryPanel } from "./components/inventory-panel";
import { StatsPanel } from "./components/stats-panel";

interface CharacterMenuProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterMenu: React.FC<CharacterMenuProps> = ({
  player,
  isOpen,
  onClose,
}) => {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  if (!isOpen) return null;

  const renderItemIcon = (item: InventoryItem | EquipmentItem) => {
    if (item.iconUrl) {
      return (
        <img
          src={item.iconUrl}
          alt={item.name}
          style={{
            width: "32px",
            height: "32px",
            imageRendering: "pixelated",
          }}
        />
      );
    }

    return <span style={{ fontSize: "24px" }}>📦</span>;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.85)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#2a2a2a",
          border: "3px solid #444",
          borderRadius: "8px",
          padding: "8px",
          maxWidth: "900px",
          maxHeight: "800px",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            position: "absolute",
            top: "0px",
            right: "0px",
            border: "none",
            color: "white",
            fontSize: "24px",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={onClose}
        >
          ✕
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "4px",
            color: "white",
          }}
        >
          <EquipmentPanel
            player={player}
            renderItemIcon={renderItemIcon}
            onEquipmentChange={forceUpdate}
          />

          <StatsPanel player={player} />

          <InventoryPanel
            player={player}
            onInventoryChange={forceUpdate}
            renderItemIcon={renderItemIcon}
          />
        </div>
      </div>
    </div>
  );
};
