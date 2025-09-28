'use client';

import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';

const Section = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
  <section className={clsx('w-full max-w-md px-4', className)}>{children}</section>
);

const Header = ({ className, children }: PropsWithChildren<{ className?: string }>) => {
  const router = useRouter();
  return (
    <header className={clsx('w-full max-w-md px-4', className)}>
      <div className="flex items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600"
        >
          Back
        </button>
        <div className="flex-1" />
      </div>
      {children}
    </header>
  );
};

const Main = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
  <main className={clsx('w-full max-w-md px-4', className)}>{children}</main>
);

export const PageHeader = Header;
export const PageMain = Main;
export const PageSection = Section;

export const Page = { Header, Main, Section };
