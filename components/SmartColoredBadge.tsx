import { useMemo } from 'react';
import { Badge } from '@chakra-ui/react';

const { hasOwnProperty } = Object.prototype;

const availableColors = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'cyan',
  'purple',
  'pink',
  'linkedin',
  'facebook',
  'whatsapp',
  'twitter',
  'telegram',
];

type ColorBag = {
  reserveColorForId: (id: string) => string;
};

function createColorBag(): ColorBag {
  const reservedColorIndexesToId: { [index: number]: string } = {};
  const idToReservedColorIndex: { [id: string]: number } = {};
  return {
    reserveColorForId(id: string): string {
      if (hasOwnProperty.call(idToReservedColorIndex, id)) {
        return availableColors[idToReservedColorIndex[id]];
      }

      // This is a stable hash for a string, very simplistic, and different
      // strings can have the same hash, but the same string always
      // has the same hash.
      const idNumericalHash = id
        .split('')
        .map((char) => char.charCodeAt(0))
        .reduce((acc, code) => acc + code, 0);

      // From the number we map to an array index inside availableColors
      const idColorIndex = idNumericalHash % availableColors.length;

      // idColorIndex can already be reserved to another id, so we try
      // to reserve the next index if that's the case.
      for (let i = 0; i < availableColors.length; i++) {
        const nextColorIndex = (idColorIndex + i) % availableColors.length;
        if (!hasOwnProperty.call(reservedColorIndexesToId, nextColorIndex)) {
          reservedColorIndexesToId[nextColorIndex] = id;
          idToReservedColorIndex[id] = nextColorIndex;
          return availableColors[nextColorIndex];
        }
      }

      // fallback to everything gray once all colors are reserved
      return 'gray';
    },
  };
}

export function useColorBag() {
  return useMemo(createColorBag, []);
}

type Props = {
  label: string;
  colorBag: ColorBag;
};

export function SmartColoredBadge({ label, colorBag }: Props) {
  const colorScheme = colorBag.reserveColorForId(label);
  return <Badge colorScheme={colorScheme}>{label}</Badge>;
}
