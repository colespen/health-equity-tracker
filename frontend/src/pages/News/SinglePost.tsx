import { Button, Skeleton } from '@mui/material'
import { useState, useEffect } from 'react'
import styles from './NewsPage.module.scss'
import { Link, Redirect, useParams } from 'react-router-dom'
import { ReactRouterLinkButton, getHtml } from '../../utils/urlutils'
import {
  fetchNewsData,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
} from '../../utils/blogUtils'
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import NewsPreviewCard from './NewsPreviewCard'
import { useQuery } from 'react-query'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { type Article } from './NewsPage'
import hetLogo from '../../assets/AppbarLogo.png'
import SignupSection from '../ui/SignupSection'
import ShareButtons, {
  ARTICLE_DESCRIPTION,
} from '../../reports/ui/ShareButtons'
import LazyLoad from 'react-lazyload'

function prettyDate(dateString: string) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options as any)
}

interface SinglePostProps {
  isMobile: boolean
}

export default function SinglePost(props: SinglePostProps) {
  const [fullArticle, setFullArticle] = useState<Article>()
  const [prevArticle, setPrevArticle] = useState<Article>()
  const [nextArticle, setNextArticle] = useState<Article>()

  const { slug }: { slug?: string } = useParams()

  // FETCH ARTICLES
  const { data, isLoading, error } = useQuery(
    ARTICLES_KEY,
    fetchNewsData,
    REACT_QUERY_OPTIONS
  )

  // on page load, get prev,full, next article based on fullArticle URL slug
  useEffect(() => {
    if (data?.data) {
      const fullArticleIndex = data.data.findIndex(
        (article: Article) => article.slug === slug
      )
      setFullArticle(data.data[fullArticleIndex])
      // previous and next articles wrap around both ends of the array
      setPrevArticle(
        data.data[
          fullArticleIndex - 1 >= 0
            ? fullArticleIndex - 1
            : data.data.length - 1
        ]
      )
      setNextArticle(data.data[(fullArticleIndex + 1) % data.data.length])
    }
  }, [data?.data, slug])

  const articleCategories = fullArticle?._embedded?.['wp:term']?.[0]

  // get the large version of the image if available, if not try for the full version
  const articleImage =
    fullArticle?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes
      ?.large?.source_url ??
    fullArticle?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes
      ?.full?.source_url

  const articleImageAltText =
    fullArticle?._embedded?.['wp:featuredmedia']?.[0]?.alt_text ?? ''

  return (
    <>
      {error && (
        <Redirect
          to={{
            pathname: '/404',
          }}
        />
      )}
      <div className='flex flex-wrap justify-center'>
        <Helmet>
          <title>{`News${
            fullArticle ? ` - ${fullArticle?.title?.rendered}` : ''
          } - Health Equity Tracker`}</title>
          {/* if cross-posted from external site, should be input on WP as canonical_url */}
          {fullArticle && (
            <link
              rel='canonical'
              href={fullArticle.acf?.canonical_url ?? fullArticle.link}
            />
          )}
          <meta name='description' content={ARTICLE_DESCRIPTION} />
        </Helmet>

        {/* HEADER ROW */}
        <div
          className='
            flex
            flex-row
            flex-wrap
            items-center
            justify-center
            border-0
            border-b
            border-solid
            border-border-color
        '
        >
          {/* IMAGE SECTION OF HEADER OR LOADING INDICATOR */}

          <div className='flex w-10/12 items-center justify-center md:w-1/3'>
            {isLoading && (
              <Skeleton width={300} height={300} animation='wave'></Skeleton>
            )}
            {error && (
              <Skeleton width={300} height={300} animation={false}></Skeleton>
            )}
            {!isLoading && !error && (
              <img
                src={articleImage ?? hetLogo}
                className='
                  max-h-80
                  md:max-h-articleLogo
                  mt-8
                  h-auto
                  w-3/5
                  max-w-md
                  rounded-xl
                  object-contain
                  md:mt-0'
                alt={articleImageAltText}
                width={200}
                height={100}
              />
            )}
          </div>

          {/* TEXT SECTION OF HEADER */}
          <div
            className='
              px-15
              flex
              w-full
              flex-col
              flex-wrap
              justify-center
              border-0
              border-solid
              border-border-color
              py-8
              md:w-2/3
              md:border-l
              md:px-16
              md:py-24
          '
          >
            {/* ARTICLE TITLE OR LOADING INDICATOR */}
            <div
              className='
              leading-tight
              m-auto
              pb-4
              text-left
              font-serif
              text-header
              font-light
              text-alt-green
              md:text-bigHeader
            '
            >
              {isLoading ? (
                <Skeleton></Skeleton>
              ) : (
                getHtml(fullArticle?.title?.rendered ?? '')
              )}
            </div>

            {/* AUTHOR(S) OR LOADING OR NOTHING */}
            <div className='text-start text-text text-alt-dark'>
              {fullArticle?.acf?.contributing_author ? (
                <>
                  Authored by{' '}
                  <Link
                    className='cursor-pointer'
                    to={`${NEWS_PAGE_LINK}?author=${fullArticle.acf.contributing_author}`}
                  >
                    {fullArticle.acf.contributing_author}
                  </Link>
                </>
              ) : isLoading ? (
                <Skeleton></Skeleton>
              ) : (
                <></>
              )}

              {fullArticle?.acf?.contributing_author &&
              fullArticle?.acf?.post_nominals
                ? `, ${fullArticle.acf.post_nominals}`
                : ''}
              {fullArticle?.acf?.additional_contributors ? (
                <div className='text-start text-text text-alt-dark underline'>
                  Contributors: {fullArticle.acf.additional_contributors}
                </div>
              ) : (
                ''
              )}
            </div>

            {/* PUBLISH DATE WITH LOADING INDICATOR */}
            <div className='text-start text-text text-alt-dark'>
              {fullArticle?.date ? (
                <>Published {prettyDate(fullArticle.date)}</>
              ) : (
                <Skeleton width='50%'></Skeleton>
              )}
            </div>

            {/* OPTIONAL ARTICLE CATEGORIES */}
            {articleCategories && (
              <div className='text-start text-text text-alt-dark'>
                Categorized under:{' '}
                {articleCategories.map((categoryChunk, i) => (
                  <span key={categoryChunk.id}>
                    <Link
                      to={`${NEWS_PAGE_LINK}?category=${categoryChunk.name}`}
                    >
                      {categoryChunk.name}
                    </Link>
                    {i < articleCategories.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}

            {/* SOCIAL MEDIA ICONS */}
            <div className='w-full py-6 text-left md:w-1/4'>
              <ShareButtons isMobile={false} article={fullArticle} />
            </div>
          </div>
        </div>

        {/* ARTICLE CONTENT SECTION */}
        <div className='flex flex-wrap justify-center py-5'>
          <div>
            <article className={styles.FullArticleContainer}>
              {/* RENDER WP ARTICLE HTML */}
              {fullArticle && getHtml(fullArticle.content?.rendered)}

              {/* OPTIONALLY RENDER CONTINUE READING BUTTON */}
              {fullArticle?.acf?.full_article_url && (
                <div className='mt-10'>
                  <Button
                    variant='contained'
                    color='primary'
                    className='
                      rounded-2xl
                      bg-alt-green
                      px-8
                      py-4
                      text-center
                      font-sansTitle
                      text-title
                      font-medium
                      text-white'
                    href={fullArticle.acf.full_article_url}
                  >
                    Continue Reading
                    {fullArticle?.acf?.friendly_site_name
                      ? ` on ${fullArticle.acf.friendly_site_name}`
                      : ''}{' '}
                    <OpenInNewIcon />
                  </Button>
                </div>
              )}

              {/* OPTIONALLY RENDER REPRINT NOTICE */}
              <div className='mt-10'>
                <div className='leading-none text-left font-sansText text-text font-medium'>
                  {fullArticle?.acf?.canonical_url && (
                    <span className={styles.ReprintNotice}>
                      Note: this article was originally published on{' '}
                      <a href={fullArticle?.acf?.canonical_url}>another site</a>
                      , and is reprinted here with permission.
                    </span>
                  )}
                </div>
              </div>
            </article>
          </div>

          {/* PREV / NEXT ARTICLES NAV */}
          <LazyLoad offset={300} height={300} once>
            <div className='flex flex-wrap items-center justify-center border-0 border-b border-solid border-alt-grey'>
              <div className='w-full md:w-1/3'>
                {prevArticle && (
                  <NewsPreviewCard article={prevArticle} arrow={'prev'} />
                )}
              </div>
              <div className='w-full md:w-1/3'>
                <ReactRouterLinkButton
                  url={NEWS_PAGE_LINK}
                  className={styles.PrevNextHeaderText}
                  displayName='All Posts'
                />
              </div>
              <div className='w-full md:w-1/3'>
                {nextArticle && (
                  <>
                    <NewsPreviewCard article={nextArticle} arrow={'next'} />
                  </>
                )}
              </div>
            </div>
          </LazyLoad>
        </div>

        {/* EMAIL SIGNUP  */}
        <SignupSection />
      </div>
    </>
  )
}
