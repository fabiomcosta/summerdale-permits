// --- React/Nextjs
import { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// TODO: Change to MUI

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
  CardBody,
  Card,
  Stack,
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  Text,
  Kbd,
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
      <CardBody>
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
                        <Button colorScheme="blue">Details</Button>
                      </Link>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
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
          borderBottomColor={'gray.200'}
          bg={'gray.900'}
          mb={12}
        >
          <Box py={'16'}>
            <Heading color={'white'} textAlign={'center'}>
              Explore Status updates for Summerdale community
            </Heading>
            <Text size={'xl'} color={'gray.300'} textAlign={'center'}>
              A status page to help Summerdale Park home owners stay up to date
              with their homes.
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
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                }}
                size="lg"
                bg="white"
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
      <Box
        as="footer"
        w={'full'}
        p={6}
        borderTopWidth={1}
        borderTopColor={'gray.200'}
        bg={'gray.100'}
        textAlign="center"
      >
        <Text>Created by Agnel Nieves and Bruno Albuquerque</Text>
      </Box>
    </>
  );
}
