"use client";

import { HomeIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Map of links to display in the side navigation.
const links = [
  { name: "Rennen", href: "rennen", icon: HomeIcon },
  { name: "Qualifying", href: "qualifying", icon: BookOpenIcon },
  { name: "Training", href: "training", icon: BookOpenIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  // Extract the base path excluding any segment that matches rennen, training, qualifying, or data
  const segments = pathname.split("/");
  const basePath = segments
    .slice(0, segments.indexOf("live-timing") + 2)
    .join("/");

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const newUrl = `${basePath}/${segments[segments.length - 2]}/${
          link.href
        }/data`;

        return (
          <div key={link.name} role="tablist" className="tabs tabs-lifted">
            <Link
              href={newUrl}
              className={clsx(
                "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
                {
                  "bg-sky-100 text-blue-600": pathname.endsWith(link.href),
                }
              )}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          </div>
        );
      })}
    </>
  );
}
