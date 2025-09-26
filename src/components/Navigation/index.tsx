'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Bank, Home, User } from 'iconoir-react';
import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * This component uses the UI Kit to navigate between pages
 * Bottom navigation is the most common navigation pattern in Mini Apps
 * We require mobile first design patterns for mini apps
 * Read More: https://docs.world.org/mini-apps/design/app-guidelines#mobile-first
 */

export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = useMemo(() => {
    if (!pathname) return 'home';
    if (pathname.startsWith('/requests')) return 'requests';
    if (pathname.startsWith('/requester')) return 'requester';
    if (pathname.startsWith('/resolver')) return 'resolver';
    return 'home';
  }, [pathname]);

  const onChange = (value: string) => {
    switch (value) {
      case 'home':
        router.push('/home');
        break;
      case 'requests':
        router.push('/requests');
        break;
      case 'requester':
        router.push('/requester');
        break;
      case 'resolver':
        router.push('/resolver');
        break;
      default:
        router.push('/home');
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={onChange}>
      <TabItem value="home" icon={<Home />} label="Home" />
      <TabItem value="requests" icon={<Bank />} label="Requests" />
      <TabItem value="requester" icon={<User />} label="Requester" />
      <TabItem value="resolver" icon={<User />} label="Resolver" />
    </Tabs>
  );
};
