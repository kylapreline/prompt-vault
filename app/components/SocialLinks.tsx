import { socialLinks, type SocialLinkId } from "../lib/social-links";

type SocialLinksProps = {
  variant: "header-desktop" | "header-mobile" | "footer" | "about";
  order?: readonly SocialLinkId[];
  showLabels?: boolean;
  onLinkClick?: () => void;
};

function SocialIcon({ id, size, header }: {
  id: SocialLinkId;
  size: number;
  header: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={id === "instagram" ? "none" : "currentColor"}
      stroke={id === "instagram" ? "currentColor" : undefined}
      strokeWidth={id === "instagram" ? 1.8 : undefined}
      aria-hidden="true"
    >
      {id === "facebook" && (
        <path d={header
          ? "M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.66.34-1 1-1z"
          : "M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V10H8v3h2.3v8h3.2Z"} />
      )}
      {id === "instagram" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </>
      )}
      {id === "x" && (
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.29 19.49h2.039L6.487 3.24H4.3l13.31 17.403Z" />
      )}
    </svg>
  );
}

export default function SocialLinks({ variant, order, showLabels = false, onLinkClick }: SocialLinksProps) {
  const header = variant === "header-desktop" || variant === "header-mobile";
  const size = variant === "header-desktop" ? 19 : variant === "header-mobile" ? 18 : 24;
  const links = order
    ? order.map((id) => socialLinks.find((link) => link.id === id)!)
    : socialLinks;

  return (
    <>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          onClick={onLinkClick}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.ariaLabel}
          className={header ? undefined : "text-[#39324a] transition-opacity hover:opacity-60"}
          style={header && !showLabels ? {
            width: "34px",
            height: "34px",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#25232A",
            textDecoration: "none",
            borderRadius: variant === "header-desktop" ? "50%" : undefined,
          } : undefined}
        >
          <SocialIcon id={link.id} size={size} header={header} />
          {showLabels && <span>{link.name}</span>}
        </a>
      ))}
    </>
  );
}
