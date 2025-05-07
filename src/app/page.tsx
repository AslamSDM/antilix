import HeroSection from "@/components/HeroSection";
import ScrollSection from "@/components/ScrollSection";

export default function HomePage() {
  // If you need to share the Spline instance from Hero to ScrollSection,
  // you would lift the state of the Spline Application instance here
  // and pass it down. For simplicity, this example keeps them somewhat separate
  // or ScrollSection can have its own Spline.

  return (
    <>
      <HeroSection />
      <ScrollSection />
      {/* Add more sections as needed */}
      <div className="h-[50vh] flex items-center justify-center bg-background">
        <p className="text-2xl text-muted-foreground">
          More content can go here.
        </p>
      </div>
    </>
  );
}
