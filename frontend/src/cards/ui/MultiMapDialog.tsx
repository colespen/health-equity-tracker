import { useState } from 'react'
import {
  Box,
  Grid,
  Button,
  Dialog,
  DialogContent,
  Typography,
  Alert,
} from '@mui/material'
import { ChoroplethMap } from '../../charts/ChoroplethMap'
import { Fips } from '../../data/utils/Fips'
import { Legend } from '../../charts/Legend'
import {
  type MapOfDatasetMetadata,
  type Row,
  type FieldRange,
} from '../../data/utils/DatasetTypes'
import { type MetricConfig } from '../../data/config/MetricConfig'
import { Sources } from './Sources'
import styles from './MultiMapDialog.module.scss'
import {
  type MetricQuery,
  type MetricQueryResponse,
} from '../../data/query/MetricQuery'
import {
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../../data/query/Breakdowns'
import { type DemographicGroup } from '../../data/utils/Constants'
import {
  CAWP_DETERMINANTS,
  getWomenRaceLabel,
} from '../../data/providers/CawpProvider'
import { useDownloadCardImage } from '../../utils/hooks/useDownloadCardImage'
import { getMapScheme } from '../../charts/mapHelperFunctions'
import CloseIcon from '@mui/icons-material/Close'
import TerritoryCircles from './TerritoryCircles'
import MapBreadcrumbs from './MapBreadcrumbs'
import { type CountColsMap } from '../MapCard'
import { RATE_MAP_SCALE } from '../../charts/mapGlobals'

export interface MultiMapDialogProps {
  // Metric the small maps will evaluate
  metricConfig: MetricConfig
  // Whether or not the data was collected via survey
  useSmallSampleMessage: boolean
  // Demographic upon which we're dividing the data, i.e. "age"
  demographicType: DemographicType
  // Unique values for demographicType, each one will have it's own map
  demographicGroups: DemographicGroup[]
  // Geographic region of maps
  fips: Fips
  // Data that populates maps
  data: Row[]
  // Range of metric's values, used for creating a common legend across maps
  fieldRange: FieldRange | undefined
  // Whether or not dialog is currently open
  open: boolean
  // Closes the dialog in the parent component
  handleClose: () => void
  queries: MetricQuery[]
  // Dataset IDs required the source  footer
  queryResponses: MetricQueryResponse[]
  // Metadata required for the source footer
  metadata: MapOfDatasetMetadata
  demographicGroupsNoData: DemographicGroup[]
  countColsMap: CountColsMap
  // Geography data, in topojson format. Must include both states and counties.
  // If not provided, defaults to directly loading /tmp/geographies.json
  geoData?: Record<string, any>
  // optional to show state data when county not available
  hasSelfButNotChildGeoData?: boolean
  updateFipsCallback: (fips: Fips) => void
  totalPopulationPhrase: string
  handleMapGroupClick: (_: any, newGroup: DemographicGroup) => void
  pageIsSmall: boolean
}

/*
   MultiMapDialog is a dialog opened via the MapCard that shows one small map for each unique
    value in a given demographicType for a particular metric.
*/
export function MultiMapDialog(props: MultiMapDialogProps) {
  const title = `${
    props.metricConfig.chartTitle
  } in ${props.fips.getSentenceDisplayName()} across all ${
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
  } groups`

  const [screenshotTargetRef, downloadTargetScreenshot] =
    useDownloadCardImage(title)

  /* handle clicks on sub-geos in multimap view */
  const multimapSignalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1]
      if (clickedData?.id) {
        props.updateFipsCallback(new Fips(clickedData.id))
      }
    },
  }

  const [mapScheme, mapMin] = getMapScheme({
    metricId: props.metricConfig.metricId,
  })

  const [scale, setScale] = useState<{ domain: number[]; range: number[] }>({
    domain: [],
    range: [],
  })

  function handleScaleChange(domain: number[], range: number[]) {
    // Update the scale state when the domain or range changes
    setScale({ domain, range })
  }

  return (
    <Dialog
      className={styles.MultiMapBox}
      open={props.open}
      onClose={props.handleClose}
      maxWidth={false}
      scroll="paper"
      aria-labelledby="modalTitle"
      ref={screenshotTargetRef}
    >
      <DialogContent dividers={true}>
        <Grid
          container
          justifyContent="space-between"
          component="ul"
          sx={{ p: 0 }}
        >
          {/* card heading row */}
          <Grid item xs={12} container justifyContent={'space-between'}>
            {/* mobile-only close button */}
            <Grid
              item
              xs={12}
              sx={{ display: { xs: 'flex', sm: 'none' }, mb: 3 }}
              container
              justifyContent={'flex-end'}
            >
              <Button
                aria-label="close multiple maps modal"
                onClick={props.handleClose}
                color="primary"
              >
                <CloseIcon />
              </Button>
            </Grid>
            {/* Modal Title */}
            <Grid item xs={12} sm={9} md={10}>
              <Typography id="modalTitle" variant="h6" component="h2">
                {title}
              </Typography>
            </Grid>
            {/* desktop-only close button */}
            <Grid
              item
              sx={{
                display: { xs: 'none', sm: 'flex' },
                mr: { xs: 1, md: 0 },
                mb: 3,
              }}
              sm={1}
              container
              justifyContent={'flex-end'}
            >
              <Button
                aria-label="close multiple maps modal"
                onClick={props.handleClose}
                color="primary"
              >
                <CloseIcon />
              </Button>
            </Grid>
          </Grid>

          {/* LEGEND */}
          <Grid item xs={12}>
            <Grid container item>
              <Grid container justifyContent="center">
                <span className={styles.LegendTitleText}>
                  Legend: {props.metricConfig.shortLabel}
                </span>
              </Grid>
              <Grid container justifyContent="center">
                <Legend
                  metric={props.metricConfig}
                  legendTitle={''}
                  data={props.data}
                  scaleType={RATE_MAP_SCALE}
                  sameDotSize={true}
                  description={'Consistent legend for all displayed maps'}
                  mapConfig={{ mapScheme, mapMin }}
                  stackingDirection={
                    props.pageIsSmall ? 'vertical' : 'horizontal'
                  }
                  columns={props.pageIsSmall ? 2 : 6}
                  orient={'bottom-right'}
                  handleScaleChange={handleScaleChange}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Multiples Maps */}
          {props.demographicGroups.map((demographicGroup) => {
            const mapLabel = CAWP_DETERMINANTS.includes(
              props.metricConfig.metricId
            )
              ? getWomenRaceLabel(demographicGroup)
              : demographicGroup
            const dataForValue = props.data.filter(
              (row: Row) => row[props.demographicType] === demographicGroup
            )
            return (
              <Grid
                xs={12}
                sm={6}
                md={4}
                lg={3}
                item
                key={`${demographicGroup}-grid-item`}
                className={styles.SmallMultipleMap}
                component="li"
                onClick={(e: any) => {
                  props.handleMapGroupClick(null, demographicGroup)
                }}
              >
                <b>{mapLabel}</b>
                {props.metricConfig && dataForValue.length > 0 && (
                  <ChoroplethMap
                    demographicType={props.demographicType}
                    activeDemographicGroup={demographicGroup}
                    countColsMap={props.countColsMap}
                    data={dataForValue}
                    fieldRange={props.fieldRange}
                    filename={title}
                    fips={props.fips}
                    geoData={props.geoData}
                    hideLegend={true}
                    key={demographicGroup}
                    legendData={props.data}
                    metric={props.metricConfig}
                    showCounties={
                      !props.fips.isUsa() && !props.hasSelfButNotChildGeoData
                    }
                    signalListeners={multimapSignalListeners}
                    mapConfig={{ mapScheme, mapMin }}
                    isMulti={true}
                    scaleConfig={scale}
                    highestLowestGeosMode={false}
                  />
                )}

                {/* TERRITORIES (IF NATIONAL VIEW) */}
                {props.metricConfig &&
                  props.fips.isUsa() &&
                  dataForValue.length && (
                    <Grid container>
                      <TerritoryCircles
                        demographicType={props.demographicType}
                        countColsMap={props.countColsMap}
                        data={dataForValue}
                        geoData={props.geoData}
                        mapIsWide={false}
                        metricConfig={props.metricConfig}
                        signalListeners={multimapSignalListeners}
                        scaleConfig={scale}
                        isMulti={true}
                        activeDemographicGroup={demographicGroup}
                        highestLowestGeosMode={false}
                      />
                    </Grid>
                  )}
              </Grid>
            )
          })}

          {/* Population Breadcrumbs + Legend */}
          <Grid
            container
            justifyContent={'space-between'}
            alignItems={'flex-end'}
            item
            xs={12}
            className={styles.SmallMultipleLegendMap}
          >
            {/* DESKTOP BREADCRUMBS */}
            <Grid
              sx={{ display: { xs: 'none', md: 'flex' } }}
              container
              item
              xs={12}
              md={6}
              justifyContent={'center'}
            >
              <MapBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
                scrollToHashId={'rate-map'}
                endNote={props.totalPopulationPhrase}
              />
            </Grid>

            {/* MOBILE BREADCRUMBS */}
            <Grid
              sx={{ mt: 3, display: { xs: 'flex', md: 'none' } }}
              container
              item
              xs={12}
              justifyContent={'center'}
            >
              <MapBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
                scrollToHashId={'rate-map'}
                endNote={props.totalPopulationPhrase}
              />
            </Grid>
          </Grid>

          {/* Missing Groups */}
          {props.demographicGroupsNoData.length > 0 && (
            <Grid item container justifyContent="center" xs={12} xl={7}>
              <Box my={3}>
                <Alert severity="warning">
                  <p className={styles.NoDataWarning}>
                    Insufficient {props.metricConfig.shortLabel} data reported
                    at the {props.fips.getChildFipsTypeDisplayName()} level for
                    the following groups:{' '}
                    {props.demographicGroupsNoData.map((group, i) => (
                      <span key={group}>
                        <b>{group}</b>
                        {i < props.demographicGroupsNoData.length - 1 && '; '}
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
      <footer>
        <div className={styles.FooterSourcesContainer}>
          <Sources
            queryResponses={props.queryResponses}
            metadata={props.metadata}
            downloadTargetScreenshot={downloadTargetScreenshot}
            isMulti={true}
          />
        </div>
      </footer>
    </Dialog>
  )
}
