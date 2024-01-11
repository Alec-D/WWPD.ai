import { fetchModelResponse } from "../../modelAPI/fetchModelResponse";

const initialMomentPrompt = (primaryAgent, initialPrompt) => {
  return `Persona: ${primaryAgent.name}, ${primaryAgent.age}, ${primaryAgent.career}. ${primaryAgent.personality}
   ${initialPrompt.instruction} ${initialPrompt.context} ${initialPrompt.question}`;
};

/**
 * This function will play out the discussion of the primary agents moment.
 * Each agent asked to participate will have have an opportunity to give their
 * feedback and based on their persona they will provide help with the given moment.
 * The primary agent will finally use all feedback to create and deliver a speech.
 * @param {object} agents, all agent data
 * @param {object} moment, specific moment
 * @param {string} aiModel, name of the ai model to prompt
 */
export const momentumSpeech = async (agents, moment, aiModel) => {
  const primaryAgent = agents.find((agent) => agent.playerControlled === true);
  const initialPrompt = initialMomentPrompt(primaryAgent, moment.initialPrompt);

  let conversations = primaryAgent.name + ": ";

  let primaryAgentInitialIdea = await fetchModelResponse(
    aiModel,
    initialPrompt
  );

  for (let index = 0; index < 3; ++index) {
    primaryAgentInitialIdea += await fetchModelResponse(
      aiModel,
      initialPrompt + primaryAgentInitialIdea
    );
  }

  console.log(initialPrompt, primaryAgentInitialIdea);

  /**
   * let agentList = agents.find((agent) => agent.uid !== primaryAgent.uid)
   * choose a random agent from the agentList and splice out that agent from agentList
   *
   * choose a meeting location from meetingLocation object at random
   *
   * get path for agent to traverse to meeting location from pathfinder function using
   * current position agent.x and agent.y and the destination chosen destination.x and destination.y
   * Then, pass the agent and path to the moveAgent(agent, path)
   *
   * complete the same steps for the primaryAgent, pathfinder and moveAgent(primaryAgent, path)
   *
   * Once both agents reach their destination:
   *    Destination verification - check that agent.x and agent.y === to the destination.x and destination.y for both
   *    1. create the prompt for the agent using agent persona + primaryAgentInitialIdea and wait for response from fetchModelResponse()
   *    2. updateAgent({...primaryAgent, moment: primaryAgentInitalIdea, converse: true}), which will initiate the primaryAgent to share idea in game
   *          then, another updateAgent({...primaryAgent, converse: false}) once the primaryAgent reaches the end of the primaryAgent.moment string.
   *    3. check if primaryAgent.converse === false, then updateAgent({...agent, moment: response, converse: true}) for the discussion replay to begin
   *    4. add the agent response to the conversations += reponse;
   *
   *    5. updateAgent({...agent, moment: `Goodbye, ${primaryAgent.name}`}) and similar for the primaryAgent
   *    6. get path for agent to go back to his/her home location using current agent.x & agent.y position and agent.homePosition.x & agent.homePosition.y as destionation for pathfinder
   *    7. give the path to moveAgent()
   *    8. check the agentList,
   *       if agentList has another agent to find and discuss the idea with then repeat the process
   *       else, move the final phase which breaks out of the discussion loop
   *
   *
   *  Final Phase:
   *    Initiate final prompt using: const finalSpeech = initialPrompt + primaryAgentInitialIdea + moment.finalPrompt.instruction + moment.finalPrompt.context
   *
   *    Choose a random place to give the speech, let finalLocation = randomSpace()
   *    For each agent, including the primaryAgent, use this finalLocation {x, y} + and - for each agent on their destionation {x , y} to spread them out
   *    and get them moving by using the moveAgent() function.
   *
   *    Once all agents have reached the location:
   *    updateAgent({...primaryAgent, moment: finalSpeech}), which initiates the primaryAgent speech bubble to begin giving the speech
   *    updateMoment(agent, conversation)
   *
   *    when primaryAgent is done, begin a random selection of each agent to send them back to their agent.homePosition
   *       using pathfinder and moveAgent() functions.
   */
};
