// --- React / Nextjs
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

//  ---- Libs
import {
  Box,
  Flex,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useBreakpointValue,
  Container,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  // TODO: Add resources page
  { label: 'Resources', href: '#' },
  //  TODO: Add google form for feedback
  { label: 'Got feedback or ideas?', href: '#' },
];

const Nav: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [hasScrolled, setHasScrolled] = useState<boolean>(scrollY > 50);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    onClose();
  };

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
    setHasScrolled(window.scrollY > 50);
  }, [setScrollY, setHasScrolled]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const NavLinks = NAV_ITEMS.map((item, index) => {
    const getTextColor = () => {
      if (activeIndex === index) {
        return '#00DC82';
      } else if (hasScrolled || isMobile) {
        return 'chakra-text-color';
      } else {
        return 'chakra-body-bg';
      }
    };

    return (
      <Box
        as={Link}
        href={item.href}
        key={index}
        py={4}
        px={4}
        cursor="pointer"
        fontSize="lg"
        color={getTextColor()}
        _hover={{
          color: '#00DC82',
        }}
        onClick={() => handleItemClick(index)}
      >
        {item.label}
      </Box>
    );
  });

  return (
    <Flex
      w="full"
      position="fixed"
      top={0}
      transition="all 0.2s"
      left={0}
      zIndex="sticky"
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      py={hasScrolled ? 2 : 8}
      bg={hasScrolled ? 'chakra-body-bg' : 'transparent'}
      boxShadow={hasScrolled ? 'sm' : 'none'}
      borderBottom={hasScrolled ? '1px' : 'none'}
      borderBottomColor={hasScrolled ? 'chakra-border-color' : 'none'}
    >
      <Container maxW={'container.xl'}>
        <Flex as="nav" align="center" justify="space-between" wrap="wrap">
          <Box>
            <Box
              as={Link}
              href="/"
              fontWeight="bold"
              fontSize="2xl"
              color={hasScrolled ? 'chakra-text-color' : 'chakra-body-bg'}
            >
              Summerdale Park
            </Box>
          </Box>

          <Box display={{ base: 'block', md: 'none' }}>
            <IconButton
              aria-label="Menu"
              icon={<HamburgerIcon />}
              onClick={onOpen}
            />
          </Box>

          <Box
            display={{ base: 'none', md: 'flex' }}
            width={{ base: 'full', md: 'auto' }}
            alignItems="center"
            justifyContent={'flex-end'}
            flexGrow={1}
          >
            {NavLinks}
          </Box>
        </Flex>
      </Container>

      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            {NavLinks}
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </Flex>
  );
};

export default Nav;
