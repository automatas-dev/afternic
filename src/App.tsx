import {useEffect, useState} from "react";
import {getCurrentTabUId, getCurrentTabUrl} from "./utils";
import {ChromeMessage, Sender} from "./types";

function App() {
    const [color, setColor] = useState('red');
    const [url, setUrl] = useState<string>("");
    const [responseFromContent, setResponseFromContent] = useState<string>("");

    /**
     * Get current URL
     */
    useEffect(() => {
        getCurrentTabUrl((url) => {
            setUrl(url || "undefined");
        });
    }, []);

    const sendTestMessage = () => {
        const message: ChromeMessage = {
            from: Sender.React,
            message: "Hello from React",
        };

        getCurrentTabUId((id) => {
            if (id) {
                chrome.tabs.sendMessage(id, message, (responseFromContentScript) => {
                    setResponseFromContent(responseFromContentScript);
                });
            }
        });
    };

    const sendRemoveMessage = () => {
        const message: ChromeMessage = {
            from: Sender.React,
            message: "delete logo",
        };

        getCurrentTabUId((id) => {
            if (id) {
                chrome.tabs.sendMessage(id, message, (response) => {
                    setResponseFromContent(response);
                });
            }
        });
    };

    const onClick = async () => {
        const [tab] = await chrome.tabs.query({active: true});

        await chrome.scripting.executeScript<string[], void>({
            target: {tabId: tab.id!},
            args: [color],
            func: (color) => {
                document.body.style.backgroundColor = color;
            },
        });
    }

    return (
        <>
            <div
                className="bg-gray-100 p-5 min-h-screen">  {/* Apply a light gray background and padding to the container */}
                <p className="text-xl font-semibold">Home</p> {/* Larger text and semi-bold */}
                <p>URL:</p>
                <p className="mb-4">{url}</p> {/* Margin-bottom for spacing */}
                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-2"
                        onClick={sendTestMessage}>
                    SEND MESSAGE
                </button>
                <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                        onClick={sendRemoveMessage}>
                    Remove logo
                </button>
                <p className="mt-4">Response from content:</p>
                <p>{responseFromContent}</p>
                <input type="color" onChange={event => setColor(event.currentTarget.value)} className="mb-4"/>
                <button onClick={onClick} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                    Click Here nowwww!
                </button>
            </div>
        </>
    )
}

export default App
