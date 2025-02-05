import AcsConditionProvider from './AcsConditionProvider'
import { Breakdowns, DemographicType } from '../query/Breakdowns'
import { MetricQuery } from '../query/MetricQuery'
import { Fips } from '../utils/Fips'
import { DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import FakeDataFetcher from '../../testing/FakeDataFetcher'
import { CHATAM, NC, USA } from './TestUtils'
import { RACE, SEX, AGE } from '../utils/Constants'
import { appendFipsIfNeeded } from '../utils/datasetutils'

export async function ensureCorrectDatasetsDownloaded(
  acsDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType
) {
  const acsProvider = new AcsConditionProvider()
  const specificId = appendFipsIfNeeded(acsDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  const responseIncludingAll = await acsProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(demographicType))
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  expect(responseIncludingAll.consumedDatasetIds).toContain(acsDatasetId)
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('acsConditionProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-by_sex_national_time_series',
      Breakdowns.forFips(new Fips(USA.code)),
      SEX
    )
  })

  test('National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-by_age_national_time_series',
      Breakdowns.forFips(new Fips(USA.code)),
      AGE
    )
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-by_race_national_time_series',
      Breakdowns.forFips(new Fips(USA.code)),
      RACE
    )
  })

  test('State and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-by_age_state_time_series',
      Breakdowns.forFips(new Fips(NC.code)),
      AGE
    )
  })

  test('State and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-by_sex_state_time_series',
      Breakdowns.forFips(new Fips(NC.code)),
      SEX
    )
  })

  test('State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-by_race_state_time_series',
      Breakdowns.forFips(new Fips(NC.code)),
      RACE
    )
  })

  test('County and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-by_age_county_time_series',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      AGE
    )
  })

  test('County and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-by_sex_county_time_series',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      SEX
    )
  })

  test('County and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-by_race_county_time_series',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      RACE
    )
  })
})
