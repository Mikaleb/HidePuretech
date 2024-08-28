/* global chrome  */
declare const chrome: any;

import { Component } from "react";
import "./App.css";
import { Box, Flex, Heading, Separator } from "@radix-ui/themes";
import { AppState } from "./types/state";

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      isOn: false,
      motors: [],
      websites: [
        {
          title: "lacentrale.fr",
          url: "https://*.lacentrale.fr/listing?*",
          active: true,
        },
      ],
    };

    this.getStateFromKey("isOn");
    // this.getStateFromKey("newMotor");
    // this.getStateFromKey("motors");
    // this.getStateFromKey("websites");
  }

  sendMessageToContentScript = async () => {
    // get all tabs and send message to all tabs
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab: any) => {
      chrome.tabs.sendMessage(tab.id, this.state, (response: any) => {
        console.log("Response from content script:", response);
      });
    });
  };

  toggleActivated = () => {
    chrome.storage.sync.get("isOn", (results: { isOn: any }) => {
      if (results.isOn) {
        chrome.storage.sync.set({ isOn: false });
        this.setState({
          isOn: false,
        });
      } else {
        chrome.storage.sync.set({ isOn: true });
        this.setState({
          isOn: true,
        });
      }
      this.sendMessageToContentScript();
    });
  };

  getStateFromKey = (value: string | number) => {
    chrome.storage.sync.get(value, (results: { [x: string]: any }) => {
      if (results && this.state) {
        this.setState({
          ...results,
        });
      }
    });
  };

  render() {
    return (
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          minWidth: "10em",
        }}
      >
        <Heading>Settings</Heading>
        <Flex as="span" gap="2">
          <button
            onClick={this.toggleActivated}
            style={{
              boxShadow: this.state.isOn
                ? "inset 20px 20px 60px #bebebe,inset -20px -20px 60px #ffffff"
                : "20px 20px 60px #bebebe,-20px -20px 60px #ffffff",
            }}
            className="skeue--button"
          >
            <div
              className={`skeue--button__light ${
                this.state.isOn
                  ? "skeue--button__light--on"
                  : "skeue--button__light--off"
              }`}
            ></div>

            <p
              style={{
                textTransform: "uppercase",
              }}
            >
              {this.state.isOn
                ? chrome.i18n.getMessage("isOn")
                : chrome.i18n.getMessage("isOff")}
            </p>
          </button>
        </Flex>
        <Separator decorative style={{ margin: "1em 0em" }} />
        AAAAA
      </Box>
    );
  }
}

export default App;
