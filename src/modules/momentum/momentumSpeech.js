import { updateAgent } from "../../firebase/firebaseAgents";
import { pushNewMoment } from "../../firebase/firebaseMoments";
import { fetchModelResponse } from "../../modelAPI/fetchModelResponse";
import {
  moveAgent,
  createUpdatedAgent,
  updateAgentState,
  sendAllAgentsHome,
} from "./speechModules/helperFunctions";
import { finalMomentPrompt } from "./speechModules/promptTemplates";

// ------------------New Imports for Refactor-------------------------------
import { initializeAgents } from "./initializeAgents";
import { initializePrimaryAgentIdea } from "./initPrimaryAgentIdea";
import { generateAgentResponses } from "./generateAgentResponses";

/**
 * This function will play out the discussion of the primary agents moment.
 * Each agent asked to participate will have have an opportunity to give their
 * feedback and based on their persona they will provide help with the given moment.
 * The primary agent will finally use all feedback to create and deliver a speech.
 * @param {object} agents, all agent data
 * @param {object} moment, specific moment
 * @param {string} aiModel, name of the ai model to prompt
 * @param {context setter} setAgents, setter for context passed from Sidebar
 */
export const momentumSpeech = async (
  agents,
  moment,
  aiModel,
  setAgents,
  speechLocation,
  setShowImageScreen
) => {
  let speech = {
    primaryAgentInitialIdea: "",
    primaryAgentFinalSpeech: "",
    paraphrasedInitialIdea: "",
    primaryAgent: {},
    updatedPrimaryAgent: {},
    agentList: [],
    conversations: [],
  };

  /**
   * Sets the primaryAgent based on 'playerControlled'
   * Creates a randomized list of the agents rendered to game
   */
  initializeAgents(agents, speech);

  /**
   * Fetch the initial idea based on user selected 'moment' and
   * fetch the paraphrase of the initial idea
   */
  try {
    await initializePrimaryAgentIdea(speech, aiModel, moment);
  } catch (error) {
    console.error("Error Initializing Primary Agent Idea\n", error);
  }

  /**
   * Conversation is used to track the entire conversation
   * which will be rendered to the message interface
   */
  speech.conversations.push({
    primaryAgent: speech.primaryAgent,
    initialPrompt: moment.initialPrompt,
    initialResponse: speech.primaryAgentInitialIdea,
    paraphrasedResponse: speech.paraphrasedInitialIdea,
  });

  /**
   * For each agent, traverse the primaryAgent to 'agent' position and share
   * paraphrased idea. Agent will then fetch an ai response
   */
  await Promise.all(
    speech.agentList.map(async (agent) => {
      try {
        await generateAgentResponses(
          agent,
          speech,
          setAgents,
          aiModel,
          speechLocation
        );
      } catch (error) {
        console.error("Error while generating agent responses\n", error);
      }
    })
  );

  /**
   * At this point the primary agent is at the { x, y } of the last agent to share their idea with.
   * Their properties should be updated correctly to Firebase and local context.
   * Next, set up and then deliver the final moment speech in front of those agents
   * lucky enough to have attended.
   * NOTE: Agents that are not attending could have other things to do during this time . . .
   */

  // @prompt: Get initial idea from AI Model
  speech.primaryAgentFinalSpeech = await fetchModelResponse(
    aiModel,
    finalMomentPrompt(
      speech.primaryAgent,
      moment.finalPrompt,
      speech.primaryAgentInitialIdea
    )
  );

  // @prompt: fetch remaining context from AI Model
  for (let index = 0; index < 3; ++index) {
    speech.primaryAgentFinalSpeech += await fetchModelResponse(
      aiModel,
      `${finalMomentPrompt(
        speech.primaryAgent,
        moment.finalPrompt,
        speech.primaryAgentInitialIdea
      )}
      ${speech.primaryAgentFinalSpeech}`
    );
  }

  const finalSpeech = {
    header: "-------------- MOMENT --------------",
    speech: speech.primaryAgentFinalSpeech,
  };

  speech.conversations.push(finalSpeech);

  await moveAgent(
    speech.primaryAgent,
    speechLocation.primaryAgent.x,
    speechLocation.primaryAgent.y,
    setAgents
  );

  setShowImageScreen(true);

  speech.updatedPrimaryAgent = createUpdatedAgent(
    speech.primaryAgent,
    speechLocation.primaryAgent.x,
    speechLocation.primaryAgent.y,
    speechLocation.primaryAgent.direction,
    speech.primaryAgentFinalSpeech
  );

  updateAgentState(setAgents, updateAgent, speech.updatedPrimaryAgent);
  pushNewMoment(speech.conversations);

  setTimeout(() => {
    setShowImageScreen(false);
    sendAllAgentsHome(agents, setAgents, updateAgent);
  }, 6000); // wait 1-minute and send all agents to home positions
};
