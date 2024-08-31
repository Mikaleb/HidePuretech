import Box from "@mui/material/Box";
import { Button, IconButton, Stack, Typography } from "@mui/material";

import GitHubIcon from "@mui/icons-material/GitHub";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function SimpleBottomNavigation() {
  return (
    <Box
      style={{
        backgroundColor: "#f5f5f5",
        fontSize: "0.8em",
        padding: "0.5em 1em",
        alignContent: "center",
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
            href="https://github.com/sponsors/Mikaleb"
            target="_blank"
            rel="noopener"
          >
            <FavoriteBorderIcon
              fontSize="small"
              // sx={{ color: iconColor }}
              style={{ marginRight: "0.3em" }}
            />
            Support
          </Button>

          <Typography sx={{ color: "grey.500", fontSize: 13, opacity: "70%" }}>
            &bull;
          </Typography>

          <IconButton
            target="_blank"
            rel="noopener"
            href="https://github.com/Mikaleb?tab=repositories"
            aria-label="github"
            title="GitHub"
            size="small"
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
