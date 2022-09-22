import { connect } from "@tableland/sdk";
const connectTable = async () => {
  const tableland = await connect({
    network: "testnet",
    chain: "polygon-mumbai",
  });  
  return tableland;
};

export default function Link() {
  return <p>you will be redirected soon.</p>;
}

export async function getServerSideProps(context) {
  const query = context.params.link;

  const tableObject = await connectTable();

  const result = await tableObject.read(
    `SELECT * FROM ${process.env.NEXT_PUBLIC_TABLELAND_TABLE_NAME} WHERE short_link = '${query}';`
  );

  //console.log(result);

  const row = result.rows[0];

  if (!row) {
    return {
      notFound: true,
    };
  } else {
    let url = String(row[1]);

    if(!url.includes('://')) url = 'https://'+ row[1];

    return {
      redirect: {
        destination: url,
        permanent: true,
      },
    };
  }
}
