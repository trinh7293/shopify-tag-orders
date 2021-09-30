import { createContext, useContext } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";

const AppContext = createContext();

export function AppWrapper({ children }) {
  const app = useAppBridge();

  let sharedState = {
    sendAuthApi: authenticatedFetch(app),
  };

  return (
    <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
