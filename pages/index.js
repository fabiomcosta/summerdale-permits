// --- React/Nextjs
import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'

// TODO: Change to MUI

// --- Libs
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Flex, Button,
  Tbody,
  Tfoot,
  CircularProgress,
  CircularProgressLabel,
  Tr,
  Th,
  Td,
  TableCaption,
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
  Select,
} from '@chakra-ui/react'
import { SearchIcon, CheckIcon } from '@chakra-ui/icons';

export default function Home() {
  const [data, setData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const getData = useCallback(async () => {
    try {
      const apiUrl = `https://data.cityoforlando.net/resource/5pzm-dn5w.json`
      // const apiUrl = `https://data.cityoforlando.net/resource/5pzm-dn5w.json?$limit=${itemsPerPage}&$offset=${currentPage}`
      const response = await fetch(apiUrl)
      const data = await response.json()
      console.log(data)
      setData(data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }, [setData, itemsPerPage, currentPage])

  const paginate = (direction) => {
    if (direction === 'next') {
      setCurrentPage(currentPage + itemsPerPage)
    } else {
      setCurrentPage(currentPage - itemsPerPage)
    }
    getData();
  }

  useEffect(() => {
    getData();
  }, [getData])

  return (
    <>
      <Head>
        <title>Summerdale Park building status</title>
        <meta name="description" content="A status page to help Summerdale Park home owners stay up to date with their homes." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box as='main' h={'full'} w={'full'}>
        {/* Show a circular loader from chakra ui */}
        <Box as='header' w={'full'} p={4} borderBottomWidth={1} borderBottomColor={'gray.200'} bg={'gray.900'} mb={12}>
          <Box py={'16'}>
            <Heading color={'white'} textAlign={'center'}>
              Explore Status updates for Summerdale community
            </Heading>
            <Text size={'xl'} color={'gray.300'} textAlign={'center'}>
              A status page to help Summerdale Park home owners stay up to date with their homes.
            </Text>
          </Box>
          <Stack spacing={4} mb={-8} maxW={672} marginInline="auto" alignItems={'center'}>
            <InputGroup >
              <InputLeftElement
                flex={1}
                pointerEvents='none'
              >
                <SearchIcon color="gray.300" fontSize={'xl'} />
              </InputLeftElement>
              <Input size="lg" bg={'white'} type='tel' placeholder='Search for a lot number' />
              <InputRightElement width='4.5rem'>
                <Kbd>cmd</Kbd>
                <Kbd>k</Kbd>
              </InputRightElement>
            </InputGroup>
          </Stack>
        </Box>
        <Box as='section' w={'full'} p={4}>
          <Container maxW='container.xl'>
            {isLoading && data.length === 0 ? <CircularProgress isIndeterminate /> : <Card variant={'outline'}>
              <CardBody>
                <TableContainer>
                  <Table variant='simple'>
                    <Thead>
                      <Tr>
                        <Th>Permit #</Th>
                        <Th>Application type</Th>
                        <Th>Address</Th>
                        <Th>Contractor phone</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.map((item) => {
                        return (
                          <Tr key={item.permit_number}>
                            <Td>{item.permit_number}</Td>
                            <Td>{item.application_type}</Td>
                            <Td>{item.permit_address}</Td>
                            <Td>{item.contractor_phone_number}</Td>
                            <Td isNumeric>{item.zip}</Td>
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
                        )
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
            </Card>}
          </Container>
        </Box>
      </Box>
      <Box as='footer' w={'full'} p={6} borderTopWidth={1} borderTopColor={'gray.200'} bg={'gray.100'} textAlign="center">
        <Text>
          Created by Agnel Nieves and Bruno Albuquerque
        </Text>
      </Box>
    </>
  )
}
