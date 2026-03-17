"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { IconBrandGithub, IconBuildingStore, IconBrain, IconCube } from "@tabler/icons-react";
import { Magnetic } from "@/components/ui/magnetic";

const TenzorSmallIcon = () => (
  <svg width="30" height="30" viewBox="0 0 308 479" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M217.193 10.0027C229.649 46.7203 255.79 65.6079 288.587 81.3969" stroke="white" strokeWidth="35" strokeLinecap="round"/>
    <path d="M24.8409 82.0027H289.841" stroke="white" strokeWidth="35" strokeLinecap="round"/>
    <path d="M5.48363e-06 478.094V114.457H84.0909V142.298H31.8182V450.253H84.0909V478.094H5.48363e-06ZM307.99 114.457V478.094H223.899V450.253H276.172V142.298H223.899V114.457H307.99Z" fill="white" strokeWidth="10" paintOrder="stroke fill"/>
    <path d="M140.421 211.706H96.4757L87.3936 236.608L72.8917 235.29L75.089 192.809H233.585L235.636 235.29L221.28 236.608L212.052 211.706H168.253V371.667L190.665 376.647L187.735 391.003H120.939L118.009 376.647L140.421 371.667V211.706Z" fill="white" strokeWidth="10" paintOrder="stroke fill"/>
  </svg>
);

const TenzorFullLogo = () => (
  <svg width="100%" height="100%" viewBox="0 0 1490 479" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M217.193 10.0027C229.649 46.7203 255.79 65.6079 288.587 81.3969" stroke="white" strokeWidth="22" strokeLinecap="round"/>
    <path d="M24.8409 82.0027H289.841" stroke="white" strokeWidth="22" strokeLinecap="round"/>
    <path d="M5.48363e-06 478.094V114.457H84.0909V142.298H31.8182V450.253H84.0909V478.094H5.48363e-06ZM307.99 114.457V478.094H223.899V450.253H276.172V142.298H223.899V114.457H307.99Z" fill="white"/>
    <path d="M140.421 211.706H96.4757L87.3936 236.608L72.8917 235.29L75.089 192.809H233.585L235.636 235.29L221.28 236.608L212.052 211.706H168.253V371.667L190.665 376.647L187.735 391.003H120.939L118.009 376.647L140.421 371.667V211.706Z" fill="white"/>
    <path d="M533.378 174.483V210.103H485.018V357.003H440.558V210.103H392.198V174.483H533.378ZM697.651 282.123C697.651 286.283 697.391 290.616 696.871 295.123H596.251C596.945 304.136 599.805 311.069 604.831 315.923C610.031 320.603 616.358 322.943 623.811 322.943C634.905 322.943 642.618 318.263 646.951 308.903H694.271C691.845 318.436 687.425 327.016 681.011 334.643C674.771 342.269 666.885 348.249 657.351 352.583C647.818 356.916 637.158 359.083 625.371 359.083C611.158 359.083 598.505 356.049 587.411 349.983C576.318 343.916 567.651 335.249 561.411 323.983C555.171 312.716 552.051 299.543 552.051 284.463C552.051 269.383 555.085 256.209 561.151 244.943C567.391 233.676 576.058 225.009 587.151 218.943C598.245 212.876 610.985 209.843 625.371 209.843C639.411 209.843 651.891 212.789 662.811 218.683C673.731 224.576 682.225 232.983 688.291 243.903C694.531 254.823 697.651 267.563 697.651 282.123ZM652.151 270.423C652.151 262.796 649.551 256.729 644.351 252.223C639.151 247.716 632.651 245.463 624.851 245.463C617.398 245.463 611.071 247.629 605.871 251.963C600.845 256.296 597.725 262.449 596.511 270.423H652.151ZM814.706 210.363C831.693 210.363 845.213 215.909 855.266 227.003C865.493 237.923 870.606 253.003 870.606 272.243V357.003H826.406V278.223C826.406 268.516 823.893 260.976 818.866 255.603C813.84 250.229 807.08 247.543 798.586 247.543C790.093 247.543 783.333 250.229 778.306 255.603C773.28 260.976 770.766 268.516 770.766 278.223V357.003H726.306V211.923H770.766V231.163C775.273 224.749 781.34 219.723 788.966 216.083C796.593 212.269 805.173 210.363 814.706 210.363ZM948.302 320.343H1011.22V357.003H898.642V321.643L958.962 248.583H899.162V211.923H1009.92V247.283L948.302 320.343ZM1106.93 359.083C1092.71 359.083 1079.89 356.049 1068.45 349.983C1057.18 343.916 1048.25 335.249 1041.67 323.983C1035.25 312.716 1032.05 299.543 1032.05 284.463C1032.05 269.556 1035.34 256.469 1041.93 245.203C1048.51 233.763 1057.53 225.009 1068.97 218.943C1080.41 212.876 1093.23 209.843 1107.45 209.843C1121.66 209.843 1134.49 212.876 1145.93 218.943C1157.37 225.009 1166.38 233.763 1172.97 245.203C1179.55 256.469 1182.85 269.556 1182.85 284.463C1182.85 299.369 1179.47 312.543 1172.71 323.983C1166.12 335.249 1157.02 343.916 1145.41 349.983C1133.97 356.049 1121.14 359.083 1106.93 359.083ZM1106.93 320.603C1115.42 320.603 1122.61 317.483 1128.51 311.243C1134.57 305.003 1137.61 296.076 1137.61 284.463C1137.61 272.849 1134.66 263.923 1128.77 257.683C1123.05 251.443 1115.94 248.323 1107.45 248.323C1098.78 248.323 1091.59 251.443 1085.87 257.683C1080.15 263.749 1077.29 272.676 1077.29 284.463C1077.29 296.076 1080.06 305.003 1085.61 311.243C1091.33 317.483 1098.43 320.603 1106.93 320.603ZM1256.09 236.103C1261.29 228.129 1267.79 221.889 1275.59 217.383C1283.39 212.703 1292.06 210.363 1301.59 210.363V257.423H1289.37C1278.28 257.423 1269.96 259.849 1264.41 264.703C1258.87 269.383 1256.09 277.703 1256.09 289.663V357.003H1211.63V211.923H1256.09V236.103Z" fill="white"/>
    <path d="M1331.65 348.483H1356.29V363.003H1312.84V285.783H1331.65V348.483ZM1384.08 348.483H1408.72V363.003H1365.27V285.783H1384.08V348.483ZM1414.5 324.283C1414.5 316.656 1416.15 309.873 1419.45 303.933C1422.75 297.919 1427.33 293.263 1433.2 289.963C1439.14 286.589 1445.85 284.903 1453.33 284.903C1462.49 284.903 1470.34 287.323 1476.87 292.163C1483.39 297.003 1487.76 303.603 1489.96 311.963H1469.28C1467.74 308.736 1465.54 306.279 1462.68 304.593C1459.89 302.906 1456.7 302.063 1453.11 302.063C1447.31 302.063 1442.62 304.079 1439.03 308.113C1435.43 312.146 1433.64 317.536 1433.64 324.283C1433.64 331.029 1435.43 336.419 1439.03 340.453C1442.62 344.486 1447.31 346.503 1453.11 346.503C1456.7 346.503 1459.89 345.659 1462.68 343.973C1465.54 342.286 1467.74 339.829 1469.28 336.603H1489.96C1487.76 344.963 1483.39 351.563 1476.87 356.403C1470.34 361.169 1462.49 363.553 1453.33 363.553C1445.85 363.553 1439.14 361.903 1433.2 358.603C1427.33 355.229 1422.75 350.573 1419.45 344.633C1416.15 338.693 1414.5 331.909 1414.5 324.283Z" fill="white"/>
  </svg>
);

const POSHeader = () => (
  <div className="relative flex h-32 w-full overflow-hidden rounded-xl bg-[#080d14]">
    {/* Grid background */}
    <svg className="absolute inset-0 h-full w-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pos-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4a6080" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pos-grid)"/>
    </svg>

    {/* Static shelf products — pure SVG, no motion */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 520 128" preserveAspectRatio="xMidYMid meet">
      {[
        { x: 40, accent: "#4a6080", bg: "#1c2a3a" },
        { x: 64, accent: "#364d63", bg: "#162030" },
        { x: 88, accent: "#2a3d52", bg: "#101820" },
      ].map(({ x, accent, bg }) => (
        <g key={x} transform={`translate(${x}, 44)`}>
          <rect width="18" height="26" rx="3" fill={bg} stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
          <rect width="18" height="5" rx="1.5" fill={accent}/>
          <rect x="3" y="10" width="12" height="1.2" rx="0.6" fill="rgba(255,255,255,0.2)"/>
          <rect x="3" y="14" width="8" height="1.2" rx="0.6" fill="rgba(255,255,255,0.1)"/>
        </g>
      ))}
      {/* Receipt decoration */}
      <g opacity="0.15">
        <rect x="420" y="38" width="60" height="52" rx="4" fill="#1c2a3a" stroke="#4a6080" strokeWidth="0.8"/>
        <rect x="426" y="44" width="48" height="6" rx="1" fill="#4a6080" opacity="0.5"/>
        {[52,58,64,70,76].map((y, i) => (
          <rect key={y} x="426" y={y} width={[36,28,40,24,32][i]} height="1.5" rx="0.75" fill="rgba(255,255,255,0.4)"/>
        ))}
        <rect x="426" y="80" width="18" height="4" rx="1" fill="#4a6080" opacity="0.6"/>
      </g>
    </svg>

    {/* Animated product — HTML div avoids SVG transform conflicts */}
    <motion.div
      className="absolute w-[18px] h-[26px] rounded-[3px] overflow-hidden border"
      style={{ left: 40, top: "50%", marginTop: -13, borderColor: "rgba(74,96,128,0.9)", backgroundColor: "rgba(74,96,128,0.25)" }}
      animate={{ x: [0,0,260,290], y: [0,-16,-16,-2], opacity: [1,1,0.85,0], scale: [1,1,0.88,0.4] }}
      transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 0.9, ease: "easeInOut", times: [0,0.1,0.76,1] }}
    >
      <div className="h-[5px] w-full" style={{ backgroundColor: "#4a6080" }}/>
      <div className="px-[3px] pt-[5px] space-y-[3px]">
        <div className="h-[1.2px] rounded-full bg-white/35"/>
        <div className="h-[1.2px] w-2/3 rounded-full bg-white/25"/>
      </div>
    </motion.div>

    {/* Cart — HTML div so rotate/scale transform-origin works correctly */}
    <motion.div
      className="absolute"
      style={{ right: "28%", top: "50%", marginTop: -16 }}
      animate={{ rotate: [0,0,-7,7,-4,3,0], scale: [1,1,1.08,1.08,1,1,1] }}
      transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 0.9, times: [0,0.73,0.78,0.85,0.91,0.95,1] }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="3" y1="6" x2="21" y2="6" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
        <path d="M16 10a4 4 0 01-8 0" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
      </svg>
      {/* +1 badge */}
      <motion.div
        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
        style={{ backgroundColor: "#4a6080" }}
        animate={{ scale: [0,0,1.4,1,1], opacity: [0,0,1,1,1] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 0.9, times: [0,0.73,0.82,0.92,1] }}
      >
        +1
      </motion.div>
    </motion.div>

    <div className="absolute bottom-3 left-4 text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.22)" }}>
      POS · CRM
    </div>
  </div>
);

const SWATCHES = [
  ["#e63946","#e76f51","#f4a261"],
  ["#2a9d8f","#457b9d","#1d3557"],
  ["#8338ec","#3a86ff","#06d6a0"],
  ["#ffb703","#fb8500","#023047"],
  ["#d62828","#a8dadc","#457b9d"],
];

const ColorPaletteHeader = () => (
  <div className="relative flex h-32 w-full overflow-hidden rounded-xl bg-[#0a0a0a]">
    {/* Animated swatch columns */}
    {Array.from({ length: 5 }).map((_, col) => (
      <div key={col} className="flex flex-1 flex-col">
        {SWATCHES[col].map((color, row) => (
          <motion.div
            key={`${col}-${row}`}
            className="flex-1"
            style={{ backgroundColor: color }}
            animate={{ backgroundColor: SWATCHES[(col + row + 1) % SWATCHES.length][row] }}
            transition={{ duration: 2.5, delay: col * 0.3 + row * 0.15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        ))}
      </div>
    ))}
    {/* frosted label */}
    <div className="pointer-events-none absolute inset-0 flex items-end justify-start p-3">
      <span className="rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-mono text-white/60 backdrop-blur-sm">
        #e63946 · #2a9d8f · #8338ec
      </span>
    </div>
  </div>
);

const ReflectionHeader = () => {
  const W = 260; const H = 128;
  // axis goes from bottom-left to top-right
  const ax1 = { x: 20, y: H - 16 }; const ax2 = { x: W - 20, y: 16 };
  // point A animates along a small arc on the left side
  const aPath = { x: [55, 70, 55], y: [40, 58, 40] };
  // reflected point B mirrors A across the axis (approximate symmetric path)
  const bPath = { x: [180, 165, 180], y: [88, 70, 88] };

  return (
    <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-[#080d14]">
      {/* subtle grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4a6080" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="relative z-10" overflow="visible">
        {/* Axis of reflection */}
        <line x1={ax1.x} y1={ax1.y} x2={ax2.x} y2={ax2.y}
          stroke="rgba(168,181,140,0.5)" strokeWidth="1" strokeDasharray="4 3"/>

        {/* Dashed connector between A and B */}
        <motion.line
          x1={aPath.x[0]} y1={aPath.y[0]}
          animate={{ x1: aPath.x, y1: aPath.y, x2: bPath.x, y2: bPath.y }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          x2={bPath.x[0]} y2={bPath.y[0]}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3"/>

        {/* Axis label */}
        <text x={ax2.x - 16} y={ax2.y - 6} fill="rgba(168,181,140,0.5)" fontSize="8" fontFamily="monospace">y=x</text>

        {/* Point A */}
        <motion.circle
          cx={aPath.x[0]} cy={aPath.y[0]} r={5}
          animate={{ cx: aPath.x, cy: aPath.y }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          fill="#4a6080" stroke="rgba(74,96,128,0.6)" strokeWidth="6"/>
        <motion.text
          x={aPath.x[0] - 14} y={aPath.y[0] + 1}
          animate={{ x: aPath.x.map(v => v - 14), y: aPath.y.map(v => v + 1) }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="monospace" dominantBaseline="middle">
          A
        </motion.text>

        {/* Point B (reflection) */}
        <motion.circle
          cx={bPath.x[0]} cy={bPath.y[0]} r={5}
          animate={{ cx: bPath.x, cy: bPath.y }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          fill="#364d63" stroke="rgba(54,77,99,0.6)" strokeWidth="6"/>
        <motion.text
          x={bPath.x[0] + 8} y={bPath.y[0] + 1}
          animate={{ x: bPath.x.map(v => v + 8), y: bPath.y.map(v => v + 1) }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="monospace" dominantBaseline="middle">
          A&apos;
        </motion.text>
      </svg>
    </div>
  );
};

const projects = [
  {
    title: "Tenzorllc.com",
    description: "Building the software company I always wanted to work for.",
    icon: <TenzorSmallIcon />,
    tags: ["React","Next.js","TypeScript","Tailwind CSS","Framer Motion","Node.js","2025-Present"],
    className: "col-span-1",
    badge: "Business",
    header: (
      <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl relative"
        style={{ background: "linear-gradient(160deg, #1c2a3a 0%, #0d1520 100%)" }}>
        {/* Dot grid texture */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tenzor-dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="#7a9ab5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tenzor-dots)"/>
        </svg>
        {/* Subtle radial vignette so logo stays readable */}
        <div className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, transparent 30%, #0d1520 100%)" }}/>
        <div className="absolute inset-0 flex items-center justify-center px-4 py-3">
          <TenzorFullLogo />
        </div>
      </div>
    ),
    link: "https://tenzorllc.com",
  },
  {
    title: "TenzorPOS — POS & CRM Platform",
    description: "A full point-of-sale and CRM suite built from scratch for businesses of every size.",
    icon: <IconBuildingStore size={20} />,
    tags: ["React","Next.js","TypeScript","Tailwind CSS","Framer Motion","Node.js","2025-Present"],
    className: "col-span-1",
    badge: "Product",
    header: <POSHeader />,
    link: "https://tenzorllc.com",
  },
  {
    title: "Color Pallette Generator",
    description: "Random Color Pallette Generator",
    icon: <IconBrain size={20} />,
    tags: ["HTML","JavaScript","CSS","2022"],
    className: "col-span-1",
    header: <ColorPaletteHeader />,
    link: "https://geodeinc.github.io/colorgenerator",
  },
  {
    title: "Point Reflection Calculator",
    description: "Calculates a points reflection across a line displaying through Desmos graphing calculator API.",
    icon: <IconCube size={20} />,
    tags: ["JavaScript","HTML","CSS","Desmos API","2022"],
    className: "col-span-1",
    header: <ReflectionHeader />,
    link: "https://geodeinc.github.io/reflectioncalculator",
  },
];

export const ProjectsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section id="projects" className="relative bg-black py-32 overflow-hidden">
      <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--navy-glow-sm) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--navy-fill-xs) 0%, transparent 70%)" }} />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--navy-border)", backgroundColor: "var(--navy-fill-sm)", color: "var(--navy)" }}>
            Projects
          </span>
          <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl" style={{ fontFamily: "var(--font-sub)" }}>
            Things I&apos;ve Built
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}>
          <BentoGrid className="grid-cols-1 md:grid-cols-2">
            {projects.map((p) => (
              <BentoGridItem key={p.title} title={
                p.badge
                  ? <span className="flex items-center gap-2">{p.title} <span className="rounded-full px-2 py-0.5 text-xs font-normal" style={{ backgroundColor: "var(--navy-fill-md)", color: "var(--navy)" }}>{p.badge}</span></span>
                  : p.title
              } description={p.description} icon={p.icon} tags={p.tags} header={p.header} className="col-span-1" link={p.link} />
            ))}
          </BentoGrid>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.5 }} className="mt-12 text-center">
          <Magnetic>
            <a href="https://github.com/GeodeInc" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm font-medium text-neutral-400 transition-all hover:text-white hover:bg-white/[0.07] hover:scale-[1.05] hover:border-white/[0.15] active:scale-[0.97]">
              <IconBrandGithub size={16} />
              View All on GitHub
            </a>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
};
