import type {
  EquipmentItem,
  InventoryItem,
} from "../../actors/character/types";
import type { Player } from "../../actors/player/player";

interface InventoryPanelProps {
  player: Player;
  onInventoryChange: () => void;
  renderItemIcon: (item: InventoryItem) => React.ReactNode;
}

export const InventoryPanel = ({
  player,
  onInventoryChange,
  renderItemIcon,
}: InventoryPanelProps) => {
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
        Inventory
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
        }}
      >
        {Array.from({ length: player.inventory.maxSlots }).map((_, i) => {
          const item = player.inventory.getItem(i);
          const equipmentItem = item;
          const canEquip = (equipmentItem as EquipmentItem)?.slot;
          const hasItem = !!item;

          return (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                background: hasItem ? "#2a4a2a" : "#333",
                border: `2px solid ${hasItem ? "#4caf50" : "#555"}`,
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
                height: "48px",
                width: "48px",
                gap: "4px",
              }}
              onClick={() => {}}
              onDoubleClick={() => canEquip && handleEquipFromInventory(i)}
              title={
                item
                  ? `${item.name}${canEquip ? " (Click to equip)" : ""}`
                  : "Empty slot"
              }
              onMouseOver={(e) => {
                e.currentTarget.style.background = hasItem
                  ? "#345a34"
                  : "#3a3a3a";
                e.currentTarget.style.borderColor = "#777";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = hasItem ? "#2a4a2a" : "#333";
                e.currentTarget.style.borderColor = hasItem
                  ? "#4caf50"
                  : "#555";
              }}
            >
              {item && (
                <>
                  {renderItemIcon(item)}
                  <span
                    style={{
                      wordWrap: "break-word",
                      fontSize: "9px",
                      lineHeight: "1.1",
                      marginTop: "2px",
                    }}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
