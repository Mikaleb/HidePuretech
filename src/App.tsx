/* global chrome  */
declare const chrome: any;

import { Component } from "react";
import "./App.scss";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { AppState } from "./types/state";
import FooterApp from "./FooterApp";

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
          ...(results as AppState),
        });
      }
    });
  };

  render() {
    return (
      <div>
        <Box
          style={{
            padding: "1rem",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            style={{
              padding: "0em 1em",
            }}
            className="title"
          >
            {chrome.i18n.getMessage("settings")}
          </Typography>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            margin={"1.3em 0em"}
          >
            <button
              onClick={this.toggleActivated}
              className={`skeue--button skeue--button${
                this.state.isOn ? "__isOn" : "__isOff"
              }`}
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
          </Box>
          <Divider style={{ margin: "1em 0em" }} />

          <Container
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {this.state.websites.map((site, index) => (
              <Container key={index}>
                <FormGroup>
                  <FormControlLabel
                    label={site.title}
                    control={
                      <Switch
                        id="airplane-mode"
                        value={site.active ? "on" : "off"}
                        checked={site.active}
                        onClick={() => {
                          const newWebsites = this.state.websites.map(
                            (website, i) => {
                              if (i === index) {
                                return {
                                  ...website,
                                  active: !website.active,
                                };
                              }
                              return website;
                            }
                          );
                          this.setState({ websites: newWebsites });
                          chrome.storage.sync.set({ websites: newWebsites });
                          this.sendMessageToContentScript();
                        }}
                      ></Switch>
                    }
                  />
                </FormGroup>
              </Container>
            ))}
          </Container>
        </Box>

        <FooterApp />
      </div>
    );
  }
}

export default App;
