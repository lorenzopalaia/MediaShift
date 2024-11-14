export default function Background() {
  const backgrounds = [
    "/waves-1.mp4",
    "/waves-2.mp4",
    "/waves-3.mp4",
    "/waves-4.mp4",
    "/waves-5.mp4",
    "/futuristic.mp4",
    "/network.mp4",
    "/particles.mp4",
    "/particles-2.mp4",
    "/particles-3.mp4",
    "/gradient.mp4",
    "/chaos.mp4",
    "/neon.mp4",
  ];

  const randomBackground =
    "/videos" + backgrounds[Math.floor(Math.random() * backgrounds.length)];

  return (
    <>
      <div className="fixed left-0 top-0 z-[-1] h-full w-full overflow-hidden backdrop-blur-md"></div>
      <div className="fixed left-0 top-0 z-[-2] h-full w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform object-cover"
        >
          <source src={randomBackground} type="video/mp4" />
        </video>
      </div>
    </>
  );
}
