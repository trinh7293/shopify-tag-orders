import { Heading, Page, TextStyle, Layout, EmptyState } from "@shopify/polaris";
import { I18n } from "@shopify/react-i18n";
import withI18n from "../components/withI18n";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

interface IndexProps {
  i18n: I18n;
}

const Index = ({ i18n }: IndexProps) => {
  const t = (text) => {
    return i18n.translate(text);
  };
  return (
    <Page>
      <Layout>
        <EmptyState // Empty state component
          heading={t("tag")}
          // action={{
          //   content: "Select products",
          //   // onAction: () => this.setState({ open: true }),
          // }}
          image={img}
        >
          {/* <p>Select products to change their price temporarily.</p> */}
        </EmptyState>
      </Layout>
    </Page>
  );
};

export default withI18n(Index);
