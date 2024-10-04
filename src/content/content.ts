import sendKeys from "./jquery.js";

function submitDomains(domains: string[], delay: number, deleteDelay: number) {
  const submitButton = document.querySelector(
    '[data-testid="add-submit"]'
  ) as HTMLButtonElement | null;
  const textarea = document.getElementById(
    "domains"
  ) as HTMLTextAreaElement | null;

  if (textarea) {
    sendKeys(textarea, domains!.join("\n"));
  } else {
    console.error("Textarea with id 'domains' not found.");
  }

  if (submitButton) {
    submitButton.click();
    setTimeout(() => {
      removeInvalidDomains(delay, deleteDelay);
    }, 8000);
  } else {
    console.error("Submit button with data-testid 'add-submit' not found.");
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const removeInvalidDomains = async (delay: number, deleteDelay: number) => {
  let rows = document.querySelectorAll(".rs-table-row");
  while (rows.length == 0) {
    await wait(1000);
    rows = document.querySelectorAll(".rs-table-row");
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[rows.length - 1 - i];
    const problem = row.querySelector(
      ".ux-text.ux-text-caption.ux-text-feedback-critical"
    );
    if (problem) {
      const delButton = row.querySelector(
        "button.ux-text.ux-button.ux-button-square.ux-text-action"
      ) as HTMLButtonElement | null;
      delButton?.click();
      await wait(deleteDelay);
    }
  }

  const submitButton = document.querySelector(
    'button[data-testid="submit-button"]'
  ) as HTMLButtonElement | null;

  submitButton?.click();

  chrome.runtime.sendMessage({ message: "reload", delay: delay });
};

const main = () => {
  chrome.storage.local.get(
    ["domains", "delay", "deleteDelay"],
    async (items) => {
      const domainList = items.domains;
      console.log(items);

      let currentData: string[];
      if (domainList.length != 0 && domainList.length <= 50) {
        currentData = domainList;
        chrome.storage.local.set({ domains: [] });
      } else {
        currentData = domainList.slice(0, 50);
        chrome.storage.local.set({ domains: domainList.slice(50) });
      }

      if (currentData.length != 0) {
        setTimeout(() => {
          submitDomains(
            currentData,
            parseInt(items.delay),
            parseInt(items.deleteDelay)
          );
        }, 1000);
      } else {
        console.log("No domains to submit");
      }
    }
  );
};

main();
