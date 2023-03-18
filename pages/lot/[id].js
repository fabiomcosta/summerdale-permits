import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
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
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

function formatCurrencyAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function useLotData() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getData = useCallback(async () => {
    try {
      // docs: https://dev.socrata.com/foundry/data.cityoforlando.net/5pzm-dn5w
      const apiUrl = `https://data.cityoforlando.net/resource/5pzm-dn5w.json?parcel_number=${router.query.id}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log(data);
      setData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [setData, router.query.id]);

  useEffect(() => {
    getData();
  }, [getData]);

  return [data, isLoading];
}

function OptionalDate({ label, date }) {
  if (date == null) {
    return null;
  }
  return (
    <Tr>
      <Th>{label}</Th>
      <Td>{formatDateStr(date)}</Td>
    </Tr>
  );
}

function Permits({ data }) {
  const permits = data.map((permit) => {
    return (
      <AccordionItem key={permit.permit_number}>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              {permit.permit_number}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Table variant="simple">
            <Tbody>
              <Tr>
                <Th>Application type</Th>
                <Td>{permit.application_type}</Td>
              </Tr>
              <Tr>
                <Th>Work type</Th>
                <Td>{permit.worktype}</Td>
              </Tr>
              <Tr>
                <Th>Contractor name</Th>
                <Td>{permit.contractor_name}</Td>
              </Tr>
              <Tr>
                <Th>Contractor address</Th>
                <Td>{permit.contractor_address}</Td>
              </Tr>
              <Tr>
                <Th>Contractor phone number</Th>
                <Td>{permit.contractor_phone_number}</Td>
              </Tr>
              <Tr>
                <Th>Estimated cost</Th>
                <Td>{formatCurrencyAmount(permit.estimated_cost)}</Td>
              </Tr>
              <Tr>
                <Th>Parcel owner name</Th>
                <Td>{permit.parcel_owner_name}</Td>
              </Tr>
              <Tr>
                <Th>Property owner name</Th>
                <Td>{permit.property_owner_name}</Td>
              </Tr>
              <OptionalDate
                label="Issue permit date"
                date={permit.issue_permit_date}
              />
              <OptionalDate
                label="Prescreen completed date"
                date={permit.prescreen_completed_date}
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
                label="Review started date excluding"
                date={permit.review_started_date_excluding}
              />
              <OptionalDate
                label="Pending issuance date"
                date={permit.pending_issuance_date}
              />
              <OptionalDate
                label="Collect permit fees date"
                date={permit.collect_permit_fees_date}
              />
              <OptionalDate label="Final date" date={permit.final_date} />
              <OptionalDate label="COO date" date={permit.coo_date} />
              <OptionalDate
                label="PDOX batch date"
                date={permit.pdoxbatch_date}
              />
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
      <Accordion allowMultiple>{permits}</Accordion>
    </>
  );
}

export default function Lot() {
  const router = useRouter();
  const [data, isLoading] = useLotData();

  const lotNumber = parcelNumberToLotNumber(router.query.id);

  if (isLoading && data.length === 0) {
    return <CircularProgress isIndeterminate />;
  }

  // Find first permit that contains an address
  const address = data.find((permit) =>
    Boolean(permit.permit_address)
  )?.permit_address;

  return (
    <div>
      <div>
        <strong>LOT #:</strong> {lotNumber}
      </div>
      {address != null ? (
        <div>
          <strong>Address:</strong> {address}
        </div>
      ) : null}
      <Permits data={data} />
    </div>
  );
}
