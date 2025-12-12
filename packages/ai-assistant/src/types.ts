/** AI Assistant context types */

export interface AiMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface AiCapability {
  /** Unique identifier for this capability */
  id: string;
  /** Display name */
  name: string;
  /** Description shown to users */
  description: string;
  /** Icon name from lucide-react */
  icon: string;
  /** Placeholder text for the input */
  placeholder: string;
  /** Handler called when user submits input */
  onSubmit: (input: string) => Promise<AiCapabilityResult>;
}

export interface AiCapabilityResult {
  success: boolean;
  message: string;
  /** Optional data to pass back to the app */
  data?: Record<string, unknown>;
}

export interface AiAssistantConfig {
  /** Initial open state */
  defaultOpen?: boolean;
  /** Position on screen */
  position?: "bottom-right" | "bottom-left";
  /** Available capabilities */
  capabilities: AiCapability[];
  /** Default capability ID */
  defaultCapability?: string;
}

export interface AiAssistantContextValue {
  /** Whether the assistant panel is open */
  isOpen: boolean;
  /** Open the assistant */
  open: () => void;
  /** Close the assistant */
  close: () => void;
  /** Toggle the assistant */
  toggle: () => void;
  /** Current messages */
  messages: AiMessage[];
  /** Add a message */
  addMessage: (message: Omit<AiMessage, "id" | "timestamp">) => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Current active capability */
  activeCapability: AiCapability | null;
  /** Set the active capability */
  setActiveCapability: (id: string) => void;
  /** All registered capabilities */
  capabilities: AiCapability[];
  /** Register a new capability */
  registerCapability: (capability: AiCapability) => void;
  /** Unregister a capability */
  unregisterCapability: (id: string) => void;
  /** Whether the assistant is currently processing */
  isProcessing: boolean;
}
