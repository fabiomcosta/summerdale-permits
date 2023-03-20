// --- React/Nextjs
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';

// --- Libs
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tfoot,
  CircularProgress,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  Stack,
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  Text,
  Kbd,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import {
  useColorBag,
  SmartColoredBadge,
} from '../components/SmartColoredBadge';

const { hasOwnProperty } = Object.prototype;

function parcelNumberToLotNumber(parcelNumber) {
  return Number(parcelNumber.slice(-5, -1));
}

function getLotStatus(buildingPermit) {
  // when there are more then one Building Permit it's still confusing which
  // one is the one that we should be using, so we'll avoid classifying them.
  if (buildingPermit.permits.length === 1) {
    const permit = buildingPermit.permits[0];
    if (permit.coo_date != null) {
      return 'Ready to move';
    }
  }
  return 'Other';
}

function ResultsTable({ data }) {
  const colorBag = useColorBag();
  const headerElements = (
    <Tr>
      <Th>Lot #</Th>
      <Th>Address</Th>
      <Th>Status</Th>
      <Th>Actions</Th>
    </Tr>
  );
  return (
    <Card variant={'outline'}>
      <TableContainer>
        <Table variant="simple">
          <Thead>{headerElements}</Thead>
          <Tfoot>{headerElements}</Tfoot>
          <Tbody>
            {data.map((item) => {
              return (
                <Tr key={item.number}>
                  <Td>{item.number}</Td>
                  <Td>{item.address}</Td>
                  <Td>
                    <SmartColoredBadge
                      label={getLotStatus(item)}
                      colorBag={colorBag}
                    />
                  </Td>
                  <Td>
                    <Link href={`/lot/${item.id}`}>
                      <Button colorScheme="teal">Details</Button>
                    </Link>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function useCityData(searchValue) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getData = useCallback(async () => {
    try {
      // docs: https://dev.socrata.com/foundry/data.cityoforlando.net/5pzm-dn5w
      const apiUrl = `https://data.cityoforlando.net/resource/5pzm-dn5w.json?application_type=Building Permit&worktype=New`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log(data);
      setData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [setData]);

  useEffect(() => {
    getData();
  }, [getData]);

  const lotData = useMemo(() => {
    const lots = data.reduce((acc, permit) => {
      const lotNumber = parcelNumberToLotNumber(permit.parcel_number);
      if (hasOwnProperty.call(acc, lotNumber)) {
        acc[lotNumber].permits.push(permit);
      } else {
        const address = permit.permit_address;
        acc[lotNumber] = {
          // Haha... this makes the search logic easier
          __searchIndex: `${lotNumber} ${address}`.toLowerCase(),
          id: permit.parcel_number,
          number: lotNumber,
          address,
          // we don't actually need this
          permits: [permit],
        };
      }
      return acc;
    }, {});
    return Object.values(lots);
  }, [data]);

  console.log(lotData);

  const searchTokens = searchValue.toLowerCase().split(' ');
  const filteredLotData = lotData.filter((lot) => {
    return searchTokens.some((token) => lot.__searchIndex.includes(token));
  });

  return [filteredLotData, isLoading];
}

export default function Home() {
  const [searchValue, setSearchValue] = useState('');
  const [data, isLoading] = useCityData(searchValue);
  const searchEl = useRef(null);

  /**
   * Handle the search key shortcut
   */
  const handleSearchKeyShortcut = useCallback((event) => {
    if (
      (event.metaKey && event.key === 'k') ||
      (event.ctrlKey && event.key === 'k')
    ) {
      searchEl.current.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleSearchKeyShortcut);
    return () => {
      document.removeEventListener('keydown', handleSearchKeyShortcut);
    };
  }, [handleSearchKeyShortcut]);

  return (
    <>
      <Head>
        <title>Summerdale Park building status</title>
        <meta
          name="description"
          content="A status page to help Summerdale Park home owners stay up to date with their homes."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box as="main" h={'full'} w={'full'}>
        {/* Show a circular loader from chakra ui */}
        <Box
          as="header"
          w={'full'}
          p={4}
          borderBottomWidth={1}
          borderBottomColor={'chakra-border'}
          bg={useColorModeValue('teal.900', 'teal.200')}
          className="hero"
          mb={12}
          position="relative"
        >
          <Box
            position={'absolute'}
            top={0}
            left={0}
            height="full"
            width={'full'}
            opacity={0.1}
          >
            <Image
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
              fill
              src="/images/hero-bg.jpg"
              alt="Summerdale park sunset"
            />
          </Box>
          <Box pt={'32'} pb="10">
            <Heading
              size={'2xl'}
              color={'chakra-body-bg'}
              textAlign={'center'}
              mb="3"
            >
              👋 Hey there neighbor
            </Heading>
            <Text
              fontSize={'xl'}
              maxWidth="578px"
              mx={'auto'}
              color={'chakra-body-bg'}
              opacity={0.8}
              textAlign={'center'}
            >
              This page allows us to monitor the status of construction within
              Summerdale Park and stay informed about any updates or changes in
              the permit application process.
            </Text>
          </Box>
          <Stack
            spacing={4}
            mb={-8}
            maxW={672}
            marginInline="auto"
            alignItems="center"
          >
            <InputGroup>
              <InputLeftElement
                flex={1}
                pointerEvents="none"
                height="100%"
                marginStart="1"
              >
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                ref={searchEl}
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                }}
                size="lg"
                bg="chakra-body-bg"
                type="tel"
                placeholder="Search for a lot number"
              />
              <InputRightElement width="4.5rem" height="100%" paddingEnd="2">
                <Kbd>cmd</Kbd>
                <Kbd>k</Kbd>
              </InputRightElement>
            </InputGroup>
          </Stack>
        </Box>
        <Box as="section" w={'full'} p={4}>
          <Container maxW="container.xl">
            {isLoading && data.length === 0 ? (
              <CircularProgress isIndeterminate />
            ) : (
              <ResultsTable data={data} />
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
}
