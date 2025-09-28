import { ReactNode } from 'react';
import { Page } from '@/components/PageLayout';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Page.Header />
      <Page.Main>
        {children}
      </Page.Main>
    </>
  );
}


