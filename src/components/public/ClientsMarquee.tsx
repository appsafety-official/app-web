import Marquee from "react-fast-marquee";

interface ClientLogo {
  src: string;
  name: string;
}

const ClientLogoItem = ({ src, name }: ClientLogo) => (
  <div className="mx-3 flex h-16 w-40 shrink-0 items-center justify-center rounded-xl bg-white px-6 py-4 opacity-80 shadow-md transition-opacity duration-500 hover:opacity-100 sm:h-20 sm:w-48 md:h-24 md:w-52">
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
  const items = clients.map((client, i) => (
    <ClientLogoItem key={`${client.src}-${i}`} {...client} />
  ));

  return (
    <div className="relative overflow-hidden border-y border-gray-200 py-10">
      <div className="space-y-10">
        <Marquee
          speed={40}
          pauseOnHover={false}
          gradient={false}
          autoFill
          direction="left"
          className="select-none"
        >
          {items}
        </Marquee>
        <Marquee
          speed={40}
          pauseOnHover={false}
          gradient={false}
          autoFill
          direction="right"
          className="select-none"
        >
          {items}
        </Marquee>
      </div>
    </div>
  );
}