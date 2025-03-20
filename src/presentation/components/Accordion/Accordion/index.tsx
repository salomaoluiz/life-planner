import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { List } from "react-native-paper";

import Right from "./Right";
import getStyles from "./styles";

export interface AccordionProps {
  content: React.ReactElement;
  getAccordionStatus?: (expanded: boolean) => void;
  header: React.ReactElement;
  id?: string;
  left?: React.ReactElement;
  onLongPress?: () => void;
  onPress?: () => void;
  right?: React.ReactElement;
  testID?: string;
}

function Accordion(props: AccordionProps) {
  const styles = getStyles();
  const [expanded, setExpanded] = useState(false);

  function onPress() {
    setExpanded(!expanded);
    props.onPress?.();
  }

  function leftFunction() {
    return <View style={styles.leftContainer}>{props.left}</View>;
  }

  function rightFunction() {
    return <Right expanded={expanded} right={props.right} />;
  }

  function Content() {
    return <View style={styles.contentContainer}>{props.content}</View>;
  }

  function Header() {
    return <View style={styles.headerContainer}>{props.header}</View>;
  }

  useEffect(() => {
    props.getAccordionStatus?.(expanded);
  }, [expanded]);

  return (
    <List.Accordion
      expanded={expanded}
      id={props.id}
      left={leftFunction}
      onLongPress={props.onLongPress}
      onPress={onPress}
      right={rightFunction}
      style={styles.container}
      testID={props.testID}
      title={<Header />}
    >
      <Content />
    </List.Accordion>
  );
}

export default Accordion;
