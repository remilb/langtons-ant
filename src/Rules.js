import React from "react";
import { Paper, Typography, List, ListItem } from "@material-ui/core";

function Rules(props) {
  return (
    <Paper>
      <Typography>Rules</Typography>
      <List>
        <Rule />
        <Rule />
        <Rule />
      </List>
    </Paper>
  );
}

function Rule(props) {
  return <ListItem>This is my fancy rule</ListItem>;
}

export default Rules;
