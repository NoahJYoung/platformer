import type {
  EquipmentItem,
  InventoryItem,
} from "../../actors/character/types";
import type { Player } from "../../actors/player/player";

interface InventoryPanelProps {
  player: Player;
  onInventoryChange: () => void;
  renderItemIcon: (item: InventoryItem) => React.ReactNode;
  onSelectItem: (item: InventoryItem) => void;
  selectedItem: InventoryItem | null;
}

export const InventoryPanel = ({
  player,
  onInventoryChange,
  renderItemIcon,
  onSelectItem,
  selectedItem,
}: InventoryPanelProps) => {
  const isSelected = (item: InventoryItem | null) =>
    !!item && selectedItem === item;

  const handleClick = (item: InventoryItem | null, slot: number) => {
    if (!item) {
      if (selectedItem) {
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

  const handleEquipFromInventory = (slot: number) => {
    const item = player.inventory.getItem(slot);
    if (!item) return;
    const equipmentItem = item;
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
        Inventory
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
        {Array.from({ length: player.inventory.maxSlots }).map((_, i) => {
          const item = player.inventory.getItem(i);
          const equipmentItem = item;
          const canEquip = (equipmentItem as EquipmentItem)?.slot;

          return (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                background: isSelected(item) ? "#2a4a2a" : "#333",
                border: `1px solid ${isSelected(item) ? "#4caf50" : "#555"}`,
                borderRadius: "4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "11px",
                textAlign: "center",
                padding: "6px",
                transition: "all 0.2s",
                height: "42px",
                width: "42px",
                gap: "4px",
              }}
              onClick={() => handleClick(item, i)}
              onDoubleClick={() => canEquip && handleEquipFromInventory(i)}
              title={
                item
                  ? `${item.name}${canEquip ? " (Click to equip)" : ""}`
                  : "Empty slot"
              }
              onMouseOver={(e) => {
                e.currentTarget.style.background = isSelected(item)
                  ? "#345a34"
                  : "#3a3a3a";
                e.currentTarget.style.borderColor = "#777";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isSelected(item)
                  ? "#2a4a2a"
                  : "#333";
                e.currentTarget.style.borderColor = isSelected(item)
                  ? "#4caf50"
                  : "#555";
              }}
            >
              {item && renderItemIcon(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
