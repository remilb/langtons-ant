import React from "react";
import {
  Drawer,
  List,
  Typography,
  Button,
  IconButton
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import RuleItem from "../RuleItem";

const useStyles = makeStyles(theme => ({
  rulesDrawer: {
    width: 400,
    zIndex: theme.zIndex.appBar - 1,
    padding: theme.spacing(10, 2, 2, 2)
  },

  rulesHeader: {
    height: 32,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
}));

function RulesDrawer(props) {
  const { rules, onRulesChange, onClose } = props;
  const classes = useStyles();

  return (
    <Drawer
      anchor="left"
      open={props.open}
      variant="persistent"
      elevation={16}
      classes={{ paper: classes.rulesDrawer }}
    >
      <div className={classes.rulesHeader}>
        <Typography variant="h6">Rules</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      <div>
        <Button variant="contained">Random</Button>
        <Button
          variant="contained"
          onClick={() =>
            onRulesChange(
              generateValidRules([
                ...rules,
                {
                  onColor: randomColor(),
                  nextColor: rules[0].onColor,
                  rotation: "l",
                  numSteps: 1
                }
              ])
            )
          }
        >
          Add
        </Button>
      </div>
      <RulesList rules={rules} onRulesChange={onRulesChange} />
    </Drawer>
  );
}

function RulesList({ rules, onRulesChange }) {
  const ruleListItems = rules.map((rule, idx) => (
    <RuleItem
      key={idx}
      rule={rule}
      onRuleRemove={() =>
        onRulesChange(
          generateValidRules(rules.filter(r => r.onColor !== rule.onColor))
        )
      }
      onRuleChange={newRule =>
        onRulesChange(
          generateValidRules(
            Array.from(rules, (oldRule, i) => (i === idx ? newRule : oldRule))
          )
        )
      }
    />
  ));

  return <List>{ruleListItems}</List>;
}

function generateValidRules(rules) {
  return Array.from(rules, (rule, index) => {
    let successorColor = rules[(index + 1) % rules.length].onColor;
    return rule.nextColor !== successorColor
      ? { ...rule, nextColor: successorColor }
      : rule;
  });
}

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777216).toString(16);
}

export default RulesDrawer;
