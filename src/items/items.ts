import type { ItemFactoryData } from "./types";
import { armor } from "./armor/armor";
import { consumables } from "./consumables/consumables";
import { materials } from "./materials/materials";
import { weapons } from "./weapons/weapons";

export const items = new Map<string, ItemFactoryData>([
  ...armor,
  ...consumables,
  ...weapons,
  ...materials,
]);
