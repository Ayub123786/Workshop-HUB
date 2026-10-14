export default function WorkshopFooter({ content }) {
  const { companyName, copyright } = content || {};

  return (
    <footer className="bg-cream-dark border-t border-border py-10">
      <div className="container text-center">
        {companyName && (
          <p className="font-semibold text-navy mb-1">{companyName}</p>
        )}
        {copyright && (
          <p className="text-sm text-muted">{copyright}</p>
        )}
      </div>
    </footer>
  );
}
