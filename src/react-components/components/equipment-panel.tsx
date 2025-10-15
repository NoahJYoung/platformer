import React from "react";
import type { Player } from "../../actors/player/player";
import type {
  EquipmentSlot,
  InventoryItem,
} from "../../actors/character/types";
import { getPlaceholderImageUrl } from "./get-placeholder-image-url";

interface EquipmentPanelProps {
  player: Player;
  onEquipmentChange: () => void;
  renderItemIcon: (item: InventoryItem) => React.ReactNode;
}

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({
  player,
  onEquipmentChange,
  renderItemIcon,
}) => {
  const handleUnequip = (slot: EquipmentSlot) => {
    player.unEquipItem(slot);
    onEquipmentChange();
  };

  const renderEquipmentPlaceholder = (slot: EquipmentSlot) => {
    return (
      <img
        src={getPlaceholderImageUrl(slot)}
        alt={slot}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "8px",
          opacity: "0.1",
          imageRendering: "pixelated",
          filter: "grayscale(100%)",
        }}
      />
    );
  };

  const renderSlot = (slot: EquipmentSlot, label: string) => {
    const equipped = player.equipmentManager.getEquipped(slot);
    const hasItem = !!equipped;

    return (
      <div
        key={slot}
        style={{
          background: hasItem ? "#2a4a2a" : "#333",
          padding: "4px",
          border: `1px solid ${hasItem ? "#4caf50" : "#555"}`,
          borderRadius: "4px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          cursor: equipped ? "pointer" : "default",
          transition: "all 0.2s",
          height: "48px",
          width: "48px",
        }}
        onDoubleClick={() => equipped && handleUnequip(slot)}
        title={
          equipped
            ? `${equipped.name} (Click to unequip)`
            : `Empty ${label} slot`
        }
        onMouseOver={(e) => {
          if (equipped) {
            e.currentTarget.style.background = "#345a34";
            e.currentTarget.style.borderColor = "#777";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = hasItem ? "#2a4a2a" : "#333";
          e.currentTarget.style.borderColor = hasItem ? "#4caf50" : "#555";
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {equipped
            ? renderItemIcon(equipped)
            : renderEquipmentPlaceholder(slot)}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "20px",
        borderRadius: "6px",
        border: "1px solid #333",
      }}
    >
      <h2
        style={{
          margin: "0 0 15px 0",
          fontSize: "14px",
          color: "#aaa",
          borderBottom: "2px solid #444",
          paddingBottom: "10px",
        }}
      >
        Equipment
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <div style={{ visibility: "hidden" }} />
        {renderSlot("helmet", "Helmet")}
        <div style={{ visibility: "hidden" }} />

        {renderSlot("back", "Cape")}
        {renderSlot("mask", "Mask")}
        {renderSlot("amulet", "Amulet")}

        {renderSlot("weapon", "Weapon")}
        {renderSlot("body", "Body")}
        {renderSlot("gloves", "Gloves")}

        {renderSlot("ring1", "Ring 1")}
        {renderSlot("legs", "Legs")}
        {renderSlot("ring2", "Ring 2")}

        <div style={{ visibility: "hidden" }} />
        {renderSlot("boots", "Boots")}
        <div style={{ visibility: "hidden" }} />
      </div>
    </div>
  );
};
