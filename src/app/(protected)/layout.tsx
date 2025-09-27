import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Page } from '@/components/PageLayout';

interface TabsLayoutProps {
  children: ReactNode;
}

export default async function TabsLayout({ children }: TabsLayoutProps) {
  const cookieStore = await cookies();
  const isVerified = cookieStore.get('fw_verified')?.value === 'true';

  if (!isVerified) {
    redirect('/onboarding');
  }

  return (
    <Page>
      {children}
      <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
        <Navigation />
      </Page.Footer>
    </Page>
  );
}
