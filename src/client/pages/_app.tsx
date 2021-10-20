import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import getConfig from "next/config";
import { AppProvider, PageProps } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect, Toast } from "@shopify/app-bridge/actions";
import "@shopify/polaris/dist/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import jaTranslations from "@shopify/polaris/locales/ja.json";
import { I18nContext, I18nManager } from "@shopify/react-i18n";
import { ClientApplication } from "@shopify/app-bridge";
import AppContext from "../AppContext";

const { SHOPIFY_API_KEY } = getConfig().publicRuntimeConfig;

function userLoggedInFetch(app: ClientApplication<any>) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri: string, options: RequestInit) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
    }

    return response;
  };
}

function MyProvider(props: any) {
  const app = useAppBridge();

  // init state function
  const sendAuthApi = authenticatedFetch(app);
  const defaultToastOptions = {
    message: "Success",
    duration: 3000,
  };
  const toastNoti = (options = defaultToastOptions) => {
    const toastNotice = Toast.create(app, {
      ...defaultToastOptions,
      ...options,
    });
    toastNotice.dispatch(Toast.Action.SHOW);
  };

  const client = new ApolloClient({
    fetch: userLoggedInFetch(app),
    fetchOptions: {
      credentials: "include",
    },
  });

  const Component = props.Component;

  return (
    <ApolloProvider client={client}>
      <AppContext.Provider value={{ sendAuthApi, toastNoti }}>
        <Component {...props} />
      </AppContext.Provider>
    </ApolloProvider>
  );
}

interface MainAppProps {
  Component: any;
  pageProps: PageProps;
  host: string;
  locale: string;
}

const _app = ({ Component, pageProps, host, locale }: MainAppProps) => {
  const appLocale = locale || "en-US";
  const translation = appLocale === "ja" ? jaTranslations : enTranslations;
  const i18nManager = new I18nManager({ locale: appLocale });

  const config = {
    apiKey: SHOPIFY_API_KEY,
    host: host,
    forceRedirect: true,
  };

  return (
    <I18nContext.Provider value={i18nManager}>
      <AppProvider i18n={translation}>
        <Provider config={config}>
          <MyProvider Component={Component} {...pageProps} />
        </Provider>
      </AppProvider>
    </I18nContext.Provider>
  );
};

_app.getInitialProps = async ({ ctx }: any) => {
  return { host: ctx.query.host, locale: ctx.query.locale };
};

export default _app;
