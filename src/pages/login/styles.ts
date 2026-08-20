import { Dimensions, StyleSheet } from "react-native";

export const style = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ffffff", 
  },
  boxTop: {
    height: Dimensions.get("window").height / 3,
    width: 360,
    justifyContent: "center",
    backgroundColor: "#a4c639",
    alignItems: "center",
    borderRadius: 12,
    marginInline: "auto",
    marginTop: 60,
    marginBottom: 20,
  },
  boxMid: {
    height: Dimensions.get("window").height / 3,
    width: "100%",
    paddingHorizontal: 30,
    justifyContent: "center",
    gap: 20,
  },
  boxBottom: {
    height: 50,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a4c639",
    marginInline: "auto",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000000",
  },
  boxModel:{
    gap: 5,
  },
  titleInput: {
    color: "#000000", 
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  boxInput: {
    backgroundColor: "#f2f2f2",
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#cccccc",
    color: "#000000",
  },
  textBottom: {
    color: "#000000",
  }
});