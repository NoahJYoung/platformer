import type { Player } from "../../actors/player/player";

interface StatsPanelProps {
  player: Player;
}

export const StatsPanel = ({ player }: StatsPanelProps) => {
  const stats = player.stats;

  const healthPercent = (player.health / player.maxHealth) * 100;
  const energyPercent = (player.energy / player.maxEnergy) * 100;
  const manaPercent = (player.mana / player.maxMana) * 100;
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
        Character Stats
      </h2>

      <div style={{ display: "flex", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          {[
            { label: "Strength", value: stats.strength.baseValue },
            { label: "Agility", value: stats.agility.baseValue },
            { label: "Intelligence", value: stats.intelligence.baseValue },
            { label: "Vitality", value: stats.vitality.baseValue },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1em",
                padding: "4px",
                background: "#333",
                borderRadius: "8px",
                border: "1px solid #444",
                fontSize: "12px",
              }}
            >
              <span>{label}:</span>
              <span style={{ fontWeight: "bold", color: "#ffd700" }}>
                {value}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            width: "100%",
          }}
        >
          {[
            {
              label: "Health",
              current: player.health,
              max: player.maxHealth,
              percent: healthPercent,
              color: "#ff4444",
            },
            {
              label: "Stamina",
              current: player.energy,
              max: player.maxEnergy,
              percent: energyPercent,
              color: "#ffaa00",
            },
            {
              label: "Mana",
              current: player.mana,
              max: player.maxMana,
              percent: manaPercent,
              color: "#4444ff",
            },
          ].map(({ label, current, max, percent, color }) => (
            <div
              key={label}
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "12px",
                  color: "#aaa",
                }}
              >
                {label}
              </label>
              <div
                style={{
                  width: "100%",
                  height: "12px",
                  background: "#333",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "5px",
                  border: "1px solid #444",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${percent}%`,
                    background: color,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span
                style={{
                  top: "49%",
                  left: "4px",
                  fontSize: "12px",
                  color: "#eee",
                  position: "absolute",
                }}
              >
                {Math.floor(current)}/{max}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Strength", value: stats.strength.baseValue },
          { label: "Agility", value: stats.agility.baseValue },
          { label: "Intelligence", value: stats.intelligence.baseValue },
          { label: "Vitality", value: stats.vitality.baseValue },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
              background: "#333",
              borderRadius: "4px",
              border: "1px solid #444",
            }}
          >
            <span>{label}:</span>
            <span style={{ fontWeight: "bold", color: "#ffd700" }}>
              {value}
            </span>
          </div>
        ))}
      </div> */}

      {/* <div>
        {[
          {
            label: "Health",
            current: player.health,
            max: player.maxHealth,
            percent: healthPercent,
            color: "#ff4444",
          },
          {
            label: "Stamina",
            current: player.energy,
            max: player.maxEnergy,
            percent: energyPercent,
            color: "#ffaa00",
          },
          {
            label: "Mana",
            current: player.mana,
            max: player.maxMana,
            percent: manaPercent,
            color: "#4444ff",
          },
        ].map(({ label, current, max, percent, color }) => (
          <div key={label} style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "12px",
                color: "#aaa",
              }}
            >
              {label}
            </label>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#333",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "5px",
                border: "1px solid #444",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${percent}%`,
                  background: color,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "12px", color: "#ccc" }}>
              {Math.floor(current)}/{max}
            </span>
          </div>
        ))}
      </div> */}
    </div>
  );
};
