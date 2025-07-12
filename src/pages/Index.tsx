import React, { useState, useEffect } from "react";
import CandidatesPage from "@/components/CandidatesPage";
import EmployeesPage from "@/components/EmployeesPage";
import DepartmentsPage from "@/components/DepartmentsPage";
import InterviewsPage from "@/components/InterviewsPage";
import { Users, Briefcase, LogOut, Building2, Calendar, Menu as MenuIcon, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useTotalCandidates } from "@/hooks/useCandidates";
import { useTotalEmployees } from "@/hooks/useEmployees";
import { useTotalDepartments } from "@/hooks/useDepartments";
import { useTotalInterviews } from "@/hooks/useInterviews";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Menu for navigation bar
const MENU = [
  {
    key: "candidates",
    label: "Candidates",
    icon: <Users className="mr-2" />,
  },
  {
    key: "employees",
    label: "Employees",
    icon: <Briefcase className="mr-2" />,
  },
  {
    key: "departments",
    label: "Departments",
    icon: <Building2 className="mr-2" />,
  },
  {
    key: "interviews",
    label: "Interviews",
    icon: <Calendar className="mr-2" />,
  },
];

const Index = () => {
  const [section, setSection] = useState("candidates");
  const { user, signOut } = useAuth();

  const [liveEmployeeCount, setLiveEmployeeCount] = useState<number>(0);
  const [liveDepartmentCount, setLiveDepartmentCount] = useState<number>(0);
  const [liveInterviewCount, setLiveInterviewCount] = useState<number>(0);

  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const { data: totalCandidates, isLoading: isLoadingTotalCandidates } = useTotalCandidates();
  const { data: totalEmployees, isLoading: isLoadingTotalEmployees } = useTotalEmployees();
  const { data: totalDepartments, isLoading: isLoadingTotalDepartments } = useTotalDepartments();
  const { data: totalInterviews, isLoading: isLoadingTotalInterviews } = useTotalInterviews();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsername() {
      if (user?.id) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        if (data && data.username) setProfileUsername(data.username);
        else setProfileUsername(null);
      }
    }
    fetchUsername();
  }, [user]);

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["candidates-total-count"],
      queryFn: async () => {
        const { count, error } = await supabase
          .from("candidates")
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        return count || 0;
      },
    });
    queryClient.prefetchQuery({
      queryKey: ["employees-total-count"],
      queryFn: async () => {
        const { count, error } = await supabase
          .from("employees")
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        return count || 0;
      },
    });
    queryClient.prefetchQuery({
      queryKey: ["departments-total-count"],
      queryFn: async () => {
        const { count, error } = await supabase
          .from("departments")
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        return count || 0;
      },
    });
    queryClient.prefetchQuery({
      queryKey: ["interviews-total-count"],
      queryFn: async () => {
        const { count, error } = await supabase
          .from("interviews")
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        return count || 0;
      },
    });
  }, [queryClient]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-fuchsia-900 via-pink-800 to-fuchsia-700 bg-fixed font-sans">
      {/* Header */}
      <header className="w-full bg-gradient-to-br from-pink-700/70 to-fuchsia-900/70 backdrop-blur-lg shadow-md px-4 sm:px-6 py-3 flex justify-between items-center border-b border-pink-400/25 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-pink-600 flex items-center justify-center shadow-lg backdrop-blur-lg border border-pink-200/40">
            <Users className="text-white" size={28} />
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-extrabold text-white drop-shadow-pink">Employee CRM</span>
            <span className="hidden sm:block text-xs text-white/80">TaskBotic AI Solutions</span>
          </div>
        </div>

        {/* Desktop Navbar menu */}
        <nav className="hidden lg:flex space-x-2">
          {MENU.map((m) => (
            <button
              key={m.key}
              onClick={() => setSection(m.key)}
              className={
                `flex items-center px-6 py-2 rounded-full font-semibold
                border border-pink-200/25 shadow
                transition-all duration-200
                ${section === m.key
                  ? "bg-pink-500/80 text-white shadow-lg"
                  : "bg-white/10 text-pink-50 hover:bg-pink-600/30 hover:text-white/95"}
                `
              }
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </nav>

        {/* Desktop profile/email/avatar and settings area */}
        <div className="hidden lg:flex items-center gap-4">
          <span className="text-white/80 text-sm font-semibold px-4">{profileUsername || user?.email}</span>
          <Button
            onClick={signOut}
            variant="outline"
            className="border-pink-400/25 bg-white/10 text-pink-200 hover:bg-pink-700/30 flex items-center gap-1 px-3 py-2"
            title="Logout"
          >
            <LogOut size={18} /> Logout
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-pink-400/25 bg-white/10 text-pink-200 hover:bg-pink-700/30 px-3"
                title="Menu"
              >
                <MenuIcon size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-4 bg-fuchsia-900/90 border-pink-400/25 text-white backdrop-blur-xl">
              <div className="px-2 py-2">
                <p className="text-sm font-medium">Signed in as</p>
                <p className="text-sm font-bold truncate">{profileUsername || user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-pink-400/25"/>
              {MENU.map((m) => (
                <DropdownMenuItem key={m.key} onClick={() => setSection(m.key)} className="focus:bg-pink-600/50 cursor-pointer flex items-center gap-2">
                   {React.cloneElement(m.icon, { className: 'mr-0' })}
                  <span>{m.label}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-pink-400/25"/>
              <DropdownMenuItem onClick={signOut} className="focus:bg-pink-600/50 cursor-pointer flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content */}
      <main className="flex items-start justify-center px-2 py-8 min-h-[80vh]">
        <div className="w-full max-w-7xl">
          {/* Glassy stats/overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="min-w-[200px] bg-white/10 rounded-2xl shadow-lg border border-pink-400/10 backdrop-blur-xl px-8 py-6 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-pink-200 mb-2">Total Candidates</div>
                <div className="text-3xl font-extrabold text-white">
                  {isLoadingTotalCandidates ? "..." : totalCandidates}
                </div>
              </div>
              <div className="bg-pink-500/30 rounded-full p-3">
                <Users className="text-white" size={28} />
              </div>
            </div>
            <div className="min-w-[200px] bg-white/10 rounded-2xl shadow-lg border border-pink-400/10 backdrop-blur-xl px-8 py-6 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-pink-200 mb-2">Total Employees</div>
                <div className="text-3xl font-extrabold text-white">
                  {isLoadingTotalEmployees ? "..." : totalEmployees}
                </div>
              </div>
              <div className="bg-pink-500/30 rounded-full p-3">
                <Briefcase className="text-white" size={28} />
              </div>
            </div>
            <div className="min-w-[200px] bg-white/10 rounded-2xl shadow-lg border border-pink-400/10 backdrop-blur-xl px-8 py-6 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-pink-200 mb-2">Total Departments</div>
                <div className="text-3xl font-extrabold text-white">
                  {isLoadingTotalDepartments ? "..." : totalDepartments}
                </div>
              </div>
              <div className="bg-pink-500/30 rounded-full p-3">
                <Building2 className="text-white" size={28} />
              </div>
            </div>
            <div className="min-w-[200px] bg-white/10 rounded-2xl shadow-lg border border-pink-400/10 backdrop-blur-xl px-8 py-6 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-pink-200 mb-2">Upcoming Interviews</div>
                <div className="text-3xl font-extrabold text-white">
                  {isLoadingTotalInterviews ? "..." : totalInterviews}
                </div>
              </div>
              <div className="bg-pink-500/30 rounded-full p-3">
                <Calendar className="text-white" size={28} />
              </div>
            </div>
          </div>

          {/* Candidate Login Section */}
          {/* Removed Candidate Login button and section as requested */}
          {/* Page sections */}
          <div className="rounded-2xl bg-white/10 border border-pink-200/10 shadow-2xl backdrop-blur-2xl p-0 sm:p-2 animate-fade-in">
            <div className="min-h-[60vh]">
              {section === "candidates" && <CandidatesPage />}
              {section === "employees" && <EmployeesPage onCountChange={setLiveEmployeeCount} />}
              {section === "departments" && <DepartmentsPage onCountChange={setLiveDepartmentCount} />}
              {section === "interviews" && <InterviewsPage onCountChange={setLiveInterviewCount} />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
