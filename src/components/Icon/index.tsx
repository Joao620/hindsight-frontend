// biome-ignore lint: porque eu quero
const symbols = {
  "user-square": (
    <g>
      <path
        fill="currentColor"
        d="M9.172 7.172a4 4 0 1 1 5.656 5.656 4 4 0 0 1-5.656-5.656ZM12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 2c-3.593 0-6.24.425-7.907 2.093C2.425 5.76 2 8.407 2 12s.425 6.24 2.093 7.907C5.76 21.575 8.407 22 12 22s6.24-.425 7.907-2.093C21.575 18.24 22 15.593 22 12s-.425-6.24-2.093-7.907C18.24 2.425 15.593 2 12 2ZM4 12c0-3.607.475-5.46 1.507-6.493C6.54 4.475 8.393 4 12 4s5.46.475 6.493 1.507C19.525 6.54 20 8.393 20 12c0 3.366-.414 5.205-1.307 6.274A4.997 4.997 0 0 0 14 15h-4a5 5 0 0 0-4.693 3.274C4.414 17.204 4 15.366 4 12Zm3.056 7.42C8.17 19.815 9.741 20 12 20c2.26 0 3.831-.186 4.944-.58A3 3 0 0 0 14 17h-4a3 3 0 0 0-2.944 2.42Z"
      />
    </g>
  ),
  "user-circle": (
    <g>
      <path
        fill="currentColor"
        d="M9.172 7.172a4 4 0 1 1 5.656 5.656 4 4 0 0 1-5.656-5.656ZM12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8.939 4.609a8 8 0 0 1 9.175 12.55A4.997 4.997 0 0 0 14 15h-4a5 5 0 0 0-4.114 2.159 8 8 0 0 1 3.053-12.55ZM7.383 18.533a8.002 8.002 0 0 0 9.234 0A3 3 0 0 0 14 17h-4a3 3 0 0 0-2.617 1.533Z"
      />
    </g>
  ),
  "arrow-right": (
    <g>
      <path
        fill="currentColor"
        d="M12.293 5.293a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L16.586 13H5a1 1 0 1 1 0-2h11.586l-4.293-4.293a1 1 0 0 1 0-1.414Z"
      />
    </g>
  ),
  "arrow-left": (
    <g>
      <path
        fill="currentColor"
        d="M11.707 5.293a1 1 0 0 1 0 1.414L7.414 11H19a1 1 0 1 1 0 2H7.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 0Z"
      />
    </g>
  ),
  "check-circle": (
    <g>
      <path
        fill="currentColor"
        d="M17 3.34a10 10 0 1 1-14.995 8.984L2 12l.005-.324A10 10 0 0 1 17 3.34Zm-1.293 5.953a1 1 0 0 0-1.32-.083l-.094.083L11 12.585l-1.293-1.292-.094-.083a1 1 0 0 0-1.403 1.403l.083.094 2 2 .094.083a1 1 0 0 0 1.226 0l.094-.083 4-4 .083-.094a1 1 0 0 0-.083-1.32Z"
      />
    </g>
  ),
  "check-square": (
    <g>
      <path
        fill="currentColor"
        d="M12 2a40.5 40.5 0 0 0-.642.005l-.616.017-.299.013-.579.034-.553.046c-4.785.464-6.732 2.411-7.196 7.196l-.046.553-.034.579c-.005.098-.01.198-.013.299l-.017.616-.004.318L2 12c0 .218.002.432.005.642l.017.616.013.299.034.579.046.553c.464 4.785 2.411 6.732 7.196 7.196l.553.046.579.034c.098.005.198.01.299.013l.616.017L12 22l.642-.005.616-.017.299-.013.579-.034.553-.046c4.785-.464 6.732-2.411 7.196-7.196l.046-.553.034-.579c.005-.098.01-.198.013-.299l.017-.616L22 12l-.005-.642-.017-.616-.013-.299-.034-.579-.046-.553c-.464-4.785-2.411-6.732-7.196-7.196l-.553-.046-.579-.034-.299-.013-.616-.017-.318-.004L12 2Zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083.094-4 4a1 1 0 0 1-1.32.083l-.094-.083-2-2a1 1 0 0 1 1.32-1.497l.094.083L11 12.585l3.293-3.292Z"
      />
    </g>
  ),
  "table": (
    <g stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 3a1 1 0 0 1 0 2h-6a1 1 0 1 1 0 -2z" /><path d="M20 3a1 1 0 0 1 0 2h-6a1 1 0 0 1 0 -2z" /><path d="M8 7a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" /><path d="M18 7a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-2a3 3 0 0 1 -3 -3v-2a3 3 0 0 1 3 -3z" />
    </g>
  ),
  "mic": (
    <g stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M8 21l8 0" /><path d="M12 17l0 4" />
    </g>
  )
} as const;

type Props = {
  symbol: keyof typeof symbols;
  className?: string;
  label?: string;
};

export function Icon({ symbol, className, label }: Props) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: We switch visiblity based on label.
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={`inline-block w-[1em] h-[1em] ${className}`}
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
    >
      {symbols[symbol]}
    </svg>
  );
}
