import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, BookOpen, Beaker, Calculator } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    class: 6,
    preferred_language: 'english' as 'english' | 'odia',
  });
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        class: formData.class,
        preferred_language: formData.preferred_language,
      });
    } else {
      await signIn(formData.email, formData.password);
    }

    setLoading(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-science/10 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Section - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left space-y-6"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="p-3 rounded-2xl bg-primary text-primary-foreground">
              <Brain className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-science bg-clip-text text-transparent">
              NeuroQuest
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Master STEM with Interactive Learning
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience science, technology, engineering, and mathematics through 
              gamified modules designed for CBSE/NEP curriculum.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-science/10 border border-science/20"
            >
              <Beaker className="h-6 w-6 text-science" />
              <div>
                <p className="font-semibold text-science">Science</p>
                <p className="text-sm text-muted-foreground">Interactive simulations</p>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-math/10 border border-math/20"
            >
              <Calculator className="h-6 w-6 text-math" />
              <div>
                <p className="font-semibold text-math">Mathematics</p>
                <p className="text-sm text-muted-foreground">Problem solving</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Join thousands of students mastering STEM concepts'
                  : 'Continue your learning journey'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select
                        value={formData.class.toString()}
                        onValueChange={(value) => handleInputChange('class', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your class" />
                        </SelectTrigger>
                        <SelectContent>
                          {[6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                            <SelectItem key={classNum} value={classNum.toString()}>
                              Class {classNum}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="language">Preferred Language</Label>
                      <div className="flex items-center gap-2">
                        <span className={formData.preferred_language === 'english' ? 'font-semibold' : ''}>
                          English
                        </span>
                        <Switch
                          checked={formData.preferred_language === 'odia'}
                          onCheckedChange={(checked) => 
                            handleInputChange('preferred_language', checked ? 'odia' : 'english')
                          }
                        />
                        <span className={formData.preferred_language === 'odia' ? 'font-semibold' : ''}>
                          ଓଡ଼ିଆ
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};