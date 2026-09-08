import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false }
  });

  const onSubmit = async (_data: FormData) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    localStorage.setItem('rgu_authenticated', 'true');
    
    // Sync email and generate a profile name if it differs from the registered one
    if (localStorage.getItem('admin_email') !== _data.email) {
      localStorage.setItem('admin_email', _data.email);
      const derivedName = _data.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
      const capitalized = derivedName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      localStorage.setItem('admin_fullName', capitalized || 'Admin User');
      localStorage.setItem('admin_role', 'Admin');
      localStorage.removeItem('admin_profilePhoto');
    }
    
    window.dispatchEvent(new Event('admin-profile-update'));
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#F9FAFB]">
      
      {/* Sleek Ambient Glowing Radial Gradients behind the card */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-slate-500/5 blur-[120px] opacity-70 pointer-events-none" />
      
      {/* Dot Matrix Grid Layer */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle, #000 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-premium border border-border/40 bg-white relative overflow-hidden">
          
          {/* Symmetrical Ambient top glow in the card */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-primary to-slate-400" />

          <CardHeader className="pb-1 pt-5 px-6 sm:px-8">
            
            {/* Header Title + RGU Logo */}
            <div className="flex justify-start mb-2">
              <img 
                src="/rgu-img.png" 
                alt="RGU Logo" 
                className="-ml-2.5 h-12 w-auto object-contain shrink-0"
              />
            </div>

            <CardTitle className="text-xl font-extrabold text-foreground tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Sign in to manage admissions and candidate intelligence.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-5 pt-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className="relative group">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email" 
                    {...register('email')} 
                    type="email" 
                    placeholder="enter your mail id" 
                    className="pl-9 h-10 rounded-lg border-border bg-transparent focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-soft" 
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-xs font-medium">{errors.email.message}</motion.p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <a href="#" className="text-xs text-primary font-bold hover:underline select-none">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password" 
                    {...register('password')} 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="enter your password"
                    className="pl-9 pr-9 h-10 rounded-lg border-border bg-transparent focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-soft" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input 
                    type="checkbox" 
                    {...register('rememberMe')} 
                    className="size-4 rounded border-border text-primary focus:ring-primary/20 transition-all cursor-pointer bg-transparent" 
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember my account</span>
                </label>
              </div>

              {/* Submit Action Button */}
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-10 mt-4 rounded-lg font-bold gap-2 text-sm transition-all group/btn bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={15} className="transition-transform group-hover/btn:translate-x-0.5" />
                  </>
                )}
              </Button>

            </form>

            {/* Separator / Socials Area */}
            <div className="relative my-4">
              <Separator className="bg-border/60" />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">
                Or sign in with
              </span>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="text-xs h-9 rounded-lg font-bold border-border shadow-soft">
                <svg className="size-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.66 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99C6.16 7.42 8.87 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.71z" />
                  <path fill="#FBBC05" d="M5.24 10.55c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.39 4.74C.5 6.51 0 8.49 0 10.55s.5 4.04 1.39 5.81l3.85-3z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-3.13 0-5.84-2.38-6.76-5.51L1.39 16.3C3.37 20.18 7.35 23 12 23z" />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="text-xs h-9 rounded-lg font-bold border-border shadow-soft">
                <svg className="size-4 mr-2" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M0 0h11v11H0z"/>
                  <path fill="#81bc06" d="M12 0h11v11H12z"/>
                  <path fill="#05a6f0" d="M0 12h11v11H0z"/>
                  <path fill="#ffba08" d="M12 12h11v11H12z"/>
                </svg>
                Microsoft
              </Button>
            </div>

            {/* Signup redirection link */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              New to RGUDb?{' '}
              <Link to="/signup" className="text-primary font-bold hover:underline select-none">
                Create account
              </Link>
            </p>
          </CardContent>

        </Card>
      </motion.div>
    </div>
  );
}
