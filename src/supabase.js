import { createClient } from "@supabase/supabase-js";

const supabaseURL = "https://dyizylbpbpkehwkvufzc.supabase.co";
const supabaseKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5aXp5bGJwYnBrZWh3a3Z1ZnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5MjcxMDUsImV4cCI6MjAzODUwMzEwNX0.ke0aZ9faZ4IToF-A6dWXf4JE8zZlCui0GCOfU3Dybgo"

const supabase = createClient(supabaseURL, supabaseKEY)

export default supabase