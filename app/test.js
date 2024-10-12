const { default: AsyncStorage } = require("@react-native-async-storage/async-storage");
const { useEffect } = require("react");

async () => {

    useEffect(
        () => {

        }, []
    );

    const object = {
        name: "Chirath",
        mobile: "0714443891",
    }

    await AsyncStorage.setItem("user", JSON.stringify(object));

}