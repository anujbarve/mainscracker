import { Carousel } from "@/components/carousel";
import Features from "@/components/features-12";
import FooterSection from "@/components/footer";
import { Navbar } from "@/components/header";
import Pricing from "@/components/pricing";
import WallOfLoveSection from "@/components/testimonials";

export default function Home() {
  return (
    <>
    <Navbar></Navbar>
    <Carousel></Carousel>
    <Features></Features>
    <WallOfLoveSection></WallOfLoveSection>
    <Pricing></Pricing>
    <FooterSection></FooterSection>
    </>
  );
}
