import React from "react";
import { AppBar, Toolbar, Typography } from "@material-ui/core";

function AppHeader() {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" color="inherit">
          Langton's Ant
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
