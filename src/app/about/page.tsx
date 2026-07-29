import { Building2, Award, Users } from "lucide-react";

const stats = [
  {
    icon: Building2,
    title: "500+",
    desc: "Enterprise clients across mining, oil & gas, and manufacturing.",
  },
  {
    icon: Award,
    title: "ISO 9001",
    desc: "Quality management certified since 2018.",
  },
  {
    icon: Users,
    title: "40+",
    desc: "In-house safety engineers, sewers, and QA technicians.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      {/* Section 1: Page Header */}
      <section>
        <p className="mb-4 font-mono text-xs font-semibold tracking-widest text-gray-400">
          ABOUT THE COMPANY
        </p>
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          Ten years of protecting <br />
          Indonesian industry.
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
          PT Arie Putra Permana was founded in 2015 to close a gap in the local
          market for certified, technically sound industrial safety apparel.
          Today, APP Safety supplies refineries, shipyards, fire brigades and
          manufacturing plants across the archipelago with gear built to
          international standards.
        </p>
      </section>

      {/* Section 2: Stats Cards */}
      <section className="mt-16 sm:mt-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.title} className="border border-gray-200 bg-white px-8 py-10">
              <s.icon className="mb-6 h-6 w-6 text-orange" strokeWidth={1.5} />
              <p className="font-mono text-4xl font-bold text-black">{s.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Mission & Approach */}
      <hr className="mt-20 border-gray-200" />
      <section className="mt-16 grid gap-12 sm:grid-cols-2">
        {/* Left: Mission */}
        <div>
          <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-gray-400">
            OUR MISSION
          </p>
          <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
            Bring every worker home, every shift.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            We treat safety as an engineering problem. Every jacket, glove and
            suit we ship is spec&rsquo;d against the hazards our clients face
            daily — from radiant heat in petrochemical plants to arc flash in
            electrical utilities. Our technical team works directly with safety
            officers to select materials, validate certifications, and ensure
            every garment meets the standard before it reaches the warehouse
            floor.
          </p>
        </div>

        {/* Right: Approach */}
        <div>
          <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-gray-400">
            HOW WE WORK
          </p>
          <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
            Direct supply, transparent specs.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            No middlemen. Materials are sourced from certified mills, sewn in
            our Bekasi facility, and shipped with full traceability to ensure
            uncompromising quality. Every order is backed by a complete
            specification sheet, test report, and certificate of conformity.
            Whether it&rsquo;s a single replacement jacket or a thousand-piece
            tender, the process is the same — rigorous, documented, and
            engineer-reviewed.
          </p>
        </div>
      </section>
    </div>
  );
}
