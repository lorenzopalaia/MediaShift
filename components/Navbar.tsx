import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BsGithub } from "react-icons/bs";
import Logo from "@/components/Logo";

export default function Navbar() {
  return (
    <nav className="fixed z-50 flex h-24 w-full items-center justify-between bg-opacity-30 px-4 py-10 backdrop-blur-md md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <Link href="/">
        <Logo className="mb-2 w-8 cursor-pointer dark:invert" />
      </Link>
      <Link href="https://github.com/lorenzopalaia/MediaShift">
        <Button
          variant="default"
          className="w-fit items-center gap-2 rounded-full bg-primary"
          size="lg"
        >
          <span>GitHub Repo</span>
          <span>
            <BsGithub />
          </span>
        </Button>
      </Link>
    </nav>
  );
}
