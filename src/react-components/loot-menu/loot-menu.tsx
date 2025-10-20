import React, { useState } from "react";
import type { Player } from "../../actors/player/player";
import type { LootDrop } from "../../actors/character/loot-drop";
import type {
  InventoryItem,
  EquipmentItem,
  EquipmentSlot,
} from "../../actors/character/types";
import { InventoryPanel } from "../character-menu/components/inventory-panel";
import { getPlaceholderImageUrl } from "../character-menu/components/get-placeholder-image-url";
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

  const handleTakeEquipment = (slot: string) => {
    const item = lootEquipment.get(slot);
    if (item) {
      const success = player.inventory.addItem(0, item);
      if (success) {
        lootEquipment.set(slot, null);
        forceUpdate();
      }
    }
  };

  const handleTakeAll = () => {
    for (let i = 0; i < lootInventory.maxSlots; i++) {
      const item = lootInventory.getItem(i);
      if (item) {
        const success = player.inventory.addItem(0, item);
        if (success) {
          lootInventory.removeItem(i);
        }
      }
    }

    lootEquipment.forEach((item, slot) => {
      if (item) {
        const success = player.inventory.addItem(0, item);
        if (success) {
          lootEquipment.set(slot, null);
        }
      }
    });

    forceUpdate();
  };

  const hasAnyItems = () => {
    for (let i = 0; i < lootInventory.maxSlots; i++) {
      if (lootInventory.getItem(i)) return true;
    }
    for (const item of lootEquipment.values()) {
      if (item) return true;
    }
    return false;
  };

  const equipmentSlots: EquipmentSlot[] = [
    "weapon",
    "helmet",
    "mask",
    "body",
    "legs",
    "gloves",
    "boots",
    "ring1",
    "ring2",
    "amulet",
    "back",
  ];

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
          background: "#2a2a2a",
          border: "3px solid #444",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "900px",
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <button
            style={{
              padding: "8px 16px",
              background: hasAnyItems() ? "#4caf50" : "#555",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: hasAnyItems() ? "pointer" : "not-allowed",
              fontSize: "14px",
            }}
            onClick={handleTakeAll}
            disabled={!hasAnyItems()}
          >
            Take All
          </button>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "#aaa",
              fontSize: "24px",
              cursor: "pointer",
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
            gridTemplateColumns: "220px 220px 220px",
            gap: "10px",
          }}
        >
          {/* Loot Equipment */}
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

        {!hasAnyItems() && (
          <div
            style={{
              textAlign: "center",
              color: "#666",
              marginTop: "20px",
              fontSize: "14px",
            }}
          >
            No items remaining in loot
          </div>
        )}
      </div>
    </div>
  );
};
