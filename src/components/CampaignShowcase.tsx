import poster from "@/assets/campaign-poster.png.asset.json";
import ferrari from "@/assets/ferrari.png.asset.json";
import rolls from "@/assets/rolls-royce.png.asset.json";

export const CampaignShowcase = () => {
  return (
    <section className="relative w-full overflow-hidden py-12 md:py-20">
      <div className="relative mx-auto max-w-5xl px-4">
        <div className="relative mx-auto w-full max-w-2xl">
          {/* Poster */}
          <img
            src={poster.url}
            alt="USD.ONLINE 增值资本团队业绩活动"
            className="relative z-10 w-full rounded-2xl shadow-2xl"
            loading="lazy"
          />

          {/* Ferrari drives in from the left */}
          <img
            src={ferrari.url}
            alt="Ferrari 296 GTB"
            className="pointer-events-none absolute left-0 top-1/2 z-20 w-[55%] -translate-y-1/2 animate-[driveInLeft_2.8s_ease-out_forwards] opacity-0 drop-shadow-2xl"
            style={{ transform: "translate(-120%, -50%)" }}
            loading="lazy"
          />

          {/* Rolls-Royce drives in from the right */}
          <img
            src={rolls.url}
            alt="Rolls-Royce Cullinan"
            className="pointer-events-none absolute right-0 top-1/2 z-20 w-[55%] -translate-y-1/2 animate-[driveInRight_2.8s_ease-out_0.4s_forwards] opacity-0 drop-shadow-2xl"
            style={{ transform: "translate(120%, -50%)" }}
            loading="lazy"
          />
        </div>
      </div>

      <style>{`
        @keyframes driveInLeft {
          0% { transform: translate(-150%, -50%); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translate(-8%, -50%); opacity: 1; }
        }
        @keyframes driveInRight {
          0% { transform: translate(150%, -50%); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translate(8%, -50%); opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default CampaignShowcase;
