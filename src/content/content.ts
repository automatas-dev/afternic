import { ChromeMessage, Sender } from "@/types";

type MessageResponse = (response?: any) => void;

const validateSender = (
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender
) => {
  return sender.id === chrome.runtime.id && message.from === Sender.React;
};

const messagesFromReactAppListener = (
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender,
  response: MessageResponse
) => {
  const isValidated = validateSender(message, sender);

  if (isValidated && message.message === "Submit") {
    const form = document.querySelector('[data-testid="add-domains-form"]') as HTMLFormElement | null;
    const textarea = document.getElementById("domains") as HTMLTextAreaElement | null;

    // TODO: issue here
    if (textarea) {
      textarea.innerHTML = message.data.domains!.join("\n"); // Join domains by new line
    } else {
      console.error("Textarea with id 'domains' not found.");
    }

    // if (form) {
    //   form.submit();
    // } else {
    //   console.error("Form not found.");
    // }

    response("Hello from content.js");
  }

  if (isValidated && message.message === "delete logo") {
    const logo = document.getElementById("hplogo");
    logo?.parentElement?.removeChild(logo);
  }
};

const main = () => {
  console.log("[content.ts] Main");
  /**
   * Fired when a message is sent from either an extension process or a content script.
   */
  chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
};

main();
