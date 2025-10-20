import React from "react";
import type {
  EquipmentItem,
  EquipmentSlot,
  InventoryItem,
} from "../../../actors/character/types";
import { getPlaceholderImageUrl } from "./get-placeholder-image-url";

interface EquipmentPanelProps {
  title: string;
  equipment: Map<string, EquipmentItem | null>;
  onEquipmentChange: () => void;
  renderItemIcon: (item: InventoryItem) => React.ReactNode;
  onSelectItem: (item: InventoryItem) => void;
  onDeselectItem: () => void;
  selectedItem: InventoryItem | null;
  mode?: "player" | "loot";
  onEquip?: (slot: EquipmentSlot, item: EquipmentItem) => void;
  onUnequip?: (slot: EquipmentSlot) => void;
  onTakeEquipment?: (slot: string) => void;
}

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({
  title,
  equipment,
  onEquipmentChange,
  renderItemIcon,
  selectedItem,
  onDeselectItem,
  onSelectItem,
  mode = "player",
  onEquip,
  onUnequip,
  onTakeEquipment,
}) => {
  const isSelected = (item: InventoryItem | null) =>
    !!item && selectedItem?.id === item.id;

  const handleUnequip = (slot: EquipmentSlot) => {
    if (mode === "loot" || !onUnequip) return;

    const item = equipment.get(slot) || null;
    onUnequip(slot);
    if (isSelected(item)) {
      onDeselectItem();
    }
    onEquipmentChange();
  };

  const handleClick = (slot: EquipmentSlot) => {
    const item = equipment.get(slot);

    if (mode === "loot") {
      // Loot mode: clicking transfers item to player
      if (item && onTakeEquipment) {
        onTakeEquipment(slot);
      }
      return;
    }

    // Player mode
    if (!item) {
      if (!!selectedItem && ["armor", "weapon"].includes(selectedItem.type)) {
        if ((selectedItem as EquipmentItem).slot === slot && onEquip) {
          onEquip(slot, selectedItem as EquipmentItem);
          onEquipmentChange();
        }
      }
      return;
    }
    if (!isSelected(item)) {
      onSelectItem(item);
    }
  };

  const renderEquipmentPlaceholder = (slot: EquipmentSlot) => {
    return (
      <img
        src={getPlaceholderImageUrl(slot)}
        alt={slot}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          opacity: "0.1",
          imageRendering: "pixelated",
          filter: "grayscale(100%)",
        }}
      />
    );
  };

  const renderSlot = (slot: EquipmentSlot, label: string) => {
    const equipped = equipment.get(slot) || null;

    const isActiveSlot =
      equipped ||
      (mode === "player" &&
        !!selectedItem &&
        (selectedItem as EquipmentItem).slot === slot);

    return (
      <div
        key={slot}
        style={{
          background: isSelected(equipped) ? "#2a4a2a" : "#333",
          padding: "4px",
          border: `1px solid ${isSelected(equipped) ? "#4caf50" : "#555"}`,
          borderRadius: "4px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          cursor: isActiveSlot ? "pointer" : "default",
          transition: "all 0.2s",
          height: "42px",
          width: "42px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        onClick={() => handleClick(slot)}
        onDoubleClick={() =>
          mode === "player" && equipped && handleUnequip(slot)
        }
        title={
          mode === "loot"
            ? equipped
              ? `${equipped.name} (Click to take)`
              : `Empty ${label} slot`
            : equipped
            ? `${equipped.name} (Double-click to unequip)`
            : `Empty ${label} slot`
        }
        onMouseOver={(e) => {
          if (isActiveSlot) {
            e.currentTarget.style.background = "#345a34";
            e.currentTarget.style.borderColor = "#777";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = isSelected(equipped)
            ? "#2a4a2a"
            : "#333";
          e.currentTarget.style.borderColor = isSelected(equipped)
            ? "#4caf50"
            : "#555";
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
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #333",
        width: 220,
        height: "100%",
        display: "flex",
        flexDirection: "column",
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
        {title}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          maxWidth: "400px",
        }}
      >
        <div style={{ visibility: "hidden" }} />
        {renderSlot("helmet", "Helmet")}
        <div style={{ visibility: "hidden" }} />

        {renderSlot("back", "Cape")}
        {renderSlot("amulet", "Amulet")}
        {renderSlot("mask", "Mask")}

        {renderSlot("weapon", "Weapon")}
        {renderSlot("body", "Body")}
        {renderSlot("gloves", "Gloves")}

        {renderSlot("ring1", "Ring 1")}
        {renderSlot("legs", "Legs")}
        {renderSlot("ring2", "Ring 2")}

        <div style={{ visibility: "hidden" }} />
        {renderSlot("boots", "Boots")}
        {renderSlot("offhand", "Offhand")}
      </div>
    </div>
  );
};
