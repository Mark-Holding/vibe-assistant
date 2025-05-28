// Debug utility to check environment variables
export const debugEnvironment = () => {
  console.log('🔍 Environment Variables Debug:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '⚠️ Not available client-side (normal)')
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('URL Preview:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...')
  }
  
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Anon Key Preview:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...')
  }
  
  // Check if basic configuration is working
  const isConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('✅ Supabase Configuration:', isConfigured ? 'Ready' : 'Not Ready')
} 