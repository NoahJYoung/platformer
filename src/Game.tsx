import React, { useEffect, useRef, useState } from "react";
import { GameEngine } from "./game-engine";
import { CharacterMenu } from "./react-components/character-menu/character-menu";

import "./globals.css";
import type { LootDrop } from "./actors/character/loot-drop";
import { LootMenu } from "./react-components/loot-menu/loot-menu";
import type { MaterialSource } from "./actors/resources/material-source";

export const Game = () => {
  const gameRef = useRef(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [characterMenuOpen, setCharacterMenuOpen] = useState(false);
  const [lootMenuOpen, setLootMenuOpen] = useState(false);
  const [currentLootDrop, setCurrentLootDrop] = useState<LootDrop | null>(null);
  const [materialSourceMenuOpen, setMaterialSourceMenuOpen] = useState(false);
  const [currentMaterialSource, setCurrentMaterialSource] =
    useState<MaterialSource | null>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "f") {
        const player = engineRef.current?.player;
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
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [engineRef]);

  useEffect(() => {
    if (engineRef.current) return;

    const game = new GameEngine();
    game.initialize();

    engineRef.current = game;

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
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
    if (engineRef.current) {
      if ([characterMenuOpen, lootMenuOpen].some((state) => !!state)) {
        engineRef.current.stop();
      } else {
        engineRef.current.start();
      }
    }
  }, [characterMenuOpen, lootMenuOpen]);

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
        }}
      >
        <canvas id="game-canvas" ref={gameRef} />
      </div>

      {engineRef.current?.player && (
        <>
          <CharacterMenu
            player={engineRef.current.player}
            isOpen={characterMenuOpen}
            onClose={() => setCharacterMenuOpen(false)}
            engineRef={engineRef}
          />
          {lootMenuOpen && currentLootDrop && (
            <LootMenu
              player={engineRef.current.player}
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
              player={engineRef.current.player}
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
        </>
      )}
    </div>
  );
};
