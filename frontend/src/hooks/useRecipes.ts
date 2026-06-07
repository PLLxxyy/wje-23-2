import { useState, useEffect, useCallback } from 'react'
import api from '@/utils/api'
import { Recipe } from '@/types'

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [followingRecipes, setFollowingRecipes] = useState<Recipe[]>([])
  const [followingLoading, setFollowingLoading] = useState(false)

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/recipes')
      setRecipes(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFollowingRecipes = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setFollowingRecipes([])
      return
    }
    setFollowingLoading(true)
    try {
      const res = await api.get('/recipes/following')
      setFollowingRecipes(res.data)
    } catch (e: any) {
      if (e.response?.status !== 401) {
        throw e
      }
    } finally {
      setFollowingLoading(false)
    }
  }, [])

  const createRecipe = async (data: any) => {
    const res = await api.post('/recipes', data)
    setRecipes(prev => [res.data, ...prev])
    return res.data
  }

  useEffect(() => {
    fetchRecipes()
    fetchFollowingRecipes()
  }, [fetchRecipes, fetchFollowingRecipes])

  return { recipes, loading, followingRecipes, followingLoading, fetchRecipes, fetchFollowingRecipes, createRecipe }
}
