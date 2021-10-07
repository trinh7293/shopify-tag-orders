import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  FormLayout,
  Layout,
  Page,
  Stack,
  TextField,
} from "@shopify/polaris";
import useTranslation from "next-translate/useTranslation";
import { useAppContext } from "../appContext/state";
import { useRouter } from "next/router";

export default function SettingForm() {
  const { t } = useTranslation();
  const { sendAuthApi, toastNoti } = useAppContext();
  const [price, setPrice] = useState(0);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { shop } = router.query;

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await sendAuthApi(`/settings/get-settings?shop=${shop}`);
        const data = await res.json();
        console.log(data);
        setPrice(data.price);
        setTag(data.tag);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = useCallback(
    async (_event) => {
      try {
        setLoading(true);
        const result = await sendAuthApi("settings/save-settings", {
          method: "POST",
          body: JSON.stringify({
            shop,
            price,
            tag,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        setLoading(false);
        toastNoti({
          message: t("common:setting-saved"),
        });
      } catch (error) {
        console.log(error);
      }
    },
    [price, tag]
  );

  const handlePriceChange = useCallback((value) => setPrice(value), []);
  const handleTagChange = useCallback((value) => setTag(value), []);

  return (
    <Page>
      <Form onSubmit={handleSubmit}>
        <Stack vertical spacing="extraTight">
          <Layout>
            <Layout.Section>
              <p>
                {t("common:when-the-total-price-of-the-order-is-greater-than")}
              </p>
            </Layout.Section>
            <Layout.Section secondary>
              <TextField
                value={price}
                onChange={handlePriceChange}
                placeholder={t(
                  "common:when-the-total-price-of-the-order-is-greater-than"
                )}
                type="number"
              />
            </Layout.Section>
          </Layout>
          <Layout>
            <Layout.Section>
              <p>{t("common:apply-this-tag-to-the-order")}</p>
            </Layout.Section>
            <Layout.Section secondary>
              <TextField
                value={tag}
                onChange={handleTagChange}
                placeholder={t("common:apply-this-tag-to-the-order")}
                type="text"
              />
            </Layout.Section>
          </Layout>
          <Stack distribution="trailing">
            <Button primary disabled={!(price && tag)} loading={loading} submit>
              {t("common:save")}
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Page>
  );
}
