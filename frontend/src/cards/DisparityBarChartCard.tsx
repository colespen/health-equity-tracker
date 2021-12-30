import React from "react";
import Alert from "@material-ui/lab/Alert";
import { DisparityBarChart } from "../charts/DisparityBarChart";
import styles from "./Card.module.scss";
import { CardContent } from "@material-ui/core";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { VariableConfig, METRIC_CONFIG } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import MissingDataAlert from "./ui/MissingDataAlert";
import { exclude } from "../data/query/BreakdownFilter";
import {
  NON_HISPANIC,
  ALL,
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  HISPANIC,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import UnknownsAlert from "./ui/UnknownsAlert";

/* minimize layout shift */
const PRELOAD_HEIGHT = 719;

export function showAltPopCompare(props: {
  fips: { isState: () => any };
  breakdownVar: string;
  variableConfig: { variableId: string };
}) {
  return (
    props.fips.isState() &&
    props.breakdownVar === "race_and_ethnicity" &&
    props.variableConfig.variableId ===
      METRIC_CONFIG["vaccinations"][0].variableId
  );
}

export interface DisparityBarChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  fips: Fips;
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function DisparityBarChartCard(props: DisparityBarChartCardProps) {
  return (
    <DisparityBarChartCardWithKey
      key={props.variableConfig.variableId + props.breakdownVar}
      {...props}
    />
  );
}

function DisparityBarChartCardWithKey(props: DisparityBarChartCardProps) {
  const metricConfig = props.variableConfig.metrics["pct_share"];

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(ALL, NON_HISPANIC)
  );

  // Population Comparison Metric is required for the Disparity Bar Chart.
  // If MetricConfig supports known breakdown metric, prefer this metric.
  let metricIds = [
    metricConfig.metricId,
    metricConfig.populationComparisonMetric!.metricId,
  ];
  if (metricConfig.knownBreakdownComparisonMetric) {
    metricIds.push(metricConfig.knownBreakdownComparisonMetric.metricId);
  }
  if (metricConfig.secondaryPopulationComparisonMetric) {
    metricIds.push(metricConfig.secondaryPopulationComparisonMetric.metricId);
  }

  const query = new MetricQuery(metricIds, breakdowns);

  function getTitleText() {
    return `${metricConfig.fullCardTitleName} vs. Population By ${
      BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
    } In ${props.fips.getFullDisplayName()}`;
  }
  function CardTitle() {
    return <>{getTitleText()}</>;
  }

  return (
    <CardWrapper
      queries={[query]}
      title={<CardTitle />}
      minHeight={PRELOAD_HEIGHT}
    >
      {([queryResponse]) => {
        const dataWithoutUnknowns = queryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: Row) =>
              row[props.breakdownVar] !== UNKNOWN &&
              row[props.breakdownVar] !== UNKNOWN_RACE &&
              row[props.breakdownVar] !== UNKNOWN_ETHNICITY
          );

        // include a note about percents adding to over 100%
        // if race options include hispanic twice (eg "White" and "Hispanic" can both include Hispanic people)
        // also require at least some data to be available to avoid showing info on suppressed/undefined states
        const shouldShowDoesntAddUpMessage =
          props.breakdownVar === "race_and_ethnicity" &&
          queryResponse.data.every(
            (row) =>
              !row[props.breakdownVar].includes("(Non-Hispanic)") ||
              row[props.breakdownVar] === HISPANIC
          ) &&
          queryResponse.data.some((row) => row[metricConfig.metricId]);

        const dataAvailable = !queryResponse.shouldShowMissingDataMessage([
          metricConfig.metricId,
        ]);
        return (
          <>
            {/* Display either UnknownsAlert OR MissingDataAlert */}
            {dataAvailable ? (
              <UnknownsAlert
                metricConfig={metricConfig}
                queryResponse={queryResponse}
                breakdownVar={props.breakdownVar}
                displayType="chart"
                known={true}
                overrideAndWithOr={props.breakdownVar === "race_and_ethnicity"}
                fips={props.fips}
              />
            ) : (
              <CardContent className={styles.Breadcrumbs}>
                <MissingDataAlert
                  dataName={metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                  geoLevel={props.fips.getFipsTypeDisplayName()}
                  noDemographicInfo={
                    props.variableConfig.variableId ===
                      METRIC_CONFIG["vaccinations"][0].variableId &&
                    props.fips.isCounty()
                  }
                />
              </CardContent>
            )}
            {dataAvailable && dataWithoutUnknowns.length !== 0 && (
              <CardContent className={styles.Breadcrumbs}>
                <DisparityBarChart
                  data={dataWithoutUnknowns}
                  lightMetric={metricConfig.populationComparisonMetric!}
                  darkMetric={
                    metricConfig.knownBreakdownComparisonMetric || metricConfig
                  }
                  breakdownVar={props.breakdownVar}
                  metricDisplayName={metricConfig.shortVegaLabel}
                  filename={getTitleText()}
                  showAltPopCompare={showAltPopCompare(props)}
                />
              </CardContent>
            )}
            {shouldShowDoesntAddUpMessage && (
              <Alert severity="info">
                Population percentages on this graph add up to over 100% because
                the racial categories reported for{" "}
                {metricConfig.fullCardTitleName} in{" "}
                {props.fips.getFullDisplayName()} include Hispanic individuals
                in each racial category. As a result, Hispanic individuals are
                counted twice.
              </Alert>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
