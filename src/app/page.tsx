import { GeodeBrand } from "@/components/ui/geode-brand";
import { PageLoader } from "@/components/ui/page-loader";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  return (
    <PageLoader>
      <main id="main-content" className="bg-black h-screen overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <GeodeBrand />
        <div data-section="home" className="md:sticky md:top-0 z-[1] md:h-screen md:overflow-hidden"><HeroSection /></div>
        <div data-section="projects" className="md:sticky md:top-0 z-[2] md:h-screen md:overflow-hidden bg-black"><ProjectsSection /></div>
        <div data-section="skills" className="md:sticky md:top-0 z-[3] md:h-screen md:overflow-hidden bg-black"><SkillsSection /></div>
        <div data-section="about" className="md:sticky md:top-0 z-[4] md:h-screen md:overflow-hidden bg-black"><AboutSection /></div>
        <div data-section="contact" className="md:sticky md:top-0 z-[5] md:h-screen md:overflow-hidden bg-black"><ContactSection /></div>
      </main>
    </PageLoader>
  );
}
