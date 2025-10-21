import React, { useState } from "react";
import type { Player } from "../../actors/player/player";
import type { LootDrop } from "../../actors/character/loot-drop";
import type {
  InventoryItem,
  EquipmentItem,
} from "../../actors/character/types";
import { InventoryPanel } from "../character-menu/components/inventory-panel";
import { EquipmentPanel } from "../character-menu/components/equipment-panel";

interface LootMenuProps {
  player: Player;
  lootDrop: LootDrop;
  isOpen: boolean;
  onClose: () => void;
}

export const LootMenu: React.FC<LootMenuProps> = ({
  player,
  lootDrop,
  isOpen,
  onClose,
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  if (!isOpen) return null;

  const { inventory: lootInventory, equipment: lootEquipment } =
    lootDrop.getAllItems();

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

  const handleTakeEquipment = (slot: string) => {
    if (!lootEquipment) return;
    const item = lootEquipment.get(slot);
    if (item) {
      const success = player.inventory.addItem(0, item);
      if (success) {
        lootEquipment.set(slot, null);
        forceUpdate();
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          background: "#2a2a2a",
          border: "3px solid #444",
          borderRadius: "8px",
          padding: "16px",
          maxWidth: "900px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "transparent",
              border: "none",
              color: "#aaa",
              fontSize: "12px",
              cursor: "pointer",
              marginLeft: "auto",
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Three column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              lootEquipment && !!lootEquipment.size
                ? "220px 220px 220px"
                : "220px 220px",
            gap: "10px",
          }}
        >
          {/* Loot Equipment */}
          {lootEquipment && (
            <EquipmentPanel
              title="Equipment"
              equipment={lootEquipment}
              onEquipmentChange={forceUpdate}
              renderItemIcon={renderItemIcon}
              onSelectItem={setSelectedItem}
              onDeselectItem={() => setSelectedItem(null)}
              selectedItem={selectedItem}
              mode="loot"
              onTakeEquipment={handleTakeEquipment}
            />
          )}

          {/* Loot Inventory */}
          <InventoryPanel
            title="Loot"
            inventory={lootInventory}
            player={player}
            onInventoryChange={forceUpdate}
            renderItemIcon={renderItemIcon}
            onSelectItem={setSelectedItem}
            selectedItem={selectedItem}
            mode="loot"
          />

          {/* Player Inventory */}
          <InventoryPanel
            title="Your Inventory"
            inventory={player.inventory}
            player={player}
            onInventoryChange={forceUpdate}
            renderItemIcon={renderItemIcon}
            onSelectItem={setSelectedItem}
            selectedItem={selectedItem}
            mode="player"
          />
        </div>
      </div>
    </div>
  );
};
