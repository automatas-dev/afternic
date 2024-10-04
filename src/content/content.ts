import {ChromeMessage, Sender} from "@/types";
import sendKeys from "./jquery"

type MessageResponse = (response: string) => void;

const validateSender = (
    message: ChromeMessage,
    sender: chrome.runtime.MessageSender
) => {
    return sender.id === chrome.runtime.id && message.from === Sender.React;
};

function submitDomains(domains: string[]) {
    const targetNode = document.querySelector("#page-container > div") as HTMLElement | null;

    if (targetNode) {
        const config: MutationObserverInit = {
            childList: true,
            subtree: true
        };

        // Create a MutationObserver instance
        const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
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

                                        observer.disconnect();
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
        });

        observer.observe(targetNode, config);
    } else {
        console.error("Target node not found.");
    }

    const submitButton = document.querySelector('[data-testid="add-submit"]') as HTMLButtonElement | null;
    const textarea = document.getElementById("domains") as HTMLTextAreaElement | null;

    if (textarea) {
        sendKeys(textarea, domains!.join("\n"));
    } else {
        console.error("Textarea with id 'domains' not found.");
    }

    if (submitButton) {
        submitButton.click();
    } else {
        console.error("Submit button with data-testid 'add-submit' not found.");
    }
}

const messagesFromReactAppListener = (
    message: ChromeMessage,
    sender: chrome.runtime.MessageSender,
    response: MessageResponse
) => {
    const isValidated = validateSender(message, sender);

    if (isValidated && message.message === "Submit") {
        submitDomains(message!.data!.domains!);

        response("Hello from content.js");
    } else if (isValidated && message.message === "RouteChanged") {
        console.log(message.data!.route);
        if (message.data!.route?.includes("add/done")) {
            const addDomainsLink: HTMLAnchorElement | null = document.querySelector('a[href="/domains/add"]');
            if (addDomainsLink) {
                addDomainsLink.click();
            } else {
                console.error('Add Domains link not found');
            }
        }

        response("Redirected");
    }
};

const main = () => {
    console.log("[content.ts] Main");
    /**
     * Fired when a message is sent from either an extension process or a content script.
     */
    chrome.runtime.onMessage.addListener(messagesFromReactAppListener);

    chrome.storage.local.get(["domains"], async items => {
        const domainList = items.domains;
        console.log(items)

        let currentData: string[]
        if (domainList.length != 0 && domainList.length <= 50) {
            currentData = domainList;
            chrome.storage.local.set({domains: []});
        } else {
            currentData = domainList.slice(0, 50);
            chrome.storage.local.set({domains: domainList.slice(50)});
        }

        if (currentData.length != 0) {
            setTimeout(() => {
                submitDomains(currentData)
            }, 1000)
        } else {
            console.log("No domains to submit");
        }
    })
};

main();
