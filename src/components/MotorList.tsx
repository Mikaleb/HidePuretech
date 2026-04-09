import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import { AppState } from "../types/state";

declare const browser: any;

interface Props {
  motors: AppState["motors"];
  loading: boolean;
  customMotorInput: string;
  onToggle: (motor: AppState["motors"][0]) => void;
  onRemove: (motorTitle: string) => void;
  onAdd: () => void;
  onInputChange: (value: string) => void;
}

export const MotorList = ({
  motors,
  loading,
  customMotorInput,
  onToggle,
  onRemove,
  onAdd,
  onInputChange,
}: Props) => {
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
        style={{ padding: "0.8em 1em" }}
        className="info"
      >
        {browser.i18n.getMessage("motors")}
      </Typography>

      {motors.map((motor) => (
        <Container
          key={motor.title}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 0,
          }}
        >
          <FormGroup>
            <FormControlLabel
              label={motor.title}
              control={
                <Switch
                  value={motor.active ? "on" : "off"}
                  checked={motor.active}
                  disabled={loading !== false}
                  onChange={() => {
                    if (loading === false) {
                      onToggle(motor);
                    }
                  }}
                />
              }
            />
          </FormGroup>
          {motor.isCustom && (
            <IconButton
              size="small"
              onClick={() => onRemove(motor.title)}
              aria-label="delete"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Container>
      ))}

      <Box
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "16px",
          marginBottom: "16px",
          alignItems: "center",
          padding: "0 16px",
          width: "100%",
        }}
      >
        <TextField
          size="small"
          variant="outlined"
          placeholder={browser.i18n.getMessage("add") || "Add"}
          value={customMotorInput || ""}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAdd();
          }}
          style={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          onClick={onAdd}
          disabled={!customMotorInput?.trim()}
          style={{ minWidth: "40px", padding: "6px 12px" }}
        >
          +
        </Button>
      </Box>
    </Container>
  );
};
