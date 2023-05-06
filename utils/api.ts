/**
 * This module helps with interacting with the cityoforlando.net API.
 * docs: https://dev.socrata.com/foundry/data.cityoforlando.net/5pzm-dn5w
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

const { hasOwnProperty } = Object.prototype;

type Permit = {
  permit_number: string;
  // TODO define this an enum in the future once we are certain about all values.
  application_type: string;
  parcel_number: string;
  // TODO define this an enum in the future once we are certain about all values.
  worktype: string;
  permit_address: string;
  property_owner_name: string;
  parcel_owner_name: string;
  contractor: string;
  contractor_name: string;
  contractor_address: string;
  contractor_phone_number: string;
  plan_review_type: string;
  estimated_cost: string;
  of_cycles: string; // ex: '1'
  of_pdoxwkflw: string; // ex: '0'

  // date fields
  processed_date: string; // This is the first step, so all permits seem to have it
  // optional date fields
  under_review_date?: string;
  prescreen_completed_date?: string;
  review_started_including?: string;
  review_started_date_excluding?: string;
  collect_permit_fees_date?: string;
  pending_issuance_date?: string;
  issue_permit_date?: string;
  final_date?: string;
  coo_date?: string;
};

type ApplicationType = 'building' | 'plumbing' | 'electrical' | 'mechanical';

type LotData = {
  id: string; // same as parcel_number
  number: number; // lot number, extracted from the parcel_number
  address: string; // same as permit_address;
  permits: { [_ in ApplicationType]?: Permit };
  __searchIndex: string;
};

type PermitParams = Partial<{ [_ in keyof Permit]: string | number }>;

const BLOCKLIST_BY_PARCEL_NUMBER = {
  312431779300120: 1, // lot 12
};

function toSnakeCase(str: string): string {
  return str.toLowerCase().replaceAll(' ', '_');
}

function compressApplicationType(applicationType: string): ApplicationType {
  return toSnakeCase(applicationType).replace(
    /_permit$/,
    ''
  ) as ApplicationType;
}

export function parcelNumberToLotNumber(parcelNumber: string): number {
  return Number(parcelNumber.slice(-5, -1));
}

export async function fetchPermits(
  params: PermitParams
): Promise<Array<Permit>> {
  const url = new URL('https://data.cityoforlando.net/resource/5pzm-dn5w.json');
  Object.entries(params).forEach(([name, value]) => {
    url.searchParams.set(name, String(value));
  });
  const response = await fetch(url.toString());
  const permits: Array<Permit> = await response.json();
  return permits.filter((permit) => {
    return !hasOwnProperty.call(
      BLOCKLIST_BY_PARCEL_NUMBER,
      permit.parcel_number
    );
  });
}

export function usePermitData(params: PermitParams): [Array<Permit>, boolean] {
  const [data, setData] = useState<Array<Permit>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getData = useCallback(async () => {
    try {
      let data = await fetchPermits(params);
      data = data.sort(
        (a, b) =>
          new Date(a.processed_date).getTime() -
          new Date(b.processed_date).getTime()
      );
      setData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setData]);

  useEffect(() => {
    getData();
  }, [getData]);

  return [data, isLoading];
}

export function useLotData(searchValue: string): [Array<LotData>, boolean] {
  const [permitData, isLoading] = usePermitData({
    // application_type: 'Building Permit',
    worktype: 'New',
  });

  const lotData = useMemo(() => {
    const lots = permitData.reduce((acc, permit) => {
      const lotNumber = parcelNumberToLotNumber(permit.parcel_number);
      const applicationType = compressApplicationType(permit.application_type);
      if (hasOwnProperty.call(acc, lotNumber)) {
        const currentPermit = acc[lotNumber].permits[applicationType];
        // We are assuming that the oldest permit is the source of truth
        if (
          !currentPermit ||
          new Date(permit.processed_date).getTime() <
            new Date(currentPermit.processed_date).getTime()
        ) {
          acc[lotNumber].permits[applicationType] = permit;
        }
      } else {
        const address = permit.permit_address;
        acc[lotNumber] = {
          // Haha... this makes the search logic easier
          __searchIndex: `${lotNumber} ${address}`.toLowerCase(),
          id: permit.parcel_number,
          number: lotNumber,
          address,
          permits: { [applicationType]: permit },
        };
      }
      return acc;
    }, {} as { [parcel_number: string]: LotData });

    return Object.values(lots);
  }, [permitData]);

  let filteredLotData = lotData;
  if (searchValue !== '') {
    const searchTokens = searchValue.toLowerCase().split(' ');
    filteredLotData = lotData.filter((lot) => {
      return searchTokens.some((token) => lot.__searchIndex.includes(token));
    });
  }

  return [filteredLotData, isLoading];
}
