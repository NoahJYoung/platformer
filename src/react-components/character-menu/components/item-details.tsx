import type {
  EquipmentItem,
  InventoryItem,
} from "../../../actors/character/types";
import type { Player } from "../../../actors/player/player";
import { ItemStatsDisplay } from "./item-stats-display";

interface ItemDetailsProps {
  selectedItem: InventoryItem | null;
  onDeselectItem: () => void;
  player: Player;
}

export const ItemDetails = ({
  selectedItem,
  onDeselectItem,
  player,
}: ItemDetailsProps) => {
  const equippedItemInSlot =
    !!selectedItem && ["armor", "weapon"].includes(selectedItem.type)
      ? player.equipmentManager.getEquipped(
          (selectedItem as EquipmentItem).slot
        )
      : null;

  return selectedItem ? (
    <div
      style={{
        background: "#1a1a1a",
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #333",
        position: "relative",
        maxWidth: 220,
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
        {selectedItem.name}
      </h2>
      <button
        onClick={onDeselectItem}
        style={{
          boxShadow: "none",
          outline: "none",
          border: "none",
          cursor: "pointer",
          background: "transparent",
          position: "absolute",
          color: "#aaa",
          top: 4,
          right: 0,
        }}
      >
        ✕
      </button>

      <div style={{ maxHeight: "100%", overflow: "auto" }}>
        <p style={{ fontSize: "12px", marginTop: 0 }}>
          {selectedItem.description}
        </p>

        {["armor", "weapon"].includes(selectedItem.type) && (
          <ItemStatsDisplay
            player={player}
            item={selectedItem as EquipmentItem}
            equippedItem={equippedItemInSlot}
          />
        )}
      </div>
    </div>
  ) : null;
};
