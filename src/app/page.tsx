import dynamic from "next/dynamic";

export default function Home() {
  const HomePage = dynamic(() => import("../app/Pages/HomePage"), {
    ssr: false,
  });

  return <HomePage />;
}
