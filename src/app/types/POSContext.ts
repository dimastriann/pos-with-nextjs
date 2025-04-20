export type POSContenxtType = {
    screen: string;
    setScreen: Function;
    username: string;
    setUserName: Function;
    password: string;
    setPassword: Function;
}

export const defaultPOSContext = {
    screen: "login", 
    setScreen: () => ("login"), 
    username: "", 
    setUserName: () => (""),
    password: "",
    setPassword: () => (""),
}
