import { useI18n } from "@shopify/react-i18n";
import en from "../../locales/en-US.json";
import ja from "../../locales/ja-JP.json";

export default function withI18n(Component: any) {
  return function (props: any) {
    const [i18n] = useI18n({
      id: "Layout",
      fallback: en as any,
      translations(locale) {
        if (locale === "ja") {
          return ja as any;
        } else {
          return en as any;
        }
      },
    });
    return <Component i18n={i18n} {...props} />;
  };
}
