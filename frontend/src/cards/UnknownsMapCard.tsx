import { CardContent, useMediaQuery, useTheme } from '@mui/material'
import ChoroplethMap from '../charts/ChoroplethMap'
import { Fips } from '../data/utils/Fips'
import { type DataTypeConfig } from '../data/config/MetricConfig'
import { type Row } from '../data/utils/DatasetTypes'
import CardWrapper from './CardWrapper'
import { MetricQuery } from '../data/query/MetricQuery'
import MissingDataAlert from './ui/MissingDataAlert'
import {
  Breakdowns,
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import {
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  ALL,
  RACE,
} from '../data/utils/Constants'
import Alert from '@mui/material/Alert'
import UnknownsAlert from './ui/UnknownsAlert'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import { useLocation } from 'react-router-dom'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import TerritoryCircles from './ui/TerritoryCircles'
import ChartTitle from './ChartTitle'
import { generateChartTitle } from '../charts/utils'
import { getMapScheme } from '../charts/mapHelperFunctions'
import { type ElementHashIdHiddenOnScreenshot } from '../utils/hooks/useDownloadCardImage'

interface UnknownsMapCardProps {
  // Variable the map will evaluate for unknowns
  dataTypeConfig: DataTypeConfig
  // Breakdown value to evaluate for unknowns
  demographicType: DemographicType
  // Geographic region of maps
  fips: Fips
  // Updates the madlib
  updateFipsCallback: (fips: Fips) => void
  // replaces race AND ethnicity with race OR ethnicity on unknowns map title and alerts
  overrideAndWithOr?: boolean
  reportTitle: string
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export default function UnknownsMapCard(props: UnknownsMapCardProps) {
  return (
    <UnknownsMapCardWithKey
      key={props.demographicType + props.dataTypeConfig.dataTypeId}
      {...props}
    />
  )
}

function UnknownsMapCardWithKey(props: UnknownsMapCardProps) {
  const preloadHeight = useGuessPreloadHeight([700, 1000])
  const metricConfig =
    props.dataTypeConfig.metrics?.pct_share_unknown ??
    props.dataTypeConfig.metrics?.pct_share

  if (!metricConfig) return <></>
  const demographicType = props.demographicType
  const location = useLocation()

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1]
      if (clickedData?.id) {
        props.updateFipsCallback(new Fips(clickedData.id))
        location.hash = `#unknown-demographic-map`
      }
    },
  }

  const theme = useTheme()
  const pageIsSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const isCompareMode = window.location.href.includes('compare')
  const mapIsWide = !pageIsSmall && !isCompareMode

  // TODO: Debug why onlyInclude(UNKNOWN, UNKNOWN_RACE) isn't working
  const mapGeoBreakdowns = Breakdowns.forParentFips(props.fips).addBreakdown(
    demographicType
  )
  const alertBreakdown = Breakdowns.forFips(props.fips).addBreakdown(
    demographicType
  )

  const mapQuery = new MetricQuery(
    [metricConfig.metricId],
    mapGeoBreakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current'
  )
  const alertQuery = new MetricQuery(
    [metricConfig.metricId],
    alertBreakdown,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current'
  )

  const chartTitle = generateChartTitle(
    /* chartTitle:  */ metricConfig.chartTitle,
    /* fips: */ props.fips,
    demographicType
  )

  const HASH_ID: ScrollableHashId = 'unknown-demographic-map'

  const elementsToHide: ElementHashIdHiddenOnScreenshot[] = [
    '#card-options-menu',
  ]

  return (
    <CardWrapper
      downloadTitle={chartTitle}
      queries={[mapQuery, alertQuery]}
      loadGeographies={true}
      minHeight={preloadHeight}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      elementsToHide={elementsToHide}
    >
      {([mapQueryResponse, alertQueryResponse], metadata, geoData) => {
        // MOST of the items rendered in the card refer to the unknowns at the CHILD geo level,
        //  e.g. if you look at the United States, we are dealing with the Unknown pct_share at the state level
        // the exception is the <UnknownsAlert /> which presents the amount of unknown demographic at the SELECTED level
        const unknownRaces: Row[] = mapQueryResponse
          .getValidRowsForField(demographicType)
          .filter(
            (row: Row) =>
              row[demographicType] === UNKNOWN_RACE ||
              row[demographicType] === UNKNOWN
          )

        const unknownEthnicities: Row[] = mapQueryResponse
          .getValidRowsForField(demographicType)
          .filter((row: Row) => row[demographicType] === UNKNOWN_ETHNICITY)

        // If a state provides both unknown race and ethnicity numbers
        // use the higher one
        const unknowns =
          unknownEthnicities.length === 0
            ? unknownRaces
            : unknownRaces.map((unknownRaceRow, index) => {
                return unknownRaceRow[metricConfig.metricId] >
                  unknownEthnicities[index][metricConfig.metricId] ||
                  unknownEthnicities[index][metricConfig.metricId] == null
                  ? unknownRaceRow
                  : unknownEthnicities[index]
              })

        const dataIsMissing = mapQueryResponse.dataIsMissing()
        const unknownsArrayEmpty = unknowns.length === 0

        // there is some data but only for ALL but not by demographic groups
        const noDemographicInfo =
          mapQueryResponse
            .getValidRowsForField(demographicType)
            .filter((row: Row) => row[demographicType] !== ALL).length === 0 &&
          mapQueryResponse
            .getValidRowsForField(demographicType)
            .filter((row: Row) => row[demographicType] === ALL).length > 0

        // when suppressing states with too low COVID numbers
        const unknownsUndefined =
          unknowns.length > 0 &&
          unknowns.every(
            (unknown: Row) => unknown[metricConfig.metricId] === undefined
          )

        // for data sets where some geos might contain `0` for every unknown pct_share, like CAWP US Congress National
        const unknownsAllZero =
          unknowns.length > 0 &&
          unknowns.every(
            (unknown: Row) =>
              unknown[metricConfig.metricId] === 0 ||
              unknown[metricConfig.metricId] == null
          )

        // show MISSING DATA ALERT if we expect the unknowns array to be empty (breakdowns/data unavailable),
        // or if the unknowns are undefined (eg COVID suppressed states)
        const showMissingDataAlert =
          (unknownsArrayEmpty && dataIsMissing) ||
          (!unknownsArrayEmpty && unknownsUndefined) ||
          noDemographicInfo

        // show NO UNKNOWNS INFO BOX for an expected empty array of UNKNOWNS (eg the AHR data)
        const showNoUnknownsInfo =
          unknownsArrayEmpty &&
          !dataIsMissing &&
          !unknownsUndefined &&
          !noDemographicInfo

        // show the UNKNOWNS MAP when there is unknowns data and it's not undefined/suppressed
        const showingVisualization =
          !unknownsArrayEmpty && !unknownsUndefined && !unknownsAllZero

        const hasChildGeo = props.fips.getChildFipsTypeDisplayName() !== ''

        const isSummaryLegend = !hasChildGeo ?? props.fips.isCounty()

        const [mapScheme, mapMin] = getMapScheme(
          /* dataTypeConfig */ props.dataTypeConfig,
          /* isSummaryLegend */ isSummaryLegend,
          /*  isUnknownsMap */ true
        )

        return (
          <CardContent sx={{ pt: 0 }}>
            <ChartTitle title={chartTitle} />
            {showingVisualization && (
              <>
                <ChoroplethMap
                  demographicType={demographicType}
                  activeDemographicGroup={UNKNOWN}
                  countColsMap={{}}
                  isUnknownsMap={true}
                  signalListeners={signalListeners}
                  metric={metricConfig}
                  legendTitle={metricConfig?.unknownsVegaLabel ?? ''}
                  data={unknowns}
                  showCounties={!props.fips.isUsa()}
                  fips={props.fips}
                  hideLegend={
                    mapQueryResponse.dataIsMissing() || unknowns.length <= 1
                  }
                  geoData={geoData}
                  filename={chartTitle}
                  mapConfig={{ mapScheme, mapMin }}
                  highestLowestGeosMode={false}
                />
                {props.fips.isUsa() && unknowns.length > 0 && (
                  <TerritoryCircles
                    demographicType={demographicType}
                    activeDemographicGroup={UNKNOWN}
                    countColsMap={{}}
                    mapIsWide={mapIsWide}
                    data={unknowns}
                    metricConfig={metricConfig}
                    dataTypeConfig={props.dataTypeConfig}
                    signalListeners={signalListeners}
                    geoData={geoData}
                    isUnknownsMap={true}
                    highestLowestGeosMode={false}
                  />
                )}
              </>
            )}
            {/* PERCENT REPORTING UNKNOWN ALERT - contains its own logic and divider/styling */}
            {!unknownsAllZero && (
              <UnknownsAlert
                queryResponse={alertQueryResponse}
                metricConfig={metricConfig}
                demographicType={demographicType}
                displayType="map"
                known={false}
                overrideAndWithOr={demographicType === RACE}
                raceEthDiffMap={
                  mapQueryResponse
                    .getValidRowsForField(demographicType)
                    .filter(
                      (row: Row) => row[demographicType] === UNKNOWN_ETHNICITY
                    ).length !== 0
                }
                noDemographicInfoMap={noDemographicInfo}
                showingVisualization={showingVisualization}
                fips={props.fips}
              />
            )}

            {/* MISSING DATA ALERT */}
            {showMissingDataAlert && (
              <MissingDataAlert
                dataName={chartTitle}
                demographicTypeString={
                  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]
                }
                isMapCard={true}
                fips={props.fips}
              />
            )}

            {/* NO UNKNOWNS INFO BOX */}
            {(showNoUnknownsInfo || unknownsAllZero) && (
              <Alert sx={{ my: 2, mx: 5 }} severity="info" role="note">
                No unknown values for{' '}
                {DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]} reported
                in this dataset
                {hasChildGeo && (
                  <> at the {props.fips.getChildFipsTypeDisplayName()} level</>
                )}
                {'.'}
              </Alert>
            )}
          </CardContent>
        )
      }}
    </CardWrapper>
  )
}
