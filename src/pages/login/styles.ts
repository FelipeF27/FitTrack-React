import { Dimensions, StyleSheet } from "react-native";
import { themas } from "../../global/themes";

export const style = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: themas.colors.white,
    alignItems: "center",
  },
  boxTop: {
    height: Dimensions.get("window").height / 3,
    width: "90%",
    justifyContent: "center",
    backgroundColor: themas.colors.primary,
    alignItems: "center",
    borderRadius: 12,
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
    height: Dimensions.get("window").height / 3,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  boxModel: {
    gap: 5,
  },
  titleInput: {
    color: themas.colors.black,
    fontWeight: "bold",
  },
  boxInputEmail: {
    width: "100%",
    height: 40,
    backgroundColor: themas.colors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cccccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  boxInputSenha: {
    width: "100%",
    height: 40,
    backgroundColor: themas.colors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cccccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  input: {
    height: "100%",
    width: "85%",
    color: themas.colors.black,
  },
  button: {
    height: 50,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themas.colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cccccc",
  },
  textButton: {
    color: themas.colors.black,
  }
});