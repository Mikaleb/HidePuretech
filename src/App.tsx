/* global chrome  */
declare const chrome: any;

import { Component } from "react";
import "./App.css";
import { Box, Flex, Heading, Separator, Text, Switch } from "@radix-ui/themes";
import * as Label from "@radix-ui/react-label";

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
    this.getStateFromKey("newMotor");
    this.getStateFromKey("motors");
    this.getStateFromKey("websites");
  }

  sendMessageToContentScript = async () => {
    // send it to each tabs that match the content_scripts

    const tabs = await chrome.tabs.query({
      url: this.state.websites.map((website) => website.url),
    });

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

        <Text>Active on:</Text>

        <Flex
          as="span"
          gap="2"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {this.state.websites.map((site, index) => (
            <Flex key={index}>
              <Label.Root className="LabelRoot" htmlFor="firstName">
                {site.title}
              </Label.Root>
              <Switch
                className="SwitchRoot"
                id="airplane-mode"
                value={site.active ? "on" : "off"}
                checked={site.active}
                onClick={() => {
                  const newWebsites = this.state.websites.map((website, i) => {
                    if (i === index) {
                      return {
                        ...website,
                        active: !website.active,
                      };
                    }
                    return website;
                  });
                  this.setState({ websites: newWebsites });
                  chrome.storage.sync.set({ websites: newWebsites });
                  this.sendMessageToContentScript();
                }}
              ></Switch>
            </Flex>
          ))}
        </Flex>
      </Box>
    );
  }
}

export default App;
