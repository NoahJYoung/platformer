import type { AppearanceOptions, AttributesConfig } from "../character/types";

export interface EnemyConfig {
  name: string;
  pos: ex.Vector;
  appearanceOptions: AppearanceOptions;
  facingRight: boolean;
  attributes?: AttributesConfig;
}
