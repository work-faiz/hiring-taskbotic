import { supabase } from '@/integrations/supabase/client';

export async function seedTestData() {
  try {
    // Add candidate
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .insert({
        email: 'muhammadshadab099@gmail.com',
        full_name: 'Muhammad Shadab',
        phone: '9208628741',
        status: 'Applied',
        application_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (candidateError) {
      console.error('Error adding candidate:', candidateError);
      return;
    }

    console.log('Candidate added:', candidate);

    // Add interview for the candidate
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        candidate_id: candidate.id,
        interview_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        location: 'Virtual',
        type: 'Technical',
        status: 'Scheduled'
      })
      .select()
      .single();

    if (interviewError) {
      console.error('Error adding interview:', interviewError);
      return;
    }

    console.log('Interview added:', interview);
    console.log('Test data seeded successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Function to check if data exists
export async function checkDataExists() {
  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .select('*');

  const { data: interviews, error: interviewsError } = await supabase
    .from('interviews')
    .select('*');

  console.log('Candidates:', candidates);
  console.log('Interviews:', interviews);

  return { candidates, interviews };
} 