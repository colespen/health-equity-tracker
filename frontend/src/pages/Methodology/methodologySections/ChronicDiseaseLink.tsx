import KeyTerms from '../methodologyComponents/KeyTerms'
import {
  chronicDiseaseDataSources,
  chronicDiseaseDefinitionsArray,
} from '../methodologyContent/ChronicDiseaseDefinitions'
import { Helmet } from 'react-helmet-async'
import { CodeBlock } from '../methodologyComponents/CodeBlock'
import StripedTable from '../methodologyComponents/StripedTable'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTerm from '../../../styles/HetComponents/HetTerm'

const ChronicDiseaseLink = () => {
  return (
    <section id='#chronic-diseases'>
      <article>
        <Helmet>
          <title>Chronic Diseases - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Chronic Diseases</h2>

        <StripedTable
          id='#categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
            { header: 'Variables', accessor: 'variable' },
          ]}
          rows={[
            {
              category: 'Chronic Diseases',
              topic:
                'Asthma, Cardiovascular Diseases, Chronic Kidney Disease, COPD, Diabetes',
              variable: 'Race/ethnicity, Sex, Age',
            },
          ]}
        />
        <h3
          className='font-sansTitle text-title'
          id='#chronic-diseases-data-sourcing'
        >
          Data Sourcing
        </h3>
        <p>
          For chronic diseases like COPD and diabetes, our tracker sources data
          primarily from
          <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>, which
          predominantly obtains its data from the CDC's
          <a href={'urlMap.cdcBrfss'}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          , complemented by
          <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
          <a href={'urlMap.censusVoting'}>U.S. Census</a> data. Given that BRFSS
          is survey-based, data availability can sometimes be limited,
          especially for smaller and marginalized racial and ethnic groups.
          Furthermore, race and ethnicity-specific data from BRFSS is not
          presented at the county level due to limitations in the original data.
          The data on behavioral health conditions such as frequent mental
          distress, depression, and excessive drinking, featured in the Health
          Equity Tracker, primarily comes from{' '}
          <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>. AHR
          primarily relies on the{' '}
          <a href={'urlMap.cdcBrfss'}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          survey conducted by the CDC, supplemented by data from{' '}
          <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
          <a href={'urlMap.censusVoting'}>U.S. Census</a>.{' '}
        </p>
        <HetNotice
          title="A note about the CDC's Behavioral Risk Factor Surveillance System
            (BRFSS) survey"
        >
          <p>
            It's important to note that because BRFSS is survey-based, it
            sometimes lacks sufficient data for smaller or marginalized racial
            groups, making some estimates less statistically robust.
          </p>
          <p>
            Additionally, BRFSS data by race and ethnicity is not available at
            the county level, limiting our tracker's granularity for these
            metrics.
          </p>
        </HetNotice>
        <p>
          We obtain our data for the following specific issues directly from
          America's Health Rankings (AHR). This data is based on{' '}
          <HetTerm>percent share</HetTerm> metrics that AHR provides in
          downloadable data files. Click on the following to explore the
          reports:
        </p>
        <ul className='list-none pl-0'>
          <li className='font-sansTitle font-medium'>
            <a
              className='no-underline'
              href='https://healthequitytracker.org/exploredata?mls=1.copd-3.00&group1=All'
            >
              COPD
            </a>
          </li>
          <li className='font-sansTitle font-medium'>
            <a
              className='no-underline'
              href='https://healthequitytracker.org/exploredata?mls=1.diabetes-3.00&group1=All'
            >
              diabetes
            </a>
          </li>
        </ul>

        <p>
          AHR usually gives us rates as percentages. In some cases, they provide
          the number of cases for every 100,000 people. We keep the data in the
          format AHR provides it. If we need to change a percentage into a{' '}
          <HetTerm>cases per 100k rate</HetTerm>, we simply multiply the
          percentage by 1,000. For example, a 5% rate would become 5,000 per
          100,000 people.
        </p>
        <CodeBlock
          rowData={[
            {
              content: '5% rate (of 100)',
            },
            {
              content: '===',
            },
            {
              content: (
                <>
                  <b>5,000 per 100,000 people</b>
                </>
              ),
            },
          ]}
        />

        <h3
          className='font-sansTitle text-title'
          id='#chronic-diseases-data-sources'
        >
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Geographic Level', accessor: 'geo' },
            { header: 'Granularity', accessor: 'granularity' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={chronicDiseaseDataSources.map((source, index) => ({
            source: (
              <a
                key={index}
                href={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${source.id}`}
              >
                {source.data_source_name}
              </a>
            ),
            geo: source.geographic_level,
            granularity: source.demographic_granularity,
            updates: source.update_frequency,
          }))}
        />
        <KeyTerms
          id='#chronic-diseases-key-terms'
          definitionsArray={chronicDiseaseDefinitionsArray}
        />
      </article>
    </section>
  )
}

export default ChronicDiseaseLink
