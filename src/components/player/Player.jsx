import React, { useEffect, useState } from "react";
import { handlePlayerMoveEvent } from "./modules/keyPressListener";

// Sprite Styles
import "./styles/styles.css";
import { Sprite } from "./styles/Sprite";

function Player({ player, changePlayerControlled, userId, database }) {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (player.playerControlled) {
        handlePlayerMoveEvent(player, event.key, userId, database);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [player, userId, database]);

  return (
    // <div className="sprite-container" style={{ left: player.x, top: player.y }}>
    <div className="sprite-container">
      <Sprite
        player={player}
        className={`sprite grid-cell ${
          player.frame === 0
            ? `stand-${player.direction}`
            : `walk-${player.direction}-${player.frame}`
        }`}
        onClick={() => changePlayerControlled(player)}>
        {player.playerControlled ? <div className="sprite-arrow"></div> : ""}
        <div className="sprite-name-container">{player.name}</div>
      </Sprite>
      <div className="sprite-shadow"></div>
    </div>
  );
}

export default Player;
