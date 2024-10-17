import { extendTheme, typography, type ThemeConfig } from '@chakra-ui/react'
import { Inter, Rubik } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const rubik = Rubik({ subsets: ["latin"] });

const theme = extendTheme({ 
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: true,
  },
  fonts: {
    heading: rubik.style.fontFamily,
    body: inter.style.fontFamily,
    mono: inter.style.fontFamily
  }
})

export default theme