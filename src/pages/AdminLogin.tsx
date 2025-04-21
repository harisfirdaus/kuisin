
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // In a real application, this would connect to Supabase via Edge Functions
    // For now, we'll simulate a login with a timeout and redirect
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would authenticate with Supabase here
      // For demo purposes, allow any login with an email and password length > 6
      if (password.length < 6) {
        throw new Error("Password minimal 6 karakter");
      }
      
      // Redirect to admin dashboard
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neo-lightgray flex flex-col">
      <nav className="neo-navbar flex justify-between items-center">
        <div className="text-2xl font-bold">Kuisin.</div>
        <Link to="/" className="font-medium flex items-center gap-2 hover:text-neo-blue transition-colors">
          <ArrowLeft size={20} />
          Kembali ke Beranda
        </Link>
      </nav>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="neo-card w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
          
          {error && (
            <div className="bg-neo-red/10 border-4 border-neo-red text-neo-red p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block font-bold">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neo-input w-full"
                placeholder="Masukkan email Anda"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block font-bold">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neo-input w-full"
                placeholder="Masukkan password"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="neo-button w-full"
              disabled={isLoading}
            >
              {isLoading ? "Login..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
      
      <footer className="neo-navbar text-center py-4">
        <p>&copy; {new Date().getFullYear()} Kuisin. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminLogin;
