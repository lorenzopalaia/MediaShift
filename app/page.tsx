import Dropzone from "@/components/Dropzone";

export default function Home() {
  return (
    <div className="space-y-16 pb-8">
      <div className="space-y-6">
        <h1 className="text-center text-3xl font-medium md:text-5xl">
          Free Unlimited File Converter
        </h1>
        <p className="text-md text-center text-muted-foreground md:px-24 md:text-lg xl:px-44 2xl:px-52">
          MediaShift is a{" "}
          <span className="text-primary">
            free, self-hosted, no-limits, no-ads, no-anything
          </span>
          , no-BS file conversion service. It supports a wide range of file
          formats and can convert them to a different format. It is a simple,
          fast, and reliable service that can be used to convert files without
          any hassle.
        </p>
      </div>
      <Dropzone />
    </div>
  );
}
