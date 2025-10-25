// message-manager.ts

export type MessageType = "info" | "success" | "danger" | "special";

export interface GameMessage {
  id: string;
  text: string;
  type: MessageType;
  timestamp: Date;
}

export class MessageManager {
  private messages: GameMessage[] = [];
  private listeners: Set<(messages: GameMessage[]) => void> = new Set();
  private messageIdCounter = 0;
  private maxMessages = 50;

  subscribe(callback: (messages: GameMessage[]) => void) {
    this.listeners.add(callback);
    callback(this.messages);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((callback) => callback([...this.messages]));
  }

  post(text: string, type: MessageType = "info") {
    const message: GameMessage = {
      id: `msg-${this.messageIdCounter++}-${Date.now()}`,
      text,
      type,
      timestamp: new Date(),
    };

    this.messages.push(message);

    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    this.notify();
    return message.id;
  }

  clear() {
    this.messages = [];
    this.notify();
  }

  getMessages() {
    return [...this.messages];
  }

  setMaxMessages(max: number) {
    this.maxMessages = max;
    if (this.messages.length > max) {
      this.messages = this.messages.slice(-max);
      this.notify();
    }
  }
}
