import { DebugMessage } from "./debugging/types";
import { CodePayload, Query } from "@/app/types/chat";
import { v4 as uuidv4 } from "uuid";
import { DecisionTreeNode } from "../types/objects";

export type TreeUpdatePayload = {
  node: string;
  decision: string;
  tree_index: number;
  reasoning: string;
  reset: boolean;
};

export type FeedbackMetadata = {
  total_feedback: number;
  feedback_by_value?: {
    positive: number;
    negative: number;
    superpositive: number;
  };
  feedback_by_date: {
    [key: string]: {
      mean: number;
      count: number;
      positive: number;
      negative: number;
      superpositive: number;
    };
  };
};

export type QueryStats = {
  mean: number;
  maximum: number;
  minimum: number;
};

export type Feedback = {
  properties: { [key: string]: string };
  items: FeedbackItem[];
  error: string;
};

export type FeedbackItem = {
  conversation_history: DebugMessage[];
  route: string[];
  user_prompt: string;
  conversation_id: string;
  tasks_completed: TaskCompleted[];
  complex_lm_used: string;
  query_id: string;
  feedback: number;
  feedback_date: string;
  user_id: string;
  action_information: Action[];
  base_lm_used: string;
  current_message: string;
  time_taken_seconds: number;
  initialisation: string;
};

export type Action = {
  collection_name: string;
  action_name: string;
  return_type: string;
  output_type: string;
  code: CodePayload;
};

export type TaskCompleted = {
  prompt: string;
  task: Task[];
};

export type Task = {
  todo: string;
  count: number;
  extra_string: string;
  reasoning: string;
  task: string;
  action: boolean;
};

export type UserLimitResponse = {
  num_requests: number;
  max_requests: number;
};

export type Conversation = {
  enabled_collections: { [key: string]: boolean };
  id: string;
  name: string;
  tree_updates: TreeUpdatePayload[];
  tree: DecisionTreeNode[];
  base_tree: DecisionTreeNode | null;
  queries: { [key: string]: Query };
  current: string;
  timestamp: Date;
  initialized: boolean;
  error: boolean;
};

export const initialConversation: Conversation = {
  id: uuidv4(),
  name: "Nuova conversazione",
  error: false,
  tree_updates: [],
  timestamp: new Date(),
  enabled_collections: {},
  tree: [],
  base_tree: null,
  current: "",
  queries: {},
  initialized: false,
};

// example_prompts removed — starter questions are now generated dynamically from
// the user's actual collections in CollectionContext.getRandomPrompts().
