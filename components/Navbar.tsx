import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BsGithub } from "react-icons/bs";
// import ModeToggle from "@/components/ModeToggle";
import Logo from "@/components/Logo";

export default function Navbar() {
  return (
    <nav className="fixed z-50 flex items-center justify-between w-full h-24 px-4 py-10 backdrop-blur-md bg-background bg-opacity-30 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <Link href="/">
        <Logo className="mb-2 cursor-pointer w-8 dark:invert" />
      </Link>
      <div className="items-center hidden gap-2 md:flex">
        {/* <ModeToggle /> */}
        <Link href="https://github.com/lorenzopalaia/MediaShift">
          <Button
            variant="default"
            className="items-center hidden gap-2 rounded-full bg-primary w-fit md:flex"
            size="lg"
          >
            <span>GitHub Repo</span>
            <span>
              <BsGithub />
            </span>
          </Button>
        </Link>
      </div>
      <div className="block-p-3 md:hidden">{/* <ModeToggle /> */}</div>
    </nav>
  );
}
