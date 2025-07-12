import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCandidates } from '@/hooks/useCandidates';
import { useInterviews } from '@/hooks/useInterviews';
import GlassCard from './GlassCard';
import Footer from './Footer';
import { 
  Users, 
  ArrowLeft, 
  Link as LinkIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Award,
  TrendingUp,
  Eye,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import emailjs from '@emailjs/browser';
import { sendInterviewUpdateEmail } from '@/utils/sendInterviewEmail';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Applied: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-400/30" },
  Shortlisted: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-400/30" },
  "Interview Scheduled": { bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-400/30" },
  Interviewed: { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-400/30" },
  "Offer Extended": { bg: "bg-teal-500/20", text: "text-teal-300", border: "border-teal-400/30" },
  Hired: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-400/30" },
  Rejected: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-400/30" },
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Enhanced Countdown Timer component
const CountdownTimer: React.FC<{ date: Date }> = ({ date }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("Started");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-600 border-2 border-pink-300 shadow-lg backdrop-blur-sm hover:scale-105 transition-all duration-200">
      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse" />
      <span className="text-xs sm:text-sm font-bold text-white animate-pulse drop-shadow-sm">{timeLeft}</span>
    </div>
  );
};

// Candidate Info Card Component
const CandidateInfoCard: React.FC<{ candidate: any }> = ({ candidate }) => {
  const statusConfig = STATUS_COLORS[candidate.status] || STATUS_COLORS.Applied;
  
  return (
    <Card className="bg-gradient-to-br from-pink-900/40 to-fuchsia-900/40 border-pink-500/30 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-4 duration-500 hover-lift">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg border-2 border-pink-400/30 hover:scale-110 transition-transform duration-200 floating mx-auto sm:mx-0">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <CardTitle className="text-xl sm:text-2xl font-bold text-white mb-1 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="gradient-text-glow">{candidate.full_name}</span>
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 hover:rotate-12 transition-transform duration-200 mx-auto sm:mx-0" />
              </CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/80">
                <div className="flex items-center justify-center sm:justify-start gap-1 hover:text-pink-300 transition-colors duration-200">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center justify-center sm:justify-start gap-1 hover:text-pink-300 transition-colors duration-200">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{candidate.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Badge 
              className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold border-2 backdrop-blur-sm hover:scale-105 transition-transform duration-200 cursor-default status-badge`}
            >
              {candidate.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

// Interview Card Component
const InterviewCard: React.FC<{ interview: any; index: number }> = ({ interview, index }) => {
  const interviewDate = new Date(interview.interview_date);
  const isFuture = interviewDate.getTime() > Date.now();
  const statusConfig = STATUS_COLORS[interview.status] || STATUS_COLORS.Applied;
  const isOnline = interview.location && (interview.location.startsWith('http://') || interview.location.startsWith('https://'));

  return (
    <Card className="bg-gradient-to-br from-pink-800/30 to-fuchsia-800/30 border-pink-400/20 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group animate-in slide-in-from-bottom-4 duration-500 hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 flex items-center justify-center border border-pink-400/30 group-hover:scale-110 transition-transform duration-200">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
              </div>
              <div>
                <h4 className="font-semibold text-black text-base sm:text-lg group-hover:text-white transition-colors duration-200">{interview.type} Interview</h4>
                <p className="text-black/80 text-xs sm:text-sm font-medium group-hover:text-white/90 transition-colors duration-200">{interviewDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div className="flex items-center gap-2 mt-1 text-black/80 group-hover:text-white/90 transition-colors duration-200">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                  <span className="text-xs sm:text-sm font-medium">{interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isFuture && <CountdownTimer date={interviewDate} />}
                </div>
              </div>
            </div>
            <Badge 
              className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold border backdrop-blur-sm hover:scale-105 transition-transform duration-200 cursor-default status-badge`}
            >
              {interview.status}
            </Badge>
          </div>
          {/* Online Meeting Row */}
          <div className="flex items-center w-full mt-2">
            <div className="flex items-center gap-2 text-black/80 group-hover:text-white/90 transition-colors duration-200 flex-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
              <span className="text-xs sm:text-sm font-medium">
                {isOnline ? 'Online Meeting' : (interview.location || 'TBD')}
              </span>
            </div>
            {isOnline && (
              isFuture ? (
                <div className="flex flex-col items-end ml-auto">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Join Meeting
                  </Button>
                  <span className="text-xs text-red-400 mt-1 bg-red-100 border border-red-300 px-2 py-1 rounded font-semibold shadow animate-pulse">
                    <span className="text-red-600">⏰</span> You can join the meeting once your scheduled interview time begins.
                  </span>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="ml-auto bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-700 hover:to-fuchsia-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105 hover:scale-110 glow-pulse text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  onClick={() => window.open(interview.location, '_blank')}
                >
                  <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Join Meeting
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CandidateViewPage: React.FC = () => {
  const query = useQuery();
  const id = query.get('id');
  const { candidates, isLoading: isLoadingCandidates } = useCandidates();
  const { data: interviews, isLoading: isLoadingInterviews } = useInterviews();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-pink-800 to-fuchsia-700 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">No Candidate Selected</h2>
          <p className="text-white/70 text-sm sm:text-base">Please select a candidate to view details.</p>
        </div>
      </div>
    );
  }

  if (isLoadingCandidates || isLoadingInterviews) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-pink-800 to-fuchsia-700 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-white/70 text-sm sm:text-base">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  const candidate = candidates?.find((c: any) => c.id === id);
  const candidateInterviews = interviews?.filter((i: any) => i.candidate_id === id);

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-pink-800 to-fuchsia-700 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Candidate Not Found</h2>
          <p className="text-white/70 text-sm sm:text-base">The requested candidate could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-fuchsia-900 via-pink-800 to-fuchsia-700 bg-fixed font-sans p-0 flex flex-col">
      {/* Enhanced Header */}
      <header className="w-full bg-gradient-to-br from-pink-700/80 to-fuchsia-900/80 backdrop-blur-xl shadow-2xl px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-pink-400/30 sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="border-pink-400/40 bg-white/10 text-pink-200 hover:bg-pink-700/40 hover:scale-105 transition-all duration-200 w-8 h-8 sm:w-10 sm:h-10" 
            onClick={() => navigate('/candidate-login')} 
            title="Back to Candidate Login"
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
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <TrendingUp className="w-4 h-4 text-pink-300" />
            <span className="text-sm text-white/80 font-medium">Candidate View</span>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full">
        <div className="max-w-4xl mx-auto pt-4 sm:pt-8 px-3 sm:px-4">
          {/* Page Title */}
          <div className="text-center mb-6 sm:mb-8 animate-in fade-in duration-700">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold gradient-text-glow mb-2">
              Hi, {candidate.full_name}
            </h1>
            <p className="text-white/70 text-sm sm:text-lg">Detailed information and interview schedule</p>
          </div>

          {/* Candidate Info Card */}
          <div className="mb-6 sm:mb-8">
            <CandidateInfoCard candidate={candidate} />
          </div>

          {/* Interviews Section */}
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-700" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 flex items-center justify-center border border-pink-400/30 floating">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-pink-300" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">Scheduled Interviews</h2>
              <Badge className="bg-pink-600/30 text-pink-200 border-pink-400/40 px-2 sm:px-3 py-1 status-badge text-xs">
                {candidateInterviews?.length || 0}
              </Badge>
            </div>

            <div className="bg-gradient-to-br from-pink-900/60 to-fuchsia-900/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-md border border-pink-400/20">
              {candidateInterviews && candidateInterviews.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {candidateInterviews.map((interview: any, index: number) => (
                    <InterviewCard key={interview.id} interview={interview} index={index} />
                  ))}
                </div>
              ) : (
                <Card className="bg-gradient-to-br from-pink-800/30 to-fuchsia-800/30 border-pink-400/20 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-500 hover-lift">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pink-600/20 flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200 floating">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-pink-300" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Interviews Scheduled</h3>
                    <p className="text-white/70 text-sm sm:text-base">This candidate doesn't have any interviews scheduled yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CandidateViewPage; 