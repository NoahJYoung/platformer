import React, { useEffect, useRef } from "react";
import * as ex from "excalibur";
import { Resources, WeaponResources } from "./actors/resources";
import { Player } from "./actors/player/player";
import { Enemy } from "./actors/enemy/enemy";
import type { AppearanceOptions } from "./actors/character/types";
import { CollisionGroups } from "./actors/config";

export const Game = () => {
  const gameRef = useRef(null);
  const engineRef = useRef<ex.Engine | null>(null);

  useEffect(() => {
    if (engineRef.current) return;

    const game = new ex.Engine({
      width: 800,
      height: 600,
      displayMode: ex.DisplayMode.FitScreen,
      canvasElementId: "game-canvas",
      physics: {
        gravity: ex.vec(0, 800),
      },
    });

    game.showDebug(true);

    const loader = new ex.Loader();
    Resources.forEach((resource) => loader.addResource(resource));
    loader.backgroundColor = "#1a1a1a";

    const playerAppearance: AppearanceOptions = {
      sex: "male",
      skinTone: 3,
      hairStyle: 4,
    };

    game.start(loader).then(() => {
      const player = new Player(ex.vec(100, 100), playerAppearance);
      game.add(player);

      // Add sword to inventory with damage and reach properties
      player.inventory.addItem(1, {
        id: "sword_1",
        name: "Iron Sword",
        type: "weapon",
        spriteSheet: WeaponResources.male.sword_1,
        damage: 25, // Damage dealt to enemies
        reach: 25, // Width of weapon hitbox
      });

      const platforms = [
        { x: 400, y: 580, width: 800, height: 20 },
        { x: 500, y: 400, width: 150, height: 20 },
        { x: 300, y: 300, width: 120, height: 20 },
        { x: 600, y: 250, width: 120, height: 20 },
        { x: 25, y: 350, width: 100, height: 20 },
        { x: 150, y: 200, width: 100, height: 20 },
      ];

      platforms.forEach((p, i) => {
        const platform = new ex.Actor({
          name: `platform${i}`,
          pos: new ex.Vector(p.x, p.y),
          width: p.width,
          height: p.height,
          color: ex.Color.Green,
          collisionType: ex.CollisionType.Fixed,
          collisionGroup: CollisionGroups.Environment,
        });
        game.add(platform);
      });

      // Function to spawn an enemy
      let currentEnemy: Enemy | null = null;

      const spawnEnemy = () => {
        const enemyAppearance: AppearanceOptions = {
          sex: Math.random() > 0.5 ? "male" : "female",
          skinTone: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
          hairStyle: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
        };

        const spawnX = Math.random() > 0.5 ? 600 : 200;
        const enemy = new Enemy(
          "Enemy",
          ex.vec(spawnX, 300),
          enemyAppearance,
          false
        );

        game.add(enemy);
        currentEnemy = enemy;

        // Give the enemy a weapon
        const weaponSpriteSheet =
          enemyAppearance.sex === "male"
            ? WeaponResources.male.sword_1
            : WeaponResources.female.sword_1;

        enemy.inventory.addItem(1, {
          id: "sword_1",
          name: "Enemy Sword",
          type: "weapon",
          spriteSheet: weaponSpriteSheet,
          damage: 15,
          reach: 25,
        });
        enemy.equipWeapon(1);

        // Listen for enemy death
        enemy.once("kill", () => {
          currentEnemy = null;
          // Spawn new enemy after 2 seconds
          setTimeout(() => {
            spawnEnemy();
          }, 2000);
        });
      };

      // Spawn first enemy
      spawnEnemy();

      // Health display
      const healthLabel = new ex.Label({
        text: `Health: ${player.health}/${player.maxHealth}`,
        pos: new ex.Vector(20, 20),
        font: new ex.Font({
          size: 18,
          color: ex.Color.White,
        }),
      });
      game.add(healthLabel);

      // Energy display
      const energyLabel = new ex.Label({
        text: `Energy: ${Math.floor(player.energy)}/${player.maxEnergy}`,
        pos: new ex.Vector(20, 45),
        font: new ex.Font({
          size: 18,
          color: ex.Color.fromHex("#00BFFF"),
        }),
      });
      game.add(energyLabel);

      // Run mode indicator
      const runIndicator = new ex.Label({
        text: "WALK MODE",
        pos: ex.vec(20, 20),
        font: new ex.Font({
          family: "Arial",
          size: 20,
          bold: true,
          color: ex.Color.White,
        }),
      });
      game.add(runIndicator);

      // Weapon indicator
      const weaponLabel = new ex.Label({
        text: "No Weapon (Press 2 to equip)",
        pos: ex.vec(20, 70),
        font: new ex.Font({
          size: 16,
          color: ex.Color.Yellow,
        }),
      });
      game.add(weaponLabel);

      // Enemy health display
      const enemyHealthLabel = new ex.Label({
        text: `Enemy Health: 0/0`,
        pos: new ex.Vector(20, 95),
        font: new ex.Font({
          size: 16,
          color: ex.Color.Red,
        }),
      });
      game.add(enemyHealthLabel);

      // STATS DISPLAY
      const statsLabel = new ex.Label({
        text: "STATS",
        pos: new ex.Vector(20, 130),
        font: new ex.Font({
          size: 14,
          color: ex.Color.fromHex("#FFD700"),
          bold: true,
        }),
      });
      game.add(statsLabel);

      const vitalityLabel = new ex.Label({
        text: "VIT: 10",
        pos: new ex.Vector(20, 150),
        font: new ex.Font({
          size: 12,
          color: ex.Color.fromHex("#FF6B6B"),
        }),
      });
      game.add(vitalityLabel);

      const strengthLabel = new ex.Label({
        text: "STR: 10",
        pos: new ex.Vector(20, 165),
        font: new ex.Font({
          size: 12,
          color: ex.Color.fromHex("#FFA500"),
        }),
      });
      game.add(strengthLabel);

      const agilityLabel = new ex.Label({
        text: "AGI: 10",
        pos: new ex.Vector(20, 180),
        font: new ex.Font({
          size: 12,
          color: ex.Color.fromHex("#4FC3F7"),
        }),
      });
      game.add(agilityLabel);

      // Update displays every frame
      player.on("preupdate", () => {
        healthLabel.text = `Health: ${player.health}/${player.maxHealth}`;
        energyLabel.text = `Energy: ${Math.floor(player.energy)}/${
          player.maxEnergy
        }`;

        // Update energy color
        if (player.energy < 20) {
          energyLabel.font.color = ex.Color.Red;
        } else if (player.energy < 50) {
          energyLabel.font.color = ex.Color.Yellow;
        } else {
          energyLabel.font.color = ex.Color.fromHex("#00BFFF");
        }

        // Update run indicator
        if (player.isRunMode && player.energy > 0) {
          runIndicator.text = "RUN MODE";
          runIndicator.font.color = ex.Color.fromHex("#00FF00");
        } else {
          runIndicator.text = "WALK MODE";
          runIndicator.font.color = ex.Color.White;
        }

        // Update weapon indicator
        const equippedWeapon = player.getEquippedWeapon();
        if (equippedWeapon) {
          weaponLabel.text = `Weapon: ${equippedWeapon.name} (DMG: ${equippedWeapon.damage})`;
          weaponLabel.font.color = ex.Color.fromHex("#FFD700");
        } else {
          weaponLabel.text = "No Weapon (Press 2 to equip)";
          weaponLabel.font.color = ex.Color.Yellow;
        }

        // Update enemy health
        if (currentEnemy) {
          enemyHealthLabel.text = `Enemy Health: ${currentEnemy.health}/${currentEnemy.maxHealth}`;
        } else {
          enemyHealthLabel.text = `Spawning enemy...`;
        }

        // Update stats display
        const vitality = (player as any).statsSystem.getVitality();
        const strength = (player as any).statsSystem.getStrength();
        const agility = (player as any).statsSystem.getAgility();

        vitalityLabel.text = `VIT: ${vitality}`;
        strengthLabel.text = `STR: ${strength}`;
        agilityLabel.text = `AGI: ${agility}`;

        // Keep labels following camera
        if (game.currentScene?.camera) {
          const camPos = game.currentScene.camera.pos;
          const camZoom = game.currentScene.camera.zoom;
          const viewportWidth = game.currentScene.camera.viewport.width;
          const viewportHeight = game.currentScene.camera.viewport.height;

          runIndicator.pos = ex.vec(
            camPos.x + viewportWidth / 2 / camZoom - 200,
            camPos.y - viewportHeight / 2 / camZoom + 20
          );

          healthLabel.pos = ex.vec(
            camPos.x - viewportWidth / 2 / camZoom + 20,
            camPos.y - viewportHeight / 2 / camZoom + 20
          );

          energyLabel.pos = ex.vec(
            camPos.x - viewportWidth / 2 / camZoom + 20,
            camPos.y - viewportHeight / 2 / camZoom + 45
          );

          weaponLabel.pos = ex.vec(
            camPos.x - viewportWidth / 2 / camZoom + 20,
            camPos.y - viewportHeight / 2 / camZoom + 70
          );

          enemyHealthLabel.pos = ex.vec(
            camPos.x - viewportWidth / 2 / camZoom + 20,
            camPos.y - viewportHeight / 2 / camZoom + 95
          );

          statsLabel.pos = ex.vec(
            camPos.x - viewportWidth / 2 / camZoom + 20,
            camPos.y - viewportHeight / 2 / camZoom + 130
          );

          vitalityLabel.pos = ex.vec(
            camPos.x - viewportWidth / 2 / camZoom + 20,
            camPos.y - viewportHeight / 2 / camZoom + 150
          );

          strengthLabel.pos = ex.vec(
            camPos.x - viewportWidth / 2 / camZoom + 20,
            camPos.y - viewportHeight / 2 / camZoom + 165
          );

          agilityLabel.pos = ex.vec(
            camPos.x - viewportWidth / 2 / camZoom + 20,
            camPos.y - viewportHeight / 2 / camZoom + 180
          );
        }
      });
    });

    engineRef.current = game;

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const preventBrowserHotkeys = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "w" || e.key === "t" || e.key === "n" || e.key === "r") {
          e.preventDefault();
        }
      }

      if (e.key === "F5") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", preventBrowserHotkeys);

    return () => {
      window.removeEventListener("keydown", preventBrowserHotkeys);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
      }}
    >
      <canvas id="game-canvas" ref={gameRef} />
    </div>
  );
};
