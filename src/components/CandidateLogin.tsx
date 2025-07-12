import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidates } from '@/hooks/useCandidates';
import { useInterviews } from '@/hooks/useInterviews';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, ArrowLeft, User, Mail, Phone } from 'lucide-react';
import Footer from './Footer';

const CandidateLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    full_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { candidates } = useCandidates();
  const { data: interviews } = useInterviews();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if at least two fields are provided
      const providedFields = Object.values(formData).filter(field => field.trim() !== '').length;
      if (providedFields < 2) {
        toast({
          title: "Validation Error",
          description: "Please provide at least two fields (email, phone, or full name).",
          variant: "destructive"
        });
        return;
      }

      // Find candidate by matching at least two fields
      const matchingCandidate = candidates?.find(candidate => {
        let matchCount = 0;
        // Normalize and trim input and candidate fields
        const inputEmail = formData.email.trim().toLowerCase();
        const inputPhone = formData.phone.trim();
        const inputFullName = formData.full_name.trim().toLowerCase();
        const candidateEmail = (candidate.email || '').trim().toLowerCase();
        const candidatePhone = (candidate.phone || '').trim();
        const candidateFullName = (candidate.full_name || '').trim().toLowerCase();

        if (inputEmail && candidateEmail === inputEmail) {
          matchCount++;
        }
        if (inputPhone && candidatePhone === inputPhone) {
          matchCount++;
        }
        if (inputFullName && candidateFullName === inputFullName) {
          matchCount++;
        }
        return matchCount >= 2;
      });

      if (!matchingCandidate) {
        toast({
          title: "Authentication Failed",
          description: "No candidate found with the provided information. Please check your details and try again.",
          variant: "destructive"
        });
        return;
      }

      // Check if candidate has any interviews
      const candidateInterviews = interviews?.filter(interview => interview.candidate_id === matchingCandidate.id);
      
      if (!candidateInterviews || candidateInterviews.length === 0) {
        toast({
          title: "No Interviews Found",
          description: "You don't have any scheduled interviews at the moment.",
          variant: "destructive"
        });
        return;
      }

      // Navigate to candidate view page with the candidate ID
      navigate(`/candidate_view?id=${matchingCandidate.id}`);
      
      toast({
        title: "Welcome Back!",
        description: `Hello ${matchingCandidate.full_name}, you've successfully logged in.`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-fuchsia-900 via-pink-800 to-fuchsia-700 bg-fixed font-sans p-0 flex flex-col">
      {/* Header */}
      <header className="w-full bg-gradient-to-br from-pink-700/80 to-fuchsia-900/80 backdrop-blur-xl shadow-2xl px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-pink-400/30 sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="border-pink-400/40 bg-white/10 text-pink-200 hover:bg-pink-700/40 hover:scale-105 transition-all duration-200 w-8 h-8 sm:w-10 sm:h-10" 
            onClick={() => navigate('/')} 
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-600 to-fuchsia-700 flex items-center justify-center shadow-lg backdrop-blur-lg border border-pink-200/40">
            <Users className="text-white w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div>
            <span className="block text-lg sm:text-2xl lg:text-3xl font-extrabold text-white drop-shadow-lg">Employee CRM</span>
            <span className="hidden sm:block text-sm text-white/80 font-medium">TaskBotic AI Solutions</span>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8 animate-in fade-in duration-700">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg border-2 border-pink-400/30 mx-auto mb-4 floating">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text-glow mb-2">
              Candidate Login
            </h1>
            <p className="text-white/70 text-sm sm:text-base">
              Enter your details to access your interview information
            </p>
          </div>

          {/* Login Form */}
          <Card className="bg-gradient-to-br from-pink-900/20 to-fuchsia-900/100 border-pink-500/30 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-black text-center">
                Access Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black/90 text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 bg-white/10 border-pink-400/30 text-black placeholder:text-black/50 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black/90 text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 bg-white/10 border-pink-400/30 text-black placeholder:text-black/50 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-black/90 text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="pl-10 bg-white/10 border-pink-400/30 text-black placeholder:text-black/50 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-700 hover:to-fuchsia-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Verifying...
                      </div>
                    ) : (
                      'Access My Profile'
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-pink-800/20 rounded-lg border border-pink-400/20">
                <p className="text-black/80 text-xs text-center">
                  <strong>Note:</strong> Please provide at least two of the three fields above to access your profile. 
                  Your information will be matched against our interview database.
                </p>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CandidateLogin; 