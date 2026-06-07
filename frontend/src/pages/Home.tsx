import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecipes } from '@/hooks/useRecipes'
import DifficultyBadge from '@/components/DifficultyBadge'
import { Recipe } from '@/types'
import { Clock, ChefHat, SlidersHorizontal, Users, LayoutGrid } from 'lucide-react'
import { CUISINE_OPTIONS, formatTimeAgo } from '@/utils/format'

type TabType = 'all' | 'following'

export default function Home() {
  const { recipes, loading, followingRecipes, followingLoading, fetchFollowingRecipes } = useRecipes()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [cuisineFilter, setCuisineFilter] = useState('全部')
  const [difficultyFilter, setDifficultyFilter] = useState('全部')
  const [maxTime, setMaxTime] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [followingLoaded, setFollowingLoaded] = useState(false)
  const navigate = useNavigate()

  const isLoggedIn = !!localStorage.getItem('token')

  const filtered = useMemo(() => {
    let result = [...recipes]
    if (cuisineFilter !== '全部') {
      result = result.filter(r => r.cuisine === cuisineFilter)
    }
    if (difficultyFilter !== '全部') {
      result = result.filter(r => r.difficulty === difficultyFilter)
    }
    if (maxTime) {
      result = result.filter(r => r.cookTime <= Number(maxTime))
    }
    return result
  }, [recipes, cuisineFilter, difficultyFilter, maxTime])

  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab)
    if (tab === 'following' && isLoggedIn && !followingLoaded) {
      await fetchFollowingRecipes()
      setFollowingLoaded(true)
    }
  }

  const renderRecipeCard = (recipe: Recipe, showTimeAgo: boolean = false) => (
    <Link
      key={recipe.id}
      to={`/recipes/${recipe.id}`}
      className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow break-inside-avoid"
    >
      {recipe.photo ? (
        <img src={recipe.photo} alt={recipe.title} className="w-full object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <ChefHat className="w-12 h-12 text-gray-300" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1">{recipe.title}</h3>
        <p className="text-sm text-gray-500 mb-2">{recipe.cuisine}</p>
        <div className="flex items-center justify-between">
          <DifficultyBadge difficulty={recipe.difficulty} />
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Clock className="w-3 h-3" />
            {recipe.cookTime}分钟
          </div>
        </div>
        {recipe.authorName && (
          <p className="text-xs text-gray-400 mt-2">by {recipe.authorName}</p>
        )}
        {showTimeAgo && recipe.createdAt && (
          <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(recipe.createdAt)}</p>
        )}
      </div>
    </Link>
  )

  const renderEmptyState = (message: string, subMessage?: string) => (
    <div className="text-center py-20 text-gray-400">
      <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>{message}</p>
      {subMessage && <p className="text-sm mt-1">{subMessage}</p>}
    </div>
  )

  if (loading && activeTab === 'all') return <div className="text-center py-20 text-gray-500">加载中...</div>
  if (followingLoading && activeTab === 'following') return <div className="text-center py-20 text-gray-500">加载中...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            全部菜谱
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'following'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            关注动态
          </button>
        </div>
        {activeTab === 'all' && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            筛选
          </button>
        )}
      </div>

      {showFilters && activeTab === 'all' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">菜系</label>
              <select
                value={cuisineFilter}
                onChange={e => setCuisineFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option>全部</option>
                {CUISINE_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">难度</label>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="全部">全部</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最长时间(分钟)</label>
              <input
                type="number"
                value={maxTime}
                onChange={e => setMaxTime(e.target.value)}
                placeholder="不限"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'all' ? (
        <>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map(recipe => renderRecipeCard(recipe))}
          </div>
          {filtered.length === 0 && renderEmptyState('暂无菜谱', '点击左侧发布按钮添加第一道菜谱')}
        </>
      ) : (
        <>
          {!isLoggedIn ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>登录后查看关注作者的新菜谱</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                去登录
              </button>
            </div>
          ) : (
            <>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {followingRecipes.map(recipe => renderRecipeCard(recipe, true))}
              </div>
              {followingRecipes.length === 0 && renderEmptyState('暂无新动态', '去关注更多作者，第一时间看到他们的新菜谱')}
            </>
          )}
        </>
      )}
    </div>
  )
}
