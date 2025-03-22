import { ScrollView } from "react-native";

import { StockDashboard } from "@screens/Home/containers";

import getStyles from "./styles";

function Home() {
  const styles = getStyles();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StockDashboard />
    </ScrollView>
  );
}

export default Home;
