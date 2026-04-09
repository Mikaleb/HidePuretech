import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { AppState } from "../types/state";

declare const browser: any;

interface Props {
  websites: AppState["websites"];
  loading: boolean;
  onToggle: (site: AppState["websites"][0]) => void;
}

export const WebsiteList = ({ websites, loading, onToggle }: Props) => {
  return (
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

      {websites.map((site) => (
        <Container key={site.title}>
          <FormGroup>
            <FormControlLabel
              label={site.title}
              control={
                <Switch
                  id="airplane-mode"
                  value={site.active ? "on" : "off"}
                  checked={site.active}
                  disabled={loading !== false}
                  onChange={() => {
                    if (loading === false) {
                      onToggle(site);
                    }
                  }}
                />
              }
            />
          </FormGroup>
        </Container>
      ))}
    </Container>
  );
};
