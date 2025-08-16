import { supabase } from './supabase'
import type { Problem, UserProfile } from './supabase'

// Auth Functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Problem CRUD Operations
export const createProblem = async (problemData: Omit<Problem, 'id' | 'created_at' | 'updated_at' | 'votes'>) => {
  const { data, error } = await supabase
    .from('problems')
    .insert([{
      ...problemData,
      votes: 0
    }])
    .select()
    .single()
  
  return { data, error }
}

export const getProblems = async (limit = 50) => {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export const getProblemsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const updateProblem = async (id: string, updates: Partial<Problem>) => {
  const { data, error } = await supabase
    .from('problems')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deleteProblem = async (id: string) => {
  const { data, error } = await supabase
    .from('problems')
    .delete()
    .eq('id', id)
  
  return { data, error }
}

export const voteProblem = async (id: string) => {
  const { data, error } = await supabase.rpc('increment_votes', {
    problem_id: id
  })
  
  return { data, error }
}

// File Upload
export const uploadImage = async (file: File, bucket = 'problem-images') => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) {
    return { data: null, error }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return { data: { path: filePath, publicUrl }, error: null }
}

// User Profile Functions
export const createUserProfile = async (userId: string, fullName?: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{
      user_id: userId,
      full_name: fullName,
      points: 0
    }])
    .select()
    .single()
  
  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const updateUserPoints = async (userId: string, pointsToAdd: number) => {
  const { data, error } = await supabase.rpc('add_user_points', {
    user_id: userId,
    points: pointsToAdd
  })
  
  return { data, error }
}

// Statistics
export const getStatistics = async () => {
  const { data: totalProblems, error: totalError } = await supabase
    .from('problems')
    .select('id', { count: 'exact', head: true })

  const { data: fixedProblems, error: fixedError } = await supabase
    .from('problems')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Fixed')

  const { data: activeUsers, error: usersError } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })

  return {
    totalProblems: totalProblems || 0,
    fixedProblems: fixedProblems || 0,
    activeUsers: activeUsers || 0,
    errors: { totalError, fixedError, usersError }
  }
}
