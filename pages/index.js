import {
  Button,
  Card,
  DataTable,
  Heading,
  Page,
  Pagination,
  TextField,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../appContext/state";
import QueryString from "qs";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const { sendAuthApi } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [tag, setTag] = useState("");
  const [tagInput, setTagInput] = useState("");
  const router = useRouter();
  const { shop } = router.query;
  const PER_PAGE = 3;

  // enum of 3 status when fetching
  const fetchStatus = {
    INIT: 0, // get the first page of orders (when user press Search)
    PREV: 1, // get the previous page of orders (when user press Prev arrow)
    NEXT: 2, // get the next page of orders (when user press Next arrow)
  };

  // tranform order response to polaris table array value type
  const transformOrder2Table = () => {
    return orders.map((o) => [
      o.node.name,
      o.node.totalPriceSet.presentmentMoney.amount,
      o.node.createdAt,
    ]);
  };

  // handle tag input
  const handleTagChange = useCallback((value) => setTagInput(value), []);
  const updateTag = () => {
    setTag(tagInput);
  };

  // fetch order pagination from server
  const getCursor = (status) => {
    switch (status) {
      case fetchStatus.NEXT:
        return orders[orders.length - 1].cursor;
      case fetchStatus.PREV:
        return orders[0].cursor;
    }
  };

  // get 1 page of orders
  const fetchOrder = async (status) => {
    setLoading(true);
    const cursor = getCursor(status);
    const queryString = QueryString.stringify({
      shop,
      tag,
      limit: PER_PAGE,
      cursor,
      direction: status === fetchStatus.PREV ? "before" : "after",
    });
    const res = await sendAuthApi(`/orders?${queryString}`);
    const { orders } = await res.json();
    setOrders(orders.edges);
    setHasPreviousPage(orders.pageInfo.hasPreviousPage);
    setHasNextPage(orders.pageInfo.hasNextPage);
    setLoading(false);
  };

  // fetch page 1 orders pagination
  useEffect(() => {
    async function initOrders() {
      try {
        await fetchOrder(fetchStatus.INIT);
      } catch (error) {
        console.log(error);
      }
    }
    initOrders();
  }, []);

  // fetch orders when subiting search by tag
  useEffect(() => {
    async function searchOrders() {
      try {
        await fetchOrder(fetchStatus.INIT);
      } catch (error) {
        console.log(error);
      }
    }
    searchOrders();
  }, [tag]);

  return (
    <Page>
      <TextField
        label="Tag"
        value={tagInput}
        onChange={handleTagChange}
        autoComplete="off"
      />
      <Button
        primary
        disabled={tag === tagInput}
        loading={loading}
        onClick={updateTag}
      >
        Search
      </Button>
      <Card>
        <DataTable
          columnContentTypes={["numeric", "numeric", "text"]}
          headings={["Order number", "Total", "Order Date"]}
          rows={transformOrder2Table()}
        />
      </Card>
      <Pagination
        hasPrevious={hasPreviousPage}
        onPrevious={async () => {
          await fetchOrder(fetchStatus.PREV);
        }}
        hasNext={hasNextPage}
        onNext={async () => {
          await fetchOrder(fetchStatus.NEXT);
        }}
      />
    </Page>
  );
};

export default Index;
