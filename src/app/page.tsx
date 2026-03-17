import { FloatingNav } from "@/components/aceternity/floating-navbar";
import { GeodeBrand } from "@/components/ui/geode-brand";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactSection } from "@/components/sections/contact-section";
import {
  IconHome,
  IconUser,
  IconCode,
  IconBriefcase,
} from "@tabler/icons-react";

const navItems = [
  { name: "Home", link: "#home", icon: <IconHome size={16} /> },
  { name: "About", link: "#about", icon: <IconUser size={16} /> },
  { name: "Skills", link: "#skills", icon: <IconCode size={16} /> },
  { name: "Projects", link: "#projects", icon: <IconBriefcase size={16} /> },
];

export default function Home() {
  return (
    <main className="bg-black">
      <GeodeBrand />
      <FloatingNav navItems={navItems} />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}
