import { Carousel } from "@/components/carousel";
import ContactSection from "@/components/contact-us";
import Features from "@/components/features-12";
import FooterSection from "@/components/footer";
import { Navbar } from "@/components/header";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-1";
import Pricing from "@/components/pricing";
import WallOfLoveSection from "@/components/testimonials";

export default function Home() {
  return (
    <>
    <Navbar></Navbar>
    <HeroSection></HeroSection>
    <Features></Features>
    <IntegrationsSection></IntegrationsSection>
    <Pricing></Pricing>
    <ContactSection></ContactSection>
    <WallOfLoveSection></WallOfLoveSection>
    <FooterSection></FooterSection>
    </>
  );
}
