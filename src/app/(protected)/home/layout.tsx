import { ReactNode } from 'react';
import { PageHeader, PageMain } from '@/components/PageLayout';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader />
      <PageMain>
        {children}
      </PageMain>
    </>
  );
}


