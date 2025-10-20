import type {
  ArmorItem,
  EquipmentItem,
  WeaponItem,
  BuffableAttribute,
  Attribute,
} from "../../../actors/character/types";
import type { Player } from "../../../actors/player/player";

interface ItemStatsDisplayProps {
  item: EquipmentItem;
  equippedItem: EquipmentItem | null;
  player: Player;
}

interface StatDisplay {
  label: string;
  value: number;
  difference: number;
}

interface RequirementDisplay {
  label: string;
  value: number;
  meetsRequirement: boolean;
}

export const ItemStatsDisplay = ({
  item,
  equippedItem,
  player,
}: ItemStatsDisplayProps) => {
  const getStats = (): StatDisplay[] => {
    const stats: StatDisplay[] = [];

    if (item.type === "weapon") {
      const weaponItem = item as WeaponItem;
      const equippedWeapon = equippedItem as WeaponItem | null;

      stats.push({
        label: "Damage",
        value: weaponItem.damage,
        difference: weaponItem.damage - (equippedWeapon?.damage ?? 0),
      });

      stats.push({
        label: "Reach",
        value: weaponItem.reach,
        difference: weaponItem.reach - (equippedWeapon?.reach ?? 0),
      });
    }

    if (item.type === "armor") {
      const armorItem = item as ArmorItem;
      const equippedArmor = equippedItem as ArmorItem | null;

      stats.push({
        label: "Defense",
        value: armorItem.defense,
        difference: armorItem.defense - (equippedArmor?.defense ?? 0),
      });
    }

    const allBuffKeys = new Set<BuffableAttribute>();

    if (item.buffs) {
      Object.keys(item.buffs).forEach((key) =>
        allBuffKeys.add(key as BuffableAttribute)
      );
    }

    if (equippedItem?.buffs) {
      Object.keys(equippedItem.buffs).forEach((key) =>
        allBuffKeys.add(key as BuffableAttribute)
      );
    }

    allBuffKeys.forEach((buffKey) => {
      const itemBuffValue = item.buffs?.[buffKey] ?? 0;
      const equippedBuffValue = equippedItem?.buffs?.[buffKey] ?? 0;

      stats.push({
        label: formatBuffLabel(buffKey),
        value: itemBuffValue,
        difference: itemBuffValue - equippedBuffValue,
      });
    });

    return stats;
  };

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const getRequirements = (): RequirementDisplay[] => {
    const requirements: RequirementDisplay[] = [];
    if (
      ["weapon", "armor"].includes(item.type) &&
      !!(item as EquipmentItem).requirements
    ) {
      if (Object.keys((item as EquipmentItem)?.requirements || {}).length) {
        Object.keys((item as EquipmentItem)?.requirements || {}).forEach(
          (attribute) => {
            const label = attribute;

            const value = item?.requirements?.[attribute as Attribute] || 0;
            const meetsRequirement =
              player.stats[attribute as Attribute].baseValue >= value;

            requirements.push({
              label: capitalizeFirstLetter(label),
              value,
              meetsRequirement,
            });
          }
        );
      }
    }

    return requirements;
  };

  const formatBuffLabel = (key: BuffableAttribute): string => {
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const stats = getStats();
  const requirements = getRequirements();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {requirements.length > 0 && (
          <span
            style={{
              color: "#aaa",
              fontSize: "12px",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              width: "100%",
              borderBottom: "1px solid #555",
            }}
          >
            Requirements:
          </span>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px",
            marginTop: "4px",
          }}
        >
          {requirements.map((requirement) => (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#aaa",
                fontSize: "12px",
              }}
            >
              <span>{`${requirement.label}: `}</span>
              <span
                style={{ color: requirement.meetsRequirement ? "#aaa" : "red" }}
              >
                {requirement.value}
              </span>
            </span>
          ))}
        </div>
      </div>

      <span
        style={{
          color: "#aaa",
          fontSize: "12px",
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
          fontWeight: "bold",
          width: "100%",
          borderBottom: "1px solid #555",
        }}
      >
        Stats:
      </span>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
        }}
      >
        {stats.map((stat, index) => (
          <StatRow key={`${stat.label}-${index}`} stat={stat} />
        ))}
      </div>
    </div>
  );
};

interface StatRowProps {
  stat: StatDisplay;
}

const StatRow = ({ stat }: StatRowProps) => {
  const getDifferenceColor = (diff: number): string => {
    if (diff > 0) return "#4ade80";
    if (diff < 0) return "#f87171";
    return "#888";
  };

  const formatDifference = (diff: number): string => {
    if (diff === 0) return "";
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const hasDifference = stat.difference !== 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "12px",
      }}
    >
      <span style={{ color: "#aaa" }}>{stat.label}:</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span style={{ color: "#fff", fontWeight: "500" }}>{stat.value}</span>
        {hasDifference && (
          <span
            style={{
              color: getDifferenceColor(stat.difference),
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            {formatDifference(stat.difference)}
          </span>
        )}
      </div>
    </div>
  );
};
