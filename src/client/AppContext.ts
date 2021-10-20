import React from "react";

interface AppContextInterface {
  sendAuthApi: (
    uri: RequestInfo,
    options?: RequestInit | undefined
  ) => Promise<Response>;
  toastNoti: (options?: { message: string; duration: number }) => void;
}

const AppContext = React.createContext<AppContextInterface | null>(null);

export default AppContext;
