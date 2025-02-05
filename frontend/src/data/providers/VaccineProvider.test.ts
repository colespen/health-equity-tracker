import VaccineProvider from './VaccineProvider'
import AcsPopulationProvider from './AcsPopulationProvider'
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
import { NC, USA, MARIN } from './TestUtils'
import { RACE, SEX, AGE } from '../utils/Constants'
import { appendFipsIfNeeded } from '../utils/datasetutils'

export async function ensureCorrectDatasetsDownloaded(
  vaccinationDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType
) {
  const acsProvider = new AcsPopulationProvider()
  const vaccineProvider = new VaccineProvider(acsProvider)
  const specificDatasetId = appendFipsIfNeeded(
    vaccinationDatasetId,
    baseBreakdown
  )
  dataFetcher.setFakeDatasetLoaded(specificDatasetId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await vaccineProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(demographicType))
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)
  expect(responseIncludingAll.consumedDatasetIds).toContain(
    vaccinationDatasetId
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('VaccineProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'kff_vaccination-race_and_ethnicity_state',
      Breakdowns.forFips(new Fips(NC.code)),
      RACE
    )
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_vaccination_national-race_processed',
      Breakdowns.forFips(new Fips(USA.code)),
      RACE
    )
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_vaccination_national-sex_processed',
      Breakdowns.forFips(new Fips(USA.code)),
      SEX
    )
  })

  test('National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_vaccination_national-age_processed',
      Breakdowns.forFips(new Fips(USA.code)),
      AGE
    )
  })

  test('County and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_vaccination_county-alls_county',
      Breakdowns.forFips(new Fips(MARIN.code)),
      RACE
    )
  })
})
