import type { Player } from "../../../actors/player/player";
import { getPlaceholderImageUrl } from "./get-placeholder-image-url";

interface EquipmentStatsProps {
  player: Player;
}

export const EquipmentStats = ({ player }: EquipmentStatsProps) => {
  const equipStats = player.getEquipmentStats();

  const statRows = [
    {
      label: "Physical",
      damage: equipStats.physicalDamage,
      defense: equipStats.physicalDefense,
      color: "#ccc",
    },
    {
      label: "Fire",
      damage: equipStats.fireDamage,
      defense: equipStats.fireDefense,
      color: "#ff922b",
    },
    {
      label: "Ice",
      damage: equipStats.iceDamage,
      defense: equipStats.iceDefense,
      color: "#74c0fc",
    },
    {
      label: "Water",
      damage: equipStats.waterDamage,
      defense: equipStats.waterDefense,
      color: "#4dabf7",
    },
    {
      label: "Earth",
      damage: equipStats.earthDamage,
      defense: equipStats.earthDefense,
      color: "#8ce99a",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        fontSize: "11px",
      }}
    >
      {/* Header Row with Icons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 1fr",
          gap: "4px",
          padding: "2px 4px",
          alignItems: "center",
        }}
      >
        <span></span>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={getPlaceholderImageUrl("weapon")}
            alt="Damage"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "6px",
              opacity: 0.6,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={getPlaceholderImageUrl("body")}
            alt="Defense"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "6px",
              opacity: 0.6,
            }}
          />
        </div>
      </div>

      {/* Stat Rows */}
      {statRows.map(({ label, damage, defense, color }) => (
        <div
          key={label}
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 1fr",
            gap: "4px",
            padding: "2px 4px",
            background: "#2a2a2a",
            borderRadius: "4px",
          }}
        >
          <span style={{ color: "#ccc" }}>{label}:</span>
          <span
            style={{
              fontWeight: "bold",
              color: color,
              textAlign: "center",
            }}
          >
            {Math.round(damage)}
          </span>
          <span
            style={{
              fontWeight: "bold",
              color: color,
              textAlign: "center",
            }}
          >
            {Math.round(defense)}
          </span>
        </div>
      ))}
    </div>
  );
};
