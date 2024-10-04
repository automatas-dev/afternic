import {ChromeMessage, Sender} from "@/types";
import sendKeys from "./jquery"

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
        const targetNode = document.querySelector('.grid-layout') as HTMLElement | null;

        if (targetNode) {
            const config: MutationObserverInit = {
                childList: true,
                subtree: true
            };

            const callback: MutationCallback = function (mutationsList: MutationRecord[]) {
                mutationsList.forEach(mutation => {
                    console.log(mutation)
                    if (mutation.type === 'childList') {
                        for (const node of mutation.addedNodes) {
                            if (node instanceof HTMLElement) {
                                if (node.matches('div.review-table.add-domains-table.rs-table[role="grid"]')) {
                                    function deleteElement(row: HTMLSpanElement) {
                                        const parentRow = row.closest('div.rs-table-row') as HTMLElement | null;

                                        if (parentRow) {
                                            const deleteButton = parentRow.querySelector('button[data-testid$="-cell-delete-button"]') as HTMLButtonElement | null;

                                            if (deleteButton) {
                                                deleteButton.click();
                                                console.log('Deleted row with verification needed.');
                                            } else {
                                                console.error('Delete button not found in this row.');
                                            }
                                        } else {
                                            console.error('Parent row not found.');
                                        }
                                    }

                                    const rowsWithVerificationNeeded = document.querySelectorAll('span.ux-text-feedback-critical') as NodeListOf<HTMLSpanElement>;
                                    rowsWithVerificationNeeded.forEach(deleteElement);

                                    const criticalFeedbackElements = document.querySelectorAll<HTMLSpanElement>('span.ux-text-feedback-critical[role="alert"]');
                                    criticalFeedbackElements.forEach(deleteElement);

                                    setTimeout(() => {
                                        const submitButton = document.querySelector('button[data-testid="submit-button"]') as HTMLButtonElement | null;

                                        if (submitButton) {
                                            submitButton.click();

                                            console.log('Submit button clicked');
                                        } else {
                                            console.error('Submit button not found');
                                        }
                                    }, 500);
                                }
                            }
                        }
                    }
                });
            };

            // Create a MutationObserver instance
            const observer = new MutationObserver(callback);

            // Start observing
            observer.observe(targetNode, config);

            // To stop observing (use this line when necessary)
            // observer.disconnect();
        } else {
            console.error("Target node not found.");
        }

        const submitButton = document.querySelector('[data-testid="add-submit"]') as HTMLButtonElement | null;
        const textarea = document.getElementById("domains") as HTMLTextAreaElement | null;

        if (textarea) {
            sendKeys(textarea, message.data.domains!.join("\n"));
        } else {
            console.error("Textarea with id 'domains' not found.");
        }

        if (submitButton) {
            submitButton.click();
        } else {
            console.error("Submit button with data-testid 'add-submit' not found.");
        }

        response("Hello from content.js");
    }
};

const main = () => {
    console.log("[content.ts] Main");
    /**
     * Fired when a message is sent from either an extension process or a content script.
     */
    chrome.runtime.onMessage.addListener(messagesFromReactAppListener);

    // Listen for 'popstate' event (triggers when using back/forward navigation)
    window.addEventListener('popstate', (event) => {
        console.log('Location changed (popstate):', window.location.href);
    });

// Listen for 'hashchange' event (triggers when the URL hash changes)
    window.addEventListener('hashchange', (event) => {
        console.log('Location changed (hashchange):', window.location.href);
    });

// Listen for custom 'locationchange' event (triggers on pushState and replaceState)
    window.addEventListener('locationchange', () => {
        console.log('Location changed (custom event):', window.location.href);
    });
};

main();
