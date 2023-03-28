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
  useMediaQuery,
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

const DATE_FIELDS = {
  processed_date: { order: 1, label: 'Processed' },
  prescreen_completed_date: { order: 2, label: 'Prescreen' },
  under_review_date: { order: 3, label: 'Under review' },
  review_started_including: { order: 4, label: 'Review started' },
  review_started_date_excluding: { order: 4, label: 'Review started' },
  collect_permit_fees_date: { order: 5, label: 'Collect fees' },
  pending_issuance_date: { order: 6, label: 'Pending issuance' },
  issue_permit_date: { order: 7, label: 'Issued' },
  final_date: { order: 8, label: 'Done' },
};

function getLatestDateField(permit) {
  let dateFields = Object.entries(permit).filter(([name]) => {
    return hasOwnProperty.call(DATE_FIELDS, name);
  });
  dateFields = dateFields.sort(([nameA, a], [nameB, b]) => {
    return (
      new Date(b).getTime() +
      DATE_FIELDS[nameB].order -
      (new Date(a).getTime() + DATE_FIELDS[nameA].order)
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
  const [userCanHover] = useMediaQuery('(hover: hover)');
  if (label == null) {
    return children;
  }
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
        {Object.entries(DATE_FIELDS)
          .filter(([fieldName, { order }]) => {
            if (hasOwnProperty.call(permit, fieldName)) {
              return true;
            }
            // This lets us keep the future date fields so that users
            // can see what is coming up.
            // If the order of the current field is smaller than the last field
            // and it's not present in the permit that means this particular
            // permit doesn't have the "step" that the date field represents
            // so we filter the date field out.
            return order > DATE_FIELDS[latestDateField.name].order;
          })
          // At this point this is mostly to remove review_started_date_excluding
          // in case there is already a review_started_including field that
          // we'll be showing. That way we don't show `Review started` twice.
          .filter(([, { order }], index, dateFields) => {
            const previousFieldOrder = dateFields[index - 1]?.[1].order;
            return order !== previousFieldOrder;
          })
          .map(([fieldName, { label }], index) => {
            const color =
              latestDateField?.name === fieldName ? 'green' : 'gray';
            const dateFieldValue = permit[fieldName];
            return (
              <Fragment key={fieldName}>
                {index === 0 ? null : <ArrowForwardIcon />}
                <Over label={formatDateStr(dateFieldValue)}>
                  <Badge
                    sx={
                      dateFieldValue ? { cursor: 'pointer' } : { opacity: 0.4 }
                    }
                    colorScheme={color}
                  >
                    {label}
                  </Badge>
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
