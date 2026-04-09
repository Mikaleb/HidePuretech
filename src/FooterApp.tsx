import Box from "@mui/material/Box";
import { Button, IconButton, Stack, Typography } from "@mui/material";

import GitHubIcon from "@mui/icons-material/GitHub";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

declare const browser: any;

export default function SimpleBottomNavigation() {
  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        fontSize: "0.8em",
        padding: "0.5em 1em",
        borderTop: "1px solid",
        borderColor: "divider"
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 3, sm: 1 }}
        sx={{ alignItems: "center" }}
      >
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ alignItems: "center", flexGrow: 1 }}
        >
          <Button
            size="small"
            href="https://ko-fi.com/mikaleb"
            target="_blank"
            rel="noopener"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            <FavoriteBorderIcon
              fontSize="small"
              style={{ marginRight: "0.3em" }}
            />
            {browser.i18n.getMessage("support")}
          </Button>

          <Typography sx={{ color: "text.disabled", fontSize: 13, opacity: 0.7 }}>
            &bull;
          </Typography>

          <IconButton
            target="_blank"
            rel="noopener"
            href="https://github.com/Mikaleb/HidePuretech"
            aria-label="github"
            title="GitHub"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
