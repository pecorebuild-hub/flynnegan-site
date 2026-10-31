type Props = {
  text: string | null | undefined;
  className?: string;
};

/** Split plain text on blank lines into spaced paragraphs. */
export function TextBlocks({ text, className }: Props) {
  if (!text?.trim()) return null;
  const blocks = text
    .trim()
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <>
      {blocks.map((block, index) => (
        <p key={index} className={className}>
          {block}
        </p>
      ))}
    </>
  );
}
