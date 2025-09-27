
import FooterSection from '@/components/footer';
import { Navbar } from '@/components/header';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <FooterSection />
    </>
  );
}