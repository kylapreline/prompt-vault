export const socialLinks = [
  {
    id: "facebook",
    name: "Facebook",
    url: "https://www.facebook.com/KylaPreline",
    ariaLabel: "Kyla Preline on Facebook",
  },
  {
    id: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com/kpreline/",
    ariaLabel: "Kyla Preline on Instagram",
  },
  {
    id: "x",
    name: "X",
    url: "https://x.com/kylapreline",
    ariaLabel: "Kyla Preline on X",
  },
] as const;

export type SocialLinkId = (typeof socialLinks)[number]["id"];
