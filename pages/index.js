import { connect } from "@tableland/sdk";
import Head from "next/head";
import {
  Box,
  Flex,
  Stack,
  SimpleGrid,
  Heading,
  Input,
  Button,
  Checkbox,
  Text,
  Spinner,
  Center,
  useColorMode,
  useColorModeValue,
  useToast,
  useClipboard,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon, CopyIcon, CheckCircleIcon, AttachmentIcon, PlusSquareIcon } from "@chakra-ui/icons";
import { useRef, useEffect, useState } from "react";
import Link from "./[link]";
export default function Home() {
  const [linkValue, setLinkValue] = useState("");
  const { toggleColorMode } = useColorMode();
  const toast = useToast();
  const linkInputRef = useRef(null);
  const noteInputRef = useRef(null);
  const { hasCopied, onCopy } = useClipboard(linkValue);
  const tableNameInputRef = useRef(null);

  const [tableObject, setTableObject] = useState();

  const [clips, setClips] = useState();
  const [clipsLoading, setClipsLoading] = useState(true);
  const [isClipping, setIsClipping] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);

  const isUrl = (urlString) => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
      '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
    return !!urlPattern.test(urlString);
  }

  const connectTable = async () => {
    const tableland = await connect({
      network: "testnet",
      chain: "polygon-mumbai",
    });
    setTableObject(tableland);
    
    return tableland;
  };

  const insertRow = async (
    link,
    short_link
  ) => {
    console.log('tableName: ', process.env.NEXT_PUBLIC_TABLELAND_TABLE_NAME);
    console.log('publicUrl: ', process.env.NEXT_PUBLIC_PROJECT_URL);
    console.log('link: ', link);
    console.log('short_link: ', short_link);

    const writeRes = await tableObject.write(
      `INSERT INTO ${process.env.NEXT_PUBLIC_TABLELAND_TABLE_NAME} (link, short_link) VALUES ('${link}', '${short_link}');`
    );
    console.log('writeRes: ', writeRes);
  };

  const loadClips = async () => {
    tableObject.read(
      `SELECT * FROM ${process.env.NEXT_PUBLIC_TABLELAND_TABLE_NAME};`
    ).then((resp) => {
      //console.log('clips: ', resp.rows);

      setClipsLoading(false);
      setClips(resp.rows.reverse());
    });
  }

  const createTable = async () => {
    tableNameInputRef.current.value = "building ...";
    setIsCreatingTable(true);
    toast({
      title: "creating Tableland table",
      description: `Your own table on Tableland to save your clips`,
      status: "info",
      duration: 500000,
      isClosable: true,
      position: "top",
    });

    connectTable().then((tableObject) => {
      tableObject.create(
        `id integer primary key, link text, short_link text, cid text, count integer`, // Table schema definition
        {
          prefix: `cliply_table`, // Optional `prefix` used to define a human-readable string
        }
      ).then((resp) => {
        console.log(resp);

        tableNameInputRef.current.value = resp.name;

        setIsCreatingTable(false);
        toast.closeAll();
        toast({
          title: "table created.",
          description: `Your own tableland table is ready at ${resp.name}`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      });
    });
  }

  const handleForm = async () => {
    //console.log('tableName: ', process.env.NEXT_PUBLIC_TABLELAND_TABLE_NAME);
    //console.log('tableObject: ', tableObject);
    
    if (linkInputRef.current.value == "") return;

    if (!isUrl(linkInputRef.current.value)) {
      toast({
        title: "Error!",
        description: 'Link entered is not a valid link',
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      return;
    }

    toast({
      title: "Saving to IPFS / web3.storage",
      description: "your link note is saved to IPFS / web3.storage",
      status: "info",
      duration: 500000,
      isClosable: true,
      position: "top",
    });
    const res = await fetch("/api/short_link", {
      body: JSON.stringify({
        link: linkInputRef.current.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const { error, short_link } = await res.json();
    if (error) {
      toast({
        title: "Error!",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    } else if (short_link) {

      if(tableObject && !process.env.TABLELAND_TABLE_NAME) {
        setLinkValue('processing ...');
        setIsClipping(true);
      
        toast({
          title: "Saving your link to Tableland",
          description: "Your link is being saved to Tableland",
          status: "info",
          duration: 500000,
          isClosable: true,
          position: "top",
        });
        insertRow(linkInputRef.current.value, short_link).then((resp) => {
          setClips([
            [0, linkInputRef.current.value, short_link], 
            ...clips
          ]);

          linkInputRef.current.value = "";
          setLinkValue(`${process.env.NEXT_PUBLIC_PROJECT_URL}/${short_link}`);

          setIsClipping(false);
          toast.closeAll();
          toast({
            title: "Link created.",
            description: `Your link is ready at ${process.env.NEXT_PUBLIC_PROJECT_URL}/${short_link}`,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        });
      }
    }
  };

  useEffect(() => {
    if(!tableObject) connectTable();
  }, []);

  useEffect(() => {
    if(tableObject && process.env.NEXT_PUBLIC_TABLELAND_TABLE_NAME) {
      loadClips();
    }
  }, [tableObject]);

  return (
    <Box p={8} maxW="600px" minW="320px" m="0 auto">
      <Head>
        <title>CLIP.LY</title>
        <meta name="title" content="linki" />
        <meta name="description" content="CLIP.LY: your bookmarks with short links" />
        <meta name="og:image" content="/cliply.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Heading color="pink.300" mb="5">📎 Clip.ly</Heading>
      </Box>
      {process.env.NEXT_PUBLIC_TABLELAND_TABLE_NAME && <>
        <Box
          direction="column"
          background={useColorModeValue("gray.100", "gray.700")}
          p={3}
          rounded={6}
        >
          <Input
            ref={linkInputRef}
            variant="filled"
            mb={3}
            type="url"
            placeholder="Your URL (max 330 chars)"
            isRequired
          />
          <Input
            ref={noteInputRef}
            variant="filled"
            mb={3}
            type="text"
            placeholder="Note about the link (saved to IPFS)"
            isRequired
          />
          <Input
            value={linkValue}
            variant="filled"
            w="87%"
            mb={3}
            type="url"
            placeholder="short link by clip.ly"
            isReadOnly
          />
          <Button colorScheme="purple" onClick={onCopy} w="10%" mt={-1} ml="3%">
            {hasCopied ? <CheckCircleIcon /> : <CopyIcon />}
          </Button>
          <Button onClick={handleForm} leftIcon={<AttachmentIcon />} colorScheme="pink" w="100%" isLoading={isClipping} loadingText="Clipping">
            Clip It!
          </Button>
        </Box>

        <Box mt={3}>
          {clipsLoading && (
            <Center p={8}>
              <Spinner /> <Text ml={3}>Loading clips</Text>
            </Center>
          )}
          <SimpleGrid columns={{ sm: 2, md: 2 }} spacing={3} p={3} rounded="lg">
            {clips?.map((clip) => (
              <Box key={clip[0]} boxShadow="xs" p={6} rounded="md" bg="white">
                <img src={"https://api.miniature.io/?token=mNhJePgye5CH4oZU&url="+ clip[1]}></img>
                <Text mb={2} color="pink.600" isTruncated={true}><b>{clip[1]}</b></Text>
                <Text fontSize="xs" ml={1} color="gray.600">
                  <a href={process.env.NEXT_PUBLIC_PROJECT_URL +"/"+ clip[2]} target="_blank"><code>📎.ly/{clip[2]}</code></a>
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </>}

      {!process.env.NEXT_PUBLIC_TABLELAND_TABLE_NAME && 
        <Box
          direction="column"
          background={useColorModeValue("gray.100", "gray.700")}
          p={3}
          rounded={6}
        >
          <Text mb={3} mt={3}>
            <code>NEXT_PUBLIC_TABLELAND_TABLE_NAME</code><br />
            is not set in <code>.env.local</code>
            <br /><br />
            Click the button below create your own Tableland table!
          </Text>
          <Input
            ref={tableNameInputRef}
            variant="filled"
            mb={3}
            type="text"
            placeholder="table name"
            isReadOnly
          />
          <Button onClick={createTable} leftIcon={<PlusSquareIcon />} colorScheme="pink" w="100%" isLoading={isCreatingTable} loadingText="Creating Table">
            Create Tableland table!
          </Button>
        </Box>
      }
    </Box>
  );
}
