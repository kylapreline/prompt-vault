import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden">
        <Image
          src="/Kyla-web-hero_20261009.jpg"
          alt="Kyla Preline's Prompt Vault"
          width={1600}
          height={500}
          priority
          className="h-auto w-full object-cover"
        />
      </div>
    </section>
  );
}