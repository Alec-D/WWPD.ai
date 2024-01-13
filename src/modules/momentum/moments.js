/**
 * Create a 'moment' that will start the agent conversations.
 * - instruction: what the model should do with the given context and question
 * - context: the basis of the agent interaction
 * - question: what the model should do with the given context
 */

import {pirateImages, financeImages} from "./momentImages";

export const townSquare = {
  images: Object.values(financeImages),
  title: "Town Square",
  initialPrompt: {
    instruction:
      "Instruction: Answer the question using the given context and persona.",
    context: `Context: You would like to give a talk at the next community meeting. 
      Create several topics and give a short paragraph that explains the topic.`,
    question: `Question: What will your talk be about?`,
  },
  finalPrompt: {
    instruction:
      "Answser the question using the given context, personality and topic.",
    context: `Given the following topic, choose one topic and write a short essay that introduces the topic, includes a thesis with at least three arguments and a conclusion.`,
  },
};

export const pirates = {
  images: Object.values(pirateImages),
  title: "Colonial Pirates",
  initialPrompt: {
    instruction: "Answer the question using the given context and personality.",
    context: `You are creating a script for a play about pirates. You will be the captain of a ship. The period of time will be the 1500's.
    Your home is the open sea, your ship is like a precious child to you, and your crew are the only family you need. It has been a while since your last pirate raid.
    You see a Spanish ship anchored off the coast of Florida. It is probably loading precious cargo.`,
    question: `How many Acts will the play have and what are the actors that will be in the play?`,
  },
  finalPrompt: {
    instruction:
      "Answser the question using the given context, personality and responses from others that want to be part of this play.",
    context: `Write the script necessary to complete the given response and conversation between the other actors.
    Use the names given to create parts for each of the actors in this play.`,
  },
};
