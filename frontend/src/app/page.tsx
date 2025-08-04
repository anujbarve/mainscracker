import Features from "@/components/features-12";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import Pricing from "@/components/pricing";
import WallOfLoveSection from "@/components/testimonials";

export default function Home() {
  return (
    <>
    <HeroSection></HeroSection>
    <Features></Features>
    <WallOfLoveSection></WallOfLoveSection>
    <Pricing></Pricing>
    <FooterSection></FooterSection>
    </>
  );
}
