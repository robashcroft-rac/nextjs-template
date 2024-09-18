"use client";
import dynamic from "next/dynamic";
import { CssBaseline, Grid } from "@mui/material";
import { RacwaThemeProvider } from "@racwa/react-components";
import { useEffect } from "react";
import { getAppInsights } from "../Services/insights/insights.service";

export default function HomePage() {
  const Main = dynamic(() => import("../Components/main/Main"), { ssr: false });

  useEffect(() => {
    const appInsights = getAppInsights();
    appInsights.trackPageView({
      name: "Azure Application Insights Test",
      properties: {
        "app name": "Azure Application Insights Test",
      },
    });
  }, []);
  return (
    <RacwaThemeProvider>
      <CssBaseline />
      <Main />
    </RacwaThemeProvider>
  );
}
