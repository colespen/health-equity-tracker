import Grid from '@mui/material/Grid'
import { Helmet } from 'react-helmet-async'
import {
  AGE_ADJUST_HIV_DEATHS_US_SETTING,
  EXPLORE_DATA_PAGE_LINK,
} from '../../utils/internalRoutes'
import HetBigCTA from '../../styles/HetComponents/HetBigCTA'
import AgeAdjustmentIntro, {
  AlgorithmSection,
  DataSourcingSection,
} from '../Methodology/methodologyComponents/AgeAdjustmentComponents'

export default function OldAgeAdjustmentTab() {
  return (
    <>
      <Helmet>
        <title>Age-Adjustment - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Age-Adjustment</h2>
      <Grid
        container
        direction='column'
        justifyContent='space-around'
        alignItems='center'
      >
        <Grid container className='m-auto max-w-md px-5 pb-12 pt-1'>
          {/* Age-adjusted Info */}
          <article className='pb-6'>
            <h3
              className='text-center font-serif text-smallHeader font-light text-alt-black'
              id='main'
            >
              Calculating Age-Adjusted Ratios
            </h3>

            <div className='text-left font-sansText text-small text-alt-black'>
              <AgeAdjustmentIntro />

              <DataSourcingSection />

              <AlgorithmSection />

              {/* TABLES */}

              <h3 className='text-left font-serif text-smallestHeader font-light text-alt-black'>
                Age-Adjustment Example: HIV Deaths
              </h3>
              <p>
                Here is an example of a single state with two races,{' '}
                <b>Race A</b> and <b>Race B</b>, with three age breakdowns:{' '}
                <b>0-29</b>, <b>30-59</b>, and <b>60+</b>. <b>Race A</b> will be
                the race we divide against to obtain our ratios (like{' '}
                <b>White, Non-Hispanic</b>), and <b>Race B</b> is any other race
                group.
              </p>
              <table className='m-4 border-collapse border-solid border-bg-color p-1'>
                <thead className='font-bold'>
                  <tr className='bg-join-effort-bg1'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Age Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      HIV Deaths
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Population
                    </td>
                  </tr>
                </thead>

                <tbody>
                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0-29
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      50
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      600,000
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      30-59
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      500
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      800,000
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      60+
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      5,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      200,000
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0-29
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      20
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      200,000
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      30-59
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      200
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      300,000
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      60+
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      800
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      60,000
                    </td>
                  </tr>
                </tbody>
              </table>

              <h4 className='mt-20 font-sansText text-text font-medium'>
                1) Calculate the <b>age-specific HIV death rates</b> which will
                be each race/age group's death count divided by its population.
              </h4>

              {/* CALCULATE AGE SPECIFIC DEATH RATES TABLE */}
              <table className='m-4 border-collapse border-solid border-bg-color p-1'>
                <thead className='font-bold'>
                  <tr className='bg-join-effort-bg1'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Age Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      HIV Deaths
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Population
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Age-Specific HIV Death Rate
                    </td>
                  </tr>
                </thead>

                <tbody>
                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0-29
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      50
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      600,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>(50 / 600,000)</div>
                      <b> = 0.00008333</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      30-59
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      500
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      800,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        (500 / 800,000)
                      </div>
                      <b> = 0.000625</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      60+
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      5,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      200,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        (5,000 / 200,000)
                      </div>
                      <b> = 0.025</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0-29
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      20
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      200,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>(20 / 200,000)</div>
                      <b> = 0.0001</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      30-59
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      200
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      300,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        (200 / 300,000)
                      </div>
                      <b> = 0.00066667</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      60+
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      800
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      60,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>(800 / 60,000)</div>
                      <b> = 0.01333333</b>
                    </td>
                  </tr>
                </tbody>
              </table>

              <h4 className='mt-20 font-sansText text-text font-medium'>
                2) Get the <b>standard population</b> per age group, which will
                be the summed population of all race/age groups within that age
                group.
              </h4>

              {/* A + B TABLE */}
              <table className='m-4 border-collapse border-solid border-bg-color p-1'>
                <thead className='font-bold'>
                  <tr className='bg-join-effort-bg1'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Age Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Standard Population
                    </td>
                  </tr>
                </thead>

                <tbody>
                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Total (A & B)
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0-29
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        600,000 + 200,000
                      </div>
                      <b>= 800,000</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Total (A & B)
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      30-59
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        800,000 + 300,000
                      </div>
                      <b>= 1,100,000</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Total (A & B)
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      60+
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        200,000 + 60,000
                      </div>
                      <b>= 260,000</b>
                    </td>
                  </tr>
                </tbody>
              </table>

              <h4 className='mt-20 font-sansText text-text font-medium'>
                3) Calculate the expected deaths for each age/race group:
              </h4>
              <p>As noted above, the formula for each row is:</p>
              <pre className='mx-1 mb-8 mt-1 overflow-x-auto whitespace-pre-wrap break-words border-solid border-bg-color bg-explore-bg-color p-1 text-smallest'>
                (HIV Deaths / Population) X Standard Population for
                Corresponding Age Group
              </pre>
              <table className='m-4 border-collapse border-solid border-bg-color p-1'>
                <thead className='font-bold'>
                  <tr className='bg-join-effort-bg1'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Age Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Age-Specific HIV Death Rate
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Standard Population
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Expected HIV Deaths
                    </td>
                  </tr>
                </thead>

                <tbody>
                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0-29
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0.00008333
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>for Ages 0-29:</div>
                      800,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        0.00008333 * 800,000
                      </div>
                      <b> = 66.67</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      30-59
                    </td>

                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0.000625
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        for Ages 30-59:
                      </div>
                      1,100,000
                    </td>

                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        0.000625 * 1,100,000
                      </div>
                      <b> = 687.5</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      60+
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0.025
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>for Ages 60+:</div>
                      260,000
                    </td>

                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        0.025 * 260,000
                      </div>
                      <b> = 6,500</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0-29
                    </td>

                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0.0001
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>for Ages 0-29:</div>
                      800,000
                    </td>

                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        0.0001 * 800,000
                      </div>
                      <b> = 80</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      30-59
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0.00066667
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        for Ages 30-59:
                      </div>
                      1,100,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        0.00066667 * 1,100,000
                      </div>
                      <b> = 733.33</b>
                    </td>
                  </tr>

                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      60+
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      0.01333333
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>for Ages 60+:</div>
                      260,000
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        0.01333333 * 260,000
                      </div>
                      <b> = 3466.67</b>
                    </td>
                  </tr>
                </tbody>
              </table>
              <h4 className='mt-20 font-sansText text-text font-medium'>
                4) For each race, we sum together the expected HIV deaths from
                each of its age groups to calculate the total expected HIV
                deaths for that race:
              </h4>
              <table className='m-4 border-collapse border-solid border-bg-color p-1'>
                <thead className='font-bold'>
                  <tr className='bg-join-effort-bg1'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Total Expected HIV Deaths
                    </td>
                  </tr>
                </thead>

                <tbody>
                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        66.67 + 687.5 + 6,500
                      </div>
                      <b>= 7,254.17</b>
                    </td>
                  </tr>
                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        80 + 733.33 + 3466.67
                      </div>
                      <b>= 4,280</b>
                    </td>
                  </tr>
                </tbody>
              </table>
              <h4 className='mt-20 font-sansText text-text font-medium'>
                5) Calculate the age-adjusted death ratio:
              </h4>
              <table className='m-4 border-collapse border-solid border-bg-color p-1'>
                <thead className='font-bold'>
                  <tr className='bg-join-effort-bg1'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race Group
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Total Expected HIV Deaths
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Age-Adjusted Death Ratio
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race A
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      7,254.17
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        7,254.17 / 7,254.17
                      </div>
                      <b>= 1.0×</b>
                    </td>
                  </tr>
                  <tr className='odd:bg-white even:bg-explore-bg-color'>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      Race B
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      4,280
                    </td>
                    <td className='border-collapse border-solid border-bg-color p-1'>
                      <div className='text-smallest italic'>
                        4,280 / 7,254.17
                      </div>
                      <b>= 0.6×</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </Grid>

        <Grid item xs={12} sm={12} md={8} lg={5}>
          <HetBigCTA
            href={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_HIV_DEATHS_US_SETTING}
          >
            Explore age-adjusted ratios
          </HetBigCTA>
        </Grid>
      </Grid>
    </>
  )
}
