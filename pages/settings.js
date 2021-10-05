import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  FormLayout,
  TextField,
} from "@shopify/polaris";
import { useAppContext } from "../appContext/state";
import { useRouter } from "next/router";

export default function SettingForm() {
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
          message: "Settings saved",
          duration: 3000,
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
    <Form onSubmit={handleSubmit}>
      <FormLayout>
        <TextField
          value={price}
          onChange={handlePriceChange}
          label="Total Price"
          type="number"
          helpText={
            <span>When the total price of the order is greater than</span>
          }
        />
        <TextField
          value={tag}
          onChange={handleTagChange}
          label="Tag"
          type="text"
          helpText={<span>Apply this tag to the order</span>}
        />

        <Button primary disabled={!(price && tag)} loading={loading} submit>
          Save
        </Button>
      </FormLayout>
    </Form>
  );
}
