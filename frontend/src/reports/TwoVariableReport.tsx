import { Box, Grid } from '@mui/material'
import { useEffect, useState, Fragment } from 'react'
import { AgeAdjustedTableCard } from '../cards/AgeAdjustedTableCard'
import { DisparityBarChartCard } from '../cards/DisparityBarChartCard'
import { MapCard } from '../cards/MapCard'
import { RateTrendsChartCard } from '../cards/RateTrendsChartCard'
import { ShareTrendsChartCard } from '../cards/ShareTrendsChartCard'
import { SimpleBarChartCard } from '../cards/SimpleBarChartCard'
import { TableCard } from '../cards/TableCard'
import { UnknownsMapCard } from '../cards/UnknownsMapCard'
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type VariableConfig,
  type VariableId,
} from '../data/config/MetricConfig'
import {
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { RACE, AGE } from '../data/utils/Constants'
import { type Fips } from '../data/utils/Fips'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  setParameter,
  swapOldDatatypeParams,
} from '../utils/urlutils'
import { reportProviderSteps } from './ReportProviderSteps'
import NoDataAlert from './ui/NoDataAlert'
import ReportToggleControls from './ui/ReportToggleControls'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import styles from './Report.module.scss'
import { Helmet } from 'react-helmet-async'
import Sidebar from '../pages/ui/Sidebar'
import ShareButtons, { SHARE_LABEL } from './ui/ShareButtons'
import { type MadLibId } from '../utils/MadLibs'
import ModeSelectorBoxMobile from './ui/ModeSelectorBoxMobile'
import { BLACK_WOMEN } from '../data/variables/HivProvider'
import RowOfTwoOptionalMetrics from './RowOfTwoOptionalMetrics'

/* Takes dropdownVar and fips inputs for each side-by-side column.
Input values for each column can be the same. */
function TwoVariableReport(props: {
  key: string
  dropdownVarId1: DropdownVarId
  dropdownVarId2: DropdownVarId
  fips1: Fips
  fips2: Fips
  updateFips1Callback: (fips: Fips) => void
  updateFips2Callback: (fips: Fips) => void
  isScrolledToTop: boolean
  reportStepHashIds?: ScrollableHashId[]
  setReportStepHashIds?: (reportStepHashIds: ScrollableHashId[]) => void
  headerScrollMargin: number
  reportTitle: string
  isMobile: boolean
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
}) {
  const [currentBreakdown, setCurrentBreakdown] = useState<BreakdownVar>(
    getParameter(DEMOGRAPHIC_PARAM, RACE)
  )

  const [variableConfig1, setVariableConfig1] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId1)
      ? METRIC_CONFIG[props.dropdownVarId1][0]
      : null
  )
  const [variableConfig2, setVariableConfig2] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId2)
      ? METRIC_CONFIG[props.dropdownVarId2][0]
      : null
  )

  const isRaceBySex =
    variableConfig1?.variableId.includes(BLACK_WOMEN) ??
    variableConfig2?.variableId.includes(BLACK_WOMEN)

  function setVariableConfigWithParam1(v: VariableConfig) {
    setParameter(DATA_TYPE_1_PARAM, v.variableId)
    setVariableConfig1(v)
  }

  function setVariableConfigWithParam2(v: VariableConfig) {
    setParameter(DATA_TYPE_2_PARAM, v.variableId)
    setVariableConfig2(v)
  }

  function setDemoWithParam(demographic: BreakdownVar) {
    setParameter(DEMOGRAPHIC_PARAM, demographic)
    setCurrentBreakdown(demographic)
  }

  useEffect(() => {
    const readParams = () => {
      const demoParam1 = getParameter(
        DATA_TYPE_1_PARAM,
        undefined,
        (val: VariableId) => {
          val = swapOldDatatypeParams(val)
          return METRIC_CONFIG[props.dropdownVarId1].find(
            (cfg) => cfg.variableId === val
          )
        }
      )
      const demoParam2 = getParameter(
        DATA_TYPE_2_PARAM,
        undefined,
        (val: VariableId) => {
          val = swapOldDatatypeParams(val)
          return METRIC_CONFIG[props.dropdownVarId2].find(
            (cfg) => cfg.variableId === val
          )
        }
      )

      const demo: BreakdownVar = getParameter(
        DEMOGRAPHIC_PARAM,
        isRaceBySex ? AGE : RACE
      )
      setVariableConfig1(
        demoParam1 ?? METRIC_CONFIG?.[props.dropdownVarId1]?.[0]
      )
      setVariableConfig2(
        demoParam2 ?? METRIC_CONFIG?.[props.dropdownVarId2]?.[0]
      )
      setCurrentBreakdown(demo)
    }
    const psSub = psSubscribe(readParams, 'twovar')
    readParams()
    return () => {
      if (psSub) {
        psSub.unsubscribe()
      }
    }
  }, [props.dropdownVarId1, props.dropdownVarId2])

  // when variable config changes (new data type), re-calc available card steps in TableOfContents
  useEffect(() => {
    const hashIdsOnScreen: any[] = Object.keys(reportProviderSteps).filter(
      (key) => document.getElementById(key)?.id !== undefined
    )

    hashIdsOnScreen && props.setReportStepHashIds?.(hashIdsOnScreen)
  }, [variableConfig1, variableConfig2])

  if (variableConfig1 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justifyContent="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId1} />
      </Grid>
    )
  }
  if (variableConfig2 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justifyContent="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId2} />
      </Grid>
    )
  }

  const showTrendCardRow =
    variableConfig1?.timeSeriesData ?? variableConfig2?.timeSeriesData
  const showAgeAdjustCardRow =
    variableConfig1?.metrics?.age_adjusted_ratio?.ageAdjusted ??
    variableConfig2?.metrics?.age_adjusted_ratio?.ageAdjusted

  const dt1 = variableConfig1.variableFullDisplayName
  const dt2 = variableConfig2.variableFullDisplayName
  const demo = BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]
  const loc1 = props.fips1.getSentenceDisplayName()
  const loc2 = props.fips2.getSentenceDisplayName()

  let browserTitle = dt1
  if (dt1 !== dt2) browserTitle += ` and ${dt2}`
  browserTitle += ` by ${demo} in ${loc1}`
  if (loc1 !== loc2) browserTitle += ` and ${loc2}`

  const offerJumpToAgeAdjustment =
    ['covid_deaths', 'covid_hospitalizations'].includes(props.dropdownVarId1) ||
    ['covid_deaths', 'covid_hospitalizations'].includes(props.dropdownVarId2)

  return (
    <>
      <Helmet>
        <title>{browserTitle} - Health Equity Tracker</title>
      </Helmet>
      <Grid container>
        {/* CARDS COLUMN */}
        <Grid item xs={12} md={10}>
          {/* Mode selectors here on small/medium, in sidebar instead for larger screens */}
          <ModeSelectorBoxMobile
            trackerMode={props.trackerMode}
            setTrackerMode={props.setTrackerMode}
            trackerDemographic={currentBreakdown}
            setDemoWithParam={setDemoWithParam}
            offerJumpToAgeAdjustment={offerJumpToAgeAdjustment}
          />

          <Grid container spacing={1} alignItems="flex-start">
            {/*  2 SETS OF TOGGLE CONTROLS */}
            {props.fips1.code === props.fips2.code ? (
              <Grid
                item
                xs={12}
                tabIndex={-1}
                style={{
                  scrollMarginTop: props.headerScrollMargin,
                }}
              >
                {/* 2 SETS OF DEMOGRAPHIC AND DATA TYPE TOGGLES */}
                <Grid container>
                  <Grid item xs={12} sm={6}>
                    <ReportToggleControls
                      dropdownVarId={props.dropdownVarId1}
                      variableConfig={variableConfig1}
                      setVariableConfig={setVariableConfigWithParam1}
                      currentBreakdown={currentBreakdown}
                      setCurrentBreakdown={setDemoWithParam}
                      fips={props.fips1}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <ReportToggleControls
                      dropdownVarId={props.dropdownVarId2}
                      variableConfig={variableConfig2}
                      setVariableConfig={setVariableConfigWithParam2}
                      currentBreakdown={currentBreakdown}
                      setCurrentBreakdown={setDemoWithParam}
                      fips={props.fips2}
                      excludeId={true}
                    />
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  tabIndex={-1}
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  {/*  FIRST TOGGLE(S) FOR COMPARE RATES REPORT */}
                  <ReportToggleControls
                    dropdownVarId={props.dropdownVarId1}
                    variableConfig={variableConfig1}
                    setVariableConfig={setVariableConfigWithParam1}
                    currentBreakdown={currentBreakdown}
                    setCurrentBreakdown={setDemoWithParam}
                    fips={props.fips1}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/*  SECOND TOGGLE(S) FOR COMPARE RATES REPORT */}
                  <ReportToggleControls
                    dropdownVarId={props.dropdownVarId2}
                    variableConfig={variableConfig2}
                    setVariableConfig={setVariableConfigWithParam2}
                    currentBreakdown={currentBreakdown}
                    setCurrentBreakdown={setDemoWithParam}
                    fips={props.fips2}
                    excludeId={true}
                  />
                </Grid>
              </>
            )}

            {/* SIDE-BY-SIDE 100K MAP CARDS */}
            <RowOfTwoOptionalMetrics
              id="rate-map"
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                updateFips: (fips: Fips) => void,
                _dropdown: any,
                isCompareCard?: boolean
              ) => (
                <MapCard
                  variableConfig={variableConfig}
                  fips={fips}
                  updateFipsCallback={(fips: Fips) => {
                    updateFips(fips)
                  }}
                  currentBreakdown={currentBreakdown}
                  isCompareCard={isCompareCard}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE RATE TREND CARDS */}
            {showTrendCardRow && (
              <RowOfTwoOptionalMetrics
                id="rates-over-time"
                variableConfig1={variableConfig1}
                variableConfig2={variableConfig2}
                fips1={props.fips1}
                fips2={props.fips2}
                headerScrollMargin={props.headerScrollMargin}
                createCard={(
                  variableConfig: VariableConfig,
                  fips: Fips,
                  unusedUpdateFips: (fips: Fips) => void,
                  unusedDropdown: any,
                  isCompareCard: boolean | undefined
                ) => (
                  <RateTrendsChartCard
                    variableConfig={variableConfig}
                    breakdownVar={currentBreakdown}
                    fips={fips}
                    isCompareCard={isCompareCard}
                    reportTitle={props.reportTitle}
                  />
                )}
              />
            )}

            {/* SIDE-BY-SIDE 100K BAR GRAPH CARDS */}

            <RowOfTwoOptionalMetrics
              id="rate-chart"
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <SimpleBarChartCard
                  variableConfig={variableConfig}
                  breakdownVar={currentBreakdown}
                  fips={fips}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE UNKNOWNS MAP CARDS */}
            <RowOfTwoOptionalMetrics
              id="unknown-demographic-map"
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                updateFips: (fips: Fips) => void
              ) => (
                <UnknownsMapCard
                  overrideAndWithOr={currentBreakdown === RACE}
                  variableConfig={variableConfig}
                  fips={fips}
                  updateFipsCallback={(fips: Fips) => {
                    updateFips(fips)
                  }}
                  currentBreakdown={currentBreakdown}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE SHARE INEQUITY TREND CARDS */}

            {showTrendCardRow && (
              <RowOfTwoOptionalMetrics
                id="inequities-over-time"
                variableConfig1={variableConfig1}
                variableConfig2={variableConfig2}
                fips1={props.fips1}
                fips2={props.fips2}
                headerScrollMargin={props.headerScrollMargin}
                createCard={(
                  variableConfig: VariableConfig,
                  fips: Fips,
                  unusedUpdateFips: (fips: Fips) => void,
                  unusedDropdown: any,
                  isCompareCard: boolean | undefined
                ) => (
                  <ShareTrendsChartCard
                    variableConfig={variableConfig}
                    breakdownVar={currentBreakdown}
                    fips={fips}
                    isCompareCard={isCompareCard}
                    reportTitle={props.reportTitle}
                  />
                )}
              />
            )}

            {/* SIDE-BY-SIDE DISPARITY BAR GRAPH (COMPARE TO POPULATION) CARDS */}
            <RowOfTwoOptionalMetrics
              id="population-vs-distribution"
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <DisparityBarChartCard
                  variableConfig={variableConfig}
                  breakdownVar={currentBreakdown}
                  fips={fips}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE DATA TABLE CARDS */}
            <RowOfTwoOptionalMetrics
              id="data-table"
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                updateFips: (fips: Fips) => void
              ) => (
                <TableCard
                  fips={fips}
                  variableConfig={variableConfig}
                  breakdownVar={currentBreakdown}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE AGE-ADJUSTED TABLE CARDS */}

            {showAgeAdjustCardRow && (
              <RowOfTwoOptionalMetrics
                id="age-adjusted-risk"
                // specific data type
                variableConfig1={variableConfig1}
                variableConfig2={variableConfig2}
                // parent variable
                dropdownVarId1={props.dropdownVarId1}
                dropdownVarId2={props.dropdownVarId2}
                fips1={props.fips1}
                fips2={props.fips2}
                updateFips1={props.updateFips1Callback}
                updateFips2={props.updateFips2Callback}
                headerScrollMargin={props.headerScrollMargin}
                createCard={(
                  variableConfig: VariableConfig,
                  fips: Fips,
                  updateFips: (fips: Fips) => void,
                  dropdownVarId?: DropdownVarId,
                  isCompareCard?: boolean
                ) => (
                  <AgeAdjustedTableCard
                    fips={fips}
                    variableConfig={variableConfig}
                    breakdownVar={currentBreakdown}
                    dropdownVarId={dropdownVarId}
                    reportTitle={props.reportTitle}
                  />
                )}
              />
            )}
          </Grid>
        </Grid>
        {/* TABLE OF CONTENTS COLUMN - DESKTOP ONLY */}
        {props.reportStepHashIds && (
          <Grid
            item
            md={2}
            container
            spacing={0}
            direction="column"
            alignItems="center"
            className={styles.FloatingSidebarWrapper}
          >
            <Sidebar
              isScrolledToTop={props.isScrolledToTop}
              reportStepHashIds={props.reportStepHashIds}
              floatTopOffset={props.headerScrollMargin}
              reportTitle={props.reportTitle}
              isMobile={props.isMobile}
              trackerMode={props.trackerMode}
              setTrackerMode={props.setTrackerMode}
              trackerDemographic={currentBreakdown}
              setDemoWithParam={setDemoWithParam}
              isRaceBySex={isRaceBySex}
            />
          </Grid>
        )}
      </Grid>
      <Box mt={5}>
        <p>{SHARE_LABEL}</p>
        <ShareButtons
          reportTitle={props.reportTitle}
          isMobile={props.isMobile}
        />{' '}
      </Box>
    </>
  )
}

export default TwoVariableReport
