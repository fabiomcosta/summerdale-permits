// --- React/Nextjs
import { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';

// TODO: Change to MUI

// --- Libs
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
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

const { hasOwnProperty } = Object.prototype;

function ResultsTable({ data }) {
  return (
    <Card variant={'outline'}>
      <CardBody>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Lot #</Th>
                <Th>Address</Th>
                <Th>Status?</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item) => {
                return (
                  <Tr key={item.number}>
                    <Td>{item.number}</Td>
                    <Td>{item.address}</Td>
                    <Td>?</Td>
                    {/* <Td>{item.parcel_number}</Td> */}
                    {/* <Td>{item.permit_address}</Td> */}
                    {/* <Td>{item.contractor_phone_number}</Td> */}
                    {/* <Td isNumeric>{item.zip}</Td> */}
                    {/*
                              application_type: "Building Permit"
                              contractor_addres: "GERALD BOENEMAN (DREAM FINDERS HOMES LLC)"
                              contractor_address: "14701 PHILIPS HWY,JACKSONVILLE, FL 32256"
                              contractor_name: "DREAM FINDERS HOMES LLC"
                              contractor_phone_number: "(407)757-0206"
                              estimated_cost: "277800"
                              of_cycles: "1"
                              of_pdoxwkflw: "0"
                              parcel_number: "312431779300010"
                              parcel_owner_name: " DREAM FINDERS HOMES LLC"
                              permit_address: "18303 MOWRY CT"
                              permit_number: "BLD2023-12771"
                              plan_review_type: "Residential 1/2"
                              prescreen_completed_date: "2023-03-07T00:00:00.000"
                              processed_date: "2023-03-07T00:00:00.000"
                              property_owner_name: " TDCP LLC"
                              under_review_date: "2023-03-07T00:00:00.000"
                              worktype: "New"
                           */}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          {/* <Flex justifyContent={'space-between'} alignItems={'center'} mt={4}>
                    <Text>Showing {itemsPerPage} of {data.length} results</Text>
                    <Flex>
                      <Text mr={2}>Items per page</Text>
                      <Select size="sm" value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value)}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </Select>
                    </Flex>

                    <Button
                      onClick={() => paginate('previous')}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => paginate('next')}
                    >
                      Next
                    </Button>
                  </Flex> */}
        </TableContainer>
      </CardBody>
    </Card>
  );
}

function useCityData() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getData = useCallback(async () => {
    try {
      // docs: https://dev.socrata.com/foundry/data.cityoforlando.net/5pzm-dn5w
      const apiUrl = `https://data.cityoforlando.net/resource/5pzm-dn5w.json?application_type=Building Permit`;
      // const apiUrl =`https://data.cityoforlando.net/resource/5pzm-dn5w.json?parcel_number=312431779301390`;
      // const apiUrl = `https://data.cityoforlando.net/resource/5pzm-dn5w.json?$limit=${itemsPerPage}&$offset=${currentPage}`
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

  const lotData = useMemo(() => {
    const lots = data.reduce((acc, permit) => {
      const lotNumber = Number(permit.parcel_number.slice(-5, -1));
      if (hasOwnProperty.call(acc, lotNumber)) {
        acc[lotNumber].permits.push(permit);
      } else {
        acc[lotNumber] = {
          number: lotNumber,
          address: permit.permit_address,
          // we don't actually need this
          permits: [permit],
        };
      }
      return acc;
    }, {});
    return Object.values(lots);
  }, [data]);

  useEffect(() => {
    getData();
  }, [getData]);

  return [lotData, isLoading];
}

export default function Home() {
  const [data, isLoading] = useCityData();
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
