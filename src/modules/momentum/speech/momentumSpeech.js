import { updateAgent } from "../../../firebase/firebaseAgents";
import { pushNewMoment } from "../../../firebase/firebaseMoments";
import { fetchModelResponse } from "../../../modelAPI/fetchModelResponse";
import {
  delay,
  getRandomAgent,
  getRandomAudiencePosition,
  moveAgent,
  createUpdatedAgent,
  updateAgentState,
  groupSpeechInteraction,
  getRandomEmoji,
  sendAllAgentsHome,
} from "./helperFunctions";
import {
  agentDiscussionPrompt,
  finalMomentPrompt,
  initialMomentPrompt,
  paraphraseResponse,
} from "./promptTemplates";

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
  let primaryAgent = null;
  let agentList = [];

  // Set primaryAgent and the agentList[]
  agents.reduce((acc, agent) => {
    if (agent.playerControlled === true) {
      primaryAgent = agent;
    } else if (agent.render === true) {
      agentList.push(agent);
    }
  }, []);

  // Initialize the array of conversations to take place
  let conversations = [];

  // ------------- Initializing Moment by Primary Agent -------------- //

  // Get the initial prompt template which combines the params
  let primaryAgentInitialPrompt = initialMomentPrompt(
    primaryAgent,
    moment.initialPrompt
  );

  let updatedPrimaryAgent = null;
  let primaryAgentInitialIdea = "";
  let primaryAgentFinalSpeech = "";
  let paraphrasedInitialIdea = "";

  // @prompt: Get initial idea from AI Model
  primaryAgentInitialIdea = await fetchModelResponse(
    aiModel,
    primaryAgentInitialPrompt
  );

  // @prompt: fetch remaining context from AI Model
  for (let index = 0; index < 3; ++index) {
    primaryAgentInitialIdea += await fetchModelResponse(
      aiModel,
      `${primaryAgentInitialPrompt}
      ${primaryAgentInitialIdea}`
    );
  }

  paraphrasedInitialIdea = await fetchModelResponse(
    aiModel,
    paraphraseResponse(primaryAgentInitialIdea)
  );

  const initialIdea = {
    primaryAgent: primaryAgent,
    initialPrompt: moment.initialPrompt,
    initialResponse: primaryAgentInitialIdea,
    paraphrasedResponse: paraphrasedInitialIdea,
  };

  conversations.push(initialIdea);

  // ------------- Agents Begin Brainstorming with Primary Agent -------------- //

  while (agentList.length > 0) {
    // Grab an agent to talk to and remove them from the list
    let agent = getRandomAgent(agentList);
    agentList = agentList.filter((a) => a.uid !== agent.uid);

    // Moves primaryAgent to the agent position
    await moveAgent(primaryAgent, agent.x - 3, agent.y - 1, setAgents);

    updatedPrimaryAgent = createUpdatedAgent(
      primaryAgent,
      agent.x - 3,
      agent.y - 1,
      "right",
      `${agent.name}: ${paraphrasedInitialIdea}`
    );

    // This will initiate the text for momentResponse for primaryAgent
    await updateAgentState(setAgents, updateAgent, updatedPrimaryAgent);
    // delay(10000); // wait for primary agent to finish discussing topic

    // @prompt: get prompt for agent AI Model fetch
    let agentPrompt = agentDiscussionPrompt(
      primaryAgent,
      agent,
      primaryAgentInitialIdea
    );

    // @prompt fetch
    let agentResponse = await fetchModelResponse(aiModel, agentPrompt);

    const agentFeedback = {
      agent: agent,
      agentPrompt: agentPrompt,
      agentResponse: agentResponse,
    };

    conversations.push(agentFeedback);

    // Local state context is not updated here as agent does not move on {x, y}
    // This update initiates agent response in text bubble
    await updateAgent({
      ...agent,
      direction: "left",
      momentResponse: agentResponse,
    });

    if (speechLocation.audiencePositions.length > 0) {
      let agentAudiencePosition = getRandomAudiencePosition(
        speechLocation.audiencePositions
      );

      speechLocation.audiencePositions =
        speechLocation.audiencePositions.filter(
          (position) =>
            position.x !== agentAudiencePosition.x &&
            position.y !== agentAudiencePosition.y
        );

      // await delay(14000);
      await moveAgent(
        agent,
        agentAudiencePosition.x,
        agentAudiencePosition.y,
        setAgents
      );

      let emojis = getRandomEmoji() + getRandomEmoji();

      let updatedAgent = createUpdatedAgent(
        agent,
        agentAudiencePosition.x,
        agentAudiencePosition.y,
        agentAudiencePosition.direction,
        emojis
      );

      await updateAgentState(setAgents, updateAgent, updatedAgent);
    }
  }

  // ------------- Final Speech by Primary Agent -------------- //

  updatedPrimaryAgent = createUpdatedAgent(
    primaryAgent,
    primaryAgent.x,
    primaryAgent.y,
    "down",
    getRandomEmoji()
  );

  await updateAgentState(setAgents, updateAgent, updatedPrimaryAgent);

  // @prompt: get final prompt
  let primaryAgentFinalSpeechPrompt = finalMomentPrompt(
    primaryAgent,
    moment.finalPrompt,
    primaryAgentInitialIdea
  );

  // @prompt: Get initial idea from AI Model
  primaryAgentFinalSpeech = await fetchModelResponse(
    aiModel,
    primaryAgentFinalSpeechPrompt
  );

  // @prompt: fetch remaining context from AI Model
  for (let index = 0; index < 3; ++index) {
    primaryAgentFinalSpeech += await fetchModelResponse(
      aiModel,
      `${primaryAgentFinalSpeechPrompt}
      ${primaryAgentFinalSpeech}`
    );
  }

  const finalSpeech = {
    header: "-------------- MOMENT --------------",
    speech: primaryAgentFinalSpeech,
  };

  conversations.push(finalSpeech);

  await moveAgent(
    primaryAgent,
    speechLocation.primaryAgent.x,
    speechLocation.primaryAgent.y,
    setAgents
  );

  setShowImageScreen(true);

  updatedPrimaryAgent = createUpdatedAgent(
    primaryAgent,
    speechLocation.primaryAgent.x,
    speechLocation.primaryAgent.y,
    speechLocation.primaryAgent.direction,
    primaryAgentFinalSpeech
  );

  updateAgentState(setAgents, updateAgent, updatedPrimaryAgent);
  pushNewMoment(conversations);

  setTimeout(() => {
    setShowImageScreen(false);
    sendAllAgentsHome(agents, setAgents, updateAgent);
  }, 6000); // wait 1-minute and send all agents to home positions

  // groupSpeechInteraction(agents, updateAgent);
};
