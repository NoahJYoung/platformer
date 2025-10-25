import type {
  ConsumableItem,
  EquipmentItem,
  InventoryItem,
  InventorySlot,
} from "../../../actors/character/types";
import type { Player } from "../../../actors/player/player";
import type { Inventory } from "../../../actors/character/inventory";

interface InventoryPanelProps {
  title: string;
  inventory: Inventory;
  player?: Player;
  onInventoryChange: () => void;
  renderItemIcon: (item: InventoryItem) => React.ReactNode;
  onSelectItem: (item: InventoryItem) => void;
  selectedItem: InventoryItem | null;
  mode?: "player" | "loot";
}

export const InventoryPanel = ({
  title,
  inventory,
  player,
  onInventoryChange,
  renderItemIcon,
  onSelectItem,
  selectedItem,
  mode = "player",
}: InventoryPanelProps) => {
  const isSelected = (item: InventoryItem | null) =>
    !!item && selectedItem === item;

  const handleClick = (slotData: InventorySlot | null, slot: number) => {
    const item = slotData?.item || null;

    if (mode === "loot") {
      if (item && player && slotData) {
        const success = player.inventory.addItem(0, item, slotData.quantity);
        if (success) {
          inventory.removeItem(slot);
          onInventoryChange();
        }
      }
      return;
    }

    if (!item) {
      if (selectedItem && player) {
        const oldSlot = player.inventory.getSlotFromItem(selectedItem);
        if (oldSlot !== -1) {
          player.inventory.moveItemToSlot(oldSlot, slot);
          onInventoryChange();
        } else if (
          ["armor", "weapon"].includes(selectedItem.type) &&
          player.equipmentManager
            .getAllEquipped()
            .has((selectedItem as EquipmentItem).slot)
        ) {
          player.unEquipItem((selectedItem as EquipmentItem).slot);
          onInventoryChange();
        }
      }
      return;
    }
    if (!isSelected(item)) {
      onSelectItem(item);
    }
  };

  const handleDoubleClick = (
    slotData: InventorySlot | null,
    slot: number,
    canEquip: boolean
  ) => {
    const item = slotData?.item;

    switch (item?.type) {
      case "weapon":
      case "armor":
        if (canEquip) handleEquipFromInventory(slot);
        break;
      case "consumable":
        if (player && slotData) {
          player.consumeItem(item as ConsumableItem, slot);
          onInventoryChange();
        }
        break;
      case "material":
      case "quest":
      default:
        break;
    }
  };

  const handleEquipFromInventory = (slot: number) => {
    if (mode === "loot" || !player) return;

    const slotData = inventory.getItem(slot);
    if (!slotData) return;

    const equipmentItem = slotData.item;
    if (!(equipmentItem as EquipmentItem)?.slot) return;

    player.equipItem(equipmentItem as EquipmentItem);
    onInventoryChange();
  };

  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #333",
        width: 220,
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
        className="hide-scrollbar"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
          maxHeight: "260px",
          overflow: "auto",
        }}
      >
        {Array.from({ length: inventory.maxSlots }).map((_, i) => {
          const slotData = inventory.getItem(i);
          const item = slotData?.item;
          const quantity = slotData?.quantity || 0;
          const canEquip = mode === "player" && !!(item as EquipmentItem)?.slot;

          return (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                background: isSelected(item || null) ? "#2a4a2a" : "#333",
                border: `1px solid ${
                  isSelected(item || null) ? "#4caf50" : "#555"
                }`,
                borderRadius: "4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: item || mode === "player" ? "pointer" : "default",
                fontSize: "11px",
                textAlign: "center",
                padding: "6px",
                transition: "all 0.2s",
                height: "42px",
                width: "42px",
                gap: "4px",
                position: "relative",
              }}
              onClick={() => handleClick(slotData, i)}
              onDoubleClick={() => handleDoubleClick(slotData, i, canEquip)}
              title={
                mode === "loot"
                  ? item
                    ? `${item.name}${
                        quantity > 1 ? ` (x${quantity})` : ""
                      } (Click to take)`
                    : "Empty slot"
                  : item
                  ? `${item.name}${quantity > 1 ? ` (x${quantity})` : ""}${
                      canEquip ? " (Double-click to equip)" : ""
                    }`
                  : "Empty slot"
              }
              onMouseOver={(e) => {
                if (item || mode === "player") {
                  e.currentTarget.style.background = isSelected(item || null)
                    ? "#345a34"
                    : "#3a3a3a";
                  e.currentTarget.style.borderColor = "#777";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isSelected(item || null)
                  ? "#2a4a2a"
                  : "#333";
                e.currentTarget.style.borderColor = isSelected(item || null)
                  ? "#4caf50"
                  : "#555";
              }}
            >
              {item && renderItemIcon(item)}

              {item?.stackSize && quantity >= 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    background: "rgba(0, 0, 0, 0.8)",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: "bold",
                    padding: "1px 4px",
                    borderRadius: "3px",
                    lineHeight: "1",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    pointerEvents: "none",
                  }}
                >
                  {quantity}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
