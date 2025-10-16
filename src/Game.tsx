import React, { useEffect, useRef, useState } from "react";
import { GameEngine } from "./game-engine";
import { CharacterMenu } from "./react-components/character-menu";

import "./globals.css";

export const Game = () => {
  const gameRef = useRef(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      if (e.key === "c" || e.key === "i") {
        setIsMenuOpen((prev) => !prev);
      }

      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isMenuOpen]);

  useEffect(() => {
    if (engineRef.current) {
      if (isMenuOpen) {
        engineRef.current.stop();
      } else {
        engineRef.current.start();
      }
    }
  }, [isMenuOpen]);

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
        <CharacterMenu
          player={engineRef.current.player}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          engineRef={engineRef}
        />
      )}
    </div>
  );
};
