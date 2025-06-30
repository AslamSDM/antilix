import PresaleClientContent from "./PresaleClientContent";
import getPresaleData from "./getPresaleData";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate data every 60 seconds

export default async function PresalePage() {
  const presaleData = await getPresaleData();

  return (
    <PresaleClientContent
      contributorCount={presaleData.contributorCount}
      totalRaised={presaleData.totalRaised}
      usdRaised={presaleData.usdRaised}
      prices={presaleData.prices}
    />
  );
}
