import type { ItemFactoryData } from "../types";
import { amuletItems } from "./amulet-items";
import { backItems } from "./back-items";
import { bodyItems } from "./body-items";
import { faceItems } from "./face-items";
import { feetItems } from "./feet-items";
import { handItems } from "./hand-items";
import { headItems } from "./head-items";
import { legItems } from "./leg-items";
import { offhandItems } from "./offhand-items";
import { ringItems } from "./ring-items";

export const armor = new Map<string, ItemFactoryData>([
  ...amuletItems,
  ...backItems,
  ...bodyItems,
  ...faceItems,
  ...feetItems,
  ...handItems,
  ...headItems,
  ...legItems,
  ...offhandItems,
  ...ringItems,
]);
