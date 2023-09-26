import styles from './Sources.module.scss'
import React from 'react'
import { type MapOfDatasetMetadata } from '../../data/utils/DatasetTypes'
import {
  DATA_SOURCE_PRE_FILTERS,
  LinkWithStickyParams,
} from '../../utils/urlutils'
import { DATA_CATALOG_PAGE_LINK, HET_URL } from '../../utils/internalRoutes'
import { DataSourceMetadataMap } from '../../data/config/MetadataMap'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import {
  type DatasetId,
  DatasetMetadataMap,
  type DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import { Grid } from '@mui/material'
import { type MetricId } from '../../data/config/MetricConfig'

function insertPunctuation(idx: number, numSources: number) {
  let punctuation = ''
  // ADD COMMAS (INCL OXFORDS) FOR THREE OR MORE SOURCES
  if (numSources > 2 && idx < numSources - 1) punctuation += ', '
  // ADD " AND " BETWEEN LAST TWO SOURCES
  if (numSources > 1 && idx === numSources - 2) punctuation += ' and '
  // ADD FINAL PERIOD
  if (idx === numSources - 1) punctuation += '.'
  return punctuation
}

interface DataSourceInfo {
  name: string
  updateTimes: Set<string>
}

export function getDatasetIdsFromResponses(
  queryResponses: MetricQueryResponse[]
): Array<DatasetId | DatasetIdWithStateFIPSCode> {
  return queryResponses.reduce(
    (accumulator: Array<DatasetId | DatasetIdWithStateFIPSCode>, response) =>
      accumulator.concat(response.consumedDatasetIds),
    []
  )
}

export const stripCountyFips = (
  datasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode>
): DatasetId[] => {
  const strippedData = datasetIds.map((id) => {
    // uses RegEx to check if datasetId string contains a hyphen followed by any two digits
    const regex = /-[0-9]/g
    if (regex.test(id)) {
      return id.split('-').slice(0, 2).join('-')
    } else return id
  })
  return strippedData as DatasetId[]
}

export function getDataSourceMapFromDatasetIds(
  datasetIds: string[],
  metadata: MapOfDatasetMetadata
): Record<string, DataSourceInfo> {
  const dataSourceMap: Record<string, DataSourceInfo> = {}
  datasetIds.forEach((datasetId) => {
    const dataSourceId = metadata?.[datasetId]?.source_id

    if (dataSourceId === undefined) {
      return
    }
    if (!dataSourceMap[dataSourceId]) {
      dataSourceMap[dataSourceId] = {
        name: DataSourceMetadataMap[dataSourceId]?.data_source_name || '',
        updateTimes:
          metadata[datasetId].update_time === 'unknown'
            ? new Set()
            : new Set([metadata[datasetId].update_time]),
      }
    } else if (metadata[datasetId].update_time !== 'unknown') {
      dataSourceMap[dataSourceId].updateTimes = dataSourceMap[
        dataSourceId
      ].updateTimes.add(metadata[datasetId].update_time)
    }
  })
  return dataSourceMap
}

interface SourcesProps {
  queryResponses: MetricQueryResponse[]
  metadata: MapOfDatasetMetadata
  isCensusNotAcs?: boolean
  hideNH?: boolean
  downloadTargetScreenshot?: () => Promise<boolean>
  isMulti?: boolean
}

export function Sources(props: SourcesProps) {
  // If all data is missing, no need to show sources.
  if (props.queryResponses.every((resp) => resp.dataIsMissing())) {
    return <></>
  }

  const unstrippedDatasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode> =
    getDatasetIdsFromResponses(props.queryResponses)
  let datasetIds: DatasetId[] = stripCountyFips(unstrippedDatasetIds)

  // for Age Adj only, swap ACS source(s) for Census Pop Estimate
  if (props.isCensusNotAcs) {
    datasetIds = datasetIds.filter((datasetId) => !datasetId.includes('acs'))
    datasetIds.push('census_pop_estimates-race_and_ethnicity')
  }

  const dataSourceMap = getDataSourceMapFromDatasetIds(
    datasetIds,
    props.metadata
  )

  const showNhFootnote =
    !props.hideNH &&
    datasetIds.some((id) => DatasetMetadataMap[id]?.contains_nh)

  const sourcesInfo =
    Object.keys(dataSourceMap).length > 0 ? (
      <p className={styles.FootnoteText}>
        Sources:{' '}
        {Object.keys(dataSourceMap).map((dataSourceId, idx) => (
          <React.Fragment key={dataSourceId}>
            <LinkWithStickyParams
              target="_blank"
              to={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${dataSourceId}`}
            >
              {dataSourceMap[dataSourceId].name}
            </LinkWithStickyParams>{' '}
            {dataSourceMap[dataSourceId].updateTimes.size === 0 ? (
              <>(last update unknown) </>
            ) : (
              <>
                (updated{' '}
                {Array.from(dataSourceMap[dataSourceId].updateTimes).join(', ')}
                )
              </>
            )}
            {insertPunctuation(idx, Object.keys(dataSourceMap).length)}
          </React.Fragment>
        ))}{' '}
      </p>
    ) : (
      ''
    )

  return (
    <Grid container className={styles.Footnote}>
      {/* NH note (if needed) listed first, full-width */}
      <Grid item xs={12} alignItems={'center'}>
        {showNhFootnote && (
          <>
            <p className={styles.FootnoteTextNH}>Note. NH: Non-Hispanic. </p>
            <p className={styles.FootnoteTextNH}>
              Note. To promote inclusive language, we replace the source data
              labels <i>Multiracial</i> with <em>Two or more races</em>, and{' '}
              <i>Some other race</i> with <i>Unrepresented race</i>.{' '}
            </p>
          </>
        )}
      </Grid>

      <>
        <Grid
          item
          xs={props.isMulti ? 8 : 12}
          sm={props.isMulti ? 9 : 12}
          md={props.isMulti ? 10 : 12}
          container
          alignItems={'center'}
        >
          {sourcesInfo}
        </Grid>
      </>
    </Grid>
  )
}

interface MetricDetailsProps {
  consumedIds: MetricId[]
}

export function MetricDetails(props: MetricDetailsProps) {
  return (
    <>
      Metrics:
      {props.consumedIds.map((metricId: MetricId) => metricId)}
    </>
  )
}

export function currentYear(): number {
  return new Date().getFullYear()
}
export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`
