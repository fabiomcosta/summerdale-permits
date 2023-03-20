import { useEffect, useState, useCallback, Fragment } from 'react';
import {
  useColorBag,
  SmartColoredBadge,
} from '../../components/SmartColoredBadge';
import {
  Box,
  Badge,
  Card,
  Container,
  CircularProgress,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  Heading,
  Text,
  AccordionPanel,
  Table,
  Tbody,
  useColorMode,
  Tr,
  Th,
  Td,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverBody,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';

const { hasOwnProperty } = Object.prototype;

function parcelNumberToLotNumber(parcelNumber) {
  return Number(parcelNumber.slice(-5, -1));
}

function formatDateStr(dateStr) {
  if (dateStr == null) {
    return null;
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

function formatCurrencyAmount(amount) {
  if (amount == null) {
    return null;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function useLotData(parcelNumber) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getData = useCallback(async () => {
    try {
      // docs: https://dev.socrata.com/foundry/data.cityoforlando.net/5pzm-dn5w
      const apiUrl = `https://data.cityoforlando.net/resource/5pzm-dn5w.json?parcel_number=${parcelNumber}`;
      const response = await fetch(apiUrl);
      let data = await response.json();
      data = data.sort(
        (a, b) =>
          new Date(a.processed_date).getTime() -
          new Date(b.processed_date).getTime()
      );
      console.log(data);
      setData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [setData, parcelNumber]);

  useEffect(() => {
    getData();
  }, [getData]);

  return [data, isLoading];
}

function OptionalRow({ label, data }) {
  if (data == null) {
    return null;
  }
  return (
    <Tr>
      <Th>{label}</Th>
      <Td>{data}</Td>
    </Tr>
  );
}

const dateFieldOrder = {
  processed_date: 1,
  prescreen_completed_date: 2,
  under_review_date: 3,
  review_started_including: 4,
  review_started_date_excluding: 5,
  collect_permit_fees_date: 6,
  pending_issuance_date: 7,
  issue_permit_date: 8,
  final_date: 9,
};

const dateFieldLabel = {
  processed_date: 'Processed',
  prescreen_completed_date: 'Prescreen',
  under_review_date: 'Under review',
  review_started_including: 'Review started',
  review_started_date_excluding: 'Review started',
  collect_permit_fees_date: 'Collect fees',
  pending_issuance_date: 'Pending issuance',
  issue_permit_date: 'Issued',
  final_date: 'Done',
};

function getLatestDateField(permit) {
  let dateFields = Object.entries(permit).filter(([name]) => {
    return hasOwnProperty.call(dateFieldOrder, name);
  });
  dateFields = dateFields.sort(([nameA, a], [nameB, b]) => {
    return (
      new Date(b).getTime() +
      dateFieldOrder[nameB] -
      (new Date(a).getTime() + dateFieldOrder[nameA])
    );
  });
  const latestDateField = dateFields[0];
  if (latestDateField == null) {
    return null;
  }
  return {
    name: latestDateField[0],
    value: latestDateField[1],
  };
}

function Over({ label, children }) {
  const userCanHover = window.matchMedia('(hover: hover)').matches;
  if (userCanHover) {
    return <Tooltip label={label}>{children}</Tooltip>;
  }
  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>{label}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

function PermitTimeline({ permit }) {
  const latestDateField = getLatestDateField(permit);
  if (latestDateField == null) {
    return null;
  }
  return (
    <Tr>
      <Td colSpan={2}>
        {Object.entries(dateFieldLabel)
          .filter(([fieldName]) => {
            if (hasOwnProperty.call(permit, fieldName)) {
              return true;
            }
            return (
              dateFieldOrder[fieldName] > dateFieldOrder[latestDateField.name]
            );
          })
          .map(([fieldName, label], index) => {
            const color =
              latestDateField?.name === fieldName ? 'green' : 'gray';
            return (
              <Fragment key={fieldName}>
                {index === 0 ? null : <ArrowForwardIcon />}
                <Over label={formatDateStr(permit[fieldName])}>
                  <Badge colorScheme={color}>{label}</Badge>
                </Over>
              </Fragment>
            );
          })}
      </Td>
    </Tr>
  );
}

function Permits({ data }) {
  const colorBag = useColorBag();
  const permits = data.map((permit, index) => {
    return (
      <AccordionItem
        key={permit.permit_number}
        borderTopWidth={index === 0 ? 0 : void 0}
      >
        <Heading>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              {permit.permit_number}
            </Box>
            <Flex gap={2}>
              <SmartColoredBadge label={permit.worktype} colorBag={colorBag} />
              <SmartColoredBadge
                label={permit.application_type}
                colorBag={colorBag}
              />
            </Flex>
            <AccordionIcon />
          </AccordionButton>
        </Heading>
        <AccordionPanel pb={4}>
          <Table variant="simple">
            <Tbody>
              <PermitTimeline permit={permit} />
              <OptionalRow
                label="Application type"
                data={permit.application_type}
              />
              <OptionalRow label="Work type" data={permit.worktype} />
              <OptionalRow
                label="Contractor name"
                data={permit.contractor_name}
              />
              <OptionalRow
                label="Contractor address"
                data={permit.contractor_address}
              />
              <OptionalRow
                label="Contractor phone number"
                data={permit.contractor_phone_number}
              />
              <OptionalRow
                label="Estimated cost"
                data={formatCurrencyAmount(permit.estimated_cost)}
              />
              <OptionalRow
                label="Parcel owner name"
                data={permit.parcel_owner_name}
              />
              <OptionalRow
                label="Property owner name"
                data={permit.property_owner_name}
              />
              {/* <Tr> */}
              {/*   <Th>Debug</Th> */}
              {/*   <Td>{JSON.stringify(permit)}</Td> */}
              {/* </Tr> */}
            </Tbody>
          </Table>
        </AccordionPanel>
      </AccordionItem>
    );
  });
  return (
    <>
      <div>
        <Heading mb={4} size={'sm'}>
          Permits:{' '}
        </Heading>
      </div>
      <Card variant={'outline'}>
        <Accordion allowMultiple>{permits}</Accordion>
      </Card>
    </>
  );
}

export default function Lot({ id }) {
  const [data, isLoading] = useLotData(id);
  const [lotNumber, setLotNumber] = useState(null);
  const { colorMode } = useColorMode();

  useEffect(() => {
    setLotNumber(parcelNumberToLotNumber(id));
  }, [setLotNumber, id]);

  if (isLoading && data.length === 0) {
    return <CircularProgress isIndeterminate />;
  }

  // Find first permit that contains an address
  const address = data.find((permit) =>
    Boolean(permit.permit_address)
  )?.permit_address;

  return (
    <Box as="section" w={'full'}>
      <Box
        as="header"
        w={'full'}
        p={4}
        borderBottomWidth={1}
        borderBottomColor={'chakra-border'}
        bg={colorMode === 'light' ? 'teal.900' : 'teal.200'}
        className="hero"
        mb={12}
        position="relative"
      >
        <Box pt={'32'} pb="10">
          <Heading
            size={'2xl'}
            color={'chakra-body-bg'}
            textAlign={'center'}
            mb="3"
          >
            <strong>LOT #:</strong> {lotNumber}
          </Heading>
          <Text
            fontSize={'xl'}
            maxWidth="578px"
            mx={'auto'}
            color={'chakra-body-bg'}
            opacity={0.8}
            textAlign={'center'}
          >
            {address && (
              <>
                <strong>Address:</strong> {address}
              </>
            )}
          </Text>
        </Box>
      </Box>
      <Container maxW="container.xl">
        <Permits data={data} />
      </Container>
    </Box>
  );
}

export async function getStaticPaths() {
  const apiUrl = `https://data.cityoforlando.net/resource/5pzm-dn5w.json?application_type=Building Permit&worktype=New`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return {
      paths: Object.values(
        data.reduce((acc, permit) => {
          acc[permit.parcel_number] = { params: { id: permit.parcel_number } };
          return acc;
        }, {})
      ),
      fallback: false,
    };
  } catch (error) {
    console.error(error);
    return {
      paths: [],
      fallback: false,
    };
  }
}

export async function getStaticProps({ params }) {
  return { props: params };
}
