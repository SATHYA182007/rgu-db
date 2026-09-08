import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Check,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Calendar,
  LockKeyhole
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
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  role: z.enum(['Admin', 'Staff']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'Admin' },
    mode: 'onChange' // Enable real-time checks
  });

  const password = watch('password') || '';
  const confirmPassword = watch('confirmPassword') || '';

  // Password Requirement Checks
  const passLengthOk = password.length >= 8;
  const passHasNumber = /\d/.test(password);
  const passHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passMatch = password.length > 0 && password === confirmPassword;

  const nextStep = async () => {
    // Validate Step 1 fields before proceeding
    const isStep1Valid = await trigger(['fullName', 'email', 'mobile']);
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    localStorage.setItem('admin_role', data.role);
    localStorage.setItem('admin_fullName', data.fullName);
    localStorage.setItem('admin_email', data.email);
    localStorage.setItem('admin_phone', data.mobile);
    navigate('/login');
  };

  // Static mock stats for the admissions portal banner
  const recentActivities = [
    { title: 'AI Verification Success', time: 'Just now', score: '99.8%' },
    { title: 'MIT Application Scored', time: '2 mins ago', score: 'Band A' },
    { title: 'Secure Enclave Seeded', time: '10 mins ago', score: 'Verified' }
  ];

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
        className="w-full max-w-lg z-10"
      >
        <Card className="shadow-premium border border-border/40 bg-white relative overflow-hidden">
          
          {/* Soft Ambient top glow in the card */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-primary to-slate-400" />

          <CardHeader className="pb-1 pt-5 px-6 sm:px-8">
            
            {/* Header Title + RGU Logo */}
            <div className="flex items-center justify-between mb-2">
              <img 
                src="/rgu-img.png" 
                alt="RGU Logo" 
                className="-ml-2.5 h-12 w-auto object-contain shrink-0"
              />

              {/* Micro Wizard Step Indicator */}
              <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full text-xs font-semibold text-muted-foreground border border-border/20">
                <span className={step === 1 ? 'text-primary font-bold' : ''}>1</span>
                <span className="text-muted-foreground/30">/</span>
                <span className={step === 2 ? 'text-primary font-bold' : ''}>2</span>
              </div>
            </div>

            <CardTitle className="text-xl font-extrabold text-foreground tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Join the Admission Intelligence Platform to manage evaluations.
            </CardDescription>

            {/* Progress Slider */}
            <div className="w-full bg-muted h-1 rounded-full mt-3 overflow-hidden">
              <motion.div 
                className="bg-primary h-full rounded-full"
                initial={{ width: '50%' }}
                animate={{ width: step === 1 ? '50%' : '100%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-5 pt-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  
                  /* ================= STEP 1: PERSONAL DETAILS ================= */
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                      <div className="relative group">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="fullName" 
                          {...register('fullName')} 
                          placeholder="Alex Mercer" 
                          className="pl-9 h-10 rounded-lg border-border bg-transparent focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-soft" 
                        />
                      </div>
                      {errors.fullName && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-xs font-medium">{errors.fullName.message}</motion.p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                      <div className="relative group">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="signup-email" 
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

                    {/* Mobile Number */}
                    <div className="space-y-1.5">
                      <Label htmlFor="mobile" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mobile Number</Label>
                      <div className="relative group">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="mobile" 
                          {...register('mobile')} 
                          placeholder="9876543210" 
                          className="pl-9 h-10 rounded-lg border-border bg-transparent focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-soft" 
                        />
                      </div>
                      {errors.mobile && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-xs font-medium">{errors.mobile.message}</motion.p>
                      )}
                    </div>

                    {/* Proceed Button */}
                    <Button 
                      type="button" 
                      onClick={nextStep} 
                      className="w-full h-10 mt-3.5 rounded-lg font-bold gap-2 text-sm transition-all group/btn bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Continue
                      <ArrowRight size={15} className="transition-transform group-hover/btn:translate-x-0.5" />
                    </Button>
                  </motion.div>
                ) : (
                  
                  /* ================= STEP 2: SECURITY & ROLES ================= */
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >

                    {/* Password Config */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Password */}
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                        <div className="relative group">
                          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="signup-password" 
                            {...register('password')} 
                            type={showPass ? 'text' : 'password'} 
                            placeholder="choose a strong password"
                            className="pl-9 pr-9 h-10 rounded-lg border-border bg-transparent focus-visible:ring-primary/20 focus-visible:border-primary transition-all" 
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
                          <p className="text-destructive text-[10px] font-medium">{errors.password.message}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                        <div className="relative group">
                          <LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="confirm-password" 
                            {...register('confirmPassword')} 
                            type={showConfirm ? 'text' : 'password'} 
                            placeholder="confirm your password"
                            className="pl-9 pr-9 h-10 rounded-lg border-border bg-transparent focus-visible:ring-primary/20 focus-visible:border-primary transition-all" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowConfirm(!showConfirm)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirm ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-destructive text-[10px] font-medium">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Password Requirements Guide */}
                    <div className="bg-muted/40 border border-border/10 rounded-xl p-2.5 space-y-1.5 mt-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Password Strength Checks</span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {/* Length >= 8 */}
                        <div className="flex items-center gap-1.5">
                          <div className={`p-0.5 rounded-full flex items-center justify-center ${passLengthOk ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground/60'}`}>
                            <Check size={10} className="stroke-[3]" />
                          </div>
                          <span className={passLengthOk ? 'text-emerald-700 font-semibold' : 'text-muted-foreground'}>8+ Characters</span>
                        </div>

                        {/* Contains Number */}
                        <div className="flex items-center gap-1.5">
                          <div className={`p-0.5 rounded-full flex items-center justify-center ${passHasNumber ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground/60'}`}>
                            <Check size={10} className="stroke-[3]" />
                          </div>
                          <span className={passHasNumber ? 'text-emerald-700 font-semibold' : 'text-muted-foreground'}>Has 1+ Number</span>
                        </div>

                        {/* Contains Symbol */}
                        <div className="flex items-center gap-1.5">
                          <div className={`p-0.5 rounded-full flex items-center justify-center ${passHasSpecial ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground/60'}`}>
                            <Check size={10} className="stroke-[3]" />
                          </div>
                          <span className={passHasSpecial ? 'text-emerald-700 font-semibold' : 'text-muted-foreground'}>Has Special Symbol</span>
                        </div>

                        {/* Match */}
                        <div className="flex items-center gap-1.5">
                          <div className={`p-0.5 rounded-full flex items-center justify-center ${passMatch ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground/60'}`}>
                            <Check size={10} className="stroke-[3]" />
                          </div>
                          <span className={passMatch ? 'text-emerald-700 font-semibold' : 'text-muted-foreground'}>Passwords Match</span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation buttons */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                        className="h-10 rounded-lg font-bold gap-1.5 hover:bg-muted border-border"
                      >
                        <ArrowLeft size={14} /> Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="col-span-2 h-10 rounded-lg font-bold gap-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>Complete Setup <Sparkles size={14} /></>
                        )}
                      </Button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Separator / Socials Area */}
            <div className="relative my-4">
              <Separator className="bg-border/60" />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">
                Or register with
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

            {/* Login redirection link */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline select-none">
                Sign In
              </Link>
            </p>
          </CardContent>

        </Card>
      </motion.div>
    </div>
  );
}
