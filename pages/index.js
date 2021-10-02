import { Card, DataTable, Heading, Page, Pagination } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../appContext/state";
import QueryString from "qs";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const { sendAuthApi } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [tag, setTag] = useState("");
  const router = useRouter();
  const { shop } = router.query;
  const PER_PAGE = 3;

  // tranform order response to polaris table array value type
  const transformOrder2Table = (orders) => {
    return orders.map((o) => [
      o.node.order_number,
      o.node.current_total_price,
      o.node.created_at,
    ]);
  };

  // fetch order pagination from server
  const getCursor = (isNext = true) => {
    if (orders.length > 0) {
      if (isNext) {
        return orders[orders.length - 1].cursor;
      } else {
        return orders[0].cursor;
      }
    }
  };
  const fetchOrder = async (isNext = true) => {
    setLoading(true);
    const cursor = getCursor(isNext);
    const queryString = QueryString.stringify({
      shop,
      limit: PER_PAGE,
      cursor,
      direction: isNext ? "after" : "before",
    });
    const res = await sendAuthApi(`/orders?${queryString}`);
    const data = await res.json();
    setOrders(data.edges);
    setHasNextPage(data.hasNextPage);
    setHasNextPage(data.hasPreviousPage);
    setPageInfo(data.pageInfo);
    setLoading(false);
  };

  // fetch page 1 orders pagination
  useEffect(() => {
    async function initOrders() {
      try {
        await fetchOrder();
      } catch (error) {
        console.log(error);
      }
    }
    initOrders();
  }, []);

  return (
    <Page>
      <Card>
        <DataTable
          columnContentTypes={["numeric", "numeric", "text"]}
          headings={["Order number", "Total", "Order Date"]}
          rows={transformOrder2Table(orders)}
        />
      </Card>
      <Pagination
        hasPrevious={pageInfo.hasPreviousPage}
        onPrevious={async () => {
          await fetchOrder(false);
        }}
        hasNext={pageInfo.hasNextPage}
        onNext={async () => {
          await fetchOrder();
        }}
      />
    </Page>
  );
};

export default Index;
