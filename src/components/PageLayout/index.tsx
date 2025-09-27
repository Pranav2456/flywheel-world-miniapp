import clsx from 'clsx';
import { ReactNode } from 'react';
import { SafeAreaView } from '@worldcoin/mini-apps-ui-kit-react';
import { twMerge } from 'tailwind-merge';

export const Page = (props: { children: ReactNode; className?: string }) => {
  return (
    <SafeAreaView
      asChild
      className={twMerge(clsx('flex h-dvh flex-col bg-white', props.className))}
    >
      <div>{props.children}</div>
    </SafeAreaView>
  );
};

const Header = (props: { children: ReactNode; className?: string }) => {
  return (
    <header
      className={twMerge(
        'bg-white flex flex-col justify-center px-6 pt-6 pb-3 z-10',
        clsx(props.className),
      )}
    >
      {props.children}
    </header>
  );
};

const Main = (props: { children: ReactNode; className?: string }) => {
  return (
    <main
      className={twMerge(
        clsx('grow overflow-y-auto px-6 pt-3 pb-12', props.className),
      )}
    >
      {props.children}
    </main>
  );
};

const Footer = (props: { children: ReactNode; className?: string }) => {
  return (
    <footer className={twMerge('px-6 pb-[35px]', clsx(props.className))}>
      {props.children}
    </footer>
  );
};

Page.Header = Header;
Page.Main = Main;
Page.Footer = Footer;
