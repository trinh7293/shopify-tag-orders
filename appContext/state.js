import { createContext, useContext } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Toast } from "@shopify/app-bridge/actions";

const AppContext = createContext();

export function AppWrapper({ children }) {
  const app = useAppBridge();

  const defaultToastOptions = {
    message: "Success",
    duration: 3000,
  };
  let sharedState = {
    sendAuthApi: authenticatedFetch(app),
    toastNoti: (options = defaultToastOptions) => {
      const toastNotice = Toast.create(app, options);
      toastNotice.dispatch(Toast.Action.SHOW);
    },
  };

  return (
    <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
