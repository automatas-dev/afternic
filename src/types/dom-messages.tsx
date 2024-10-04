enum Sender {
  React,
  Content,
}

interface ChromeMessage {
  from: Sender;
  message: string;
  data?: {
    domains?: string[];
    route?: string;
  }
}

export type { ChromeMessage };
export { Sender };
