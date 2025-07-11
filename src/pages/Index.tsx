import React, { useState, useEffect } from "react";
import CandidatesPage from "@/components/CandidatesPage";
import EmployeesPage from "@/components/EmployeesPage";
import DepartmentsPage from "@/components/DepartmentsPage";
import InterviewsPage from "@/components/InterviewsPage";
import { Users, Briefcase, LogOut, Building2, Calendar, Menu as MenuIcon, BarChart3, Settings } from "lucide-react";
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

// Menu for navigation bar
const MENU = [
  {
    key: "candidates",
    label: "Candidates",
    icon: <Users className="w-5 h-5" />,
  },
  {
    key: "employees",
    label: "Employees",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    key: "departments",
    label: "Departments",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    key: "interviews",
    label: "Interviews",
    icon: <Calendar className="w-5 h-5" />,
  },
];

const Index = () => {
  const [section, setSection] = useState("candidates");
  const { user, signOut } = useAuth();

  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const { data: totalCandidates, isLoading: isLoadingTotalCandidates } = useTotalCandidates();
  const { data: totalEmployees, isLoading: isLoadingTotalEmployees } = useTotalEmployees();
  const { data: totalDepartments, isLoading: isLoadingTotalDepartments } = useTotalDepartments();
  const { data: totalInterviews, isLoading: isLoadingTotalInterviews } = useTotalInterviews();

  const queryClient = useQueryClient();

  useEffect(() => {
    async function fetchUsername() {
      if (user?.id) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user.id)
          .maybeSingle();
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

  const getMetricIcon = (section: string) => {
    switch (section) {
      case "candidates":
        return <Users className="w-6 h-6 text-blue-600" />;
      case "employees":
        return <Briefcase className="w-6 h-6 text-emerald-600" />;
      case "departments":
        return <Building2 className="w-6 h-6 text-purple-600" />;
      case "interviews":
        return <Calendar className="w-6 h-6 text-amber-600" />;
      default:
        return <BarChart3 className="w-6 h-6 text-slate-600" />;
    }
  };

  const getMetricValue = (section: string) => {
    switch (section) {
      case "candidates":
        return isLoadingTotalCandidates ? "..." : totalCandidates;
      case "employees":
        return isLoadingTotalEmployees ? "..." : totalEmployees;
      case "departments":
        return isLoadingTotalDepartments ? "..." : totalDepartments;
      case "interviews":
        return isLoadingTotalInterviews ? "..." : totalInterviews;
      default:
        return 0;
    }
  };

  const getMetricLabel = (section: string) => {
    switch (section) {
      case "candidates":
        return "Total Candidates";
      case "employees":
        return "Total Employees";
      case "departments":
        return "Total Departments";
      case "interviews":
        return "Scheduled Interviews";
      default:
        return "Total";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Employee CRM
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    TaskBotic AI Solutions
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {MENU.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className={`nav-button ${
                    section === item.key ? "nav-button-active" : "nav-button-inactive"
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop User Info */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {profileUsername || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                </div>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              {/* Mobile Menu */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MenuIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {profileUsername || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {MENU.map((item) => (
                      <DropdownMenuItem
                        key={item.key}
                        onClick={() => setSection(item.key)}
                        className="cursor-pointer"
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {MENU.map((item) => (
            <div key={item.key} className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {getMetricLabel(item.key)}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {getMetricValue(item.key)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  {getMetricIcon(item.key)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Page Content */}
        <div className="glass-card rounded-xl p-6 animate-fade-in">
          {section === "candidates" && <CandidatesPage />}
          {section === "employees" && <EmployeesPage />}
          {section === "departments" && <DepartmentsPage />}
          {section === "interviews" && <InterviewsPage />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;