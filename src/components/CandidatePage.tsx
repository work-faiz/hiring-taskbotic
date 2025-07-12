import React from 'react';
import { useParams } from 'react-router-dom';
import { useCandidates } from '@/hooks/useCandidates';
import { useInterviews } from '@/hooks/useInterviews';
import GlassCard from './GlassCard';
import { Button } from './ui/button';

const CandidatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { candidates, isLoading: isLoadingCandidates } = useCandidates();
  const { data: interviews, isLoading: isLoadingInterviews } = useInterviews();

  if (isLoadingCandidates || isLoadingInterviews) {
    return <div className="p-6 text-white">Loading candidate details...</div>;
  }

  const candidate = candidates?.find((c: any) => c.id === id);
  const candidateInterviews = interviews?.filter((i: any) => i.candidate_id === id);

  if (!candidate) {
    return <div className="p-6 text-white">Candidate not found.</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-3xl font-extrabold text-pink-400 drop-shadow-lg mb-6">
        Candidate Details
      </h2>
      <GlassCard>
        <div className="mb-4">
          <div className="text-xl font-bold text-white mb-2">{candidate.full_name}</div>
          <div className="text-white/80 mb-1"><span className="font-semibold">Email:</span> {candidate.email}</div>
          <div className="text-white/80 mb-1"><span className="font-semibold">Phone:</span> {candidate.phone || 'N/A'}</div>
          <div className="text-white/80 mb-1"><span className="font-semibold">Status:</span> {candidate.status}</div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-pink-300 mb-2">Interviews</h3>
          {candidateInterviews && candidateInterviews.length > 0 ? (
            <ul className="space-y-2">
              {candidateInterviews.map((interview: any) => (
                <li key={interview.id} className="bg-pink-900/30 border border-pink-400/20 rounded-lg p-3 text-white">
                  <div><span className="font-semibold">Date:</span> {new Date(interview.interview_date).toLocaleString()}</div>
                  <div><span className="font-semibold">Type:</span> {interview.type}</div>
                  <div><span className="font-semibold">Status:</span> {interview.status}</div>
                  <div><span className="font-semibold">Location:</span> {interview.location || 'N/A'}</div>
                  <div><span className="font-semibold">Notes:</span> {interview.notes || 'N/A'}</div>
                  <div><span className="font-semibold">Feedback:</span> {interview.feedback || 'N/A'}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-white/70">No interviews scheduled for this candidate.</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default CandidatePage; 