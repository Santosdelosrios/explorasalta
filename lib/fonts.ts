import {Lexend_Deca, Tenor_Sans} from 'next/font/google';

export const headingFont = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-heading'
});

export const bodyFont = Tenor_Sans({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-body'
});
