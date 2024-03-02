/**
 * Locations for moment conversation meetings
 */
export const meetingPlaces = {
  plazaTable: {
    title: "The Plaza",
    primaryAgent: { x: 26, y: 15, direction: "down" },
    audiencePositions: [
      { x: 25, y: 20, direction: "up" },
      { x: 29, y: 17, direction: "left" },
      { x: 29, y: 20, direction: "left" },
      { x: 21, y: 22, direction: "up" },
      { x: 15, y: 17, direction: "right" },
      { x: 16, y: 20, direction: "right" },
    ],
    screenStyles: {
      position: "absolute",
      left: "30em",
      top: "-17em",
      width: "10em",
      height: "8em",
    },
    overlayStyles: {
      position: "absolute",
      left: "31em",
      top: "-16em",
      width: "8em",
      height: "4em",
    },
  },
  artBuilding: {
    title: "Art Building",
    primaryAgent: { x: 12, y: 2, direction: "down" },
    audiencePositions: [
      { x: 15, y: 3, direction: "left" },
      { x: 15, y: 7, direction: "left" },
      { x: 12, y: 7, direction: "up" },
      { x: 9, y: 7, direction: "up" },
      { x: 5, y: 7, direction: "right" },
      { x: 5, y: 4, direction: "right" },
    ],
    screenStyles: {
      position: "absolute",
      left: "9em",
      top: "-36em",
      width: "10em",
      height: "8em",
    },
    overlayStyles: {
      position: "absolute",
      left: "10em",
      top: "-35em",
      width: "8em",
      height: "4em",
    },
  },
  coffinClub: {
    title: "The Coffin Club",
    primaryAgent: { x: 11, y: 23, direction: "down" },
    audiencePositions: [
      { x: 14, y: 24, direction: "left" },
      { x: 11, y: 31, direction: "up" },
      { x: 7, y: 30, direction: "up" },
      { x: 5, y: 26, direction: "right" },
      { x: 7, y: 31, direction: "up" },
      { x: 14, y: 28, direction: "left" },
    ],
    screenStyles: {
      position: "absolute",
      left: "8em",
      top: "-2em",
      width: "10em",
      height: "8em",
    },
    overlayStyles: {
      position: "absolute",
      left: "9em",
      top: "-1em",
      width: "8em",
      height: "4em",
    },
  },
  thePortal: {
    title: "The PORTAL",
    primaryAgent: { x: 45, y: 24, direction: "down" },
    audiencePositions: [
      { x: 36, y: 27, direction: "right" },
      { x: 38, y: 30, direction: "up" },
      { x: 41, y: 30, direction: "up" },
      { x: 44, y: 30, direction: "up" },
      { x: 46, y: 27, direction: "left" },
      { x: 43, y: 27, direction: "up" },
      { x: 40, y: 28, direction: "up" },
    ],
    screenStyles: {
      position: "absolute",
      left: "60em",
      top: "-1em",
      width: "10em",
      height: "8em",
    },
    overlayStyles: {
      position: "absolute",
      left: "61em",
      top: "0em",
      width: "8em",
      height: "4em",
    },
  },
};
