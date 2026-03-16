export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.08]" style={{ background: "rgba(10,7,5,0.9)" }}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-sm" style={{ color: "rgba(245,230,211,0.6)" }}>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cumque nostrum iure suscipit maiores non harum
              incidunt unde magnam molestias ipsum qui vel aut natus aspernatur ipsa dignissimos, numquam assumenda
              deserunt.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(251,191,36,0.7)" }}>
              Company
            </p>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: "rgba(245,230,211,0.6)" }}>
              {[
                "Home",
                "About us",
                "Delivery",
                "Privacy Policy",
              ].map((item) => (
                <li key={item} className="hover:text-amber-200 transition">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(251,191,36,0.7)" }}>
              Get in touch
            </p>
            <div className="mt-4 space-y-2 text-sm" style={{ color: "rgba(245,230,211,0.6)" }}>
              <p>+92-308-4900522</p>
              <p>contact@tomato.com</p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs" style={{ color: "rgba(245,230,211,0.45)" }}>
          Copyright 2024 @ Tomato.com - All Right Reserved.
        </div>
      </div>
    </footer>
  );
}
