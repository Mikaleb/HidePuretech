import { useState } from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import PublicIcon from "@mui/icons-material/Public";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import { AppState } from "../types/state";

declare const browser: any;

interface Props {
  websites: AppState["websites"];
  loading: boolean;
  onToggle: (site: AppState["websites"][0]) => void;
}

export const WebsiteList = ({ websites, loading, onToggle }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={{ p: 2, pt: 0, pb: 4 }}>
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
          <PublicIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ m: 0, flexGrow: 1 }}>
            {browser.i18n.getMessage("instructions")}
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
            {websites.map((site) => (
              <ListItem 
                key={site.title}
                sx={{ py: 1, px: 2, borderBottom: "1px solid", borderColor: "divider", '&:last-child': { borderBottom: 0 } }}
              >
                <ListItemText primary={site.title} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                <Switch
                  edge="end"
                  checked={site.active}
                  disabled={loading}
                  onChange={() => !loading && onToggle(site)}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Paper>
    </Box>
  );
};
