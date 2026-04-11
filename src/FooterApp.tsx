import Box from "@mui/material/Box";
import { Button, IconButton, Stack, Typography } from "@mui/material";

import GitHubIcon from "@mui/icons-material/GitHub";
import AgenceVolcanLogo from "./assets/agencevolcan.png";

declare const browser: any;

export default function SimpleBottomNavigation() {
  return (
    <Box
      sx={{
        bgcolor: "action.hover",
        fontSize: "0.8em",
        padding: "0.5em 1em",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <IconButton
          target="_blank"
          rel="noopener"
          href="https://github.com/Mikaleb/LeCacheMisere"
          aria-label="github"
          title="GitHub"
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <GitHubIcon fontSize="small" />
        </IconButton>

        <Typography sx={{ color: "text.disabled", fontSize: 13, opacity: 0.7 }}>
          &bull;
        </Typography>

        <Button
          size="small"
          href="https://github.com/Mikaleb/LeCacheMisere/blob/main/PRIVACY.md"
          target="_blank"
          rel="noopener"
          sx={{
            textTransform: "none",
            color: "text.secondary",
            fontWeight: 600,
            fontSize: "11px",
            padding: "4px 8px",
            "&:hover": { color: "primary.main" },
          }}
        >
          {browser.i18n.getMessage("privacyLink")}
        </Button>

        <Typography sx={{ color: "text.disabled", fontSize: 13, opacity: 0.5 }}>
          &bull;
        </Typography>

        <Button
          size="small"
          href="https://agencevolcan.dev/"
          target="_blank"
          rel="noopener"
          sx={{
            textTransform: "none",
            color: "text.secondary",
            fontWeight: 600,
            padding: "4px 8px",
            minWidth: 0,
            "&:hover": { color: "primary.main" },
          }}
        >
          <Box
            component="img"
            src={AgenceVolcanLogo}
            alt="Agence Volcan"
            sx={{
              height: 14,
              filter: "grayscale(1) opacity(0.7)",
              transition: "all 0.2s",
              "&:hover": { filter: "none", opacity: 1 },
            }}
          />
        </Button>
      </Stack>
    </Box>
  );
}
