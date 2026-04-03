// ExpertItem 是高手榜单最小展示单元，页面上的命中率、连中数都来自这里。
export interface ExpertItem {
  rank: number
  user_id: number
  nickname: string
  avatar: string
  user_type: string
  hit_rate: number
  streak: number
  return_rate: number
  score_label: string
  streak_label: string
}

// ExpertGroup 把高手按某个榜单维度分组，例如“最准榜”“连中榜”。
export interface ExpertGroup {
  key: string
  title: string
  items: ExpertItem[]
}

// 榜单接口的整体返回结构，携带当前彩种和对应的分组集合。
export interface ExpertBoardsResp {
  lottery_code: string
  groups: ExpertGroup[]
  total: number
}
