import {
  update,
  remove,
  ref,
  push,
  set,
  onDisconnect,
  onValue,
} from "firebase/database";
import { database, auth } from "./firebaseConfig";
import { v4 as uuidv4 } from "uuid";

// Personas for each agent, used to create Firebase agents
import { personas } from "../personas/personas";

// ---------- Firebase Agents ------------

// Called from AuthProvider | Initialize All Agents in Game
export const initializeAgents = async (setAgents, setAgentRefs) => {
  const userId = auth.currentUser.uid;
  const agentsRef = ref(database, `users/${userId}/agents`);

  Object.values(personas).map((agent) => {
    const agentId = uuidv4();
    agent.uid = agentId;

    const agentRef = ref(database, `users/${userId}/agents/${agentId}`);
    set(agentRef, agent);
    setAgents((prev) => [...prev, agent]);
    setAgentRefs((prev) => [...prev, agentRef]);

    // Set up a listener for changes to this agent
    onValue(agentRef, (snapshot) => {
      const updatedAgent = snapshot.val();
      setAgents((prevAgents) => {
        return prevAgents.map((a) => (a.uid === agent.uid ? updatedAgent : a));
      });
    });
  });

  // Remove agent from Firebase when user disconnects
  onDisconnect(agentsRef).remove((error) => {
    if (error) {
      console.error("Unable to remove agent on disconnect");
    }
  });
};

// Update Firebase agent properties
export const updateAgent = async (agent) => {
  const userId = auth.currentUser.uid;
  const agentRef = ref(database, `users/${userId}/agents/${agent.uid}`);
  update(agentRef, agent);
};

// ---------- Firebase Messages ------------

// Called from AuthProvider to retrieve user persisted messages
export const getUserMessages = async (setMessages, setMessageRefs) => {
  const userId = auth.currentUser.uid;
  const messageRefs = ref(database, `users/${userId}/messages`);
  onValue(messageRefs, (snapshot) => {
    const messages = snapshot.val();
    setMessageRefs(messageRefs);
    setMessages(messages);
  });
};

/**
 * The function will add a new message to users Firebase DB. The push() function from Firebase SDK
 * will add a unique identifier for each message.
 * NOTE: 'response' should be filtered before pushing to Firebase. Each AI Model
 * has a unique method of filtering for the response. Add the responseFilter() method
 * in the modelAPI query/response function.
 * @param {string} prompt
 * @param {string} response
 */
export const pushNewMessage = async (prompt, response) => {
  const message = {
    prompt: prompt,
    response: response,
    timestamp: Date.now(),
  };
  const userId = auth.currentUser.uid;
  const messagesRef = ref(database, `users/${userId}/messages`);
  const newMessageRef = push(messagesRef);

  try {
    await set(newMessageRef, message);
    console.log("New Message Pushed to Firebase: ", message);
  } catch (error) {
    console.log("Unable to push new message to Firebase: ", error);
  }
};

/**
 * Given the message id, removes the message from Fireabse
 * @param {number} id of message in Firebase
 */
export const removeMessage = async (id) => {
  const userId = auth.currentUser.uid;
  const messageRef = ref(database, `users/${userId}/messages/${id}`);
  await remove(messageRef);
};

// ---------- Firebase Moments ------------

// Called from AuthProvider to retrieve user persisted moments
/**
 * Retrieve the firebase 'moments', if any
 * @param {useState setter} setMoments 
 */
export const getUserMoments = async (setMoments, setMomentRefs) => {
  const userId = auth.currentUser.uid;
  const momentRefs = ref(database, `users/${userId}/moments`);
  onValue(momentRefs, (snapshot) => {
    const moments = snapshot.val();
    setMomentRefs(momentRefs);
    setMoments(moments);
  });
};

/**
 * Update firebase with a new 'moment' creation
 * @param {string} prompt
 * @param {string} response
 */
export const pushNewMoment = async (prompt, conversation) => {
  console.log("Moment Prompt: ", prompt);
  console.log("Conversation: ", conversation);
  const moment = {
    prompt: prompt,
    response: conversation,
    timestamp: Date.now(),
  };
  const userId = auth.currentUser.uid;
  const momentsRef = ref(database, `users/${userId}/moments`);
  const newMomentsRef = push(momentsRef);

  try {
    await set(newMomentsRef, moment);
    console.log("New Moment Pushed to Firebase: ", moment);
  } catch (error) {
    console.log("Unable to push new moment to Firebase: ", error);
  }
};

/**
 * Using the specific id for the 'moment', remove it from Firebase 
 * @param {uuidv4} id 
 */
export const removeMoment = async (id) => {
  const userId = auth.currentUser.uid;
  const momentsRef = ref(database, `users/${userId}/moments/${id}`);
  await remove(momentsRef);
};

// ---------- Firebase Sidebar ------------

/**
 * Retrieve sidebar properties such as AI Model currently selected 
 * @param {useState Setter} setSidebar 
 */
export const getSidebarProperties = async (setSidebar) => {
  const userId = auth.currentUser.uid;
  const sidebarRefs = ref(database, `users/${userId}/sidebar`);
  onValue(sidebarRefs, (snapshot) => {
    const sidebar = snapshot.val();
    setSidebar(sidebar);
  });
};

/**
 * Expects that the sidebar properties are already set when
 * passed for update. If a property is excluded when passed
 * then it will be removed on update.
 * @param {object} sidebar 
 */
export const updateSidebar = async (sidebar) => {
  const userId = auth.currentUser.uid;
  const sidebarRef = ref(database, `users/${userId}/sidebar`);
  update(sidebarRef, sidebar);
};