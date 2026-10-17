export default function WorkshopFooter({ content }) {
  const { companyName, copyright } = content || {};

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.08] py-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {companyName && (
          <p className="font-mono font-bold text-white text-xs uppercase tracking-widest mb-1.5">{companyName}</p>
        )}
        {copyright && (
          <p className="text-xs text-white/40 font-mono">{copyright}</p>
        )}
      </div>
    </footer>
  );
}
