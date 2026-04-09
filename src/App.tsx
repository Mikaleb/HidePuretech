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
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import { AppState } from "./types/state";
import FooterApp from "./FooterApp";
import { initialState } from "./store/initialState";

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
            <Container key={motor.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
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
              {motor.isCustom && (
                <IconButton 
                  size="small" 
                  onClick={() => this.handleRemoveMotor(motor.title)}
                  aria-label="delete"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Container>
          ))}

          <Box style={{ display: 'flex', gap: '8px', marginTop: '16px', marginBottom: '16px', alignItems: 'center', padding: '0 16px', width: '100%' }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder={browser.i18n.getMessage("add") || "Add"}
              value={this.state.customMotorInput || ""}
              onChange={(e) => this.setState({ customMotorInput: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') this.handleAddMotor();
              }}
              style={{ flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={this.handleAddMotor}
              disabled={!this.state.customMotorInput?.trim()}
              style={{ minWidth: '40px', padding: '6px 12px' }}
            >
              +
            </Button>
          </Box>
        </Container>

        <FooterApp />
      </div>
    );
  }
}

export default App;
