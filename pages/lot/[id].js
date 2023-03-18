import { useEffect, useState, useCallback } from 'react';
import {
  useColorBag,
  SmartColoredBadge,
} from '../../components/SmartColoredBadge';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  Container,
  CircularProgress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

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

function OptionalDate({ label, date }) {
  return <OptionalRow label={label} data={formatDateStr(date)} />;
}

function Permits({ data }) {
  const colorBag = useColorBag();
  const permits = data.map((permit, index) => {
    return (
      <AccordionItem
        key={permit.permit_number}
        borderTopWidth={index === 0 ? 0 : void 0}
      >
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              {permit.permit_number}
            </Box>
            <SmartColoredBadge
              label={permit.application_type}
              colorBag={colorBag}
            />
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Table variant="simple">
            <Tbody>
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

              <OptionalDate
                label="Processed date"
                date={permit.processed_date}
              />
              <OptionalDate
                label="Under review date"
                date={permit.under_review_date}
              />
              <OptionalDate
                label="Review started including"
                date={permit.review_started_including}
              />
              <OptionalDate
                label="Prescreen completed date"
                date={permit.prescreen_completed_date}
              />
              <OptionalDate
                label="Review started date excluding"
                date={permit.review_started_date_excluding}
              />
              <OptionalDate
                label="Collect permit fees date"
                date={permit.collect_permit_fees_date}
              />
              <OptionalDate
                label="Pending issuance date"
                date={permit.pending_issuance_date}
              />
              <OptionalDate
                label="Issue permit date"
                date={permit.issue_permit_date}
              />
              <OptionalDate
                label="PDOX batch date"
                date={permit.pdoxbatch_date}
              />
              <OptionalDate label="Final date" date={permit.final_date} />
              <OptionalDate label="COO date" date={permit.coo_date} />

              <Tr>
                <Th>Debug</Th>
                <Td>{JSON.stringify(permit)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </AccordionPanel>
      </AccordionItem>
    );
  });
  return (
    <>
      <div>
        <strong>Permits:</strong>
      </div>
      <Card variant={'outline'}>
        <Accordion allowMultiple>{permits}</Accordion>
      </Card>
    </>
  );
}

export default function Lot({ id }) {
  const router = useRouter();
  const [data, isLoading] = useLotData(id);

  const lotNumber = parcelNumberToLotNumber(router.query.id);

  if (isLoading && data.length === 0) {
    return <CircularProgress isIndeterminate />;
  }

  // Find first permit that contains an address
  const address = data.find((permit) =>
    Boolean(permit.permit_address)
  )?.permit_address;

  return (
    <Box as="section" w={'full'} p={4}>
      <Container maxW="container.xl">
        <div>
          <strong>LOT #:</strong> {lotNumber}
        </div>
        {address != null ? (
          <div>
            <strong>Address:</strong> {address}
          </div>
        ) : null}
        <Permits data={data} />
      </Container>
    </Box>
  );
}

export async function getStaticPaths() {
  const apiUrl = `https://data.cityoforlando.net/resource/5pzm-dn5w.json?application_type=Building Permit`;
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
}

export async function getStaticProps({ params }) {
  return { props: params };
}
