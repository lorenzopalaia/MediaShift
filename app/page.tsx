import Dropzone from "@/components/Dropzone";

export default function Home() {
  return (
    <div className="pb-8">
      <h1 className="text-3xl font-medium text-center md:text-5xl">
        Free Unlimited File Converter with MediaShift
      </h1>
      <p className="my-4 text-center text-muted-foreground text-md md:text-lg md:px-24 xl:px-44 2xl:px-52">
        MediaShift is a free, self-hosted, no-limits, no-ads, no-anything, no-BS
        file conversion service. It supports a wide range of file formats and
        can convert them to a different format. It is a simple, fast, and
        reliable service that can be used to convert files without any hassle.
      </p>
      <Dropzone />
    </div>
  );
}
