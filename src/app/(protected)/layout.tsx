import { ReactNode } from 'react';
import { Navigation } from '@/components/Navigation';
import { Page } from '@/components/PageLayout';

interface TabsLayoutProps {
  children: ReactNode;
}

export default function TabsLayout({ children }: TabsLayoutProps) {
  return (
    <Page>
      {children}
      <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
        <Navigation />
      </Page.Footer>
    </Page>
  );
}
