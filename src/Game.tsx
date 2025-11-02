import React, { useEffect, useRef, useState } from "react";
import { GameEngine } from "./engine/game-engine";
import { CharacterMenu } from "./react-components/character-menu/character-menu";

import type { LootDrop } from "./actors/character/loot-drop";
import { LootMenu } from "./react-components/loot-menu/loot-menu";
import type { MaterialSource } from "./actors/resources/material-source";
import { MessageLog } from "./react-components/message-log/message-log";

import "./globals.css";
import type { BuildingManager } from "./building-manager/building-manager";
import { BuildingUI } from "./react-components/builder-ui/builder-ui";
import type { GameMapScene } from "./scenes/game-scene";

export const Game = () => {
  const gameRef = useRef(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [characterMenuOpen, setCharacterMenuOpen] = useState(false);
  const [lootMenuOpen, setLootMenuOpen] = useState(false);
  const [currentLootDrop, setCurrentLootDrop] = useState<LootDrop | null>(null);
  const [materialSourceMenuOpen, setMaterialSourceMenuOpen] = useState(false);
  const [currentMaterialSource, setCurrentMaterialSource] =
    useState<MaterialSource | null>(null);

  // Building system state
  const [buildingManager, setBuildingManager] =
    useState<BuildingManager | null>(null);
  const [isBuildUIOpen, setIsBuildUIOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "f") {
        const player = engine?.player;
        const nearbyLoot = player?.getNearbyLootDrop();

        if (nearbyLoot && nearbyLoot.getIsPlayerNearby()) {
          setCurrentLootDrop(nearbyLoot);
          setLootMenuOpen(true);
          return;
        }

        const nearbySource = player?.getNearbyMaterialSource();

        if (nearbySource && nearbySource.getIsPlayerNearby()) {
          setCurrentMaterialSource(nearbySource);
          setMaterialSourceMenuOpen(true);
          return;
        }
      }

      // Listen for B key to sync with building mode
      if (event.key.toLowerCase() === "b") {
        const currentScene = engine?.currentScene as GameMapScene;
        if (currentScene?.getBuildingManager) {
          const manager = currentScene.getBuildingManager();
          setBuildingManager(manager);
          // Toggle UI when build mode is toggled
          setTimeout(() => {
            setIsBuildUIOpen(manager?.isBuildMode || false);
          }, 50);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [engine]);

  // Update building manager when scene changes
  useEffect(() => {
    if (engine) {
      const updateBuildingManager = () => {
        const currentScene = engine.currentScene as GameMapScene;
        if (currentScene?.getBuildingManager) {
          setBuildingManager(currentScene.getBuildingManager());
        }
      };

      // Update immediately
      updateBuildingManager();

      // Update when scene changes
      const interval = setInterval(updateBuildingManager, 1000);
      return () => clearInterval(interval);
    }
  }, [engine]);

  useEffect(() => {
    const gameEngine = new GameEngine();
    gameEngine.initialize();
    setEngine(gameEngine);

    return () => {
      gameEngine.stop();
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "c") {
        setCharacterMenuOpen((prev) => !prev);
      }

      if (e.key === "Escape" && characterMenuOpen) {
        setCharacterMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [characterMenuOpen]);

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
    return () => window.removeEventListener("keydown", preventBrowserHotkeys);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: 1440,
          height: 900,
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <MessageLog gameEngine={engine} />

        <canvas id="game-canvas" ref={gameRef} />

        {/* Building Mode Button - Fixed position */}
        {buildingManager && (
          <button
            onClick={() => {
              buildingManager.toggleBuildMode();
              setIsBuildUIOpen(!isBuildUIOpen);
            }}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "15px",
              background: isBuildUIOpen ? "#4caf50" : "#666",
              color: "white",
              border: "none",
              borderRadius: "50%",
              fontSize: "24px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              zIndex: 999,
              transition: "background 0.3s",
            }}
            title="Toggle Build Mode (B)"
          >
            {isBuildUIOpen ? "🏗️" : "🏠"}
          </button>
        )}
      </div>

      {engine?.player && (
        <>
          <CharacterMenu
            player={engine.player}
            isOpen={characterMenuOpen}
            onClose={() => setCharacterMenuOpen(false)}
          />
          {lootMenuOpen && currentLootDrop && (
            <LootMenu
              player={engine.player}
              lootDrop={currentLootDrop}
              isOpen={lootMenuOpen}
              onClose={() => {
                setLootMenuOpen(false);
                setCurrentLootDrop(null);
              }}
            />
          )}

          {materialSourceMenuOpen && currentMaterialSource && (
            <LootMenu
              player={engine.player}
              lootDrop={
                {
                  inventory: currentMaterialSource.interactInventory,
                  equipment: null,
                  isPlayerNearby: currentMaterialSource.getIsPlayerNearby(),
                  getAllItems: () => ({
                    inventory: currentMaterialSource.interactInventory,
                    equipment: null,
                  }),
                } as unknown as LootDrop
              }
              isOpen={materialSourceMenuOpen}
              onClose={() => {
                setMaterialSourceMenuOpen(false);
                setCurrentMaterialSource(null);
              }}
            />
          )}

          {/* Building UI Panel */}
          <BuildingUI
            buildingManager={buildingManager}
            isOpen={isBuildUIOpen}
            onClose={() => {
              setIsBuildUIOpen(false);
              if (buildingManager?.isBuildMode) {
                buildingManager.toggleBuildMode();
              }
            }}
          />
        </>
      )}
    </div>
  );
};
