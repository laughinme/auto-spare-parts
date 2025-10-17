import { FeedProducts } from "@/widgets/sidebar/FeedProducts"

export default function FypPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            For You
          </h1>
          <p className="text-sm text-muted-foreground">
            Откройте новые запчасти, подобранные специально под ваши
            интересы.
          </p>
        </header>

        <FeedProducts />
      </div>
    </div>
  )
}
