'use client';

import SellerAdminLayout from './admin-layout';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerAdminLayout>{children}</SellerAdminLayout>;
}