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
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

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
    this.getStateFromKey("hideCompletely");
    this.getStateFromKey("showPlaceholderIcon");
    this.getStateFromKey("showBadgeCount");
    this.getStateFromKey("hasConsented");
  }

  componentDidMount() {
    this.refreshHiddenCount();
  }

  refreshHiddenCount = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      try {
        const response = await browser.tabs.sendMessage(tab.id, { action: "getHiddenCount" });
        if (response && response.count !== undefined) {
          this.setState({ currentTabHiddenCount: response.count });
        }
      } catch (e) {
        // Content script might not be injected or site not supported
        console.log("Could not get hidden count", e);
      }
    }
  };

  toggleHideCompletely = () => {
    this.setState((prevState) => {
      const hideCompletely = !prevState.hideCompletely;
      chrome.storage.sync.set({ hideCompletely });
      this.sendMessageToContentScript({ hideCompletely });
      return { hideCompletely } as AppState & { customMotorInput: string };
    });
  };

  toggleShowPlaceholderIcon = () => {
    this.setState((prevState) => {
      const showPlaceholderIcon = !prevState.showPlaceholderIcon;
      chrome.storage.sync.set({ showPlaceholderIcon });
      this.sendMessageToContentScript({ showPlaceholderIcon });
      return { showPlaceholderIcon } as AppState & { customMotorInput: string };
    });
  };
 
  toggleShowBadgeCount = () => {
    this.setState((prevState) => {
      const showBadgeCount = !prevState.showBadgeCount;
      chrome.storage.sync.set({ showBadgeCount });
      this.sendMessageToContentScript({ showBadgeCount });
      return { showBadgeCount } as AppState & { customMotorInput: string };
    });
  };

  handleConsent = () => {
    const hasConsented = true;
    chrome.storage.sync.set({ hasConsented });
    this.setState({ hasConsented } as AppState & { customMotorInput: string });
    this.sendMessageToContentScript({ hasConsented });
  };

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
        website.title === site.title ? updatedSite : website,
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
        m.title === motor.title ? { ...m, active: !m.active } : m,
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
      if (
        prevState.motors.some(
          (m) => m.title.toLowerCase() === title.toLowerCase(),
        )
      ) {
        return { customMotorInput: "" } as AppState & {
          customMotorInput: string;
        };
      }
      const newMotor = {
        title,
        active: true,
        pattern: title.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"),
        isCustom: true,
      };
      const motors = [...prevState.motors, newMotor];
      chrome.storage.sync.set({ motors });
      this.sendMessageToContentScript({ motors, websites: prevState.websites });
      return { motors, customMotorInput: "" } as AppState & {
        customMotorInput: string;
      };
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
    if (this.state.hasConsented === false) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            bgcolor: "background.default",
            p: 3,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            {browser.i18n.getMessage("privacyTitle")}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary", px: 1 }}>
            {browser.i18n.getMessage("privacyDescription")}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              textAlign: "left",
            }}
          >
            <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 600 }}>
              • {browser.i18n.getMessage("privacyPoint1")}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 600 }}>
              • {browser.i18n.getMessage("privacyPoint2")}
            </Typography>
            <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
              • {browser.i18n.getMessage("privacyPoint3")}
            </Typography>
          </Paper>
          
          <Button
            href="https://github.com/Mikaleb/LeCacheMisere/blob/main/PRIVACY.md"
            target="_blank"
            rel="noopener"
            sx={{
              mb: 4,
              textTransform: "none",
              textDecoration: "underline",
              color: "primary.main",
              fontSize: "0.85rem"
            }}
          >
            {browser.i18n.getMessage("privacyLink")}
          </Button>

          <Box sx={{ mt: "auto" }}>
            <Box
              component="button"
              onClick={this.handleConsent}
              sx={{
                width: "100%",
                py: 1.5,
                bgcolor: "primary.main",
                color: "white",
                border: "none",
                borderRadius: 1,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "background-color 0.2s",
                "&:hover": { bgcolor: "primary.dark" },
                mb: 2
              }}
            >
              {browser.i18n.getMessage("acceptAndContinue")}
            </Box>
            <FooterApp />
          </Box>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ px: 2, pt: 3, pb: 1, textAlign: "center" }}>
          <Typography
            variant="h5"
            className="title"
            color="text.primary"
            sx={{ fontWeight: "bold", mb: 0 }}
          >
            {browser.i18n.getMessage("brand")}
          </Typography>
          {this.state.currentTabHiddenCount !== undefined && this.state.currentTabHiddenCount > 0 && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                bgcolor: "error.main",
                color: "white",
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                mt: 1,
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                {this.state.currentTabHiddenCount} {browser.i18n.getMessage("adsHiddenOnThisPage")}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ px: 2, pb: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <VisibilityOffIcon color="primary" fontSize="small" />
            <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
              {browser.i18n.getMessage("hideCompletely")}
            </Typography>
            <Switch
              size="small"
              checked={this.state.hideCompletely}
              onChange={this.toggleHideCompletely}
            />
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mt: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <img
              src="public/favicon-16x16.png"
              style={{ width: 16, height: 16, opacity: 0.7 }}
              alt=""
            />
            <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
              {browser.i18n.getMessage("showPlaceholderIcon")}
            </Typography>
            <Switch
              size="small"
              checked={this.state.showPlaceholderIcon}
              onChange={this.toggleShowPlaceholderIcon}
            />
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mt: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 10,
                fontWeight: "bold",
                opacity: 0.7,
              }}
            >
              1
            </Box>
            <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
              {browser.i18n.getMessage("showBadgeCount")}
            </Typography>
            <Switch
              size="small"
              checked={this.state.showBadgeCount}
              onChange={this.toggleShowBadgeCount}
            />
          </Paper>
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

        <WebsiteList
          websites={this.state.websites}
          loading={this.state.loading}
          onToggle={this.toggleWebsiteStatus}
        />

        <Box sx={{ mt: "auto" }}>
          <FooterApp />
        </Box>
      </Box>
    );
  }
}

export default App;
