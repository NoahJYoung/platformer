import type { Player } from "../../../actors/player/player";
import { EquipmentStats } from "./equipment-stats";
import { InventorySprite } from "./inventory-sprite";

interface StatsPanelProps {
  player: Player;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const StatsPanel = ({ player, canvasRef }: StatsPanelProps) => {
  const stats = player.stats;

  const healthPercent = (player.health / player.maxHealth) * 100;
  const energyPercent = (player.energy / player.maxEnergy) * 100;
  const manaPercent = (player.mana / player.maxMana) * 100;

  const temperature = player.getTemperature();
  const hunger = player.getHunger();
  const thirst = player.getThirst();

  const hungerPercent = (hunger / 100) * 100;
  const thirstPercent = (thirst / 100) * 100;

  const getTemperatureColor = (temp: number): string => {
    const normalized = Math.max(0, Math.min(1, (temp + 20) / 60));

    if (normalized < 0.33) {
      const intensity = normalized / 0.33;
      const r = Math.round(100 * intensity);
      const g = Math.round(150 * intensity);
      const b = 255;
      return `rgb(${r}, ${g}, ${b})`;
    } else if (normalized < 0.5) {
      const intensity = (normalized - 0.33) / 0.17;
      const r = Math.round(100 + 155 * intensity);
      const g = Math.round(150 + 105 * intensity);
      const b = 255;
      return `rgb(${r}, ${g}, ${b})`;
    } else if (normalized < 0.67) {
      const intensity = (normalized - 0.5) / 0.17;
      const r = 255;
      const g = 255;
      const b = Math.round(255 - 100 * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const intensity = (normalized - 0.67) / 0.33;
      const r = 255;
      const g = Math.round(255 - 255 * intensity);
      const b = Math.round(155 - 155 * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const tempPercent = Math.max(
    0,
    Math.min(100, ((temperature + 20) / 60) * 100)
  );

  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #333",
        maxWidth: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          margin: "0 0 6px 0",
          fontSize: "14px",
          fontWeight: "bold",
          color: "#aaa",
          borderBottom: "2px solid #444",
          paddingBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{player.displayName}</span>
        <span>{`Lv ${player.level}`}</span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <InventorySprite canvasRef={canvasRef} player={player} />
        <EquipmentStats player={player} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxWidth: "400px",
          }}
        >
          {[
            {
              label: "Strength",
              attr: "strength" as const,
              value: stats.strength.baseValue,
            },
            {
              label: "Agility",
              attr: "agility" as const,
              value: stats.agility.baseValue,
            },
            {
              label: "Intelligence",
              attr: "intelligence" as const,
              value: stats.intelligence.baseValue,
            },
            {
              label: "Vitality",
              attr: "vitality" as const,
              value: stats.vitality.baseValue,
            },
          ].map(({ label, attr, value }) => {
            const progress = player.statsSystem.getStatProgress(attr);
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1em",
                    padding: "4px",
                    background: "#333",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    fontSize: "14px",
                  }}
                >
                  <span>{label}:</span>
                  <span style={{ fontWeight: "bold", color: "#ffd700" }}>
                    {value}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "2px",
                    background: "#222",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progress.percentage}%`,
                      background: "#ff8800",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
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
              <div
                style={{
                  width: "100%",
                  height: "12px",
                  background: "#333",
                  borderRadius: "12px",
                  overflow: "hidden",
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
                  top: "0px",
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#333",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #444",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${tempPercent}%`,
                  background: getTemperatureColor(temperature),
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span
              style={{
                top: "-2px",
                left: "4px",
                fontSize: "12px",
                color: "#eee",
              }}
            >
              {Math.round(temperature)}°C
            </span>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "2px",
                height: "8px",
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`hunger-${i}`}
                  style={{
                    flex: 1,
                    background:
                      i < Math.ceil((hungerPercent / 100) * 8)
                        ? "#FFFACD"
                        : "#333",
                    borderRadius: "3px",
                    border: "1px solid #444",
                    transition: "background 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "2px",
                height: "8px",
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`thirst-${i}`}
                  style={{
                    flex: 1,
                    background:
                      i < Math.ceil((thirstPercent / 100) * 8)
                        ? "#4A90E2"
                        : "#333",
                    borderRadius: "3px",
                    border: "1px solid #444",
                    transition: "background 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
