import { useState } from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
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
  const [expanded, setExpanded] = useState(true);

  return (
    <Box sx={{ p: 2, pt: 1 }}>
      <Paper elevation={0} sx={{ overflow: "hidden", border: '1px solid', borderColor: 'divider' }}>
        <Box 
          onClick={() => setExpanded(!expanded)}
          sx={{ 
            px: 2, 
            py: 1, 
            display: "flex", 
            alignItems: "center", 
            gap: 1, 
            borderBottom: expanded ? "1px solid" : "0", 
            borderColor: "divider", 
            bgcolor: 'action.hover',
            cursor: 'pointer',
            transition: 'border-bottom 0.2s',
            '&:hover': {
              bgcolor: 'action.selected'
            }
          }}
        >
          <TuneIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ m: 0, flexGrow: 1 }}>
            {browser.i18n.getMessage("motors")}
          </Typography>
          <IconButton 
            size="small" 
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s'
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {motors.map((motor) => (
              <ListItem 
                key={motor.title}
                sx={{ py: 1, px: 2, borderBottom: "1px solid", borderColor: "divider" }}
                secondaryAction={
                  motor.isCustom && (
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={() => onRemove(motor.title)}
                      aria-label="delete"
                      color="error"
                      sx={{ ml: 1, opacity: 0.8 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemText primary={motor.title} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                <Switch
                  edge={motor.isCustom ? undefined : "end"}
                  checked={motor.active}
                  disabled={loading}
                  onChange={() => !loading && onToggle(motor)}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ p: 1.5, display: "flex", gap: 1, bgcolor: 'background.default' }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder={browser.i18n.getMessage("add") || "Add"}
              value={customMotorInput || ""}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAdd();
              }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                  borderRadius: 2
                }
              }}
            />
            <IconButton 
              color="primary" 
              onClick={onAdd}
              disabled={!customMotorInput?.trim()}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText',
                borderRadius: 2,
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};
