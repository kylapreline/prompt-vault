import Link from "next/link";
import type { Prompt } from "../lib/notion";

export default function PromptCard({
  prompt,
}: {
  prompt: Prompt;
}) {
  return (
    <Link
      href={`/prompt/${prompt.id}`}
      className="group block"
    >
      <article>
        {/* Image */}
        <div className="overflow-hidden rounded-2xl bg-[#eee2f2]">
          {prompt.mainImageUrl ? (
            <img
              src={prompt.mainImageUrl}
              alt={prompt.title}
              className="block aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex aspect-[4/5] w-full items-center justify-center text-sm text-[#8b8396]">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pt-4">
          <h3 className="text-base font-semibold leading-7 text-[#39324a] transition group-hover:opacity-70 sm:text-lg">
            {prompt.title}
          </h3>

          {prompt.category && (
            <p className="mt-1 text-xs tracking-wide text-[#8b8396] sm:text-sm">
              {prompt.category}
            </p>
          )}

          {prompt.tags.length > 0 && (
            <p className="mt-2 text-xs leading-6 text-[#a09aaa]">
              {prompt.tags.join(" · ")}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}