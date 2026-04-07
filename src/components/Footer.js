export default function Footer() {
  return (
    <footer className="mt-20 footer-surface">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(239,231,214,0.65)" }}>
              Plantity is a modern culinary atelier delivering chef-crafted comfort plates and seasonal specials.
              We focus on curated sourcing, sustainable packaging, and refined presentation so every delivery feels
              like a private dining experience.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(99,102,241,0.8)" }}>
              Company
            </p>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: "rgba(239,231,214,0.6)" }}>
              {["Home", "About us", "Delivery", "Privacy Policy"].map((item) => (
                <li key={item} className="hover:text-cyan-200 transition">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(99,102,241,0.8)" }}>
              Concierge
            </p>
            <div className="mt-4 space-y-2 text-sm" style={{ color: "rgba(239,231,214,0.6)" }}>
              <p>+91 7282992945</p>
              <p>contact@plantity.com</p>
              <p>Mon-Sun 10:00 - 00:00</p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs" style={{ color: "rgba(239,231,214,0.45)" }}>
          Copyright 2026 @ Plantity.com - All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}





