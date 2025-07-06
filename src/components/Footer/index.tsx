import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="flex items-center justify-center min-h-16">
      <p>
        Made by{" "}
        <Link href="~/us" className="underline">us</Link>

      </p>
    </footer>
  );
}
