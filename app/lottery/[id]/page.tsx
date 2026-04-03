import { LotteryDetailPage } from "@/src/features/lottery/page/lottery-detail-page"

interface LotteryDetailRouteProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: LotteryDetailRouteProps) {
  const { id } = await params
  const lotteryInfoID = Number.parseInt(String(id), 10)
  return <LotteryDetailPage lotteryInfoID={lotteryInfoID} />
}
