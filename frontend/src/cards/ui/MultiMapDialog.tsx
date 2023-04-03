import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import { Box, Grid, useMediaQuery, useTheme } from "@material-ui/core";
import { ChoroplethMap } from "../../charts/ChoroplethMap";
import { Fips, TERRITORY_CODES } from "../../data/utils/Fips";
import { Legend } from "../../charts/Legend";
import {
  type MapOfDatasetMetadata,
  type Row,
  type FieldRange,
} from "../../data/utils/DatasetTypes";
import {
  type MetricConfig,
  type MetricId,
  SYMBOL_TYPE_LOOKUP,
} from "../../data/config/MetricConfig";
import { Sources } from "./Sources";
import styles from "./MultiMapDialog.module.scss";
import { type MetricQueryResponse } from "../../data/query/MetricQuery";
import {
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";
import { Alert } from "@material-ui/lab";
import { type DemographicGroup } from "../../data/utils/Constants";
import {
  CAWP_DETERMINANTS,
  getWomenRaceLabel,
} from "../../data/variables/CawpProvider";

export interface MultiMapDialogProps {
  // Metric the small maps will evaluate
  metricConfig: MetricConfig;
  // Whether or not the data was collected via survey
  useSmallSampleMessage: boolean;
  // Demographic breakdown upon which we're dividing the data, i.e. "age"
  breakdown: BreakdownVar;
  // Unique values for breakdown, each one will have it's own map
  breakdownValues: DemographicGroup[];
  // Geographic region of maps
  fips: Fips;
  // Data that populates maps
  data: Row[];
  // Range of metric's values, used for creating a common legend across maps
  fieldRange: FieldRange | undefined;
  // Whether or not dialog is currently open
  open: boolean;
  // Closes the dialog in the parent component
  handleClose: () => void;
  // Dataset IDs required the source footer
  queryResponses: MetricQueryResponse[];
  // Metadata required for the source footer
  metadata: MapOfDatasetMetadata;
  breakdownValuesNoData: DemographicGroup[];
  countColsToAdd: MetricId[];
  // Geography data, in topojson format. Must include both states and counties.
  // If not provided, defaults to directly loading /tmp/geographies.json
  geoData?: Record<string, any>;
  // optional to show state data when county not available
  hasSelfButNotChildGeoData?: boolean;
}

/*
   MultiMapDialog is a dialog opened via the MapCard that shows one small map for each unique
    value in a given breakdown for a particular metric.
*/
export function MultiMapDialog(props: MultiMapDialogProps) {
  // calculate page size for responsive layout
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("xl"));

  return (
    <Dialog
      className={styles.MultiMapBox}
      open={props.open}
      onClose={props.handleClose}
      maxWidth={false}
      scroll="paper"
      aria-labelledby="modalTitle"
    >
      <DialogContent dividers={true}>
        <Grid container justifyContent="center" component="ul">
          {/* Modal Title */}
          <Grid
            item
            xs={12}
            container
            justifyContent={pageIsWide ? "flex-start" : "center"}
          >
            <Typography id="modalTitle" variant="h6" component="h2">
              {props.metricConfig.chartTitleLines.join(" ")} across all{" "}
              {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdown]} groups
            </Typography>
          </Grid>

          {/* Multiples Maps */}
          {props.breakdownValues.map((breakdownValue) => {
            const mapLabel = CAWP_DETERMINANTS.includes(
              props.metricConfig.metricId
            )
              ? getWomenRaceLabel(breakdownValue)
              : breakdownValue;

            const dataForValue = props.data.filter(
              (row: Row) => row[props.breakdown] === breakdownValue
            );

            return (
              <Grid
                xs={12}
                sm={6}
                md={4}
                lg={3}
                item
                key={`${breakdownValue}-grid-item`}
                className={styles.SmallMultipleMap}
                component="li"
              >
                <b>{mapLabel}</b>
                {props.metricConfig && dataForValue.length > 0 && (
                  <ChoroplethMap
                    key={breakdownValue}
                    signalListeners={{ click: (...args: any) => {} }}
                    metric={props.metricConfig}
                    legendData={props.data}
                    data={dataForValue}
                    hideLegend={true}
                    showCounties={
                      !props.fips.isUsa() && !props.hasSelfButNotChildGeoData
                    }
                    fips={props.fips}
                    fieldRange={props.fieldRange}
                    hideActions={true}
                    scaleType="quantize"
                    geoData={props.geoData}
                    filename={`${props.metricConfig.chartTitleLines.join(" ")}${
                      breakdownValue === "All" ? "" : ` for ${breakdownValue}`
                    } in ${props.fips.getSentenceDisplayName()}`}
                    countColsToAdd={props.countColsToAdd}
                  />
                )}

                {/* TERRITORIES (IF NATIONAL VIEW) */}
                {props.metricConfig &&
                props.fips.isUsa() &&
                dataForValue.length ? (
                  <Grid container>
                    {TERRITORY_CODES.map((code) => {
                      const fips = new Fips(code);
                      return (
                        <Grid item xs={4} sm={2} key={code}>
                          <ChoroplethMap
                            signalListeners={{ click: (...args: any) => {} }}
                            metric={props.metricConfig}
                            legendData={props.data}
                            data={dataForValue}
                            hideLegend={true}
                            hideActions={true}
                            showCounties={false}
                            fips={fips}
                            fieldRange={props.fieldRange}
                            scaleType="quantize"
                            geoData={props.geoData}
                            overrideShapeWithCircle={true}
                            countColsToAdd={props.countColsToAdd}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <></>
                )}
              </Grid>
            );
          })}

          {/* Legend */}

          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            xl={12}
            className={styles.SmallMultipleLegendMap}
          >
            <Box mt={pageIsWide ? 10 : 0}>
              <Grid container item>
                <Grid container justifyContent="center">
                  <b>Legend ({SYMBOL_TYPE_LOOKUP[props.metricConfig.type]})</b>
                </Grid>
                <Grid container justifyContent="center">
                  <Legend
                    metric={props.metricConfig}
                    legendTitle={props.metricConfig.chartTitleLines.join(" ")}
                    legendData={props.data}
                    scaleType="quantize"
                    sameDotSize={true}
                    direction={pageIsWide ? "horizontal" : "vertical"}
                    description={"Consistent legend for all displayed maps"}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Missing Groups */}
          {props.breakdownValuesNoData.length > 0 && (
            <Grid item container justifyContent="center" xs={12} xl={7}>
              <Box my={3}>
                <Alert severity="warning">
                  <p className={styles.NoDataWarning}>
                    Insufficient {props.metricConfig.shortLabel} data reported
                    at the {props.fips.getChildFipsTypeDisplayName()} level for
                    the following groups:{" "}
                    {props.breakdownValuesNoData.map((group, i) => (
                      <span key={group}>
                        <b>{group}</b>
                        {i < props.breakdownValuesNoData.length - 1 && "; "}
                      </span>
                    ))}
                  </p>
                </Alert>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      {/* MODAL FOOTER */}
      <div>
        <div className={styles.FooterButtonContainer}>
          <Button onClick={props.handleClose} color="primary">
            Close
          </Button>
        </div>
        <div className={styles.FooterSourcesContainer}>
          <Sources
            queryResponses={props.queryResponses}
            metadata={props.metadata}
          />
        </div>
      </div>
    </Dialog>
  );
}
