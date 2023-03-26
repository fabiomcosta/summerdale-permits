// --- React / Nextjs
import { useRouter } from 'next/router';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--nunito-font',
});

// --- Libs
import { ChakraProvider, Box, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

// --- Assets
import '@/styles/globals.css';

// --- Assets
import MainNav from '@/components/MainNav';

function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <ChakraProvider>
      <MainNav />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="w-full h-full"
          key={router.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.35 }}
        >
          <Component
            className={nunito.variable}
            {...pageProps}
            key={router.asPath}
          />
          <Box
            mt={12}
            as="footer"
            w={'full'}
            p={6}
            borderTopWidth={1}
            borderTopColor="chakra-border-color"
            bg="chakra-subtle-bg"
            textAlign="center"
          >
            <Text>
              Created by Agnel Nieves, Fabio Costa and Bruno Albuquerque
            </Text>
          </Box>
        </motion.div>
      </AnimatePresence>
    </ChakraProvider>
  );
}

export default App;
