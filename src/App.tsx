/* global chrome  */
declare const chrome: any;

import { Component } from "react";
import "./App.scss";

import Box from "@mui/material/Box";

import Typography from "@mui/material/Typography";

import { AppState } from "./types/state";
import FooterApp from "./FooterApp";
import { initialState } from "./store/initialState";

import { WebsiteList } from "./components/WebsiteList";
import { MotorList } from "./components/MotorList";

declare const browser: any;

class App extends Component<{}, AppState & { customMotorInput: string }> {
  constructor(props: {}) {
    super(props);

    this.state = {
      ...initialState,
      customMotorInput: "",
    };

    this.getStateFromKey("loading");
    this.getStateFromKey("websites");
    this.getStateFromKey("newMotor");
    this.getStateFromKey("motors");
  }

  sendMessageToContentScript = async (newState: Partial<AppState>) => {
    // send it to each tabs that match the content_scripts, and active (no need to wake up sleeping tabs)

    const urlPatterns = newState.websites
      ? newState.websites.map((w) => w.url)
      : this.state.websites.map((w) => w.url);
    const tabs = await chrome.tabs.query({ url: urlPatterns });

    tabs.forEach((tab: any) => {
      if (!tab.id || tab.id === undefined) return;
      browser.tabs.sendMessage(tab.id, newState).catch(() => {});
    });
  };

  toggleWebsiteStatus = (site: AppState["websites"][0]) => {
    this.setState({ loading: true });

    this.setState((prevState) => {
      const updatedSite = { ...site, active: !site.active };
      const websites = prevState.websites.map((website) =>
        website.title === site.title ? updatedSite : website
      );

      chrome.storage.sync.set({ websites });
      if (updatedSite) {
        this.sendMessageToContentScript({ websites: [updatedSite] });
      }

      return { websites };
    });
    this.setState({ loading: false });
  };

  toggleMotorStatus = (motor: AppState["motors"][0]) => {
    this.setState((prevState) => {
      const motors = prevState.motors.map((m) =>
        m.title === motor.title ? { ...m, active: !m.active } : m
      );
      chrome.storage.sync.set({ motors });
      this.sendMessageToContentScript({ motors, websites: prevState.websites });
      return { motors } as AppState & { customMotorInput: string };
    });
  };

  handleRemoveMotor = (motorTitle: string) => {
    this.setState((prevState) => {
      const motors = prevState.motors.filter((m) => m.title !== motorTitle);
      chrome.storage.sync.set({ motors });
      this.sendMessageToContentScript({ motors, websites: prevState.websites });
      return { motors } as AppState & { customMotorInput: string };
    });
  };

  handleAddMotor = () => {
    const title = this.state.customMotorInput.trim();
    if (!title) return;
    
    this.setState((prevState) => {
      if (prevState.motors.some(m => m.title.toLowerCase() === title.toLowerCase())) {
        return { customMotorInput: "" } as AppState & { customMotorInput: string };
      }
      const newMotor = {
        title,
        active: true,
        pattern: title.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'),
        isCustom: true,
      };
      const motors = [...prevState.motors, newMotor];
      chrome.storage.sync.set({ motors });
      this.sendMessageToContentScript({ motors, websites: prevState.websites });
      return { motors, customMotorInput: "" } as AppState & { customMotorInput: string };
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
            padding: "0.5rem",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            style={{
              padding: "0.3em 1em",
            }}
            className="title"
          >
            {browser.i18n.getMessage("brand")}
          </Typography>

          <WebsiteList
            websites={this.state.websites}
            loading={this.state.loading}
            onToggle={this.toggleWebsiteStatus}
          />
        </Box>

        <MotorList
          motors={this.state.motors}
          loading={this.state.loading}
          customMotorInput={this.state.customMotorInput}
          onToggle={this.toggleMotorStatus}
          onRemove={this.handleRemoveMotor}
          onAdd={this.handleAddMotor}
          onInputChange={(val) => this.setState({ customMotorInput: val })}
        />

        <FooterApp />
      </div>
    );
  }
}

export default App;
