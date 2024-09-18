import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let appInsightsInstance: ApplicationInsights;

export const getAppInsights = () => {
  if (
    !process.env.NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATIONKEY ||
    !process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTIONSTRING
  ) {
    console.log(
      "App Insights instrumentation key or connection string not found",
    );
    throw new Error(
      "App Insights instrumentation key or connection string not found",
    );
  }

  if (!appInsightsInstance) {
    appInsightsInstance = new ApplicationInsights({
      config: {
        connectionString: process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTIONSTRING,
        instrumentationKey:
          process.env.NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATIONKEY,
        appId: `${process.env.NEXT_PUBLIC_CLOUDROLENAME}-${process.env.NEXT_PUBLIC_ENVIRONMENT}`,
      },
    });
    let telemetryInitializer = (envelope: any) => {
      envelope.tags["ai.cloud.role"] =
        `${process.env.NEXT_PUBLIC_CLOUDROLENAME}`;
      envelope.tags["ai.cloud.roleInstance"] =
        `${process.env.NEXT_PUBLIC_ENVIRONMENT}`;
    };
    appInsightsInstance.addTelemetryInitializer(telemetryInitializer);

    appInsightsInstance.loadAppInsights();
  }
  return appInsightsInstance;
};
