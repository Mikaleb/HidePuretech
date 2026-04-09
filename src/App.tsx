/* global chrome  */
declare const chrome: any;

import { Component } from "react";
import "./App.scss";

import Box from "@mui/material/Box";

import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { AppState } from "./types/state";
import FooterApp from "./FooterApp";
import { initialState } from "./store/initialState";

declare const browser: any;

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    this.state = initialState;

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
      return { motors };
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

          <Container
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            maxWidth="xs"
          >
            <Typography
              align="left"
              variant="subtitle2"
              style={{
                padding: "0.8em 1em",
              }}
              className="info"
            >
              {browser.i18n.getMessage("instructions")}
            </Typography>

            {this.state.websites.map((site, _index) => (
              <Container key={site.title}>
                <FormGroup>
                  <FormControlLabel
                    label={site.title}
                    control={
                      <Switch
                        id="airplane-mode"
                        value={site.active ? "on" : "off"}
                        checked={site.active}
                        disabled={this.state.loading !== false}
                        onChange={() => {
                          if (this.state.loading === false) {
                            this.toggleWebsiteStatus(site);
                          }
                        }}
                      ></Switch>
                    }
                  />
                </FormGroup>
              </Container>
            ))}
          </Container>
        </Box>

        <Container
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          maxWidth="xs"
        >
          <Typography
            align="left"
            variant="subtitle2"
            style={{ padding: "0.8em 1em" }}
            className="info"
          >
            {browser.i18n.getMessage("motors")}
          </Typography>

          {this.state.motors.map((motor) => (
            <Container key={motor.title}>
              <FormGroup>
                <FormControlLabel
                  label={motor.title}
                  control={
                    <Switch
                      value={motor.active ? "on" : "off"}
                      checked={motor.active}
                      disabled={this.state.loading !== false}
                      onChange={() => {
                        if (this.state.loading === false) {
                          this.toggleMotorStatus(motor);
                        }
                      }}
                    />
                  }
                />
              </FormGroup>
            </Container>
          ))}
        </Container>

        <FooterApp />
      </div>
    );
  }
}

export default App;
