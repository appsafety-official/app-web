interface ClientLogo {
  src: string;
  name: string;
}

const ClientLogoItem = ({ src, name }: ClientLogo) => (
  <div className="mr-6 flex h-16 w-40 min-w-40 shrink-0 items-center justify-center rounded-xl bg-white px-6 py-4 opacity-80 shadow-md transition-all duration-500 hover:opacity-100 hover:scale-105 sm:h-20 sm:w-48 sm:min-w-48 md:h-24 md:w-52 md:min-w-52">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={src}
      alt={name}
      className="max-h-full max-w-full object-contain"
    />
  </div>
);

interface ClientsMarqueeProps {
  clients: ClientLogo[];
}

export default function ClientsMarquee({ clients }: ClientsMarqueeProps) {
  const duplicated = [...clients, ...clients];

  return (
    <div className="relative overflow-hidden border-y border-gray-200 py-10">
      {/* Fade overlay — left edge */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-white) 0%, transparent 100%)",
        }}
      />
      {/* Fade overlay — right edge */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-20"
        style={{
          backgroundImage:
            "linear-gradient(to left, var(--color-white) 0%, transparent 100%)",
        }}
      />

      <div className="space-y-10">
        <div className="marquee-row animate-marquee-left flex w-max items-center overflow-hidden">
          {duplicated.map((client, i) => (
            <ClientLogoItem key={`left-${client.src}-${i}`} {...client} />
          ))}
        </div>
        <div className="marquee-row animate-marquee-right flex w-max items-center overflow-hidden">
          {duplicated.map((client, i) => (
            <ClientLogoItem key={`right-${client.src}-${i}`} {...client} />
          ))}
        </div>
      </div>
    </div>
  );
}
