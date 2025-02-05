import NewsPreviewCard from './NewsPreviewCard'
import { type Article } from './NewsPage'

export const ARTICLES_TERM = 'Articles'

interface PinnedArticlesProps {
  articles: Article[]
}

export default function PinnedArticles(props: PinnedArticlesProps) {
  const { articles } = props

  return articles?.length > 0 ? (
    <div className='shadow-raised-tighter'>
      <h6 className='m-0 text-center font-serif font-light text-altGreen'>
        Featured:
      </h6>
      <div className='flex'>
        {articles.map((post: any) => {
          return (
            <div className='w-full sm:w-1/2' key={post.id}>
              <NewsPreviewCard article={post} />
            </div>
          )
        })}
      </div>
    </div>
  ) : (
    <></>
  )
}
