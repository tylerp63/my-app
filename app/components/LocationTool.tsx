import { useState } from "react";
import { Button, Text } from "tamagui";

import * as Location from "expo-location";

const LocationTool = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  }

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <>
      <Button minWidth={"50%"} circular={true} onPress={getCurrentLocation}>
        Add location
      </Button>
      <Text color={"black"}>{text}</Text>
    </>
  );
};

export default LocationTool;
